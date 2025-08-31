// pages/Home/Home.jsx
import { useState, useEffect } from "react";
import styles from "./Home.module.scss";
import BusinessCard from "../../components/BusinessCard/BusinessCard";
import BusinessMap from "../../components/BusinessMap/BusinessMap.jsx";
import CategoryCard from "../../components/CategoryCard/CategoryCard.jsx";
import { useBusiness } from "../../context/BusinessContext.jsx";
import { useTranslation } from "react-i18next";
import { useLoader } from "../../context/LoaderContext";

export default function Home() {
  const { businesses, categories, filters, setFilters } = useBusiness();
  const { t } = useTranslation();

  const [query, setQuery] = useState(filters.q || "");

  const [error, setError] = useState("");
  const {loading} = useLoader()

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, q: query }));
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);
  


  const handleCategoryClick = (catName) => {
    setFilters((prev) => {
      const selected = Array.isArray(prev.category) ? prev.category : [];
      const newCategories = selected.includes(catName)
        ? selected.filter((c) => c !== catName)
        : [...selected, catName];
      return { ...prev, category: newCategories };
    });
  };

 
  const filteredBusinesses = businesses.filter((b) => {
    const matchesQuery =
      !filters.q ||
      b.name.toLowerCase().includes(filters.q.toLowerCase()) ||
      b.address?.toLowerCase().includes(filters.q.toLowerCase());

    const matchesCategory =
      !filters.category || filters.category.length === 0
        ? true
        : Array.isArray(filters.category)
        ? filters.category.some((cat) => b.categories?.includes(cat))
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
            onChange={(e) => setQuery(e.target.value)}
            className={styles.search}
          />
          <h2 className={styles.title}>{t("common.category")}</h2>
          <div className={styles.categoriesGrid}>
            {categories.length > 0 ? (
              categories.map((cat) => (
                <CategoryCard
                  key={cat.id}
                  category={cat}
                  selected={
                    Array.isArray(filters.category)
                      ? filters.category.includes(cat.name)
                      : filters.category === cat.name
                  }
                  onClick={() => handleCategoryClick(cat.name)}
                />
              ))
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
            filteredBusinesses.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))
          ) : (
            <p>No se encontraron negocios.</p>
          )}
        </div>
      </section>

      <BusinessMap
        businesses={filteredBusinesses.filter(
          (b) => Array.isArray(b.location) && b.location.length === 2
        )}
      />
      <a
        href="https://wa.me/+59895084521"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.whatsappButton}
        >
          💬
        </a>
    </>
  );
}
