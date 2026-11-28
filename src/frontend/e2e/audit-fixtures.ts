import type { Page } from '@playwright/test';

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
export async function setupAudit(page:Page,role:string) {
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
