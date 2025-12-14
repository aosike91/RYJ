import React, { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { formatPEN } from "../lib/money.js";
import { getImageUrl } from "../lib/api.js";
import * as catalog from "../data/catalog.js";

// Carrusel principal (assets)
import Anuncio1 from "../assets/Anuncio1.jpg";
import Anuncio2 from "../assets/Anuncio2.jpg";
import Anuncio3 from "../assets/Anuncio3.jpg";
import LateralVideo from "../assets/Video1.mp4";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
const carouselImages = [Anuncio1, Anuncio2, Anuncio3];

/** Botón con animación de “press” (usa tu animate-press-once) */
function PressButton({ className = "", onClick, children, ...props }) {
  const [kick, setKick] = React.useState(false);
  return (
    <button
      {...props}
      className={`${className} ${kick ? "animate-press-once" : ""}`}
      onClick={(e) => {
        setKick(false);
        void e.currentTarget.offsetWidth; // reflow para reiniciar animación
        setKick(true);
        onClick?.(e);
      }}
      onAnimationEnd={() => setKick(false)}
    >
      {children}
    </button>
  );
}

// Tarjeta producto/servicio con selector de cantidad y validaciones
function Card({ item, add, navigate, isAdmin = false }) {
  const [qty, setQty] = React.useState("");
  const isService = item.kind === "service";
  const price = isService ? (item.price ?? item.priceFrom ?? 0) : item.price;

  const stock = isService ? Infinity : (typeof item.stock === "number" ? item.stock : 0);
  const out = stock <= 0;

  const clamp = (n) => {
    if (Number.isNaN(n)) return "";
    if (n < 1) return "1";
    if (!Number.isFinite(stock)) return String(n);
    return String(Math.min(n, stock));
  };
  const inc = () => {
    if (out) {
      window.dispatchEvent(new CustomEvent("cart:error", {
        detail: { title: item.title, message: "Sin stock disponible." }
      }));
      return;
    }
    const curr = parseInt(qty, 10);
    if (Number.isNaN(curr)) setQty("1");
    else setQty(clamp(curr + 1));
  };
  const dec = () => {
    const curr = parseInt(qty, 10);
    if (Number.isNaN(curr) || curr <= 1) return;
    setQty(String(curr - 1));
  };
  const onManualChange = (e) => {
    const v = e.target.value.replace(/[^\d]/g, "");
    if (v === "") { setQty(""); return; }
    setQty(clamp(parseInt(v, 10)));
  };
  const handleAdd = () => {
    if (out) {
      window.dispatchEvent(new CustomEvent("cart:error", {
        detail: { title: item.title, message: "Este producto está agotado." }
      }));
      return;
    }
    let units = parseInt(qty, 10);
    if (Number.isNaN(units) || units < 1) units = 1;
    if (units > stock) {
      window.dispatchEvent(new CustomEvent("cart:error", {
        detail: { title: item.title, message: `Solo hay ${stock} unidades en stock.` }
      }));
      return;
    }
    const payload = {
      id: item.id,
      title: item.title,
      price,
      category: isService ? "Servicios" : item.category,
      thumb: item.thumb ?? null,
    };
    for (let i = 0; i < units; i++) add(payload);
    window.dispatchEvent(new CustomEvent("cart:add", {
      detail: { title: item.title, thumb: item.thumb ?? null }
    }));
    setQty("");
  };
  const goDetail = () => {
    navigate(`/item/${encodeURIComponent(item.id)}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-zinc-200 overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <div
        onClick={goDetail}
        className="cursor-pointer flex-1 flex flex-col"
      >
        <div className="relative h-48 bg-zinc-100 grid place-items-center overflow-hidden">
          {item.thumb ? (
            <img
              src={`${getImageUrl(item.thumb)}?t=${item.updatedAt || item.createdAt || Date.now()}`}
              alt={item.title}
              className="max-h-full object-contain p-4 transition-transform duration-200 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <span className="text-sm text-zinc-400">IMG</span>
          )}
          {out && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
              Agotado
            </div>
          )}
          {isAdmin && item.outOfStock && (
            <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded font-semibold">
              Fuera de Stock
            </div>
          )}
        </div>
        <div className="p-4 space-y-2 flex-1 flex flex-col">
          <h3 className="font-semibold text-sm line-clamp-2 min-h-[2.5rem]">
            {item.title}
          </h3>
          <p className="text-xs text-zinc-500 line-clamp-1">
            {Array.isArray(item.categories) ? item.categories.slice(0, 2).join(", ") : item.category || ""}
          </p>
          {item.condition && (
            <div className="inline-block">
              <span className={`text-xs px-2 py-1 rounded font-semibold ${
                item.condition === 'nuevo' 
                  ? 'bg-green-100 text-green-800' 
                  : item.condition === 'seminuevo'
                  ? 'bg-blue-100 text-blue-800'
                  : item.condition === 'desegunda'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-purple-100 text-purple-800'
              }`}>
                {item.condition === 'nuevo' && '✓ Nuevo'}
                {item.condition === 'seminuevo' && '✓ Seminuevo'}
                {item.condition === 'desegunda' && '✓ De segunda'}
                {item.condition === 'importada' && '✓ Importada'}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between gap-2 mt-auto flex-wrap">
            <div className="text-xl font-bold text-brand-purple">
              {formatPEN(price)}
            </div>
            {isService ? (
              <span className="text-xs px-2 py-1 rounded bg-emerald-50 text-emerald-700 font-bold">
                Disponible
              </span>
            ) : out ? null : (
              <span className="text-xs text-emerald-600 font-bold whitespace-nowrap">Stock: {stock}</span>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 space-y-2" onClick={(e) => e.stopPropagation()}>
        {!isService && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={dec}
              className="w-8 h-8 rounded-full grid place-items-center text-white font-extrabold
                         bg-[var(--brand-purple)] hover:opacity-90 active:scale-95"
              aria-label="Disminuir cantidad"
            >
              –
            </button>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={qty}
              onChange={onManualChange}
              placeholder=""
              className="w-12 h-8 text-center border rounded-md text-sm"
              aria-label="Cantidad"
            />
            <button
              type="button"
              onClick={inc}
              className="w-8 h-8 rounded-full grid place-items-center text-white font-extrabold
                         bg-[var(--brand-purple)] hover:opacity-90 active:scale-95"
              aria-label="Aumentar cantidad"
            >
              +
            </button>
          </div>
        )}

        <button
          onClick={handleAdd}
          disabled={out}
          className={`w-full py-2 rounded-lg font-medium transition btn-brand-animated text-white ${
            out
              ? "opacity-60 cursor-not-allowed"
              : ""
          }`}
        >
          {out ? "Sin stock" : "Añadir al carrito"}
        </button>
      </div>
    </div>
  );
}




/** Carrusel reutilizable (móvil: swipe; desktop: flechas + scroll suave) */
function FeaturedRow({ title, items, add, navigate, isAdmin = false }) {
  if (!items?.length) return null;

  const trackRef = useRef(null);

  // Oculta scrollbar en navegadores WebKit y Firefox
  // (se inyecta una vez por componente)
  const HideScrollCSS = () => (
    <style>{`
      .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      .hide-scroll::-webkit-scrollbar { display: none; }
    `}</style>
  );

  const scrollByViewport = (dir = 1) => {
    const el = trackRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.95; // ~una “pantalla” del carrusel
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <section className="space-y-4">
      <HideScrollCSS />
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{title}</h2>
        {/* Si quieres flechas junto al título en desktop, descomenta:
        <div className="hidden md:flex gap-2">
          <button className="btn-nav" onClick={() => scrollByViewport(-1)} aria-label="Anterior">
            <svg width="18" height="18" fill="none" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
          </button>
          <button className="btn-nav" onClick={() => scrollByViewport(1)} aria-label="Siguiente">
            <svg width="18" height="18" fill="none" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>
        */}
      </div>

      <div className="relative">
        {/* Pista deslizante */}
        <div
          ref={trackRef}
          className="
            hide-scroll
            flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2
          "
          style={{ scrollSnapType: "x mandatory" }}
        >
          {items.map((it) => (
            <div
              key={it.id}
              className="
                snap-start flex-none
                w-[calc(50%-0.5rem)]
                md:w-[calc(33.333%-0.666rem)]
                xl:w-[calc(25%-0.75rem)]
              "
            >
              <Card item={it} add={add} navigate={navigate} isAdmin={isAdmin} />
            </div>
          ))}
        </div>

        {/* Flechas (solo desktop) */}
{/* Flechas del carrusel de DESTACADOS (solo desktop) */}
<button
  aria-label="Anterior destacados"
  onClick={() => scrollByViewport(-1)}
  className="btn-nav hidden md:flex absolute -left-3 md:-left-10 top-1/2 -translate-y-1/2"
>
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M15 19l-7-7 7-7" />
  </svg>
</button>


<button
  aria-label="Siguiente destacados"
  onClick={() => scrollByViewport(1)}
  className="btn-nav hidden md:flex absolute -right-3 md:-right-10 top-1/2 -translate-y-1/2"
>
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M9 5l7 7-7 7" />
  </svg>
</button>

      </div>
    </section>
  );
}

export default function Home() {
  const { add } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const isAdmin = auth?.user?.role === "admin";

  // Estado para productos del backend
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar productos del backend
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch(`${API_BASE}/products`);
        const data = await res.json();
        
        // Filtrar productos que no están "Fuera de Stock" (a menos que sea admin)
        const filtered = isAdmin ? data : data.filter(p => !p.outOfStock);
        
        // Separar productos y servicios
        const prods = filtered.filter(p => p.kind === 'product' || !p.kind);
        const servs = filtered.filter(p => p.kind === 'service');
        
        setProducts(prods);
        setServices(servs);
      } catch (err) {
        console.error('Error cargando productos:', err);
        // Fallback al catálogo estático
        setProducts(catalog.PRODUCTS || []);
        setServices(catalog.SERVICES || []);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Parámetros de filtro
  const params = new URLSearchParams(location.search);
  const selectedCat = params.get("categoria");
  const selectedMant = params.get("mantenimiento");
  const selectedRep = params.get("reparacion");

  const list = selectedCat ? products.filter((p) => {
    // Buscar en categorías si es array, o en category si es string
    const cats = Array.isArray(p.categories) ? p.categories : (p.category ? [p.category] : []);
    return cats.includes(selectedCat);
  }) : products;

  // Carrusel grande (anuncios)
  const [index, setIndex] = useState(0);
  const prev = () => setIndex((i) => (i === 0 ? carouselImages.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === carouselImages.length - 1 ? 0 : i + 1));

  // Destacados - filtrar productos "Fuera de Stock" (excepto para admins)
  const featuredMain = [...products, ...services].filter((i) => i?.featured);
  const featuredBy = (cat) => products.filter((p) => {
    const cats = Array.isArray(p.categories) ? p.categories : (p.category ? [p.category] : []);
    return cats.includes(cat) && p?.featured;
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-xl">Cargando productos...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-10">
      {/* Carrusel + video lateral */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 pt-4 md:pt-7 items-stretch">
        {/* Carrusel */}
        <div className="flex-1 relative rounded-xl overflow-hidden bg-zinc-900 min-h-[220px] md:min-h-[340px] flex items-center justify-center">
          {/* Flechas ocultas en móvil */}
          {/* Flechas ocultas en móvil */}
<button
  className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-8 h-8 items-center justify-center z-10 cursor-pointer"
  onClick={prev}
  aria-label="Anterior"
>
  <svg width="24" height="24" fill="none" stroke="black" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M15 19l-7-7 7-7" />
  </svg>
</button>

          <div
            className="w-full h-[220px] md:h-[340px] flex items-center justify-center cursor-pointer select-none"
            style={{
              backgroundImage: `url(${carouselImages[index]})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderRadius: "1rem",
              transition: "background-image 0.3s",
            }}
          />
<button
  className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-8 h-8 items-center justify-center z-10 cursor-pointer"
  onClick={next}
  aria-label="Siguiente"
>
  <svg width="24" height="24" fill="none" stroke="black" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M9 5l7 7-7 7" />
  </svg>
</button>
          
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {carouselImages.map((_, i) => (
              <span
                key={i}
                className={`block w-2 h-2 rounded-full ${i === index ? "bg-white" : "bg-white/40"}`}
              />
            ))}
          </div>
        </div>

        {/* Video lateral (full width en móvil) */}
        <div className="w-full md:w-[260px] flex-shrink-0 rounded-xl overflow-hidden min-h-[180px] md:min-h-[340px] flex items-center justify-center bg-black">
          <video
            src={LateralVideo}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          />
        </div>
      </div>

      {/* Destacado principal */}
      <FeaturedRow
        title="Destacado principal"
        items={featuredMain}
        add={add}
        navigate={navigate}
        isAdmin={isAdmin}
      />

      {/* Destacados por tipo */}
      {["Laptop", "Impresoras", "Accesorios"].map((cat) => {
        const items = featuredBy(cat);
        if (!items.length) return null;
        return (
          <FeaturedRow
            key={cat}
            title={`${cat} destacadas`}
            items={items}
            add={add}
            navigate={navigate}
            isAdmin={isAdmin}
          />
        );
      })}

      {/* Catálogo completo/filtrado */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">
          Catálogo {selectedCat ? `— ${selectedCat}` : "destacado"}
        </h2>

        {/* Móvil: carrusel 2-up */}
        <div className="md:hidden -mx-4 px-4">
          <div
            className="
              flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2
              [scrollbar-width:none] [-ms-overflow-style:none]
            "
            style={{ scrollSnapType: "x mandatory" }}
          >
            <style>{`.hide-scroll::-webkit-scrollbar{display:none}`}</style>
            {list.map((p) => (
              <div key={p.id} className="snap-start flex-none w-[calc(50%-0.5rem)]">
                <Card item={p} add={add} navigate={navigate} />
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: grid */}
        <div className="hidden md:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {list.map((p) => (
            <Card key={p.id} item={p} add={add} navigate={navigate} />
          ))}
        </div>
      </section>

      {/* Info mantenimiento / reparación */}
      {selectedMant && (
        <section className="space-y-2">
          <h2 className="text-xl font-bold">Mantenimiento de {selectedMant}</h2>
          <p className="text-zinc-600">
            Diagnóstico, limpieza profunda, cambio de pasta térmica, optimización del sistema,
            respaldo de datos y pruebas de estrés.
          </p>
        </section>
      )}
      {selectedRep && (
        <section className="space-y-2">
          <h2 className="text-xl font-bold">Reparación de {selectedRep}</h2>
          <p className="text-zinc-600">
            Reemplazo de componentes, corrección de fallas eléctricas y de placa,
            reinstalación de sistema y recuperación de información.
          </p>
        </section>
      )}
    </div>
  );
}
