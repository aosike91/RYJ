// src/components/MiniCartDrawer.jsx
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { formatPEN } from "../lib/money.js";
import * as catalog from "../data/catalog.js";

export default function MiniCartDrawer({ open, onClose }) {
  const { items, remove, subtotal, incQty, decQty, setQty } = useCart();
  const navigate = useNavigate();

  // stock por id
  const stockById = useMemo(() => {
    const map = Object.create(null);
    for (const p of (catalog.PRODUCTS || []))
      map[p.id] = typeof p.stock === "number" ? p.stock : 0;
    for (const s of (catalog.SERVICES || []))
      map[s.id] = Infinity;
    return map;
  }, []);

  const clamp = (id, n) => {
    const stock = stockById[id] ?? Infinity;
    if (Number.isNaN(n) || n < 1) return 1;
    return stock === Infinity ? n : Math.min(n, stock);
  };

  const handleManual = (it, raw) => {
    const digits = raw.replace(/[^\d]/g, "");
    if (digits === "") return;
    const target = clamp(it.id, parseInt(digits, 10));
    const stock = stockById[it.id] ?? Infinity;
    if (stock !== Infinity && target > stock) {
      window.dispatchEvent(new CustomEvent("cart:error", {
        detail: { title: it.title, message: `Stock máximo: ${stock}` }
      }));
    }
    setQty?.(it.id, target);
  };

  const svgTrash = (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
      <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
      <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
    </svg>
  );

  return (
    <div className={`fixed inset-0 ${open ? "pointer-events-auto" : "pointer-events-none"} z-[70]`}>
      <div className={`absolute inset-0 bg-black/35 transition-opacity ${open ? "opacity-100" : "opacity-0"}`} onClick={onClose} />
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-sm sm:max-w-md md:w-[360px] bg-white shadow-2xl border-l border-zinc-200
                    transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
        style={{ willChange: "transform" }}
      >
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold">CARRITO DE COMPRAS</h3>
          <button
            className="font-semibold text-zinc-800 hover:text-[var(--brand-purple)] cursor-pointer focus:outline-none"
            onClick={onClose}
            title="Cerrar"
          >
            Cerrar
          </button>
        </div>

        {/* Items */}
        <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-172px)]">
          {items.length === 0 && <p className="text-sm text-zinc-500">Tu carrito está vacío.</p>}

          {items.map((it) => {
            const stock = stockById[it.id] ?? Infinity;
            const qty = it.qty ?? 1;
            const lineTotal = (Number(it.price) || 0) * qty;
            const canDec = qty > 1;
            const canInc = qty < stock;

            return (
              <div key={it.id} className="flex gap-3 border-b pb-3 items-start">
                {/* thumb */}
                <div className="h-14 w-20 bg-zinc-100 rounded overflow-hidden grid place-items-center flex-shrink-0">
                  {it.thumb ? (
                    <img src={it.thumb} alt={it.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-zinc-500">IMG</span>
                  )}
                </div>

                {/* texto + stepper */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm line-clamp-2">{it.title}</p>

                  <div className="mt-2 flex items-center">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => canDec && decQty?.(it.id)}
                        disabled={!canDec}
                        className={`w-8 h-8 rounded-full grid place-items-center text-white font-extrabold
                                    ${canDec ? "bg-[var(--brand-purple)] hover:opacity-90 active:scale-95" : "bg-zinc-300 cursor-not-allowed"}`}
                        aria-label="Disminuir cantidad"
                      >
                        –
                      </button>

                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={qty}
                        onChange={(e) => handleManual(it, e.target.value)}
                        className="w-10 h-8 text-center border rounded-md text-sm"
                        aria-label="Cantidad"
                      />

                      <button
                        type="button"
                        onClick={() => canInc ? incQty?.(it.id) : null}
                        disabled={!canInc}
                        className={`w-8 h-8 rounded-full grid place-items-center text-white font-extrabold
                                    ${canInc ? "bg-[var(--brand-purple)] hover:opacity-90 active:scale-95" : "bg-zinc-300 cursor-not-allowed"}`}
                        aria-label="Aumentar cantidad"
                      >
                        +
                      </button>
                    </div>

                    {/* precio a la derecha con aire */}
                    <strong className="text-sm ml-4 sm:ml-6 md:ml-8 ml-auto whitespace-nowrap">
                      {formatPEN(lineTotal)}
                    </strong>
                  </div>

                  {/* stock + aviso límite */}
                  <div className="mt-1 text-[11px] flex items-center justify-between">
                    <span className="text-zinc-500">
                      Stock: {Number.isFinite(stock) ? stock : "—"}
                    </span>
                    {Number.isFinite(stock) && qty >= stock && (
                      <span className="text-red-600">Límite de stock alcanzado ({stock}).</span>
                    )}
                  </div>
                </div>

                {/* basurita */}
                <button
                  className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-red-600 transition cursor-pointer"
                  onClick={() => remove?.(it.id)}
                  title="Quitar del carrito"
                  aria-label="Quitar del carrito"
                >
                  {svgTrash}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 space-y-3 border-t bg-white/95">
          <div className="flex items-center justify-between text-sm">
            <span>Subtotal:</span>
            <span className="font-semibold">{formatPEN(subtotal)}</span>
          </div>

          <div className="flex gap-3">
            <button
              className="flex-1 border border-[var(--brand-purple)] text-[var(--brand-purple)]
                         rounded-lg px-3 py-2 text-sm hover:bg-[color-mix(in_oklab,var(--brand-purple)_12%,white)]
                         cursor-pointer"
              onClick={() => { onClose(); navigate("/carrito"); }}
            >
              VER CARRITO
            </button>

            <button
              className="flex-1 btn-brand btn-brand-animated btn-press rounded-lg px-3 py-2 text-sm cursor-pointer"
              onClick={() => { onClose(); navigate("/venta"); }}
            >
              FINALIZAR COMPRA
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
