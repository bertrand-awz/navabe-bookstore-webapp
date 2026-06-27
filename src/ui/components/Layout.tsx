import { Mail, Moon, Sun } from "lucide-react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { CatalogSearchBar } from "./CatalogSearchBar";
import { useAuth } from "../context/AuthContext";
import { useCatalogSearch } from "../context/CatalogSearchContext";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";

const FOOTERLESS_PATHS = new Set(["/login", "/signup", "/recovery", "/management"]);
const MAILHOG_URL = "https://mailhog.navabe.bertawz.dev";

export function Layout() {
  const { user } = useAuth();
  const { count } = useCart();
  const { navigationSearchVisible } = useCatalogSearch();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const showFooter = !FOOTERLESS_PATHS.has(location.pathname);
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-[0.7rem] font-bold tracking-[0.12em] uppercase hover:text-brand dark:hover:text-[#9cbba7] ${
      isActive ? "text-brand dark:text-[#9cbba7]" : "text-ink dark:text-[#f2eee4]"
    }`;

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-line bg-paper dark:border-[#3f453f] dark:bg-[#151915]">
        <div className="grid grid-cols-[auto_minmax(220px,620px)_auto] items-center justify-between gap-8 px-[clamp(1rem,4vw,4rem)] py-4 max-[1000px]:grid-cols-[auto_1fr] max-[1000px]:gap-4">
          <Link className="shrink-0" to="/" aria-label="Navabe home">
            <img className="h-12 w-12 dark:brightness-[1.8] dark:saturate-50" src="/navabe-mark.svg" alt="" />
          </Link>
          <div className="w-full justify-self-center max-[1000px]:order-3 max-[1000px]:col-span-full">
            {navigationSearchVisible && (
              <CatalogSearchBar compact inputLabel="Search books from navigation" />
            )}
          </div>
          <nav className="flex flex-wrap items-center justify-end gap-5 max-[700px]:gap-3" aria-label="Main navigation">
            <NavLink className={navLinkClass} to="/">Catalog</NavLink>
            <NavLink className={navLinkClass} to={user ? "/profile" : "/login"}>
              {user ? user.first_name : "Login"}
            </NavLink>
            <NavLink className={navLinkClass} to="/checkout">
              Cart <span className="ml-1">({count})</span>
            </NavLink>
            <NavLink className={navLinkClass} to="/about">About</NavLink>
            <NavLink className={navLinkClass} to="/management">Management Portal</NavLink>
            <a
              className="text-ink hover:text-brand dark:text-[#f2eee4] dark:hover:text-[#9cbba7]"
              href={MAILHOG_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="Open MailHog inbox"
              title="MailHog inbox"
            >
              <Mail aria-hidden="true" size={19} strokeWidth={1.6} />
            </a>
            <button
              className="cursor-pointer text-ink hover:text-brand dark:text-[#f2eee4] dark:hover:text-[#9cbba7]"
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? <Sun aria-hidden="true" size={19} strokeWidth={1.6} /> : <Moon aria-hidden="true" size={19} strokeWidth={1.6} />}
            </button>
          </nav>
        </div>
      </header>
      <main className="min-h-[calc(100vh-130px)] bg-canvas px-[clamp(1rem,4vw,4rem)] pt-8 pb-24 dark:bg-[#000000]">
        <Outlet />
      </main>
      {showFooter && (
        <footer className="border-t border-[#2a251f] bg-[#2f2a24] px-[clamp(1rem,5vw,5rem)] py-10 text-right text-sm text-[#f8f5ee] dark:border-[#2a251f] dark:bg-[#2f2a24]">
          <p>&copy; {new Date().getFullYear()} Navabe Bookstore</p>
        </footer>
      )}
    </>
  );
}
