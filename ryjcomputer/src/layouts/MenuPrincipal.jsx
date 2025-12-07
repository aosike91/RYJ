import React, { useEffect, useRef, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { CATEGORIES, MANTENIMIENTO, REPARACION } from "../data/catalog.js";
import Dropdown from "../components/Dropdown.jsx";
import LogoButton from "../components/LogoButton.jsx";
import MiniCartDrawer from "../components/MiniCartDrawer.jsx";
import { getImageUrl } from "../lib/api.js";
import Logo from "../assets/Logo.png";


/* --------- Animación del badge del carrito --------- */

function useBadgeBump(value) {
  const [cls, setCls] = useState("");
  const prev = useRef(value);

  useEffect(() => {
    if (prev.current !== value) {
      setCls("badge-pop badge-ring");
      const t = setTimeout(() => setCls(""), 450);
      prev.current = value;
      return () => clearTimeout(t);
    }
  }, [value]);

  return cls;
}

/* --------- Botón flotante del carrito --------- */

function FloatingCartButton({ count, onClick, className = "" }) {
  const bumpCls = useBadgeBump(count);

  return (
    <button
      onClick={onClick}
      aria-label="Abrir carrito"
      className={`fixed bottom-6 right-6 z-[70] w-14 h-14 rounded-full bg-[var(--brand-purple)]
                  text-white grid place-items-center shadow-2xl active:scale-95
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-purple)]
                  cursor-pointer ${className}`}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        className="pointer-events-none"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M5.79166 2H1V4H4.2184L6.9872 16.6776H7V17H20V16.7519L22.1932 7.09095L22.5308 6H6.6552L6.08485 3.38852L5.79166 2ZM19.9869 8H7.092L8.62081 15H18.3978L19.9869 8Z"
        />
        <path d="M10 22C11.1046 22 12 21.1046 12 20C12 18.8954 11.1046 18 10 18C8.89543 18 8 18.8954 8 20C8 21.1046 8.89543 22 10 22Z" />
        <path d="M19 20C19 21.1046 18.1046 22 17 22C15.8954 22 15 21.1046 15 20C15 18.8954 15.8954 18 17 18C18.1046 18 19 18.8954 19 20Z" />
      </svg>

      {count > 0 && (
        <span
          className={`absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-600 
                      text-white text-[11px] leading-none grid place-items-center ${bumpCls}`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

/* --------- Layout principal --------- */
import ScrollToTop from "../components/ScrollToTop.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function MenuPrincipal() {
  const { count } = useCart();
  const navigate = useNavigate();
  const [drawer, setDrawer] = useState(false);

  const topBarRef = useRef(null);      // header blanco
  const purpleRef = useRef(null);      // barra morada
  const [navFixed, setNavFixed] = useState(false);
  const [navHeight, setNavHeight] = useState(0);

  // FAB según visibilidad del top bar
  const [fabVisible, setFabVisible] = useState(false);
  const [fabRender, setFabRender] = useState(false);
  const [fabLeaving, setFabLeaving] = useState(false);

  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const auth = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  // Buscador
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef(null);

  // Cerrar resultados al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Buscar productos
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
      const res = await fetch(`${API_BASE}/products`);
      const allProducts = await res.json();

      const q = query.toLowerCase();
      
      // Buscar por nombre
      const byName = allProducts.filter(p => 
        p.title?.toLowerCase().includes(q)
      );

      // Buscar por categorías
      const byCategory = allProducts.filter(p => {
        const cats = Array.isArray(p.categories) ? p.categories : (p.category ? [p.category] : []);
        return cats.some(cat => cat.toLowerCase().includes(q));
      });

      // Combinar y eliminar duplicados
      const combined = [...new Map([...byName, ...byCategory].map(p => [p.id, p])).values()];
      
      setSearchResults(combined.slice(0, 5)); // Máximo 5 resultados
      setShowSearchResults(true);
    } catch (err) {
      console.error("Error buscando:", err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearchResults(false);
      setSearchQuery("");
    }
  };

// Toasts: éxito (cart:add) y error (cart:error)
useEffect(() => {
  const onAdd = (e) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({
      kind: "success",
      title: e.detail?.title ?? "Producto agregado",
      thumb: e.detail?.thumb ?? null,
      message: null,
    });
    toastTimer.current = setTimeout(() => setToast(null), 2000);
  };

  const onError = (e) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({
      kind: "error",
      title: e.detail?.title ?? "No se pudo agregar",
      thumb: null,
      message: e.detail?.message ?? "Error",
    });
    toastTimer.current = setTimeout(() => setToast(null), 1700);
  };

  window.addEventListener("cart:add", onAdd);
  window.addEventListener("cart:error", onError);
  return () => {
    window.removeEventListener("cart:add", onAdd);
    window.removeEventListener("cart:error", onError);
    if (toastTimer.current) clearTimeout(toastTimer.current);
  };
}, []);

  useEffect(() => {
    if (!topBarRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => setFabVisible(!entry.isIntersecting),
      { root: null, threshold: 0 }
    );
    obs.observe(topBarRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (fabVisible) {
      setFabRender(true);
      setFabLeaving(false);
    } else if (fabRender) {
      setFabLeaving(true);
      const t = setTimeout(() => {
        setFabRender(false);
        setFabLeaving(false);
      }, 200);
      return () => clearTimeout(t);
    }
  }, [fabVisible, fabRender]);

  // Medir altura de la barra morada
  useEffect(() => {
    if (purpleRef.current) {
      setNavHeight(purpleRef.current.offsetHeight);
    }
    const onResize = () => {
      if (purpleRef.current) {
        setNavHeight(purpleRef.current.offsetHeight);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Simular sticky: cuando el header blanco sale de la vista,
  // fijar la barra morada en top:0
  useEffect(() => {
    const handleScroll = () => {
      if (!topBarRef.current) return;
      const rect = topBarRef.current.getBoundingClientRect();
      setNavFixed(rect.bottom <= 0);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-zinc-900 overflow-x-hidden">

      <ScrollToTop />   
      {/* TOP BAR: Logo + búsqueda + acciones */}
      <div
        ref={topBarRef}
        className="w-full border-b border-zinc-200 bg-white"
      >
        <div
          className="
            max-w-6xl mx-auto px-4 py-2
            flex flex-col gap-2
            md:flex-row md:items-center md:gap-4
          "
        >
          {/* Logo */}
          <div className="flex justify-center md:justify-start">
            <LogoButton />
          </div>

          {/* Búsqueda + iconos */}
          <div className="flex items-center gap-3 w-full">
            <form onSubmit={handleSearchSubmit} className="flex-1 relative" ref={searchRef}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => searchQuery && setShowSearchResults(true)}
                  className="
                    w-full border border-zinc-300 rounded-lg
                    py-2 pl-4 pr-10 text-sm
                    focus:outline-none focus:ring-2 focus:ring-brand
                  "
                />
                <button
                  type="submit"
                  className="
                    absolute right-2 top-1/2 -translate-y-1/2
                    text-zinc-500 hover:text-brand
                  "
                  tabIndex={-1}
                >
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <line x1="16.5" y1="16.5" x2="21" y2="21" />
                  </svg>
                </button>
              </div>

              {/* Resultados de búsqueda */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute z-50 mt-2 w-full bg-white border rounded-lg shadow-lg max-h-96 overflow-y-auto">
                  {searchResults.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => {
                        navigate(`/item/${product.id}`);
                        setShowSearchResults(false);
                        setSearchQuery("");
                      }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-zinc-50 text-left border-b last:border-b-0"
                    >
                      <div className="w-16 h-16 bg-zinc-100 rounded overflow-hidden flex-shrink-0">
                        {product.thumb ? (
                          <img src={`${getImageUrl(product.thumb)}?t=${product.updatedAt || product.createdAt || Date.now()}`} alt={product.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs">IMG</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm line-clamp-2">{product.title}</div>
                        <div className="text-xs text-zinc-500 mt-1">
                          {Array.isArray(product.categories) ? product.categories.slice(0, 3).join(", ") : product.category || "Sin categoría"}
                        </div>
                        <div className="text-sm font-semibold text-brand-purple mt-1">S/ {product.price?.toFixed(2)}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {showSearchResults && searchQuery && searchResults.length === 0 && (
                <div className="absolute z-50 mt-2 w-full bg-white border rounded-lg shadow-lg p-4 text-center text-sm text-zinc-500">
                  No se encontraron productos
                </div>
              )}
            </form>

            <div className="flex items-center gap-3">
              {auth?.user ? (
                <>
                  <div className="flex items-center gap-3">
                    <Dropdown
                      label={auth.user.name || auth.user.email}
                      items={auth.user.role === 'admin' ? ['Añadir artículos', 'Cerrar sesión'] : ['Ver perfil', 'Mi wishlist', 'Cerrar sesión']}
                      onSelect={(it) => {
                        if (it === 'Cerrar sesión') {
                          if (confirm('Cerrar sesión?')) {
                            auth.logout();
                            navigate('/');
                          }
                          return;
                        }
                        if (it === 'Ver perfil') return navigate('/profile');
                        if (it === 'Mi wishlist') return navigate('/profile/wishlist');
                        if (it === 'Añadir artículos') return navigate('/admin');
                      }}
                      labelClassName="text-sm font-medium"
                      itemClassName="text-sm"
                    />

                    {auth.user.role === 'admin' && (
                      <button
                        title="Agregar artículo"
                        onClick={() => navigate('/admin')}
                        className="ml-2 inline-flex items-center justify-center w-10 h-10 rounded-full btn-brand-animated text-white shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                      >
                        <span className="text-lg font-bold">+</span>
                      </button>
                    )}

                    <button
                      className="ml-3 font-semibold text-zinc-900 hover:text-[var(--brand-purple)] transition-colors flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                      onClick={() => setDrawer(true)}
                    >
                      <span className="icon-cart" />
                      <span className="hidden md:inline">Carrito</span> ({count})
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <button
                    className="
                      font-semibold text-zinc-900
                      hover:text-[var(--brand-purple)]
                      transition-colors
                      flex items-center gap-1
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-brand
                    "
                    onClick={() => navigate("/login")}
                  >
                    <span className="icon-user" />
                    <span className="hidden md:inline">
                      Inicio de sesión
                    </span>
                  </button>

                  <button
                    className="
                      font-semibold text-zinc-900
                      hover:text-[var(--brand-purple)]
                      transition-colors
                      flex items-center gap-1
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-brand
                    "
                    onClick={() => setDrawer(true)}
                  >
                    <span className="icon-cart" />
                    <span className="hidden md:inline">
                      Carrito
                    </span>{" "}
                    ({count})
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MENÚ MORADO: se vuelve fixed al pasar el top bar */}
      <div
        ref={purpleRef}
        className={`w-full text-white shadow-sm ${
          navFixed ? "fixed top-0 left-0 right-0 z-50" : ""
        }`}
        style={{
          background:
            "linear-gradient(50deg, var(--brand-purple) 0%, #0b91ff 100%)",
        }}
      >
        <div className="max-w-6xl mx-auto px-2 md:px-4">
          <nav
            className="
              flex items-center gap-2
              py-1
              whitespace-nowrap
              overflow-x-auto
            "
          >
            <Dropdown
              label="Categorías"
              items={CATEGORIES}
              onSelect={(name) =>
                navigate(`/?categoria=${encodeURIComponent(name)}`)
              }
            />
            <Dropdown
              label="Mantenimiento"
              items={MANTENIMIENTO}
              onSelect={(name) =>
                navigate(
                  `/?mantenimiento=${encodeURIComponent(name)}`
                )
              }
            />
            <Dropdown
              label="Reparación"
              items={REPARACION}
              onSelect={(name) =>
                navigate(
                  `/?reparacion=${encodeURIComponent(name)}`
                )
              }
            />

            <div className="flex-1" />

            <button
              className="
                px-3 py-2 text-sm md:text-base font-medium
                hover:bg-[#005499] rounded-lg transition-colors
              "
              onClick={() => navigate("/terminos")}
            >
              Términos
            </button>
            <button
              className="
                px-3 py-2 text-sm md:text-base font-medium
                hover:bg-[#005499] rounded-lg transition-colors
              "
              onClick={() => navigate("/pagos")}
            >
              Medios de Pago
            </button>
          </nav>
        </div>
      </div>

      {/* Espaciador para que el contenido no salte cuando la barra es fixed */}
      {navFixed && <div style={{ height: navHeight }} />}

      {/* CONTENIDO */}
      <main className="pt-1 pb-8 md:pb-10 space-y-8">
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="mt-12 border-t border-zinc-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-10 grid gap-10 md:grid-cols-3 lg:grid-cols-4">
          <div className="space-y-4">
            <img
              src={Logo}
              alt="Logo R y J Computer"
              className="h-10 w-auto md:h-12 lg:h-14 object-contain"
            />
            <p className="text-sm text-zinc-600">
              ¿Tienes alguna pregunta? Llámanos o escríbenos.
            </p>
            <div className="space-y-1 text-sm">
              <div>907 232 869</div>
              <div>947 276 680</div>
            </div>
            <div className="pt-4">
              <button
                onClick={() => navigate("/reclamaciones")}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 px-4 py-2 hover:bg-zinc-50"
              >
                <span role="img" aria-label="book">
                  📘
                </span>
                <span>Libro de Reclamaciones</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">COMPAÑÍA</h3>
            <ul className="space-y-2 text-sm text-zinc-700">
              <li
                className="hover:underline cursor-pointer"
                onClick={() => navigate("/quienes")}
              >
                ¿Quiénes somos?
              </li>
              <li
                className="hover:underline cursor-pointer"
                onClick={() => navigate("/tienda")}
              >
                Tienda
              </li>
              <li
                className="hover:underline cursor-pointer"
                onClick={() => navigate("/contacto")}
              >
                Contáctanos
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">DIRECCIÓN</h3>
            <div className="text-sm text-zinc-700 space-y-1">
              <p>Av. Uruguay 319, Cercado de Lima 15001</p>
              <div className="pt-2">
                <p className="font-medium">HORARIOS</p>
                <p>Lunes a Sábado: 10:00 A. M. – 7:00 P. M.</p>
                <p>Domingo: 10:00 A. M. – 4:00 P. M.</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">SERVICIO AL CLIENTE</h3>
            <ul className="space-y-2 text-sm text-zinc-700">
              <li
                className="hover:underline cursor-pointer"
                onClick={() => navigate("/faq")}
              >
                Preguntas Frecuentes
              </li>
              <li
                className="hover:underline cursor-pointer"
                onClick={() => navigate("/terminos")}
              >
                Términos condiciones
              </li>
              <li
                className="hover:underline cursor-pointer"
                onClick={() => navigate("/privacidad")}
              >
                Políticas de Privacidad
              </li>
              <li
                className="hover:underline cursor-pointer"
                onClick={() => navigate("/servicio")}
              >
                Servicio al cliente
              </li>
              <li
                className="hover:underline cursor-pointer"
                onClick={() => navigate("/envios")}
              >
                Delivery y envíos
              </li>
              <li
                className="hover:underline cursor-pointer"
                onClick={() => navigate("/garantias")}
              >
                Garantías y devoluciones
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-200">
          <div className="max-w-6xl mx-auto px-4 py-6 text-xs text-zinc-500 flex items-center justify-between">
            <p>
              © {new Date().getFullYear()} R y J Computer. Todos los derechos reservados.
            </p>
            <div className="flex gap-3">
              <span>VISA</span>
              <span>Mastercard</span>
              <span>Yape</span>
              <span>Plin</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Drawer del carrito */}
      <MiniCartDrawer open={drawer} onClose={() => setDrawer(false)} />

{/* Live region accesible (opcional) */}
<div className="sr-only" aria-live="polite" aria-atomic="true">
  {toast ? `Añadido al carrito: ${toast.title}` : ""}
</div>

{(fabRender || toast) && (
  <div className="fixed right-4 md:right-6 bottom-24 md:bottom-24 z-[80] flex flex-col items-end gap-2 pointer-events-none">
    {/* Toast */}
    {toast && (
      <div
        className={
          toast.kind === "error"
            ? "pointer-events-auto bg-red-600 text-white border border-red-700 shadow-xl rounded-xl px-3 py-2 md:px-4 md:py-3 flex items-center gap-3 animate-[toastIn_.18s_ease-out]"
            : "pointer-events-auto bg-white/95 backdrop-blur border border-zinc-200 shadow-xl rounded-xl px-3 py-2 md:px-4 md:py-3 flex items-center gap-3 animate-[toastIn_.18s_ease-out]"
        }
        role="status"
        aria-live="polite"
      >
        {/* thumb solo para éxito */}
        {toast.kind !== "error" ? (
          toast.thumb ? (
            <img
              src={`${getImageUrl(toast.thumb)}?t=${Date.now()}`}
              alt=""
              className="w-9 h-9 rounded-md object-cover border border-zinc-200"
            />
          ) : (
            <div className="w-9 h-9 rounded-md bg-zinc-200 grid place-items-center text-[10px]">IMG</div>
          )
        ) : null}

        <div className="text-sm">
          <p className={`font-semibold ${toast.kind === "error" ? "text-white" : ""}`}>
            {toast.kind === "error" ? "No disponible" : "Añadido al carrito"}
          </p>
          <p className={`${toast.kind === "error" ? "text-white/90" : "text-zinc-600"} line-clamp-1`}>
            {toast.kind === "error" ? (toast.message ?? "") : (toast.title ?? "")}
          </p>
        </div>

        {toast.kind !== "error" && (
          <button
            onClick={() => setDrawer(true)}
            className="ml-2 md:ml-3 text-xs md:text-sm font-medium text-[var(--brand-purple)] hover:underline"
          >
            Ver carrito
          </button>
        )}
      </div>
    )}

    {/* FAB */}
    {fabRender && !drawer && (
      <FloatingCartButton
        count={count}
        onClick={() => setDrawer(true)}
        className={`${fabLeaving ? "fab-out" : "fab-in"} pointer-events-auto`}
      />
    )}
  </div>
)}

    </div>
  );
}
