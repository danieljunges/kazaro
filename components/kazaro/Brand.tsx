import Link from "next/link";

export function LogoIcon({ stroke = "#fff" }: { stroke?: string }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

export function BrandLink({
  href = "/",
  footer = false,
}: {
  href?: string;
  footer?: boolean;
}) {
  if (footer) {
    return (
      <div className="foot-logo">
        <div className="foot-logo-icon">
          <LogoIcon />
        </div>
        <span className="foot-logo-name">Kazaro</span>
      </div>
    );
  }
  return (
    <Link href={href} className="nav-logo">
      <div className="nav-logo-icon">
        <LogoIcon />
      </div>
      <span className="nav-logo-name">Kazaro</span>
    </Link>
  );
}
