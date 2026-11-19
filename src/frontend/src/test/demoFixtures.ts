import type { Usuario } from '../services/api';

// Test-only fictitious accounts. No credentials or network access.
export const CUENTAS_PREDEFINIDAS: Usuario[] = [
  {usuario_id:'test-admin',email:'admin@example.test',nombre_completo:'Administrador de prueba',rol:'ADMIN',
    permisos:['ADMIN_USUARIOS','GESTION_FLOTA','GESTION_CONDUCTORES','REGISTRO_PEDIDOS','SEGUIMIENTO_RUTAS'],estado:'ACTIVO',creado_en:'2026-11-17'},
  {usuario_id:'test-office',email:'office@example.test',nombre_completo:'Oficina de prueba',rol:'OFICINA',
    permisos:['GESTION_FLOTA','GESTION_CONDUCTORES','REGISTRO_PEDIDOS','SEGUIMIENTO_RUTAS'],estado:'ACTIVO',creado_en:'2026-11-17'},
  {usuario_id:'test-driver',email:'driver@example.test',nombre_completo:'Conductor de prueba',rol:'REPARTIDOR',
    permisos:['REPARTO_POD','SEGUIMIENTO_RUTAS'],estado:'ACTIVO',creado_en:'2026-11-17'},
];
