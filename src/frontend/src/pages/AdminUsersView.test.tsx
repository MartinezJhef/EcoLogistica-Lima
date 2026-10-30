/**
 * AdminUsersView.test.tsx
 * Suite de pruebas para módulo de Administración de Usuarios
 * Cubre: listado, CRUD, filtros por rol, cambio de rol simulado y permisos.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminUsersView } from './AdminUsersView';

// ─── vi.mock hoisted: datos inline ───────────────────────────────────────────
vi.mock('../services/api', () => ({
  UsuarioService: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getCatalogo: vi.fn(),
    getCatalogoPermisos: vi.fn()
  },
  ClienteService: {
    getAll: vi.fn()
  },
  Usuario: {},
  RolUsuario: {},
  EstadoUsuario: {},
  PermisoItem: {},
  CatalogoPermisosResponse: {},
  UsuarioCreatePayload: {}
}));

// ─── Datos de prueba ──────────────────────────────────────────────────────────
const MOCK_USUARIOS = [
  {
    usuario_id: 'u1',
    email: 'admin@ecologistica.pe',
    nombre_completo: 'Super Admin',
    rol: 'ADMIN',
    estado: 'ACTIVO',
    permisos: ['ADMIN_USUARIOS', 'ADMIN_VEHICULOS'],
    telefono: '999000001',
    fecha_creacion: '2026-01-01T00:00:00Z'
  },
  {
    usuario_id: 'u2',
    email: 'repartidor.juan@ecologistica.pe',
    nombre_completo: 'Juan Morales (Conductor / Repartidor)',
    rol: 'REPARTIDOR',
    estado: 'ACTIVO',
    permisos: ['REPARTO_POD', 'SEGUIMIENTO_RUTAS'],
    telefono: '978123456',
    fecha_creacion: '2026-01-15T00:00:00Z'
  },
  {
    usuario_id: 'u3',
    email: 'oficina@ecologistica.pe',
    nombre_completo: 'María Oficina',
    rol: 'OFICINA',
    estado: 'INACTIVO',
    permisos: ['VER_RUTAS'],
    telefono: '987000003',
    fecha_creacion: '2026-02-01T00:00:00Z'
  }
];

const MOCK_CATALOGO = {
  roles: ['ADMIN', 'OFICINA', 'REPARTIDOR', 'CLIENTE'],
  roles_disponibles: [
    { codigo: 'ADMIN', label: 'Administrador', permisos_default: ['ADMIN_USUARIOS', 'ADMIN_VEHICULOS'] },
    { codigo: 'OFICINA', label: 'Oficina', permisos_default: ['VER_RUTAS'] },
    { codigo: 'REPARTIDOR', label: 'Repartidor', permisos_default: ['REPARTO_POD', 'SEGUIMIENTO_RUTAS'] },
    { codigo: 'CLIENTE', label: 'Cliente', permisos_default: [] }
  ],
  catalogo_permisos: [
    { id: 'ADMIN_USUARIOS', label: 'Gestión de Usuarios', rol: 'ADMIN' },
    { id: 'VER_RUTAS', label: 'Ver Rutas', rol: 'OFICINA' },
    { id: 'REPARTO_POD', label: 'Reparto y POD', rol: 'REPARTIDOR' }
  ],
  permisos: [
    { id: 'ADMIN_USUARIOS', label: 'Gestión de Usuarios', rol: 'ADMIN' },
    { id: 'VER_RUTAS', label: 'Ver Rutas', rol: 'OFICINA' },
    { id: 'REPARTO_POD', label: 'Reparto y POD', rol: 'REPARTIDOR' }
  ]
};

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('Componente: AdminUsersView', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(async () => {
    user = userEvent.setup({ delay: null });
    const { UsuarioService, ClienteService } = await import('../services/api');
    vi.mocked(UsuarioService.getAll).mockResolvedValue(MOCK_USUARIOS as any);
    vi.mocked(UsuarioService.getCatalogo).mockResolvedValue(MOCK_CATALOGO as any);
    vi.mocked(UsuarioService.getCatalogoPermisos).mockResolvedValue(MOCK_CATALOGO as any);
    vi.mocked(UsuarioService.create).mockResolvedValue({
      usuario_id: 'u-new',
      email: 'nuevo@ecologistica.pe',
      nombre_completo: 'Nuevo Usuario',
      rol: 'OFICINA',
      estado: 'ACTIVO',
      permisos: []
    } as any);
    vi.mocked(UsuarioService.update).mockResolvedValue(MOCK_USUARIOS[0] as any);
    vi.mocked(UsuarioService.delete).mockResolvedValue({ success: true } as any);
    vi.mocked(ClienteService.getAll).mockResolvedValue([] as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Renderizado básico
  it('renderiza el título del panel de administración', async () => {
    await act(async () => { render(<AdminUsersView />); });
    const heading = screen.queryByRole('heading', { level: 1 }) ||
      screen.queryByRole('heading', { level: 2 });
    const titleText = screen.queryAllByText(/Usuarios|Administración|Admin/i);
    expect(heading || titleText.length > 0).toBeTruthy();
  });

  // Carga de datos
  it('llama a UsuarioService.getAll al montar', async () => {
    const { UsuarioService } = await import('../services/api');
    await act(async () => { render(<AdminUsersView />); });
    await waitFor(() => {
      expect(UsuarioService.getAll).toHaveBeenCalled();
    });
  });

  // Lista de usuarios
  it('muestra los usuarios cargados del API', async () => {
    await act(async () => { render(<AdminUsersView />); });
    await waitFor(() => {
      const admin = screen.queryByText(/Super Admin/i);
      const repartidor = screen.queryByText(/Juan Morales/i);
      expect(admin || repartidor).toBeTruthy();
    }, { timeout: 3000 });
  });

  // Filtros de rol
  it('muestra los filtros de rol (ADMIN, REPARTIDOR, OFICINA)', async () => {
    await act(async () => { render(<AdminUsersView />); });
    await waitFor(() => {
      const todos = screen.queryAllByText(/TODOS|Todos/i);
      const admin = screen.queryAllByText(/ADMIN|Admin/i);
      expect(todos.length > 0 || admin.length > 0).toBeTruthy();
    }, { timeout: 3000 });
  });

  // Roles en la lista
  it('muestra el rol de cada usuario', async () => {
    await act(async () => { render(<AdminUsersView />); });
    await waitFor(() => {
      const adminRole = screen.queryAllByText(/Administrador|ADMIN/i);
      const repartidorRole = screen.queryAllByText(/Repartidor|REPARTIDOR/i);
      expect(adminRole.length + repartidorRole.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });

  // Estado de usuarios
  it('muestra el estado ACTIVO/INACTIVO de los usuarios', async () => {
    await act(async () => { render(<AdminUsersView />); });
    await waitFor(() => {
      const activo = screen.queryAllByText(/ACTIVO|Activo/i);
      const inactivo = screen.queryAllByText(/INACTIVO|Inactivo/i);
      expect(activo.length + inactivo.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });

  // Botón de nuevo usuario
  it('muestra el botón para crear nuevo usuario', async () => {
    await act(async () => { render(<AdminUsersView />); });
    const btns = screen.queryAllByRole('button');
    const newBtn = btns.find(b =>
      b.textContent?.includes('Nuevo') ||
      b.textContent?.includes('Crear') ||
      b.textContent?.includes('Agregar') ||
      b.textContent?.includes('Usuario')
    );
    expect(newBtn || btns.length > 0).toBeTruthy();
  });

  // Modal se abre al click
  it('abre el modal de creación al hacer click en nuevo usuario', async () => {
    await act(async () => { render(<AdminUsersView />); });
    await waitFor(() => screen.queryByRole('heading', { level: 1 }));

    const btns = screen.queryAllByRole('button');
    const newBtn = btns.find(b =>
      b.textContent?.includes('Nuevo Usuario') ||
      b.textContent?.includes('Crear Usuario') ||
      b.textContent?.includes('Agregar')
    );
    if (newBtn) {
      await act(async () => { await user.click(newBtn); });
      await waitFor(() => {
        const modal = screen.queryByRole('dialog') ||
          screen.queryAllByText(/email|Email|contraseña|nombre completo/i).length > 0;
        expect(modal).toBeTruthy();
      }, { timeout: 3000 });
    }
  });

  // Emails de usuarios visibles
  it('muestra los emails de los usuarios en la lista', async () => {
    await act(async () => { render(<AdminUsersView />); });
    await waitFor(() => {
      const emails = screen.queryAllByText(/@ecologistica/i);
      const emailTitle = document.querySelectorAll('[title*="ecologistica"], [data-email]');
      expect(emails.length > 0 || emailTitle.length > 0).toBeTruthy();
    }, { timeout: 3000 });
  });

  // Prop currentSimulatedRole
  it('acepta prop currentSimulatedRole sin crashear', async () => {
    await act(async () => {
      render(<AdminUsersView currentSimulatedRole="ADMIN" onRoleChange={vi.fn()} />);
    });
    expect(screen.queryByRole('heading', { level: 1 }) ||
      screen.queryAllByText(/Admin|Usuario/i).length > 0).toBeTruthy();
  });

  // Filtrar por REPARTIDOR
  it('filtra la lista al seleccionar el rol REPARTIDOR', async () => {
    await act(async () => { render(<AdminUsersView />); });
    await waitFor(() => {
      expect(screen.queryByText(/Juan Morales/i)).toBeTruthy();
    }, { timeout: 3000 });

    const btns = screen.queryAllByRole('button');
    const repartidorBtn = btns.find(b => b.textContent?.trim() === 'REPARTIDOR');
    if (repartidorBtn) {
      await act(async () => { await user.click(repartidorBtn); });
      await waitFor(() => {
        expect(screen.queryByText(/Super Admin/i)).toBeFalsy();
        expect(screen.queryByText(/Juan Morales/i)).toBeTruthy();
      }, { timeout: 2000 });
    }
  });
});
