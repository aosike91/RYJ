import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext.jsx";
import MenuPrincipal from "./layouts/MenuPrincipal.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Cart from "./pages/Cart.jsx";
import Venta from "./pages/Venta.jsx";
import Terminos from "./pages/Terminos.jsx";
import Pagos from "./pages/Pagos.jsx";
import Reclamaciones from "./pages/Reclamaciones.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<MenuPrincipal />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="carrito" element={<Cart />} />
            <Route path="venta" element={<Venta />} />
            <Route path="terminos" element={<Terminos />} />
            <Route path="pagos" element={<Pagos />} />
            <Route path="reclamaciones" element={<Reclamaciones />} />
            <Route path="/item/:id" element={<ProductDetail />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}
