// src/data/catalog.js
// Importa imágenes desde /src/assets (jpg, png, webp soportados)
import laptop1 from "../assets/laptop1.jpg";
import impresora1 from "../assets/impresora1.png";
// OJO: confirma el nombre real del archivo (hay un typo "matenimiento1.webp")
import mantenimiento1 from "../assets/matenimiento1.webp";
import mouse1 from "../assets/mouse1.webp";

export const CATEGORIES = [
  "Laptops",
  "Cpus armados",
  "Impresoras",
  "Accesorios",
  "Licencias",
  "Procesadores",
  "Placas",
];

export const MANTENIMIENTO = ["Laptops", "Cpus", "Impresoras", "Laptops", "Tarjetas de video"];
export const REPARACION   = ["Laptops", "Cpus", "Impresoras", "Laptops", "Placas"];

// Productos (con stock + summary + description + specs)
export const PRODUCTS = [
  // Laptops
  {
    id: "lap-1",
    kind: "product",
    title: "Laptop Dell Inspiron 15 Core i5 12ª",
    price: 1571.08,
    stock: 3,
    category: "Laptops",
    featured: true,
    thumb: laptop1,
    summary: "Rendimiento sólido para estudio y oficina con pantalla FHD.",
    description: `Procesador Intel de 12ª generación, ideal para trabajo, clases y multitarea.
Incluye teclado cómodo, buena autonomía y conectividad Wi-Fi 6.`,
    // specs como OBJETO (se muestra en dos columnas)
    specs: {
      "Procesador": "Intel Core i5-12450H",
      "Pantalla": "15.6\" FHD (1920x1080)",
      "RAM": "16 GB DDR4",
      "Almacenamiento": "512 GB SSD NVMe",
      "Gráficos": "Intel UHD",
      "Conectividad": "Wi-Fi 6, Bluetooth 5.2",
      "SO": "Windows 11 Home",
      "Peso": "1.65 kg",
    },
  },
  {
    id: "lap-2",
    kind: "product",
    title: "Laptop Acer Aspire 3 Ryzen 5",
    price: 1499.00,
    stock: 7,
    category: "Laptops",
    featured: true,
    thumb: laptop1,
    summary: "Equilibrio entre precio y rendimiento con Ryzen 5.",
    description: `Perfecta para tareas múltiples, ofimática y clases virtuales.
Chasis ligero y puertos suficientes para periféricos.`,
    // specs como ARRAY (lista con viñetas)
    specs: [
      "Ryzen 5 5500U (6C/12T)",
      "Pantalla 15.6\" FHD",
      "RAM 8 GB (expandible)",
      "SSD 512 GB NVMe",
      "Wi-Fi 5, BT 5.0",
      "Windows 11 Home",
    ],
  },
  {
    id: "lap-3",
    kind: "product",
    title: "Laptop Lenovo IdeaPad 3 Core i7",
    price: 1899.00,
    stock: 2,
    category: "Laptops",
    featured: true,
    thumb: laptop1,
    // sin summary ni description para probar fallback:
    // summary: "",
    // description: "",
    // specs como STRING (párrafo)
    specs: "Core i7 11ª Gen; 16 GB RAM; 512 GB SSD; Pantalla 15.6\" FHD; Windows 11.",
  },
  {
    id: "lap-4",
    kind: "product",
    title: "Laptop HP 240 G9 Core i3",
    price: 1199.00,
    stock: 5,
    category: "Laptops",
    featured: false,
    thumb: laptop1,
  },
  {
    id: "lap-5",
    kind: "product",
    title: "Laptop Asus VivoBook Go",
    price: 1299.00,
    stock: 4,
    category: "Laptops",
    featured: false,
    thumb: laptop1,
  },
  {
    id: "lap-6",
    kind: "product",
    title: "Laptop MSI Modern 15",
    price: 2399.00,
    stock: 1,
    category: "Laptops",
    featured: false,
    thumb: laptop1,
  },

  // Impresoras
  {
    id: "imp-1",
    kind: "product",
    title: "Impresora HP Ink Tank 2775",
    price: 399.90,
    stock: 0, // Agotado para probar etiqueta
    category: "Impresoras",
    featured: true,
    thumb: impresora1,
    summary: "Multifuncional económica con tanque de tinta.",
    description: "Imprime, copia y escanea con costos por página muy bajos.",
    specs: ["Wi-Fi", "Ahorro de tinta", "Hasta 7.5 ppm", "Compatibilidad Windows/macOS"],
  },
  {
    id: "imp-2",
    kind: "product",
    title: "Impresora Epson EcoTank L3250",
    price: 699.90,
    stock: 6,
    category: "Impresoras",
    featured: true,
    thumb: impresora1,
  },
  {
    id: "imp-3",
    kind: "product",
    title: "Impresora Brother HL-L2370DN (Láser)",
    price: 899.00,
    stock: 3,
    category: "Impresoras",
    featured: true,
    thumb: impresora1,
  },
  {
    id: "imp-4",
    kind: "product",
    title: "Impresora Canon G3160",
    price: 749.00,
    stock: 2,
    category: "Impresoras",
    featured: false,
    thumb: impresora1,
  },

  // Accesorios
  {
    id: "acc-1",
    kind: "product",
    title: "Mouse Logitech M190 Inalámbrico",
    price: 59.90,
    stock: 15,
    category: "Accesorios",
    featured: true,
    thumb: mouse1,
    specs: "Sensor óptico preciso, alcance inalámbrico 10 m, diseño ambidiestro.",
  },
  {
    id: "acc-2",
    kind: "product",
    title: "Teclado Mecánico Redragon Kumara",
    price: 129.00,
    stock: 8,
    category: "Accesorios",
    featured: false,
    thumb: mouse1, // si prefieres, puedes dejarlo en null
  },
];

// Servicios (sin stock; pueden tener summary/description/specs también)
export const SERVICES = [
  {
    id: "srv-mant-laptops",
    kind: "service",
    title: "Mantenimiento de Laptops (Limpieza + Pasta Térmica)",
    priceFrom: 79,
    section: "mantenimiento",
    target: "Laptops",
    featured: true,
    thumb: mantenimiento1,
    summary: "Mejora la refrigeración y el rendimiento general.",
    description: `Incluye limpieza interna, cambio de pasta térmica, verificación de
temperaturas y pruebas de estabilidad.`,
    specs: ["Diagnóstico básico", "Limpieza de ventiladores", "Pasta térmica premium"],
  },
];
