import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

import { setupAudit } from './audit-fixtures';

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
    if(info.project.name==='chromium') {
      const cdp=await page.context().newCDPSession(page);
      const {nodes}=await cdp.send('Accessibility.getFullAXTree');
      const visible=nodes.filter(node=>!node.ignored);
      expect(visible.some(node=>node.role?.value==='heading')).toBe(true);
      const controls=visible.filter(node=>['button','textbox','combobox','spinbutton','searchbox'].includes(String(node.role?.value)));
      expect(controls.filter(node=>!node.name?.value),'Controles sin nombre en el árbol nativo').toEqual([]);
      await info.attach('native-accessibility-tree',{body:JSON.stringify({scenario:name,method:'Chromium platform accessibility tree; names and roles only, no input values',
        controls:controls.map(node=>({role:node.role?.value,name:node.name?.value})),visibleHeadings:visible.filter(node=>node.role?.value==='heading').map(node=>node.name?.value)},null,2),contentType:'application/json'});
      await cdp.detach();
    }
    const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
    await info.attach('axe-results',{body:JSON.stringify({scenario:name,project:info.project.name,
      violations:result.violations,incomplete:result.incomplete,passes:result.passes.map(p=>p.id)},null,2),contentType:'application/json'});
    expect(result.violations,JSON.stringify(result.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),null,2)).toEqual([]);
    await expect(page).toHaveTitle(/.+ · EcoLogística/);
    await page.keyboard.press('Tab');
    expect(await page.evaluate(()=>document.activeElement?.tagName)).not.toBe('BODY');
    await expect.poll(()=>page.evaluate(()=>getComputedStyle(document.activeElement!).outlineStyle)).not.toBe('none');
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
    const overflowing=()=>page.locator('input:not([type=hidden]):not([type=checkbox]):not([type=radio]),select,textarea,fieldset button').evaluateAll(nodes=>nodes.filter(node=>{
      const r=node.getBoundingClientRect();return r.width>0 && (r.left < -1 || r.right > window.innerWidth+1);
    }).map(node=>({tag:node.tagName,label:node.getAttribute('aria-label'),id:node.id})));
    await expect.poll(overflowing,{message:'Campos fuera del ancho de 320 px'}).toEqual([]);
    await info.attach('mobile-320',{body:await page.screenshot({fullPage:true}),contentType:'image/png'});
  });
}
