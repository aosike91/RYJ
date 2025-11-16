// src/context/CartContext.jsx
import React, { createContext, useContext, useMemo, useState } from "react";
import * as catalog from "../data/catalog.js";

const CartContext = createContext(null);

function useStockMap() {
  return useMemo(() => {
    const map = Object.create(null);
    for (const p of catalog.PRODUCTS || []) {
      map[p.id] = typeof p.stock === "number" ? p.stock : 0;
    }
    for (const s of catalog.SERVICES || []) {
      map[s.id] = Infinity;
    }
    return map;
  }, []);
}

export function CartProvider({ children }) {
  const stockById = useStockMap();

  // items: [{ id, title, price, thumb, qty }]
  const [items, setItems] = useState([]);

  const findIndex = (id) => items.findIndex((l) => l.id === id);
  const getStock = (id) => (stockById[id] ?? Infinity);

  const clampQty = (id, n) => {
    const stock = getStock(id);
    if (Number.isNaN(n) || n < 1) return 1;
    if (stock === Infinity) return n;
    return Math.min(n, stock);
  };

  const add = (payload, count = 1) => {
    const id = payload.id;
    const price = Number(payload.price) || 0;
    const stock = getStock(id);
    setItems((prev) => {
      const idx = prev.findIndex((l) => l.id === id);
      if (idx >= 0) {
        const curr = prev[idx].qty ?? 1;
        const next = Math.min(curr + count, stock);
        if (next === curr && stock !== Infinity) {
          window.dispatchEvent(new CustomEvent("cart:error", {
            detail: { title: payload.title, message: `Stock máximo: ${stock}` }
          }));
          return prev;
        }
        const copy = prev.slice();
        copy[idx] = { ...copy[idx], qty: next };
        return copy;
      }
      const firstQty = clampQty(id, count);
      if (firstQty < count) {
        window.dispatchEvent(new CustomEvent("cart:error", {
          detail: { title: payload.title, message: `Stock máximo: ${stock}` }
        }));
      }
      return [...prev, { id, title: payload.title, price, thumb: payload.thumb ?? null, qty: firstQty }];
    });
  };

  const incQty = (id) => {
    const stock = getStock(id);
    setItems((prev) =>
      prev.map((l) =>
        l.id !== id
          ? l
          : { ...l, qty: Math.min((l.qty ?? 1) + 1, stock) }
      )
    );
    const it = items.find((x) => x.id === id);
    if (it && (it.qty ?? 1) >= stock && stock !== Infinity) {
      window.dispatchEvent(new CustomEvent("cart:error", {
        detail: { title: it.title, message: `Stock máximo: ${stock}` }
      }));
    }
  };

  const decQty = (id) => {
    setItems((prev) =>
      prev.map((l) =>
        l.id !== id ? l : { ...l, qty: Math.max((l.qty ?? 1) - 1, 1) }
      )
    );
  };

  const setQty = (id, n) => {
    setItems((prev) =>
      prev.map((l) =>
        l.id !== id ? l : { ...l, qty: clampQty(id, Number(n)) }
      )
    );
  };

  const remove = (id) => {
    setItems((prev) => prev.filter((l) => l.id !== id));
  };

  const subtotal = useMemo(
    () => items.reduce((acc, it) => acc + (Number(it.price) || 0) * (it.qty ?? 1), 0),
    [items]
  );

  // cantidad total (para el badge): suma de qty
  const count = useMemo(
    () => items.reduce((acc, it) => acc + (it.qty ?? 1), 0),
    [items]
  );

  const value = {
    items, add, incQty, decQty, setQty, remove,
    subtotal, count,
    getStock, // por si lo quieres en UI
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
