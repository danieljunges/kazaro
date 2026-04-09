"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { deletePortfolioPhoto, registerPortfolioPhoto } from "@/app/dashboard/configuracoes/portfolio-actions";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Row = { id: string; image_url: string };

export function ProPortfolioSection({ initialPhotos }: { initialPhotos: Row[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<Row[]>(initialPhotos);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) {
      setErr("Escolha um arquivo de imagem (JPG, PNG ou WebP).");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setErr("Imagem muito grande (máx. 4 MB).");
      return;
    }

    setErr(null);
    setBusy(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.id) {
        setErr("Sessão expirada. Entre de novo.");
        return;
      }

      const safe = file.name.replace(/[^\w.-]+/g, "_").slice(0, 80) || "foto.jpg";
      const path = `${user.id}/${crypto.randomUUID()}-${safe}`;
      const { error: upErr } = await supabase.storage.from("portfolio").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });
      if (upErr) {
        setErr(upErr.message || "Falha no upload.");
        return;
      }

      const { data: pub } = supabase.storage.from("portfolio").getPublicUrl(path);
      const url = pub?.publicUrl;
      if (!url) {
        setErr("Não foi possível obter o link público da foto.");
        return;
      }

      const res = await registerPortfolioPhoto(url);
      if (!res.ok) {
        setErr(res.message);
        return;
      }

      const { data: fresh } = await supabase
        .from("pro_portfolio_photos")
        .select("id, image_url")
        .eq("professional_id", user.id)
        .order("sort_order", { ascending: true });

      setPhotos((fresh as Row[] | null) ?? []);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function onRemove(id: string) {
    setErr(null);
    setBusy(true);
    try {
      const res = await deletePortfolioPhoto(id);
      if (!res.ok) {
        setErr(res.message);
        return;
      }
      setPhotos((p) => p.filter((x) => x.id !== id));
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="kz-prof-form"
      style={{ marginTop: 28, paddingTop: 28, borderTop: "1px solid var(--border)" }}
    >
      <div className="kz-prof-title">Portfólio do trabalho</div>
      <p className="kz-prof-sub" style={{ marginBottom: 14 }}>
        Fotos aparecem no seu perfil público para clientes verem seu estilo. Até 16 imagens.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: "none" }}
        aria-hidden
        tabIndex={-1}
        onChange={onPick}
      />

      <button
        type="button"
        className="btn-ghost auth-submit"
        style={{ marginBottom: 16, alignSelf: "flex-start" }}
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        {busy ? "Enviando…" : "Adicionar foto"}
      </button>

      {err ? <p className="auth-error">{err}</p> : null}

      {photos.length === 0 ? (
        <p className="kz-prof-sub" style={{ margin: 0 }}>
          Nenhuma foto ainda. Envie a primeira pelo botão acima.
        </p>
      ) : (
        <ul className="kz-portfolio-manage-grid">
          {photos.map((p) => (
            <li key={p.id} className="kz-portfolio-manage-item">
              <img src={p.image_url} alt="" className="kz-portfolio-manage-img" />
              <button
                type="button"
                className="kz-portfolio-manage-remove"
                disabled={busy}
                onClick={() => onRemove(p.id)}
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
