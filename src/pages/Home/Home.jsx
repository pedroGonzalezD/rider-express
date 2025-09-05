import { useState, useEffect } from "react";
import styles from "./Home.module.scss";
import BusinessCard from "../../components/BusinessCard/BusinessCard";
import BusinessMap from "../../components/BusinessMap/BusinessMap.jsx";
import CategoryCard from "../../components/CategoryCard/CategoryCard.jsx";
import { useBusiness } from "../../context/BusinessContext.jsx";
import { useTranslation } from "react-i18next";
import { useLoader } from "../../context/LoaderContext";
import { RiResetLeftFill } from "react-icons/ri";
import { Swiper, SwiperSlide } from "swiper/react";
import { Grid, Pagination, Navigation, Virtual } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/grid';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import './swiperOverrides.scss';

export default function Home() {
  const { businesses, categories, filters, setFilters } = useBusiness();
  const { t } = useTranslation();

  const [query, setQuery] = useState(filters.q || "");
  const [error, setError] = useState("");
  const { loading } = useLoader();

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, q: query }));
    }, 300);
    return () => clearTimeout(timer);
  }, [query, setFilters]);

const handleCategoryClick = (catId) => {
  setFilters(prev => {
    const selected = Array.isArray(prev.category) ? prev.category : [];
    const newCategories = selected.includes(catId)
      ? selected.filter(c => c !== catId)
      : [...selected, catId];
    return { ...prev, category: newCategories };
  });
};


  const filteredBusinesses = businesses.filter(b => {
    const q = (filters.q || "").toLowerCase();
    const matchesQuery =
      !q ||
      b.name?.toLowerCase().includes(q) ||
      b.address?.toLowerCase().includes(q);

    const matchesCategory =
  !filters.category || (Array.isArray(filters.category) && filters.category.length === 0)
    ? true
    : Array.isArray(filters.category)
      ? filters.category.some(cat => b.categories?.includes(cat))
      : b.categories?.includes(filters.category);

    return matchesQuery && matchesCategory;
  });

  return (
    <>
      <section className={styles.home}>
        <div className={styles.filters}>
          <input
            type="text"
            placeholder={t("common.search")}
            value={query}
            onChange={e => setQuery(e.target.value)}
            className={styles.search}
          />
          <div className={styles.cont}>
            <h2 className={styles.title}>{t("common.category")}</h2>
            <button
              type="button"
              className={styles.resetButton}
              onClick={() => setFilters(prev => ({ ...prev, category: [] }))}
            >
              <RiResetLeftFill />
              Limpiar
            </button>
          </div>
          <div className={styles.slideContainer}>
            {categories?.length > 0 ? (
              <Swiper
                spaceBetween={10}
                modules={[Grid, Pagination, Navigation, Virtual]}
                pagination={{ clickable: true }}
                navigation
                grid={{ rows: 2, fill: "row" }}
                slidesPerView="auto"
                className={styles.categoriesSlider}
                loop={false}
              >
                {categories.map(cat => (
                  <SwiperSlide key={cat.id} className={styles.swiperSlide}>
                    <CategoryCard
                      category={cat}
                      selected={
                      Array.isArray(filters.category)
                        ? filters.category.includes(cat.id)
                        : filters.category === cat.id
                      }
                      onClick={() => handleCategoryClick(cat.id)}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <p>No hay categorías disponibles.</p>
            )}
          </div>
        </div>
      </section>

      <section className={styles.business}>
        <div className={styles.list}>
          {loading ? (
            <p>Cargando negocios...</p>
          ) : error ? (
            <p className={styles.error}>{error}</p>
          ) : filteredBusinesses.length > 0 ? (
            filteredBusinesses.map(b => (
              <BusinessCard key={b.id} business={b} />
            ))
          ) : (
            <p>No se encontraron negocios.</p>
          )}
        </div>
      </section>

      <BusinessMap
        businesses={filteredBusinesses.filter(
          b => Array.isArray(b.location) && b.location.length === 2
        )}
      />

      <a
        href="https://wa.me/+59895032424"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.whatsappButton}
      >
        💬
      </a>
    </>
  );
}
