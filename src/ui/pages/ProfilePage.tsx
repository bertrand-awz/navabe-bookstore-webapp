import { FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ApiError, api } from "../../infrastructure/api/client";
import { Message } from "../components/Message";
import { useAuth } from "../context/AuthContext";
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

export function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useTransientMessage();
  if (loading) return <p className={feedbackStateClass}>Loading profile…</p>;
  if (!user) return <Navigate to="/login" replace />;

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await api.auth.changePassword(String(new FormData(event.currentTarget).get("password")));
      await logout().catch(() => undefined);
      navigate("/login");
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Unable to change the password.");
    }
  }

  return (
    <section className="mx-auto my-12 grid max-w-[1100px] grid-cols-2 gap-12 max-[850px]:grid-cols-1">
      <article className={`${panelClass} border-brand`}>
        <p className={eyebrowClass}>Customer {user.identifier}</p>
        <h1 className={pageTitleClass}>{user.first_name} {user.name}</h1>
        <p className="mb-2">{user.email}</p><p className="mb-6">{user.address}</p>
        <button className={secondaryButtonClass} onClick={() => void logout()}>Logout</button>
      </article>
      <article className={panelClass}>
        <h2 className={sectionTitleClass}>Change password</h2>
        <form onSubmit={changePassword}>
          <label className={labelClass}>New password<input className={inputClass} name="password" type="password" minLength={6} required /></label>
          <Message>{error}</Message>
          <button className={buttonClass}>Update and logout</button>
        </form>
      </article>
    </section>
  );
}
