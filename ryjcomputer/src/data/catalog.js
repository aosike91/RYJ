// src/data/catalog.js
// Importa imágenes desde /src/assets (jpg, png, webp soportados)
// ...existing code...
import laptop1 from "../assets/laptop1.jpg";
import impresora1 from "../assets/impresora1.png";
// Si el archivo real se llama mantenimiento.webp o mantenimiento1.png, ajusta aquí:
import mantenimiento1 from "../assets/matenimiento1.webp"; // <-- asegúrate que exista
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

// Productos de ejemplo (usa la misma imagen por tipo de prueba)
export const PRODUCTS = [
  // Laptops (varias para probar el carrusel)
  { id: "lap-1", kind: "product", title: "Laptop Dell Inspiron 15 Core i5 12ª", price: 1571.08, category: "Laptops", featured: true,  thumb: laptop1 },
  { id: "lap-2", kind: "product", title: "Laptop Acer Aspire 3 Ryzen 5",       price: 1499.00, category: "Laptops", featured: true,  thumb: laptop1 },
  { id: "lap-3", kind: "product", title: "Laptop Lenovo IdeaPad 3 Core i7",     price: 1899.00, category: "Laptops", featured: true,  thumb: laptop1 },
  { id: "lap-4", kind: "product", title: "Laptop HP 240 G9 Core i3",            price: 1199.00, category: "Laptops", featured: false, thumb: laptop1 },
  { id: "lap-5", kind: "product", title: "Laptop Asus VivoBook Go",             price: 1299.00, category: "Laptops", featured: false, thumb: laptop1 },
  { id: "lap-6", kind: "product", title: "Laptop MSI Modern 15",                price: 2399.00, category: "Laptops", featured: false, thumb: laptop1 },

  // Impresoras
  { id: "imp-1", kind: "product", title: "Impresora HP Ink Tank 2775",          price: 399.90,  category: "Impresoras", featured: true,  thumb: impresora1 },
  { id: "imp-2", kind: "product", title: "Impresora Epson EcoTank L3250",       price: 699.90,  category: "Impresoras", featured: true,  thumb: impresora1 },
  { id: "imp-3", kind: "product", title: "Impresora Brother HL-L2370DN (Láser)",price: 899.00,  category: "Impresoras", featured: true,  thumb: impresora1 },
  { id: "imp-4", kind: "product", title: "Impresora Canon G3160",               price: 749.00,  category: "Impresoras", featured: false, thumb: impresora1 },

  // Accesorios (ejemplo con mouse .webp)
  { id: "acc-1", kind: "product", title: "Mouse Logitech M190 Inalámbrico",     price: 59.90,   category: "Accesorios", featured: true,  thumb: mouse1 },
  { id: "acc-2", kind: "product", title: "Teclado Mecánico Redragon Kumara",    price: 129.00,  category: "Accesorios", featured: false, thumb: null },
];

// Servicios (para destacado principal, con imagen webp)
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
  },
];
