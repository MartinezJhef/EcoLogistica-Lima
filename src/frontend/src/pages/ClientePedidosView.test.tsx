import React from 'react';
import {beforeEach,describe,it,expect,vi} from 'vitest';
import {render,screen,fireEvent,waitFor} from '@testing-library/react';
import {ClientePedidosView} from './ClientePedidosView';
import {api} from '../services/api';
vi.mock('../services/api',()=>({api:{get:vi.fn(),patch:vi.fn()}}));
const pedido={pedido_id:'p1',codigo_seguimiento:'PED-001',direccion_destino:'Av. Lima 123',estado:'PENDIENTE',
  ventana_inicio:'08:00:00',ventana_fin:'18:00:00',restriccion_acceso:'LIBRE_ACCESO',referencia_ubicacion:'Puerta roja'};
describe('Preferencias propias del cliente',()=>{
  beforeEach(()=>{vi.clearAllMocks();vi.mocked(api.get).mockResolvedValue({data:[pedido]});});
  it('guarda las preferencias en el servidor y muestra la confirmación',async()=>{
    vi.mocked(api.patch).mockResolvedValue({data:{...pedido,referencia_ubicacion:'Puerta azul'}});
    render(<ClientePedidosView/>);
    fireEvent.click(await screen.findByRole('button',{name:/Editar preferencias/}));
    fireEvent.change(screen.getByLabelText('Referencia de entrega'),{target:{value:'Puerta azul'}});
    fireEvent.change(screen.getByLabelText('Hora de apertura'),{target:{value:'09:00'}});
    fireEvent.change(screen.getByLabelText('Hora de cierre'),{target:{value:'16:00'}});
    fireEvent.change(screen.getByLabelText('Restricción de acceso'),{target:{value:'ALTURA_MAXIMA_2_5M'}});
    fireEvent.change(screen.getByLabelText('Teléfono de contacto'),{target:{value:'999888777'}});
    fireEvent.click(screen.getByRole('button',{name:'Guardar mis preferencias'}));
    await screen.findByText(/Preferencias guardadas/);
    expect(api.patch).toHaveBeenCalledWith('/mobile/pedidos/p1/preferencias',expect.objectContaining({referencia_ubicacion:'Puerta azul',ventana_inicio:'09:00',ventana_fin:'16:00',restriccion_acceso:'ALTURA_MAXIMA_2_5M',telefono_contacto:'999888777'}));
  });
  it('conserva el formulario y permite reintentar cuando falla el servidor',async()=>{
    vi.mocked(api.patch).mockRejectedValue(new Error('Sin conexión'));
    render(<ClientePedidosView/>);
    fireEvent.click(await screen.findByRole('button',{name:/Editar preferencias/}));
    fireEvent.change(screen.getByLabelText('Referencia de entrega'),{target:{value:'Mi referencia pendiente'}});
    fireEvent.click(screen.getByRole('button',{name:'Guardar mis preferencias'}));
    await screen.findByText('Sin conexión');
    expect(screen.getByLabelText('Referencia de entrega')).toHaveValue('Mi referencia pendiente');
    expect(screen.getByRole('button',{name:'Guardar mis preferencias'})).toBeEnabled();
  });
  it('bloquea la edición cuando el pedido está en tránsito',async()=>{
    vi.mocked(api.get).mockResolvedValue({data:[{...pedido,estado:'EN_TRANSITO'}]});
    render(<ClientePedidosView/>);
    fireEvent.click(await screen.findByRole('button',{name:/Editar preferencias/}));
    expect(screen.getByRole('button',{name:'Guardar mis preferencias'})).toBeDisabled();
    expect(screen.getByLabelText('Referencia de entrega')).toBeDisabled();
    expect(api.patch).not.toHaveBeenCalled();
  });
  it('restringe fotos y adjunta una imagen válida al guardar',async()=>{
    vi.mocked(api.patch).mockResolvedValue({data:pedido});
    render(<ClientePedidosView/>);
    fireEvent.click(await screen.findByRole('button',{name:/Editar preferencias/}));
    fireEvent.change(screen.getByLabelText('Fotografía de referencia'),{target:{files:[new File(['x'],'test.txt',{type:'text/plain'})]}});
    await screen.findByText(/Adjunta una foto/);
    fireEvent.change(screen.getByLabelText('Fotografía de referencia'),{target:{files:[new File(['png'],'test.png',{type:'image/png'})]}});
    await screen.findByAltText('Referencia del punto de entrega');
    fireEvent.click(screen.getByRole('button',{name:'Guardar mis preferencias'}));
    await waitFor(()=>expect(api.patch).toHaveBeenCalledWith(expect.any(String),expect.objectContaining({foto_referencia_url:expect.stringMatching(/^data:image\/png;base64,/)})));
  });
  it('el repartidor solo consulta y puede actualizar la lista',async()=>{
    render(<ClientePedidosView readOnly/>);
    await screen.findByText('PED-001');
    expect(screen.queryByRole('button',{name:/Editar preferencias/})).toBeNull();
    fireEvent.click(screen.getByRole('button',{name:'Actualizar pedidos'}));
    await waitFor(()=>expect(api.get).toHaveBeenCalledTimes(2));
  });
  it('actualizar pedidos bloquea un formulario abierto si el pedido salió a reparto',async()=>{
    render(<ClientePedidosView/>);
    fireEvent.click(await screen.findByRole('button',{name:/Editar preferencias/}));
    vi.mocked(api.get).mockResolvedValue({data:[{...pedido,estado:'EN_TRANSITO'}]});
    fireEvent.click(screen.getByRole('button',{name:'Actualizar pedidos'}));
    await waitFor(()=>expect(screen.getByRole('button',{name:'Guardar mis preferencias'})).toBeDisabled());
    expect(api.patch).not.toHaveBeenCalled();
  });
  it.each(['ENTREGADO','NO_ENTREGADO','CANCELADO'])('no permite cambiar preferencias del pedido cerrado %s',async estado=>{
    vi.mocked(api.get).mockResolvedValue({data:[{...pedido,estado}]});
    render(<ClientePedidosView/>);
    fireEvent.click(await screen.findByRole('button',{name:/Editar preferencias/}));
    expect(screen.getByRole('button',{name:'Guardar mis preferencias'})).toBeDisabled();
    expect(screen.getByText(/El pedido ya está cerrado/)).toBeInTheDocument();
  });
});
