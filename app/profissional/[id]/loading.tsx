export default function ProfissionalLoading() {
  return (
    <div className="public-page kz-route-loading">
      <div className="navbar">
        <div className="skel" style={{ width: 120, height: 28, borderRadius: 8 }} />
        <div className="skel" style={{ width: "min(220px, 42vw)", height: 36, borderRadius: 8 }} />
      </div>
      <div className="pp-bg">
        <div className="pp-band">
          <div className="pp-band-fade" />
        </div>
        <div className="pp-main">
          <div className="skel-block">
            <div style={{ display: "flex", gap: 22, marginTop: -40, marginBottom: 30 }}>
              <div className="skel" style={{ width: 108, height: 108, borderRadius: 20, flexShrink: 0 }} />
              <div style={{ flex: 1, paddingTop: 12 }}>
                <div className="skel skel-line" style={{ width: "60%", height: 28, marginBottom: 12 }} />
                <div className="skel skel-line" style={{ width: "40%", height: 14 }} />
              </div>
            </div>
            <div className="skel" style={{ height: 72, borderRadius: 14, marginBottom: 26 }} />
            <div className="skel" style={{ height: 44, borderRadius: 8, marginBottom: 26, maxWidth: 400 }} />
            <div className="skel" style={{ height: 120, borderRadius: 14, marginBottom: 12 }} />
            <div className="skel" style={{ height: 120, borderRadius: 14 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
