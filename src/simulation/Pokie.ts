import type { GameObject } from "../types";

export class Pokie {
	public static createDefault(
		id: string,
		x: number,
		y: number,
		rotation = 0,
	): GameObject {
		let chairX = x;
		let chairY = y;

		switch (rotation) {
			case 0:
				chairY += 1;
				break;
			case 90:
				chairX -= 1;
				break;
			case 180:
				chairY -= 1;
				break;
			case 270:
				chairX += 1;
				break;
		}

		return {
			id,
			type: "pokie-basic",
			position: { x, y },
			chairPosition: { x: chairX, y: chairY },
			rotation,
			isRunning: false,
			settings: {
				pokeInterval: 1.0,
				wager: 1.0,
				// These are now MULTIPLIERS (e.g. 5000x bet)
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
		let payoutMultiplier = 0;
		const roll = Math.random();

		// 1. Check Jackpots (Rolling for Multiplier)
		if (roll < s.grand.chance) payoutMultiplier = s.grand.size;
		else if (roll < s.grand.chance + s.major.chance)
			payoutMultiplier = s.major.size;
		else if (roll < s.grand.chance + s.major.chance + s.minor.chance)
			payoutMultiplier = s.minor.size;
		else if (
			roll <
			s.grand.chance + s.major.chance + s.minor.chance + s.mini.chance
		)
			payoutMultiplier = s.mini.size;
		else {
			// 2. Additional RTP (also essentially a multiplier pool)
			if (Math.random() < 0.2) {
				// The average payout here should be AdditionalRtp * Wager
				// So the multiplier average is just AdditionalRtp
				payoutMultiplier = (s.additionalRtp / 0.2) * (0.5 + Math.random());
			}
		}

		const actualPayout = payoutMultiplier * wager;

		// Update Stats
		this.data.stats.pokesCount++;
		this.data.stats.totalWagered += wager;
		this.data.stats.totalPaid += actualPayout;

		this.data.stats.history.push({ payout: actualPayout, wager });
		if (this.data.stats.history.length > 100) this.data.stats.history.shift();

		const sumPaid = this.data.stats.history.reduce((a, b) => a + b.payout, 0);
		const sumWagered = this.data.stats.history.reduce((a, b) => a + b.wager, 0);
		this.data.stats.runningRtp = sumWagered > 0 ? sumPaid / sumWagered : 0;

		return actualPayout;
	}
}
