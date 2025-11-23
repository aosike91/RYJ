import React, { useState } from "react";
import AdminArticleForm from "./AdminArticleForm.jsx";

export default function AdminModal({ open, onClose, onCreate, token }) {
  const [tab, setTab] = useState("individual");
  const [bulkItems, setBulkItems] = useState([]);
  const [bulkIndex, setBulkIndex] = useState(0);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60 bg-black/40 grid place-items-center">
      <div className="w-[95%] md:w-3/4 lg:w-2/3 bg-white rounded-xl shadow-2xl p-4 relative">
        <button
          onClick={() => {
            // if editing, show confirm (simple confirm for now)
            if (window.confirm("¿Cerrar ventana? Los cambios no guardados se perderán.")) onClose();
          }}
          className="absolute right-3 top-3 text-zinc-600"
          aria-label="Cerrar">
          ✕
        </button>

        <div className="flex gap-2 mb-4">
          <button className={`px-3 py-2 rounded ${tab==='individual'?'bg-zinc-900 text-white':'bg-zinc-100'}`} onClick={() => setTab('individual')}>Añadir individual</button>
          <button className={`px-3 py-2 rounded ${tab==='bulk'?'bg-zinc-900 text-white':'bg-zinc-100'}`} onClick={() => setTab('bulk')}>Carga masiva</button>
        </div>

        {tab === 'individual' ? (
          <AdminArticleForm onCreate={onCreate} token={token} />
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm">Subir JSON (array de artículos)</label>
              <input type="file" accept="application/json" onChange={async (e)=>{
                const f = e.target.files?.[0];
                if (!f) return;
                try {
                  const txt = await f.text();
                  const arr = JSON.parse(txt);
                  if (!Array.isArray(arr)) throw new Error('El JSON debe ser un array');
                  setBulkItems(arr);
                  setBulkIndex(0);
                } catch (err) {
                  alert('Error al parsear JSON: '+err.message);
                }
              }} />

              {bulkItems.length>0 && (
                <div className="mt-3">
                  <div className="text-sm text-zinc-600">Articulo {bulkIndex+1} de {bulkItems.length}</div>
                  <AdminArticleForm initial={bulkItems[bulkIndex]} onCreate={(p)=>{
                    // Save edited item back to bulkItems
                    const copy = [...bulkItems]; copy[bulkIndex] = p; setBulkItems(copy);
                  }} token={token} isPreview />

                  <div className="flex gap-2 mt-2">
                    <button disabled={bulkIndex===0} onClick={()=>setBulkIndex(i=>Math.max(0,i-1))} className="px-3 py-2 bg-zinc-100 rounded">Anterior</button>
                    <button disabled={bulkIndex===bulkItems.length-1} onClick={()=>setBulkIndex(i=>Math.min(bulkItems.length-1,i+1))} className="px-3 py-2 bg-zinc-100 rounded">Siguiente</button>
                    <div className="flex-1" />
                    <button onClick={async ()=>{
                      // call bulk create endpoint via onCreate for each
                      if (!token) return alert('No autorizado');
                      if (!confirm('Crear '+bulkItems.length+' artículos?')) return;
                      for (const item of bulkItems) {
                        // onCreate should handle product creation
                        await onCreate(item);
                      }
                      alert('Carga masiva completada');
                      onClose();
                    }} className="px-4 py-2 bg-emerald-600 text-white rounded">Crear todos</button>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 border rounded">
              <h4 className="font-semibold mb-2">Previsualización</h4>
              {bulkItems.length===0 ? (
                <div className="text-sm text-zinc-500">Sube un JSON para ver la previsualización de los artículos aquí.</div>
              ) : (
                <div>
                  <h5 className="font-medium">{bulkItems[bulkIndex].title || 'Título'}</h5>
                  <div className="text-sm text-zinc-600">{bulkItems[bulkIndex].summary || ''}</div>
                  <div className="mt-2 font-bold">S/ {bulkItems[bulkIndex].price ?? '0.00'}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
