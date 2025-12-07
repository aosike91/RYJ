const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export function getImageUrl(imagePath) {
  if (!imagePath) return '';
  // Si ya es una URL completa, devolverla tal cual
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // Si empieza con /, es una ruta relativa, agregarle la base URL
  if (imagePath.startsWith('/')) {
    return `${API_BASE}${imagePath}`;
  }
  // Si no, asumir que es una ruta relativa y agregarle /uploads
  return `${API_BASE}/uploads/${imagePath}`;
}

export async function login(email, password) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.message || 'login failed' };
    return data;
  } catch (e) {
    return { error: e.message };
  }
}

export async function register({ name, lastName, birthDate, email, password }) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, lastName, birthDate, email, password }),
  });
  return res.json();
}

export async function createProduct(product, token) {
  const res = await fetch(`${API_BASE}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : undefined,
    },
    body: JSON.stringify(product),
  });
  return res.json();
}

export async function uploadProductImage(productId, file, token) {
  const form = new FormData();
  form.append('image', file);
  const res = await fetch(`${API_BASE}/products/${encodeURIComponent(productId)}/image`, {
    method: 'POST',
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
    body: form,
  });
  return res.json();
}

export async function updateProduct(productId, product, token) {
  const res = await fetch(`${API_BASE}/products/${encodeURIComponent(productId)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : undefined,
    },
    body: JSON.stringify(product),
  });
  return res.json();
}

export default { login, register, createProduct, updateProduct, uploadProductImage };
