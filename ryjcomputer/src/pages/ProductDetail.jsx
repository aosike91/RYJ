// src/pages/ProductDetail.jsx
import React, { useRef, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as catalog from "../data/catalog.js";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { formatPEN } from "../lib/money.js";
import { getImageUrl } from "../lib/api.js";
import AdminArticleForm from "../components/AdminArticleForm.jsx";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

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
function RelatedRow({ items, onOpen, isAdmin = false }) {
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
        {items.map((r) => {
          const stock = r.stock ?? 0;
          const out = stock === 0;
          const isService = !r.stock;
          return (
            <div key={r.id} className="rel-item snap-start flex-none">
              <div
                role="button"
                tabIndex={0}
                onClick={() => onOpen?.(r.id)}
                onKeyDown={(e) => (e.key === "Enter" ? onOpen?.(r.id) : null)}
                className="group cursor-pointer select-none rounded-2xl border border-zinc-200 bg-white hover:shadow-xl transition
                           flex flex-col h-full"
              >
                <div className="h-40 md:h-44 bg-zinc-100 rounded-xl grid place-items-center overflow-hidden">
                  {r.thumb ? (
                    <img
                      src={`${getImageUrl(r.thumb)}?t=${r.updatedAt || r.createdAt || Date.now()}`}
                      alt={r.title}
                      loading="lazy"
                      className="max-h-full object-contain p-2 transition-transform duration-200 group-hover:scale-[1.06]"
                    />
                  ) : (
                    <span className="text-[10px] text-zinc-500">IMG</span>
                  )}
                  {out && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                      Agotado
                    </div>
                  )}
                  {isAdmin && r.outOfStock && (
                    <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded font-semibold">
                      Fuera de Stock
                    </div>
                  )}
                </div>
                <div className="p-3 space-y-2 flex-1 flex flex-col">
                  <h3 className="font-semibold text-sm line-clamp-2 min-h-[2rem]">
                    {r.title}
                  </h3>
                  <p className="text-xs text-zinc-500 line-clamp-1">
                    {Array.isArray(r.categories) ? r.categories.slice(0, 2).join(", ") : r.category || ""}
                  </p>
                  {r.summary && (
                    <p className="text-xs text-zinc-600 line-clamp-2">
                      {r.summary}
                    </p>
                  )}
                  <div className="flex items-center justify-between gap-2 mt-auto flex-wrap">
                    <div className="text-sm font-bold text-brand-purple">
                      {formatPEN(r.price)}
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
            </div>
          );
        })}
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
  const auth = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [qty, setQty] = useState(""); // vacío por defecto
  const [editMode, setEditMode] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Cargar producto del backend
  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`${API_BASE}/products/${id}`);
        if (!res.ok) {
          setItem(null);
          setLoading(false);
          return;
        }
        const data = await res.json();
        setItem(data);

        // Cargar productos relacionados por categorías
        const allRes = await fetch(`${API_BASE}/products`);
        const allProducts = await allRes.json();
        
        const isAdminUser = auth?.user?.role === "admin";
        // Filtrar productos que no están "Fuera de Stock" (a menos que sea admin)
        const availableProducts = isAdminUser ? allProducts : allProducts.filter(p => !p.outOfStock);
        
        const itemCats = Array.isArray(data.categories) ? data.categories : (data.category ? [data.category] : []);
        
        // Función para calcular score de coincidencia
        const calculateScore = (product) => {
          if (product.id === data.id) return -1; // Excluir el producto actual
          
          const pCats = Array.isArray(product.categories) ? product.categories : (product.category ? [product.category] : []);
          
          // Si no hay categorías en común, score = 0
          if (!pCats.some(cat => itemCats.includes(cat))) return 0;
          
          // Contar categorías coincidentes
          const matchingCategories = pCats.filter(cat => itemCats.includes(cat)).length;
          
          // Score base: número de categorías coincidentes (máximo 100 puntos)
          let score = matchingCategories * 10;
          
          // Bonus: si la primera categoría es la misma (supercategoría principal)
          if (itemCats.length > 0 && pCats.length > 0 && itemCats[0] === pCats[0]) {
            score += 50;
          }
          
          return score;
        };
        
        // Buscar productos con categorías similares, calcular score y ordenar
        const related = availableProducts
          .map(p => ({ product: p, score: calculateScore(p) }))
          .filter(item => item.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 6)
          .map(item => item.product);
        
        setRelatedProducts(related);
      } catch (err) {
        console.error("Error cargando producto:", err);
        setItem(null);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProduct();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

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

  const handleDeleteProduct = async () => {
    if (!auth?.token) {
      alert("No tienes permisos para eliminar");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/products/${item.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${auth.token}`,
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }

      alert("Producto eliminado exitosamente");
      setDeleteConfirm(false);
      navigate("/");
    } catch (err) {
      console.error("Error eliminando producto:", err);
      alert("Error al eliminar el producto: " + err.message);
    }
  };

  const handleToggleOutOfStock = async () => {
    if (!auth?.token) {
      alert("No tienes permisos");
      return;
    }

    try {
      const updated = { ...item, outOfStock: !item.outOfStock };
      const res = await fetch(`${API_BASE}/products/${item.id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${auth.token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updated)
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }

      setItem(updated);
      alert(updated.outOfStock ? "Producto marcado como Agotado" : "Producto disponible nuevamente");
    } catch (err) {
      console.error("Error:", err);
      alert("Error al actualizar: " + err.message);
    }
  };

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
            <img src={`${getImageUrl(item.thumb)}?t=${item.updatedAt || item.createdAt || Date.now()}`} alt={item.title} className="max-h-[360px] object-contain p-4" />
          ) : (
            <span className="text-xs text-zinc-500">IMG</span>
          )}
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl font-bold">{item.title}</h1>

          {item.condition && (
            <div className="inline-block">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
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

          <div className="flex items-center gap-3">
            <p className="text-2xl font-extrabold text-brand">{formatPEN(price)}</p>
            {isService ? (
              <span className="text-xs px-2 py-1 rounded bg-emerald-50 text-emerald-700 font-bold">Disponible</span>
            ) : out ? (
              <span className="text-xs px-2 py-1 rounded bg-red-50 text-red-600 font-bold">Agotado</span>
            ) : (
              <span className="text-xs text-emerald-600 font-bold">Stock: {stock}</span>
            )}
            {auth?.user?.role === "admin" && (
              <div className="ml-auto flex gap-2">
                <button
                  onClick={() => handleToggleOutOfStock()}
                  className={`px-4 py-2 rounded font-medium transition text-white ${
                    item.outOfStock
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {item.outOfStock ? "Disponible" : "Agotado"}
                </button>
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded font-medium transition"
                >
                  Editar
                </button>
                <button
                  onClick={() => setDeleteConfirm(true)}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded font-medium transition"
                >
                  Eliminar
                </button>
              </div>
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

      {/* Especificaciones */}
      <SpecsTable specs={item.specs} />

      {/* Descripción */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Descripción</h2>
        <p className="text-zinc-700 leading-relaxed">{descriptionText}</p>
      </section>

      {/* Relacionados – carrusel */}
      {relatedProducts.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold">Relacionados</h3>
          <RelatedRow
            items={relatedProducts}
            onOpen={(rid) => {
              navigate(`/item/${encodeURIComponent(rid)}`);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            isAdmin={auth?.user?.role === "admin"}
          />
        </section>
      )}

      {/* Modal de edición */}
      {editMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 grid place-items-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full my-8 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Editar producto</h2>
              <button
                onClick={() => setEditMode(false)}
                className="text-zinc-500 hover:text-zinc-700 text-2xl"
              >
                ✕
              </button>
            </div>
            <AdminArticleForm
              initial={item}
              onCreate={(updated) => {
                setItem(updated);
                setEditMode(false);
                alert("Producto actualizado exitosamente");
              }}
              token={auth?.token}
              isEdit={true}
            />
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 grid place-items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-2xl font-bold">¿Desea eliminar el producto?</h2>
            <p className="text-zinc-600">
              Esta acción no se puede deshacer. Se eliminará "{item.title}" del catálogo.
            </p>
            <div className="flex gap-3 justify-end pt-4">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 rounded font-medium transition"
              >
                Rechazar
              </button>
              <button
                onClick={handleDeleteProduct}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded font-medium transition"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
