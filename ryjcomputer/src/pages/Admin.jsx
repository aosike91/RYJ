import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import AdminArticleForm from "../components/AdminArticleForm.jsx";

export default function AdminPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("individual"); // "individual" | "bulk"
  const [bulkItems, setBulkItems] = useState([]);
  const [bulkIndex, setBulkIndex] = useState(0);
  const [bulkJson, setBulkJson] = useState("");

  // Protección: solo admin - redirigir al inicio si no es admin
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (!auth?.user || auth.user.role !== "admin") {
        window.location.href = "/";
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [auth?.user?.role]);

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
        </div>
      </div>
    </div>
  );
}
