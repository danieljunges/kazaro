"use client";

import { useCallback, useEffect, useState } from "react";
import Cropper, { Area } from "react-easy-crop";
import { getCroppedAvatarFile } from "@/components/settings/avatarCropUtils";

type Props = {
  imageSrc: string;
  onDismiss: () => void;
  onCropped: (file: File) => void | Promise<void>;
  busy?: boolean;
};

export function AvatarCropModal({ imageSrc, onDismiss, onCropped, busy }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pixels, setPixels] = useState<Area | null>(null);
  const [applying, setApplying] = useState(false);

  const onCropComplete = useCallback((_area: Area, cropped: Area) => {
    setPixels(cropped);
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onDismiss]);

  async function apply() {
    if (!pixels) return;
    setApplying(true);
    try {
      const file = await getCroppedAvatarFile(imageSrc, pixels);
      await onCropped(file);
    } finally {
      setApplying(false);
    }
  }

  const locked = busy || applying;

  return (
    <div
      className="kz-crop-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="kz-crop-heading"
      onClick={onDismiss}
    >
      <div className="kz-crop-modal" onClick={(e) => e.stopPropagation()}>
        <h2 id="kz-crop-heading" className="kz-crop-title">
          Recortar foto
        </h2>
        <p className="kz-crop-hint">Arraste e use o zoom para centralizar o rosto.</p>
        <div className="kz-crop-stage">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <label className="kz-crop-zoom">
          <span className="kz-crop-zoom-label">Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            disabled={locked}
          />
        </label>
        <div className="kz-crop-actions">
          <button type="button" className="btn-ghost kz-crop-btn" onClick={onDismiss} disabled={locked}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn-cta kz-crop-btn"
            onClick={() => void apply()}
            disabled={!pixels || locked}
          >
            {applying ? "Gerando…" : "Usar foto"}
          </button>
        </div>
      </div>
    </div>
  );
}
