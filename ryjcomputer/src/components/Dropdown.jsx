import React, { useState, useRef, useEffect } from "react";

function isDesktop() {
  if (typeof window === "undefined") return false;
  return window.innerWidth >= 992; // breakpoint desktop
}

export default function Dropdown({
  label,
  items,
  onSelect,
  itemClassName = "",
  labelClassName = "",
}) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({
    top: 0,
    left: 0,
    minWidth: 0,
  });

  const btnRef = useRef(null);
  const menuRef = useRef(null);

  // Cerrar cuando otro dropdown se abre
  useEffect(() => {
    const handler = () => setOpen(false);
    window.addEventListener("ryj-close-dropdowns", handler);
    return () => window.removeEventListener("ryj-close-dropdowns", handler);
  }, []);

  const updatePosition = () => {
    if (!btnRef.current || typeof window === "undefined") return;
    const rect = btnRef.current.getBoundingClientRect();

    // Como el menú es FIXED, usamos coords del viewport DIRECTAS
    setMenuStyle({
      top: rect.bottom,      // sin scrollY
      left: rect.left,       // sin scrollX
      minWidth: rect.width,
    });
  };

  const openMenu = () => {
    window.dispatchEvent(new Event("ryj-close-dropdowns")); // cierra otros
    updatePosition();
    setOpen(true);
  };

  const closeMenu = () => setOpen(false);

  // Hover en desktop
  const handleMouseEnter = () => {
    if (isDesktop()) openMenu();
  };

  const handleMouseLeave = (e) => {
    if (!isDesktop()) return;
    if (menuRef.current && menuRef.current.contains(e.relatedTarget)) return;
    closeMenu();
  };

  // Click/tap en móvil
  const handleClickButton = (e) => {
    e.stopPropagation();
    if (isDesktop()) {
      // en desktop usamos hover
      return;
    }
    setOpen((v) => !v ? (updatePosition(), true) : false);
  };

  // Cerrar al click fuera
  useEffect(() => {
    if (!open) return;

    const handleClick = (e) => {
      if (btnRef.current?.contains(e.target)) return;
      if (menuRef.current?.contains(e.target)) return;
      closeMenu();
    };

    window.addEventListener("mousedown", handleClick);
    window.addEventListener("touchstart", handleClick);
    return () => {
      window.removeEventListener("mousedown", handleClick);
      window.removeEventListener("touchstart", handleClick);
    };
  }, [open]);

  // Reposicionar mientras está abierto (por si scrolleas con el menú abierto)
  useEffect(() => {
    if (!open) return;
    const handler = () => updatePosition();
    window.addEventListener("scroll", handler, true);
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("scroll", handler, true);
      window.removeEventListener("resize", handler);
    };
  }, [open]);

  return (
    <>
      {/* Botón en la barra morada */}
      <div
        className="relative inline-block align-top"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button
          ref={btnRef}
          type="button"
          onClick={handleClickButton}
          className={`
            px-3 md:px-4 py-2.5
            hover:bg-[#4400ff]
            hover:text-white
            radius:10px
            transition
            font-medium
            text-sm md:text-base
            ${labelClassName}
          `}
        >
          {label}
        </button>
      </div>

      {/* Menú flotante FIXED */}
      {open && (
        <div
          ref={menuRef}
          className="
            fixed z-[200]
            bg-white text-black
            shadow-xl rounded-b-xl
            border border-zinc-100
          "
          style={{
            top: menuStyle.top,
            left: menuStyle.left,
            minWidth: menuStyle.minWidth,
          }}
          onMouseLeave={() => {
            if (isDesktop()) closeMenu();
          }}
        >
          {items.map((it) => (
            <div
              key={it}
              className={`
                px-4 py-2 cursor-pointer text-sm
                hover:bg-[#4400ff] hover:text-white
                transition-colors
                ${itemClassName}
              `}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(it);
                closeMenu();
              }}
            >
              {it}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
