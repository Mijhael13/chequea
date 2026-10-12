"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [theme, setTheme] = useState("dark");
  
  // Modo de autenticación: "login" o "register"
  const [authMode, setAuthMode] = useState("login");

  // Campos de formulario Login
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Campos de formulario Registro
  const [fullName, setFullName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Estados de interfaz
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("chequea-theme");
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("chequea-theme", nextTheme);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setError("Por favor completa todos los campos requeridos.");
      return;
    }

    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 900));
      const cleanName = loginIdentifier.includes("@") 
        ? loginIdentifier.split("@")[0].replace(/[._-]/g, " ") 
        : loginIdentifier;
      const formattedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
      
      const userData = {
        name: formattedName || "Usuario",
        email: loginIdentifier.includes("@") ? loginIdentifier : `${loginIdentifier}@chequea.com`,
        loggedInAt: new Date().toISOString()
      };
      localStorage.setItem("chequea-user", JSON.stringify(userData));

      setSuccess("¡Inicio de sesión exitoso! Redirigiendo...");
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (err) {
      setError("Usuario o contraseña incorrectos. Por favor verifica tus datos.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!fullName.trim() || !registerEmail.trim() || !registerPassword.trim() || !confirmPassword.trim()) {
      setError("Por favor completa todos los campos obligatorios.");
      return;
    }

    if (registerPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (registerPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (!acceptTerms) {
      setError("Debes aceptar los términos y condiciones para continuar.");
      return;
    }

    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1100));
      const userData = {
        name: fullName.trim(),
        email: registerEmail.trim(),
        phone: registerPhone.trim(),
        loggedInAt: new Date().toISOString()
      };
      localStorage.setItem("chequea-user", JSON.stringify(userData));

      setSuccess("¡Cuenta creada exitosamente! Redirigiendo...");
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (err) {
      setError("No se pudo completar el registro. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        type="button"
        onClick={toggleTheme}
        className="theme-toggle-btn"
        aria-label={`Cambiar a modo ${theme === "dark" ? "claro" : "oscuro"}`}
        title={`Cambiar a modo ${theme === "dark" ? "claro" : "oscuro"}`}
      >
        {theme === "dark" ? (
          <>
            <svg className="theme-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
            <span className="theme-toggle-text">Modo Claro</span>
          </>
        ) : (
          <>
            <svg className="theme-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
            <span className="theme-toggle-text">Modo Oscuro</span>
          </>
        )}
      </button>

      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>

      <div className="login-page-wrapper">
        <div className="login-card">
          {/* Logo Principal Centrado */}
          <div className="login-top-brand">
            <Link href="/" className="login-logo-link" title="Volver al inicio">
              <div className="login-logo-container">
                <img 
                  src="/logo.jpg" 
                  alt="Chequea Logo" 
                  className="login-brand-logo" 
                />
              </div>
            </Link>
          </div>

          {/* Pestañas: Iniciar Sesión vs Registrarse */}
          <div className="auth-mode-tabs">
            <button
              type="button"
              className={`auth-tab ${authMode === "login" ? "active" : ""}`}
              onClick={() => { setAuthMode("login"); setError(""); setSuccess(""); }}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              className={`auth-tab ${authMode === "register" ? "active" : ""}`}
              onClick={() => { setAuthMode("register"); setError(""); setSuccess(""); }}
            >
              Registrarse
            </button>
          </div>

          <div className="login-header">
            <div className="login-brand-badge">
              <span className="pulse-dot"></span>
              <span>{authMode === "login" ? "Acceso Seguro" : "Registro Chequea"}</span>
            </div>
            <h1>
              {authMode === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
            </h1>
            <p>
              {authMode === "login"
                ? "Ingresa tus credenciales para acceder al sistema"
                : "Regístrate para guardar consultas y gestionar productos"}
            </p>
          </div>

          {error && (
            <div className="login-alert error" style={{ marginBottom: "1.25rem" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="login-alert success" style={{ marginBottom: "1.25rem" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span>{success}</span>
            </div>
          )}

          {/* FORMULARIO DE INICIO DE SESIÓN */}
          {authMode === "login" ? (
            <form onSubmit={handleLoginSubmit} className="login-form">
              <div className="form-group">
                <label className="form-label" htmlFor="loginIdentifier">
                  Usuario o Correo Electrónico
                </label>
                <div className="input-box">
                  <span className="input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </span>
                  <input
                    id="loginIdentifier"
                    type="text"
                    placeholder="ej. usuario@correo.com"
                    className="form-control"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="loginPassword">
                  Contraseña
                </label>
                <div className="input-box">
                  <span className="input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </span>
                  <input
                    id="loginPassword"
                    type={showLoginPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    className="form-control"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    aria-label={showLoginPassword ? "Ocultar contraseña" : "Ver contraseña"}
                  >
                    {showLoginPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="remember-me">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Recordarme</span>
                </label>

                <a 
                  href="#forgot" 
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Comunícate con el soporte de Chequea para recuperar tu acceso.");
                  }}
                  className="forgot-password-link"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? (
                  <>
                    <div className="spinner" style={{ width: "20px", height: "20px", borderWidth: "2px" }}></div>
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  <>
                    <span>Ingresar a Chequea</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </>
                )}
              </button>

              <div style={{ textAlign: "center", marginTop: "1rem" }}>
                <span className="auth-switch-prompt">
                  ¿No tienes una cuenta aún?
                  <button
                    type="button"
                    className="auth-switch-btn"
                    onClick={() => { setAuthMode("register"); setError(""); setSuccess(""); }}
                  >
                    Regístrate aquí
                  </button>
                </span>
              </div>
            </form>
          ) : (
            /* FORMULARIO DE REGISTRO */
            <form onSubmit={handleRegisterSubmit} className="login-form">
              <div className="form-group">
                <label className="form-label" htmlFor="fullName">
                  Nombre Completo
                </label>
                <div className="input-box">
                  <span className="input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </span>
                  <input
                    id="fullName"
                    type="text"
                    placeholder="ej. Juan Pérez"
                    className="form-control"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="registerEmail">
                    Correo Electrónico
                  </label>
                  <div className="input-box">
                    <span className="input-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                    </span>
                    <input
                      id="registerEmail"
                      type="email"
                      placeholder="correo@ejemplo.com"
                      className="form-control"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="registerPhone">
                    Teléfono
                  </label>
                  <div className="input-box">
                    <span className="input-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                    </span>
                    <input
                      id="registerPhone"
                      type="tel"
                      placeholder="+58 412..."
                      className="form-control"
                      value={registerPhone}
                      onChange={(e) => setRegisterPhone(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="registerPassword">
                    Contraseña
                  </label>
                  <div className="input-box">
                    <span className="input-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                    </span>
                    <input
                      id="registerPassword"
                      type={showRegisterPassword ? "text" : "password"}
                      placeholder="Mínimo 6 carácteres"
                      className="form-control"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="confirmPassword">
                    Confirmar
                  </label>
                  <div className="input-box">
                    <span className="input-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </span>
                    <input
                      id="confirmPassword"
                      type={showRegisterPassword ? "text" : "password"}
                      placeholder="Repite la clave"
                      className="form-control"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-options" style={{ marginTop: "0.25rem" }}>
                <button
                  type="button"
                  style={{ background: "none", border: "none", color: "var(--text-secondary)", fontSize: "0.82rem", cursor: "pointer" }}
                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                >
                  {showRegisterPassword ? "Ocultar contraseñas" : "Mostrar contraseñas"}
                </button>
              </div>

              <label className="terms-checkbox">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                />
                <span>
                  Acepto los Términos de Servicio y la Política de Privacidad de Chequea.
                </span>
              </label>

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? (
                  <>
                    <div className="spinner" style={{ width: "20px", height: "20px", borderWidth: "2px" }}></div>
                    <span>Creando cuenta...</span>
                  </>
                ) : (
                  <>
                    <span>Crear Cuenta en Chequea</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </>
                )}
              </button>

              <div style={{ textAlign: "center", marginTop: "1rem" }}>
                <span className="auth-switch-prompt">
                  ¿Ya tienes una cuenta registrada?
                  <button
                    type="button"
                    className="auth-switch-btn"
                    onClick={() => { setAuthMode("login"); setError(""); setSuccess(""); }}
                  >
                    Inicia sesión aquí
                  </button>
                </span>
              </div>
            </form>
          )}

          <div className="login-footer">
            <Link href="/" className="back-to-home-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>Volver a la consulta de precios</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
