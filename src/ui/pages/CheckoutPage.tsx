import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { Navigate } from "react-router-dom";
import { ApiError, api } from "../../infrastructure/api/client";
import { Message } from "../components/Message";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useTransientMessage } from "../hooks/useTransientMessage";
import {
  compactButtonClass,
  dangerButtonClass,
  eyebrowClass,
  feedbackStateClass,
  pageTitleClass,
  panelClass,
  sectionTitleClass,
} from "../styles";

export function CheckoutPage() {
  const { user, loading } = useAuth();
  const cart = useCart();
  const [message, setMessage] = useTransientMessage();
  const [error, setError] = useTransientMessage();
  if (loading) return <p className={feedbackStateClass}>Loading checkout…</p>;
  if (!user) return <Navigate to="/login" replace />;

  async function saveOrder(transactionId: string) {
    try {
      const order = await api.orders.create(
        transactionId,
        cart.total,
        cart.items.map((item) => ({ isbn: item.isbn, quantity: item.cartQuantity })),
      );
      cart.clear();
      setMessage(`Payment confirmed. Your order number is ${order.identifier}.`);
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Unable to save the order.");
    }
  }

  return (
    <section className="mx-auto my-12 grid max-w-[1250px] grid-cols-[1.4fr_0.6fr] gap-12 max-[850px]:grid-cols-1">
      <article className={panelClass}>
        <p className={eyebrowClass}>Secure checkout</p><h1 className={pageTitleClass}>Your cart</h1>
        {cart.items.map((item) => (
          <div className="flex items-center justify-between gap-4 border-b border-line py-4 dark:border-[#34463c] max-[560px]:flex-wrap max-[560px]:items-start" key={item.isbn}>
            <img className="h-[82px] w-[68px] bg-canvas p-2 object-contain dark:bg-[#111411]" src={item.image_url || "/icon.png"} alt="" />
            <div className="flex-1"><strong>{item.title}</strong><p className="mt-1">{item.price.toFixed(2)} CAD</p></div>
            <div className="flex flex-wrap items-center gap-2">
              <button className={compactButtonClass} onClick={() => cart.decrement(item.isbn)}>−</button><span>{item.cartQuantity}</span>
              <button className={compactButtonClass} onClick={async () => {
                if (!(await cart.increment(item))) setError("No more copies are available.");
              }}>+</button>
              <button className={dangerButtonClass} onClick={() => cart.remove(item.isbn)}>Remove</button>
            </div>
          </div>
        ))}
        {cart.items.length === 0 && !message && <p className={feedbackStateClass}>Your cart is empty.</p>}
      </article>
      <aside className={`${panelClass} sticky top-[100px] self-start max-[850px]:static`}>
        <h2 className={sectionTitleClass}>Total</h2>
        <strong className="mb-6 block font-display text-3xl">{cart.total.toFixed(2)} CAD</strong>
        <Message>{error}</Message><Message tone="success">{message}</Message>
        {cart.items.length > 0 && (
          <PayPalScriptProvider options={{ clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || "test", currency: "CAD" }}>
            <PayPalButtons
              forceReRender={[cart.total]}
              createOrder={(_, actions) => actions.order.create({
                intent: "CAPTURE",
                purchase_units: [{ amount: { currency_code: "CAD", value: cart.total.toFixed(2) } }],
              })}
              onApprove={async (data, actions) => {
                await actions.order?.capture();
                await saveOrder(data.orderID);
              }}
              onError={() => setError("PayPal could not complete the payment.")}
            />
          </PayPalScriptProvider>
        )}
      </aside>
    </section>
  );
}
