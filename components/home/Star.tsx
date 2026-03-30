export function Star({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export function StarsRow({ count = 5, size = 12 }: { count?: number; size?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={size} />
      ))}
    </>
  );
}
