import { useState } from "react";
import Modal from "../Modal/Modal";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import EmojiPicker from "emoji-picker-react";
import styles from "./BusinessForm.module.scss";

const defaultPosition = [-34.9011, -56.1645]; // Montevideo, Uruguay

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
    hours: initialValues?.hours || { open: "", close: "" },
    categories: initialValues?.categories || [],
    photo: null,
    location: initialValues?.location || null,
  });

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: "", icon: "" });
  const [editingCategory, setEditingCategory] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [markerPosition, setMarkerPosition] = useState(form.location || defaultPosition);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategories = (e) => {
    const options = Array.from(e.target.selectedOptions).map((o) => o.value);
    setForm((prev) => ({ ...prev, categories: options }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  const handleCategorySave = async () => {
    if (!categoryForm.name) return;
    let savedCategory;
    if (editingCategory) {
      savedCategory = await addCategory(categoryForm.name, categoryForm.icon);
    } else {
      savedCategory = await addCategory(categoryForm.name, categoryForm.icon);
    }

    setForm((prev) => ({
      ...prev,
      categories: [...prev.categories, savedCategory.name],
    }));

    setCategoryModalOpen(false);
    setShowPicker(false);
    setCategoryForm({ name: "", icon: "" });
    setEditingCategory(null);
  };

  const handleSaveLocation = () => {
    setForm((prev) => ({ ...prev, location: markerPosition }));
    setMapModalOpen(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label>
          Nombre
          <input
            name="name"
            placeholder="Nombre"
            value={form.name}
            onChange={handleChange}
            className={styles.input}
          />
        </label>

        <label>
          Dirección
          <input
            name="address"
            placeholder="Dirección"
            value={form.address}
            onChange={handleChange}
            className={styles.input}
          />
        </label>

        <label>
          Número
          <input
            name="contact"
            placeholder="Contacto"
            value={form.contact}
            onChange={handleChange}
            className={styles.input}
          />
        </label>

        <div>
          <button className={styles.addF} type="button" onClick={() => setMapModalOpen(true)}>
            Seleccionar ubicación en el mapa
          </button>
          {form.location && (
            <p>
              Ubicación seleccionada: Lat {form.location[0].toFixed(5)}, Lng {form.location[1].toFixed(5)}
            </p>
          )}
        </div>

        <div>
          <label>Categorías</label>
          <select
            className={styles.select}
            multiple
            value={form.categories}
            onChange={handleCategories}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            className={styles.submit}
            type="button"
            onClick={() => setCategoryModalOpen(true)}
          >
            + Nueva categoría
          </button>
        </div>

        <div className={styles.fileUpload}>
          <input
            type="file"
            id="photoUpload"
            accept="image/*"
            onChange={(e) => setForm((prev) => ({ ...prev, photo: e.target.files[0] }))}
          />
          <label htmlFor="photoUpload">Subir imagen</label>
          {form.photo && <span>{form.photo.name}</span>}
        </div>

        <button className={styles.submit} type="submit">
          {initialValues ? "Guardar cambios" : "Crear"}
        </button>
      </form>

      <Modal
        isOpen={categoryModalOpen}
        onClose={() => {
          setEditingCategory(null);
          setCategoryModalOpen(false);
          setCategoryForm({ name: "", icon: "" });
          setShowPicker(false);
        }}
        title={editingCategory ? "Editar categoría" : "Nueva categoría"}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCategorySave();
          }}
        >
          <label>
            Nombre
            <input
              className={styles.input}
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              required
            />
          </label>

          <label className={styles.label}>Icono</label>
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
            <button type="submit" className={styles.add}>
              {editingCategory ? "Guardar" : "Agregar"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={mapModalOpen} onClose={() => setMapModalOpen(false)} title="Seleccionar ubicación">
        <MapContainer center={markerPosition} zoom={12} style={{ height: "400px", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker
            position={markerPosition}
            draggable={true}
            icon={markerIcon}
            eventHandlers={{
              dragend: (e) => {
                const { lat, lng } = e.target.getLatLng();
                setMarkerPosition([lat, lng]);
              },
            }}
          />
        </MapContainer>
        <button className={styles.addF}onClick={handleSaveLocation}>Guardar ubicación</button>
      </Modal>
    </>
  );
}
