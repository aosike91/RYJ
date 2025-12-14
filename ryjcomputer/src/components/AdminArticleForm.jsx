import React, { useEffect, useState, useRef } from "react";
import { createProduct, uploadProductImage, updateProduct } from "../lib/api.js";
import CategorySelector from "./CategorySelector.jsx";
import SpecsSelector from "./SpecsSelector.jsx";

export default function AdminArticleForm({ initial = {}, onCreate = ()=>{}, token, isPreview=false, isEdit=false }) {
  const initialRef = useRef(initial);
  const fileInputId = useRef(`file-upload-${Math.random().toString(36).substr(2, 9)}`).current;
  const [form, setForm] = useState({
    title: initial.title || '',
    price: initial.price || 0,
    stock: initial.stock || 0,
    categories: initial.categories || (initial.category ? [initial.category] : []),
    featured: !!initial.featured,
    summary: initial.summary || '',
    description: initial.description || '',
    specs: initial.specs || {},
    thumb: initial.thumb || '',
    condition: initial.condition || 'nuevo',
  });
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(()=>{
    // Solo actualizar si el initial.id cambió (nuevo producto en bulk)
    if (initialRef.current !== initial && initial.id !== initialRef.current.id) {
      initialRef.current = initial;
      setForm({
        title: initial.title || '',
        price: initial.price || 0,
        stock: initial.stock || 0,
        categories: initial.categories || (initial.category ? [initial.category] : []),
        featured: !!initial.featured,
        summary: initial.summary || '',
        description: initial.description || '',
        specs: initial.specs || {},
        thumb: initial.thumb || '',
        condition: initial.condition || 'nuevo',
      });
      setSelectedFile(null);
    }
  }, [initial]);

  return (
    <div className="grid gap-3">
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="text-sm">Título</label>
          <input value={form.title} onChange={e=>setForm(s=>({...s,title:e.target.value}))} className="mt-1 w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="text-sm">Precio</label>
          <input type="number" value={form.price} onChange={e=>setForm(s=>({...s,price:parseFloat(e.target.value||0)}))} className="mt-1 w-full border rounded px-3 py-2" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="text-sm">Stock</label>
          <input type="number" value={form.stock} onChange={e=>setForm(s=>({...s,stock:parseInt(e.target.value||0)}))} className="mt-1 w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Destacado</label>
          <label className="inline-flex items-center mt-1">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={e=>setForm(s=>({...s,featured:e.target.checked}))}
              className="w-4 h-4"
            />
            <span className="ml-2 text-sm">Mostrar en destacados</span>
          </label>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Condición del Producto</label>
        <div className="space-y-2 mt-2">
          <label className="inline-flex items-center mr-4">
            <input
              type="radio"
              name="condition"
              value="nuevo"
              checked={form.condition === 'nuevo'}
              onChange={e=>setForm(s=>({...s,condition:'nuevo'}))}
              className="w-4 h-4"
            />
            <span className="ml-2 text-sm">Nuevo</span>
          </label>
          <label className="inline-flex items-center mr-4">
            <input
              type="radio"
              name="condition"
              value="seminuevo"
              checked={form.condition === 'seminuevo'}
              onChange={e=>setForm(s=>({...s,condition:'seminuevo'}))}
              className="w-4 h-4"
            />
            <span className="ml-2 text-sm">Seminuevo</span>
          </label>
          <label className="inline-flex items-center mr-4">
            <input
              type="radio"
              name="condition"
              value="desegunda"
              checked={form.condition === 'desegunda'}
              onChange={e=>setForm(s=>({...s,condition:'desegunda'}))}
              className="w-4 h-4"
            />
            <span className="ml-2 text-sm">De segunda</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="condition"
              value="importada"
              checked={form.condition === 'importada'}
              onChange={e=>setForm(s=>({...s,condition:'importada'}))}
              className="w-4 h-4"
            />
            <span className="ml-2 text-sm">Importada</span>
          </label>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Categorías</label>
        <CategorySelector
          selected={form.categories}
          onChange={(cats) => setForm(s => ({...s, categories: cats}))}
        />
      </div>

      {form.categories.length > 0 && (
        <div>
          <label className="text-sm font-medium mb-2 block">Especificaciones</label>
          <SpecsSelector
            categories={form.categories}
            specs={form.specs}
            onChange={(newSpecs) => setForm(s => ({...s, specs: newSpecs}))}
          />
        </div>
      )}

      <div>
        <label className="text-sm">Resumen</label>
        <input value={form.summary} onChange={e=>setForm(s=>({...s,summary:e.target.value}))} className="mt-1 w-full border rounded px-3 py-2" />
      </div>

      <div>
        <label className="text-sm">Descripción</label>
        <textarea value={form.description} onChange={e=>setForm(s=>({...s,description:e.target.value}))} className="mt-1 w-full border rounded px-3 py-2" rows={4} />
      </div>

      <div className="grid md:grid-cols-2 gap-3 items-center">
        <div>
          <label className="text-sm">Imagen (URL o cargar)</label>
          <input type="text" value={form.thumb} onChange={e=>setForm(s=>({...s,thumb:e.target.value}))} className="mt-1 w-full border rounded px-3 py-2" placeholder="/uploads/imagen.jpg o https://..." />
          <div className="mt-3">
            <label htmlFor={fileInputId} className="inline-block px-4 py-2 bg-blue-600 text-white rounded font-semibold cursor-pointer hover:bg-blue-700 transition-colors">
              📁 Seleccionar imagen
            </label>
            <input 
              id={fileInputId}
              type="file" 
              accept="image/*" 
              onChange={async (e)=>{
                const f = e.target.files?.[0];
                if(!f) return;
                const url = URL.createObjectURL(f);
                setForm(s=>({...s,thumb:url}));
                setSelectedFile(f);
              }} 
              className="hidden"
            />
            {selectedFile && <span className="ml-3 text-sm text-green-600 font-medium">✓ {selectedFile.name}</span>}
          </div>
        </div>

        <div className="p-3 border rounded">
          <div className="text-sm">Previsualización</div>
          <div className="mt-2 flex gap-3 items-center">
            <div className="w-28 h-20 bg-zinc-100 rounded overflow-hidden">
              {form.thumb ? <img src={form.thumb} alt="thumb" className="w-full h-full object-cover"/> : <div className="w-full h-full grid place-items-center text-zinc-400">IMG</div>}
            </div>
            <div>
              <div className="font-semibold">{form.title || 'Título'}</div>
              <div className="text-sm text-zinc-600">S/ {form.price ?? '0.00'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {!isPreview && <button onClick={async ()=>{
          if(!token) return alert('No autorizado');
          try{
            const payload = { ...form };
            
            if (isEdit) {
              // Actualizar producto existente
              const res = await updateProduct(initial.id, payload, token);
              if (!res || !res.ok) {
                alert('Error al actualizar: '+(res?.message||JSON.stringify(res)));
                return;
              }
              let updatedProduct = { ...initial, ...payload };
              // Si una imagen fue seleccionada, subirla
              if (selectedFile) {
                const up = await uploadProductImage(initial.id, selectedFile, token);
                if (up && up.url) {
                  updatedProduct.thumb = up.url;
                }
              }
              alert('Producto actualizado');
              onCreate(updatedProduct);
            } else {
              // Crear nuevo producto
              const res = await createProduct(payload, token);
              if (!res || !res.id) {
                alert('Error al crear: '+(res?.message||JSON.stringify(res)));
                return;
              }
              const created = res;
              // if an image was selected, upload it
              if (selectedFile) {
                const up = await uploadProductImage(created.id, selectedFile, token);
                if (up && up.url) {
                  // update local form thumb to server url
                  setForm(s=>({...s, thumb: up.url}));
                  created.thumb = up.url;
                }
              }
              alert('Producto creado');
              onCreate(created);
            }
          }catch(err){
            console.error(err);
            alert('Error: ' + err.message);
          }
        }} className="px-4 py-2 bg-emerald-600 text-white rounded">{isEdit ? 'Actualizar' : 'Crear'}</button>}

        <button onClick={()=>onCreate(form)} className="px-4 py-2 bg-zinc-100 rounded">Guardar local</button>
      </div>
    </div>
  );
}
