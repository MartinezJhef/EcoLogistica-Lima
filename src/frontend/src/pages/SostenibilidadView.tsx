import React, { useCallback, useEffect, useState } from 'react';
import { api, API_BASE_URL } from '../services/api';
import { AuthService } from '../services/auth';

type Summary = { desde: string; hasta: string; totales: Record<string, number | null>; variacion_porcentaje: Record<string, number | null>; estados: Record<string, number>; ahorro_co2_kg: number; metodologia: string };
type Job = { id: string; estado: string; tipo: string; desde: string; hasta: string; error?: string };
type Project = { id: string; nombre: string };
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const message = (error: unknown) => error instanceof Error ? error.message : 'No se pudo completar la operación';

export function SostenibilidadView() {
  const [desde, setDesde] = useState(today), [hasta, setHasta] = useState(today);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]), [projects, setProjects] = useState<Project[]>([]);
  const [distribution, setDistribution] = useState<Record<string, number>>({});
  const [proposal, setProposal] = useState<{ arboles: number; creditos: number; aviso: string; proyectos: { nombre: string; arboles: number; porcentaje: number }[] } | null>(null);
  const [error, setError] = useState(''), [notice, setNotice] = useState(''), [busy, setBusy] = useState(false);
  const [updated, setUpdated] = useState('');
  const [source, setSource] = useState(''), [validFrom, setValidFrom] = useState(today);
  const [diesel, setDiesel] = useState(''), [gnv, setGnv] = useState(''), [hybrid, setHybrid] = useState('');
  const [kwh, setKwh] = useState(''), [electric, setElectric] = useState('');
  const [treeFactor, setTreeFactor] = useState(''), [years, setYears] = useState(''), [credit, setCredit] = useState('1000');
  const [projectNames, setProjectNames] = useState('');
  const admin = AuthService.getUser()?.rol === 'ADMIN';
  const refresh = useCallback(async () => {
    const [result, exports] = await Promise.all([
      api.get<Summary>('/analitica/resumen', { params: { desde, hasta } }), api.get<Job[]>('/reportes')]);
    setSummary(result.data); setJobs(exports.data); setUpdated(new Date().toLocaleTimeString('es-PE'));
  }, [desde, hasta]);
  useEffect(() => {
    let active = true;
    api.get<any>('/analitica/configuracion').then(({ data }) => {
      if (!active || !data) return;
      setProjects(data.proyectos); setSource(data.fuente); setValidFrom(data.vigencia);
      setDiesel(String(data.precios_por_galon.DIESEL ?? '')); setGnv(String(data.precios_por_galon.GNV ?? '')); setHybrid(String(data.precios_por_galon.HIBRIDO ?? ''));
      setKwh(String(data.precio_kwh ?? '')); setElectric(String(data.consumo_electrico_kwh_km ?? ''));
      setTreeFactor(String(data.kg_por_arbol)); setYears(String(data.horizonte_anios)); setCredit(String(data.kg_por_credito));
      setProjectNames(data.proyectos.map((p: Project) => `${p.id}: ${p.nombre}`).join('\n'));
    }).catch(e => active && setError(message(e)));
    return () => { active = false; };
  }, []);
  useEffect(() => {
    let active = true;
    const load = () => { if (desde && hasta && desde <= hasta) refresh().then(() => active && setError('')).catch(e => active && setError(message(e))); };
    load(); const timer = window.setInterval(load, 15000);
    return () => { active = false; window.clearInterval(timer); };
  }, [refresh, desde, hasta]);
  async function action(operation: () => Promise<void>) {
    setBusy(true); setError(''); setNotice('');
    try { await operation(); } catch (e) { setError(message(e)); } finally { setBusy(false); }
  }
  async function download(id: string) {
    const response = await fetch(`${API_BASE_URL}/reportes/${id}/archivo`, { headers: { Authorization: `Bearer ${localStorage.getItem('ecologistica_access_token')}` } });
    if (!response.ok) throw new Error('El PDF no está disponible o no tienes acceso');
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement('a'); link.href = url; link.download = `ecologistica-${id}.pdf`; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const cards = [['distancia_km', 'Distancia estimada', 'km'], ['co2_kg', 'Emisiones estimadas', 'kg CO₂'], ['consumo_gal', 'Consumo estimado', 'gal'], ['energia_kwh', 'Energía estimada', 'kWh'], ['costo_pen', 'Costo estimado', 'PEN']];
  return <section className="sustainability">
    <h1>Sostenibilidad</h1><p>Indicadores, reportes y propuestas de compensación de operaciones completadas.</p>
    <form onSubmit={e => { e.preventDefault(); void action(refresh); }} className="sustainability-filters">
      <label>Desde<input type="date" required value={desde} onChange={e => { setDesde(e.target.value); setProposal(null); }} /></label>
      <label>Hasta<input type="date" required min={desde} value={hasta} onChange={e => { setHasta(e.target.value); setProposal(null); }} /></label>
      <button disabled={busy}>Actualizar indicadores</button>
    </form>
    {error && <p role="alert">{error}. Los últimos resultados conservan su fecha de actualización.</p>}
    {notice && <p role="status">{notice}</p>}
    {!summary && !error && <p role="status">Cargando indicadores…</p>}
    {summary && <>
      <p>Periodo mostrado: {summary.desde} — {summary.hasta}. Actualizado: {updated}. Actualización automática cada 15 segundos.</p>
      {summary.totales.rutas === 0 && <p>No hay rutas completadas en este periodo.</p>}
      {!!summary.totales.parametros_incompletos && <p role="status">Hay rutas sin parámetros históricos de costos. Se muestran como no configurados.</p>}
      <div className="sustainability-cards">{cards.map(([key, label, unit]) => <article key={key}><h2>{label}</h2><strong>{summary.totales[key] == null ? 'No configurado' : `${summary.totales[key]?.toLocaleString('es-PE')} ${unit}`}</strong>
        {key in summary.variacion_porcentaje && <p>Variación: {summary.variacion_porcentaje[key] == null ? 'No disponible' : `${summary.variacion_porcentaje[key]} %`}</p>}</article>)}</div>
      <p>Reducción de CO₂ frente al periodo anterior: {summary.ahorro_co2_kg} kg. Sin histórico comparable, la variación es 0 %.</p>
      <p>{summary.metodologia}</p><p>{Object.entries(summary.estados).map(([state, count]) => `${state}: ${count}`).join(' · ')}</p>
    </>}
    <h2>Reportes PDF</h2><button disabled={busy || !desde || !hasta || desde > hasta} onClick={() => void action(async () => {
      await api.post('/reportes', { desde, hasta }); setNotice('Reporte solicitado. Aparecerá aquí para descargar cuando termine.'); await refresh();
    })}>Generar reporte PDF</button>
    <ul>{jobs.map(job => <li key={job.id}>{job.tipo} · {job.desde} a {job.hasta} · {job.estado} {job.error}
      {job.estado === 'LISTO' && <button onClick={() => void action(() => download(job.id))}>Descargar PDF</button>}
      {job.estado === 'ERROR' && <button onClick={() => void action(async () => { await api.post(`/reportes/${job.id}/reintentar`); await refresh(); })}>Reintentar</button>}</li>)}</ul>
    <h2>Propuesta de compensación</h2>
    {!projects.length && <p>Administración debe configurar los factores y proyectos ambientales.</p>}
    <form onSubmit={e => { e.preventDefault(); void action(async () => {
      const result = await api.post<any>('/compensacion/propuestas', { desde, hasta, distribucion: distribution }); setProposal(result.data); await refresh();
    }); }}>
      {projects.map(project => <label key={project.id}>{project.nombre} (%)<input type="number" min="0" max="100" step="0.01" required value={distribution[project.id] ?? 0} onChange={e => { setDistribution({ ...distribution, [project.id]: Number(e.target.value) }); setProposal(null); }} /></label>)}
      {!!projects.length && <><p>Total asignado: {Object.values(distribution).reduce((a, b) => a + b, 0)} % (debe ser 100 %)</p><button disabled={busy}>Calcular y preparar PDF</button></>}
    </form>
    {proposal && <div role="status"><p>{proposal.creditos} créditos estimados · {proposal.arboles} árboles estimados</p>{proposal.proyectos.map(p => <p key={p.nombre}>{p.nombre}: {p.porcentaje} % — {p.arboles} árboles</p>)}<p>{proposal.aviso}</p></div>}
    {admin && <details><summary>Configurar factores y proyectos</summary><p>Los parámetros se conservan al iniciar cada ruta. No cambian retroactivamente los reportes.</p>
      <form onSubmit={e => { e.preventDefault(); void action(async () => {
        const prices: Record<string, number> = {}; if (diesel) prices.DIESEL = Number(diesel); if (gnv) prices.GNV = Number(gnv); if (hybrid) prices.HIBRIDO = Number(hybrid);
        const parsed = projectNames.split('\n').filter(line => line.trim()).map(line => { const colon = line.indexOf(':'); if (colon < 1) throw new Error('Usa identificador: nombre por proyecto'); return { id: line.slice(0, colon).trim(), nombre: line.slice(colon + 1).trim() }; });
        const result = await api.put<any>('/analitica/configuracion', { fuente: source, vigencia: validFrom, precios_por_galon: prices, precio_kwh: kwh ? Number(kwh) : null, consumo_electrico_kwh_km: electric ? Number(electric) : null, kg_por_arbol: Number(treeFactor), horizonte_anios: Number(years), kg_por_credito: Number(credit), proyectos: parsed });
        setProjects(result.data.proyectos); setDistribution({}); setProposal(null); setNotice('Configuración guardada para nuevas operaciones.');
      }); }}>
        <label>Fuente y supuestos<input required minLength={5} value={source} onChange={e => setSource(e.target.value)} /></label>
        <label>Vigente desde<input type="date" required value={validFrom} onChange={e => setValidFrom(e.target.value)} /></label>
        {([['Diésel PEN/gal', diesel, setDiesel], ['GNV PEN/gal equivalente', gnv, setGnv], ['Híbrido PEN/gal', hybrid, setHybrid], ['Electricidad PEN/kWh', kwh, setKwh], ['Consumo eléctrico kWh/km', electric, setElectric], ['Captura kg CO₂/árbol', treeFactor, setTreeFactor], ['Horizonte en años', years, setYears], ['kg CO₂ por crédito', credit, setCredit]] as const).map(([label, value, setter], index) => <label key={label}>{label}<input type="number" min="0.000001" step="any" required={index >= 5} value={value} onChange={e => setter(e.target.value)} /></label>)}
        <label>Proyectos (identificador: nombre, uno por línea)<textarea required value={projectNames} onChange={e => setProjectNames(e.target.value)} /></label><button disabled={busy}>Guardar configuración</button>
      </form></details>}
  </section>;
}
