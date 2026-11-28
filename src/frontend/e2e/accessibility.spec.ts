import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Synthetic responses isolate rendering; this suite never authenticates to production.
const parcel = {pedido_id:'audit-p1',codigo_seguimiento:'AUDIT-001',cliente_nombre:'Cliente de prueba',
  direccion_destino:'Dirección de prueba',latitud:-12.05,longitud:-77.05,peso_kg:1,volumen_m3:.1,
  ventana_inicio:'08:00',ventana_fin:'18:00',estado:'PENDIENTE',prioridad:'ESTANDAR',restriccion_acceso:'LIBRE_ACCESO'};
const settings = {fuente:'Factores sintéticos de auditoría',vigencia:'2020-01-01',precios_por_galon:{DIESEL:20},
  kg_por_arbol:20,horizonte_anios:10,kg_por_credito:1000,proyectos:[{id:'audit',nombre:'Proyecto de prueba'}]};
const routeFixture = {ruta_id:'audit-r1',conductor_id:'audit-d1',conductor_nombre:'Conductor Prueba',
  vehiculo_id:'audit-v1',vehiculo_placa:'AUD-001',vehiculo_tipo_combustible:'ELECTRICO',fecha_operacion:'2026-11-27',
  distancia_total_km:10,tiempo_total_min:30,co2_total_kg:2,co2_computacional_kg:0,energia_computacional_kwh:0,
  tiempo_computo_seg:0,estado:'PLANIFICADA',creada_en:'2026-11-27',pedidos_asignados_count:1,
  tramos:[{tramo_id:'audit-t1',ruta_id:'audit-r1',orden_secuencia:1,tipo_parada:'ENTREGA',pedido_id:'audit-p1',
    descripcion:'Entrega de prueba',latitud:-12.05,longitud:-77.05,distancia_tramo_km:10,tiempo_estimado_min:30,
    co2_tramo_kg:2,alerta_zona_riesgo:false}]};
