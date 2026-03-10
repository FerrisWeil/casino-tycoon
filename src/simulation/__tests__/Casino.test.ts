import { describe, expect, it } from "vitest";
import { Casino } from "../Casino";

describe("Casino Simulation", () => {
	it("initializes with the correct dimensions", () => {
		const casino = new Casino(10, 10);
		const state = casino.getState();
		expect(state.width).toBe(10);
		expect(state.height).toBe(10);
		expect(state.grid.length).toBe(10);
		expect(state.grid[0].length).toBe(10);
	});

	it("sets tile types correctly", () => {
		const casino = new Casino(5, 5);
		casino.setTile(2, 2, "wall");
		const state = casino.getState();
		expect(state.grid[2][2].type).toBe("wall");
	});

	it("bounds checks tile setting", () => {
		const casino = new Casino(5, 5);
		// Should not throw or crash
		casino.setTile(10, 10, "wall");
		const state = casino.getState();
		expect(state.width).toBe(5);
	});

	it("correctly handles multi-tile placement (Pokie + Chair)", () => {
		const casino = new Casino(10, 10);
		// Place at 5,5 with rotation 0 (Chair at 5,6)
		const success = casino.addObject(5, 5, "pokie-basic", 0);

		expect(success).toBe(true);
		const state = casino.getState();

		// Verify machine tile
		expect(state.grid[5][5].occupantId).toBeDefined();
		// Verify chair tile
		expect(state.grid[6][5].occupantId).toBeDefined();
		expect(state.grid[6][5].occupantId).toBe(state.grid[5][5].occupantId);
	});

	it("prevents multi-tile placement if any tile is blocked", () => {
		const casino = new Casino(10, 10);
		casino.setTile(5, 6, "wall"); // Block where the chair should go

		const success = casino.addObject(5, 5, "pokie-basic", 0);
		expect(success).toBe(false);

		const state = casino.getState();
		expect(state.grid[5][5].occupantId).toBeUndefined();
	});

	it("calculates chair position correctly for all rotations", () => {
		const casino = new Casino(10, 10);

		// 90 deg: Chair to the left (x-1)
		casino.addObject(5, 5, "pokie-basic", 90);
		let obj = casino.getState().objects[0];
		expect(obj.chairPosition).toEqual({ x: 4, y: 5 });

		// 180 deg: Chair above (y-1)
		casino.addObject(2, 2, "pokie-basic", 180);
		obj = casino.getState().objects[1];
		expect(obj.chairPosition).toEqual({ x: 2, y: 1 });

		// 270 deg: Chair to the right (x+1)
		casino.addObject(8, 8, "pokie-basic", 270);
		obj = casino.getState().objects[2];
		expect(obj.chairPosition).toEqual({ x: 9, y: 8 });
	});
});
