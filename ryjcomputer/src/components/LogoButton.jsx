import React from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/Logo.png";

export default function LogoButton() {
  const navigate = useNavigate();
  return (
    <button
      className="text-2xl md:text-3xl font-extrabold tracking-tight select-none cursor-pointer"
      onClick={() => navigate("/")}
      aria-label="Ir al inicio"
    >
      <img src={Logo} alt="Logo R y J Computer" className="h-100 md:h-30 " />
    </button>
  );
}
