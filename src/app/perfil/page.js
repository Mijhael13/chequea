"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PerfilPage() {
  const router = useRouter();
  const [theme, setTheme] = useState("dark");
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Datos del usuario
  const [currentUser, setCurrentUser] = useState(null);
  
  // Campos del formulario
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  
  // Sección de cambio de contraseña
  const [wantPasswordChange, setWantPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estados de retroalimentación
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Cargar tema y usuario en montaje
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("chequea-theme");
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
    }

    const savedUser = localStorage.getItem("chequea-user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
        setName(parsed.name || "");
        setEmail(parsed.email || "");
        setPhone(parsed.phone || "");
      } catch (e) {
        console.error("Error al leer sesión de usuario:", e);
      }
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("chequea-theme", nextTheme);
  };

  const handleLogout = () => {
    localStorage.removeItem("chequea-user");
    router.push("/login");
  };

  // Validaciones y restricciones rigurosas para asegurar funcionamiento del login
  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[+0-9\s\-()]{7,20}$/;

    // Restricción 1: Nombre
    if (!name.trim()) {
      errors.name = "El nombre completo es requerido.";
    } else if (name.trim().length < 3) {
      errors.name = "El nombre debe tener al menos 3 caracteres.";
    }

    // Restricción 2: Correo electrónico (identificador clave de login)
    if (!email.trim()) {
      errors.email = "El correo electrónico es requerido para iniciar sesión.";
    } else if (!emailRegex.test(email.trim())) {
      errors.email = "Ingresa un formato de correo electrónico válido (ej. usuario@correo.com).";
    }

    // Restricción 3: Teléfono opcional pero con formato válido
    if (phone.trim() && !phoneRegex.test(phone.trim())) {
      errors.phone = "El teléfono debe contener entre 7 y 20 dígitos numéricos válidos.";
    }

    // Restricción 4: Contraseña (si decide cambiarla)
    if (wantPasswordChange) {
      if (!currentPassword.trim()) {
        errors.currentPassword = "Debes ingresar tu contraseña actual para autorizar el cambio.";
      }

      if (!newPassword.trim()) {
        errors.newPassword = "Debes ingresar la nueva contraseña.";
      } else if (newPassword.length < 6) {
        errors.newPassword = "La nueva contraseña debe tener como mínimo 6 caracteres.";
      }

      if (newPassword && confirmPassword && newPassword !== confirmPassword) {
        errors.confirmPassword = "La confirmación no coincide con la nueva contraseña.";
      } else if (!confirmPassword.trim() && newPassword.trim()) {
        errors.confirmPassword = "Debes confirmar la nueva contraseña.";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      setError("Por favor corrige los campos indicados antes de continuar.");
      return;
    }

    setLoading(true);

    try {
      // Simular sincronización y guardado
      await new Promise((resolve) => setTimeout(resolve, 800));

      const updatedUser = {
        ...currentUser,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        updatedAt: new Date().toISOString()
      };

      // Guardar en almacenamiento para mantener consistencia con el login y navbar
      localStorage.setItem("chequea-user", JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);

      // Limpiar campos de contraseña si fueron usados
      if (wantPasswordChange) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setWantPasswordChange(false);
      }

      setSuccess("¡Datos de perfil actualizados con éxito! Tus credenciales de inicio de sesión han sido sincronizadas.");
      
      // Auto-ocultar mensaje de éxito tras 5 segundos
      setTimeout(() => {
        setSuccess("");
      }, 5000);
    } catch (err) {
      setError("Ocurrió un error al guardar los cambios. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetForm = () => {
    if (currentUser) {
      setName(currentUser.name || "");
      setEmail(currentUser.email || "");
      setPhone(currentUser.phone || "");
    }
    setWantPasswordChange(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setFieldErrors({});
    setError("");
    setSuccess("");
  };

  // Iniciales del avatar
  const getInitials = (userName) => {
    if (!userName) return "U";
    const parts = userName.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return userName.slice(0, 2).toUpperCase();
  };

  return (
    <div className="profile-page-wrapper">
      {/* Botones de navegación superior */}
      <div className="top-nav-actions">
        <Link href="/" className="login-nav-btn back-btn" title="Volver al inicio">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>Inicio</span>
        </Link>

        {/* Burguer Menu interactivo */}
        <div className="burger-menu-container">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className={`burger-btn ${menuOpen ? "open" : ""}`}
            aria-label="Menú de opciones"
            aria-expanded={menuOpen}
          >
            <div className="burger-icon">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>

          {menuOpen && (
            <div className="burger-dropdown">
              <div className="burger-user-info">
                <div className="user-avatar">
                  {getInitials(name || currentUser?.name)}
                </div>
                <div className="user-details">
                  <span className="user-name">{name || currentUser?.name || "Usuario"}</span>
                  <span className="user-status">En línea</span>
                </div>
              </div>

              <div className="burger-divider"></div>

              <nav className="burger-nav">
                <Link
                  href="/perfil"
                  onClick={() => setMenuOpen(false)}
                  className="burger-item active-item"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span>Perfil (Actual)</span>
                </Link>

                <Link
                  href="/"
                  onClick={() => setMenuOpen(false)}
                  className="burger-item"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                  <span>Página principal</span>
                </Link>

                <Link
                  href="/#comprar"
                  onClick={() => setMenuOpen(false)}
                  className="burger-item"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                  <span>Comprar</span>
                </Link>

                <Link
                  href="/vender"
                  onClick={() => setMenuOpen(false)}
                  className="burger-item"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                  <span>Vender</span>
                </Link>

                <div className="burger-divider"></div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="burger-item logout-item"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  <span>Cerrar Sesión</span>
                </button>
              </nav>
            </div>
          )}
        </div>

        {/* Botón de alternancia de tema */}
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
      </div>

      {/* Blobs luminosos de fondo */}
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>

      <main className="profile-container">
        {mounted && !currentUser ? (
          /* Estado cuando no hay sesión iniciada */
          <div className="login-card not-logged-card">
            <div className="login-header">
              <div className="login-logo-container">
                <img src="/logo.jpg" alt="Chequea" className="login-brand-logo" />
              </div>
              <div className="login-brand-badge">
                <span className="pulse-dot"></span>
                <span>Acceso Requerido</span>
              </div>
              <h1>Sesión no iniciada</h1>
              <p>Debes iniciar sesión para consultar y modificar tus datos de perfil.</p>
            </div>
            <div className="not-logged-actions">
              <Link href="/login" className="auth-btn">
                <span>Iniciar Sesión</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
              <Link href="/" className="back-to-home-link" style={{ marginTop: "1rem" }}>
                <span>Volver a la página principal</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Formulario de perfil y edición con restricciones */
          <div className="profile-card">
            {/* Header del Perfil */}
            <div className="profile-header">
              <div className="profile-avatar-wrapper">
                <div className="profile-avatar">
                  {getInitials(name || currentUser?.name)}
                </div>
                <div className="profile-status-indicator" title="En línea y activo"></div>
              </div>

              <div className="profile-header-info">
                <div className="profile-badge">
                  <span className="pulse-dot"></span>
                  <span>Usuario Verificado Chequea</span>
                </div>
                <h2>{name || "Mi Cuenta"}</h2>
                <p className="profile-email-preview">{email || "correo@ejemplo.com"}</p>
                <div className="profile-meta-tags">
                  <span className="meta-tag">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    Conectado con Valery
                  </span>
                  <span className="meta-tag">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                    Seguridad Activa
                  </span>
                </div>
              </div>
            </div>

            {/* Alertas globales de éxito o error */}
            {error && (
              <div className="login-alert error">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="login-alert success">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="profile-form" noValidate>
              {/* Sección 1: Datos Personales */}
              <div className="form-section">
                <h3 className="section-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Datos de la Cuenta
                </h3>

                <div className="form-group">
                  <label className="form-label" htmlFor="profile-name">
                    Nombre Completo <span className="required-star">*</span>
                  </label>
                  <div className="input-box">
                    <span className="input-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </span>
                    <input
                      id="profile-name"
                      type="text"
                      className={`form-control ${fieldErrors.name ? "input-error" : ""}`}
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: null });
                      }}
                      placeholder="Ej. Juan Pérez"
                      required
                    />
                  </div>
                  {fieldErrors.name ? (
                    <span className="field-hint-error">{fieldErrors.name}</span>
                  ) : (
                    <span className="field-hint">Mínimo 3 caracteres. Se mostrará en tus transacciones y menú.</span>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-email">
                      Correo Electrónico (Login) <span className="required-star">*</span>
                    </label>
                    <div className="input-box">
                      <span className="input-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                          <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                      </span>
                      <input
                        id="profile-email"
                        type="email"
                        className={`form-control ${fieldErrors.email ? "input-error" : ""}`}
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: null });
                        }}
                        placeholder="tu@correo.com"
                        required
                      />
                    </div>
                    {fieldErrors.email ? (
                      <span className="field-hint-error">{fieldErrors.email}</span>
                    ) : (
                      <span className="field-hint">Identificador obligatorio para ingresar a Chequea.</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-phone">
                      Teléfono de Contacto
                    </label>
                    <div className="input-box">
                      <span className="input-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                      </span>
                      <input
                        id="profile-phone"
                        type="tel"
                        className={`form-control ${fieldErrors.phone ? "input-error" : ""}`}
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: null });
                        }}
                        placeholder="+58 412 1234567"
                      />
                    </div>
                    {fieldErrors.phone ? (
                      <span className="field-hint-error">{fieldErrors.phone}</span>
                    ) : (
                      <span className="field-hint">Formato internacional o local con código de área.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Sección 2: Seguridad y Cambio de Contraseña */}
              <div className="form-section password-section">
                <div className="section-header-toggle">
                  <h3 className="section-title">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    Seguridad y Contraseña
                  </h3>

                  <button
                    type="button"
                    onClick={() => {
                      setWantPasswordChange(!wantPasswordChange);
                      if (wantPasswordChange) {
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                        setFieldErrors({ ...fieldErrors, currentPassword: null, newPassword: null, confirmPassword: null });
                      }
                    }}
                    className={`btn-toggle-password-section ${wantPasswordChange ? "active" : ""}`}
                  >
                    {wantPasswordChange ? "Cancelar cambio" : "Cambiar contraseña"}
                  </button>
                </div>

                {wantPasswordChange && (
                  <div className="password-fields-box">
                    <div className="form-group">
                      <label className="form-label" htmlFor="current-password">
                        Contraseña Actual <span className="required-star">*</span>
                      </label>
                      <div className="input-box">
                        <span className="input-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                          </svg>
                        </span>
                        <input
                          id="current-password"
                          type={showCurrentPassword ? "text" : "password"}
                          className={`form-control ${fieldErrors.currentPassword ? "input-error" : ""}`}
                          value={currentPassword}
                          onChange={(e) => {
                            setCurrentPassword(e.target.value);
                            if (fieldErrors.currentPassword) setFieldErrors({ ...fieldErrors, currentPassword: null });
                          }}
                          placeholder="Tu contraseña actual"
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          aria-label="Ver u ocultar contraseña"
                        >
                          {showCurrentPassword ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                              <line x1="1" y1="1" x2="23" y2="23"></line>
                            </svg>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                          )}
                        </button>
                      </div>
                      {fieldErrors.currentPassword && (
                        <span className="field-hint-error">{fieldErrors.currentPassword}</span>
                      )}
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label" htmlFor="new-password">
                          Nueva Contraseña <span className="required-star">*</span>
                        </label>
                        <div className="input-box">
                          <span className="input-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="16" r="1"></circle>
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                              <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
                            </svg>
                          </span>
                          <input
                            id="new-password"
                            type={showNewPassword ? "text" : "password"}
                            className={`form-control ${fieldErrors.newPassword ? "input-error" : ""}`}
                            value={newPassword}
                            onChange={(e) => {
                              setNewPassword(e.target.value);
                              if (fieldErrors.newPassword) setFieldErrors({ ...fieldErrors, newPassword: null });
                            }}
                            placeholder="Mínimo 6 caracteres"
                          />
                          <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            aria-label="Ver u ocultar contraseña"
                          >
                            {showNewPassword ? (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                <line x1="1" y1="1" x2="23" y2="23"></line>
                              </svg>
                            ) : (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                              </svg>
                            )}
                          </button>
                        </div>
                        {fieldErrors.newPassword && (
                          <span className="field-hint-error">{fieldErrors.newPassword}</span>
                        )}
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="confirm-password">
                          Confirmar Contraseña <span className="required-star">*</span>
                        </label>
                        <div className="input-box">
                          <span className="input-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                              <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                          </span>
                          <input
                            id="confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            className={`form-control ${fieldErrors.confirmPassword ? "input-error" : ""}`}
                            value={confirmPassword}
                            onChange={(e) => {
                              setConfirmPassword(e.target.value);
                              if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: null });
                            }}
                            placeholder="Repite la nueva contraseña"
                          />
                          <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            aria-label="Ver u ocultar contraseña"
                          >
                            {showConfirmPassword ? (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                <line x1="1" y1="1" x2="23" y2="23"></line>
                              </svg>
                            ) : (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                              </svg>
                            )}
                          </button>
                        </div>
                        {fieldErrors.confirmPassword && (
                          <span className="field-hint-error">{fieldErrors.confirmPassword}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Botones de acción del perfil */}
              <div className="profile-form-actions">
                <button
                  type="submit"
                  className="auth-btn profile-save-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="auth-spinner"></span>
                      <span>Guardando Cambios...</span>
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>Guardar Cambios</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleResetForm}
                  className="profile-reset-btn"
                  disabled={loading}
                >
                  Deshacer cambios
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
