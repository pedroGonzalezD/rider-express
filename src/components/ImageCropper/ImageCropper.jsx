// components/ImageCropper/ImageCropper.jsx
import { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import Slider from "@mui/material/Slider";
import styles from "./ImageCropper.module.scss";

/**
 * Dibuja la porción recortada en un canvas y devuelve un Blob.
 * Maneja CORS para imágenes remotas (Cloudinary) seteando crossOrigin.
 */
function getCroppedImage(imageSrc, croppedAreaPixels) {
  const canvas = document.createElement("canvas");
  const img = document.createElement("img");
  img.crossOrigin = "anonymous"; // IMPORTANTE para no “contaminar” el canvas
  img.referrerPolicy = "no-referrer"; // opcional, por si tu CDN lo requiere
  img.src = imageSrc;

  return new Promise((resolve, reject) => {
    img.onload = () => {
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;
      const ctx = canvas.getContext("2d");

      try {
        ctx.drawImage(
          img,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          canvas.width,
          canvas.height
        );

        canvas.toBlob((blob) => {
          if (!blob) {
            // Fallback por si toBlob falla en algún navegador antiguo
            const dataUrl = canvas.toDataURL("image/jpeg");
            const byteString = atob(dataUrl.split(",")[1]);
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
            }
            resolve(new Blob([ab], { type: "image/jpeg" }));
            return;
          }
          resolve(blob);
        }, "image/jpeg");
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = (e) => reject(e);
  });
}

export default function ImageCropper({ image, onComplete, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((_, croppedArea) => {
    setCroppedAreaPixels(croppedArea);
  }, []);

  useEffect(() => {
    // Si la imagen viene como File o Blob y te llega un object URL, todo bien.
    // Si viene como URL remota (Cloudinary), no hay que hacer nada especial aquí.
    // El ajuste de zoom inicial lo dejamos en 1 para evitar “saltos”.
    setZoom(1);
  }, [image]);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    try {
      const blob = await getCroppedImage(image, croppedAreaPixels);
      // Opcional: convertir a File para mantener nombre/extensión
      const file = new File([blob], "crop.jpg", { type: "image/jpeg" });
      onComplete(file);
    } catch (e) {
      console.error("Crop error:", e);
      // podrías mostrar un toast/error si tienes un sistema de notificaciones
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.cropperContainer}>
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={16 / 9}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          showGrid={false}
          objectFit="cover" // <-- valor válido
        />
      </div>

      <div className={styles.controls}>
        <label>Zoom</label>
        <Slider
          value={zoom}
          min={1}
          max={3}
          step={0.01}
          onChange={(_, value) => setZoom(value)}
        />
      </div>

      <div className={styles.actions}>
        <button onClick={handleSave} className={styles.saveButton}>
          Guardar recorte
        </button>
        <button onClick={onCancel} className={styles.cancelButton}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
