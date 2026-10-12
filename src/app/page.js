"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [theme, setTheme] = useState("dark");
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("chequea-theme");
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
    }

    // Comprobar si el usuario ha iniciado sesión
    try {
      const savedUser = localStorage.getItem("chequea-user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error("Error al cargar sesión de usuario:", e);
    }
  }, []);

  // Cerrar menú al hacer clic fuera de él
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("chequea-theme", nextTheme);
  };

  const handleLogout = () => {
    localStorage.removeItem("chequea-user");
    setUser(null);
    setMenuOpen(false);
  };

  useEffect(() => {
    async function fetchPrices() {
      try {
        const res = await fetch("/api/prices");
        const json = await res.json();

        if (json.success) {
          // Normalizamos los datos por si Firebird los retorna en mayúsculas
          const normalized = json.data.map(item => ({
            codigo: item.CODIGO || item.codigo || 'N/A',
            descripcion: item.DESCRIPCION || item.descripcion || 'Sin descripción',
            precio: item.PRECIO || item.precio || 0
          }));

          // Incorporar productos agregados a mano si existen
          let manualList = [];
          try {
            const savedManual = localStorage.getItem("chequea-manual-products");
            if (savedManual) {
              const parsedManual = JSON.parse(savedManual);
              if (Array.isArray(parsedManual)) {
                manualList = parsedManual.map(item => ({
                  codigo: item.codigo,
                  descripcion: item.descripcion,
                  precio: item.precio,
                  isManual: true
                }));
              }
            }
          } catch (e) {
            console.error("Error al cargar productos manuales en home:", e);
          }

          // Incorporar productos escaneados de Odoo si existen
          let odooList = [];
          try {
            const savedOdoo = localStorage.getItem("chequea-odoo-inventory");
            if (savedOdoo) {
              const parsedOdoo = JSON.parse(savedOdoo);
              if (Array.isArray(parsedOdoo)) {
                odooList = parsedOdoo.map(item => ({
                  codigo: item.codigo,
                  descripcion: item.descripcion,
                  precio: item.precio,
                  isOdoo: true
                }));
              }
            }
          } catch (e) {
            console.error("Error al cargar productos Odoo en home:", e);
          }

          setProducts([...normalized, ...manualList, ...odooList]);
        } else {
          setError(json.error || "Hubo un error al cargar los datos.");
        }
      } catch (err) {
        setError("Error de conexión con el servidor.");
      } finally {
        setLoading(false);
      }
    }
    fetchPrices();
  }, []);

  const filteredProducts = products.filter(product =>
    product.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="top-nav-actions" ref={menuRef}>
        {!user ? (
          <Link href="/login" className="login-nav-btn" title="Iniciar sesión">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
              <polyline points="10 17 15 12 10 7"></polyline>
              <line x1="15" y1="12" x2="3" y2="12"></line>
            </svg>
            <span>Iniciar Sesión</span>
          </Link>
        ) : (
          <div className="burger-menu-container">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className={`burger-btn ${menuOpen ? "open" : ""}`}
              aria-label="Abrir menú"
              title="Menú de navegación"
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
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div className="user-details">
                    <span className="user-name">{user.name || "Usuario"}</span>
                    <span className="user-status">En línea</span>
                  </div>
                </div>

                <div className="burger-divider"></div>

                <nav className="burger-nav">
                  <Link
                    href="/perfil"
                    onClick={() => setMenuOpen(false)}
                    className="burger-item"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span>Perfil</span>
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

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      const searchInput = document.querySelector(".search-input");
                      if (searchInput) {
                        searchInput.focus();
                        searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
                      }
                    }}
                    className="burger-item"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="9" cy="21" r="1"></circle>
                      <circle cx="20" cy="21" r="1"></circle>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    <span>Comprar</span>
                  </button>

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
        )}

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

      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>

      <main className="container">
        <header className="header">
          <div className="header-badge">
            <span className="pulse-dot"></span>
            <span>Chequea Sync</span>
          </div>
          <div className="header-logo-container">
            <img 
              src="/logo.jpg" 
              alt="Chequea - Consulta de Precios" 
              className="brand-logo" 
            />
          </div>
          <h1 className="visually-hidden">Chequea</h1>
          <p>Consulta de precios en tiempo real</p>
        </header>

        <div className="search-container">
          <div className="search-wrapper">
            <span className="search-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            <input
              type="text"
              placeholder="Buscar por código o producto..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="search-clear-btn"
                title="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <span>Sincronizando con Valery...</span>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        {!loading && !error && (
          <>
            <div className="results-meta">
              <span className="results-count">
                Mostrando <span className="results-count-number">{filteredProducts.length}</span> {filteredProducts.length === 1 ? 'producto' : 'productos'}
              </span>
              {searchTerm && <span>Filtro activo</span>}
            </div>

            <div className="prices-grid">
              {filteredProducts.map((product, index) => (
                <div className="price-card" key={index} style={{ animationDelay: `${Math.min(index * 0.04, 0.4)}s` }}>
                  <div className="card-header">
                    <span className="product-code">{product.codigo}</span>
                  </div>
                  <h2 className="product-name">{product.descripcion}</h2>
                  <div className="card-footer">
                    <span className="product-price-label">Precio</span>
                    <div className="product-price">
                      <span className="currency">$</span>
                      {Number(product.precio).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}

              {filteredProducts.length === 0 && (
                <div className="empty-state">
                  <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <h3>Sin resultados</h3>
                  <p>No se encontraron productos que coincidan con &ldquo;{searchTerm}&rdquo;</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </>
  );
}
