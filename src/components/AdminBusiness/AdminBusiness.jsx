import { useState } from "react";
import styles from "./AdminBusiness.module.scss";
import { useBusiness } from "../../context/BusinessContext";
import { IoMdAdd } from "react-icons/io";
import { useTranslation } from "react-i18next";
import BusinessForm from "../../components/BusinessForm/BusinessForm";
import Modal from "../../components/Modal/Modal";
import { FaTrashAlt } from "react-icons/fa";
import { getOptimizedImageUrl } from "../../utils/cloudinary";

const AdminBusiness = () => {
  const [openModal, setOpenModal] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  const {
    businesses,
    categories,
    addBusiness,
    editBusiness,
    deleteBusiness,
    addCategory,
  } = useBusiness();

  const { t } = useTranslation();

  const handleAdd = async (form) => {
    if (editingBusiness) {
      await editBusiness(editingBusiness.id, form);
    } else {
      await addBusiness(form);
    }
    setEditingBusiness(null);
    setOpenModal(false);
  };

  const handleDelete = async () => {
    if (selectedBusiness) {
      await deleteBusiness(selectedBusiness.id);
      setDeleteModalOpen(false);
      setSelectedBusiness(null);
    }
  };

  const confirmDelete = (business) => {
    setSelectedBusiness(business);
    setDeleteModalOpen(true);
  };

  return (
    <>
      <div className={styles.cont}>
        <h3 className={styles.title}>{t("common.businessManage")}</h3>
        <button
          className={styles.add}
          onClick={() => { setEditingBusiness(null); setOpenModal(true); }}
        >
          <IoMdAdd /> {t("common.addBusiness")}
        </button>
      </div>

      <ul className={styles.ul}>
        {businesses.map((b) => (
          <li
            className={styles.li}
            key={b.id}
            onClick={() => { setEditingBusiness(b); setOpenModal(true); }}
          >
            <div className={styles.imgCont}>
              {b.photoCroppedUrl ? (
                <img src={getOptimizedImageUrl(b.photoCroppedUrl, 500)} alt={b.name} />
              ) : b.photoOriginalUrl ? (
                <img src={getOptimizedImageUrl(b.photoOriginalUrl, 500)} alt={b.name} />
              ) : null}
            </div>
            <div className={styles.text}>
              <h3 className={styles.name}>{b.name}</h3>
              <p className={styles.p}>{b.address}</p>
              <p className={styles.p}>{b.contact}</p>
              <p className={styles.p}>
                <span>{t("common.schedule")}</span>: {b.hours?.open} - {b.hours?.close}
              </p>
             <p className={styles.p}>
              <span>{t("common.categories")}</span>:{" "}
              {b.categories
                ?.map(catId => categories.find(c => c.id === catId)?.name)
                .filter(Boolean)
                .join(", ")}
            </p>
            </div>
            <div className={styles.del} onClick={(e) => e.stopPropagation()}>
              <button
                className={styles.delete}
                onClick={(e) => {
                  confirmDelete(b);
                  e.stopPropagation();
                }}
              >
                <FaTrashAlt />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <Modal
        isOpen={openModal}
        onClose={() => { setEditingBusiness(null); setOpenModal(false); }}
        title={editingBusiness ? "Editar negocio" : "Nuevo negocio"}
      >
        <BusinessForm
          onSubmit={handleAdd}
          categories={categories}
          initialValues={editingBusiness}
          addCategory={addCategory}
        />
      </Modal>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirmar eliminación"
      >
        <p>¿Estás seguro que deseas eliminar el negocio "{selectedBusiness?.name}"?</p>
        <div className={styles.actions}>
          <button className={styles.deleteButton} onClick={handleDelete}>Eliminar</button>
        </div>
      </Modal>
    </>
  );
};

export default AdminBusiness;
