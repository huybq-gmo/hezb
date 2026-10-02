import { expect, test } from '@playwright/test';

test('visitor can browse Vietnamese landing and projects', async ({ page }) => {
  await page.goto('/vi');
  await expect(page).toHaveTitle(/Hezb/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Kiến tạo');
  await page.getByRole('link', { name: 'Xem dự án' }).click();
  await expect(page).toHaveURL(/\/vi\/projects$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Dự án');
  await page.goto('/vi');
  await expect(page.getByRole('heading', { name: 'Đội ngũ Hezb' })).toBeVisible();
  const teamCards = page.locator('.member-grid .member-card');
  await expect(teamCards).toHaveCount(3);
  await expect(page.getByRole('button', { name: 'Thành viên tiếp theo' })).toHaveCount(0);
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

test('visitor can browse a bilingual blog article with attachments section', async ({ page }) => {
  await page.goto('/vi/blog');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Những điều chúng tôi đang học');
  await page.getByRole('link', { name: /AI hữu ích bắt đầu từ một vấn đề rất cụ thể/i }).click();
  await expect(page).toHaveURL(/\/vi\/blog\/ai-that-works-in-the-real-world$/);
  await expect(page.getByRole('heading', { level: 1 }).first()).toContainText('AI hữu ích');
  await expect(page.getByText('Tài nguyên đính kèm')).toBeVisible();
});

test('visitor can inspect an open role and application form', async ({ page }) => {
  await page.goto('/vi/careers');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('điều tiếp theo');
  await expect(page.locator('.job-card')).toHaveCount(2);
  await page.getByRole('button', { name: 'Ứng tuyển vị trí này' }).first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByLabel('CV / hồ sơ *')).toBeVisible();
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
  await page.goto('/admin/careers');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Careers');
});
