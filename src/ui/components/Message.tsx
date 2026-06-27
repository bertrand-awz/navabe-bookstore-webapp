export function Message({ children, tone = "error" }: { children?: React.ReactNode; tone?: "error" | "success" }) {
  const toneClass = tone === "success"
    ? "border-brand bg-brand/5 text-brand dark:border-[#93b7a0] dark:bg-[#93b7a0]/10 dark:text-[#93b7a0]"
    : "border-danger bg-danger/5 text-danger dark:border-[#d17d74] dark:bg-[#d17d74]/10 dark:text-[#e8a39c]";
  return children ? (
    <p
      className={`my-4 border px-4 py-3 text-sm leading-6 font-semibold ${toneClass}`}
      role={tone === "success" ? "status" : "alert"}
    >
      {children}
    </p>
  ) : null;
}
