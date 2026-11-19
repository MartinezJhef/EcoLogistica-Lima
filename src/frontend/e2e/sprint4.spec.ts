import { test, expect } from '@playwright/test';
for (const role of ['admin', 'oficina', 'repartidor', 'cliente']) {
  test(`${role}: autenticar, consultar y respetar permisos`, async ({ page, request }) => {
    if (!process.env.E2E_PASSWORD) throw new Error('Define E2E_PASSWORD para las cuentas desechables');
    await page.goto('/');
    await page.getByPlaceholder('usuario@ecologistica.pe').fill(`${role}@sprint4.example.test`);
    await page.locator('input[type=password]').fill(process.env.E2E_PASSWORD);
    await page.getByRole('button', { name: /Iniciar Sesión/i }).click();
    await expect(page.getByText('Cerrar Sesión', { exact: true })).toBeVisible();
    const token = await page.evaluate(() => localStorage.getItem('ecologistica_access_token'));
    const api = process.env.E2E_API_URL || 'http://127.0.0.1:8000/api/v1';
    const result = await request.get(`${api}/analitica/resumen?desde=2026-06-01&hasta=2026-06-01`, { headers: { Authorization: `Bearer ${token}` } });
    if (role === 'admin' || role === 'oficina') {
      expect(result.status()).toBe(200);
      await page.getByRole('button', { name: 'Sostenibilidad', exact: true }).click();
      await page.getByLabel('Desde', { exact: true }).fill('2026-06-01');
      await page.getByLabel('Hasta', { exact: true }).fill('2026-06-01');
      await page.getByRole('button', { name: 'Actualizar indicadores' }).click();
      await expect(page.getByText('100 km', { exact: true })).toBeVisible();
      await page.getByLabel('Proyecto de prueba (%)').fill('100');
      await page.getByRole('button', { name: 'Calcular y preparar PDF' }).click();
      await expect(page.getByText(/0.045 créditos estimados/)).toBeVisible();
    } else {
      expect(result.status()).toBe(403);
      await expect(page.getByRole('button', { name: 'Sostenibilidad', exact: true })).toHaveCount(0);
    }
  });
}
