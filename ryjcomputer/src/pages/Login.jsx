import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { register as apiRegister } from "../lib/api.js";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [tab, setTab] = useState("login");

  return (
    <div className="max-w-md mx-auto px-4 py-4 md:py-8">
  <div className="border rounded-2xl p-4 md:p-6 shadow-sm surface">
        <div className="flex gap-2 mb-4 md:mb-6">
          <button
            className={`flex-1 py-2 rounded-xl text-sm md:text-base ${tab === "login" ? "bg-[var(--brand-purple)] text-white" : "bg-zinc-100"}`}
            onClick={() => setTab("login")}
          >
            Iniciar sesión
          </button>
          <button
            className={`flex-1 py-2 rounded-xl text-sm md:text-base ${tab === "registro" ? "bg-[var(--brand-purple)] text-white" : "bg-zinc-100"}`}
            onClick={() => setTab("registro")}
          >
            Registrarse
          </button>
        </div>

        {tab === "login" ? <LoginForm /> : <RegisterForm />}
      </div>
    </div>
  );
}

function LoginForm(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();

  async function submit(){
    setLoading(true);
    const res = await auth.login(email, password);
    setLoading(false);
    if (res.ok) navigate('/');
    else alert('Error: '+(res.error||res.message));
  }

  return (
    <form className="space-y-4" onSubmit={(e)=>{e.preventDefault(); submit();}}>
      <div>
        <label className="text-sm">Correo electrónico</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2" type="email" placeholder="tucorreo@ejemplo.com" />
      </div>
      <div>
        <label className="text-sm">Contraseña</label>
        <input value={password} onChange={e=>setPassword(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2" type="password" placeholder="••••••••" />
      </div>
      <button type="submit" disabled={loading} className={`w-full btn-brand btn-brand-animated btn-press font-semibold ${loading ? 'opacity-60 cursor-not-allowed' : ''} rounded-xl py-2`}>
        {loading ? 'Ingresando...' : 'Iniciar sesión'}
      </button>
    </form>
  );
}

function RegisterForm(){
  const auth = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e){
    e.preventDefault();
    // basic email pattern required (ej: correosjemplo@correo.com)
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) return alert('El correo debe tener la forma correosjemplo@correo.com');
    if (!name) return alert('Ingresa tu nombre');
    if (!lastName) return alert('Ingresa tus apellidos');
    setLoading(true);
    try{
      const res = await apiRegister({ name, lastName, birthDate, email, password });
      if (res?.ok) {
        // auto-login after successful registration
        const lg = await auth.login(email, password);
        setLoading(false);
        if (lg.ok) navigate('/');
        else alert('Registrado, pero no se pudo iniciar sesión automáticamente. Inicia sesión manualmente.');
      } else {
        setLoading(false);
        alert('Error al registrar: ' + (res?.error || res?.message || JSON.stringify(res)));
      }
    }catch(err){
      setLoading(false);
      console.error(err);
      alert('Error al registrar: ' + err.message);
    }
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <div>
        <label className="text-sm">Nombre</label>
        <input value={name} onChange={e=>setName(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2" type="text" placeholder="Nombre" />
      </div>
      <div>
        <label className="text-sm">Apellidos</label>
        <input value={lastName} onChange={e=>setLastName(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2" type="text" placeholder="Apellidos" />
      </div>
      <div>
        <label className="text-sm">Fecha de nacimiento</label>
        <input value={birthDate} onChange={e=>setBirthDate(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2" type="date" />
      </div>
      <div>
        <label className="text-sm">Correo electrónico</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2" type="email" placeholder="correosjemplo@correo.com" />
      </div>
      <div>
        <label className="text-sm">Contraseña</label>
        <input value={password} onChange={e=>setPassword(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2" type="password" />
      </div>
      <button type="submit" disabled={loading} className={`w-full btn-brand btn-brand-animated btn-press font-semibold ${loading ? 'opacity-60 cursor-not-allowed' : ''} rounded-xl py-2`}>
        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
      </button>
    </form>
  );
}
