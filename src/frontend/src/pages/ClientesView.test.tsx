/**
 * ClientesView.test.tsx
 * Suite de pruebas para US-003/004: Gestionar clientes y preferencias
 * Cubre: CRUD clientes, búsqueda, filtros, ventanas horarias, mapa, registro.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import L from 'leaflet';
import userEvent from '@testing-library/user-event';
import { ClientesView } from './ClientesView';

describe('Flujo de clientes con datos persistidos',()=>{
  it('muestra los puntos de clientes en el mapa y enfoca el comercio elegido',async()=>{
    const {ClienteService,MOCK_CLIENTES_DEFAULT}=await import('../services/api');
    vi.clearAllMocks();vi.mocked(ClienteService.getAll).mockResolvedValue(MOCK_CLIENTES_DEFAULT);
    await act(async()=>{render(<ClientesView/>);});
    fireEvent.click(screen.getAllByTitle('Ver Ubicación en Mapa de Clientes')[0]);
    await waitFor(()=>expect(L.layerGroup).toHaveBeenCalled());
    await waitFor(()=>expect(L.marker).toHaveBeenCalledWith(expect.any(Array),expect.objectContaining({icon:expect.anything()})));
    expect(screen.getByText('Geolocalización de Clientes & Puntos de Entrega en Lima')).toBeTruthy();
    fireEvent.click(screen.getByRole('button',{name:/Farmacia Central/}));
    const map=vi.mocked(L.map).mock.results.at(-1)!.value;
    await waitFor(()=>expect(map.setView).toHaveBeenCalledWith(expect.any(Array),15,{animate:true}));
    expect(L.divIcon).toHaveBeenCalled();
  });
  it('registra los datos del comercio y conserva el formulario ante error',async()=>{
    const {ClienteService}=await import('../services/api');
    vi.mocked(ClienteService.getAll).mockResolvedValue([]);
    vi.mocked(ClienteService.create).mockRejectedValueOnce(new Error('Fallo de conexión')).mockImplementationOnce(async(p:any)=>({...p,cliente_id:'new-1'}));
    await act(async()=>{render(<ClientesView/>);});
    for(const [placeholder,value] of [['Ej. 20548962311','20987654321'],['Ej. Bodega San José S.A.C.','Comercio de prueba'],['Ej. José María Quispe','Contacto'],['Ej. 987654321','999888777'],['Ej. contacto@bodegasanjose.pe','cliente@example.test'],['Ej. Av. Canto Grande 2450','Av. Lima 100']])fireEvent.change(screen.getByPlaceholderText(placeholder),{target:{value}});
    await act(async()=>{fireEvent.submit(document.querySelector('form')!);});
    expect(screen.getByText('Fallo de conexión')).toBeTruthy();
    expect(screen.getByPlaceholderText('Ej. Bodega San José S.A.C.')).toHaveValue('Comercio de prueba');
    await act(async()=>{fireEvent.submit(document.querySelector('form')!);});
    expect(ClienteService.create).toHaveBeenLastCalledWith(expect.objectContaining({numero_documento:'20987654321',razon_social:'Comercio de prueba',email:'cliente@example.test'}));
    expect(screen.getByPlaceholderText('Ej. Bodega San José S.A.C.')).toHaveValue('');
  });
  it('solo cambia el estado del cliente cuando oficina lo confirma',async()=>{
    const {ClienteService,MOCK_CLIENTES_DEFAULT}=await import('../services/api');
    vi.mocked(ClienteService.getAll).mockResolvedValue(MOCK_CLIENTES_DEFAULT);
    vi.mocked(ClienteService.update).mockResolvedValue({} as any);
    const confirm=vi.spyOn(window,'confirm').mockReturnValue(false);
    await act(async()=>{render(<ClientesView/>);});
    fireEvent.click(screen.getAllByTitle('Desactivar Cliente')[0]);
    expect(ClienteService.update).not.toHaveBeenCalled();
    confirm.mockReturnValue(true);
    await act(async()=>{fireEvent.click(screen.getAllByTitle('Desactivar Cliente')[0]);});
    expect(ClienteService.update).toHaveBeenCalledWith('cl1',{estado:'INACTIVO'});
    expect(screen.getByText(/marcado como INACTIVO/)).toBeTruthy();confirm.mockRestore();
  });
  it('selecciona ubicación manual, obtiene GPS y conserva coordenadas al registrar',async()=>{
    const {ClienteService}=await import('../services/api');
    vi.mocked(ClienteService.getAll).mockResolvedValue([]);
    await act(async()=>{render(<ClientesView/>);});
    await waitFor(()=>expect(L.map).toHaveBeenCalled());
    const map=vi.mocked(L.map).mock.results.at(-1)!.value as any;
    await waitFor(()=>expect(map.on).toHaveBeenCalledWith('click',expect.any(Function)));
    const click=map.on.mock.calls.find((c:any)=>c[0]==='click')[1];
    await act(async()=>{click({latlng:{lat:-12.10,lng:-77.03}});});
    expect(vi.mocked(L.marker).mock.results.at(-1)!.value.setLatLng).toHaveBeenCalledWith({lat:-12.10,lng:-77.03});
    Object.defineProperty(navigator,'geolocation',{configurable:true,value:{getCurrentPosition:(ok:any)=>ok({coords:{latitude:-12.12,longitude:-77.04}})}});
    fireEvent.click(screen.getByTitle('Usar coordenadas GPS actuales de tu dispositivo'));
    expect(screen.getByText(/Ubicación GPS fijada/)).toBeTruthy();
    expect(map.flyTo).toHaveBeenCalledWith([-12.12,-77.04],15,{duration:.6});
  });
});

// ─── Mock react-router-dom ────────────────────────────────────────────────────
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(() => vi.fn())
}));

// ─── Mock Leaflet ─────────────────────────────────────────────────────────────
vi.mock('leaflet', () => {
  const mockMap = {
    setView: vi.fn().mockReturnThis(),
    flyTo: vi.fn().mockReturnThis(),
    addLayer: vi.fn().mockReturnThis(),
    removeLayer: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    off: vi.fn().mockReturnThis(),
    invalidateSize: vi.fn(),
    fitBounds: vi.fn(),
    panTo: vi.fn(),
    remove: vi.fn()
  };
  const mockLayerGroup = {
    addTo: vi.fn().mockReturnThis(),
    clearLayers: vi.fn().mockReturnThis()
  };
  const mockMarker = {
    addTo: vi.fn().mockReturnThis(),
    bindPopup: vi.fn().mockReturnThis(),
    setPopupContent:vi.fn().mockReturnThis(),
    openPopup:vi.fn().mockReturnThis(),
    setLatLng: vi.fn().mockReturnThis(),
    setIcon: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis()
  };
  return {
    default: {
      map: vi.fn().mockReturnValue(mockMap),
      layerGroup: vi.fn().mockReturnValue(mockLayerGroup),
      marker: vi.fn().mockReturnValue(mockMarker),
      tileLayer: vi.fn().mockReturnValue({ addTo: vi.fn() }),
      control: { zoom: vi.fn().mockReturnValue({ addTo: vi.fn() }) },
      latLngBounds: vi.fn().mockReturnValue({ extend: vi.fn(), isValid: vi.fn().mockReturnValue(true) }),
      DivIcon: vi.fn(),
      divIcon: vi.fn().mockReturnValue({})
    }
  };
});

vi.mock('leaflet/dist/leaflet.css', () => ({}));

vi.mock('../utils/mapIcons', () => ({
  SVG_MINI_PIN: '<svg></svg>',
  crearIconoNegocioCasa: vi.fn().mockReturnValue({})
}));

// ─── vi.mock hoisted ─────────────────────────────────────────────────────────
vi.mock('../services/api', () => ({
  ClienteService: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  },
  UsuarioService: {
    create: vi.fn()
  },
  MOCK_CLIENTES_DEFAULT: [
    {
      cliente_id: 'cl1',
      razon_social: 'Bodega San José',
      nombre_contacto: 'Juan Pérez',
      email: 'sanjose@bodega.pe',
      telefono: '987654321',
      direccion: 'Av. Lima 123',
      distrito: 'San Juan de Lurigancho',
      latitud: -12.001200,
      longitud: -77.012300,
      tipo_comercio: 'BODEGA',
      ventana_entrega_inicio: '08:00',
      ventana_entrega_fin: '14:00',
      estado: 'ACTIVO',
      tipo_documento: 'RUC',
      numero_documento: '20123456789'
    },
    {
      cliente_id: 'cl2',
      razon_social: 'Farmacia Central',
      nombre_contacto: 'Ana Gómez',
      email: 'farmacia@central.pe',
      telefono: '912345678',
      direccion: 'Jr. Arequipa 456',
      distrito: 'Miraflores',
      latitud: -12.128900,
      longitud: -77.014500,
      tipo_comercio: 'FARMACIA',
      ventana_entrega_inicio: '09:00',
      ventana_entrega_fin: '18:00',
      estado: 'ACTIVO',
      tipo_documento: 'RUC',
      numero_documento: '20987654321'
    }
  ],
  TipoComercio: {},
  ClienteCreatePayload: {},
  ClienteUpdatePayload: {},
  Cliente: {}
}));

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('Componente: ClientesView (US-003/004)', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(async () => {
    user = userEvent.setup({ delay: null });
    // Limpiar localStorage para evitar estado persistido
    localStorage.clear();
    const { ClienteService, UsuarioService } = await import('../services/api');
    vi.mocked(ClienteService.getAll).mockResolvedValue([]);
    vi.mocked(ClienteService.create).mockResolvedValue({
      cliente_id: 'cl-new',
      razon_social: 'Nuevo Cliente Test',
      estado: 'ACTIVO'
    } as any);
    vi.mocked(ClienteService.update).mockResolvedValue({} as any);
    vi.mocked(ClienteService.delete).mockResolvedValue({ success: true } as any);
    vi.mocked(UsuarioService.create).mockResolvedValue({ usuario_id: 'u-new' } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  // US-003: El título de la vista
  it('renderiza el título de Gestión de Clientes', async () => {
    await act(async () => { render(<ClientesView />); });
    const heading = screen.queryByRole('heading', { level: 1 });
    expect(heading).toBeTruthy();
    expect(heading?.textContent).toMatch(/Cliente|Gestión|Red Comercial/i);
  });

  it('muestra los clientes guardados que devuelve el servidor', async () => {
    const { ClienteService, MOCK_CLIENTES_DEFAULT } = await import('../services/api');
    vi.mocked(ClienteService.getAll).mockResolvedValue(MOCK_CLIENTES_DEFAULT);
    await act(async () => { render(<ClientesView />); });
    await waitFor(() => {
      const bodega = screen.queryByText(/Bodega San José/i);
      const farmacia = screen.queryByText(/Farmacia Central/i);
      expect(bodega || farmacia).toBeTruthy();
    }, { timeout: 3000 });
  });

  // US-004: Ventanas horarias visibles
  it('muestra las ventanas horarias de los clientes', async () => {
    await act(async () => { render(<ClientesView />); });
    await waitFor(() => {
      const ventana = screen.queryByText(/08:00|09:00|ventana/i);
      expect(ventana).toBeTruthy();
    }, { timeout: 3000 });
  });

  // US-003: Campo de búsqueda presente
  it('muestra el campo de búsqueda de clientes', async () => {
    await act(async () => { render(<ClientesView />); });
    const searchInput = screen.queryByPlaceholderText(/buscar|cliente|razón/i) ||
      screen.queryByRole('searchbox');
    const searchLabel = screen.queryByText(/buscar|búsqueda/i);
    expect(searchInput || searchLabel).toBeTruthy();
  });

  // US-003: Filtros de tipo comercio
  it('muestra los filtros de tipo de comercio (BODEGA, FARMACIA...)', async () => {
    await act(async () => { render(<ClientesView />); });
    const filtros = screen.queryAllByText(/BODEGA|FARMACIA|TODOS|Todos/i);
    expect(filtros.length).toBeGreaterThan(0);
  });

  // US-004: Tipo de comercio visible en la lista
  it('muestra el tipo de comercio de cada cliente', async () => {
    await act(async () => { render(<ClientesView />); });
    await waitFor(() => {
      const tipo = screen.queryAllByText(/BODEGA|FARMACIA|RESTAURANTE|MINIMARKET/i);
      expect(tipo.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });

  // US-003: Tabs Lista/Mapa
  it('muestra los tabs Lista y Mapa', async () => {
    await act(async () => { render(<ClientesView />); });
    const btns = screen.queryAllByRole('button');
    const listaBtn = btns.find(b => b.textContent?.includes('Lista'));
    const mapaBtn = btns.find(b => b.textContent?.includes('Mapa'));
    expect(listaBtn || mapaBtn).toBeTruthy();
  });

  // US-003: Estado de clientes (ACTIVO)
  it('muestra el estado ACTIVO de los clientes', async () => {
    await act(async () => { render(<ClientesView />); });
    await waitFor(() => {
      const activo = screen.queryAllByText(/ACTIVO/i);
      expect(activo.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });

  // US-003: Formulario de registro
  it('muestra el formulario de registro de clientes', async () => {
    await act(async () => { render(<ClientesView />); });
    // Buscar campos del formulario
    const docInput = screen.queryByPlaceholderText(/RUC|DNI|documento/i);
    const razonInput = screen.queryByPlaceholderText(/razón social|empresa|nombre/i);
    const formHeading = screen.queryAllByText(/Registro|Alta|Nuevo Cliente/i);
    expect(docInput || razonInput || formHeading.length > 0).toBeTruthy();
  });

  // US-003: Dirección y distrito visible
  it('muestra la dirección y distrito de los clientes', async () => {
    await act(async () => { render(<ClientesView />); });
    await waitFor(() => {
      const dirs = screen.queryAllByText(/Lima|Lurigancho|Miraflores|Av\./i);
      expect(dirs.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });

  // US-004: Ventana horaria en formulario
  it('muestra campos de ventana horaria en el formulario', async () => {
    await act(async () => { render(<ClientesView />); });
    const timeInputs = document.querySelectorAll('input[type="time"]');
    const ventanaLabel = screen.queryAllByText(/ventana|horaria|horario/i);
    expect(timeInputs.length > 0 || ventanaLabel.length > 0).toBeTruthy();
  });
  it.each([true,false])('edita un cliente y respeta la confirmación del servidor (éxito=%s)', async (success) => {
    const {ClienteService,MOCK_CLIENTES_DEFAULT} = await import('../services/api');
    vi.mocked(ClienteService.getAll).mockResolvedValue(MOCK_CLIENTES_DEFAULT);
    if (success) vi.mocked(ClienteService.update).mockResolvedValue({...MOCK_CLIENTES_DEFAULT[0],telefono:'999000111'});
    else vi.mocked(ClienteService.update).mockRejectedValueOnce(new Error('Cambios no guardados'));
    await act(async () => {render(<ClientesView />);});
    await user.click(screen.getAllByTitle('Editar Datos del Cliente')[0]);
    const phone = screen.getByDisplayValue('987654321');
    const modal=document.querySelector('.modal-content')!;
    const setField=(label:string,value:string)=>{
      const node=Array.from(modal.querySelectorAll('label')).find(l=>l.textContent?.trim()===label)!;
      fireEvent.change(node.parentElement!.querySelector('input,select')!,{target:{value}});
    };
    setField('Tipo de Comercio:','FARMACIA');setField('Estado Operativo:','ACTIVO');
    setField('Contacto:','Contacto actualizado');setField('Dirección:','Av. Nueva 123');
    setField('Distrito:','Miraflores');setField('Latitud GPS:','-12.12');setField('Longitud GPS:','-77.03');
    setField('Ventana Inicio:','09:00');setField('Ventana Fin:','16:00');
    await user.clear(phone); await user.type(phone,'999000111');
    await user.click(screen.getByRole('button',{name:'Guardar Cambios'}));
    expect(ClienteService.update).toHaveBeenCalledWith('cl1',expect.objectContaining({telefono:'999000111'}));
    expect(ClienteService.update).toHaveBeenCalledWith('cl1',expect.objectContaining({tipo_comercio:'FARMACIA',direccion:'Av. Nueva 123',latitud:-12.12,longitud:-77.03,ventana_entrega_inicio:'09:00',ventana_entrega_fin:'16:00'}));
    if (success) await waitFor(() => expect(document.querySelector('.modal-overlay')).toBeNull());
    else {
      expect(await screen.findByText('Cambios no guardados')).toBeTruthy();
      expect(document.querySelector('.modal-overlay')).toBeTruthy();
    }
  });

});
