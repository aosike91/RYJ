// src/pages/ProductDetail.jsx
import React from "react";
import { useParams } from "react-router-dom";
import * as catalog from "../data/catalog.js";
import { useCart } from "../context/CartContext.jsx";
import { formatPEN } from "../lib/money.js";

/** Normaliza specs a pares [label, value] para dibujar SIEMPRE igual */
function normalizeSpecs(specs) {
  if (!specs) return [];
  if (Array.isArray(specs)) {
    // Intenta separar "Clave: Valor". Si no hay ":", usa la frase como valor.
    return specs.map((s, i) => {
      const t = String(s);
      const idx = t.indexOf(":");
      if (idx > -1) {
        const k = t.slice(0, idx).trim();
        const v = t.slice(idx + 1).trim();
        return [k || `Ítem ${i + 1}`, v || "—"];
      }
      return [`Ítem ${i + 1}`, t];
    });
  }
  if (typeof specs === "string") {
    return [["Detalles", specs.trim() || "—"]];
  }
  // Objeto plano
  return Object.entries(specs).map(([k, v]) => [k, String(v)]);
}

/** Tabla 2 columnas estilo ficha técnica */
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

export default function ProductDetail() {
  const { id } = useParams();
  const { add } = useCart();

  const all = [...(catalog.PRODUCTS || []), ...(catalog.SERVICES || [])];
  const item = all.find((x) => String(x.id) === String(id));

  const [qty, setQty] = React.useState(""); // vacío por defecto

  React.useEffect(() => {
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
    ? (catalog.PRODUCTS || []).filter(p => p.category === item.category && p.id !== item.id).slice(0, 8)
    : [];

  const summaryText = (item.summary && String(item.summary).trim()) || "No hay resumen disponible para este producto";
  const descriptionText = (item.description && String(item.description).trim()) || "No hay descripción disponible para este producto";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header del item */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl bg-zinc-100 min-h-[260px] grid place-items-center overflow-hidden">
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

      {/* Especificaciones SIEMPRE con el mismo estilo */}
      <SpecsTable specs={item.specs} />

      {/* Relacionados */}
      {related.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold">Relacionados</h3>
          <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none]">
            <style>{`.rel-hide::-webkit-scrollbar{display:none}`}</style>
            {related.map((r) => (
              <a
                key={r.id}
                href={`/item/${encodeURIComponent(r.id)}`}
                className="min-w-[180px] rounded-xl border p-3 bg-white hover:shadow-md transition"
              >
                <div className="h-28 bg-zinc-100 rounded-lg grid place-items-center mb-2 overflow-hidden">
                  {r.thumb ? (
                    <img src={r.thumb} alt={r.title} className="max-h-28 object-contain p-2" />
                  ) : (
                    <span className="text-[10px] text-zinc-500">IMG</span>
                  )}
                </div>
                <p className="text-sm font-medium line-clamp-2">{r.title}</p>
                <p className="text-sm font-bold text-brand mt-1">{formatPEN(r.price)}</p>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
