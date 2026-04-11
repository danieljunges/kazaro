import { ImageResponse } from "next/og";

/** Favicon gerado (marca: teal + K). Evita depender de PNG manual. */
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

const BRAND_BG = "#0f766e";
const BRAND_FG = "#ffffff";

export default function Icon() {
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
          borderRadius: 8,
          overflow: "hidden",
          fontSize: 20,
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
