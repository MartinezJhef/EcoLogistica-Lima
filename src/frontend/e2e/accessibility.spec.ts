import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Synthetic responses isolate rendering; this suite never authenticates to production.
const parcel = {pedido_id:'audit-p1',codigo_seguimiento:'AUDIT-001',cliente_nombre:'Cliente de prueba',
  direccion_destino:'Dirección de prueba',latitud:-12.05,longitud:-77.05,peso_kg:1,volumen_m3:.1,
  ventana_inicio:'08:00',ventana_fin:'18:00',estado:'PENDIENTE',prioridad:'ESTANDAR',restriccion_acceso:'LIBRE_ACCESO'};
const settings = {fuente:'Factores sintéticos de auditoría',vigencia:'2020-01-01',precios_por_galon:{DIESEL:20},
  kg_por_arbol:20,horizonte_anios:10,kg_por_credito:1000,proyectos:[{id:'audit',nombre:'Proyecto de prueba'}]};
const scenarios = [
  ['login','/login',''],['vehiculos','/vehiculos','ADMIN'],['conductores','/conductores','ADMIN'],
  ['clientes','/clientes','ADMIN'],['pedidos','/pedidos','OFICINA'],['rutas','/rutas','OFICINA'],
  ['usuarios','/admin','ADMIN'],['sostenibilidad','/sostenibilidad','ADMIN'],
  ['cliente','/pedidos','CLIENTE'],['repartidor','/pedidos','REPARTIDOR'],
];
for (const [name,path,role] of scenarios) {
  test(`accesibilidad ${name}: WCAG 2.1 AA y teclado`,async ({page}, info) => {
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
      else if(p.includes('/pedidos'))data=[parcel];
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
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    if(name==='usuarios') {
      await page.getByRole('button',{name:'Nuevo Usuario',exact:true}).focus();
      await page.getByRole('button',{name:'Nuevo Usuario',exact:true}).press('Enter');
      await page.getByRole('dialog').evaluate(async node=>{await Promise.all(node.getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{})));});
    }
    if(name==='cliente')await page.getByRole('button',{name:/preferencias/i}).first().click();
    const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
    await info.attach('axe-results',{body:JSON.stringify({scenario:name,project:info.project.name,
      violations:result.violations,incomplete:result.incomplete,passes:result.passes.map(p=>p.id)},null,2),contentType:'application/json'});
    expect(result.violations,JSON.stringify(result.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),null,2)).toEqual([]);
    await page.keyboard.press('Tab');
    expect(await page.evaluate(()=>document.activeElement?.tagName)).not.toBe('BODY');
    if(name==='usuarios') {
      const dialog=page.getByRole('dialog');
      const buttons=dialog.getByRole('button');
      await buttons.last().focus();
      await page.keyboard.press('Tab');
      expect(await dialog.evaluate(node=>node.contains(document.activeElement))).toBe(true);
      await page.keyboard.press('Escape');
      await expect(dialog).toHaveCount(0);
      await expect(page.getByRole('button',{name:'Nuevo Usuario',exact:true})).toBeFocused();
    }
    await page.setViewportSize({width:320,height:800});
    const overflowing=await page.locator('input:not([type=hidden]):not([type=checkbox]):not([type=radio]),select,textarea,fieldset button').evaluateAll(nodes=>nodes.filter(node=>{
      const r=node.getBoundingClientRect();return r.width>0 && (r.left < -1 || r.right > window.innerWidth+1);
    }).map(node=>({tag:node.tagName,label:node.getAttribute('aria-label'),id:node.id})));
    expect(overflowing,'Campos fuera del ancho de 320 px').toEqual([]);
    await info.attach('mobile-320',{body:await page.screenshot({fullPage:true}),contentType:'image/png'});
  });
}
