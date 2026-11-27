import React, { useEffect, useState } from 'react';
import { api, Pedido, PreferenciasClienteUpdate } from '../services/api';

export function ClientePedidosView({ readOnly = false }: { readOnly?: boolean }) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [selected, setSelected] = useState<Pedido | null>(null);
  const [form, setForm] = useState<PreferenciasClienteUpdate>({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const load = async () => {
    try {
      const data = (await api.get<Pedido[]>('/mobile/pedidos')).data;
      setPedidos(data); setMessage('');
      setSelected(previous => previous ? data.find(p => p.pedido_id === previous.pedido_id) || null : null);
    }
    catch { setMessage('No se pudieron cargar tus pedidos. Revisa la conexión.'); }
  };
  useEffect(() => { load(); }, []);
  const edit = (p: Pedido) => {
    setSelected(p); setMessage('');
    setForm({ventana_inicio:p.ventana_inicio,ventana_fin:p.ventana_fin,restriccion_acceso:p.restriccion_acceso,
      referencia_ubicacion:p.referencia_ubicacion || '',foto_referencia_url:p.foto_referencia_url || '',telefono_contacto:p.telefono_contacto || ''});
  };
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); if (!selected) return; setBusy(true); setMessage('');
    try {
      const updated = (await api.patch<Pedido>(`/mobile/pedidos/${selected.pedido_id}/preferencias`,form)).data;
      setPedidos(old => old.map(p => p.pedido_id === updated.pedido_id ? updated : p)); setSelected(updated);
      setMessage('Preferencias guardadas y aplicadas al cálculo de rutas.');
    } catch (error: any) { setMessage(error.message || 'No se guardaron los cambios. Puedes reintentar.'); }
    finally { setBusy(false); }
  };
  const photo = (file?: File) => {
    if (!file) return;
    if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 3 * 1024 * 1024) {
      setMessage('Adjunta una foto JPG, PNG o WebP de hasta 3 MB.'); return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm(old => ({...old,foto_referencia_url:String(reader.result)}));
    reader.readAsDataURL(file);
  };
  const inTransit = ['EN_TRANSITO', 'EN_RUTA'].includes(selected?.estado || '');
  const closed = ['ENTREGADO', 'NO_ENTREGADO', 'CANCELADO'].includes(selected?.estado || '');
  return <section style={{maxWidth:850,margin:'0 auto'}}>
    <h1>{readOnly ? 'Mis entregas' : 'Mis pedidos y preferencias'}</h1>
    <p>Solo se muestran los pedidos asociados a tu cuenta.</p>
    {message && <p role="status">{message}</p>}
    <button className="btn-secondary" onClick={load}>Actualizar pedidos</button>
    {pedidos.length === 0 && <p>No tienes pedidos asociados. Oficina puede vincularlos con tu cuenta al registrarlos.</p>}
    {pedidos.map(p => <article className="card" key={p.pedido_id} style={{padding:16,marginTop:12}}>
      <h2>{p.codigo_seguimiento}</h2><p>{p.direccion_destino} · {p.estado}</p>
      <p>Recepción: {p.ventana_inicio}–{p.ventana_fin}</p>
      {!readOnly && <button className="btn-secondary" onClick={() => edit(p)}>Editar preferencias de {p.codigo_seguimiento}</button>}
    </article>)}
    {selected && !readOnly && <form className="card" onSubmit={save} style={{display:'grid',gap:12,padding:20,marginTop:16}}>
      <h2>Preferencias: {selected.codigo_seguimiento}</h2>
      {inTransit && <p>No se pueden alterar las preferencias de un pedido en tránsito.</p>}
      {closed && <p>El pedido ya está cerrado; sus preferencias no se pueden modificar.</p>}
      <fieldset disabled={inTransit || closed || busy} style={{display:'grid',gap:12,border:0,padding:0}}>
        <label>Hora de apertura<input aria-label="Hora de apertura" type="time" required value={form.ventana_inicio?.slice(0,5) || ''} onChange={e=>setForm({...form,ventana_inicio:e.target.value})}/></label>
        <label>Hora de cierre<input aria-label="Hora de cierre" type="time" required value={form.ventana_fin?.slice(0,5) || ''} onChange={e=>setForm({...form,ventana_fin:e.target.value})}/></label>
        <label>Restricción de acceso<select aria-label="Restricción de acceso" value={form.restriccion_acceso} onChange={e=>setForm({...form,restriccion_acceso:e.target.value})}>
          <option value="LIBRE_ACCESO">Libre acceso</option><option value="ALTURA_MAXIMA_2_5M">Altura máxima 2,5 m</option>
          <option value="SOLO_VEHICULOS_LIGEROS">Solo vehículos ligeros</option><option value="NO_CAMIONES_PESADOS">Sin camiones pesados</option><option value="ZONA_PEATONAL">Zona peatonal</option>
        </select></label>
        <label>Referencia de entrega<textarea aria-label="Referencia de entrega" value={form.referencia_ubicacion} onChange={e=>setForm({...form,referencia_ubicacion:e.target.value})}/></label>
        <label>Teléfono de contacto<input aria-label="Teléfono de contacto" value={form.telefono_contacto} onChange={e=>setForm({...form,telefono_contacto:e.target.value})}/></label>
        <label>Fotografía de referencia<input aria-label="Fotografía de referencia" type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>photo(e.target.files?.[0])}/></label>
        {form.foto_referencia_url && <img src={form.foto_referencia_url} alt="Referencia del punto de entrega" style={{maxWidth:240,maxHeight:180,objectFit:'contain'}}/>}
        <button className="btn" type="submit">{busy?'Guardando…':'Guardar mis preferencias'}</button>
      </fieldset>
    </form>}
  </section>;
}
