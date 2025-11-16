import React, { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as catalog from "../data/catalog.js";
import { useCart } from "../context/CartContext.jsx";
import { formatPEN } from "../lib/money.js";

// Datos
const PRODUCTS = catalog.PRODUCTS || [];
const SERVICES = catalog.SERVICES || [];

// Carrusel principal (assets)
import Anuncio1 from "../assets/Anuncio1.jpg";
import Anuncio2 from "../assets/Anuncio2.jpg";
import Anuncio3 from "../assets/Anuncio3.jpg";
import LateralVideo from "../assets/Video1.mp4";

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
function Card({ item, add, navigate }) {
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
    <div
      className="group h-full border rounded-2xl p-4 bg-white transition hover:shadow-xl cursor-pointer
                 flex flex-col"
      onClick={goDetail}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" ? goDetail() : null)}
    >
      {/* Imagen (altura fija) */}
      <div className="h-36 bg-zinc-100 rounded-xl grid place-items-center mb-3 overflow-hidden">
        {item.thumb ? (
          <img
            src={item.thumb}
            alt={item.title}
            className="max-h-36 object-contain p-2 transition-transform duration-200 group-hover:scale-[1.06]"
            loading="lazy"
          />
        ) : <span className="text-[10px] text-zinc-500">IMG</span>}
      </div>

      {/* Título (min-height para 2 líneas) */}
      <h3 className="font-semibold min-h-[3rem] text-sm line-clamp-2">{item.title}</h3>

      {/* Precio + stock */}
      <div className="mt-2 flex items-center justify-between">
        <p className="text-brand font-bold">{formatPEN(price)}</p>
        {isService ? (
          <span className="text-xs px-2 py-1 rounded bg-emerald-50 text-emerald-700 font-bold">
            Disponible
          </span>
        ) : out ? (
          <span className="text-xs px-2 py-1 rounded bg-red-50 text-red-600 font-bold">
            Agotado
          </span>
        ) : (
          <span className="text-xs text-emerald-600 font-bold">Stock: {stock}</span>
        )}
      </div>

      {/* Fila reservada para stepper (altura constante) */}
      <div className="mt-3 min-h-[2.5rem] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        {!isService ? (
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
        ) : (
          // placeholder para igualar altura cuando no hay stepper
          <div className="h-8" />
        )}
      </div>

      {/* Botón (queda al final) */}
      <div className="mt-3" onClick={(e) => e.stopPropagation()}>
        <PressButton
          className={`w-full btn-brand btn-brand-animated btn-press text-sm font-semibold
                     ${out ? "opacity-60 cursor-not-allowed" : ""}`}
          onClick={handleAdd}
        >
          Añadir al carrito
        </PressButton>
      </div>
    </div>
  );
}




/** Carrusel reutilizable (móvil: swipe; desktop: flechas + scroll suave) */
function FeaturedRow({ title, items, add, navigate }) {
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
              <Card item={it} add={add} navigate={navigate} />
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

  // Parámetros de filtro
  const params = new URLSearchParams(useLocation().search);
  const selectedCat = params.get("categoria");
  const selectedMant = params.get("mantenimiento");
  const selectedRep = params.get("reparacion");

  const list = selectedCat ? PRODUCTS.filter((p) => p.category === selectedCat) : PRODUCTS;

  // Carrusel grande (anuncios)
  const [index, setIndex] = useState(0);
  const prev = () => setIndex((i) => (i === 0 ? carouselImages.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === carouselImages.length - 1 ? 0 : i + 1));

  // Destacados
  const featuredMain = [...PRODUCTS, ...SERVICES].filter((i) => i?.featured);
  const featuredBy = (cat) => PRODUCTS.filter((p) => p.category === cat && p?.featured);

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
        items={[...PRODUCTS, ...SERVICES].filter((i) => i?.featured)}
        add={add}
        navigate={navigate}
      />

      {/* Destacados por tipo */}
      {["Laptops", "Impresoras", "Accesorios"].map((cat) => {
        const items = PRODUCTS.filter((p) => p.category === cat && p?.featured);
        if (!items.length) return null;
        return (
          <FeaturedRow
            key={cat}
            title={`${cat} destacadas`}
            items={items}
            add={add}
            navigate={navigate}
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
