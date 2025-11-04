import React, { useState } from "react";

export default function Login() {
  const [tab, setTab] = useState("login");

  return (
    <div className="max-w-md mx-auto px-4">
      <div className="border rounded-2xl p-6 shadow-sm">
        <div className="flex gap-2 mb-6">
          <button
            className={`flex-1 py-2 rounded-xl ${tab === "login" ? "bg-zinc-900 text-white" : "bg-zinc-100"}`}
            onClick={() => setTab("login")}
          >
            Iniciar sesión
          </button>
          <button
            className={`flex-1 py-2 rounded-xl ${tab === "registro" ? "bg-zinc-900 text-white" : "bg-zinc-100"}`}
            onClick={() => setTab("registro")}
          >
            Registrarse
          </button>
        </div>

        {tab === "login" ? (
          <form className="space-y-4">
            <div>
              <label className="text-sm">Correo electrónico</label>
              <input className="mt-1 w-full border rounded-lg px-3 py-2" type="email" placeholder="tucorreo@ejemplo.com" />
            </div>
            <div>
              <label className="text-sm">Contraseña</label>
              <input className="mt-1 w-full border rounded-lg px-3 py-2" type="password" placeholder="••••••••" />
            </div>
            <button type="button" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2">
              Entrar
            </button>
          </form>
        ) : (
          <form className="space-y-4">
            <div>
              <label className="text-sm">Nombre completo</label>
              <input className="mt-1 w-full border rounded-lg px-3 py-2" type="text" />
            </div>
            <div>
              <label className="text-sm">Correo electrónico</label>
              <input className="mt-1 w-full border rounded-lg px-3 py-2" type="email" />
            </div>
            <div>
              <label className="text-sm">Contraseña</label>
              <input className="mt-1 w-full border rounded-lg px-3 py-2" type="password" />
            </div>
            <button type="button" className="w-full bg-zinc-900 hover:bg-black text-white rounded-xl py-2">
              Crear cuenta
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
