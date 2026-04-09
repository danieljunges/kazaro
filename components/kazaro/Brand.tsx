import Link from "next/link";

/** Wordmark só texto, sem símbolo. */
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
        <span className="foot-logo-name">Kazaro</span>
      </div>
    );
  }
  return (
    <Link href={href} className="nav-logo" aria-label="Kazaro, início">
      <span className="nav-logo-name">Kazaro</span>
    </Link>
  );
}
