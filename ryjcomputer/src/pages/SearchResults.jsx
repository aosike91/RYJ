import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { formatPEN } from "../lib/money.js";
import { getImageUrl } from "../lib/api.js";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

// Componente Card (mismo que en Home)
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
          {isAdmin && item.outOfStock && (
            <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded font-semibold">
              Fuera de Stock
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
  const auth = useAuth();
  
  const query = searchParams.get("q") || "";
  const [allProducts, setAllProducts] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = auth?.user?.role === "admin";

  // Estados para filtros
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [sortBy, setSortBy] = useState("relevancia"); // relevancia, precio-asc, precio-desc, a-z, z-a

  // Obtener todas las categorías únicas de los productos
  const getAllCategories = () => {
    const cats = new Set();
    allProducts.forEach(p => {
      const pCats = Array.isArray(p.categories) ? p.categories : (p.category ? [p.category] : []);
      pCats.forEach(cat => cats.add(cat));
    });
    return Array.from(cats).sort();
  };

  // Cargar productos
  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch(`${API_BASE}/products`);
        const data = await res.json();
        const availableProducts = isAdmin ? data : data.filter(p => !p.outOfStock);
        setAllProducts(availableProducts);
      } catch (err) {
        console.error("Error cargando productos:", err);
      }
    }
    loadProducts();
  }, []);

  // Filtrar y ordenar
  useEffect(() => {
    let filtered = allProducts;

    // Buscar por query
    if (query.trim()) {
      const q = query.toLowerCase();
      const byName = filtered.filter(p => p.title?.toLowerCase().includes(q));
      const byCategory = filtered.filter(p => {
        const cats = Array.isArray(p.categories) ? p.categories : (p.category ? [p.category] : []);
        return cats.some(cat => cat.toLowerCase().includes(q));
      });
      filtered = [...new Map([...byName, ...byCategory].map(p => [p.id, p])).values()];
    }

    // Filtrar por categorías
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(p => {
        const pCats = Array.isArray(p.categories) ? p.categories : (p.category ? [p.category] : []);
        return selectedCategories.some(selectedCat => pCats.includes(selectedCat));
      });
    }

    // Filtrar por rango de precio
    filtered = filtered.filter(p => {
      const price = p.price || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Ordenar
    const sorted = [...filtered];
    switch (sortBy) {
      case "precio-asc":
        sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "precio-desc":
        sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "a-z":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "z-a":
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
      // relevancia es el orden por defecto
      default:
        break;
    }

    setResults(sorted);
    setLoading(false);
  }, [query, allProducts, selectedCategories, priceRange, sortBy]);

  const allCategories = getAllCategories();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="text-xl">Cargando...</div>
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar de filtros */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-50 rounded-lg p-4 space-y-6">
            {/* Ordenamiento */}
            <div>
              <h3 className="font-semibold text-sm mb-3">Ordenar por</h3>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm"
              >
                <option value="relevancia">Relevancia</option>
                <option value="precio-asc">Precio: Menor a Mayor</option>
                <option value="precio-desc">Precio: Mayor a Menor</option>
                <option value="a-z">A - Z</option>
                <option value="z-a">Z - A</option>
              </select>
            </div>

            {/* Filtro de precio */}
            <div>
              <h3 className="font-semibold text-sm mb-3">Rango de Precio</h3>
              <div className="space-y-4">
                <div className="relative pt-6 pb-2">
                  {/* Track visual con colores */}
                  <div
                    className="absolute top-[22px] h-2 rounded-lg pointer-events-none"
                    style={{
                      left: 0,
                      width: `${(priceRange[0] / 100000) * 100}%`,
                      backgroundColor: "#d1d5db",
                    }}
                  />
                  <div
                    className="absolute top-[22px] h-2 rounded-lg pointer-events-none"
                    style={{
                      left: `${(priceRange[0] / 100000) * 100}%`,
                      width: `${((priceRange[1] - priceRange[0]) / 100000) * 100}%`,
                      backgroundColor: "#2563eb",
                    }}
                  />
                  <div
                    className="absolute top-[22px] h-2 rounded-lg pointer-events-none"
                    style={{
                      left: `${(priceRange[1] / 100000) * 100}%`,
                      width: `${(1 - priceRange[1] / 100000) * 100}%`,
                      backgroundColor: "#d1d5db",
                    }}
                  />

                  {/* Inputs range superpuestos */}
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="100000"
                      value={priceRange[0]}
                      onChange={(e) => {
                        const newMin = parseInt(e.target.value);
                        if (newMin <= priceRange[1]) {
                          setPriceRange([newMin, priceRange[1]]);
                        }
                      }}
                      className="absolute w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer pointer-events-none"
                      style={{
                        zIndex: priceRange[0] > priceRange[1] - 5000 ? 5 : 3,
                      }}
                    />
                    <input
                      type="range"
                      min="0"
                      max="100000"
                      value={priceRange[1]}
                      onChange={(e) => {
                        const newMax = parseInt(e.target.value);
                        if (newMax >= priceRange[0]) {
                          setPriceRange([priceRange[0], newMax]);
                        }
                      }}
                      className="absolute w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer pointer-events-none"
                      style={{
                        zIndex: priceRange[1] < priceRange[0] + 5000 ? 3 : 5,
                      }}
                    />
                  </div>

                  <style>{`
                    input[type='range'] {
                      -webkit-appearance: none;
                      appearance: none;
                      width: 100%;
                      cursor: pointer;
                    }
                    
                    input[type='range']::-webkit-slider-thumb {
                      -webkit-appearance: none;
                      appearance: none;
                      width: 24px;
                      height: 24px;
                      border-radius: 50%;
                      background: #1e40af;
                      cursor: pointer;
                      border: 3px solid white;
                      box-shadow: 0 2px 6px rgba(0,0,0,0.25);
                      pointer-events: auto;
                    }
                    
                    input[type='range']::-webkit-slider-runnable-track {
                      background: transparent;
                      border: none;
                    }
                    
                    input[type='range']::-moz-range-thumb {
                      width: 24px;
                      height: 24px;
                      border-radius: 50%;
                      background: #1e40af;
                      cursor: pointer;
                      border: 3px solid white;
                      box-shadow: 0 2px 6px rgba(0,0,0,0.25);
                      pointer-events: auto;
                    }
                    
                    input[type='range']::-moz-range-track {
                      background: transparent;
                      border: none;
                    }
                  `}</style>
                </div>
                <div className="flex items-center justify-center text-center">
                  <span className="text-sm font-semibold text-zinc-800">
                    S/ {priceRange[0].toLocaleString()} - S/ {priceRange[1].toLocaleString()}
                  </span>
                </div>
                <button
                  className="w-full px-3 py-2 text-sm font-medium bg-zinc-800 text-white rounded-md hover:bg-zinc-700 transition"
                >
                  Filtrar
                </button>
              </div>
            </div>

            {/* Filtro de categorías */}
            {allCategories.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm mb-3">Categorías</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {allCategories.map((cat) => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCategories([...selectedCategories, cat]);
                          } else {
                            setSelectedCategories(selectedCategories.filter(c => c !== cat));
                          }
                        }}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-sm text-zinc-700">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Limpiar filtros */}
            {(selectedCategories.length > 0 || sortBy !== "relevancia" || priceRange[1] !== 100000) && (
              <button
                onClick={() => {
                  setSelectedCategories([]);
                  setSortBy("relevancia");
                  setPriceRange([0, 100000]);
                }}
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-md hover:bg-zinc-100 transition"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Resultados */}
        <div className="lg:col-span-3">
          {results.length === 0 && query ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-xl font-semibold mb-2">No se encontraron productos</h2>
              <p className="text-zinc-600 mb-6">
                Intenta con otros términos de búsqueda o ajusta los filtros
              </p>
              <button
                onClick={() => navigate("/")}
                className="px-6 py-2 bg-brand-purple text-white rounded-lg hover:opacity-90"
              >
                Volver al inicio
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {results.map((product) => (
                <Card key={product.id} item={product} add={add} navigate={navigate} isAdmin={isAdmin} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
