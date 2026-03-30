export default function SearchLoading() {
  return (
    <div className="public-page">
      <div className="navbar" style={{ height: 66 }}>
        <div className="skel" style={{ width: 120, height: 28, borderRadius: 8, marginLeft: 24 }} />
        <div className="skel" style={{ width: 180, height: 36, borderRadius: 8, marginRight: 24 }} />
      </div>
      <div className="sp-topbar">
        <div className="sp-search-row" style={{ maxWidth: 780, margin: "0 auto 16px" }}>
          <div className="skel" style={{ flex: 1, height: 46, borderRadius: 11 }} />
          <div className="skel" style={{ width: 200, height: 46, borderRadius: 11 }} />
        </div>
        <div className="skel" style={{ maxWidth: 780, margin: "0 auto", height: 36, borderRadius: 100 }} />
      </div>
      <div className="sp-body">
        <div className="sp-sidebar" style={{ width: 218 }}>
          <div className="skel skel-line skel-line--lg" style={{ marginBottom: 16 }} />
          {[1, 2, 3].map((i) => (
            <div key={i} className="skel skel-line" style={{ width: "100%" }} />
          ))}
        </div>
        <div className="sp-results" style={{ flex: 1 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skel-row">
              <div className="skel skel-avatar" />
              <div style={{ flex: 1 }}>
                <div className="skel skel-line skel-line--lg" />
                <div className="skel skel-line skel-line--sm" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
