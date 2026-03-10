import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { Casino } from "../simulation/Casino";
import type {
	CasinoState,
	GameObjectType,
	PokieSettings,
	TileType,
} from "../types";

interface GameState {
	money: number;
	reputation: number;
	casinoState: CasinoState;
	currentSlot: number;
	isHydrated: boolean; // Safety lock

	// Day State
	isOpen: boolean;
	day: number;
	dayTimer: number;
	dailyEarnings: number;
	dailySpend: number;
	isPaused: boolean;

	_sim: Casino;
	_logs: string[];

	// Viewport & UI State
	zoom: number;
	zoomDuration: number;
	isBuilding: boolean;
	selectedObject: GameObjectType | null;
	selectedObjectId: string | null;
	selectedCustomerId: string | null;
	buildRotation: number;

	// Actions
	addMoney: (amount: number) => void;
	setTile: (x: number, y: number, type: TileType) => void;
	setBuildingMode: (active: boolean, type?: GameObjectType) => void;
	rotateBuild: () => void;
	addObject: (x: number, y: number) => void;
	togglePokie: (id: string) => void;
	updatePokieSettings: (id: string, settings: Partial<PokieSettings>) => void;
	selectObject: (id: string | null) => void;
	selectCustomer: (id: string | null) => void;
	tick: (dt: number) => void;
	setZoom: (level: number) => void;
	resetGame: () => void;
	toggleOpen: () => void;
	togglePause: () => void;
	addLog: (msg: string) => void;
	loadGame: (slot?: number) => Promise<void>;
	saveGame: (slot?: number) => Promise<void>;
}

const getInitialState = () => {
	const initialSim = new Casino(7, 7);
	return {
		money: 1000,
		reputation: 0,
		casinoState: initialSim.getState(),
		_sim: initialSim,
		_logs: ["Game Initialized"],
		zoom: 1.0,
		zoomDuration: 1.0,
		isBuilding: false,
		selectedObject: null,
		selectedObjectId: null,
		selectedCustomerId: null,
		buildRotation: 0,
		currentSlot: Number.parseInt(
			localStorage.getItem("casino-current-slot") || "1",
			10,
		),
		isOpen: false,
		day: 1,
		dayTimer: 0,
		dailyEarnings: 0,
		dailySpend: 0,
		isPaused: false,
		isHydrated: false,
	};
};

export const useGameStore = create<GameState>()(
	immer((set, get) => ({
		...getInitialState(),

		addLog: (msg) =>
			set((s) => {
				s._logs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
				if (s._logs.length > 50) s._logs.shift();
			}),

		togglePause: () =>
			set((s) => {
				s.isPaused = !s.isPaused;
			}),

		toggleOpen: () => {
			set((s) => {
				if (!s.isOpen) {
					if (s.money < 500) {
						get().addLog("Need $500 to open!");
						return;
					}
					s.money -= 500;
					s.dailySpend += 500;
					s.isOpen = true;
					s.dayTimer = 0;
					s.dailyEarnings = 0;
					get().addLog("Casino Opened!");
				} else {
					s.isOpen = false;
					s.day += 1;
					get().addLog("Day Finished.");
				}
			});
			get().saveGame();
		},

		setZoom: (level) =>
			set((state) => {
				state.zoom = Math.max(0.1, Math.min(10, level));
			}),

		addMoney: (amount) =>
			set((state) => {
				state.money += amount;
			}),

		tick: (dt) => {
			if (get().isPaused || !get().isHydrated) return;
			const sim = get()._sim;
			const earnings = sim.tick(dt, get().isOpen);

			set((state) => {
				if (state.isOpen) state.dayTimer += dt;
				state.money += earnings;
				state.dailyEarnings += Math.max(0, earnings);
				state.casinoState = sim.getState();
			});
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
				state.buildRotation = 0;
			}),

		rotateBuild: () =>
			set((s) => {
				s.buildRotation = (s.buildRotation + 90) % 360;
			}),

		addObject: (x, y) => {
			const state = get();
			const sim = state._sim;
			const isFirst = state.casinoState.objects.length === 0;
			const cost = isFirst ? 0 : 1000;

			if (state.money < cost) {
				get().addLog(`Build: Insufficient funds ($${cost})`);
				return;
			}

			const success = sim.addObject(
				x,
				y,
				state.selectedObject!,
				state.buildRotation,
			);
			if (success) {
				set((s) => {
					s.money -= cost;
					s.dailySpend += cost;
					s.casinoState = sim.getState();
					s.isBuilding = false;
					s.selectedObject = null;
				});
				get().addLog("Build: Success!");
				get().saveGame();
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
				get().saveGame();
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
				get().saveGame();
			}
		},

		selectObject: (id) =>
			set((s) => {
				s.selectedObjectId = id;
			}),
		selectCustomer: (id) =>
			set((s) => {
				s.selectedCustomerId = id;
			}),

		resetGame: () => {
			get().addLog("RESETTING TO SLOT 0...");
			const fresh = getInitialState();
			set((s) => {
				Object.assign(s, fresh);
				s.currentSlot = 0;
				s.isHydrated = true;
			});
			localStorage.setItem("casino-current-slot", "0");
			get()
				.saveGame(0)
				.then(() => window.location.reload());
		},

		loadGame: async (slot?: number) => {
			const targetSlot = slot ?? get().currentSlot;

			if (targetSlot === 0) {
				const fresh = getInitialState();
				set((state) => {
					Object.assign(state, fresh);
					state.currentSlot = 0;
					state._sim = new Casino(7, 7);
					state.isHydrated = true;
				});
				localStorage.setItem("casino-current-slot", "0");
				get().addLog("Slot 0 Reset Loaded");
				get().saveGame(0);
				return;
			}

			try {
				const res = await fetch(`/api/save-game?slot=${targetSlot}`);
				if (res.ok) {
					const data = await res.json();
					const sim = new Casino(7, 7, data.casinoState);
					set((state) => {
						state.money = data.money;
						state.reputation = data.reputation;
						state.casinoState = data.casinoState;
						state.zoom = data.zoom;
						state.day = data.day ?? 1;
						state.isOpen = data.isOpen ?? false;
						state.dayTimer = data.dayTimer ?? 0;
						state.dailyEarnings = data.dailyEarnings ?? 0;
						state.dailySpend = data.dailySpend ?? 0;
						state.isPaused = data.isPaused ?? false;
						state._sim = sim;
						state.currentSlot = targetSlot;
						state.isHydrated = true;
					});
					localStorage.setItem("casino-current-slot", targetSlot.toString());
					get().addLog(`Loaded Slot ${targetSlot}`);
				} else {
					// If load fails, we are still "hydrated" with defaults
					set((s) => {
						s.isHydrated = true;
					});
				}
			} catch (_e) {
				get().addLog(`Slot ${targetSlot} not found`);
				set((s) => {
					s.isHydrated = true;
				});
			}
		},

		saveGame: async (slot?: number) => {
			if (!get().isHydrated) return; // CRITICAL: Prevent default overwrite

			const state = get();
			const targetSlot = slot ?? state.currentSlot;
			const saveData = {
				money: state.money,
				reputation: state.reputation,
				casinoState: state.casinoState,
				zoom: state.zoom,
				day: state.day,
				isOpen: state.isOpen,
				dayTimer: state.dayTimer,
				dailyEarnings: state.dailyEarnings,
				dailySpend: state.dailySpend,
				isPaused: state.isPaused,
			};
			try {
				await fetch(`/api/save-game?slot=${targetSlot}`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(saveData),
				});
			} catch (e) {
				console.error("Failed to save", e);
			}
		},
	})),
);
