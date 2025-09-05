import {useBusiness} from "../../context/BusinessContext"
import {useState, useEffect} from "react"
import Modal from "../../components/Modal/Modal";
import styles from "./AdminCategories.module.scss"
import EmojiPicker from "emoji-picker-react";
import { FaTrashAlt } from "react-icons/fa";

const AdminCategories = () => {
   const {
    refresh,
    editCategory,
    categories,
    removeCategory,
    addCategory
  } = useBusiness();
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteCategoryModalOpen, setDeleteCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: "", icon: "" });
  const [showPicker, setShowPicker] = useState(false);

   useEffect(() => {
    refresh();
  }, []);

    const handleCategoryEdit = (cat) => {
    setEditingCategory(cat);
    setCategoryForm({ name: cat.name, icon: cat.icon });
    setCategoryModalOpen(true);
  };

  const handleCategorySave = async () => {
    if (editingCategory) {
      await editCategory(editingCategory.id, categoryForm);
    } else {
      await addCategory(categoryForm.name, categoryForm.icon);
    }
    setEditingCategory(null);
    setCategoryForm({ name: "", icon: "" });
    setCategoryModalOpen(false);
  };

  const confirmDeleteCategory = (cat) => {
    setSelectedCategory(cat);
    setDeleteCategoryModalOpen(true);
  };

  const handleDeleteCategory = async () => {
    if (selectedCategory) {
      await removeCategory(selectedCategory.id);
      setDeleteCategoryModalOpen(false);
      setSelectedCategory(null);
    }
  };

  return (
    <>
    <div className={styles.cont}>
      <h2 className={styles.title}>Categorías</h2>
      <button className={styles.add} onClick={() => {
        setEditingCategory(null);
        setCategoryForm({ name: "", icon: "" });
        setCategoryModalOpen(true);
      }}>
        + Agregar categoría
      </button>
        </div>
      <ul className={styles.ul}>
        {categories.map((cat) => (
          <li key={cat.id} className={styles.li} onClick={() => handleCategoryEdit(cat)}>
            <span>{cat.icon} </span>
            <p>{cat.name}</p>
            <button onClick={(e) => {
              confirmDeleteCategory(cat)
              e.stopPropagation()
              }}><FaTrashAlt /></button>
          </li>
        ))}
      </ul>
      <Modal
        isOpen={categoryModalOpen}
        onClose={() => {
          setEditingCategory(null);
          setCategoryModalOpen(false);
          setCategoryForm({ name: "", icon: "" });
        }}
        title={editingCategory ? "Editar categoría" : "Nueva categoría"}
        >
        <form onSubmit={e => {
          e.preventDefault();
          handleCategorySave();
        }}>
          <label>
            Nombre
            <input
              className={styles.input}
              value={categoryForm.name}
              onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })}
              required
            />
          </label>
          <label className={styles.label}>
        Icono</label>
        <button
          className={styles.emoji}
          type="button"
          onClick={() => setShowPicker(!showPicker)}
        >
          {categoryForm.icon || "😀"}
        </button>
      

      {showPicker && (
        <div style={{ position: "absolute", zIndex: 10 }}>
          <EmojiPicker
            onEmojiClick={(emojiData) =>
              setCategoryForm({ ...categoryForm, icon: emojiData.emoji })
            }
          />
        </div>
      )}
          <div className={styles.actions}>
            <button type="submit" className={styles.add}>{editingCategory ? "Guardar" : "Agregar"}</button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={deleteCategoryModalOpen}
        onClose={() => setDeleteCategoryModalOpen(false)}
        title="Confirmar eliminación"
        >
        <p>¿Estás seguro que deseas eliminar la categoría "{selectedCategory?.name}"?</p>
          <button className={styles.deleteButton} onClick={handleDeleteCategory}>Eliminar</button>
      </Modal>
    </>
  )
}

export default AdminCategories