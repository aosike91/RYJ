import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { formatPEN } from "../lib/money.js";

export default function MiniCartDrawer({ open, onClose }) {
  const { items, remove, subtotal } = useCart();
  const navigate = useNavigate();

  return (
    <div className={`fixed inset-0 ${open ? "pointer-events-auto" : "pointer-events-none"} z-[70]`}>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/35 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />

      {/* Panel */}
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

        {/* Lista */}
        <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-172px)]">
          {items.length === 0 && (
            <p className="text-sm text-zinc-500">Tu carrito está vacío.</p>
          )}

          {items.map((it) => (
            <div key={it.id} className="flex gap-3 border-b pb-3">
              {/* Imagen heredada del producto seleccionado */}
              <div className="h-14 w-20 bg-zinc-100 rounded overflow-hidden grid place-items-center">
                {it.thumb ? (
                  <img src={it.thumb} alt={it.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] text-zinc-500">IMG</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm line-clamp-2">{it.title}</p>
                <p className="text-xs text-[var(--brand-teal)] mt-1">
                  {it.qty ?? 1} × {formatPEN(it.price)}
                </p>
              </div>

              <button
                className="text-zinc-400 hover:text-zinc-600 cursor-pointer"
                onClick={() => remove(it.id)}
                title="Quitar"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 space-y-3 border-t bg-white/95">
          <div className="flex items-center justify-between text-sm">
            <span>Subtotal:</span>
            <span className="font-semibold">{formatPEN(subtotal)}</span>
          </div>

          <div className="flex gap-3">
            {/* VER CARRITO – estilo distinto (outline morado) */}
            <button
              className="flex-1 border border-[var(--brand-purple)] text-[var(--brand-purple)]
                         rounded-lg px-3 py-2 text-sm hover:bg-[color-mix(in_oklab,var(--brand-purple)_12%,white)]
                         cursor-pointer"
              onClick={() => {
                onClose();
                navigate("/carrito");
              }}
            >
              VER CARRITO
            </button>

            {/* FINALIZAR – botón de marca lleno + animación */}
            <button
              className="flex-1 btn-brand btn-brand-animated btn-press rounded-lg px-3 py-2 text-sm cursor-pointer"
              onClick={() => {
                onClose();
                navigate("/venta");
              }}
            >
              FINALIZAR COMPRA
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
