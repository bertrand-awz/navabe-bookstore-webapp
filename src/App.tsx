import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./ui/components/Layout";
import { AuthProvider } from "./ui/context/AuthContext";
import { CatalogSearchProvider } from "./ui/context/CatalogSearchContext";
import { CartProvider } from "./ui/context/CartContext";
import { ThemeProvider } from "./ui/context/ThemeContext";
import { AboutPage } from "./ui/pages/AboutPage";
import { AdminPage } from "./ui/pages/AdminPage";
import { LoginPage, RecoveryPage, SignupPage } from "./ui/pages/AuthPages";
import { CatalogPage } from "./ui/pages/CatalogPage";
import { CheckoutPage } from "./ui/pages/CheckoutPage";
import { ProfilePage } from "./ui/pages/ProfilePage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ThemeProvider>
            <CatalogSearchProvider>
              <Routes>
                <Route element={<Layout />}>
                  <Route index element={<CatalogPage />} />
                  <Route path="login" element={<LoginPage />} />
                  <Route path="signup" element={<SignupPage />} />
                  <Route path="recovery" element={<RecoveryPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="checkout" element={<CheckoutPage />} />
                  <Route path="about" element={<AboutPage />} />
                  <Route path="management" element={<AdminPage />} />
                </Route>
              </Routes>
            </CatalogSearchProvider>
          </ThemeProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
