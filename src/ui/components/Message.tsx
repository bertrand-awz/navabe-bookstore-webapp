export function Message({ children, tone = "error" }: { children?: React.ReactNode; tone?: "error" | "success" }) {
  const toneClass = tone === "success"
    ? "border-brand text-brand dark:border-[#93b7a0] dark:text-[#93b7a0]"
    : "border-danger text-danger dark:border-[#d17d74] dark:text-[#e8a39c]";
  return children ? <p className={`my-4 border-y py-3 text-sm font-semibold ${toneClass}`}>{children}</p> : null;
}
