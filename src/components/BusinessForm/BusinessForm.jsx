import { useState, useEffect } from "react";
import Modal from "../Modal/Modal";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import EmojiPicker from "emoji-picker-react";
import ImageCropper from "../ImageCropper/ImageCropper";
import { uploadImg, getOptimizedImageUrl } from "../../utils/cloudinary";
import styles from "./BusinessForm.module.scss";

const defaultPosition = [-34.9011, -56.1645];

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function BusinessForm({ onSubmit, categories, initialValues, addCategory }) {
  const [form, setForm] = useState({
    name: initialValues?.name || "",
    address: initialValues?.address || "",
    contact: initialValues?.contact || "",
    hasWhatsApp: initialValues?.hasWhatsApp || false,
    hours: initialValues?.hours || { open: "", close: "" },
    categories: initialValues?.categories || [], // ahora serán IDs
    photoOriginalUrl: initialValues?.photoOriginalUrl || null,
    photoCroppedUrl: initialValues?.photoCroppedUrl || null,
    location: initialValues?.location || null,
    description: initialValues?.description || "",
    days: initialValues?.days || [],
  });

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: "", icon: "" });
  const [editingCategory, setEditingCategory] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [markerPosition, setMarkerPosition] = useState(form.location || defaultPosition);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [error, setError] = useState("");

  const [previewOriginal, setPreviewOriginal] = useState(null);
  const [previewCropped, setPreviewCropped] = useState(null);
  const [fileOriginal, setFileOriginal] = useState(null);

  // Inicializar previews al editar
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Manejar selección de categorías por ID
  const handleCategories = (e) => {
    const options = Array.from(e.target.selectedOptions).map(o => o.value);
    setForm(prev => ({ ...prev, categories: options }));
  };

  const handleSaveLocation = () => {
    setForm(prev => ({ ...prev, location: markerPosition }));
    setMapModalOpen(false);
  };

  const handleCategorySave = async () => {
    if (!categoryForm.name) return;

    // Evitar duplicados por nombre
    if (categories.some(c => c.name.toLowerCase() === categoryForm.name.toLowerCase())) {
      setError(`La categoría "${categoryForm.name}" ya existe.`);
      return;
    }

    const savedCategory = await addCategory(categoryForm.name, categoryForm.icon);
    setForm(prev => ({
      ...prev,
      categories: [...prev.categories, savedCategory.id],
    }));
    setCategoryModalOpen(false);
    setShowPicker(false);
    setCategoryForm({ name: "", icon: "" });
    setEditingCategory(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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

    onSubmit({
      ...form,
      photoOriginalUrl,
      photoCroppedUrl,
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2 className={styles.title}>
          {initialValues ? "Editar negocio" : "Registrar negocio"}
        </h2>

        {/* Campos básicos */}
        <div className={styles.grid}>
          <label className={styles.field}>
            <span>Nombre</span>
            <input name="name" placeholder="Ej: Panadería La Esperanza" value={form.name} onChange={handleChange} />
          </label>

          <label className={styles.field}>
            <span>Dirección</span>
            <input name="address" placeholder="Ej: Av. Siempre Viva 742" value={form.address} onChange={handleChange} />
          </label>

          <label className={styles.field}>
            <span>Contacto</span>
            <input name="contact" placeholder="Teléfono o WhatsApp" value={form.contact} onChange={handleChange} />
          </label>
        </div>

        <label className={styles.fieldCheckbox}>
          <input type="checkbox" checked={form.hasWhatsApp} onChange={e => setForm(prev => ({ ...prev, hasWhatsApp: e.target.checked }))} />
          ¿Tiene WhatsApp?
        </label>

        {/* Horarios */}
        <div className={styles.grid}>
          <label className={styles.field}>
            <span>Horario de apertura</span>
            <input type="time" name="open" value={form.hours.open} onChange={e => setForm(prev => ({ ...prev, hours: { ...prev.hours, open: e.target.value }}))} />
          </label>

          <label className={styles.field}>
            <span>Horario de cierre</span>
            <input type="time" name="close" value={form.hours.close} onChange={e => setForm(prev => ({ ...prev, hours: { ...prev.hours, close: e.target.value }}))} />
          </label>
        </div>

        <label className={styles.field}>
          <span>Descripción</span>
          <textarea name="description" placeholder="Breve descripción del negocio" value={form.description} onChange={handleChange} />
        </label>

        {/* Días */}
        <div className={styles.section}>
          <span className={styles.sectionTitle}>Días de la semana</span>
          <div className={styles.days}>
            {["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"].map(day => (
              <label key={day} className={styles.dayItem}>
                <input type="checkbox" checked={form.days.includes(day)} onChange={e => {
                  setForm(prev => {
                    const newDays = e.target.checked ? [...prev.days, day] : prev.days.filter(d => d !== day);
                    return { ...prev, days: newDays };
                  });
                }} />
                {day}
              </label>
            ))}
          </div>
        </div>

        {/* Ubicación */}
        <div className={styles.section}>
          <button type="button" className={styles.addF} onClick={() => setMapModalOpen(true)}>Seleccionar ubicación en el mapa</button>
          {form.location && <p className={styles.location}>📍 Lat {form.location[0].toFixed(5)}, Lng {form.location[1].toFixed(5)}</p>}
        </div>

        {/* Categorías */}
        <div className={styles.section}>
          <label>Categorías</label>
          <select multiple value={form.categories} onChange={handleCategories}>
            {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
          <button type="button" className={styles.addF} onClick={() => setCategoryModalOpen(true)}>+ Nueva categoría</button>
        </div>

        {/* Imagen */}
        <div className={styles.fileUpload}>
          <input type="file" id="photoUpload" accept="image/*" onChange={handleFileChange} />
          <label htmlFor="photoUpload">📷 Subir imagen</label>
        </div>

        {(previewCropped || previewOriginal) && (
          <div className={styles.preview}>
            <img src={previewCropped || previewOriginal} alt="preview" />
            <button type="button" onClick={handleEditCrop}>Editar imagen</button>
          </div>
        )}

        <button className={styles.submit} type="submit">
          {initialValues ? "Guardar cambios" : "Crear negocio"}
        </button>
      </form>

      {/* Modal Categoría */}
      <Modal isOpen={categoryModalOpen} onClose={() => { setEditingCategory(null); setCategoryModalOpen(false); setCategoryForm({ name: "", icon: "" }); }} title={editingCategory ? "Editar categoría" : "Nueva categoría"}>
        <form className={styles.formC} onSubmit={e => { e.preventDefault(); handleCategorySave(); }}>
          <label className={styles.fieldC}>
            <span>Nombre</span>
            <input value={categoryForm.name} onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })} required />
          </label>

          <div className={styles.iconRowC}>
            <label className={styles.fieldC}>
              <span>Icono (emoji)</span>
              <input value={categoryForm.icon} placeholder="Ej: 🍞" onChange={e => setCategoryForm({ ...categoryForm, icon: e.target.value })} />
            </label>
            
            <button className={styles.emojiC} type="button" onClick={() => setShowPicker(!showPicker)}>
              {categoryForm.icon || "😀"}
            </button>
          </div>

          {showPicker && <div className={styles.pickerC}><EmojiPicker onEmojiClick={emojiData => setCategoryForm({ ...categoryForm, icon: emojiData.emoji })} /></div>}
            {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actionsC}>
            <button type="submit" className={styles.save}>{editingCategory ? "Guardar cambios" : "Agregar"}</button>
          </div>
        </form>
      </Modal>

      {/* Modal Mapa */}
      <Modal isOpen={mapModalOpen} onClose={() => setMapModalOpen(false)} title="Seleccionar ubicación">
        <MapContainer center={markerPosition} zoom={12} style={{ height: "400px", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
          <Marker position={markerPosition} draggable icon={markerIcon} eventHandlers={{ dragend: e => {
            const { lat, lng } = e.target.getLatLng();
            setMarkerPosition([lat, lng]);
          }}}/>
        </MapContainer>
        <button className={styles.addF} onClick={handleSaveLocation}>Guardar ubicación</button>
      </Modal>

      {/* Modal Crop */}
      {cropModalOpen && (
        <Modal isOpen={cropModalOpen} onClose={() => setCropModalOpen(false)} title="Recortar imagen">
          <ImageCropper image={imageSrc} onComplete={handleCropComplete} onCancel={() => setCropModalOpen(false)} aspect={16/9} />
        </Modal>
      )}
    </>
  );
}