async function setupAudit(page:Page,role:string) {
    await page.route('**/api/v1/**',async route=>{
      const url=new URL(route.request().url());const p=url.pathname;
      let data:unknown=[];
      if(p.includes('/analitica/configuracion')) data=settings;
      else if(p.includes('/analitica/resumen'))data={desde:'2026-11-27',hasta:'2026-11-27',
        totales:{rutas:1,distancia_km:100,co2_kg:45,costo_pen:200,consumo_gal:10,energia_kwh:0,parametros_incompletos:0},
        variacion_porcentaje:{co2_kg:0},estados:{COMPLETADA:1},ahorro_co2_kg:0,ahorro_monetario_pen:25,metodologia:'Datos de auditoría'};
      else if(p.includes('/vehiculos'))data=[{vehiculo_id:'audit-v1',placa:'AUD-001',marca_modelo:'Unidad de prueba',
        capacidad_peso_kg:500,capacidad_volumen_m3:5,tipo_combustible:'ELECTRICO',factor_emision_co2:0,consumo_km_gal:0,estado:'DISPONIBLE'}];
      else if(p.includes('/conductores'))data=[{conductor_id:'audit-d1',dni:'00000001',nombres:'Conductor',apellidos:'Prueba',
        licencia:'AUD-001',telefono:'999999999',horas_conduccion_hoy:0,estado:'DISPONIBLE'}];
      else if(p.includes('/pedidos/cuentas-clientes'))data=[{usuario_id:'audit-c1',nombre:'Cliente de prueba'}];
      else if(p.includes('/pedidos'))data=[parcel];
      else if(p.endsWith('/rutas'))data=[routeFixture];
      else if(p.includes('/clientes'))data=[{cliente_id:'audit-c1',tipo_documento:'RUC',numero_documento:'20000000001',
        razon_social:'Cliente de prueba',telefono:'999999999',direccion:'Dirección de prueba',distrito:'Lima',latitud:-12.05,longitud:-77.05,
        tipo_comercio:'BODEGA',ventana_entrega_inicio:'08:00',ventana_entrega_fin:'18:00',restriccion_acceso:'LIBRE_ACCESO',estado:'ACTIVO'}];
      else if(p.includes('/usuarios/catalogo'))data={roles_disponibles:['ADMIN','OFICINA','REPARTIDOR','CLIENTE'].map(codigo=>({codigo,nombre:codigo,descripcion:codigo,permisos_default:[]})),catalogo_permisos:[]};
      else if(p.includes('/usuarios'))data=[{usuario_id:'audit-u1',email:'audit@example.test',nombre_completo:'Usuario de prueba',rol:'ADMIN',estado:'ACTIVO',permisos:[],creado_en:'2026-11-27'}];
      await route.fulfill({json:data,headers:{'X-Total-Count':Array.isArray(data)?String(data.length):'1','Access-Control-Expose-Headers':'X-Total-Count'}});
    });
    await page.route('**/tile.openstreetmap.org/**',route=>route.abort());
    if(role)await page.addInitScript(({role})=>{
      localStorage.setItem('ecologistica_auth_user',JSON.stringify({usuario_id:'audit-user',email:'audit@example.test',nombre_completo:'Auditoría de interfaz',
        rol:role,estado:'ACTIVO',permisos:['ADMIN_USUARIOS','GESTION_FLOTA','GESTION_CONDUCTORES','REGISTRO_PEDIDOS','SEGUIMIENTO_RUTAS','ANALITICA']}));
      localStorage.setItem('ecologistica_access_token','isolated-rendering-fixture');
    },{role});
}
const scenarios = [
  ['login','/login',''],['vehiculos','/vehiculos','ADMIN'],['conductores','/conductores','ADMIN'],
  ['clientes','/clientes','ADMIN'],['pedidos','/pedidos','OFICINA'],['rutas','/rutas','OFICINA'],
  ['usuarios','/admin','ADMIN'],['sostenibilidad','/sostenibilidad','ADMIN'],
  ['cliente','/pedidos','CLIENTE'],['repartidor','/pedidos','REPARTIDOR'],
  ['vehiculo-editar','/vehiculos','ADMIN'],['conductor-editar','/conductores','ADMIN'],
  ['conductor-asignar','/conductores','ADMIN'],['cliente-editar','/clientes','ADMIN'],['ruta-reoptimizar','/rutas','OFICINA'],
];
for (const [name,path,role] of scenarios) {
  test(`accesibilidad ${name}: WCAG 2.1 AA y teclado`,async ({page}, info) => {
    await setupAudit(page,role);
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    if(name==='usuarios') {
      await page.getByRole('button',{name:'Nuevo Usuario',exact:true}).focus();
      await page.getByRole('button',{name:'Nuevo Usuario',exact:true}).press('Enter');
      await page.getByRole('dialog').evaluate(async node=>{await Promise.all(node.getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{})));});
    }
    const editTriggers:Record<string,string> = {'vehiculo-editar':'Editar vehículo','conductor-editar':'Editar Conductor',
      'conductor-asignar':'Simular Asignación de Ruta (US-002 Escenario 2)','cliente-editar':'Editar Datos del Cliente'};
    if(name.startsWith('conductor-'))await page.getByRole('button',{name:'Padrón & Registro de Conductores',exact:true}).click();
    if(editTriggers[name]) {await page.getByTitle(editTriggers[name],{exact:true}).focus();await page.keyboard.press('Enter');}
    if(name==='ruta-reoptimizar') {await page.getByRole('button',{name:'Reoptimizar (US-007)',exact:true}).focus();await page.keyboard.press('Enter');}
    if(editTriggers[name] || name==='ruta-reoptimizar')await page.getByRole('dialog').evaluate(async node=>{await Promise.all(node.getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{})));});
    if(name==='ruta-reoptimizar') {
      await page.getByText('Introducir el área con coordenadas, sin usar el mapa',{exact:true}).focus();
      await page.keyboard.press('Enter');
      await page.getByRole('button',{name:'Aplicar área por coordenadas',exact:true}).focus();await page.keyboard.press('Enter');
      await expect(page.getByRole('dialog').getByRole('alert')).toContainText('Completa cuatro coordenadas');
      for(const [label,value] of [['Latitud de la primera esquina','-12.05'],['Longitud de la primera esquina','-77.05'],['Latitud de la segunda esquina','-12.06'],['Longitud de la segunda esquina','-77.06']])await page.getByLabel(label,{exact:true}).fill(value);
      await page.getByRole('button',{name:'Aplicar área por coordenadas',exact:true}).focus();await page.keyboard.press('Enter');
      await expect(page.getByText('Área seleccionada.',{exact:false})).toBeVisible();
      await expect(page.getByRole('dialog').getByRole('alert')).toHaveCount(0);
      await page.getByLabel('Posición actual por coordenadas, sin usar el mapa',{exact:true}).fill('-12.05,-77.05');
    }
    if(name==='cliente')await page.getByRole('button',{name:/preferencias/i}).first().click();
    const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
    await info.attach('axe-results',{body:JSON.stringify({scenario:name,project:info.project.name,
      violations:result.violations,incomplete:result.incomplete,passes:result.passes.map(p=>p.id)},null,2),contentType:'application/json'});
    expect(result.violations,JSON.stringify(result.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),null,2)).toEqual([]);
    await expect(page).toHaveTitle(/.+ · EcoLogística/);
    await page.keyboard.press('Tab');
    expect(await page.evaluate(()=>document.activeElement?.tagName)).not.toBe('BODY');
    expect(await page.evaluate(()=>getComputedStyle(document.activeElement!).outlineStyle)).not.toBe('none');
    if(name==='usuarios' || editTriggers[name] || name==='ruta-reoptimizar') {
      const dialog=page.getByRole('dialog');
      expect(await page.locator('nav[aria-label="Navegación principal"]').evaluate(node=>Boolean(node.closest('[inert]')))).toBe(true);
      const activeInside=await dialog.evaluate(node=>node.contains(document.activeElement));expect(activeInside).toBe(true);
      await info.attach('dialog-desktop',{body:await page.screenshot({fullPage:true}),contentType:'image/png'});
      const buttons=dialog.getByRole('button');
      await buttons.last().focus();
      await page.keyboard.press('Tab');
      expect(await dialog.evaluate(node=>node.contains(document.activeElement))).toBe(true);
      await buttons.first().focus();await page.keyboard.press('Shift+Tab');
      expect(await dialog.evaluate(node=>node.contains(document.activeElement))).toBe(true);
      await page.keyboard.press('Escape');
      await expect(dialog).toHaveCount(0);
      if(name==='usuarios')await expect(page.getByRole('button',{name:'Nuevo Usuario',exact:true})).toBeFocused();
      else if(editTriggers[name])await expect(page.getByTitle(editTriggers[name],{exact:true})).toBeFocused();
      else await expect(page.getByRole('button',{name:'Reoptimizar (US-007)',exact:true})).toBeFocused();
    }
    await page.setViewportSize({width:320,height:800});
    const overflowing=await page.locator('input:not([type=hidden]):not([type=checkbox]):not([type=radio]),select,textarea,fieldset button').evaluateAll(nodes=>nodes.filter(node=>{
      const r=node.getBoundingClientRect();return r.width>0 && (r.left < -1 || r.right > window.innerWidth+1);
    }).map(node=>({tag:node.tagName,label:node.getAttribute('aria-label'),id:node.id})));
    expect(overflowing,'Campos fuera del ancho de 320 px').toEqual([]);
    await info.attach('mobile-320',{body:await page.screenshot({fullPage:true}),contentType:'image/png'});
  });
}
