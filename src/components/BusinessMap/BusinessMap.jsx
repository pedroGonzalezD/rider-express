import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";
import { useState } from "react";
import L from "leaflet";
import styles from "./BusinessMap.module.scss"

const businessIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
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
        const isTooltipVisible = openPopupId !== b.id; 
        
        return (
          <Marker key={b.id} position={b.location} icon={businessIcon}>
            {isTooltipVisible && (
              <Tooltip permanent direction="top" offset={[0, -40]}>
                {b.name}
              </Tooltip>
            )}
            <Popup
              eventHandlers={{
                add: () => setOpenPopupId(b.id),    
                remove: () => setOpenPopupId(null),  
              }}
              >
              <strong>{b.name}</strong><br />
              {b.category}<br />
              {b.address}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
      </div>
  );
}
