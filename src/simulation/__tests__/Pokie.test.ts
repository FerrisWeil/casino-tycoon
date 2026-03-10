import { describe, expect, it } from "vitest";
import { Pokie } from "../Pokie";

describe("Pokie Simulation Math", () => {
	it("records history as objects, not numbers (Prevents .toFixed crash)", () => {
		const data = Pokie.createDefault(0, 0, 0, "test");
		const pokie = new Pokie(data);
		data.isRunning = true;

		pokie.update(1.1); // Trigger a poke

		const historyItem = data.stats.history[0];
		expect(typeof historyItem).toBe("object");
		expect(historyItem).toHaveProperty("payout");
		expect(historyItem).toHaveProperty("wager");
	});

	it("calculates rolling RTP accurately with variable bets", () => {
		const data = Pokie.createDefault(0, 0, 0, "test");
		new Pokie(data);
		data.isRunning = true;

		data.stats.history = [
			{ payout: 0.5, wager: 1.0 },
			{ payout: 5.0, wager: 10.0 },
		];

		const sumPaid = data.stats.history.reduce((a, b) => a + b.payout, 0);
		const sumWagered = data.stats.history.reduce((a, b) => a + b.wager, 0);
		const rtp = sumPaid / sumWagered;

		expect(rtp).toBe(5.5 / 11.0);
	});
});
