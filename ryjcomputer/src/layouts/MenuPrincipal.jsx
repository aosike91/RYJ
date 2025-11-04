import React, { useEffect, useRef, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { CATEGORIES, MANTENIMIENTO, REPARACION } from "../data/catalog.js";
import Dropdown from "../components/Dropdown.jsx";
import LogoButton from "../components/LogoButton.jsx";
import MiniCartDrawer from "../components/MiniCartDrawer.jsx";
import Logo from "../assets/Logo.png";

/* --------- Utils: animación del badge al cambiar el contador --------- */

function useBadgeBump(value) {
  const [cls, setCls] = useState("");
  const prev = useRef(value);

  useEffect(() => {
    if (prev.current !== value) {
      setCls("badge-pop badge-ring");     // aplica animaciones
      const t = setTimeout(() => setCls(""), 450); // coincide con cart-ring
      prev.current = value;
      return () => clearTimeout(t);
    }
  }, [value]);

  return cls;
}

/* --------- FAB del carrito (flotante) --------- */
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
      {/* Ícono carrito (SVG inline para poder tintarlo con currentColor) */}
      <svg width="24" height="24" viewBox="0 0 24 24" className="pointer-events-none" fill="currentColor">
        <path fillRule="evenodd" clipRule="evenodd"
          d="M5.79166 2H1V4H4.2184L6.9872 16.6776H7V17H20V16.7519L22.1932 7.09095L22.5308 6H6.6552L6.08485 3.38852L5.79166 2ZM19.9869 8H7.092L8.62081 15H18.3978L19.9869 8Z"/>
        <path d="M10 22C11.1046 22 12 21.1046 12 20C12 18.8954 11.1046 18 10 18C8.89543 18 8 18.8954 8 20C8 21.1046 8.89543 22 10 22Z"/>
        <path d="M19 20C19 21.1046 18.1046 22 17 22C15.8954 22 15 21.1046 15 20C15 18.8954 15.8954 18 17 18C18.1046 18 19 18.8954 19 20Z"/>
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

export default function MenuPrincipal() {
  const { count } = useCart();
  const navigate = useNavigate();
  const [drawer, setDrawer] = useState(false);

  // Mostrar/ocultar FAB según scroll (cuando el top bar NO está visible)
  const topBarRef = useRef(null);
  const [fabVisible, setFabVisible] = useState(false); // target de visibilidad
  const [fabRender, setFabRender] = useState(false);   // montado en DOM
  const [fabLeaving, setFabLeaving] = useState(false); // animando salida

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
      setFabRender(true);      // monta y hace “zoom in”
      setFabLeaving(false);
    } else if (fabRender) {
      setFabLeaving(true);     // “zoom out”
      const t = setTimeout(() => {
        setFabRender(false);   // desmonta tras la animación
        setFabLeaving(false);
      }, 200);
      return () => clearTimeout(t);
    }
  }, [fabVisible, fabRender]);

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* Top utility bar */}
      <div ref={topBarRef} className="w-full border-b border-zinc-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between text-sm">
          {/* Logo */}
          <div className="flex-shrink-0 cursor-pointer">
            <LogoButton />
          </div>

          {/* Búsqueda */}
          <div className="flex-1 flex justify-center px-4">
            <form className="w-full max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Búsqueda en catálogo"
                  className="w-full border border-zinc-300 rounded-lg py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-brand"
                  tabIndex={-1}
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="7" />
                    <line x1="16.5" y1="16.5" x2="21" y2="21" />
                  </svg>
                </button>
              </div>
            </form>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <button
              className="font-semibold text-zinc-900 hover:text-[var(--brand-purple)] transition-colors flex items-center gap-1 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              onClick={() => navigate("/login")}
            >
              <span className="icon-user" />
              Inicio de sesión
            </button>
            <span className="text-zinc-300">|</span>
            <button
              className="font-semibold text-zinc-900 hover:text-[var(--brand-purple)] transition-colors flex items-center gap-1 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              onClick={() => setDrawer(true)}
            >
              <span className="icon-cart" />
              Carrito ({count})
            </button>
          </div>
        </div>
      </div>

      {/* Sticky menu */}
      <div
        className="sticky top-0 z-50 text-white backdrop-blur supports-[backdrop-filter]:bg-[color-mix(in_oklab,var(--brand-purple)_90%,transparent)] border-y border-zinc-200 shadow-sm"
        style={{ background: "linear-gradient(50deg, var(--brand-purple) 0%, #0b91ffff 100%)" }}
      >
        <div className="max-w-6xl mx-auto px-2 md:px-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center">
              <Dropdown
                label="Categorías"
                items={CATEGORIES}
                onSelect={(name) => navigate(`/?categoria=${encodeURIComponent(name)}`)}
              />
              <Dropdown
                label="Mantenimiento"
                items={MANTENIMIENTO}
                onSelect={(name) => navigate(`/?mantenimiento=${encodeURIComponent(name)}`)}
              />
              <Dropdown
                label="Reparación"
                items={REPARACION}
                onSelect={(name) => navigate(`/?reparacion=${encodeURIComponent(name)}`)}
              />
            </div>
            <div className="flex items-center divide-x divide-zinc-200">
              <button className="px-4 py-3 text-lg font-medium hover:bg-[#005499ff] transition-colors" onClick={() => navigate("/terminos")}>
                Términos
              </button>
              <button className="px-4 py-3 text-lg font-medium hover:bg-[#005499ff] transition-colors" onClick={() => navigate("/pagos")}>
                Medios de Pago
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Body */}
      <main className="pt-1 md:pt-1 pb-8 md:pb-10 space-y-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-zinc-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-10 grid gap-10 md:grid-cols-3 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="text-2xl font-extrabold">
              <img src={Logo} alt="Logo R y J Computer" className="h-50 md:h-30" />
            </div>
            <p className="text-sm text-zinc-600">¿Tienes alguna pregunta? Llámanos o escríbenos.</p>
            <div className="space-y-1 text-sm">
              <div>907 232 869</div>
              <div>947 276 680</div>
            </div>
            <div className="pt-4">
              <button
                onClick={() => navigate("/reclamaciones")}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 px-4 py-2 hover:bg-zinc-50"
              >
                <span role="img" aria-label="book">📘</span>
                <span>Libro de Reclamaciones</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">COMPAÑÍA</h3>
            <ul className="space-y-2 text-sm text-zinc-700">
              <li className="hover:underline cursor-pointer" onClick={() => navigate("/quienes")}>¿Quiénes somos?</li>
              <li className="hover:underline cursor-pointer" onClick={() => navigate("/tienda")}>Tienda</li>
              <li className="hover:underline cursor-pointer" onClick={() => navigate("/contacto")}>Contáctanos</li>
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
              <li className="hover:underline cursor-pointer" onClick={() => navigate("/faq")}>Preguntas Frecuentes</li>
              <li className="hover:underline cursor-pointer" onClick={() => navigate("/terminos")}>Términos condiciones</li>
              <li className="hover:underline cursor-pointer" onClick={() => navigate("/privacidad")}>Políticas de Privacidad</li>
              <li className="hover:underline cursor-pointer" onClick={() => navigate("/servicio")}>Servicio al cliente</li>
              <li className="hover:underline cursor-pointer" onClick={() => navigate("/envios")}>Delivery y envíos</li>
              <li className="hover:underline cursor-pointer" onClick={() => navigate("/garantias")}>Garantías y devoluciones</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-200">
          <div className="max-w-6xl mx-auto px-4 py-6 text-xs text-zinc-500 flex items-center justify-between">
            <p>© {new Date().getFullYear()} R y J Computer. Todos los derechos reservados.</p>
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

      {/* FAB del carrito (solo cuando el header no es visible y el drawer está cerrado) */}
      {fabRender && !drawer && (
        <FloatingCartButton
          count={count}
          onClick={() => setDrawer(true)}
          className={fabLeaving ? "fab-out" : "fab-in"}
        />
      )}
      
    </div>
  );
}
