// AdminBanners.jsx
import { useState, useEffect } from "react";
import { useBusiness } from "../../context/BusinessContext";
import Modal from "../../components/Modal/Modal";
import { FaTrashAlt } from "react-icons/fa";
import styles from "./AdminBanners.module.scss";
import ImageCropper from "../ImageCropper/ImageCropper";
import { uploadImg, getOptimizedImageUrl } from "../../utils/cloudinary";
import { searchByTextOnly } from "../../services/businessService";

const AdminBanners = () => {
  const { banners, addBanner, editBanner, deleteBanner } = useBusiness();

  const defaultForm = {
    businessName: "",
    businessSlug: "",
    expiresAt: "",
    isAdBanner: false,
    photoOriginalUrl: null,
    photoCroppedUrl: null,
    description: "",
  };

  const [openModal, setOpenModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [form, setForm] = useState(defaultForm);

  // Imagen y crop
  const [previewOriginal, setPreviewOriginal] = useState(null);
  const [previewCropped, setPreviewCropped] = useState(null);
  const [fileOriginal, setFileOriginal] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);

  // Buscador de negocios
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // Normalizar datos cuando edito
  const normalizeForm = (banner) => ({
    businessName: banner.businessName || "",
    businessSlug: banner.businessSlug || "",
    expiresAt: banner.expiresAt ? "" : "", 
    isAdBanner: banner.isAdBanner || false,
    photoOriginalUrl: banner.photoOriginalUrl || null,
    photoCroppedUrl: banner.photoCroppedUrl || null,
    description: banner.description || "",
  });
///////
//////
///////////////////////////////////////////////////////
  useEffect(() => {
    if (form.photoOriginalUrl) {
      const url = getOptimizedImageUrl(form.photoOriginalUrl, 600);
      setPreviewOriginal(url);
      setImageSrc(url);
    }
    if (form.photoCroppedUrl) {
      setPreviewCropped(getOptimizedImageUrl(form.photoCroppedUrl, 600));
    }
  }, [form.photoOriginalUrl, form.photoCroppedUrl]);
  useEffect(() => {
    if (!searchTerm) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      const results = await searchByTextOnly(searchTerm);
      setSearchResults(results.data);
      console.log(searchResults)
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setPreviewOriginal(previewUrl);
    setFileOriginal(file);
    setImageSrc(previewUrl);
    setCropModalOpen(true);
  };

  const handleCropComplete = (croppedBlob) => {
    const previewUrl = URL.createObjectURL(croppedBlob);
    setPreviewCropped(previewUrl);
    setImageSrc(previewOriginal);
    setCropModalOpen(false);
  };

  const handleEditCrop = () => {
    if (previewOriginal) {
      setImageSrc(previewOriginal);
      setCropModalOpen(true);
    }
  };

  const handleSave = async () => {
    let photoOriginalUrl = form.photoOriginalUrl;
    let photoCroppedUrl = form.photoCroppedUrl;

    if (fileOriginal) {
      photoOriginalUrl = await uploadImg(fileOriginal);
    }

    if (previewCropped) {
      const response = await fetch(previewCropped);
      const blob = await response.blob();
      const croppedFile = new File([blob], "cropped.jpg", { type: blob.type });
      photoCroppedUrl = await uploadImg(croppedFile);
    }

    // calcular expiración (desde ahora + duración seleccionada)
    let expiresAt = null;
    if (form.expiresAt) {
      const now = Date.now();
      const hours = parseInt(form.expiresAt, 10);
      expiresAt = new Date(now + hours * 60 * 60 * 1000).toISOString();
    }

    const payload = {
      ...form,
      photoOriginalUrl,
      photoCroppedUrl,
      expiresAt,
       description: form.description,
    };

    if (editingBanner) {
      await editBanner(editingBanner.id, payload);
    } else {
      await addBanner(payload);
    }

    setEditingBanner(null);
    setForm(defaultForm);
    setPreviewOriginal(null);
    setPreviewCropped(null);
    setFileOriginal(null);
    setOpenModal(false);
  };

  return (
    <div>
      <div className={styles.header}>
        <h3>Banners</h3>
        <button
          onClick={() => {
            setEditingBanner(null);
            setForm(defaultForm);
            setOpenModal(true);
          }}
        >
          + Agregar banner
        </button>
      </div>

      <ul className={styles.ul}>
        {banners.map((b) => (
          <li
            key={b.id}
            className={styles.li}
            onClick={() => {
              setEditingBanner(b);
              setForm(normalizeForm(b));
              setOpenModal(true);
            }}
          >
            <div className={styles.imgCont}>
            <img
              src={getOptimizedImageUrl(b.photoCroppedUrl, 500)}
              alt={b.businessName}
              className={styles.thumb}
              />
            </div>
            <div className={styles.text}>
              <p>{b.businessName}</p>
              <small>
                Expira: {b.expiresAt ? new Date(b.expiresAt).toLocaleString() : "Nunca"}
              </small>
              {b.isAdBanner && <span className={styles.badge}>Anuncio</span>}
            </div>
            <button
            className={styles.delete}
              onClick={(e) => {
                e.stopPropagation();
                deleteBanner(b.id);
              }}
            >
              <FaTrashAlt />
            </button>
          </li>
        ))}
      </ul>

      {/* Modal formulario */}
      <Modal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        title={editingBanner ? "Editar banner" : "Nuevo banner"}
      >
        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          {/* Buscador de negocio */}
          <label>
            Negocio
            <input
              value={form.businessName}
              onChange={(e) => {
                setForm({ ...form, businessName: e.target.value });
                setSearchTerm(e.target.value);
              }}
              placeholder="Buscar negocio..."
            />
          </label>
          {searchResults.length > 0 && (
            <ul className={styles.searchList}>
              {searchResults.map((biz) => (
                <li
                  key={biz.id}
                  onClick={() => {
                    setForm({
                      ...form,
                      businessName: biz.name,
                      businessSlug: biz.name.replace(/\s+/g, "").toLowerCase(),
                    });
                    setSearchTerm("");
                    setSearchResults([]);
                  }}
                >
                  {biz.name}
                </li>
              ))}
            </ul>
          )}
          <label>
            Descripción
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Descripción del banner..."
              rows={3}
            />
          </label>

          <label>
            Duración
            <select
              value={form.expiresAt || ""}
              onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
            >
              <option value="">Nunca expira</option>
              <option value="12">12 horas</option>
              <option value="24">1 día</option>
              <option value="72">3 días</option>
              <option value="168">7 días</option>
            </select>
          </label>

          {/* Checkbox anuncio */}
          <label className={styles.check}>
            <input
              type="checkbox"
              checked={form.isAdBanner || false}
              onChange={(e) =>
                setForm({ ...form, isAdBanner: e.target.checked })
              }
            />
            Usar como banner de anuncio
          </label>

          {/* Imagen */}
          <div className={styles.fileUpload}>
            <input
              type="file"
              id="bannerUpload"
              accept="image/*"
              onChange={handleFileChange}
            />
            <label htmlFor="bannerUpload">📷 Subir imagen</label>
          </div>

          {(previewCropped || previewOriginal) && (
            <div className={styles.preview}>
              <img src={previewCropped || previewOriginal} alt="preview" />
              <button type="button" onClick={handleEditCrop}>
                Editar imagen
              </button>
            </div>
          )}

          <button type="submit">
            {editingBanner ? "Guardar cambios" : "Agregar"}
          </button>
        </form>
      </Modal>

      {/* Modal Crop */}
      {cropModalOpen && (
        <Modal
          isOpen={cropModalOpen}
          onClose={() => setCropModalOpen(false)}
          title="Recortar imagen"
        >
          <ImageCropper
            image={imageSrc}
            onComplete={handleCropComplete}
            onCancel={() => setCropModalOpen(false)}
            aspect={16 / 9}
          />
        </Modal>
      )}
    </div>
  );
};

export default AdminBanners;
