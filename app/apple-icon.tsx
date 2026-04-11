import { ImageResponse } from "next/og";

/** Ícone para “Adicionar à tela inicial” / Apple. */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const BRAND_BG = "#0f766e";
const BRAND_FG = "#ffffff";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: BRAND_BG,
          color: BRAND_FG,
          borderRadius: 40,
          overflow: "hidden",
          fontSize: 112,
          fontWeight: 700,
          fontFamily: 'ui-sans-serif, system-ui, "Segoe UI", sans-serif',
        }}
      >
        K
      </div>
    ),
    { ...size },
  );
}
