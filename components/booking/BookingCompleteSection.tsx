"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent, useCallback } from "react";
import { setBookingStatus } from "@/app/dashboard/actions";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

function isImageFile(file: File): boolean {
  return ["image/jpeg", "image/png", "image/webp"].includes(file.type);
}

type Props = {
  bookingId: string;
};

export function BookingCompleteSection({ bookingId }: Props) {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const clearFile = useCallback(() => {
    setFile(null);
    setPreview((p) => {
      if (p) URL.revokeObjectURL(p);
      return null;
    });
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!file) {
      setErr("Escolha uma foto do serviço concluído (JPG, PNG ou WEBP).");
      return;
    }
    setBusy(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { user },
        error: uErr,
      } = await supabase.auth.getUser();
      if (uErr || !user?.id) {
        setErr("Sessão expirada. Entre de novo.");
        return;
      }
      const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const path = `${user.id}/${bookingId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("booking-proofs").upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
      if (upErr) {
        setErr(upErr.message || "Não foi possível enviar a foto.");
        return;
      }
      const { data: pub } = supabase.storage.from("booking-proofs").getPublicUrl(path);
      const url = pub?.publicUrl?.trim();
      if (!url) {
        setErr("Não foi possível obter o link da foto.");
        return;
      }
      const res = await setBookingStatus(bookingId, "completed", { completionPhotoUrl: url });
      if (!res.ok) {
        setErr(res.message);
        return;
      }
      clearFile();
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="kz-booking-complete">
      <div className="kz-booking-complete__title">Concluir com comprovação</div>
      <p className="kz-booking-complete__hint">
        Envie <strong>uma foto</strong> do serviço pronto (antes e depois, resultado final, etc.). Isso ajuda o cliente e
        registra que o trabalho foi feito. Depois marcamos o pedido como <strong>Concluído</strong>.
      </p>
      <form className="kz-booking-complete__form" onSubmit={onSubmit}>
        <label className="kz-booking-complete__file">
          <span className="kz-booking-complete__file-label">Foto de comprovação</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={busy}
            onChange={(ev) => {
              setErr(null);
              const f = ev.target.files?.[0];
              if (!f) {
                clearFile();
                return;
              }
              if (!isImageFile(f)) {
                setErr("Use JPG, PNG ou WEBP.");
                ev.target.value = "";
                return;
              }
              if (f.size > 6_000_000) {
                setErr("Foto grande demais (máx. 6 MB).");
                ev.target.value = "";
                return;
              }
              clearFile();
              setFile(f);
              setPreview(URL.createObjectURL(f));
            }}
          />
        </label>
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Prévia da foto de conclusão" className="kz-booking-complete__preview" />
        ) : null}
        {err ? <p className="auth-error" style={{ marginTop: 10 }}>{err}</p> : null}
        <button type="submit" className="btn-cta auth-submit" disabled={busy || !file} style={{ marginTop: 14 }}>
          {busy ? "Enviando…" : "Marcar como concluído"}
        </button>
      </form>
    </div>
  );
}
