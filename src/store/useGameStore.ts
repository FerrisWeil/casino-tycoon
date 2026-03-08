import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface GameState {
	money: number;
	reputation: number;
	unlockedFeatures: string[];
	manualDeals: number;

	// Actions
	addMoney: (amount: number) => void;
	manualDeal: () => void;
}

export const useGameStore = create<GameState>()(
	immer((set) => ({
		money: 100, // Initial capital
		reputation: 0,
		unlockedFeatures: [],
		manualDeals: 0,

		addMoney: (amount) =>
			set((state) => {
				state.money += amount;
			}),

		manualDeal: () =>
			set((state) => {
				state.manualDeals += 1;
				state.money += 5; // Fixed small earn for manual dealing
			}),
	})),
);
