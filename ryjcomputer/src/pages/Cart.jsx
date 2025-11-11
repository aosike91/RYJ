import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { formatPEN } from "../lib/money.js";

export default function Cart() {
  const { items, setQty, remove, clear, subtotal } = useCart();
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto px-4">
      <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Carrito de Compras</h2>

      <div className="grid lg:grid-cols-[1fr_360px] gap-4 md:gap-8">
        <div className="border rounded-2xl p-3 md:p-4">
          {items.length === 0 ? (
            <p className="text-sm text-zinc-600">No tienes productos. Explora el catálogo.</p>
          ) : (
            <div className="space-y-4 md:space-y-6">
              {items.map((it) => (
                <div key={it.id} className="grid grid-cols-[80px_1fr] md:grid-cols-[100px_1fr_auto_auto] items-center gap-3 md:gap-4 border-b pb-4">
                  <div className="h-16 w-20 md:w-24 bg-zinc-200 grid place-items-center text-[10px] rounded">IMG</div>
                  <div className="grid gap-2">
                    <div>
                      <p className="font-medium text-sm md:text-base">{it.title}</p>
                      <p className="text-sm font-medium text-zinc-900 md:hidden mt-1">{formatPEN(it.price)}</p>
                      <button className="text-xs text-zinc-500 mt-1" onClick={() => remove(it.id)}>
                        Quitar
                      </button>
                    </div>
                    <div className="flex items-center gap-2 md:hidden">
                      <button className="h-8 w-8 border rounded text-sm" onClick={() => setQty(it.id, it.qty - 1)}>
                        -
                      </button>
                      <input
                        className="h-8 w-12 border rounded text-center text-sm"
                        value={it.qty}
                        onChange={(e) => setQty(it.id, parseInt(e.target.value || 1))}
                      />
                      <button className="h-8 w-8 border rounded text-sm" onClick={() => setQty(it.id, it.qty + 1)}>
                        +
                      </button>
                    </div>
                  </div>
                  <div className="text-sm hidden md:block">{formatPEN(it.price)}</div>
                  <div className="hidden md:flex items-center gap-2">
                    <button className="h-8 w-8 border rounded" onClick={() => setQty(it.id, it.qty - 1)}>
                      -
                    </button>
                    <input
                      className="h-8 w-12 border rounded text-center"
                      value={it.qty}
                      onChange={(e) => setQty(it.id, parseInt(e.target.value || 1))}
                    />
                    <button className="h-8 w-8 border rounded" onClick={() => setQty(it.id, it.qty + 1)}>
                      +
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <button className="border rounded-lg px-4 py-2 text-sm md:text-base" onClick={() => navigate("/")}>
                  ← Continuar comprando
                </button>
                <button className="border rounded-lg px-4 py-2 text-sm md:text-base" onClick={clear}>
                  Limpiar carrito
                </button>
              </div>

              <div className="mt-4 md:mt-6">
                <h3 className="font-semibold text-sm md:text-base">Cupón de Descuento</h3>
                <div className="mt-2 flex flex-col sm:flex-row gap-2">
                  <input
                    className="border rounded-lg px-3 py-2 flex-1 text-sm md:text-base"
                    placeholder="Introduce el código de cupón aquí..."
                  />
                  <button className="border rounded-lg px-4 py-2 text-sm md:text-base whitespace-nowrap">
                    Aplicar cupón
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border rounded-2xl p-4 h-fit">
          <h3 className="font-bold mb-4">Carro Totales</h3>
          <div className="flex items-center justify-between py-2 text-sm">
            <span>Subtotal</span>
            <span className="font-semibold">{formatPEN(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between py-2 text-sm border-t">
            <span>Total</span>
            <span className="font-semibold">{formatPEN(subtotal)}</span>
          </div>
          <button
            className="mt-4 w-full btn-dark"
            onClick={() => navigate("/venta")}
          >
            FINALIZAR COMPRA →
          </button>
        </div>
      </div>
    </div>
  );
}
