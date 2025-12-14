import React from "react";

// Definir los campos predeterminados por tipo de producto
const SPECS_BY_TYPE = {
  Laptop: [
    "Procesador",
    "Pantalla",
    "RAM",
    "Almacenamiento",
    "Gráficos",
    "Conectividad",
    "SO",
    "Peso",
    "Batería",
  ],
  PC: [
    "Procesador",
    "RAM",
    "Almacenamiento",
    "Gráficos",
    "Conectividad",
    "SO",
    "Fuente de poder",
    "Peso",
  ],
  Impresora: [
    "Tipo",
    "Resolución",
    "Velocidad",
    "Conectividad",
    "Tamaño de papel",
    "Capacidad de bandeja",
    "SO compatible",
  ],
  CPU: [
    "Marca",
    "Modelo",
    "Núcleos",
    "Hilos",
    "Velocidad base",
    "Velocidad boost",
    "Socket",
    "TDP",
  ],
  RAM: [
    "Marca",
    "Capacidad",
    "Tipo",
    "Velocidad",
    "Latencia",
    "Voltaje",
    "Factor de forma",
  ],
  "Placa madre": [
    "Marca",
    "Modelo",
    "Socket",
    "Chipset",
    "Ranuras RAM",
    "Conectividad",
    "Audio",
    "Red",
  ],
  "Tarjeta gráfica": [
    "Marca",
    "Modelo",
    "VRAM",
    "Tipo de VRAM",
    "Ancho de bus",
    "Conectividad",
    "Consumo",
    "Refrigeración",
  ],
};

// Sinónimos de categorías que comparten las mismas especificaciones
const CATEGORY_SYNONYMS = {
  "Tarjeta de video": "Tarjeta gráfica",
  "Tarjeta de Video": "Tarjeta gráfica",
  "Tarjeta Gráfica": "Tarjeta gráfica",
  "Tarjeta grafica": "Tarjeta gráfica",
  "Tarjeta Grafica": "Tarjeta gráfica",
};

// Normalizar una categoría a su nombre estándar
function normalizeCategoryName(category) {
  return CATEGORY_SYNONYMS[category] || category;
}

// Detectar el tipo basado en las categorías seleccionadas
function detectProductType(categories) {
  for (const cat of categories) {
    const normalized = normalizeCategoryName(cat);
    if (SPECS_BY_TYPE[normalized]) {
      return normalized;
    }
  }
  return null;
}

export default function SpecsSelector({ categories = [], specs = {}, onChange = () => {} }) {
  const productType = detectProductType(categories);
  const fields = productType ? SPECS_BY_TYPE[productType] : [];

  const handleSpecChange = (field, value) => {
    const updated = { ...specs, [field]: value };
    onChange(updated);
  };

  const handleRemoveField = (field) => {
    const updated = { ...specs };
    delete updated[field];
    onChange(updated);
  };

  if (!productType || fields.length === 0) {
    return (
      <div style={{padding: '12px', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', color: '#4b5563'}}>
        Selecciona una categoría para ver las especificaciones disponibles.
      </div>
    );
  }

  return (
    <div style={{display: 'grid', gap: '16px'}}>
      <div style={{fontSize: '14px', fontWeight: 'bold', color: '#000000'}}>
        Especificaciones Tipo: <span style={{color: '#7c3aed'}}>{productType}</span>
      </div>

      <div style={{display: 'grid', gap: '12px'}}>
        {fields.map((field) => (
          <div key={field} style={{display: 'flex', alignItems: 'flex-end', gap: '8px'}}>
            <div style={{flex: 1}}>
              <label style={{fontSize: '12px', fontWeight: '600', color: '#000000', display: 'block', marginBottom: '4px'}}>
                {field}:
              </label>
              <input
                type="text"
                value={specs[field] || ""}
                onChange={(e) => handleSpecChange(field, e.target.value)}
                style={{width: '100%', border: '1px solid #d1d5db', borderRadius: '4px', padding: '8px 12px', fontSize: '14px', color: '#000000', backgroundColor: '#ffffff'}}
                placeholder={`${field}`}
              />
            </div>
            {specs[field] && (
              <button
                type="button"
                onClick={() => handleRemoveField(field)}
                style={{padding: '8px 8px', color: '#dc2626', backgroundColor: 'transparent', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer'}}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#fee2e2'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                title="Eliminar"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
