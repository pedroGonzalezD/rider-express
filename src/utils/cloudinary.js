import { Cloudinary } from "@cloudinary/url-gen";
import { scale } from "@cloudinary/url-gen/actions/resize";
import { quality, format } from "@cloudinary/url-gen/actions/delivery";
const cName = "drzk4itjj";
const uploadPreset = "riderExpress";

const cld = new Cloudinary({
  cloud: {
    cloudName: cName,
  },
});

export const uploadImg = async (img) => {
  const formData = new FormData();
  formData.append("file", img);
  formData.append("upload_preset", uploadPreset);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!res.ok) {
    throw new Error("Error al subir la imagen");
  }

  const data = await res.json();
  return data.public_id;
};

export const getOptimizedImageUrl = (url, width) => {
  return cld
    .image(url)
    .resize(scale().width(width))
    .delivery(quality("auto"))
    .delivery(format("auto"))
    .toURL();
};
