// context/BusinessContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { listBusinesses, createBusiness, updateBusiness, removeBusiness, searchByTextOnly, getBusinessesByCategories } from "../services/businessService";
import { listCategories, createCategory, removeCategory, editCategory } from "../services/categoryService";
import { listBanners, createBanner, updateBanner, removeBanner } from "../services/bannerService"; // 👈 nuevo
import { useLoader } from "./LoaderContext";
import { PAGE_SIZE } from "../services/businessService";
import { arraysEqual, filterBusinessesByText } from "../utils/keywords";

const BusinessContext = createContext(null);

export function BusinessProvider({ children }) {
  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]); 
  const [activeFilters, setActiveFilters] = useState({ q: "", category: [] });
  const { showLoader, hideLoader } = useLoader();
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingNew, setLoadingNew] = useState(false);
  const [ query, setQuery] = useState('')
   const [filteredBusiness, setFilteredBusiness] = useState([]);
 const [categoryCache, setCategoryCache] = useState({
    categories: [],
    data: [],
    lastDoc: null,
    hasMore: true
  })
  const [currentMode, setCurrentMode] = useState('normal')

    const loadUntilSufficient = async (targetSize, currentFiltered = [], currentData = [], currentLastDoc = null, currentHasMore = true) => {
    if (!currentHasMore || currentFiltered.length >= targetSize) {
      return {
        filteredData: currentFiltered.slice(0, targetSize),
        allData: currentData,
        lastDoc: currentLastDoc,
        hasMore: currentHasMore || currentFiltered.length > targetSize
      };
    }

    const { data, lastDoc: newLastDoc, hasMore: more } = await getBusinessesByCategories(
      activeFilters.category,
      currentLastDoc
    );

    const updatedData = [...currentData, ...data];
    const updatedFiltered = filterBusinessesByText(updatedData, query);

    if (updatedFiltered.length < targetSize && more) {
      return await loadUntilSufficient(targetSize, updatedFiltered, updatedData, newLastDoc, more);
    }

    return {
      filteredData: updatedFiltered.slice(0, targetSize),
      allData: updatedData,
      lastDoc: newLastDoc,
      hasMore: more || updatedFiltered.length > targetSize
    };
  };

  // Función para cargar negocios
   const performSearch = async() =>{
    const hasCategories = activeFilters.category.length > 0
    const hasQuery = query.trim().length>0
    showLoader()

    try{
      if(hasQuery && !hasCategories) {
        const { data, lastDoc: newLastDoc, hasMore: more } = await (searchByTextOnly(query))
        setBusinesses(data)
        setLastDoc(newLastDoc)
        setHasMore(more)
        setFilteredBusiness([])
         setCurrentMode('textOnly')
        return
      }

      if(hasCategories && !hasQuery){
        const categoriesChanged = !arraysEqual(categoryCache.categories, activeFilters.category)

        if(categoriesChanged){
          const { data, lastDoc: newLastDoc, hasMore: more } = await getBusinessesByCategories(
            activeFilters.category,
            null
          )

            setCategoryCache({
            categories: [...activeFilters.category],
            data,
            lastDoc: newLastDoc,
            hasMore: more
          });
      
          setHasMore(more)
          setLastDoc(newLastDoc)
          setBusinesses(data)
          setFilteredBusiness([])
          setCurrentMode('categories');
        }else{
          setBusinesses(categoryCache.data);
          setHasMore(categoryCache.hasMore);
          setLastDoc(categoryCache.lastDoc);
          setFilteredBusiness([]);
          setCurrentMode('categories');
        }
       return
      }
      
       if (hasCategories && hasQuery) {
        const categoriesChanged = !arraysEqual(categoryCache.categories, activeFilters.category);
        
        if (categoriesChanged) {
           const result = await loadUntilSufficient(
            PAGE_SIZE, 
            [], // Sin elementos filtrados previos porque cambió la categoría
            [], // Sin datos previos porque cambió la categoría
            null, // Sin lastDoc previo porque empezamos desde cero
            true // Asumimos que hay más datos disponibles
          );

          setCategoryCache({
            categories: [...activeFilters.category],
            data: result.allData,
            lastDoc: result.lastDoc,
            hasMore: result.hasMore
          });

          setHasMore(result.hasMore);
          setLastDoc(result.lastDoc);
          setBusinesses(result.allData);

          setFilteredBusiness(result.filteredData)
          setCurrentMode('categoriesWithText');
        }else{
          let filtered = filterBusinessesByText(categoryCache.data, query)
          if (filtered.length < PAGE_SIZE && categoryCache.hasMore) {
            const result = await loadUntilSufficient(
              PAGE_SIZE, 
              filtered, 
              categoryCache.data, 
              categoryCache.lastDoc, 
              categoryCache.hasMore
            );
            setCategoryCache({
              categories: [...activeFilters.category],
              data: result.allData,
              lastDoc: result.lastDoc,
              hasMore: result.hasMore
            });

            setBusinesses(result.allData);
            setFilteredBusiness(result.filteredData);
            setHasMore(result.hasMore);
            setLastDoc(result.lastDoc);
            setCurrentMode('categoriesWithText');
        }else {
          setFilteredBusiness(filtered.slice(0, PAGE_SIZE));
          setHasMore(categoryCache.hasMore || filtered.length > PAGE_SIZE);
          setCurrentMode('categoriesWithText')
        }

        return
      }
    }

      const { data, lastDoc: newLastDoc, hasMore: more } = await listBusinesses();
      setBusinesses(data);
      setLastDoc(newLastDoc);
      setHasMore(more);
      setFilteredBusiness([]);
      setCurrentMode('normal');
      
    } catch(err) {
      console.log(err)

    } finally {
      hideLoader();
    }
  }



  useEffect(() =>{
    const timer = setTimeout(performSearch, 300)
    return() => clearTimeout(timer)
  }, [query, activeFilters.category])

  const loadMore = async () => {
    if (!hasMore || loadingNew) return;

    setLoadingNew(true);
    showLoader()
    
    try {
      switch (currentMode) {
        case 'textOnly': {
          // Cargar más resultados de búsqueda por texto
          const { data, lastDoc: newLastDoc, hasMore: more } = await searchByTextOnly(query, lastDoc);
          setBusinesses(prev => [...prev, ...data]);
          setLastDoc(newLastDoc);
          setHasMore(more);
          break;
        }

        case 'categories': {
          // Cargar más por categorías
          const { data, lastDoc: newLastDoc, hasMore: more } = await getBusinessesByCategories(
            activeFilters.category,
            lastDoc
          );
          
          setBusinesses(prev => [...prev, ...data]);
          setLastDoc(newLastDoc);
          setHasMore(more);
          
          // También actualizar el caché
          setCategoryCache(prev => ({
            ...prev,
            data: [...prev.data, ...data],
            lastDoc: newLastDoc,
            hasMore: more
          }));
          break;
        }

        case 'categoriesWithText': {
          // Caso complejo: necesitamos más datos para filtrar
          if (categoryCache.hasMore) {
            // Cargar más datos al caché
            const { data, lastDoc: newLastDoc, hasMore: more } = await getBusinessesByCategories(
              activeFilters.category,
              categoryCache.lastDoc
            );
            
            const newCacheData = [...categoryCache.data, ...data];
            
            setCategoryCache(prev => ({
              ...prev,
              data: newCacheData,
              lastDoc: newLastDoc,
              hasMore: more
            }));

            // Filtrar todos los datos del caché actualizado
            const allFiltered = filterBusinessesByText(newCacheData, query);
            
            // Mostrar solo los siguientes PAGE_SIZE elementos filtrados
            const currentFilteredCount = filteredBusiness.length;
            const nextBatch = allFiltered.slice(currentFilteredCount, currentFilteredCount + PAGE_SIZE);
            
            if (nextBatch.length > 0) {
              setFilteredBusiness(prev => [...prev, ...nextBatch]);
              setHasMore(allFiltered.length > currentFilteredCount + nextBatch.length || more);
            } else {
              setHasMore(more);
            }
          } else {
            setHasMore(false);
          }
          break;
        }

        case 'normal':
        default: {
          // Carga normal sin filtros
          const { data, lastDoc: newLastDoc, hasMore: more } = await listBusinesses(lastDoc);
          setBusinesses(prev => [...prev, ...data]);
          setLastDoc(newLastDoc);
          setHasMore(more);
          break;
        }
      }

    } catch (error) {
      console.error('Error en loadMore:', error);
    } finally {
      setLoadingNew(false);
      hideLoader()
    }
  };

  // Función para actualizar categorías
  const refreshCategories = async () => {
    const cats = await listCategories();
    setCategories(cats);
  };

  // Función para actualizar banners 👇
  const refreshBanners = async () => {
    const data = await listBanners();
    setBanners(data);
  };

  // Carga inicial
  useEffect(() => {
    refreshCategories();
    refreshBanners(); // 👈 también traemos banners
  }, []);

  const value = useMemo(() => ({
    businesses : filteredBusiness.length > 0 ? filteredBusiness : businesses,
    setActiveFilters,
    categories,
    banners, // 👈 agregado
    filters: activeFilters,
    hasMore,
    loadingNew,
    query,
    setQuery,
    loadMore,

    // CRUD negocios
    addBusiness: async payload => {
      showLoader();
      const created = await createBusiness(payload);
      setBusinesses(prev => [created, ...prev]);
      hideLoader();
      return created;
    },
    editBusiness: async (id, patch) => {
      showLoader();
      await updateBusiness(id, patch);
      setBusinesses(prev => prev.map(b => (b.id === id ? { ...b, ...patch } : b)));
      hideLoader();
      return true;
    },
    deleteBusiness: async id => {
      showLoader();
      await removeBusiness(id);
      setBusinesses(prev => prev.filter(b => b.id !== id));
      hideLoader();
      return true;
    },

    // CRUD categorías
    addCategory: async (name, icon) => {
      showLoader();
      const cat = await createCategory(name, icon);
      await refreshCategories();
      hideLoader();
      return cat;
    },
    removeCategory: async id => {
      showLoader();
      await removeCategory(id);
      await refreshCategories();
      hideLoader();
      return true;
    },
    editCategory: async (id, patch) => {
      showLoader();
      await editCategory(id, patch);
      await refreshCategories();
      hideLoader();
      return true;
    },

    // CRUD banners 👇
    addBanner: async payload => {
      showLoader();
      const banner = await createBanner(payload);
      await refreshBanners();
      hideLoader();
      return banner;
    },
    editBanner: async (id, patch) => {
      showLoader();
      await updateBanner(id, patch);
      await refreshBanners();
      hideLoader();
      return true;
    },
    deleteBanner: async id => {
      showLoader();
      await removeBanner(id);
      await refreshBanners();
      hideLoader();
      return true;
    },
  }), [businesses, categories, banners, activeFilters, activeFilters, hasMore, loadingNew, query,  filteredBusiness, categoryCache, currentMode]);

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
}

export const useBusiness = () => useContext(BusinessContext);
