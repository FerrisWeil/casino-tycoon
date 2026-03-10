import { test, expect } from '@playwright/test';

test('clicking an empty floor tile does not trigger any visual changes', async ({ page }) => {
  await page.goto('/#/?test=true');
  
  // Choose an empty floor tile (e.g., 1,1)
  const tile = page.getByLabel('Tile 1,1');
  
  // Get initial state
  const initialBox = await tile.boundingBox();
  const initialBg = await tile.evaluate(el => window.getComputedStyle(el).backgroundColor);
  
  // Perform click
  await tile.click();
  
  // Verify no translation/movement
  const finalBox = await tile.boundingBox();
  expect(finalBox?.x).toBe(initialBox?.x);
  expect(finalBox?.y).toBe(initialBox?.y);
  
  // Verify no background color change (flash)
  const finalBg = await tile.evaluate(el => window.getComputedStyle(el).backgroundColor);
  expect(finalBg).toBe(initialBg);
  
  // Verify no outline/focus effect
  const outline = await tile.evaluate(el => window.getComputedStyle(el).outlineStyle);
  expect(outline).toBe('none');
});
