import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import AdminArticleForm from "../components/AdminArticleForm.jsx";
import { formatPEN } from "../lib/money.js";
import { updateProduct } from "../lib/api.js";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function AdminPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("individual"); // "individual" | "bulk" | "manage"
  const [bulkItems, setBulkItems] = useState([]);
  const [bulkIndex, setBulkIndex] = useState(0);
  const [bulkJson, setBulkJson] = useState("");
  
  // Para gestionar productos
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Protección: solo admin - redirigir al inicio si no es admin
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (!auth?.user || auth.user.role !== "admin") {
        window.location.href = "/";
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [auth?.user?.role]);

  // Cargar productos cuando se abre la pestaña de gestión
  useEffect(() => {
    if (mode === "manage") {
      loadProducts();
    }
  }, [mode]);

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch(`${API_BASE}/products`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Error cargando productos:", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const toggleOutOfStock = async (product) => {
    try {
      const updated = { ...product, outOfStock: !product.outOfStock };
      const res = await updateProduct(product.id, updated, auth?.token);
      if (res && res.ok) {
        setProducts(products.map(p => p.id === product.id ? updated : p));
        alert(updated.outOfStock ? "Producto marcado como Agotado" : "Producto disponible nuevamente");
      } else {
        alert("Error al actualizar: " + (res?.message || JSON.stringify(res)));
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Error al actualizar producto");
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este producto?")) return;
    try {
      const res = await fetch(`${API_BASE}/products/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: auth?.token ? `Bearer ${auth.token}` : undefined,
        },
      });
      if (res.ok) {
        setProducts(products.filter(p => p.id !== productId));
        alert("Producto eliminado");
      } else {
        alert("Error al eliminar");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Error al eliminar producto");
    }
  };

  const handleIndividualCreate = (product) => {
    console.log("Producto creado:", product);
    alert("Producto añadido exitosamente");
  };

  const handleBulkParse = () => {
    try {
      const parsed = JSON.parse(bulkJson);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      setBulkItems(items);
      setBulkIndex(0);
      alert(`${items.length} artículo(s) cargado(s)`);
    } catch (e) {
      alert("Error al parsear JSON: " + e.message);
    }
  };

  const handleBulkNext = (product) => {
    console.log("Producto procesado:", product);
    if (bulkIndex < bulkItems.length - 1) {
      setBulkIndex(bulkIndex + 1);
    } else {
      alert("Todos los artículos procesados");
      setBulkItems([]);
      setBulkIndex(0);
      setBulkJson("");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Panel de Administración</h1>
            <p className="text-zinc-600">Gestiona productos y servicios</p>
          </div>
          <button
            onClick={() => navigate("/profile")}
            className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 rounded-lg transition"
          >
            Ver perfil
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-t-xl border-b">
          <div className="flex">
            <button
              onClick={() => setMode("individual")}
              className={`px-6 py-3 font-medium transition ${
                mode === "individual"
                  ? "bg-white border-b-2 border-brand-purple text-brand-purple"
                  : "bg-zinc-50 text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Añadir individual
            </button>
            <button
              onClick={() => setMode("bulk")}
              className={`px-6 py-3 font-medium transition ${
                mode === "bulk"
                  ? "bg-white border-b-2 border-brand-purple text-brand-purple"
                  : "bg-zinc-50 text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Carga masiva
            </button>
            <button
              onClick={() => setMode("manage")}
              className={`px-6 py-3 font-medium transition ${
                mode === "manage"
                  ? "bg-white border-b-2 border-brand-purple text-brand-purple"
                  : "bg-zinc-50 text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Gestionar
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-b-xl shadow-sm p-6">
          {mode === "individual" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Añadir nuevo producto</h2>
              <AdminArticleForm
                onCreate={handleIndividualCreate}
                token={auth?.token}
              />
            </div>
          )}

          {mode === "bulk" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Carga masiva (JSON)</h2>
              
              {bulkItems.length === 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-zinc-600">
                    Pega un JSON con un array de productos para procesarlos uno por uno:
                  </p>
                  <textarea
                    value={bulkJson}
                    onChange={(e) => setBulkJson(e.target.value)}
                    placeholder='[{"title": "Producto 1", "price": 100, ...}, {...}]'
                    className="w-full h-64 border rounded-lg px-4 py-3 font-mono text-sm"
                  />
                  <button
                    onClick={handleBulkParse}
                    className="px-6 py-2 bg-brand-purple text-white rounded-lg hover:opacity-90 transition"
                  >
                    Cargar JSON
                  </button>
                </div>
              ) : (
                <div>
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                    <p className="font-medium">
                      Procesando {bulkIndex + 1} de {bulkItems.length}
                    </p>
                  </div>
                  <AdminArticleForm
                    initial={bulkItems[bulkIndex]}
                    onCreate={handleBulkNext}
                    token={auth?.token}
                    isPreview={false}
                  />
                </div>
              )}
            </div>
          )}

          {mode === "manage" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Gestionar productos</h2>
              {loadingProducts ? (
                <div className="text-center py-10">Cargando productos...</div>
              ) : products.length === 0 ? (
                <div className="text-center py-10 text-zinc-600">No hay productos aún</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Título</th>
                        <th className="text-left py-3 px-4">Precio</th>
                        <th className="text-left py-3 px-4">Stock</th>
                        <th className="text-left py-3 px-4">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p.id} className="border-b hover:bg-zinc-50">
                          <td className="py-3 px-4">{p.title}</td>
                          <td className="py-3 px-4">{formatPEN(p.price)}</td>
                          <td className="py-3 px-4">{p.stock}</td>
                          <td className="py-3 px-4 space-x-2">
                            <button
                              onClick={() => toggleOutOfStock(p)}
                              className={`px-3 py-1 rounded text-xs font-medium transition ${
                                p.outOfStock
                                  ? "bg-green-600 hover:bg-green-700 text-white"
                                  : "bg-red-600 hover:bg-red-700 text-white"
                              }`}
                            >
                              {p.outOfStock ? "Disponible" : "Agotado"}
                            </button>
                            <button
                              onClick={() => setEditingId(editingId === p.id ? null : p.id)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => deleteProduct(p.id)}
                              className="px-3 py-1 bg-zinc-600 hover:bg-zinc-700 text-white rounded text-xs font-medium transition"
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {editingId && (
                <div className="mt-8 p-6 bg-zinc-50 rounded-lg border-2 border-blue-200">
                  <h3 className="text-lg font-semibold mb-4">
                    Editar: {products.find(p => p.id === editingId)?.title}
                  </h3>
                  <AdminArticleForm
                    initial={products.find(p => p.id === editingId)}
                    isEdit={true}
                    onCreate={(updated) => {
                      setProducts(products.map(p => p.id === editingId ? updated : p));
                      setEditingId(null);
                    }}
                    token={auth?.token}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
