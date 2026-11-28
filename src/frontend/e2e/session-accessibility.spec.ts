import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { setupAudit } from './audit-fixtures';

test('sesión vencida: conserva borrador, anuncia error y reanuda la misma cuenta',async({page},info)=>{
  await setupAudit(page,'CLIENTE');
  await page.goto('/pedidos');await page.waitForLoadState('networkidle');
  await page.getByRole('button',{name:/Editar preferencias/}).click();
  const draft=page.getByLabel('Referencia de entrega',{exact:true});
  await draft.fill('Borrador conservado sin enviar');
  let reject=true,writes=0,logins=0;
  await page.route('**/api/v1/mobile/pedidos**',async route=>{
    if(route.request().method()!=='GET')writes++;
    if(reject && route.request().method()==='GET') {reject=false;await route.fulfill({status:401,json:{detail:'Sesión de prueba vencida'}});}
    else await route.fallback();
  });
  await page.route('**/api/v1/auth/login',async route=>{
    logins++;
    if(logins===1)await route.fulfill({status:401,json:{detail:'Credenciales de prueba rechazadas'}});
    else await route.fulfill({json:{access_token:btoa(JSON.stringify({exp:Math.floor(Date.now()/1000)+28800}))+'.isolated-fixture',
      usuario:{usuario_id:'audit-user',email:'audit@example.test',nombre_completo:'Auditoría de interfaz',rol:'CLIENTE',estado:'ACTIVO',permisos:[]}}});
  });
  await page.getByRole('button',{name:'Actualizar pedidos',exact:true}).click();
  const dialog=page.getByRole('dialog',{name:'Continuar la sesión'});
  await expect(dialog).toBeVisible();await expect(draft).toHaveValue('Borrador conservado sin enviar');
  await expect(page).toHaveURL(/\/pedidos$/);
  expect(await page.locator('main').evaluate(node=>Boolean(node.closest('[inert]')))).toBe(true);
  await dialog.getByLabel('Contraseña para continuar').fill('isolated-fixture-only');
  await dialog.getByRole('button',{name:'Identificarme y continuar'}).click();
  await expect(dialog.getByRole('alert')).toContainText('Tus cambios siguen');
  expect(await page.evaluate(()=>localStorage.getItem('ecologistica_access_token'))).toBeNull();
  await page.keyboard.press('Escape');await expect(dialog).toBeVisible();
  const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
  expect(audit.violations).toEqual([]);
  if(info.project.name==='chromium') {
    const cdp=await page.context().newCDPSession(page);
    const {nodes}=await cdp.send('Accessibility.getFullAXTree');
    const visible=nodes.filter(node=>!node.ignored);
    expect(visible.some(node=>node.role?.value==='dialog' && node.name?.value==='Continuar la sesión')).toBe(true);
    expect(visible.some(node=>node.role?.value==='alert')).toBe(true);
    expect(visible.some(node=>node.role?.value==='navigation' && node.name?.value==='Navegación principal')).toBe(false);
    expect(visible.some(node=>node.name?.value==='Contraseña para continuar')).toBe(true);
    await info.attach('native-accessibility-tree',{body:JSON.stringify({method:'Chromium platform accessibility tree; names and roles only, no input values',
      nodes:visible.map(node=>({role:node.role?.value,name:node.name?.value,live:node.properties?.find(p=>p.name==='live')?.value?.value}))},null,2),contentType:'application/json'});
    await cdp.detach();
  }
  await info.attach('reidentificacion-error',{body:await page.screenshot({fullPage:true}),contentType:'image/png'});
  await dialog.getByRole('button',{name:'Identificarme y continuar'}).click();
  await expect(dialog).toHaveCount(0);await expect(draft).toHaveValue('Borrador conservado sin enviar');
  expect(writes).toBe(0);expect(logins).toBe(2);
});

test('avisa antes del vencimiento y permite aplazar sin ampliar el token',async({page})=>{
  await setupAudit(page,'CLIENTE');
  const now=Date.now();await page.clock.install({time:now});
  await page.addInitScript(exp=>localStorage.setItem('ecologistica_access_token',btoa(JSON.stringify({exp}))+'.isolated-fixture'),Math.floor(now/1000)+120);
  await page.goto('/pedidos');await page.waitForLoadState('networkidle');
  await page.clock.fastForward(31000);
  const dialog=page.getByRole('dialog',{name:'Continuar la sesión'});
  await expect(dialog).toContainText('Tu sesión está por terminar');
  await dialog.getByRole('button',{name:'Continuar por ahora'}).click();await expect(dialog).toHaveCount(0);
  await page.clock.fastForward(90000);
  await expect(dialog).toContainText('Tu sesión terminó');
  await expect(dialog.getByRole('button',{name:'Continuar por ahora'})).toHaveCount(0);
  expect(await page.evaluate(()=>localStorage.getItem('ecologistica_access_token'))).toBeNull();
});

test('busca módulos por nombre con teclado y respeta los permisos del rol',async({page})=>{
  await setupAudit(page,'CLIENTE');await page.goto('/pedidos');await page.waitForLoadState('networkidle');
  await page.getByText('Buscar un módulo',{exact:true}).focus();await page.keyboard.press('Enter');
  await page.getByLabel('Nombre del módulo',{exact:true}).fill('administracion');
  await expect(page.getByText('0 módulos encontrados',{exact:true})).toBeVisible();
  await expect(page.getByRole('link',{name:'Administración de usuarios',exact:true})).toHaveCount(0);
  await page.getByLabel('Nombre del módulo',{exact:true}).fill('pedidos');
  const link=page.getByRole('link',{name:'Pedidos',exact:true});
  await expect(link).toBeVisible();await link.focus();await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/pedidos$/);await expect(page).toHaveTitle('Mis pedidos · EcoLogística');
});
