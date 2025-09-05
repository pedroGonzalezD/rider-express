import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { listBusinesses, createBusiness, updateBusiness, removeBusiness } from '../services/businessService';
import { listCategories, createCategory, removeCategory, editCategory } from '../services/categoryService';
import { useLoader } from './LoaderContext';

const BusinessContext = createContext(null);

export function BusinessProvider({ children }) {
  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);
  // Importante: category como array para el Home
  const [filters, setFilters] = useState({ q: '', category: [] });
  const { showLoader, hideLoader } = useLoader();

  const refresh = async () => {
    showLoader();
    const data = await listBusinesses();
    const cats = await listCategories();
    setBusinesses(data);
    setCategories(cats);
    hideLoader();
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.q, filters.category]);

  const value = useMemo(() => ({
    businesses,
    categories,
    filters,
    setFilters,
    refresh,
    addBusiness: async (payload) => {
      showLoader();
      const created = await createBusiness(payload);
      await refresh();
      hideLoader();
      return created;
    },
    editBusiness: async (id, patch) => {
      showLoader();
      const updated = await updateBusiness(id, patch);
      await refresh();
      hideLoader();
      return updated;
    },
    deleteBusiness: async (id) => {
      showLoader();
      await removeBusiness(id);
      await refresh();
      hideLoader();
      return true;
    },
    addCategory: async (name, icon) => {
      showLoader();
      const cat = await createCategory(name, icon);
      await refresh();
      hideLoader();
      return cat;
    },
    removeCategory: async (id) => {
      showLoader();
      await removeCategory(id);
      await refresh();
      hideLoader();
      return true;
    },
    editCategory: async (id, patch) => {
      showLoader();
      await editCategory(id, patch);
      await refresh();
      hideLoader();
      return true;
    },
  }), [businesses, categories, filters]);

  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>;
}

export const useBusiness = () => useContext(BusinessContext);
