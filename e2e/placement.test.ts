import { expect, test } from "@playwright/test";

test("can buy and place a pokie", async ({ page }) => {
	await page.goto("/#/?test=true");

	// 1. Click the Pokie shop button
	// Using role and name for robustness
	await page.getByRole("button", { name: "Pokie $50" }).click();

	// 2. Verify we entered build mode
	await expect(page.getByText("Placing: Pokie")).toBeVisible();

	// 3. Rotate
	await page.keyboard.press("r");

	// 4. Click a tile in the middle of the 10x10 grid (e.g., 5,5 which is roughly index 55)
	await page.getByLabel("Tile 5,5").click();

	// 5. Verify build mode exited
	await expect(page.getByText("Placing: Pokie")).not.toBeVisible();

	// 6. Verify Machine and Chair icons are visible on the grid
	// Machine is at 5,5. With 1 rotation (90deg), chair is at 4,5.
	const machineIcon = page.locator('button[aria-label="Tile 5,5"] svg');
	const chairIcon = page.locator('button[aria-label="Tile 4,5"] svg');

	await expect(machineIcon).toBeVisible();
	await expect(chairIcon).toBeVisible();
});

test("opens management dialog on click", async ({ page }) => {
	await page.goto("/#/?test=true");

	await page.getByRole("button", { name: "Pokie $50" }).click();
	await page.getByLabel("Tile 2,2").click();

	// Click the machine tile (2,2) to open dialog
	await page.getByLabel("Tile 2,2").click();

	// Verify dialog is visible
	await expect(
		page.getByRole("heading", { name: "Pokie Management" }),
	).toBeVisible();
});
