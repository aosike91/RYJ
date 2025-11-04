import React from "react";
import { useCart } from "../context/CartContext.jsx";
import { formatPEN } from "../lib/money.js";

export default function Venta() {
  const { subtotal } = useCart();

  return (
    <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-[1fr_380px] gap-8">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Checkout</h2>

        <div className="border rounded-2xl p-4 space-y-4">
          <h3 className="font-semibold">Datos del comprador</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <input className="border rounded-lg px-3 py-2" placeholder="Nombre y Apellidos" />
            <input className="border rounded-lg px-3 py-2" placeholder="DNI" />
            <input className="border rounded-lg px-3 py-2" placeholder="Correo" />
            <input className="border rounded-lg px-3 py-2" placeholder="Celular" />
          </div>
        </div>

        <div className="border rounded-2xl p-4 space-y-4">
          <h3 className="font-semibold">Entrega</h3>
          <div className="flex flex-col sm:flex-row gap-2">
            <label className="flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer">
              <input type="radio" name="entrega" defaultChecked />
              <span>Recojo en tienda</span>
            </label>
            <label className="flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer">
              <input type="radio" name="entrega" />
              <span>Envío a domicilio</span>
            </label>
          </div>
          <input className="border rounded-lg px-3 py-2 w-full" placeholder="Dirección (si aplica)" />
        </div>

        <div className="border rounded-2xl p-4 space-y-4">
          <h3 className="font-semibold">Pago</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer">
              <input type="radio" name="pago" defaultChecked />
              <span>Tarjeta</span>
            </label>
            <label className="flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer">
              <input type="radio" name="pago" />
              <span>Yape/Plin</span>
            </label>
          </div>
          <input className="border rounded-lg px-3 py-2 w-full" placeholder="Notas del pedido (opcional)" />
          <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2">
            Pagar ahora
          </button>
        </div>
      </div>

      <div className="border rounded-2xl p-4 h-fit">
        <h3 className="font-bold mb-4">Resumen</h3>
        <div className="flex items-center justify-between py-2 text-sm">
          <span>Subtotal</span>
          <span className="font-semibold">{formatPEN(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between py-2 text-sm border-t">
          <span>Total</span>
          <span className="font-semibold">{formatPEN(subtotal)}</span>
        </div>
      </div>
    </div>
  );
}
