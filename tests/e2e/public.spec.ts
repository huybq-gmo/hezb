import { expect, test } from '@playwright/test';

test('visitor can browse Vietnamese landing and projects', async ({ page }) => {
  await page.goto('/vi');
  await expect(page).toHaveTitle(/Hezb/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Kiến tạo');
  await page.getByRole('link', { name: 'Xem dự án' }).click();
  await expect(page).toHaveURL(/\/vi\/projects$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Dự án');
  await page.goto('/vi');
  const team = page.getByRole('region', { name: 'Đội ngũ Hezb' });
  await expect(team).toBeVisible();
  await team.getByRole('button', { name: 'Thành viên tiếp theo' }).click();
  await expect(team.getByRole('button', { name: 'Thành viên trước' })).toBeEnabled();
});

test('draft projects stay unavailable and admin redirects to login', async ({ page }) => {
  await page.goto('/en/projects/sample-vision-qc');
  await expect(page.getByText('Page not found')).toBeVisible();
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin\/login/);
});

test('contact form shows required-field validation', async ({ page }) => {
  await page.goto('/vi/contact');
  await page.getByRole('button', { name: 'Gửi liên hệ' }).click();
  await expect(page.getByText('Please enter your name.')).toBeVisible();
  await expect(page.getByText('Please enter your email.')).toBeVisible();
});

test('category filter and published project detail are reachable', async ({ page }) => {
  await page.goto('/en/projects?cat=ai');
  await expect(page.getByRole('link', { name: /AI insights workspace/i })).toBeVisible();
  await page.getByRole('link', { name: /AI insights workspace/i }).click();
  await expect(page).toHaveURL(/\/en\/projects\/sample-ai-insights$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('AI insights workspace');
});

test('demo admin can open member and message workspaces', async ({ page }) => {
  await page.goto('/admin/login');
  await page.getByLabel('Email').fill('demo@hezb.local');
  await page.getByLabel('Password').fill('demo');
  await page.getByRole('button', { name: 'Admin login' }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto('/admin/members');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Members');
  await page.goto('/admin/messages');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Messages');
  await page.locator('button.table-link').filter({ hasText: 'Nguyễn Hà' }).click();
  await expect(page.getByRole('link', { name: 'Reply by email' })).toBeVisible();
});
