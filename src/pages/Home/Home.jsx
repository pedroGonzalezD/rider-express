import { useEffect, useRef, useState } from "react";
import styles from "./Home.module.scss";
import BusinessCard from "../../components/BusinessCard/BusinessCard";
import BusinessMap from "../../components/BusinessMap/BusinessMap.jsx";
import CategoryCard from "../../components/CategoryCard/CategoryCard.jsx";
import { useBusiness } from "../../context/BusinessContext.jsx";
import { useTranslation } from "react-i18next";
import { RiResetLeftFill } from "react-icons/ri";
import { Swiper, SwiperSlide } from "swiper/react";
import { Grid, Pagination, Navigation, Virtual, Autoplay } from "swiper/modules";
import {getOptimizedImageUrl} from "../../utils/cloudinary";
import AdBannerModal from "../../components/AdBannerModal/AdBannerModal";
import "swiper/css";
import "swiper/css/grid";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "./swiperOverrides.scss";

const PAGE_SIZE = 2;

export default function Home() {
  const {
    businesses,
    categories,
    filters,
    hasMore,
    banners,
    setActiveFilters,
    query,
    setQuery,
    loadMore,
    loadingNew
  } = useBusiness();
  const businessSectionRef = useRef(null);
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [adBanner, setAdBanner] = useState(null);
  const adShownRef = useRef(false);
  const { t } = useTranslation();

 const handleCategoryClick = (catId) => {
    setActiveFilters((prev) => {
      const selected = Array.isArray(prev.category) ? prev.category : [];
      const newCategories = selected.includes(catId)
        ? selected.filter((c) => c !== catId)
        : [...selected, catId];
      return { ...prev, category: newCategories };
    });
  };

  useEffect(() =>{
    setQuery('')
  }, [])

  useEffect(() => {
    if (adShownRef.current) return;
    if (banners.length > 0) {
      const adBanners = banners.filter((b) => b.isAdBanner);
      if (adBanners.length === 0) return;

      const timer = setTimeout(() => {
        const randomBanner =
          adBanners[Math.floor(Math.random() * adBanners.length)];
        setAdBanner(randomBanner);
        setAdModalOpen(true);
        adShownRef.current = true;
      },  2 * 60 * 1000); 

      return () => clearTimeout(timer);
    }
  }, [banners, adBanner]);

  const handlePromoClick = (promoName) => {
  setQuery(promoName);
  console.log(promoName)
  if (businessSectionRef.current) {
    const top = businessSectionRef.current.getBoundingClientRect().top + window.scrollY;

    const offset = 100;

    window.scrollTo({
      top: top - offset,
      behavior: "smooth"
    });
  }

  setAdModalOpen(false);
};
  return (
    <>
      <section className={styles.home}>

        <div className={styles.filters}>
          <input
            type="text"
            placeholder={t("common.search")}
            value={query}
            className={styles.search}
            onChange={(e) => {
            setQuery(e.target.value);
            }}
          />

          <div className={styles.cont}>
            <h2 className={styles.title}>{t("common.category")}</h2>
            <button
              type="button"
              className={styles.resetButton}
              onClick={() => setActiveFilters((prev) => ({ ...prev, category: [] }))}
            >
              <RiResetLeftFill />
              {t("common.clear")}
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
                {categories.map((cat) => (
                  <SwiperSlide key={cat.id} className={styles.swiperSlide}>
                    <CategoryCard
                      category={cat}
                      selected={
                        Array.isArray(filters.category) &&
                        filters.category.includes(cat.id)
                      }
                      onClick={() => handleCategoryClick(cat.id)}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <p>{t("common.noCategories")}</p>
            )}
          </div>
        </div>
        {banners.length > 0 && (
          <div className={styles.promotion}>
          <h3 className={styles.title}>Promociones</h3>
          <div className={styles.slideContainer}>
          <Swiper
          slidesPerView={1}
          spaceBetween={10}
          modules={[Pagination,Virtual, Autoplay]}
          loop={true}
          pagination={{
            clickable: true,
          }}
          autoplay={{
            delay: 2000,
            disableOnInteraction: false,
          }}
           breakpoints={{
            768: {
              slidesPerView: 2
            },
            1024: {
              slidesPerView: 3
            }
           }}
           className={styles.bannerSlider}
          >
            {banners.map(banner =>(
              <SwiperSlide key={banner.id}
              className={styles.swiperSlider}>
                <img src={getOptimizedImageUrl(banner.photoCroppedUrl, 800)} alt={`promo${banner.businessName}`} onClick={() => handlePromoClick(banner.businessName)} className={styles.banner}/>
              </SwiperSlide>
            ))}
          </Swiper>
          </div>
        </div>
        )}
      </section>

      <section className={styles.business} ref={businessSectionRef}>
        <div className={styles.businessCont}>

          <h3 className={styles.businessTitle}>Negocios</h3>
        <div className={styles.list}>
            { businesses &&businesses.map((b) => <BusinessCard key={b.id} business={b} />)}
          {businesses?.length === 0 && (
            <p>No hay negocios disponibles</p>
          )}
        </div>

        {hasMore && (
          <div style={{ textAlign: "center", margin: "1rem 0" }}>
            <button className={styles.loadMore} onClick={loadMore} disabled={loadingNew}>
              {t("common.loadMore")}
              
            </button>
          </div>
        )}
      </div>
      </section>

      <BusinessMap
        businesses={businesses?.filter(
          (b) => Array.isArray(b.location) && b.location.length === 2
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

      <AdBannerModal
        isOpen={adModalOpen}
        onClose={() => setAdModalOpen(false)}
        banner={adBanner}
        onClick={() => handlePromoClick(adBanner.businessName)}
      />
    </>
  );
}
