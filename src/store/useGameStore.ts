import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
	CasinoState,
	GameObjectType,
	TileType,
	PokieSettings,
} from "../types";
import { Casino } from "../simulation/Casino";

interface GameState {
	money: number;
	reputation: number;
	manualDeals: number;
	casinoState: CasinoState;

	_sim: Casino;
	_logs: string[]; // Internal logs for Dev HUD

	// Viewport & UI State
	zoom: number;
	zoomDuration: number;
	isBuilding: boolean;
	selectedObject: GameObjectType | null;
	selectedObjectId: string | null;

	// Actions
	addMoney: (amount: number) => void;
	manualDeal: () => void;
	setTile: (x: number, y: number, type: TileType) => void;
	setBuildingMode: (active: boolean, type?: GameObjectType) => void;
	addObject: (x: number, y: number) => void;
	togglePokie: (id: string) => void;
	updatePokieSettings: (id: string, settings: Partial<PokieSettings>) => void;
	selectObject: (id: string | null) => void;
	tick: (dt: number) => void;
	setZoom: (level: number) => void;
	resetGame: () => void;
	addLog: (msg: string) => void;
}

const getInitialState = () => {
	const initialSim = new Casino(10, 10);
	return {
		money: 100,
		reputation: 0,
		manualDeals: 0,
		casinoState: initialSim.getState(),
		_sim: initialSim,
		_logs: ["Game Initialized"],
		zoom: 1.0,
		zoomDuration: 1.0,
		isBuilding: false,
		selectedObject: null,
		selectedObjectId: null,
	};
};

export const useGameStore = create<GameState>()(
	persist(
		immer((set, get) => ({
			...getInitialState(),

			addLog: (msg) =>
				set((s) => {
					s._logs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
					if (s._logs.length > 50) s._logs.shift();
				}),

			setZoom: (level) =>
				set((state) => {
					state.zoom = Math.max(0.1, Math.min(10, level));
				}),

			addMoney: (amount) =>
				set((state) => {
					state.money += amount;
				}),

			manualDeal: () =>
				set((state) => {
					state.manualDeals += 1;
					state.money += 5;
				}),

			tick: (dt) => {
				const sim = get()._sim;
				const earnings = sim.tick(dt);
				if (earnings !== 0 || dt > 0) {
					set((state) => {
						state.money += earnings;
						state.casinoState = sim.getState();
					});
				}
			},

			setTile: (x, y, type) => {
				const sim = get()._sim;
				sim.setTile(x, y, type);
				set((state) => {
					state.casinoState = sim.getState();
				});
			},

			setBuildingMode: (active, type = undefined) =>
				set((state) => {
					state.isBuilding = active;
					state.selectedObject = type ?? null;
				}),

			addObject: (x, y) => {
				const state = get();
				const sim = state._sim;
				const cost = 50;

				get().addLog(`Build: Attempting placement at ${x},${y}`);

				if (state.money < cost) {
					get().addLog(
						`Build: Insufficient funds ($${state.money.toFixed(2)} < $${cost})`,
					);
					return;
				}

				if (!state.selectedObject) {
					get().addLog(`Build: No object selected`);
					return;
				}

				const success = sim.addObject(x, y, state.selectedObject);
				if (success) {
					set((s) => {
						s.money -= cost;
						s.casinoState = sim.getState();
						s.isBuilding = false;
						s.selectedObject = null;
					});
					get().addLog(`Build: Success! Placed ${state.selectedObject}`);
				} else {
					get().addLog(`Build: Placement failed (Tile blocked or invalid)`);
				}
			},

			togglePokie: (id) => {
				const obj = get()._sim.getObject(id);
				if (obj) {
					set((state) => {
						const target = state.casinoState.objects.find((o) => o.id === id);
						if (target) target.isRunning = !target.isRunning;
						obj.isRunning = !obj.isRunning;
					});
				}
			},

			updatePokieSettings: (id, newSettings) => {
				const obj = get()._sim.getObject(id);
				if (obj && !obj.isRunning) {
					set((state) => {
						const target = state.casinoState.objects.find((o) => o.id === id);
						if (target) {
							Object.assign(target.settings, newSettings);
							Object.assign(obj.settings, newSettings);
						}
					});
				}
			},

			selectObject: (id) =>
				set((s) => {
					s.selectedObjectId = id;
				}),

			resetGame: () => {
				get().addLog("RESETTING GAME...");
				// Clear the actual storage if in browser
				if (typeof window !== "undefined" && window.localStorage) {
					useGameStore.persist?.clearStorage();
					set(() => getInitialState());
					setTimeout(() => window.location.reload(), 100);
				}
			},
		})),
		{
			name: "casino-storage",
			storage: createJSONStorage(() => localStorage),
			partialize: (state) =>
				({
					money: state.money,
					reputation: state.reputation,
					manualDeals: state.manualDeals,
					casinoState: state.casinoState,
					zoom: state.zoom,
				}) as any,
			onRehydrateStorage: () => (state) => {
				if (state) {
					state._sim = new Casino(10, 10, state.casinoState);
				}
			},
		},
	),
);
