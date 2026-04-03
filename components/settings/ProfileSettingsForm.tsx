"use client";

import { useCallback, useMemo, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { updateMyProfile } from "@/app/dashboard/configuracoes/actions";
import { AvatarCropModal } from "@/components/settings/AvatarCropModal";

type Props = {
  userId: string;
  initialFullName: string | null;
  initialPhone: string | null;
  initialAvatarUrl: string | null;
};

function isImageFile(file: File): boolean {
  return ["image/png", "image/jpeg", "image/webp"].includes(file.type);
}

export function ProfileSettingsForm({ userId, initialFullName, initialPhone, initialAvatarUrl }: Props) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialFullName ?? "");
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl ?? null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  const initials = useMemo(() => {
    const src = (fullName || "").trim();
    if (!src) return "?";
    const parts = src.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }, [fullName]);

  const closeCrop = useCallback(() => {
    setCropSrc((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  async function uploadAvatar(file: File): Promise<string> {
    const supabase = getSupabaseBrowserClient();
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `${userId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, {
      upsert: true,
      contentType: file.type,
    });
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    if (!data?.publicUrl) throw new Error("Não foi possível gerar URL do avatar.");
    return data.publicUrl;
  }

  async function handleCroppedFile(file: File) {
    closeCrop();
    setErr(null);
    setOk(null);
    setBusy(true);
    try {
      const url = await uploadAvatar(file);
      setAvatarUrl(url);
      setOk("Foto pronta. Salve para aplicar.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Não foi possível enviar a foto.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {cropSrc ? (
        <AvatarCropModal
          imageSrc={cropSrc}
          onDismiss={closeCrop}
          onCropped={handleCroppedFile}
          busy={busy}
        />
      ) : null}

      <form
        className="kz-prof-form"
        onSubmit={async (e: FormEvent) => {
          e.preventDefault();
          setErr(null);
          setOk(null);
          setBusy(true);
          try {
            const res = await updateMyProfile({ fullName, phone, avatarUrl });
            if (!res.ok) {
              setErr(res.message);
              return;
            }
            setOk("Salvo.");
            router.refresh();
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="kz-prof-head">
          <div className="kz-prof-ava">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" />
            ) : (
              <span aria-hidden>{initials}</span>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="kz-prof-title">Sua conta</div>
            <div className="kz-prof-sub">Foto, nome e telefone que aparecem no app.</div>
          </div>
        </div>

        <div className="kz-prof-row">
          <label className="auth-field">
            <span className="auth-label">Foto</span>
            <input
              className="auth-input"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              disabled={busy || !!cropSrc}
              onChange={(ev) => {
                const file = ev.target.files?.[0];
                if (!file) return;
                setErr(null);
                setOk(null);
                if (!isImageFile(file)) {
                  setErr("Use PNG, JPG ou WEBP.");
                  ev.target.value = "";
                  return;
                }
                if (file.size > 8_000_000) {
                  setErr("Arquivo grande demais (máx. 8MB antes do recorte).");
                  ev.target.value = "";
                  return;
                }
                setCropSrc((prev) => {
                  if (prev) URL.revokeObjectURL(prev);
                  return URL.createObjectURL(file);
                });
                ev.target.value = "";
              }}
            />
          </label>
        </div>

        <div className="kz-prof-row kz-prof-grid">
          <label className="auth-field">
            <span className="auth-label">Nome</span>
            <input
              className="auth-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Seu nome"
              maxLength={120}
              disabled={busy}
            />
          </label>

          <label className="auth-field">
            <span className="auth-label">Telefone</span>
            <input
              className="auth-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(xx) xxxxx-xxxx"
              maxLength={40}
              disabled={busy}
            />
          </label>
        </div>

        {err ? <p className="auth-error">{err}</p> : null}
        {ok ? <p className="auth-banner auth-banner--ok">{ok}</p> : null}

        <button type="submit" className="btn-cta auth-submit" disabled={busy}>
          {busy ? "Salvando…" : "Salvar alterações"}
        </button>
      </form>
    </>
  );
}
