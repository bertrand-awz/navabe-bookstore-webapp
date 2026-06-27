import { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError, api } from "../../infrastructure/api/client";
import { Message } from "../components/Message";
import { useAuth } from "../context/AuthContext";
import { useTransientMessage } from "../hooks/useTransientMessage";
import { buttonClass, inputClass, labelClass, pageTitleClass, panelClass } from "../styles";

function AuthShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto my-16 grid max-w-[1000px] grid-cols-[0.7fr_1fr] items-center gap-16 max-[850px]:grid-cols-1">
      <div className="bg-brand p-12 text-white dark:bg-[#243e30] max-[850px]:hidden">
        <p className="mb-24 text-xs font-bold tracking-[0.16em] uppercase">Navabe Bookstore</p>
        <p className="font-display text-6xl leading-[0.9] font-semibold">Good books deserve a place in your life.</p>
      </div>
      <div className={panelClass}><h1 className={pageTitleClass}>{title}</h1>{children}</div>
    </section>
  );
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useTransientMessage();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      await login(String(data.get("email")), String(data.get("password")));
      navigate("/profile");
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Unable to log in.");
    }
  }

  return (
    <AuthShell title="Customer login">
      <form onSubmit={submit}>
        <label className={labelClass}>Email<input className={inputClass} name="email" type="email" required /></label>
        <label className={labelClass}>Password<input className={inputClass} name="password" type="password" required /></label>
        <Message>{error}</Message>
        <button className={buttonClass}>Login</button>
      </form>
      <p className="mt-5">
        <Link className="text-brand hover:text-brand-dark dark:text-[#79cba8] dark:hover:text-[#9be0bc]" to="/signup">Create an account</Link>
        {" · "}
        <Link className="text-brand hover:text-brand-dark dark:text-[#79cba8] dark:hover:text-[#9be0bc]" to="/recovery">Forgot password</Link>
      </p>
    </AuthShell>
  );
}

export function SignupPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useTransientMessage();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries()) as Record<string, string>;
    try {
      await register(data);
      navigate("/profile");
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Unable to create the account.");
    }
  }

  return (
    <AuthShell title="Create your account">
      <form onSubmit={submit}>
        <div className="grid grid-cols-2 gap-4 max-[560px]:grid-cols-1">
          <label className={labelClass}>First name<input className={inputClass} name="first_name" required /></label>
          <label className={labelClass}>Name<input className={inputClass} name="name" required /></label>
        </div>
        <label className={labelClass}>Email<input className={inputClass} name="email" type="email" required /></label>
        <label className={labelClass}>Address<input className={inputClass} name="address" required /></label>
        <label className={labelClass}>Password<input className={inputClass} name="password" type="password" minLength={6} required /></label>
        <Message>{error}</Message>
        <button className={buttonClass}>Create account</button>
      </form>
    </AuthShell>
  );
}

export function RecoveryPage() {
  const [message, setMessage] = useTransientMessage();
  const [error, setError] = useTransientMessage();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const identifier = String(new FormData(event.currentTarget).get("identifier"));
    try {
      await api.auth.recover(identifier);
      setMessage("A temporary password was sent to the email associated with this identifier.");
      setError("");
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Recovery failed.");
    }
  }
  return (
    <AuthShell title="Account recovery">
      <form onSubmit={submit}>
        <label className={labelClass}>Navabe identifier<input className={inputClass} name="identifier" maxLength={8} required /></label>
        <Message>{error}</Message><Message tone="success">{message}</Message>
        <button className={buttonClass}>Send temporary password</button>
      </form>
    </AuthShell>
  );
}
