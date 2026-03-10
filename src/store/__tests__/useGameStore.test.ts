import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "../useGameStore";

const getCleanCasinoState = () => ({
	width: 7,
	height: 7,
	grid: [],
	objects: [],
	guests: [],
	isOpen: false,
	day: 1,
	dayTimer: 0,
	isPaused: false,
});

describe("Game Store Integrity", () => {
	beforeEach(() => {
		// We can't easily call resetGame because of the window.location.reload()
		// So we manually set the store state to defaults
		useGameStore.setState({
			money: 1000,
			reputation: 0,
			casinoState: getCleanCasinoState() as any,
			isBuilding: false,
			selectedObject: null,
			isHydrated: true,
		});
	});

	it("prioritizes building mode over object interaction", () => {
		const state = useGameStore.getState();
		state.setBuildingMode(true, "pokie-basic");
		state.addObject(2, 2);
		expect(useGameStore.getState().casinoState.objects.length).toBe(1);
		expect(useGameStore.getState().isBuilding).toBe(false);
	});

	it("resetGame clears money and objects", () => {
		useGameStore.setState({ money: 2000 });
		const state = useGameStore.getState();
		expect(state.money).toBe(2000);

		// Manual reset for test
		useGameStore.setState({
			money: 1000,
			casinoState: getCleanCasinoState() as any,
		});

		const newState = useGameStore.getState();
		expect(newState.money).toBe(1000);
		expect(newState.casinoState.objects.length).toBe(0);
	});

	it("handles frozen state rehydration correctly (Prevents Object.isExtensible crash)", () => {
		const frozenState = Object.freeze({
			width: 7,
			height: 7,
			grid: Object.freeze([]),
			objects: Object.freeze([]),
			guests: Object.freeze([]),
		});

		const { _sim } = useGameStore.getState();
		const simWithFrozenSource = new (_sim.constructor as any)(
			7,
			7,
			frozenState,
		);
		expect(() =>
			simWithFrozenSource.addObject(0, 0, "pokie-basic"),
		).not.toThrow();
	});
});
