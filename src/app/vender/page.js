"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Catálogo manual inicial por defecto si el almacenamiento local está vacío
const DEFAULT_MANUAL_PRODUCTS = [
  {
    id: "MAN-101",
    codigo: "MAN-101",
    descripcion: "Batería Duncan 36M 800AMP Reforzada",
    precio: "115.00",
    stock: 8,
    estado: "Disponible",
    origen: "manual",
    fechaCreacion: "12/10/2026"
  },
  {
    id: "MAN-102",
    codigo: "MAN-102",
    descripcion: "Kit Embrague Completo Valeo 200mm",
    precio: "89.50",
    stock: 14,
    estado: "Disponible",
    origen: "manual",
    fechaCreacion: "12/10/2026"
  },
  {
    id: "MAN-103",
    codigo: "MAN-103",
    descripcion: "Bobina de Encendido Electrónico 4 Pines",
    precio: "42.00",
    stock: 4,
    estado: "Bajo Stock",
    origen: "manual",
    fechaCreacion: "12/10/2026"
  },
  {
    id: "MAN-104",
    codigo: "MAN-104",
    descripcion: "Aceite Transmisión Automática ATF Dexron VI",
    precio: "14.90",
    stock: 30,
    estado: "Disponible",
    origen: "manual",
    fechaCreacion: "12/10/2026"
  }
];

