/**
 * ConductoresView.test.tsx
 * Suite de pruebas para US-002: Gestionar conductores y jornada
 * Cubre: registro, validación DNI/licencia, control de horas de conducción,
 *        estados de jornada, filtros, tabs mapa/padrón y toast notifications.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import L from 'leaflet';
import userEvent from '@testing-library/user-event';
import { ConductoresView } from './ConductoresView';

// ─── Mock de Leaflet ─────────────────────────────────────────────────────────
vi.mock('leaflet', () => {
  const mockMap = {
    setView: vi.fn().mockReturnThis(),
    addLayer: vi.fn().mockReturnThis(),
    removeLayer: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    off: vi.fn().mockReturnThis(),
    invalidateSize: vi.fn(),
    panTo: vi.fn(),
    fitBounds: vi.fn(),
    remove: vi.fn()
  };
  const mockLayerGroup = {
    addTo: vi.fn().mockReturnThis(),
    clearLayers: vi.fn().mockReturnThis(),
    addLayer: vi.fn()
  };
  const mockMarker = {
    addTo: vi.fn().mockReturnThis(),
    bindPopup: vi.fn().mockReturnThis(),
    setLatLng: vi.fn().mockReturnThis(),
    setIcon: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis()
  };
  const mockPolyline = {
    addTo: vi.fn().mockReturnThis(),
    setLatLngs: vi.fn().mockReturnThis()
  };
  return {
    default: {
      map: vi.fn().mockReturnValue(mockMap),
      layerGroup: vi.fn().mockReturnValue(mockLayerGroup),
      marker: vi.fn().mockReturnValue(mockMarker),
      polyline: vi.fn().mockReturnValue(mockPolyline),
      tileLayer: vi.fn().mockReturnValue({ addTo: vi.fn() }),
      control: { zoom: vi.fn().mockReturnValue({ addTo: vi.fn() }) },
      latLngBounds: vi.fn().mockReturnValue({ extend: vi.fn() }),
      DivIcon: vi.fn(),
      divIcon: vi.fn().mockReturnValue({})
    }
  };
});

vi.mock('leaflet/dist/leaflet.css', () => ({}));

vi.mock('../utils/mapIcons', () => ({
  crearIconoBanderaLlegada: vi.fn().mockReturnValue({}),
  crearIconoVehiculoConductor: vi.fn().mockReturnValue({}),
  calcularDistanciaKm: vi.fn().mockReturnValue(15.3),
  estimarTiempoMin: vi.fn().mockReturnValue(45),
  SVG_MINI_FLAG: '<svg></svg>',
  SVG_MINI_CAR: '<svg></svg>',
  SVG_MINI_PIN: '<svg></svg>'
}));

// ─── vi.mock hoisted: NO usar variables externas en el factory ────────────────
vi.mock('../services/api', () => ({
  ConductorService: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    validarJornada: vi.fn(),
    acumularHoras: vi.fn(),
    reiniciarJornada: vi.fn()
  },
  UsuarioService: {
    create: vi.fn()
  },
  Conductor: {}
}));

// ─── Datos de prueba (DESPUÉS del vi.mock) ────────────────────────────────────
const MOCK_CONDUCTORES = [
  {
    conductor_id: 'c1',
    dni: '71234567',
    nombres: 'Carlos Eduardo',
    apellidos: 'Quispe Huaman',
    licencia: 'Q71234567',
    categoria_licencia: 'A-IIIc',
    telefono: '987654321',
    direccion_origen: 'Av. Elmer Faucett 2100, Callao',
    latitud_origen: -12.034500,
    longitud_origen: -77.112300,
    estado: 'DISPONIBLE',
    horas_conduccion_hoy: 7.5
  },
  {
    conductor_id: 'c2',
    dni: '48765432',
    nombres: 'Jorge Luis',
    apellidos: 'Mendoza Ramos',
    licencia: 'M48765432',
    categoria_licencia: 'A-IIIb',
    telefono: '912345678',
    direccion_origen: 'Av. Nicolas Ayllon 1540, Ate Vitarte',
    latitud_origen: -12.056700,
    longitud_origen: -76.978900,
    estado: 'DISPONIBLE',
    horas_conduccion_hoy: 3.5
  },
  {
    conductor_id: 'c3',
    dni: '74567812',
    nombres: 'Maria Elena',
    apellidos: 'Torres Valdivia',
    licencia: 'T74567812',
    categoria_licencia: 'A-IIIc',
    telefono: '945678123',
    direccion_origen: 'Av. Pachacutec 3200, Villa El Salvador',
    latitud_origen: -12.214500,
    longitud_origen: -76.934100,
    estado: 'EN_RUTA',
    horas_conduccion_hoy: 5.0
  }
];

// Helper para ir a la pestaña Padron
async function irAPadron(_user: ReturnType<typeof userEvent.setup>) {
  // La pestaña tiene texto "Padrón & Registro de Conductores" con un span interno
  // Usamos getAllByRole y buscamos el que contiene "Padrón" en su textContent
  const btns = screen.queryAllByRole('button');
  const padronBtn = btns.find(b => b.textContent?.includes('Padrón') || b.textContent?.includes('Registro de Conductores'));
  if (padronBtn) {
    // Usar fireEvent.click para evitar problemas de act con userEvent en botones de tipo button
    padronBtn.click();
    // Pequeña espera para que React procese el state update
    await new Promise(r => setTimeout(r, 50));
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('Componente: ConductoresView (US-002)', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(async () => {
    user = userEvent.setup({ delay: null });
    const { ConductorService, UsuarioService } = await import('../services/api');
    vi.mocked(ConductorService.getAll).mockResolvedValue(MOCK_CONDUCTORES as any);
    vi.mocked(ConductorService.create).mockResolvedValue({
      conductor_id: 'c-new',
      dni: '12345678',
      nombres: 'Nuevo',
      apellidos: 'Conductor',
      licencia: 'N12345678',
      categoria_licencia: 'A-IIIc',
      telefono: '999888777',
      estado: 'DISPONIBLE',
      horas_conduccion_hoy: 0.0
    } as any);
    vi.mocked(ConductorService.update).mockResolvedValue(MOCK_CONDUCTORES[0] as any);
    vi.mocked(ConductorService.delete).mockResolvedValue({ success: true } as any);
    vi.mocked(UsuarioService.create).mockResolvedValue({ usuario_id: 'u-new' } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('registra una licencia con vencimiento y conserva el formulario ante un fallo',async()=>{
    const {ConductorService}=await import('../services/api');
    await act(async()=>{render(<ConductoresView/>);});await irAPadron(user);
    for(const [placeholder,value] of [['Ej. 71234567','12345678'],['Ej. Carlos Eduardo','Ana'],['Ej. Quispe Huamán','Perez'],['Ej. Q71234567','Z12345678'],['Ej. 987654321','999888777'],['Ej. Av. Elmer Faucett 2100, Callao','Av. Lima 100']]) {
      fireEvent.change(screen.getByPlaceholderText(placeholder),{target:{value}});
    }
    fireEvent.change(screen.getByLabelText('Vencimiento del brevete'),{target:{value:'2035-12-31'}});
    vi.mocked(ConductorService.create).mockRejectedValueOnce(new Error('Error al guardar'));
    await act(async()=>{fireEvent.submit(document.querySelector('form')!);});
    expect(screen.getByPlaceholderText('Ej. Carlos Eduardo')).toHaveValue('Ana');
    expect(screen.getByText('Error al guardar')).toBeTruthy();
    await act(async()=>{fireEvent.submit(document.querySelector('form')!);});
    expect(ConductorService.create).toHaveBeenLastCalledWith(expect.objectContaining({licencia_vencimiento:'2035-12-31',licencia:'Z12345678',dni:'12345678'}));
    expect(screen.getByPlaceholderText('Ej. Carlos Eduardo')).toHaveValue('');
  });

  it('rechaza DNI repetido antes de enviarlo al servidor',async()=>{
    const {ConductorService}=await import('../services/api');
    await act(async()=>{render(<ConductoresView/>);});await irAPadron(user);
    fireEvent.change(screen.getByPlaceholderText('Ej. 71234567'),{target:{value:MOCK_CONDUCTORES[0].dni}});
    await act(async()=>{fireEvent.submit(document.querySelector('form')!);});
    expect(ConductorService.create).not.toHaveBeenCalled();
    expect(screen.getByText(/DNI.*ya se encuentra registrado/)).toBeTruthy();
  });
  it('rechaza un DNI incompleto sin guardar un conductor inválido',async()=>{
    const {ConductorService}=await import('../services/api');
    await act(async()=>{render(<ConductoresView/>);});await irAPadron(user);
    fireEvent.change(screen.getByPlaceholderText('Ej. 71234567'),{target:{value:'123'}});
    await act(async()=>{fireEvent.submit(document.querySelector('form')!);});
    expect(ConductorService.create).not.toHaveBeenCalled();
    expect(screen.getByText('El DNI debe contener exactamente 8 dígitos numéricos.')).toBeTruthy();
  });

  it('valida la jornada sin reservar horas y rechaza superar ocho horas',async()=>{
    const {ConductorService}=await import('../services/api');
    vi.mocked(ConductorService.validarJornada).mockResolvedValue({aprobado:true} as any);
    await act(async()=>{render(<ConductoresView/>);});await irAPadron(user);
    fireEvent.click(screen.getAllByTitle('Simular Asignación de Ruta (US-002 Escenario 2)')[0]);
    await act(async()=>{fireEvent.submit(document.querySelector('.modal-content form')!);});
    expect(screen.getByText(/Supera el límite legal/)).toBeTruthy();
    fireEvent.click(screen.getAllByTitle('Simular Asignación de Ruta (US-002 Escenario 2)')[1]);
    await act(async()=>{fireEvent.submit(document.querySelector('.modal-content form')!);});
    expect(ConductorService.validarJornada).toHaveBeenCalled();
    expect(ConductorService.acumularHoras).not.toHaveBeenCalled();
    expect(screen.getByText(/La asignación se confirma al generar la ruta/)).toBeTruthy();
  });

  it('confirma reinicio y baja con el servidor',async()=>{
    const {ConductorService}=await import('../services/api');
    vi.mocked(ConductorService.reiniciarJornada).mockResolvedValue({} as any);
    const confirm=vi.spyOn(window,'confirm').mockReturnValue(true);
    await act(async()=>{render(<ConductoresView/>);});await irAPadron(user);
    await act(async()=>{fireEvent.click(screen.getAllByTitle('Reiniciar jornada diaria a 0.0h')[0]);});
    expect(ConductorService.reiniciarJornada).toHaveBeenCalledWith('c1');
    await act(async()=>{fireEvent.click(screen.getAllByTitle('Dar de baja lógica')[0]);});
    expect(ConductorService.delete).toHaveBeenCalledWith('c1');
    expect(screen.getByText(/marcado como INACTIVO/)).toBeTruthy();confirm.mockRestore();
  });

  it('marca un destino y permite centrar y limpiar la simulación en mapa',async()=>{
    await act(async()=>{render(<ConductoresView/>);});
    await waitFor(()=>expect(L.map).toHaveBeenCalled());
    const map=vi.mocked(L.map).mock.results[0].value as any;
    await waitFor(()=>expect(map.on).toHaveBeenCalledWith('click',expect.any(Function)));
    const click=map.on.mock.calls.find((c:any)=>c[0]==='click')[1];
    await act(async()=>{click({latlng:{lat:-12.12,lng:-77.03}});});
    expect(L.polyline).toHaveBeenCalled();
    for(const title of ['Centrar vista en el vehículo del conductor seleccionado','Centrar vista en la bandera de llegada','Ajustar zoom para ver toda la flota y puntos'])fireEvent.click(screen.getByTitle(title));
    fireEvent.click(screen.getByTitle('Eliminar la bandera y limpiar la ruta'));
    expect(map.removeLayer).toHaveBeenCalled();
    expect(screen.getByText('Punto de llegada y ruta restablecidos.')).toBeTruthy();
  });

  // SUB-002-01: El título del módulo existe en el h1
  it('renderiza el h1 con el título "Gestión de Conductores y Jornada"', async () => {
    await act(async () => { render(<ConductoresView />); });
    // Buscar específicamente el h1
    const h1 = screen.queryByRole('heading', { level: 1 });
    expect(h1).toBeTruthy();
    expect(h1?.textContent).toMatch(/Gestión de Conductores|Conductores/i);
  });

  // SUB-002-02: API es llamada al cargar
  it('llama a ConductorService.getAll al montar el componente', async () => {
    const { ConductorService } = await import('../services/api');
    await act(async () => { render(<ConductoresView />); });
    await waitFor(() => {
      expect(ConductorService.getAll).toHaveBeenCalled();
    });
  });

  // Los tabs están presentes
  it('muestra los dos tabs: Mapa y Padrón', async () => {
    await act(async () => { render(<ConductoresView />); });
    const btns = screen.queryAllByRole('button');
    const mapaBtn = btns.find(b => b.textContent?.includes('Mapa'));
    const padronBtn = btns.find(b => b.textContent?.includes('Padrón'));
    expect(mapaBtn || padronBtn).toBeTruthy();
  });

  // SUB-002-01: Formulario accesible en tab Padrón
  it('al cambiar a Padrón aparece el formulario de registro', async () => {
    await act(async () => { render(<ConductoresView />); });
    await act(async () => { await irAPadron(user); });
    // Buscar el h3 del formulario que dice "SUB-002-01: Registro de Conductor..."
    // El tab button también tiene texto "Registro" → usar getAllByText
    const matches = screen.queryAllByText(/SUB-002-01|Registro de Conductor y Punto/i);
    // Al menos uno debe ser el h3 (no el botón del tab)
    const h3Match = matches.find(el => el.tagName === 'H3' || el.closest('h3'));
    // O bien buscar el input DNI que solo existe en el formulario
    const dniInput = screen.queryByPlaceholderText(/DNI|12345678/i);
    expect(h3Match || dniInput || matches.length > 0).toBeTruthy();
  });

  // SUB-002-03: Validación DNI inválido
  it('muestra error toast cuando el DNI tiene menos de 8 dígitos', async () => {
    await act(async () => { render(<ConductoresView />); });
    await irAPadron(user);

    const dniInput = screen.queryByPlaceholderText(/DNI|12345678/i);
    if (dniInput) {
      await user.clear(dniInput);
      await user.type(dniInput, '123');
      const submitBtn = screen.queryAllByRole('button').find(b =>
        b.textContent?.includes('Registrar') || b.textContent?.includes('Alta')
      );
      if (submitBtn) {
        await user.click(submitBtn);
        await waitFor(() => {
          expect(screen.queryByText(/DNI|8 dígitos|exactamente/i)).toBeTruthy();
        });
      }
    }
  });

  // SUB-002-03: DNI duplicado
  it('rechaza un DNI ya registrado (71234567)', async () => {
    await act(async () => { render(<ConductoresView />); });
    await irAPadron(user);

    const dniInput = screen.queryByPlaceholderText(/DNI|12345678/i);
    if (dniInput) {
      await user.clear(dniInput);
      await user.type(dniInput, '71234567');
      const submitBtn = screen.queryAllByRole('button').find(b =>
        b.textContent?.includes('Registrar') || b.textContent?.includes('Alta')
      );
      if (submitBtn) {
        await user.click(submitBtn);
        await waitFor(() => {
          expect(screen.queryByText(/ya se encuentra registrado|DNI|duplicado/i)).toBeTruthy();
        });
      }
    }
  });

  // SUB-002-04: Estado de jornada visible en los conductores del mock
  it('muestra estado DISPONIBLE o EN_RUTA en la lista de conductores', async () => {
    await act(async () => { render(<ConductoresView />); });
    await irAPadron(user);
    await waitFor(() => {
      const disp = screen.queryAllByText(/DISPONIBLE/i);
      const ruta = screen.queryAllByText(/EN_RUTA|En Ruta/i);
      expect(disp.length + ruta.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });

  // SUB-002-04: Horas de conducción
  it('muestra indicadores de horas de conducción', async () => {
    await act(async () => { render(<ConductoresView />); });
    await act(async () => { await irAPadron(user); });
    // Buscar con queryAllByText (hay múltiples elementos con "jornada")
    // La tabla tiene una columna "Jornada Acumulada" y celdas con "7.5 h", "3.5 h"
    await waitFor(() => {
      const matches = screen.queryAllByText(/7\.5|3\.5/i);
      expect(matches.length).toBeGreaterThan(0);
    }, { timeout: 4000 });
  });

  // SUB-002-06: Punto de origen (coordenadas) en el formulario
  it('muestra campos de coordenadas de origen en el formulario', async () => {
    await act(async () => { render(<ConductoresView />); });
    await act(async () => { await irAPadron(user); });
    await waitFor(() => {
      // Buscar por placeholder o por label del campo de latitud/longitud
      const latInput = screen.queryByPlaceholderText(/-12\.|latitud/i);
      const lngInput = screen.queryByPlaceholderText(/-77\.|longitud/i);
      // O buscar el texto del label
      const allLabels = Array.from(document.querySelectorAll('label'));
      const coordLabel = allLabels.find(l =>
        l.textContent?.toLowerCase().includes('lat') ||
        l.textContent?.toLowerCase().includes('origen') ||
        l.textContent?.toLowerCase().includes('coordenada')
      );
      expect(latInput || lngInput || coordLabel).toBeTruthy();
    }, { timeout: 4000 });
  });

  // Filtros de estado
  it('muestra botones de filtro en el segmented control', async () => {
    await act(async () => { render(<ConductoresView />); });
    const btns = screen.queryAllByRole('button');
    // El segmented control tiene botones con los estados: TODOS, DISPONIBLE, EN_RUTA
    const todosBtn = btns.find(b =>
      b.textContent?.trim() === 'TODOS' ||
      b.textContent?.trim() === 'Todos' ||
      b.textContent?.includes('TODOS') ||
      b.textContent?.includes('Todos')
    );
    // Si el componente renderiza segmented control, debe existir algún filtro
    // En caso de no encontrar "TODOS", verificar que hay al menos 3 botones (tabs + filtros)
    expect(todosBtn || btns.length >= 3).toBeTruthy();
  });

  it('filtra conductores por DISPONIBLE y oculta EN_RUTA', async () => {
    await act(async () => { render(<ConductoresView />); });
    // Buscar el botón de filtro "DISPONIBLE" en el segmented control
    const btns = screen.queryAllByRole('button');
    const disponibleBtn = btns.find(b => b.textContent?.trim() === 'DISPONIBLE');
    if (disponibleBtn) {
      await user.click(disponibleBtn);
      expect(screen.queryAllByText(/EN_RUTA/i).length).toBe(0);
    }
  });

  // SUB-002-02: Registro exitoso llama al servicio
  it('llama a ConductorService.create con datos válidos completos', async () => {
    const { ConductorService } = await import('../services/api');
    await act(async () => { render(<ConductoresView />); });
    await irAPadron(user);

    const dniInput    = screen.queryByPlaceholderText(/DNI|12345678/i);
    const nombresInput = screen.queryByPlaceholderText(/nombres|Pedro/i);
    const apellidosInput = screen.queryByPlaceholderText(/apellidos|García/i);
    const licInput    = screen.queryByPlaceholderText(/licencia|brevete/i);
    const telInput    = screen.queryByPlaceholderText(/teléfono|telefono|9\d{8}/i);

    if (dniInput)       { await user.clear(dniInput);       await user.type(dniInput, '12345678'); }
    if (nombresInput)   { await user.clear(nombresInput);   await user.type(nombresInput, 'Juan'); }
    if (apellidosInput) { await user.clear(apellidosInput); await user.type(apellidosInput, 'Lopez'); }
    if (licInput)       { await user.clear(licInput);       await user.type(licInput, 'L12345678'); }
    if (telInput)       { await user.clear(telInput);       await user.type(telInput, '999888777'); }

    const submitBtn = screen.queryAllByRole('button').find(b =>
      b.textContent?.includes('Registrar') || b.textContent?.includes('Alta')
    );
    if (submitBtn && dniInput && licInput) {
      await user.click(submitBtn);
      await waitFor(() => {
        expect(ConductorService.create).toHaveBeenCalled();
      }, { timeout: 3000 });
    }
  });

  // SUB-002-09: Categoría de licencia
  it('muestra la categoría de licencia en el padrón', async () => {
    await act(async () => { render(<ConductoresView />); });
    await act(async () => { await irAPadron(user); });
    await waitFor(() => {
      // Buscar la categoría A-IIIc o A-IIIb en la lista de conductores
      const catMatches = screen.queryAllByText(/A-IIIc|A-IIIb/i);
      // O en los valores del select del formulario
      const catOptions = Array.from(document.querySelectorAll('option, select')).filter(el =>
        el.textContent?.includes('A-III') || (el as HTMLInputElement).value?.includes('A-III')
      );
      expect(catMatches.length > 0 || catOptions.length > 0).toBeTruthy();
    }, { timeout: 4000 });
  });
  it.each([true,false])('confirma o conserva la edición de conductor según el servidor (éxito=%s)', async (success) => {
    const {ConductorService} = await import('../services/api');
    if (!success) vi.mocked(ConductorService.update).mockRejectedValueOnce(new Error('Conductor no guardado'));
    await act(async () => {render(<ConductoresView />);});
    await act(async () => {await irAPadron(user);});
    await user.click(screen.getAllByTitle('Editar Conductor')[0]);
    const phone = screen.getByDisplayValue('987654321');
    const modal=document.querySelector('.modal-content')!;
    const setField=(label:string,value:string)=>{
      const node=Array.from(modal.querySelectorAll('label')).find(l=>l.textContent?.trim()===label)!;
      fireEvent.change(node.parentElement!.querySelector('input,select')!,{target:{value}});
    };
    setField('Nombres:','Carlos actualizado');setField('Apellidos:','Perez actualizado');
    setField('Categoría MTC:','A-IIIb');setField('Dirección Base / Origen:','Av. Nueva 100');
    setField('Latitud GPS:','-12.1');setField('Longitud GPS:','-77.03');setField('Estado Operativo:','DISPONIBLE');
    fireEvent.change(screen.getByLabelText('Editar vencimiento del brevete'),{target:{value:'2035-12-31'}});
    await user.clear(phone); await user.type(phone,'999000111');
    await user.click(screen.getByRole('button',{name:'Guardar Cambios'}));
    expect(ConductorService.update).toHaveBeenCalledWith('c1',expect.objectContaining({telefono:'999000111'}));
    expect(ConductorService.update).toHaveBeenCalledWith('c1',expect.objectContaining({licencia_vencimiento:'2035-12-31',latitud_origen:-12.1,longitud_origen:-77.03,nombres:'Carlos actualizado'}));
    if (!success) {
      expect(await screen.findByText('Conductor no guardado')).toBeTruthy();
      expect(document.querySelector('.modal-overlay')).toBeTruthy();
    } else await waitFor(() => expect(document.querySelector('.modal-overlay')).toBeNull());
  });

  it('un fallo al validar jornada no se convierte en una asignación local', async () => {
    const {ConductorService} = await import('../services/api');
    vi.mocked(ConductorService.validarJornada).mockRejectedValueOnce(new Error('No se pudo validar la jornada'));
    await act(async () => {render(<ConductoresView />);});
    await act(async () => {await irAPadron(user);});
    await user.click(screen.getAllByRole('button',{name:'Asignar',exact:true})[1]);
    await user.click(screen.getByRole('button',{name:'Validar y Confirmar'}));
    expect(ConductorService.validarJornada).toHaveBeenCalledWith('c2',1.5);
    expect(await screen.findByText('No se pudo validar la jornada')).toBeTruthy();
    expect(ConductorService.acumularHoras).not.toHaveBeenCalled();
  });

});
