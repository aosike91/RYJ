import React, { useEffect, useState } from "react";
import { createProduct, uploadProductImage } from "../lib/api.js";

export default function AdminArticleForm({ initial = {}, onCreate = ()=>{}, token, isPreview=false }) {
  const [form, setForm] = useState({
    id: initial.id || '',
    title: initial.title || '',
    price: initial.price || 0,
    stock: initial.stock || 0,
    category: initial.category || '',
    featured: !!initial.featured,
    summary: initial.summary || '',
    description: initial.description || '',
    specs: initial.specs || {},
    thumb: initial.thumb || '',
  });
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(()=>{
    setForm({
      id: initial.id || '',
      title: initial.title || '',
      price: initial.price || 0,
      stock: initial.stock || 0,
      category: initial.category || '',
      featured: !!initial.featured,
      summary: initial.summary || '',
      description: initial.description || '',
      specs: initial.specs || {},
      thumb: initial.thumb || '',
    })
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
          <label className="text-sm">Categoría</label>
          <input value={form.category} onChange={e=>setForm(s=>({...s,category:e.target.value}))} className="mt-1 w-full border rounded px-3 py-2" />
        </div>
      </div>

      <div>
        <label className="text-sm">Resumen</label>
        <input value={form.summary} onChange={e=>setForm(s=>({...s,summary:e.target.value}))} className="mt-1 w-full border rounded px-3 py-2" />
      </div>

      <div>
        <label className="text-sm">Descripción</label>
        <textarea value={form.description} onChange={e=>setForm(s=>({...s,description:e.target.value}))} className="mt-1 w-full border rounded px-3 py-2" rows={4} />
      </div>

      <div>
        <label className="text-sm">Specs (JSON)</label>
        <textarea value={JSON.stringify(form.specs,null,2)} onChange={e=>{
          try{
            const obj = JSON.parse(e.target.value);
            setForm(s=>({...s,specs:obj}));
          }catch(err){
            // ignore parse errors while typing
            setForm(s=>({...s}));
          }
        }} className="mt-1 w-full border rounded px-3 py-2" rows={5} />
      </div>

      <div className="grid md:grid-cols-2 gap-3 items-center">
        <div>
          <label className="text-sm">Imagen (URL o cargar)</label>
          <input type="text" value={form.thumb} onChange={e=>setForm(s=>({...s,thumb:e.target.value}))} className="mt-1 w-full border rounded px-3 py-2" placeholder="/uploads/imagen.jpg o https://..." />
          <input type="file" accept="image/*" onChange={async (e)=>{
            const f = e.target.files?.[0];
            if(!f) return;
            const url = URL.createObjectURL(f);
            setForm(s=>({...s,thumb:url}));
            setSelectedFile(f);
          }} className="mt-2" />
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
            // create product first
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
          }catch(err){
            console.error(err);
            alert('Error al crear');
          }
        }} className="px-4 py-2 bg-emerald-600 text-white rounded">Crear</button>}

        <button onClick={()=>onCreate(form)} className="px-4 py-2 bg-zinc-100 rounded">Guardar local</button>
      </div>
    </div>
  );
}
