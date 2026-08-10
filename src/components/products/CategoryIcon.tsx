const LETTERS: Record<string, string> = {
  apple: "A",
  samsung: "S",
  xiaomi: "Mi",
  misc: "+"
};

export function CategoryIcon({ slug }: { slug: string }) {
  const letter = LETTERS[slug] || slug.slice(0, 1).toUpperCase();
  return (
    <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-white/5 text-lg font-bold tracking-wide text-white/80 backdrop-blur-md transition-colors duration-300 group-hover:border-mustard-400/40 group-hover:text-mustard-400">
      {letter}
    </span>
  );
}
