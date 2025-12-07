import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { formatPEN } from "../lib/money.js";
import { getImageUrl } from "../lib/api.js";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

// Componente Card (mismo que en Home)
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
    const n = parseInt(qty, 10) || 1;
    add(item, n);
    setQty("");
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-zinc-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div
        onClick={() => navigate(`/item/${item.id}`)}
        className="cursor-pointer"
      >
        <div className="relative h-48 bg-zinc-100 grid place-items-center overflow-hidden">
          {item.thumb ? (
            <img
              src={`${getImageUrl(item.thumb)}?t=${item.updatedAt || item.createdAt || Date.now()}`}
              alt={item.title}
              className="max-h-full object-contain p-4 transition-transform duration-200 group-hover:scale-105"
            />
          ) : (
            <span className="text-sm text-zinc-400">IMG</span>
          )}
          {out && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
              Agotado
            </div>
          )}
        </div>
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-sm line-clamp-2 min-h-[2.5rem]">
            {item.title}
          </h3>
          <p className="text-xs text-zinc-500 line-clamp-1">
            {Array.isArray(item.categories) ? item.categories.slice(0, 2).join(", ") : item.category || ""}
          </p>
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold text-brand-purple">
              {formatPEN(price)}
            </div>
            {isService ? (
              <span className="text-xs px-2 py-1 rounded bg-emerald-50 text-emerald-700 font-bold">
                Disponible
              </span>
            ) : out ? null : (
              <span className="text-xs text-emerald-600 font-bold">Stock: {stock}</span>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 space-y-2">
        {!isService && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={dec}
              className="w-8 h-8 rounded-full grid place-items-center text-white font-extrabold
                         bg-[var(--brand-purple)] hover:opacity-90 active:scale-95"
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
            />
            <button
              type="button"
              onClick={inc}
              className="w-8 h-8 rounded-full grid place-items-center text-white font-extrabold
                         bg-[var(--brand-purple)] hover:opacity-90 active:scale-95"
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

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { add } = useCart();
  
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function search() {
      if (!query.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      try {
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
        
        setResults(combined);
      } catch (err) {
        console.error("Error buscando:", err);
      } finally {
        setLoading(false);
      }
    }

    search();
  }, [query]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="text-xl">Buscando...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">
          Resultados de búsqueda
        </h1>
        <p className="text-zinc-600">
          {query ? (
            <>
              Mostrando {results.length} resultado{results.length !== 1 ? "s" : ""} para "{query}"
            </>
          ) : (
            "Ingresa un término de búsqueda"
          )}
        </p>
      </div>

      {results.length === 0 && query ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold mb-2">No se encontraron productos</h2>
          <p className="text-zinc-600 mb-6">
            Intenta con otros términos de búsqueda
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-brand-purple text-white rounded-lg hover:opacity-90"
          >
            Volver al inicio
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {results.map((product) => (
            <Card key={product.id} item={product} add={add} navigate={navigate} />
          ))}
        </div>
      )}
    </div>
  );
}
