import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { CasinoState, TileType } from "../types";
import { Casino } from "../simulation/Casino";

interface GameState {
	money: number;
	reputation: number;
	manualDeals: number;
	casinoState: CasinoState;

	// Simulation instance (internal use)
	_sim: Casino;

	// Viewport State
	zoom: number;
	zoomDuration: number;

	// Actions
	addMoney: (amount: number) => void;
	manualDeal: () => void;
	setTile: (x: number, y: number, type: TileType) => void;
	setZoom: (level: number) => void;
	setZoomDuration: (duration: number) => void;
}

export const useGameStore = create<GameState>()(
	immer((set, get) => {
		// Initialize the simulation inside the store closure
		const initialSim = new Casino(10, 10);

		return {
			money: 100,
			reputation: 0,
			manualDeals: 0,
			casinoState: initialSim.getState(),
			_sim: initialSim,
			zoom: 32,
			zoomDuration: 1.0,

			addMoney: (amount) =>
				set((state) => {
					state.money += amount;
				}),

			manualDeal: () =>
				set((state) => {
					state.manualDeals += 1;
					state.money += 5;
				}),

			setTile: (x, y, type) => {
				const sim = get()._sim;
				sim.setTile(x, y, type);
				set((state) => {
					state.casinoState = sim.getState();
				});
			},

			setZoom: (level) =>
				set((state) => {
					state.zoom = Math.max(16, Math.min(128, level));
				}),

			setZoomDuration: (duration) =>
				set((state) => {
					state.zoomDuration = duration;
				}),
		};
	}),
);
