// src/pages/ProductDetail.jsx
import React, { useRef, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as catalog from "../data/catalog.js";
import { useCart } from "../context/CartContext.jsx";
import { formatPEN } from "../lib/money.js";

/* ------------------------- Normalizador de specs ------------------------- */
function normalizeSpecs(specs) {
  if (!specs) return [];
  if (Array.isArray(specs)) {
    return specs.map((s, i) => {
      const t = String(s ?? "");
      const idx = t.indexOf(":");
      if (idx > -1) {
        const k = t.slice(0, idx).trim();
        const v = t.slice(idx + 1).trim();
        return [k || `Ítem ${i + 1}`, v || "—"];
      }
      return [`Ítem ${i + 1}`, t || "—"];
    });
  }
  if (typeof specs === "string") return [["Detalles", specs.trim() || "—"]];
  return Object.entries(specs).map(([k, v]) => [k, String(v)]);
}

/* --------------------- Tabla 2 columnas (ficha técnica) ------------------ */
function SpecsTable({ specs }) {
  const rows = normalizeSpecs(specs);
  if (rows.length === 0) return null;

  const mid = Math.ceil(rows.length / 2);
  const left = rows.slice(0, mid);
  const right = rows.slice(mid);

  const Col = ({ data }) => (
    <dl className="space-y-3">
      {data.map(([k, v], idx) => (
        <div key={idx} className="grid grid-cols-[140px_1fr] gap-3">
          <dt className="text-sm text-zinc-500">{k}</dt>
          <dd className="text-sm font-semibold text-zinc-800">{v}</dd>
        </div>
      ))}
    </dl>
  );

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Especificaciones</h2>
      <div className="bg-zinc-50 rounded-xl p-4 md:p-6">
        <div className="grid md:grid-cols-2 gap-8">
          <Col data={left} />
          <Col data={right} />
        </div>
      </div>
    </section>
  );
}

/* -------- Carrusel de relacionados: 2 en móvil, 3 en md, 4 en lg; flechas visibles en móvil ----- */
function RelatedRow({ items, onOpen }) {
  const trackRef = React.useRef(null);

  const scrollByCards = (dir = 1) => {
    const el = trackRef.current;
    if (!el) return;
    const first = el.querySelector(".rel-item");
    const step = first ? first.getBoundingClientRect().width + 16 : el.clientWidth / 2;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <style>{`
        .rel-track {
          --gap: 16px;
          --cols: 2;                    
          gap: var(--gap);
          -ms-overflow-style: none;      
          scrollbar-width: none;         
          touch-action: pan-x;          
        }
        .rel-track::-webkit-scrollbar { display: none; } /* WebKit */

        /* md: 3 por vista */
        @media (min-width: 768px) { .rel-track { --cols: 3; } }
        /* lg: 4 por vista */
        @media (min-width: 1024px){ .rel-track { --cols: 4; } }

        .rel-item { width: calc((100% - (var(--cols) - 1) * var(--gap)) / var(--cols)); }
      `}</style>

      {/* padding lateral para que no se “corten” los bordes en móvil */}
      <div
        ref={trackRef}
        className="rel-track -mx-3 px-3 flex items-stretch overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {items.map((r) => (
          <div key={r.id} className="rel-item snap-start flex-none">
            <div
              role="button"
              tabIndex={0}
              onClick={() => onOpen?.(r.id)}
              onKeyDown={(e) => (e.key === "Enter" ? onOpen?.(r.id) : null)}
              className="group cursor-pointer select-none rounded-2xl border bg-white p-3 hover:shadow-xl transition
                         h-[320px] md:h-[340px] xl:h-[360px] flex flex-col"
            >
              <div className="h-40 md:h-44 bg-zinc-100 rounded-xl grid place-items-center overflow-hidden">
                {r.thumb ? (
                  <img
                    src={r.thumb}
                    alt={r.title}
                    loading="lazy"
                    className="max-h-full object-contain p-2 transition-transform duration-200 group-hover:scale-[1.06]"
                  />
                ) : (
                  <span className="text-[10px] text-zinc-500">IMG</span>
                )}
              </div>
              <p className="mt-3 text-sm font-medium line-clamp-2 min-h-[3rem]">{r.title}</p>
              <div className="mt-auto" />
              <p className="text-sm font-bold text-brand">{formatPEN(r.price)}</p>
            </div>
          </div>
        ))}
      </div>

