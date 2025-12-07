import React from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function ProfilePage(){
  const auth = useAuth();
  const navigate = useNavigate();

  if (!auth?.user) return (
    <div className="max-w-xl mx-auto p-6">Debes iniciar sesión.</div>
  );

  const isAdmin = auth.user.role === 'admin';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-4 gap-6">
        <div className="space-y-4">
          <div className="w-56 p-4 bg-white rounded shadow">
            <div className="font-semibold">{auth.user.name || auth.user.email}</div>
            <div className="text-sm text-zinc-500">{auth.user.email}</div>
          </div>

          <div className="p-4 bg-white rounded shadow space-y-2">
            {isAdmin ? (
              <>
                <button onClick={()=>navigate('/')} className="w-full px-3 py-2 bg-blue-600 text-white rounded">Ir al panel</button>
                <button onClick={()=>{if(confirm('Cerrar sesión?')){auth.logout(); navigate('/');}}} className="w-full px-3 py-2 bg-red-500 text-white rounded">Cerrar sesión</button>
              </>
            ) : (
              <>
                <button onClick={()=>navigate('/')} className="w-full px-3 py-2 bg-zinc-100 rounded">Volver a tienda</button>
                <button onClick={()=>{if(confirm('Cerrar sesión?')){auth.logout(); navigate('/');}}} className="w-full px-3 py-2 bg-red-500 text-white rounded">Cerrar sesión</button>
              </>
            )}
          </div>
        </div>

        <div className="md:col-span-3">
          <div className="bg-white p-6 rounded shadow">
            <h3 className="font-semibold mb-4">Mi cuenta</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {!isAdmin && (
                <>
                  <Card title="Información" onClick={()=>navigate('/profile/info')} />
                  <Card title="Direcciones" onClick={()=>navigate('/profile/address')} />
                  <Card title="Historial y detalles de mis pedidos" onClick={()=>navigate('/profile/orders')} />
                  <Card title="Facturas por abono" onClick={()=>navigate('/profile/invoices')} />
                  <Card title="My Wishlists" onClick={()=>navigate('/profile/wishlist')} />
                  <Card title="Mis alertas" onClick={()=>navigate('/profile/alerts')} />
                </>
              )}

              {isAdmin && (
                <>
                  <Card title="Añadir artículos" onClick={()=>navigate('/admin')} />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, onClick }){
  return (
    <button onClick={onClick} className="text-left p-6 border rounded hover:shadow-sm bg-white">
      <div className="font-semibold">{title}</div>
    </button>
  );
}
