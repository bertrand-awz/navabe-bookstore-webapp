import { Mail, Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const showFooter = !FOOTERLESS_PATHS.has(location.pathname);
  const desktopNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-[0.7rem] font-bold tracking-[0.12em] uppercase hover:text-brand dark:hover:text-[#9cbba7] ${
      isActive ? "text-brand dark:text-[#9cbba7]" : "text-ink dark:text-[#f2eee4]"
    }`;
  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block border-b border-line px-3 py-3 text-[0.78rem] font-bold tracking-[0.12em] uppercase last:border-b-0 dark:border-[#3f453f] ${
      isActive
        ? "bg-brand text-white dark:bg-[#82a991] dark:text-[#101510]"
        : "text-ink hover:bg-canvas hover:text-brand dark:text-[#f2eee4] dark:hover:bg-[#20251f] dark:hover:text-[#9cbba7]"
    }`;

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const renderNavigationItems = (variant: "desktop" | "mobile") => {
    const isMobile = variant === "mobile";
    const linkClass = isMobile ? mobileNavLinkClass : desktopNavLinkClass;
    const iconLinkClass = isMobile
      ? "flex items-center gap-3 border-b border-line px-3 py-3 text-[0.78rem] font-bold tracking-[0.12em] text-ink uppercase hover:bg-canvas hover:text-brand dark:border-[#3f453f] dark:text-[#f2eee4] dark:hover:bg-[#20251f] dark:hover:text-[#9cbba7]"
      : "text-ink hover:text-brand dark:text-[#f2eee4] dark:hover:text-[#9cbba7]";
    const iconButtonClass = isMobile
      ? "flex w-full cursor-pointer items-center gap-3 px-3 py-3 text-left text-[0.78rem] font-bold tracking-[0.12em] text-ink uppercase hover:bg-canvas hover:text-brand dark:text-[#f2eee4] dark:hover:bg-[#20251f] dark:hover:text-[#9cbba7]"
      : "cursor-pointer text-ink hover:text-brand dark:text-[#f2eee4] dark:hover:text-[#9cbba7]";
    const closeMobileMenu = () => {
      if (isMobile) setMobileMenuOpen(false);
    };

    return (
      <>
        <NavLink className={linkClass} to="/" onClick={closeMobileMenu}>Catalog</NavLink>
        <NavLink className={linkClass} to={user ? "/profile" : "/login"} onClick={closeMobileMenu}>
          {user ? user.first_name : "Login"}
        </NavLink>
        <NavLink className={linkClass} to="/checkout" onClick={closeMobileMenu}>
          Cart <span className="ml-1">({count})</span>
        </NavLink>
        <NavLink className={linkClass} to="/about" onClick={closeMobileMenu}>About</NavLink>
        <NavLink className={linkClass} to="/management" onClick={closeMobileMenu}>Management Portal</NavLink>
        <a
          className={iconLinkClass}
          href={MAILHOG_URL}
          target="_blank"
          rel="noreferrer"
          aria-label={isMobile ? undefined : "Open MailHog inbox"}
          title="MailHog inbox"
          onClick={closeMobileMenu}
        >
          <Mail aria-hidden="true" size={19} strokeWidth={1.6} />
          {isMobile && <span>MailHog</span>}
        </a>
        <button
          className={iconButtonClass}
          type="button"
          onClick={() => {
            toggleTheme();
            closeMobileMenu();
          }}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? <Sun aria-hidden="true" size={19} strokeWidth={1.6} /> : <Moon aria-hidden="true" size={19} strokeWidth={1.6} />}
          {isMobile && <span>Theme</span>}
        </button>
      </>
    );
  };

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
          <div className="flex items-center justify-end">
            <nav className="hidden flex-wrap items-center justify-end gap-5 md:flex" aria-label="Main navigation">
              {renderNavigationItems("desktop")}
            </nav>
            <button
              className="inline-flex h-10 w-10 cursor-pointer items-center justify-center border border-line text-ink hover:border-brand hover:text-brand focus:ring-2 focus:ring-brand/25 focus:outline-none md:hidden dark:border-[#3f453f] dark:text-[#f2eee4] dark:hover:border-[#82a991] dark:hover:text-[#9cbba7]"
              type="button"
              aria-controls="mobile-navigation"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Close main menu" : "Open main menu"}
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              {mobileMenuOpen ? <X aria-hidden="true" size={22} strokeWidth={1.8} /> : <Menu aria-hidden="true" size={22} strokeWidth={1.8} />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <nav
            id="mobile-navigation"
            className="border-t border-line px-[clamp(1rem,4vw,4rem)] py-3 md:hidden dark:border-[#3f453f]"
            aria-label="Mobile navigation"
          >
            <div className="border border-line bg-paper dark:border-[#3f453f] dark:bg-[#151915]">
              {renderNavigationItems("mobile")}
            </div>
          </nav>
        )}
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
