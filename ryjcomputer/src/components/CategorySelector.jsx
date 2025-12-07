import React, { useState, useRef, useEffect } from "react";

export const AVAILABLE_CATEGORIES = [
  "Laptop",
  "Gamer",
  "CPU",
  "PC",
  "Procesadores",
  "Impresora",
  "Tinta",
  "Láser",
  "Tóner",
  "Diseño Gráfico",
  "Administración",
  "Ingeniería",
  "Básica",
  "Cartucho",
  "HP",
  "Lenovo",
  "Epson",
  "Nuevo",
  "Seminuevo",
  "Importado",
  "De segunda mano",
  "Dell",
  "SSD",
  "HDD",
  "Disco Sólido",
  "Disco Mecánico",
  "M2",
  "NV3",
  "NV1",
  "NV2",
  "Kingston",
  "Gygabite",
  "MSI",
  "Teros",
  "Hiksemi",
  "Estudiantes",
  "Antivirus",
  "Licencias",
].sort();

export default function CategorySelector({ selected = [], onChange }) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);

  // Filtrar sugerencias
  const suggestions = input.trim()
    ? AVAILABLE_CATEGORIES.filter(
        (cat) =>
          cat.toLowerCase().includes(input.toLowerCase()) &&
          !selected.includes(cat)
      )
    : [];

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addCategory = (cat) => {
    if (!selected.includes(cat)) {
      onChange([...selected, cat]);
    }
    setInput("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const removeCategory = (cat) => {
    onChange(selected.filter((c) => c !== cat));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && suggestions.length > 0) {
      e.preventDefault();
      addCategory(suggestions[0]);
    } else if (e.key === "Backspace" && !input && selected.length > 0) {
      removeCategory(selected[selected.length - 1]);
    }
  };

  return (
    <div ref={wrapperRef} style={{position: 'relative'}}>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '8px', border: '1px solid #d1d5db', borderRadius: '8px', backgroundColor: '#ffffff', minHeight: '42px'}}>
        {selected.map((cat) => (
          <span
            key={cat}
            style={{display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', backgroundColor: '#7c3aed', color: '#ffffff', fontSize: '14px', borderRadius: '4px'}}
          >
            {cat}
            <button
              type="button"
              onClick={() => removeCategory(cat)}
              style={{backgroundColor: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', fontSize: '16px', padding: '0 4px'}}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={selected.length === 0 ? "Escribe para buscar categorías..." : ""}
          style={{flex: 1, minWidth: '120px', outline: 'none', fontSize: '14px', border: 'none', backgroundColor: 'transparent', color: '#000000'}}
        />
      </div>

      {/* Sugerencias */}
      {showSuggestions && suggestions.length > 0 && (
        <div style={{position: 'absolute', zIndex: 50, marginTop: '4px', width: '100%', maxHeight: '240px', overflowY: 'auto', backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}>
          {suggestions.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => addCategory(cat)}
              style={{width: '100%', textAlign: 'left', padding: '8px 12px', backgroundColor: 'transparent', border: 'none', fontSize: '14px', color: '#000000', cursor: 'pointer'}}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              {cat}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