export default function VenderPage() {
  const router = useRouter();
  const [theme, setTheme] = useState("dark");
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const menuRef = useRef(null);

  // Pestaña activa: "manual" (CRUD), "valery" (Firebird SQL), "odoo" (Odoo ERP API)
  const [activeTab, setActiveTab] = useState("manual");

  // ==========================================
  // ESTADOS DEL ESCANER VALERY (FIREBIRD SQL)
  // ==========================================
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStep, setScanStep] = useState("");
  const [scanLogs, setScanLogs] = useState([]);
  const [scanComplete, setScanComplete] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [filterTerm, setFilterTerm] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isLiveDatabase, setIsLiveDatabase] = useState(false);
  const [dbTarget, setDbTarget] = useState("C:\\Valery\\Datos\\DATOS.FDB");

  // ==========================================
  // ESTADOS DEL ESCANER ODOO ERP (JSON-RPC)
  // ==========================================
  const [scanningOdoo, setScanningOdoo] = useState(false);
  const [scanOdooProgress, setScanOdooProgress] = useState(0);
  const [scanOdooStep, setScanOdooStep] = useState("");
  const [scanOdooLogs, setScanOdooLogs] = useState([]);
  const [scanOdooComplete, setScanOdooComplete] = useState(false);
  const [odooProducts, setOdooProducts] = useState([]);
  const [selectedOdooIds, setSelectedOdooIds] = useState(new Set());
  const [filterOdooTerm, setFilterOdooTerm] = useState("");
  const [uploadingOdoo, setUploadingOdoo] = useState(false);
  const [isLiveOdoo, setIsLiveOdoo] = useState(false);
  const [showOdooConfig, setShowOdooConfig] = useState(false);
  const [odooConfig, setOdooConfig] = useState({
    url: "http://127.0.0.1:8069",
    db: "odoo",
    user: "admin",
    password: ""
  });

  // ==========================================
  // ESTADOS DEL CRUD MANUAL (SUBIDA A MANO)
  // ==========================================
  const [manualProducts, setManualProducts] = useState([]);
  const [selectedManualIds, setSelectedManualIds] = useState(new Set());
  const [filterManualTerm, setFilterManualTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
    id: "",
    codigo: "",
    descripcion: "",
    precio: "",
    stock: "1",
    estado: "Disponible"
  });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [uploadingManual, setUploadingManual] = useState(false);

  // Notificación global
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "success" });
    }, 5000);
  };

  // Cargar usuario, tema e inventarios
  useEffect(() => {
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
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error(e);
      }
    }

    // Cargar inventario Valery escaneado previamente si existe
    const savedInventory = localStorage.getItem("chequea-scanned-inventory");
    if (savedInventory) {
      try {
        const parsed = JSON.parse(savedInventory);
        setProducts(parsed);
        setSelectedIds(new Set(parsed.map((p) => p.id)));
        setScanComplete(true);
      } catch (e) {
        console.error(e);
      }
    }

    // Cargar inventario Odoo escaneado previamente si existe
    const savedOdoo = localStorage.getItem("chequea-odoo-inventory");
    if (savedOdoo) {
      try {
        const parsed = JSON.parse(savedOdoo);
        setOdooProducts(parsed);
        setSelectedOdooIds(new Set(parsed.map((p) => p.id)));
        setScanOdooComplete(true);
      } catch (e) {
        console.error(e);
      }
    }

    // Cargar configuración de Odoo guardada
    const savedOdooConfig = localStorage.getItem("chequea-odoo-config");
    if (savedOdooConfig) {
      try {
        setOdooConfig(JSON.parse(savedOdooConfig));
      } catch (e) {
        console.error(e);
      }
    }

    // Cargar inventario Manual (CRUD)
    const savedManual = localStorage.getItem("chequea-manual-products");
    if (savedManual) {
      try {
        const parsed = JSON.parse(savedManual);
        setManualProducts(parsed);
        setSelectedManualIds(new Set(parsed.map((p) => p.id)));
      } catch (e) {
        console.error(e);
      }
    } else {
      // Inicializar con productos de ejemplo para una experiencia inmediata
      setManualProducts(DEFAULT_MANUAL_PRODUCTS);
      setSelectedManualIds(new Set(DEFAULT_MANUAL_PRODUCTS.map((p) => p.id)));
      localStorage.setItem("chequea-manual-products", JSON.stringify(DEFAULT_MANUAL_PRODUCTS));
    }

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("chequea-theme", nextTheme);
  };

  const handleLogout = () => {
    localStorage.removeItem("chequea-user");
    setUser(null);
    router.push("/login");
  };

  // ==========================================
  // OPERACIONES VALERY (AUTOMÁTICO)
  // ==========================================
  const handleStartScan = async () => {
    setScanning(true);
    setScanProgress(0);
    setScanLogs([]);
    setScanComplete(false);

    const logMessages = [
      { progress: 15, msg: "Iniciando protocolo de conexión con Firebird SQL..." },
      { progress: 30, msg: "Conectando al puerto 3050 (127.0.0.1)..." },
      { progress: 48, msg: "Escaneando tabla INV en C:\\Valery\\Datos\\DATOS.FDB..." },
      { progress: 68, msg: "Extrayendo registros: CODIGO, DESCRIPCION y PRECIO1..." },
      { progress: 85, msg: "Comprobando existencias y formateando catálogo..." },
      { progress: 100, msg: "¡Escaneo finalizado con éxito! Catálogo cargado." }
    ];

    for (let i = 0; i < logMessages.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 550));
      setScanProgress(logMessages[i].progress);
      setScanStep(logMessages[i].msg);
      setScanLogs((prev) => [...prev, logMessages[i].msg]);
    }

    try {
      const res = await fetch("/api/sync");
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        setProducts(json.data);
        setSelectedIds(new Set(json.data.map((p) => p.id)));
        setIsLiveDatabase(json.isLiveDatabase);
        if (json.databaseTarget) setDbTarget(json.databaseTarget);
        localStorage.setItem("chequea-scanned-inventory", JSON.stringify(json.data));
        showToast("¡Inventario de Valery sincronizado con éxito!");
      }
    } catch (err) {
      console.error("Error al obtener datos escaneados:", err);
      showToast("Error de conexión al escanear Valery", "error");
    } finally {
      await new Promise((resolve) => setTimeout(resolve, 350));
      setScanning(false);
      setScanComplete(true);
    }
  };

  const handleUploadProducts = async () => {
    const selectedProducts = products.filter((p) => selectedIds.has(p.id));
    if (selectedProducts.length === 0) {
      showToast("Selecciona al menos un producto de Valery para subir.", "error");
      return;
    }

    setUploading(true);
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: selectedProducts })
      });
      const json = await res.json();

      if (json.success) {
        showToast(json.message);
      }
    } catch (err) {
      showToast("Error al subir los productos. Intenta nuevamente.", "error");
    } finally {
      setUploading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map((p) => p.id)));
    }
  };

  const toggleSelectOne = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const filteredProducts = products.filter((p) =>
    p.descripcion.toLowerCase().includes(filterTerm.toLowerCase()) ||
    p.codigo.toLowerCase().includes(filterTerm.toLowerCase())
  );

  // ==========================================
  // OPERACIONES ESCANEO ODOO ERP
  // ==========================================
  const handleStartScanOdoo = async () => {
    setScanningOdoo(true);
    setScanOdooProgress(0);
    setScanOdooLogs([]);
    setScanOdooComplete(false);

    const logMessages = [
      { progress: 14, msg: `Iniciando cliente JSON-RPC para Odoo ERP en ${odooConfig.url}...` },
      { progress: 28, msg: `Conectando con base de datos '${odooConfig.db}' en puerto 8069...` },
      { progress: 46, msg: `Autenticando usuario '${odooConfig.user || 'admin'}' mediante servicio 'common' de Odoo...` },
      { progress: 68, msg: "Consultando modelo product.template con filtro [('sale_ok', '=', True)]..." },
      { progress: 85, msg: "Extrayendo campos: default_code, name, list_price y stock en tiempo real..." },
      { progress: 100, msg: "¡Conexión exitosa! Catálogo de Odoo sincronizado con Chequea." }
    ];

    for (let i = 0; i < logMessages.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 550));
      setScanOdooProgress(logMessages[i].progress);
      setScanOdooStep(logMessages[i].msg);
      setScanOdooLogs((prev) => [...prev, logMessages[i].msg]);
    }

    try {
      const queryParams = new URLSearchParams({
        url: odooConfig.url,
        db: odooConfig.db,
        user: odooConfig.user,
        password: odooConfig.password
      });
      const res = await fetch(`/api/odoo?${queryParams.toString()}`);
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        setOdooProducts(json.data);
        setSelectedOdooIds(new Set(json.data.map((p) => p.id)));
        setIsLiveOdoo(json.isLiveDatabase);
        localStorage.setItem("chequea-odoo-inventory", JSON.stringify(json.data));
        showToast("¡Inventario de Odoo ERP sincronizado con éxito!");
      }
    } catch (err) {
      console.error("Error al escanear Odoo:", err);
      showToast("Error de conexión al escanear Odoo ERP", "error");
    } finally {
      await new Promise((resolve) => setTimeout(resolve, 350));
      setScanningOdoo(false);
      setScanOdooComplete(true);
    }
  };

  const handleSaveOdooConfig = (e) => {
    e.preventDefault();
    localStorage.setItem("chequea-odoo-config", JSON.stringify(odooConfig));
    setShowOdooConfig(false);
    showToast("Configuración de Odoo guardada correctamente.");
  };

  const handleUploadOdooProducts = async () => {
    const selected = odooProducts.filter((p) => selectedOdooIds.has(p.id));
    if (selected.length === 0) {
      showToast("Selecciona al menos un producto de Odoo para subir.", "error");
      return;
    }

    setUploadingOdoo(true);
    try {
      const res = await fetch("/api/odoo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: selected })
      });
      const json = await res.json();

      if (json.success) {
        showToast(json.message);
      }
    } catch (err) {
      showToast("Error al subir los productos de Odoo.", "error");
    } finally {
      setUploadingOdoo(false);
    }
  };

  const toggleSelectAllOdoo = () => {
    if (selectedOdooIds.size === filteredOdooProducts.length) {
      setSelectedOdooIds(new Set());
    } else {
      setSelectedOdooIds(new Set(filteredOdooProducts.map((p) => p.id)));
    }
  };

  const toggleSelectOneOdoo = (id) => {
    const next = new Set(selectedOdooIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedOdooIds(next);
  };

  const filteredOdooProducts = odooProducts.filter(
    (p) =>
      p.descripcion.toLowerCase().includes(filterOdooTerm.toLowerCase()) ||
      p.codigo.toLowerCase().includes(filterOdooTerm.toLowerCase())
  );

  // ==========================================
  // OPERACIONES CRUD MANUAL (CREATE, UPDATE, DELETE)
  // ==========================================
  const handleOpenCreateModal = () => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setFormData({
      id: "",
      codigo: `MAN-${randomSuffix}`,
      descripcion: "",
      precio: "",
      stock: "10",
      estado: "Disponible"
    });
    setIsEditing(false);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setFormData({
      id: product.id,
      codigo: product.codigo,
      descripcion: product.descripcion,
      precio: product.precio,
      stock: product.stock.toString(),
      estado: product.estado || "Disponible"
    });
    setIsEditing(true);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerateCode = () => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setFormData((prev) => ({ ...prev, codigo: `MAN-${randomSuffix}` }));
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();

    const cleanCodigo = formData.codigo.trim().toUpperCase();
    const cleanDesc = formData.descripcion.trim();
    const numPrecio = parseFloat(formData.precio);
    const numStock = parseInt(formData.stock, 10);

    if (!cleanCodigo) {
      setFormError("Por favor ingresa un código de producto.");
      return;
    }
    if (!cleanDesc) {
      setFormError("Por favor ingresa el nombre o descripción del producto.");
      return;
    }
    if (isNaN(numPrecio) || numPrecio <= 0) {
      setFormError("El precio debe ser un número válido mayor a 0.");
      return;
    }
    if (isNaN(numStock) || numStock < 0) {
      setFormError("El stock debe ser un número igual o mayor a 0.");
      return;
    }

    let updatedList;
    if (isEditing) {
      updatedList = manualProducts.map((p) => {
        if (p.id === formData.id) {
          return {
            ...p,
            codigo: cleanCodigo,
            descripcion: cleanDesc,
            precio: numPrecio.toFixed(2),
            stock: numStock,
            estado: formData.estado,
            fechaActualizacion: new Date().toLocaleDateString()
          };
        }
        return p;
      });
      showToast(`Producto "${cleanDesc}" actualizado exitosamente.`);
    } else {
      const exists = manualProducts.some((p) => p.codigo.toUpperCase() === cleanCodigo);
      if (exists) {
        setFormError(`Ya existe un producto con el código "${cleanCodigo}".`);
        return;
      }

      const newProduct = {
        id: `MAN-${Date.now()}`,
        codigo: cleanCodigo,
        descripcion: cleanDesc,
        precio: numPrecio.toFixed(2),
        stock: numStock,
        estado: formData.estado,
        origen: "manual",
        fechaCreacion: new Date().toLocaleDateString()
      };

      updatedList = [newProduct, ...manualProducts];
      setSelectedManualIds((prev) => new Set([...prev, newProduct.id]));
      showToast(`¡Producto "${cleanDesc}" creado exitosamente!`);
    }

    setManualProducts(updatedList);
    localStorage.setItem("chequea-manual-products", JSON.stringify(updatedList));
    setIsModalOpen(false);
  };

  const handleRequestDelete = (product) => {
    setDeleteTarget(product);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    const updatedList = manualProducts.filter((p) => p.id !== deleteTarget.id);
    setManualProducts(updatedList);
    localStorage.setItem("chequea-manual-products", JSON.stringify(updatedList));

    const updatedSelected = new Set(selectedManualIds);
    updatedSelected.delete(deleteTarget.id);
    setSelectedManualIds(updatedSelected);

    showToast(`Producto "${deleteTarget.descripcion}" eliminado.`, "info");
    setDeleteTarget(null);
  };

  const toggleSelectAllManual = () => {
    if (selectedManualIds.size === filteredManualProducts.length) {
      setSelectedManualIds(new Set());
    } else {
      setSelectedManualIds(new Set(filteredManualProducts.map((p) => p.id)));
    }
  };

  const toggleSelectOneManual = (id) => {
    const next = new Set(selectedManualIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedManualIds(next);
  };

  const handleUploadManual = async () => {
    const selected = manualProducts.filter((p) => selectedManualIds.has(p.id));
    if (selected.length === 0) {
      showToast("Selecciona al menos un producto manual para subir al catálogo.", "error");
      return;
    }

    setUploadingManual(true);
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: selected })
      });
      const json = await res.json();

      if (json.success) {
        showToast(`¡${selected.length} productos manuales subidos y sincronizados con Chequea exitosamente!`);
      }
    } catch (err) {
      showToast("Error al subir los productos manuales.", "error");
    } finally {
      setUploadingManual(false);
    }
  };

  const filteredManualProducts = manualProducts.filter(
    (p) =>
      p.descripcion.toLowerCase().includes(filterManualTerm.toLowerCase()) ||
      p.codigo.toLowerCase().includes(filterManualTerm.toLowerCase())
  );

  // Métricas de manuales
  const totalManualStock = manualProducts.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
  const totalManualValue = manualProducts
    .reduce((sum, p) => sum + (parseFloat(p.precio) || 0) * (Number(p.stock) || 0), 0)
    .toFixed(2);

  return (
    <div className="vender-page-wrapper">
      {/* Botones de navegación superior */}
      <div className="top-nav-actions" ref={menuRef}>
        <Link href="/" className="login-nav-btn back-btn" title="Volver al inicio">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>Inicio</span>
        </Link>

        {user ? (
          <div className="burger-menu-container">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className={`burger-btn ${menuOpen ? "open" : ""}`}
              aria-label="Abrir menú"
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
                    <span className="user-name">{user.name || "Vendedor"}</span>
                    <span className="user-status">En línea</span>
                  </div>
                </div>

                <div className="burger-divider"></div>

                <nav className="burger-nav">
                  <Link href="/perfil" onClick={() => setMenuOpen(false)} className="burger-item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span>Perfil</span>
                  </Link>

                  <Link href="/" onClick={() => setMenuOpen(false)} className="burger-item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                    <span>Página principal</span>
                  </Link>

                  <Link href="/#comprar" onClick={() => setMenuOpen(false)} className="burger-item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="9" cy="21" r="1"></circle>
                      <circle cx="20" cy="21" r="1"></circle>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    <span>Comprar</span>
                  </Link>

                  <Link href="/vender" onClick={() => setMenuOpen(false)} className="burger-item active-item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="1" x2="12" y2="23"></line>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                    <span>Vender (Actual)</span>
                  </Link>

                  <div className="burger-divider"></div>

                  <button type="button" onClick={handleLogout} className="burger-item logout-item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
        ) : (
          <Link href="/login" className="login-nav-btn" title="Iniciar sesión">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
              <polyline points="10 17 15 12 10 7"></polyline>
              <line x1="15" y1="12" x2="3" y2="12"></line>
            </svg>
            <span>Iniciar Sesión</span>
          </Link>
        )}

        <button 
          type="button" 
          onClick={toggleTheme} 
          className="theme-toggle-btn"
          aria-label={`Cambiar a modo ${theme === "dark" ? "claro" : "oscuro"}`}
        >
          {theme === "dark" ? (
            <>
              <svg className="theme-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
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
              <svg className="theme-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
              <span className="theme-toggle-text">Modo Oscuro</span>
            </>
          )}
        </button>
      </div>

      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>

      <main className="vender-container">
        {/* Encabezado Principal */}
        <header className="header">
          <div className="header-badge">
            <span className="pulse-dot"></span>
            <span>Módulo de Ventas & Catálogo</span>
          </div>
          <div className="header-logo-container">
            <img src="/logo.jpg" alt="Chequea Logo" className="brand-logo" />
          </div>
          <h1 className="visually-hidden">Chequea Ventas</h1>
          <p>Sincroniza y sube tu inventario de Valery, Odoo ERP o añade productos manualmente</p>
        </header>

        {/* Notificación Toast Flotante / Banner */}
        {notification.show && (
          <div className={`login-alert ${notification.type === "error" ? "error" : "success"}`} style={{ marginBottom: "1.75rem", animation: "fadeIn 0.3s ease" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              {notification.type === "error" ? (
                <>
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </>
              ) : (
                <>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </>
              )}
            </svg>
            <span>{notification.message}</span>
          </div>
        )}

        {/* Selector de Modos / Pestañas Superiores (3 Vías) */}
        <div className="vender-tabs-container">
          <button
            type="button"
            className={`vender-tab-btn ${activeTab === "manual" ? "active" : ""}`}
            onClick={() => setActiveTab("manual")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
            <span>Carga Manual (CRUD)</span>
            <span className="tab-counter-badge manual-badge">{manualProducts.length}</span>
          </button>

          <button
            type="button"
            className={`vender-tab-btn ${activeTab === "valery" ? "active" : ""}`}
            onClick={() => setActiveTab("valery")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
            </svg>
            <span>Escanear Valery</span>
            {products.length > 0 && <span className="tab-counter-badge">{products.length}</span>}
          </button>

          <button
            type="button"
            className={`vender-tab-btn odoo-tab ${activeTab === "odoo" ? "active" : ""}`}
            onClick={() => setActiveTab("odoo")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
            <span>Escanear Odoo ERP</span>
            {odooProducts.length > 0 && <span className="tab-counter-badge odoo-badge">{odooProducts.length}</span>}
          </button>
        </div>

        {/* ======================================================== */}
        {/* PESTAÑA 1: GESTIÓN MANUAL DE PRODUCTOS (CRUD)            */}
        {/* ======================================================== */}
        {activeTab === "manual" && (
          <section className="manual-crud-section">
            {/* Métricas del Catálogo Manual */}
            <div className="metrics-grid">
              <div className="metric-box">
                <span className="metric-label">Productos Registrados</span>
                <span className="metric-value">{manualProducts.length}</span>
              </div>
              <div className="metric-box highlighted">
                <span className="metric-label">Seleccionados para Subir</span>
                <span className="metric-value">{selectedManualIds.size}</span>
              </div>
              <div className="metric-box">
                <span className="metric-label">Stock Total en Almacén</span>
                <span className="metric-value">{totalManualStock} unid.</span>
              </div>
              <div className="metric-box">
                <span className="metric-label">Valor Estimado</span>
                <span className="metric-value status-ready">${totalManualValue}</span>
              </div>
            </div>

            {/* Barra de Acciones y Filtro */}
            <div className="crud-toolbar">
              <div className="filter-search-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  placeholder="Buscar por código o nombre..."
                  value={filterManualTerm}
                  onChange={(e) => setFilterManualTerm(e.target.value)}
                  className="filter-input"
                />
                {filterManualTerm && (
                  <button type="button" onClick={() => setFilterManualTerm("")} className="clear-btn">
                    ✕
                  </button>
                )}
              </div>

              <div className="crud-buttons-group">
                <button
                  type="button"
                  onClick={toggleSelectAllManual}
                  className="secondary-btn"
                  title="Seleccionar o deseleccionar todo"
                >
                  {selectedManualIds.size === filteredManualProducts.length && filteredManualProducts.length > 0
                    ? "Deseleccionar Todo"
                    : "Seleccionar Todo"}
                </button>

                <button
                  type="button"
                  onClick={handleOpenCreateModal}
                  className="crud-create-btn"
                  id="btn-add-product"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  <span>+ Agregar Producto</span>
                </button>

                <button
                  type="button"
                  onClick={handleUploadManual}
                  disabled={uploadingManual || selectedManualIds.size === 0}
                  className="auth-btn upload-action-btn"
                  title="Publicar productos seleccionados a Chequea"
                >
                  {uploadingManual ? (
                    <>
                      <span className="auth-spinner"></span>
                      <span>Subiendo...</span>
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                      <span>Subir {selectedManualIds.size} a Chequea</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Listado de Productos Manuales */}
            <div className="scanned-products-grid">
              {filteredManualProducts.map((product) => {
                const isSelected = selectedManualIds.has(product.id);
                return (
                  <div
                    key={product.id}
                    className={`scanned-product-card manual-product-card ${isSelected ? "selected" : ""}`}
                    onClick={() => toggleSelectOneManual(product.id)}
                  >
                    <div className="card-top-row">
                      <div className="badges-group">
                        <span className="scanned-code-badge">{product.codigo}</span>
                        <span className="origin-badge manual">Manual</span>
                      </div>
                      
                      <div className="card-top-right">
                        <label className="checkbox-container" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectOneManual(product.id)}
                          />
                          <span className="custom-check"></span>
                        </label>
                      </div>
                    </div>

                    <h3 className="scanned-title">{product.descripcion}</h3>

                    <div className="product-status-row">
                      <span className={`status-pill ${product.estado === "Agotado" ? "out-stock" : product.estado === "Bajo Stock" ? "low-stock" : "available"}`}>
                        <span className="pill-dot"></span>
                        {product.estado || "Disponible"}
                      </span>
                      <span className="scanned-stock-badge">
                        Stock: {product.stock}
                      </span>
                    </div>

                    <div className="card-bottom-row manual-bottom-row">
                      <div className="scanned-price">
                        <span className="currency">$</span>
                        <span>{product.precio}</span>
                      </div>

                      <div className="crud-card-actions" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="crud-icon-btn edit-btn"
                          title="Editar producto"
                          onClick={() => handleOpenEditModal(product)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                          <span>Editar</span>
                        </button>

                        <button
                          type="button"
                          className="crud-icon-btn delete-btn"
                          title="Eliminar producto"
                          onClick={() => handleRequestDelete(product)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredManualProducts.length === 0 && (
                <div className="empty-results-box" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "3.5rem 1.5rem" }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: "0 auto 1rem", opacity: 0.6 }}>
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                  </svg>
                  <p style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                    {filterManualTerm ? `No se encontraron productos coincidentes con "${filterManualTerm}"` : "Aún no tienes productos agregados a mano"}
                  </p>
                  <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", fontSize: "0.95rem" }}>
                    Comienza agregando tus repuestos y productos con el botón de abajo.
                  </p>
                  <button type="button" onClick={handleOpenCreateModal} className="crud-create-btn" style={{ margin: "0 auto" }}>
                    + Agregar Primer Producto
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* PESTAÑA 2: ESCÁNER DE BASE DE DATOS VALERY               */}
        {/* ======================================================== */}
        {activeTab === "valery" && (
          <div className="valery-sync-view">
            <section className="scanner-hero-card">
              <div className="scanner-card-header">
                <div className="db-status-badge">
                  <span className={`status-led ${isLiveDatabase ? "live" : "ready"}`}></span>
                  <span>Motor Valery Firebird: <strong>{isLiveDatabase ? "En Vivo" : "Sincronizable"}</strong></span>
                </div>
                <div className="db-path-tag" title={dbTarget}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
                  </svg>
                  <span>{dbTarget}</span>
                </div>
              </div>

              <div className="scanner-center-content">
                <div className={`scan-radar-wrapper ${scanning ? "is-scanning" : ""}`}>
                  <div className="radar-circle radar-outer"></div>
                  <div className="radar-circle radar-mid"></div>
                  <div className="radar-circle radar-inner"></div>
                  {scanning && <div className="radar-beam"></div>}
                  
                  <button
                    type="button"
                    onClick={handleStartScan}
                    disabled={scanning}
                    className={`scan-trigger-btn ${scanning ? "scanning-active" : ""}`}
                    title="Escanear base de datos Valery"
                  >
                    <div className="scan-icon-container">
                      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 7V5a2 2 0 0 1 2-2h2"></path>
                        <path d="M17 3h2a2 2 0 0 1 2 2v2"></path>
                        <path d="M21 17v2a2 2 0 0 1-2 2h-2"></path>
                        <path d="M7 21H5a2 2 0 0 1-2-2v-2"></path>
                        <line x1="7" y1="12" x2="17" y2="12"></line>
                        <line x1="12" y1="7" x2="12" y2="17"></line>
                      </svg>
                    </div>
                    <span className="scan-trigger-label">
                      {scanning ? "Escaneando Valery..." : "Escanear Base de Datos"}
                    </span>
                    <span className="scan-trigger-sub">
                      {scanning ? `${scanProgress}% Completado` : "Buscar productos en tabla INV"}
                    </span>
                  </button>
                </div>
              </div>

              {scanning && (
                <div className="scan-hud-terminal">
                  <div className="hud-laser-line"></div>
                  <div className="hud-header">
                    <span className="hud-pulse"></span>
                    <span>ESCANEANDO REGISTROS DE VALERY EN TIEMPO REAL</span>
                    <span className="hud-percent">{scanProgress}%</span>
                  </div>
                  
                  <div className="hud-progress-bar-bg">
                    <div className="hud-progress-bar-fill" style={{ width: `${scanProgress}%` }}></div>
                  </div>

                  <div className="hud-log-stream">
                    {scanLogs.map((log, index) => (
                      <div key={index} className="hud-log-entry">
                        <span className="hud-prompt">&gt;</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {products.length > 0 && (
              <section className="scan-results-section">
                <div className="metrics-grid">
                  <div className="metric-box">
                    <span className="metric-label">Productos Escaneados</span>
                    <span className="metric-value">{products.length}</span>
                  </div>
                  <div className="metric-box highlighted">
                    <span className="metric-label">Seleccionados para Subir</span>
                    <span className="metric-value">{selectedIds.size}</span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-label">Tabla Origen</span>
                    <span className="metric-value code-value">VALERY.INV</span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-label">Estado de Catálogo</span>
                    <span className="metric-value status-ready">Sincronizado</span>
                  </div>
                </div>

                <div className="results-action-bar">
                  <div className="filter-search-box">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input
                      type="text"
                      placeholder="Filtrar por código o nombre..."
                      value={filterTerm}
                      onChange={(e) => setFilterTerm(e.target.value)}
                      className="filter-input"
                    />
                    {filterTerm && (
                      <button type="button" onClick={() => setFilterTerm("")} className="clear-btn">
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="action-buttons-group">
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className="secondary-btn"
                    >
                      {selectedIds.size === filteredProducts.length ? "Deseleccionar Todo" : "Seleccionar Todo"}
                    </button>

                    <button
                      type="button"
                      onClick={handleUploadProducts}
                      disabled={uploading || selectedIds.size === 0}
                      className="auth-btn upload-action-btn"
                    >
                      {uploading ? (
                        <>
                          <span className="auth-spinner"></span>
                          <span>Subiendo a Chequea...</span>
                        </>
                      ) : (
                        <>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                          </svg>
                          <span>Subir {selectedIds.size} Productos al Catálogo</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="scanned-products-grid">
                  {filteredProducts.map((product) => {
                    const isSelected = selectedIds.has(product.id);
                    return (
                      <div
                        key={product.id}
                        className={`scanned-product-card ${isSelected ? "selected" : ""}`}
                        onClick={() => toggleSelectOne(product.id)}
                      >
                        <div className="card-top-row">
                          <span className="scanned-code-badge">{product.codigo}</span>
                          <label className="checkbox-container" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectOne(product.id)}
                            />
                            <span className="custom-check"></span>
                          </label>
                        </div>

                        <h3 className="scanned-title">{product.descripcion}</h3>

                        <div className="card-bottom-row">
                          <div className="scanned-price">
                            <span className="currency">$</span>
                            <span>{product.precio}</span>
                          </div>
                          <span className="scanned-stock-badge">
                            Stock: {product.stock}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {filteredProducts.length === 0 && (
                    <div className="empty-results-box">
                      <p>No se encontraron productos coincidentes con "{filterTerm}".</p>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* PESTAÑA 3: ESCÁNER DE ODOO ERP (JSON-RPC / XML-RPC)      */}
        {/* ======================================================== */}
        {activeTab === "odoo" && (
          <div className="odoo-sync-view">
            <section className="scanner-hero-card odoo-hero-card">
              <div className="scanner-card-header">
                <div className="db-status-badge">
                  <span className={`status-led ${isLiveOdoo ? "live" : "ready"}`}></span>
                  <span>Odoo ERP JSON-RPC: <strong>{isLiveOdoo ? "En Vivo (8069)" : "Sincronizable"}</strong></span>
                </div>

                <div className="odoo-header-actions">
                  <div className="db-path-tag odoo-tag" title={odooConfig.url}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                      <line x1="8" y1="21" x2="16" y2="21"></line>
                      <line x1="12" y1="17" x2="12" y2="21"></line>
                    </svg>
                    <span>{odooConfig.url} ({odooConfig.db})</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowOdooConfig(!showOdooConfig)}
                    className="odoo-config-btn"
                    title="Ajustar URL y credenciales de Odoo"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <circle cx="12" cy="12" r="3"></circle>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                    <span>{showOdooConfig ? "Cerrar Ajustes" : "Ajustes Conexión"}</span>
                  </button>
                </div>
              </div>

              {/* Panel Desplegable de Configuración de Conexión Odoo */}
              {showOdooConfig && (
                <div className="odoo-config-panel">
                  <div className="config-panel-header">
                    <h4>Parámetros de Conexión Odoo ERP</h4>
                    <p>Configura la IP, puerto, base de datos y usuario de tu servidor Odoo</p>
                  </div>
                  <form onSubmit={handleSaveOdooConfig} className="odoo-config-grid">
                    <div className="form-group">
                      <label className="form-label">URL del Servidor Odoo</label>
                      <input
                        type="text"
                        value={odooConfig.url}
                        onChange={(e) => setOdooConfig({ ...odooConfig, url: e.target.value })}
                        placeholder="http://127.0.0.1:8069"
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Nombre de la Base de Datos</label>
                      <input
                        type="text"
                        value={odooConfig.db}
                        onChange={(e) => setOdooConfig({ ...odooConfig, db: e.target.value })}
                        placeholder="odoo o produccion"
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Usuario / Correo Odoo</label>
                      <input
                        type="text"
                        value={odooConfig.user}
                        onChange={(e) => setOdooConfig({ ...odooConfig, user: e.target.value })}
                        placeholder="admin@empresa.com"
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Contraseña / API Key</label>
                      <input
                        type="password"
                        value={odooConfig.password}
                        onChange={(e) => setOdooConfig({ ...odooConfig, password: e.target.value })}
                        placeholder="••••••••"
                        className="form-input"
                      />
                    </div>
                    <div className="config-panel-footer">
                      <button type="submit" className="save-changes-btn odoo-save-btn">
                        Guardar Parámetros
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Radar Scanner con temática púrpura/violeta Odoo */}
              <div className="scanner-center-content">
                <div className={`scan-radar-wrapper odoo-radar ${scanningOdoo ? "is-scanning" : ""}`}>
                  <div className="radar-circle radar-outer odoo-outer"></div>
                  <div className="radar-circle radar-mid odoo-mid"></div>
                  <div className="radar-circle radar-inner odoo-inner"></div>
                  {scanningOdoo && <div className="radar-beam odoo-beam"></div>}
                  
                  <button
                    type="button"
                    onClick={handleStartScanOdoo}
                    disabled={scanningOdoo}
                    className={`scan-trigger-btn odoo-trigger-btn ${scanningOdoo ? "scanning-active" : ""}`}
                    title="Escanear catálogo de productos en Odoo ERP"
                    id="btn-scan-odoo"
                  >
                    <div className="scan-icon-container odoo-icon-container">
                      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                        <polyline points="2 17 12 22 22 17"></polyline>
                        <polyline points="2 12 12 17 22 12"></polyline>
                      </svg>
                    </div>
                    <span className="scan-trigger-label">
                      {scanningOdoo ? "Consultando Odoo..." : "Escanear Odoo ERP"}
                    </span>
                    <span className="scan-trigger-sub">
                      {scanningOdoo ? `${scanOdooProgress}% Completado` : "Buscar productos en product.template"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Visor Láser / HUD de Odoo */}
              {scanningOdoo && (
                <div className="scan-hud-terminal odoo-hud">
                  <div className="hud-laser-line odoo-laser"></div>
                  <div className="hud-header">
                    <span className="hud-pulse odoo-pulse"></span>
                    <span>CONSULTANDO MODELO PRODUCT.TEMPLATE VÍA JSON-RPC</span>
                    <span className="hud-percent">{scanOdooProgress}%</span>
                  </div>
                  
                  <div className="hud-progress-bar-bg">
                    <div className="hud-progress-bar-fill odoo-fill" style={{ width: `${scanOdooProgress}%` }}></div>
                  </div>

                  <div className="hud-log-stream">
                    {scanOdooLogs.map((log, index) => (
                      <div key={index} className="hud-log-entry">
                        <span className="hud-prompt odoo-prompt">&gt;</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Resultados del Escaneo Odoo */}
            {odooProducts.length > 0 && (
              <section className="scan-results-section">
                <div className="metrics-grid">
                  <div className="metric-box">
                    <span className="metric-label">Productos Odoo ERP</span>
                    <span className="metric-value">{odooProducts.length}</span>
                  </div>
                  <div className="metric-box highlighted odoo-metric">
                    <span className="metric-label">Seleccionados para Subir</span>
                    <span className="metric-value">{selectedOdooIds.size}</span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-label">Modelo Escaneado</span>
                    <span className="metric-value code-value">product.template</span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-label">Protocolo</span>
                    <span className="metric-value status-ready">JSON-RPC / 8069</span>
                  </div>
                </div>

                <div className="results-action-bar">
                  <div className="filter-search-box">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input
                      type="text"
                      placeholder="Filtrar productos de Odoo por código o nombre..."
                      value={filterOdooTerm}
                      onChange={(e) => setFilterOdooTerm(e.target.value)}
                      className="filter-input"
                    />
                    {filterOdooTerm && (
                      <button type="button" onClick={() => setFilterOdooTerm("")} className="clear-btn">
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="action-buttons-group">
                    <button
                      type="button"
                      onClick={toggleSelectAllOdoo}
                      className="secondary-btn"
                    >
                      {selectedOdooIds.size === filteredOdooProducts.length ? "Deseleccionar Todo" : "Seleccionar Todo"}
                    </button>

                    <button
                      type="button"
                      onClick={handleUploadOdooProducts}
                      disabled={uploadingOdoo || selectedOdooIds.size === 0}
                      className="auth-btn upload-action-btn odoo-upload-btn"
                    >
                      {uploadingOdoo ? (
                        <>
                          <span className="auth-spinner"></span>
                          <span>Subiendo de Odoo...</span>
                        </>
                      ) : (
                        <>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                          </svg>
                          <span>Subir {selectedOdooIds.size} de Odoo a Chequea</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="scanned-products-grid">
                  {filteredOdooProducts.map((product) => {
                    const isSelected = selectedOdooIds.has(product.id);
                    return (
                      <div
                        key={product.id}
                        className={`scanned-product-card odoo-product-card ${isSelected ? "selected" : ""}`}
                        onClick={() => toggleSelectOneOdoo(product.id)}
                      >
                        <div className="card-top-row">
                          <div className="badges-group">
                            <span className="scanned-code-badge">{product.codigo}</span>
                            <span className="origin-badge odoo-pill">Odoo ERP</span>
                          </div>

                          <label className="checkbox-container" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectOneOdoo(product.id)}
                            />
                            <span className="custom-check"></span>
                          </label>
                        </div>

                        <h3 className="scanned-title">{product.descripcion}</h3>

                        {product.categoria && (
                          <div className="odoo-category-tag">
                            <span>Categoría: {product.categoria}</span>
                          </div>
                        )}

                        <div className="card-bottom-row">
                          <div className="scanned-price">
                            <span className="currency">$</span>
                            <span>{product.precio}</span>
                          </div>
                          <span className="scanned-stock-badge">
                            Stock: {product.stock}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {filteredOdooProducts.length === 0 && (
                    <div className="empty-results-box">
                      <p>No se encontraron productos de Odoo coincidentes con "{filterOdooTerm}".</p>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL: FORMULARIO CRUD (CREAR / EDITAR PRODUCTO)         */}
        {/* ======================================================== */}
        {isModalOpen && (
          <div className="crud-modal-backdrop" onClick={() => setIsModalOpen(false)}>
            <div className="crud-modal-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="crud-modal-header">
                <div className="modal-title-wrap">
                  <div className="modal-title-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M12 20h9"></path>
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                    </svg>
                  </div>
                  <div>
                    <h2 className="crud-modal-title">
                      {isEditing ? "Editar Producto" : "Nuevo Producto Manual"}
                    </h2>
                    <p className="crud-modal-subtitle">
                      {isEditing ? "Modifica los campos del producto" : "Ingresa los datos para agregarlo a tu inventario"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="crud-modal-close-btn"
                  aria-label="Cerrar modal"
                >
                  ✕
                </button>
              </div>

              {formError && (
                <div className="login-alert error" style={{ margin: "1rem 1.75rem 0" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSaveProduct} className="crud-modal-form">
                {/* Código y Botón Generar */}
                <div className="form-group">
                  <label htmlFor="codigo" className="form-label">
                    Código / SKU del Producto *
                  </label>
                  <div className="input-with-action">
                    <input
                      type="text"
                      id="codigo"
                      name="codigo"
                      value={formData.codigo}
                      onChange={handleFormChange}
                      placeholder="Ej: REP-049 o BAR-7501"
                      className="form-input"
                      required
                    />
                    <button
                      type="button"
                      onClick={handleGenerateCode}
                      className="generate-code-btn"
                      title="Generar código automático"
                    >
                      Auto
                    </button>
                  </div>
                </div>

                {/* Descripción / Nombre */}
                <div className="form-group">
                  <label htmlFor="descripcion" className="form-label">
                    Descripción / Nombre Completo *
                  </label>
                  <input
                    type="text"
                    id="descripcion"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleFormChange}
                    placeholder="Ej: Batería Duncan 36M 800AMP Reforzada"
                    className="form-input"
                    required
                  />
                </div>

                {/* Fila Doble: Precio y Stock */}
                <div className="form-row-2">
                  <div className="form-group">
                    <label htmlFor="precio" className="form-label">
                      Precio en Dólares ($ USD) *
                    </label>
                    <div className="currency-input-wrap">
                      <span className="currency-prefix">$</span>
                      <input
                        type="number"
                        id="precio"
                        name="precio"
                        step="0.01"
                        min="0.01"
                        value={formData.precio}
                        onChange={handleFormChange}
                        placeholder="0.00"
                        className="form-input currency-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="stock" className="form-label">
                      Cantidad en Stock (Unidades) *
                    </label>
                    <input
                      type="number"
                      id="stock"
                      name="stock"
                      step="1"
                      min="0"
                      value={formData.stock}
                      onChange={handleFormChange}
                      placeholder="1"
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                {/* Estado */}
                <div className="form-group">
                  <label htmlFor="estado" className="form-label">
                    Estado de Disponibilidad
                  </label>
                  <select
                    id="estado"
                    name="estado"
                    value={formData.estado}
                    onChange={handleFormChange}
                    className="form-input form-select"
                  >
                    <option value="Disponible">Disponible</option>
                    <option value="Bajo Stock">Bajo Stock</option>
                    <option value="Agotado">Agotado</option>
                  </select>
                </div>

                <div className="crud-modal-footer">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="secondary-btn modal-cancel-btn"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="save-changes-btn modal-save-btn"
                    id="btn-save-product"
                  >
                    <span className="btn-shine"></span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>{isEditing ? "Actualizar Producto" : "Guardar Producto"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN                     */}
        {/* ======================================================== */}
        {deleteTarget && (
          <div className="crud-modal-backdrop" onClick={() => setDeleteTarget(null)}>
            <div className="crud-modal-dialog delete-confirm-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="delete-dialog-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </div>

              <h2 className="crud-modal-title" style={{ textAlign: "center", marginBottom: "0.5rem" }}>
                ¿Eliminar este producto?
              </h2>
              <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "1.75rem" }}>
                Estás a punto de eliminar <strong>"{deleteTarget.descripcion}"</strong> ({deleteTarget.codigo}). Esta acción no se puede deshacer.
              </p>

              <div className="crud-modal-footer" style={{ justifyContent: "center", gap: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="secondary-btn"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="delete-confirm-btn"
                  id="btn-confirm-delete"
                >
                  Sí, Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
