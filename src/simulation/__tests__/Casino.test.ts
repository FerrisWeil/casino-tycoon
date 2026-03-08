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
});
