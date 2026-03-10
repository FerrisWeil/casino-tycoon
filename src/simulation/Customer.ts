import type { GameObject, GuestState, Point, SubPoint } from "../types";
import { Pathfinder } from "./Pathfinder";

export class Guest {
	private moveTimer = 0;
	private data: GuestState;

	public static createRandom(id: string, entrance: Point): GuestState {
		return {
			id,
			cash: Math.floor(Math.random() * 91) + 10,
			patience: Math.floor(Math.random() * 51) + 50,
			consecutiveLosses: 0,
			isLeaving: false,
			position: { x: entrance.x * 2, y: entrance.y * 2 },
			path: [],
			visionTiles: [],
		};
	}

	constructor(data: GuestState) {
		this.data = data;
	}

	public getData() {
		return this.data;
	}

	public update(
		dt: number,
		casino: {
			width: number;
			height: number;
			isBlocked: (p: SubPoint) => boolean;
			isOccupiedByGuest: (p: SubPoint, id: string) => boolean;
		},
	) {
		if (this.data.path.length > 0) {
			this.moveTimer += dt;
			if (this.moveTimer >= 0.5) {
				// 0.5s per sub-tile = 1s per tile
				this.moveTimer = 0;
				const nextStep = this.data.path[0];

				// Dynamic Obstacle Avoidance: Wait if another guest is in the way
				if (casino.isOccupiedByGuest(nextStep, this.data.id)) {
					return;
				}

				this.data.path.shift();
				this.data.position = nextStep;
				this.data.patience -= 0.5;
			}
		} else if (!this.data.targetObjectId && !this.data.isLeaving) {
			if (Math.random() < 0.05) {
				this.wander(casino);
			}
		}

		if (this.data.patience <= 0) {
			this.data.isLeaving = true;
		}
	}

	private wander(casino: {
		width: number;
		height: number;
		isBlocked: (p: SubPoint) => boolean;
	}) {
		const range = 4; // 2 tiles * 2 sub-tiles
		const target = {
			x: Math.max(
				0,
				Math.min(
					casino.width * 2 - 1,
					this.data.position.x +
						(Math.floor(Math.random() * (range * 2 + 1)) - range),
				),
			),
			y: Math.max(
				0,
				Math.min(
					casino.height * 2 - 1,
					this.data.position.y +
						(Math.floor(Math.random() * (range * 2 + 1)) - range),
				),
			),
		};

		if (!casino.isBlocked(target)) {
			this.data.path = Pathfinder.findPath(
				this.data.position,
				target,
				casino.width * 2,
				casino.height * 2,
				casino.isBlocked,
			);
		}
	}

	public decide(
		availableObjects: GameObject[],
		casino: {
			width: number;
			height: number;
			isBlocked: (p: SubPoint) => boolean;
		},
	): string | null {
		if (this.data.isLeaving || this.data.cash <= 0) return null;

		const targets = availableObjects
			.filter((obj) => obj.type === "pokie-basic" && !obj.occupantId)
			.map((obj) => ({
				obj,
				path: Pathfinder.findPath(
					this.data.position,
					obj.chairSubTiles[0], // Target the first sub-tile of the chair
					casino.width * 2,
					casino.height * 2,
					casino.isBlocked,
				),
			}))
			.filter((t) => t.path.length > 0);

		if (targets.length > 0) {
			const best = targets[0];
			this.data.targetObjectId = best.obj.id;
			this.data.path = best.path;
			return best.obj.id;
		}

		return null;
	}

	public onPokeResult(payout: number, wager: number) {
		this.data.cash -= wager;
		this.data.cash += payout;

		if (payout === 0) {
			this.data.consecutiveLosses++;
		} else {
			this.data.consecutiveLosses = 0;
			this.data.patience += 2;
			if (this.data.patience > 100) this.data.patience = 100;
		}

		if (this.data.cash < wager) this.data.isLeaving = true;
		if (this.data.consecutiveLosses >= 10) this.data.isLeaving = true;
		if (payout > wager * 5) this.data.isLeaving = true;
	}
}
