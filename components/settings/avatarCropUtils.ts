import type { Area } from "react-easy-crop";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Não foi possível carregar a imagem."));
    img.src = src;
  });
}

const AVATAR_MAX_PX = 512;

/** Gera JPEG quadrado (máx. 512px) a partir da área recortada. */
export async function getCroppedAvatarFile(imageSrc: string, pixelCrop: Area): Promise<File> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  const maxSide = Math.max(pixelCrop.width, pixelCrop.height);
  const scale = maxSide > AVATAR_MAX_PX ? AVATAR_MAX_PX / maxSide : 1;
  const w = Math.max(1, Math.round(pixelCrop.width * scale));
  const h = Math.max(1, Math.round(pixelCrop.height * scale));
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponível.");
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    w,
    h,
  );
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
  if (!blob) throw new Error("Falha ao gerar a imagem.");
  return new File([blob], "avatar.jpg", { type: "image/jpeg" });
}
