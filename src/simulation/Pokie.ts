import type { GameObject } from "../types";

export class Pokie {
	public static createDefault(id: string, x: number, y: number): GameObject {
		return {
			id,
			type: "pokie-basic",
			position: { x, y },
			isRunning: false,
			settings: {
				pokeInterval: 1.0,
				wager: 1.0,
				grand: { size: 5000, chance: 0.00001 },
				major: { size: 500, chance: 0.0001 },
				minor: { size: 50, chance: 0.001 },
				mini: { size: 10, chance: 0.01 },
				additionalRtp: 0.65,
			},
			stats: {
				history: [],
				totalWagered: 0,
				totalPaid: 0,
				pokesCount: 0,
				runningRtp: 0,
			},
		};
	}

	private timer = 0;
	private data: GameObject;

	constructor(data: GameObject) {
		this.data = data;
	}

	public update(dt: number): { payout: number; wager: number } | null {
		if (!this.data.isRunning) return null;

		this.timer += dt;
		if (this.timer >= this.data.settings.pokeInterval) {
			this.timer = 0;
			const wager = this.data.settings.wager;
			const payout = this.poke(wager);
			return { payout, wager };
		}
		return null;
	}

	private poke(wager: number): number {
		const s = this.data.settings;
		let payout = 0;
		const roll = Math.random();

		// 1. Check Jackpots
		if (roll < s.grand.chance) payout = s.grand.size;
		else if (roll < s.grand.chance + s.major.chance) payout = s.major.size;
		else if (roll < s.grand.chance + s.major.chance + s.minor.chance)
			payout = s.minor.size;
		else if (
			roll <
			s.grand.chance + s.major.chance + s.minor.chance + s.mini.chance
		)
			payout = s.mini.size;
		else {
			// 2. Additional RTP scaled by Wager
			if (Math.random() < 0.2) {
				payout = ((s.additionalRtp * wager) / 0.2) * (0.5 + Math.random());
			}
		}

		// Update Stats
		this.data.stats.pokesCount++;
		this.data.stats.totalWagered += wager;
		this.data.stats.totalPaid += payout;

		// Push the full result
		this.data.stats.history.push({ payout, wager });
		if (this.data.stats.history.length > 100) this.data.stats.history.shift();

		// Calculate accurate rolling RTP from actual history
		const sumPaid = this.data.stats.history.reduce((a, b) => a + b.payout, 0);
		const sumWagered = this.data.stats.history.reduce((a, b) => a + b.wager, 0);

		this.data.stats.runningRtp = sumWagered > 0 ? sumPaid / sumWagered : 0;

		return payout;
	}
}
