// Cliente de la API pública de Web-MVP (comerciantes.com.ar).
// Mismo backend que ya consumen las webs - un solo contrato para web y app.
const API_BASE_URL = 'https://backend-production-196c.up.railway.app';

export type Comercio = {
  id: number;
  nombre_negocio: string;
  descripcion: string | null;
  telefono: string;
  direccion: string;
  whatsapp: string | null;
  instagram: string | null;
  facebook: string | null;
  sitio_web: string | null;
  latitud: number | null;
  longitud: number | null;
  horarios: string | null;
  es_agrocomercio: number;
  plan: string;
  categoria_slug: string | null;
  categoria_nombre: string | null;
  localidad_id: number | null;
  localidad_nombre: string | null;
  foto_portada: string | null;
};

export type Foto = { url: string; orden: number; es_portada: number };

export type PlanInfo = {
  plan_slug: string;
  plan_nombre: string;
  prioridad: number;
  con_estadisticas: number;
};

export type ComercioDetalle = Comercio & {
  fotos: Foto[];
  plan_info: PlanInfo | null;
};

export type Categoria = { id: number; slug: string; nombre: string };
export type Localidad = { id: number; nombre: string; tipo: string };

type ComerciosFiltros = {
  categoria?: string;
  localidad?: number;
  agro?: boolean;
  q?: string;
};

async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`Error ${response.status} al llamar ${path}`);
  }
  return response.json();
}

export function fetchComercios(filtros: ComerciosFiltros = {}): Promise<Comercio[]> {
  const params = new URLSearchParams();
  if (filtros.categoria) params.set('categoria', filtros.categoria);
  if (filtros.localidad) params.set('localidad', String(filtros.localidad));
  if (filtros.agro !== undefined) params.set('agro', filtros.agro ? '1' : '0');
  if (filtros.q) params.set('q', filtros.q);

  const query = params.toString();
  return apiGet<Comercio[]>(`/api/comercios${query ? `?${query}` : ''}`);
}

export function fetchComercio(id: number | string): Promise<ComercioDetalle> {
  return apiGet<ComercioDetalle>(`/api/comercios/${id}`);
}

export function fetchCategorias(): Promise<Categoria[]> {
  return apiGet<Categoria[]>('/api/categorias');
}

export function fetchLocalidades(): Promise<Localidad[]> {
  return apiGet<Localidad[]>('/api/localidades');
}

export type Plan = {
  id: number;
  slug: string;
  nombre: string;
  periodicidad: string;
  precio: number;
  fotos_max: number;
  prioridad: number;
  con_estadisticas: number;
  activo: number;
};

export function fetchPlanes(): Promise<Plan[]> {
  return apiGet<Plan[]>('/api/planes');
}

export type NuevaSuscripcion = {
  plan: string;
  businessName: string;
  category?: string;
  phone: string;
  address: string;
  description?: string;
  ownerName: string;
  email: string;
  dni: string;
  whatsapp?: string;
  instagram?: string;
};

export type RespuestaSuscripcion = {
  success: boolean;
  message: string;
  commerceId: number;
  initPoint: string | null;
};

export async function crearSuscripcion(datos: NuevaSuscripcion): Promise<RespuestaSuscripcion> {
  const response = await fetch(`${API_BASE_URL}/api/subscriptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });
  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.error || 'No pudimos registrar la suscripción.');
  }
  return body;
}
