import { FormEvent, useEffect, useState } from "react";
import type { Book, Manager, OrderDetails, Statistic } from "../../domain/models";
import { ApiError, api } from "../../infrastructure/api/client";
import { Message } from "../components/Message";
import { useTransientMessage } from "../hooks/useTransientMessage";
import {
  buttonClass,
  eyebrowClass,
  feedbackStateClass,
  inputClass,
  labelClass,
  pageTitleClass,
  panelClass,
  secondaryButtonClass,
  sectionTitleClass,
} from "../styles";

type Section = "dashboard" | "books" | "orders" | "managers";

const sections: Array<{ key: Section; label: string }> = [
  { key: "dashboard", label: "Dashboard" },
  { key: "books", label: "Books" },
  { key: "orders", label: "Orders" },
  { key: "managers", label: "Managers" },
];

const blankBook = {
  isbn: "",
  title: "",
  author: "",
  editor: "",
  category: "",
  synopsis: "",
  publication_year: null,
  price: 0,
  image_url: "",
  quantity: 0,
};

const statisticTitles: Record<string, string> = {
  average: "Average prices",
  orders: "Orders",
  sales: "Sales",
  stock: "Stock",
};

export function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [checking, setChecking] = useState(true);
  const [section, setSection] = useState<Section>("dashboard");

  useEffect(() => {
    api.admin.session()
      .then((result) => {
        setAuthenticated(result.authenticated);
        setMustChangePassword(result.must_change_password);
      })
      .finally(() => setChecking(false));
  }, []);

  if (checking) return <p className={feedbackStateClass}>Checking management session…</p>;
  if (!authenticated) {
    return (
      <ManagementAccess
        onLogin={(manager) => {
          setAuthenticated(true);
          setMustChangePassword(manager.must_change_password);
        }}
      />
    );
  }
  if (mustChangePassword) {
    return <ManagerPasswordChange onComplete={() => setMustChangePassword(false)} onLogout={() => setAuthenticated(false)} />;
  }

  return (
    <section className="grid grid-cols-[220px_minmax(0,1fr)] gap-12 max-[850px]:grid-cols-1">
      <aside className="sticky top-[100px] grid self-start border-t-2 border-ink dark:border-[#f2eee4] max-[850px]:static max-[850px]:grid-cols-2">
        <h1 className="border-b border-line py-4 font-display text-2xl font-bold dark:border-[#514c44] max-[850px]:col-span-full">Management Portal</h1>
        {sections.map(({ key, label }) => (
          <button
            className={`cursor-pointer border-b border-line px-0 py-3 text-left text-xs font-bold tracking-[0.12em] uppercase hover:text-brand dark:border-[#514c44] dark:hover:text-[#93b7a0] ${
              section === key ? "text-brand dark:text-[#93b7a0]" : ""
            }`}
            key={key}
            onClick={() => setSection(key)}
          >
            {label}
          </button>
        ))}
        <button className={`${secondaryButtonClass} mt-5 text-left`} onClick={async () => { await api.admin.logout(); setAuthenticated(false); }}>
          Logout
        </button>
      </aside>
      <div className="min-w-0">
        {section === "dashboard" && <AdminDashboard />}
        {section === "books" && <AdminBooks />}
        {section === "orders" && <AdminOrders />}
        {section === "managers" && <ManagerCreate />}
      </div>
    </section>
  );
}

function ManagementAccess({ onLogin }: { onLogin(manager: Manager): void }) {
  const [mode, setMode] = useState<"login" | "recovery">("login");
  const [error, setError] = useTransientMessage();
  const [message, setMessage] = useTransientMessage();

  function changeMode(nextMode: "login" | "recovery") {
    setMode(nextMode);
    setError("");
    setMessage("");
  }

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      const manager = await api.admin.login(String(data.get("identifier")), String(data.get("password")));
      onLogin(manager);
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Unable to log in.");
    }
  }
  async function recover(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await api.admin.recover(String(new FormData(event.currentTarget).get("identifier")));
      setMessage("A temporary password was sent to the management account email.");
      setError("");
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Unable to recover the management account.");
    }
  }

  return (
    <section className="mx-auto my-12 max-w-[650px]">
      <article className={panelClass}>
        {mode === "login" ? (
          <>
            <h1 className={pageTitleClass}>Management Portal</h1>
            <form onSubmit={login}>
              <label className={labelClass}>Manager ID<input className={inputClass} name="identifier" required /></label>
              <label className={labelClass}>Password<input className={inputClass} name="password" type="password" required /></label>
              <div className="flex flex-wrap gap-3">
                <button className={buttonClass}>Login</button>
                <button className={secondaryButtonClass} type="button" onClick={() => changeMode("recovery")}>Forgot password?</button>
              </div>
            </form>
          </>
        ) : (
          <>
            <h1 className={pageTitleClass}>Recover management account</h1>
            <form onSubmit={recover}>
              <label className={labelClass}>Manager ID<input className={inputClass} name="identifier" required /></label>
              <div className="flex flex-wrap gap-3">
                <button className={buttonClass}>Send temporary password</button>
                <button className={secondaryButtonClass} type="button" onClick={() => changeMode("login")}>Back to login</button>
              </div>
            </form>
          </>
        )}
        <Message>{error}</Message><Message tone="success">{message}</Message>
      </article>
    </section>
  );
}

