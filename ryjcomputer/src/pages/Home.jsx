import React, { useState } from "react";
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

/** Botón que solo se anima cuando se presiona (si usas animate-press-once en tu CSS) */
function PressButton({ className = "", onClick, children, ...props }) {
  const [kick, setKick] = React.useState(false);
  return (
    <button
      {...props}
      className={`${className} ${kick ? "animate-press-once" : ""}`}
      onClick={(e) => {
        setKick(false);
        void e.currentTarget.offsetWidth;
        setKick(true);
        onClick?.(e);
      }}
      onAnimationEnd={() => setKick(false)}
    >
      {children}
    </button>
  );
}

// Tarjeta producto/servicio (muestra imagen si existe)
function Card({ item, add, navigate }) {
  const isService = item.kind === "service";
  const price = isService ? (item.price ?? item.priceFrom ?? 0) : item.price;

  return (
    <div className="border rounded-2xl p-4 hover:shadow-md transition">
      <div className="h-36 bg-zinc-100 rounded-xl grid place-items-center mb-3 overflow-hidden">
        {item.thumb ? (
          <img
            src={item.thumb}
            alt={item.title}
            className="max-h-36 object-contain p-2"
            loading="lazy"
          />
        ) : (
          <span className="text-[10px] text-zinc-500">IMG</span>
        )}
      </div>

      <h3 className="font-semibold min-h-[3rem] text-sm line-clamp-2">{item.title}</h3>

      <p className="mt-2 text-brand font-bold">{formatPEN(price)}</p>
      <PressButton
        className="mt-3 w-full btn-brand btn-brand-animated btn-press text-sm focus-brand"
        onClick={() =>
          add({
            id: item.id,
            title: item.title,
            price,
            category: isService ? "Servicios" : item.category,
            thumb: item.thumb ?? null,
          })
        }
      >
        Añadir al carrito
      </PressButton>

      {/* Enlace secundario opcional para servicios */}
      {/* {isService && (
        <button
          className="mt-2 w-full btn-outline text-sm hover:bg-zinc-50"
          onClick={() =>
            navigate(`/?${item.section || "mantenimiento"}=${encodeURIComponent(item.target || "Laptops")}`)
          }
        >
          Ver servicio
        </button>
      )} */}
    </div>
  );
}

/** Sección de destacados con flechas (muestra 3 por vez) */
function FeaturedRow({ title, items, add, navigate }) {
  const [start, setStart] = useState(0);
  const VISIBLE = 3;
  const total = items.length;

  if (!total) return null;

  const prev = () => setStart((s) => (s - 1 + total) % total);
  const next = () => setStart((s) => (s + 1) % total);

  const windowItems = [];
  for (let i = 0; i < Math.min(VISIBLE, total); i++) {
    windowItems.push(items[(start + i) % total]);
  }

  const disabled = total <= VISIBLE;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{title}</h2>
        {/* Si prefieres flechas junto al título, descomenta esto y comenta las flechas absolutas de abajo
        <div className="flex gap-2">
          <button aria-label="Anterior destacados" onClick={prev}
            className={`btn-nav ${disabled ? "btn-nav--disabled" : ""}`}>
            <svg width="18" height="18" fill="none" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
          </button>
          <button aria-label="Siguiente destacados" onClick={next}
            className={`btn-nav ${disabled ? "btn-nav--disabled" : ""}`}>
            <svg width="18" height="18" fill="none" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>
        */}
      </div>

      <div className="relative">
        {/* Grid de tarjetas */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {windowItems.map((it) => (
            <Card key={it.id} item={it} add={add} navigate={navigate} />
          ))}
        </div>

        {/* Flecha izquierda tipo anuncio, pero morada */}
        <button
          aria-label="Anterior destacados"
          onClick={prev}
          className={`btn-nav absolute -left-3 md:-left-10 top-1/2 -translate-y-1/2 ${disabled ? "btn-nav--disabled" : ""}`}
        >
          <svg width="20" height="20" fill="none" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Flecha derecha */}
        <button
          aria-label="Siguiente destacados"
          onClick={next}
          className={`btn-nav absolute -right-3 md:-right-10 top-1/2 -translate-y-1/2 ${disabled ? "btn-nav--disabled" : ""}`}
        >
          <svg width="20" height="20" fill="none" strokeWidth="2" viewBox="0 0 24 24">
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

  // Carrusel grande
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
          <button
            className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-8 h-8 flex items-center justify-center z-10 cursor-pointer"
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
            className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-8 h-8 flex items-center justify-center z-10 cursor-pointer"
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
                className={`block w-2 h-2 rounded-full ${
                  i === index ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Video: full width en móvil, lateral en desktop */}
        <div
          className="
            w-full md:w-[260px]
            flex-shrink-0
            rounded-xl overflow-hidden
            min-h-[180px] md:min-h-[340px]
            flex items-center justify-center
            bg-black
          "
        >
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

      {/* Destacado principal (mix productos + servicios) -> 3 visibles + flechas */}
      <FeaturedRow title="Destacado principal" items={featuredMain} add={add} navigate={navigate} />

      {/* Destacados por tipo (3 visibles + flechas) */}
      {["Laptops", "Impresoras", "Accesorios"].map((cat) => {
        const items = featuredBy(cat);
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {list.map((p) => (
            <Card key={p.id} item={p} add={add} navigate={navigate} />
          ))}
        </div>
      </section>

      {/* Información de Mantenimiento / Reparación */}
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
