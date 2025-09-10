import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";
import { useState } from "react";
import L from "leaflet";
import styles from "./BusinessMap.module.scss"

const businessIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const featuredIcon = new L.DivIcon({
  html: `
    <div style="position: relative; width: 30px; height: 45px; display: flex; justify-content: center; align-items: flex-end;">
      <!-- Llamas -->
      <svg width="20" height="20" viewBox="0 0 24 24" style="position: absolute; top: -10px;">
        <path fill="orange" d="M12 2C10 7 14 10 12 16C10 22 12 22 12 22C12 22 14 22 12 16C10 10 14 7 12 2Z" />
      </svg>
      <!-- Marcador base -->
      <svg width="30" height="45" viewBox="0 0 25 41">
        <path fill="red" stroke="darkred" stroke-width="2" d="M12.5,0 C5.6,0 0,5.6 0,12.5 C0,22.5 12.5,41 12.5,41 C12.5,41 25,22.5 25,12.5 C25,5.6 19.4,0 12.5,0 Z" />
        <!-- Círculo blanco en el centro -->
        <circle cx="12.5" cy="12.5" r="5" fill="white" />
      </svg>
    </div>
  `,
  className: "", // elimina estilos default de leaflet
  iconSize: [30, 45],
  iconAnchor: [15, 45],
  popupAnchor: [0, -40],
});

export default function BusinessMap({ businesses }) {
  const defaultPosition = businesses[0]?.location || [-34.7302, -56.2191];
  const [openPopupId, setOpenPopupId] = useState(null);

  return (
    <div className= {styles.mapContainer}>
    <MapContainer center={defaultPosition} zoom={12} style={{ width: "100%", height: "100%", maxWidth: "800px", margin: "0 auto" }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

      {businesses.map((b) => {
        
        return (
          <Marker key={b.id} position={b.location} icon={b.isFeatured ? featuredIcon : businessIcon}>
  {b.isFeatured ? (
    <Popup className={styles.featuredPopup}>
      <strong>🌟 {b.name}</strong><br />
      <em>Negocio destacado</em><br />
      {b.category}<br />
      {b.address}<br />
    </Popup>
  ) : (
    <Popup className={styles.normalPopup}>
      <strong>{b.name}</strong><br />
      {b.category}<br />
      {b.address}
    </Popup>
  )}
</Marker>

        );
      })}
    </MapContainer>
      </div>
  );
}
