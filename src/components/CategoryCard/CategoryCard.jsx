import styles from './CategoryCard.module.scss';

export default function CategoryCard({ category, selected, onClick }) {
  return (
    <button
      type="button"
      className={`${styles.card} ${selected ? styles.selected : ''}`}
      onClick={() => onClick(category)}
    >
      <div className={styles.icon}>
        <p>{category.icon}</p>
      </div>
      <span className={styles.name}>{category.name}</span>
    </button>
  );
}