function ManagerPasswordChange({
  onComplete,
  onLogout,
}: {
  onComplete(): void;
  onLogout(): void;
}) {
  const [error, setError] = useTransientMessage();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const password = String(data.get("password"));
    const confirmation = String(data.get("confirmation"));
    if (password !== confirmation) {
      setError("Passwords do not match.");
      return;
    }
    try {
      await api.admin.changePassword(password);
      form.reset();
      onComplete();
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Unable to change the password.");
    }
  }

  async function logout() {
    await api.admin.logout();
    onLogout();
  }

  return (
    <section className="mx-auto my-12 max-w-[650px]">
      <article className={panelClass}>
        <h1 className={pageTitleClass}>Change temporary password</h1>
        <p className="mb-6 leading-7 text-ink/80 dark:text-[#d9d1c3]">
          Choose a new password before accessing the management portal.
        </p>
        <form onSubmit={submit}>
          <label className={labelClass}>New password<input className={inputClass} name="password" type="password" minLength={6} required /></label>
          <label className={labelClass}>Confirm password<input className={inputClass} name="confirmation" type="password" minLength={6} required /></label>
          <div className="flex flex-wrap gap-3">
            <button className={buttonClass}>Update password</button>
            <button className={secondaryButtonClass} type="button" onClick={() => void logout()}>Logout</button>
          </div>
        </form>
        <Message>{error}</Message>
      </article>
    </section>
  );
}

function AdminDashboard() {
  const [stats, setStats] = useState<Record<string, Statistic>>({});
  const [error, setError] = useTransientMessage();
  useEffect(() => {
    Promise.all([
      api.admin.statistic("stock", "category"),
      api.admin.statistic("sales"),
      api.admin.statistic("orders"),
      api.admin.statistic("average-price", "category"),
    ]).then(([stock, sales, orders, average]) => setStats({ stock, sales, orders, average }))
      .catch((reason) => setError(reason instanceof ApiError ? reason.message : "Unable to load statistics."));
  }, [setError]);
  return (
    <>
      <h1 className={pageTitleClass}>Bookstore statistics</h1><Message>{error}</Message>
      <div className="grid grid-cols-2 gap-x-8 gap-y-12 max-[560px]:grid-cols-1">
        {Object.entries(stats).map(([name, statistic]) => <StatisticCard key={name} title={name} statistic={statistic} />)}
      </div>
    </>
  );
}

function StatisticCard({ title, statistic }: { title: string; statistic: Statistic }) {
  const maximum = Math.max(...statistic.values, 1);
  const displayTitle = statisticTitles[title] ?? title;
  return (
    <article className={panelClass}><h2 className={sectionTitleClass}>{displayTitle}</h2>
      {statistic.labels.map((label, index) => (
        <div className="my-2 grid grid-cols-[100px_1fr_50px] items-center gap-2 text-xs" key={label}>
          <span className="truncate">{label}</span>
          <div className="h-1 bg-line dark:bg-[#514c44]">
            <i className="block h-full bg-ink dark:bg-[#f2eee4]" style={{ width: `${(statistic.values[index] / maximum) * 100}%` }} />
          </div>
          <strong className="text-right">{statistic.values[index]}</strong>
        </div>
      ))}
      {statistic.labels.length === 0 && <p>No data yet.</p>}
    </article>
  );
}

function AdminBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [book, setBook] = useState<Partial<Book> & { quantity: number }>(blankBook);
  const [message, setMessage] = useTransientMessage();

  async function search(query: string) {
    setBooks(await api.admin.books(query));
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    try {
      const saved = await api.admin.saveBook(book);
      setMessage(`${saved.title} was saved.`);
      setBook(blankBook);
      await search("");
    } catch (reason) {
      setMessage(reason instanceof ApiError ? reason.message : "Unable to save the book.");
    }
  }
  return (
    <>
      <h1 className={pageTitleClass}>Book management</h1><Message tone={message.includes("saved") ? "success" : "error"}>{message}</Message>
      <div className="grid grid-cols-[1.2fr_0.8fr] gap-10 max-[850px]:grid-cols-1">
        <article className={panelClass}>
          <h2 className={sectionTitleClass}>Create or update</h2>
          <form onSubmit={save}>
            <div className="grid grid-cols-2 gap-4 max-[560px]:grid-cols-1">
              <label className={labelClass}>ISBN<input className={inputClass} value={book.isbn} onChange={(e) => setBook({ ...book, isbn: e.target.value })} required /></label>
              <label className={labelClass}>Title<input className={inputClass} value={book.title} onChange={(e) => setBook({ ...book, title: e.target.value })} required /></label>
              <label className={labelClass}>Author<input className={inputClass} value={book.author} onChange={(e) => setBook({ ...book, author: e.target.value })} required /></label>
              <label className={labelClass}>Editor<input className={inputClass} value={book.editor} onChange={(e) => setBook({ ...book, editor: e.target.value })} /></label>
              <label className={labelClass}>Category<input className={inputClass} value={book.category} onChange={(e) => setBook({ ...book, category: e.target.value })} /></label>
              <label className={labelClass}>Year<input className={inputClass} type="number" value={book.publication_year ?? ""} onChange={(e) => setBook({ ...book, publication_year: Number(e.target.value) || null })} /></label>
              <label className={labelClass}>Price<input className={inputClass} type="number" step=".01" value={book.price} onChange={(e) => setBook({ ...book, price: Number(e.target.value) })} required /></label>
              <label className={labelClass}>Quantity to add<input className={inputClass} type="number" value={book.quantity} onChange={(e) => setBook({ ...book, quantity: Number(e.target.value) })} /></label>
            </div>
            <label className={labelClass}>Image URL<input className={inputClass} value={book.image_url} onChange={(e) => setBook({ ...book, image_url: e.target.value })} /></label>
            <label className={labelClass}>Synopsis<textarea className={`${inputClass} min-h-30 resize-y`} value={book.synopsis} onChange={(e) => setBook({ ...book, synopsis: e.target.value })} /></label>
            <button className={buttonClass}>Save book</button>
          </form>
        </article>
        <article className={panelClass}>
          <h2 className={sectionTitleClass}>Search and remove</h2>
          <input className={inputClass} type="search" placeholder="Search books" onChange={(event) => void search(event.target.value)} />
          <div className="mt-5 grid max-h-[650px] overflow-auto border-t border-line dark:border-[#514c44]">
            {books.map((item) => <button className="flex cursor-pointer items-center justify-between border-b border-line py-3 text-left font-bold text-ink hover:text-brand dark:border-[#514c44] dark:text-[#f2eee4] dark:hover:text-[#93b7a0]" key={item.isbn} onClick={() => setBook({ ...item, quantity: 0 })}>
              <span>{item.title}<small className="block font-normal">{item.isbn}</small></span>
              <span className="text-xs text-danger dark:text-[#f0aaa5]" onClick={async (event) => {
                event.stopPropagation();
                await api.admin.deleteBook(item.isbn);
                await search("");
              }}>Remove</span>
            </button>)}
          </div>
        </article>
      </div>
    </>
  );
}

function AdminOrders() {
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [error, setError] = useTransientMessage();
  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setOrder(await api.admin.order(String(new FormData(event.currentTarget).get("identifier"))));
      setError("");
    } catch (reason) {
      setOrder(null);
      setError(reason instanceof ApiError ? reason.message : "Unable to find the order.");
    }
  }
  return (
    <>
      <h1 className={pageTitleClass}>Order search</h1>
      <form className="flex max-w-[650px] gap-2" onSubmit={search}>
        <input className={inputClass} name="identifier" maxLength={16} placeholder="16-character order number" required />
        <button className={buttonClass}>Search</button>
      </form>
      <Message>{error}</Message>
      {order && <article className={`${panelClass} mt-6`}>
        <p className={eyebrowClass}>{order.status}</p><h2 className={sectionTitleClass}>{order.identifier}</h2>
        <p className="mb-4">{order.customer} · {order.amount.toFixed(2)} CAD · {new Date(order.paid_at).toLocaleString()}</p>
        {order.items.map((item) => <div className="flex items-center justify-between gap-4 border-b border-line py-4 dark:border-[#34463c]" key={item.isbn}><span>{item.title_by_author}</span><strong>× {item.quantity}</strong></div>)}
      </article>}
    </>
  );
}

function ManagerCreate() {
  const [message, setMessage] = useTransientMessage();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as { name: string; first_name: string; email: string };
    try {
      const manager = await api.admin.createManager(data);
      setMessage(
        manager?.identifier
          ? `Manager ${manager.identifier} was created and received a temporary password.`
          : "Manager was created and received a temporary password.",
      );
      form.reset();
    } catch (reason) {
      setMessage(reason instanceof ApiError ? reason.message : "Unable to create the manager.");
    }
  }
  return (
    <article className={`${panelClass} max-w-[650px]`}><h1 className={pageTitleClass}>Create manager</h1>
      <form onSubmit={submit}>
        <label className={labelClass}>First name<input className={inputClass} name="first_name" required /></label>
        <label className={labelClass}>Name<input className={inputClass} name="name" required /></label>
        <label className={labelClass}>Email<input className={inputClass} name="email" type="email" required /></label>
        <button className={buttonClass}>Create manager</button>
      </form><Message tone={message.includes("created") ? "success" : "error"}>{message}</Message>
    </article>
  );
}