<button
  aria-label="Anterior relacionados"
  onClick={() => scrollByCards(-1)}
  className="hidden md:inline-grid place-items-center rounded-full w-9 h-9 text-white
             shadow-sm border transition bg-[var(--brand-purple)]
             border-[color-mix(in_oklab,white_30%,transparent)]
             hover:opacity-95 active:scale-95
             absolute left-1 md:-left-14  top-1/2 -translate-y-1/2 z-10"
>
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15 19l-7-7 7-7" />
  </svg>
</button> 
<button
  aria-label="Siguiente relacionados"
  onClick={() => scrollByCards(1)}
  className="hidden md:inline-grid place-items-center rounded-full w-9 h-9 text-white
             shadow-sm border transition bg-[var(--brand-purple)]
             border-[color-mix(in_oklab,white_30%,transparent)]
             hover:opacity-95 active:scale-95
             absolute right-1 md:-right-14 top-1/2 -translate-y-1/2 z-10"
>
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 5l7 7-7 7" />
  </svg>
</button>
    </div>
  );
}


/* ----------------------------- ProductDetail ----------------------------- */
export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();

  const all = [...(catalog.PRODUCTS || []), ...(catalog.SERVICES || [])];
  const item = all.find((x) => String(x.id) === String(id));

  const [qty, setQty] = useState(""); // vacío por defecto

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  if (!item) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-xl font-bold">Producto no encontrado</h1>
        <p className="text-zinc-600">Verifica el enlace o vuelve al inicio.</p>
      </div>
    );
  }

  const isService = item.kind === "service";
  const price = isService ? (item.price ?? item.priceFrom ?? 0) : item.price;
  const stock = isService ? Infinity : (typeof item.stock === "number" ? item.stock : 0);
  const out = !isService && stock <= 0;

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
    if (Number.isNaN(curr)) return;
    if (curr <= 1) return;
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

    setQty(""); // vuelve a vacío
  };

  const related = !isService && item.category
    ? (catalog.PRODUCTS || []).filter(p => p.category === item.category && p.id !== item.id).slice(0, 12)
    : [];

  const summaryText =
    (item.summary && String(item.summary).trim()) ||
    "No hay resumen disponible para este producto";
  const descriptionText =
    (item.description && String(item.description).trim()) ||
    "No hay descripción disponible para este producto";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header del item */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="relative rounded-xl bg-zinc-100 min-h-[260px] grid place-items-center overflow-hidden">
         

          {item.thumb ? (
            <img src={item.thumb} alt={item.title} className="max-h-[360px] object-contain p-4" />
          ) : (
            <span className="text-xs text-zinc-500">IMG</span>
          )}
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl font-bold">{item.title}</h1>

          <div className="flex items-center gap-3">
            <p className="text-2xl font-extrabold text-brand">{formatPEN(price)}</p>
            {isService ? (
              <span className="text-xs px-2 py-1 rounded bg-emerald-50 text-emerald-700 font-bold">Disponible</span>
            ) : out ? (
              <span className="text-xs px-2 py-1 rounded bg-red-50 text-red-600 font-bold">Agotado</span>
            ) : (
              <span className="text-xs text-emerald-600 font-bold">Stock: {stock}</span>
            )}
          </div>

          {/* Stepper morado */}
          {!isService && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={dec}
                className="w-9 h-9 rounded-full border border-zinc-300 text-white font-extrabold grid place-items-center bg-[var(--brand-purple)] hover:opacity-90 active:scale-95"
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
                className="w-12 h-9 text-center border rounded-md text-sm"
                aria-label="Cantidad"
              />
              <button
                type="button"
                onClick={inc}
                className="w-9 h-9 rounded-full border border-zinc-300 text-white font-extrabold grid place-items-center bg-[var(--brand-purple)] hover:opacity-90 active:scale-95"
                aria-label="Aumentar cantidad"
              >
                +
              </button>
            </div>
          )}

          <button
            onClick={handleAdd}
            className={`btn-brand btn-brand-animated btn-press font-semibold ${out ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            Añadir al carrito
          </button>

          {/* Resumen corto */}
          <p className="text-sm text-zinc-600">{summaryText}</p>
        </div>
      </div>

      {/* Descripción */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Descripción</h2>
        <p className="text-zinc-700 leading-relaxed">{descriptionText}</p>
      </section>

      {/* Especificaciones */}
      <SpecsTable specs={item.specs} />

      {/* Relacionados – carrusel */}
      {related.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold">Relacionados</h3>
          <RelatedRow
            items={related}
            onOpen={(rid) => {
              navigate(`/item/${encodeURIComponent(rid)}`);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </section>
      )}
    </div>
  );
}
