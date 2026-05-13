"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./AdminLogin.module.css";

export default function AdminLogin() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    if (id === "empaerial" && password === "vespasian25") {
      sessionStorage.setItem("isAdmin", "true");
      router.push("/admin");
    } else {
      setError("Wrong ID or password.");
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="admin-login-title">
        <p className={styles.eyebrow}>ADMIN ACCESS</p>
        <h1 id="admin-login-title" className={styles.title}>
          Admin Login()
        </h1>
        <p className={styles.subtitle}>Use your EMPAERIAL admin credentials to continue.</p>

        <form onSubmit={handleLogin} className={styles.form}>
          <label className={styles.label} htmlFor="admin-id">
            Admin ID
          </label>
          <input
            id="admin-id"
            type="text"
            placeholder="Admin ID"
            value={id}
            onChange={(e) => setId(e.target.value)}
            className={styles.input}
            autoComplete="username"
            required
          />

          <label className={styles.label} htmlFor="admin-password">
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            autoComplete="current-password"
            required
          />

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <button type="submit" className={styles.button}>
            Login
          </button>
        </form>

        <a href="/" className={styles.backLink}>
          Back to site
        </a>
      </section>
    </main>
  );
}
