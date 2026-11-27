import React, { useCallback, useEffect, useState } from 'react';
import { api, API_BASE_URL } from '../services/api';
import { AuthService } from '../services/auth';
import { Leaf, Route, Fuel, Zap, Wallet, FileText, Download, RefreshCw, Trees, SlidersHorizontal, ChevronDown, CalendarDays, Clock3, ArrowUpRight } from 'lucide-react';
import './SostenibilidadView.css';

type Summary = { desde: string; hasta: string; totales: Record<string, number | null>; variacion_porcentaje: Record<string, number | null>; estados: Record<string, number>; ahorro_co2_kg: number; ahorro_monetario_pen?: number | null; metodologia: string };
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
  const cards = [
    {key:'co2_kg', label:'Emisiones estimadas', unit:'kg CO₂', Icon:Leaf, featured:true},
    {key:'distancia_km', label:'Distancia estimada', unit:'km', Icon:Route},
    {key:'consumo_gal', label:'Consumo estimado', unit:'gal', Icon:Fuel},
    {key:'energia_kwh', label:'Energía estimada', unit:'kWh', Icon:Zap},
    {key:'costo_pen', label:'Costo estimado', unit:'PEN', Icon:Wallet}
  ];
  const assigned = Object.values(distribution).reduce((a,b)=>a+b,0);
  const period = (value?: string) => value ? new Date(value+'T12:00:00').toLocaleDateString('es-PE',{day:'2-digit',month:'short',year:'numeric'}) : '—';
  return <section className="sustainability">
    <header className="sus-header">
      <div><div className="sus-eyebrow"><Leaf size={15} aria-hidden="true"/> IMPACTO OPERATIVO</div><h1>Sostenibilidad</h1><p>Tu operación, vista desde su impacto ambiental.</p></div>
      <span className="sus-live"><span/>Actualización cada 15 s</span>
    </header>
    <form onSubmit={e=>{e.preventDefault();void action(refresh);}} className="sus-filter">
      <div className="sus-filter-title"><CalendarDays size={19} aria-hidden="true"/><div><strong>Periodo de análisis</strong><span>Consulta operaciones completadas</span></div></div>
      <div className="sus-date-fields"><label>Desde<input type="date" required value={desde} onChange={e=>{setDesde(e.target.value);setProposal(null);}}/></label><span className="sus-date-arrow" aria-hidden="true">→</span><label>Hasta<input type="date" required min={desde} value={hasta} onChange={e=>{setHasta(e.target.value);setProposal(null);}}/></label></div>
      <button className="sus-button sus-primary" disabled={busy}><RefreshCw size={15} aria-hidden="true"/>Actualizar indicadores</button>
    </form>
    {error && <p className="sus-notice sus-error" role="alert">{error}. Los últimos resultados conservan su fecha de actualización.</p>}
    {notice && <p className="sus-notice sus-success" role="status">{notice}</p>}
    {!summary && !error && <p className="sus-loading" role="status"><RefreshCw size={16} aria-hidden="true"/>Cargando indicadores…</p>}
    {summary && <>
      <div className="sus-period-line"><span>{period(summary.desde)} — {period(summary.hasta)}</span><span><Clock3 size={12} aria-hidden="true"/> Actualizado: {updated}</span></div>
      {summary.totales.rutas===0 && <p className="sus-notice">No hay rutas completadas en este periodo.</p>}
      {!!summary.totales.parametros_incompletos && <p className="sus-notice" role="status">Hay rutas sin parámetros históricos de costos. Se muestran como no configurados.</p>}
      <div className="sus-metrics">{cards.map(({key,label,unit,Icon,featured})=><article className={`sus-metric${featured?' sus-metric-featured':''}`} key={key}>
        <div className="sus-metric-top"><span className="sus-metric-icon"><Icon size={18} aria-hidden="true"/></span>{featured && <span className="sus-metric-tag">CO₂</span>}</div>
        <h2>{label}</h2><strong>{summary.totales[key]==null?'No configurado':`${summary.totales[key]?.toLocaleString('es-PE')} ${unit}`}</strong>
        {key in summary.variacion_porcentaje ? <p>Variación: {summary.variacion_porcentaje[key]==null?'No disponible':`${summary.variacion_porcentaje[key]} %`}</p> : <p>En el periodo seleccionado</p>}
      </article>)}</div>
      <div className="sus-context"><div><span className="sus-context-icon"><ArrowUpRight size={18} aria-hidden="true"/></span><p><strong>{summary.totales.rutas ?? 0} rutas completadas</strong><span>Reducción de CO₂ frente al periodo anterior: {summary.ahorro_co2_kg} kg.</span><span>{summary.ahorro_monetario_pen == null ? 'Ahorro monetario: no disponible' : `${summary.ahorro_monetario_pen < 0 ? 'Incremento de costo' : 'Ahorro monetario'}: S/ ${Math.abs(summary.ahorro_monetario_pen).toLocaleString('es-PE', {minimumFractionDigits:2,maximumFractionDigits:2})} frente al periodo anterior.`}</span></p></div><div className="sus-route-states">{Object.entries(summary.estados).map(([state,count])=><span key={state}>{state.replace(/_/g,' ')} <b>{count}</b></span>)}</div></div>
      <details className="sus-method"><summary>Cómo se calculan estos indicadores <ChevronDown size={14} aria-hidden="true"/></summary><p>{summary.metodologia}</p><p>El ahorro monetario es el costo estimado anterior menos el actual; un resultado negativo indica incremento. Sin histórico comparable, la variación y el ahorro son cero. Si faltan factores históricos, el ahorro no está disponible. Esta comparación no atribuye causalmente el ahorro al optimizador. Los valores de CO₂ representan estimaciones, no mediciones físicas.</p></details>
    </>}
    <div className="sus-workspace">
      <section className="sus-panel sus-reports">
        <div className="sus-panel-head"><div className="sus-panel-title"><span className="sus-panel-icon"><FileText size={19} aria-hidden="true"/></span><div><h2>Reportes PDF</h2><p>Historial de documentos guardados</p></div></div><button className="sus-button sus-primary" disabled={busy||!desde||!hasta||desde>hasta} onClick={()=>void action(async()=>{await api.post('/reportes',{desde,hasta});setNotice('Reporte solicitado. Aparecerá aquí para descargar cuando termine.');await refresh();})}><FileText size={15} aria-hidden="true"/>Generar reporte PDF</button></div>
        {jobs.length===0 ? <div className="sus-empty"><FileText size={30} aria-hidden="true"/><h3>Tu primer reporte empieza aquí</h3><p>Selecciona un periodo con rutas completadas y genera un documento para descargarlo.</p></div> : <ul className="sus-job-list">{jobs.map(job=><li className="sus-job" key={job.id}>
          <span className="sus-file-icon"><FileText size={20} aria-hidden="true"/></span><div className="sus-job-info"><strong>{job.tipo==='COMPENSACION'?'Propuesta de compensación':'Reporte de sostenibilidad'}</strong><span>{period(job.desde)} — {period(job.hasta)}</span>{job.error && <p className="sus-job-error">{job.error}</p>}</div>
          <div className="sus-job-actions"><span className={`sus-badge sus-badge-${job.estado.toLowerCase()}`}>{job.estado==='PENDIENTE'?'En preparación':job.estado==='LISTO'?'Listo':job.estado==='ERROR'?'Error':job.estado}</span>
          {job.estado==='LISTO' && <button className="sus-button sus-download" onClick={()=>void action(()=>download(job.id))}><Download size={14} aria-hidden="true"/>Descargar PDF</button>}
          {job.estado==='ERROR' && <button className="sus-button sus-secondary" onClick={()=>void action(async()=>{await api.post(`/reportes/${job.id}/reintentar`);await refresh();})}><RefreshCw size={14} aria-hidden="true"/>Reintentar</button>}</div>
        </li>)}</ul>}
        <footer className="sus-panel-foot"><span className="sus-foot-dot"/>Guardados en el servidor. Oficina ve sus reportes; administración puede consultar todos. Cliente y repartidor no acceden a estos reportes globales.</footer>
      </section>
      <section className="sus-panel sus-compensation">
        <div className="sus-panel-head"><div className="sus-panel-title"><span className="sus-panel-icon"><Trees size={20} aria-hidden="true"/></span><div><h2>Propuesta de compensación</h2><p>Distribuye el impacto entre proyectos</p></div></div></div>
        <div className="sus-compensation-body"><p className="sus-intro">Asigna un porcentaje a cada proyecto. El total debe sumar 100 %.</p>
        {!projects.length && <div className="sus-empty sus-empty-small"><Trees size={28} aria-hidden="true"/><p>Administración debe configurar los factores y proyectos ambientales.</p></div>}
        <form onSubmit={e=>{e.preventDefault();void action(async()=>{const result=await api.post<any>('/compensacion/propuestas',{desde,hasta,distribucion:distribution});setProposal(result.data);await refresh();});}}>
          <div className="sus-project-list">{projects.map(project=><label className="sus-project" key={project.id}><span>{project.nombre}<small>Asignación al proyecto</small></span><span className="sus-percent-input"><input aria-label={`${project.nombre} (%)`} type="number" min="0" max="100" step="0.01" required value={distribution[project.id]??0} onChange={e=>{setDistribution({...distribution,[project.id]:Number(e.target.value)});setProposal(null);}}/><span aria-hidden="true">%</span></span></label>)}</div>
          {!!projects.length && <><div className="sus-distribution"><div><span>Total asignado</span><strong>{assigned.toLocaleString('es-PE')} % <small>/ 100 %</small></strong></div><div className="sus-progress" role="progressbar" aria-label="Distribución asignada" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(100,assigned)}><span style={{width:`${Math.min(100,Math.max(0,assigned))}%`}}/></div></div><button className="sus-button sus-primary sus-full" disabled={busy}><Trees size={16} aria-hidden="true"/>Calcular y preparar PDF</button></>}
        </form>
        {proposal && <div className="sus-proposal-result" role="status"><span className="sus-eyebrow">PROPUESTA CALCULADA</span><p>{proposal.creditos} créditos estimados · {proposal.arboles} árboles estimados</p>{proposal.proyectos.map(p=><p key={p.nombre}>{p.nombre}: {p.porcentaje} % — {p.arboles} árboles</p>)}<small>{proposal.aviso}</small></div>}
        <p className="sus-disclaimer">Propuesta estimada. No representa una compra de créditos ni una compensación realizada.</p></div>
      </section>
    </div>
    {admin && <details className="sus-settings"><summary><span className="sus-panel-icon"><SlidersHorizontal size={19} aria-hidden="true"/></span><span><strong>Configurar factores y proyectos</strong><small>Precios, equivalencias y fuentes de cálculo</small></span><ChevronDown className="sus-settings-chevron" size={18} aria-hidden="true"/></summary><div className="sus-settings-body"><p className="sus-intro">Los parámetros se conservan al iniciar cada ruta. No cambian retroactivamente los reportes.</p>
      <form onSubmit={e=>{e.preventDefault();void action(async()=>{
        const prices: Record<string,number>={};if(diesel)prices.DIESEL=Number(diesel);if(gnv)prices.GNV=Number(gnv);if(hybrid)prices.HIBRIDO=Number(hybrid);
        const parsed=projectNames.split('\n').filter(line=>line.trim()).map(line=>{const colon=line.indexOf(':');if(colon<1)throw new Error('Usa identificador: nombre por proyecto');return{id:line.slice(0,colon).trim(),nombre:line.slice(colon+1).trim()};});
        const result=await api.put<any>('/analitica/configuracion',{fuente:source,vigencia:validFrom,precios_por_galon:prices,precio_kwh:kwh?Number(kwh):null,consumo_electrico_kwh_km:electric?Number(electric):null,kg_por_arbol:Number(treeFactor),horizonte_anios:Number(years),kg_por_credito:Number(credit),proyectos:parsed});
        setProjects(result.data.proyectos);setDistribution({});setProposal(null);setNotice('Configuración guardada para nuevas operaciones.');
      });}}>
        <div className="sus-source-fields"><label>Fuente y supuestos<input required minLength={5} value={source} onChange={e=>setSource(e.target.value)}/></label><label>Vigente desde<input type="date" required value={validFrom} onChange={e=>setValidFrom(e.target.value)}/></label></div>
        <div className="sus-settings-grid">
          <fieldset><legend>Combustibles</legend>{([['Diésel PEN/gal',diesel,setDiesel],['GNV PEN/gal equivalente',gnv,setGnv],['Híbrido PEN/gal',hybrid,setHybrid]] as const).map(([label,value,setter])=><label key={label}>{label}<input type="number" min="0.000001" step="any" value={value} onChange={e=>setter(e.target.value)}/></label>)}</fieldset>
          <fieldset><legend>Energía eléctrica</legend>{([['Electricidad PEN/kWh',kwh,setKwh],['Consumo eléctrico kWh/km',electric,setElectric]] as const).map(([label,value,setter])=><label key={label}>{label}<input type="number" min="0.000001" step="any" value={value} onChange={e=>setter(e.target.value)}/></label>)}</fieldset>
          <fieldset><legend>Equivalencias ambientales</legend>{([['Captura kg CO₂/árbol',treeFactor,setTreeFactor],['Horizonte en años',years,setYears],['kg CO₂ por crédito',credit,setCredit]] as const).map(([label,value,setter])=><label key={label}>{label}<input type="number" min="0.000001" step="any" required value={value} onChange={e=>setter(e.target.value)}/></label>)}</fieldset>
        </div>
        <label>Proyectos (identificador: nombre, uno por línea)<textarea required value={projectNames} onChange={e=>setProjectNames(e.target.value)}/></label><div className="sus-settings-save"><span>Se aplicará a nuevas operaciones.</span><button className="sus-button sus-primary" disabled={busy}>Guardar configuración</button></div>
      </form></div></details>}
  </section>;
}
