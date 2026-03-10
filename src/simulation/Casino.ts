import type {
	CasinoState,
	GameObject,
	GameObjectType,
	GuestState,
	SubPoint,
	Tile,
	TileType,
} from "../types";
import { Guest } from "./Customer";
import { Pathfinder } from "./Pathfinder";
import { Pokie } from "./Pokie";

export class Casino {
	private width: number;
	private height: number;
	private grid: Tile[][];
	private objects: GameObject[] = [];
	private guests: GuestState[] = [];
	private pokieLogics: Map<string, Pokie> = new Map();
	private guestLogics: Map<string, Guest> = new Map();

	private spawnTimer = 0;
	public ENTRANCE_POS = { x: 0, y: 3 };

	constructor(width = 7, height = 7, savedState?: CasinoState) {
		if (savedState) {
			this.width = savedState.width;
			this.height = savedState.height;
			this.grid = JSON.parse(JSON.stringify(savedState.grid));
			this.objects = JSON.parse(JSON.stringify(savedState.objects));
			this.guests = JSON.parse(JSON.stringify(savedState.guests || []));

			for (const obj of this.objects) {
				this.pokieLogics.set(obj.id, new Pokie(obj));
			}
			for (const guest of this.guests) {
				this.guestLogics.set(guest.id, new Guest(guest));
			}
		} else {
			this.width = width;
			this.height = height;
			this.grid = this.initializeGrid();
		}
	}

	private initializeGrid(): Tile[][] {
		const newGrid: Tile[][] = [];
		for (let y = 0; y < this.height; y++) {
			const row: Tile[] = [];
			for (let x = 0; x < this.width; x++) {
				let type: TileType = "floor";
				if (x === this.ENTRANCE_POS.x && y === this.ENTRANCE_POS.y) {
					type = "entrance";
				} else if (
					x === 0 ||
					x === this.width - 1 ||
					y === 0 ||
					y === this.height - 1
				) {
					type = "wall";
				}

				row.push({
					id: `${x}-${y}`,
					type,
					position: { x, y },
					occupantId: undefined,
				});
			}
			newGrid.push(row);
		}
		return newGrid;
	}

	public isSubTileBlocked = (p: SubPoint): boolean => {
		// Convert subtile to main tile
		const tx = Math.floor(p.x / 2);
		const ty = Math.floor(p.y / 2);

		if (!this.grid[ty] || !this.grid[ty][tx]) return true;
		if (this.grid[ty][tx].type === "wall") return true;

		// Check machine collision (machines block sub-tiles)
		const hitMachine = this.objects.some((obj) =>
			obj.subTiles.some((sp) => sp.x === p.x && sp.y === p.y),
		);
		if (hitMachine) return true;

		return false;
	};

	public isOccupiedByGuest = (p: SubPoint, excludeId: string): boolean => {
		return this.guests.some(
			(g) => g.id !== excludeId && g.position.x === p.x && g.position.y === p.y,
		);
	};

	public tick(dt: number, isOpen: boolean): number {
		let totalEarnings = 0;

		// Spawning logic (No change)
		if (!isOpen) {
			for (const guest of this.guests) guest.isLeaving = true;
		} else {
			this.spawnTimer += dt;
			if (this.spawnTimer > 1.0) {
				this.spawnTimer = 0;
				const entranceSub = {
					x: this.ENTRANCE_POS.x * 2,
					y: this.ENTRANCE_POS.y * 2,
				};
				const isEntranceBlocked = this.guests.some(
					(g) =>
						g.position.x === entranceSub.x && g.position.y === entranceSub.y,
				);
				if (!isEntranceBlocked && Math.random() < 0.1) this.spawnGuest();
			}
		}

		// Update Guests
		for (const [id, guestLogic] of this.guestLogics.entries()) {
			const guest = guestLogic.getData();
			guestLogic.update(dt, {
				width: this.width,
				height: this.height,
				isBlocked: this.isSubTileBlocked,
				isOccupiedByGuest: this.isOccupiedByGuest,
			});

			// AI Decision
			if (
				!guest.targetObjectId &&
				!guest.isLeaving &&
				guest.path.length === 0
			) {
				guestLogic.decide(this.objects, {
					width: this.width,
					height: this.height,
					isBlocked: this.isSubTileBlocked,
				});
				if (guest.targetObjectId) {
					const obj = this.objects.find((o) => o.id === guest.targetObjectId);
					if (obj) obj.occupantId = guest.id;
				}
			}

			// Gambling (Must be on one of the chair's sub-tiles)
			if (guest.targetObjectId && guest.path.length === 0) {
				const obj = this.objects.find((o) => o.id === guest.targetObjectId);
				if (obj) {
					const onChair = obj.chairSubTiles.some(
						(sp) => sp.x === guest.position.x && sp.y === guest.position.y,
					);
					if (onChair) {
						const pokieLogic = this.pokieLogics.get(obj.id);
						if (pokieLogic) {
							obj.isRunning = true;
							const result = pokieLogic.update(dt);
							if (result) {
								guestLogic.onPokeResult(result.payout, result.wager);
								totalEarnings += result.wager - result.payout;
							}
						}
					}
				}
			}

			// Leaving
			if (guest.isLeaving && guest.path.length === 0) {
				const entranceSub = {
					x: this.ENTRANCE_POS.x * 2,
					y: this.ENTRANCE_POS.y * 2,
				};
				if (
					guest.position.x === entranceSub.x &&
					guest.position.y === entranceSub.y
				) {
					this.guests = this.guests.filter((c) => c.id !== id);
					this.guestLogics.delete(id);
				} else {
					guest.path = Pathfinder.findPath(
						guest.position,
						entranceSub,
						this.width * 2,
						this.height * 2,
						this.isSubTileBlocked,
					);
					if (guest.targetObjectId) {
						const obj = this.objects.find((o) => o.id === guest.targetObjectId);
						if (obj) {
							obj.occupantId = undefined;
							obj.isRunning = false;
						}
						guest.targetObjectId = undefined;
					}
				}
			}
		}

		return totalEarnings;
	}

	private spawnGuest() {
		if (this.guests.length > 15) return;
		const id = `guest-${Math.random().toString(36).substr(2, 5)}`;
		const data = Guest.createRandom(id, this.ENTRANCE_POS);
		this.guests.push(data);
		this.guestLogics.set(id, new Guest(data));
	}

	public addObject(
		tx: number,
		ty: number,
		_type: GameObjectType,
		rotation = 0,
	): boolean {
		const machinePos = { x: tx, y: ty };
		const chairPos = { x: tx, y: ty };
		if (rotation === 0) chairPos.y += 1;
		else if (rotation === 90) chairPos.x -= 1;
		else if (rotation === 180) chairPos.y -= 1;
		else if (rotation === 270) chairPos.x += 1;

		// Validate Tile Occupancy (Simplified for brevity)
		if (!this.grid[machinePos.y] || !this.grid[chairPos.y]) return false;
		if (
			this.grid[machinePos.y][machinePos.x].occupantId ||
			this.grid[chairPos.y][chairPos.x].occupantId
		)
			return false;

		const id = `obj-${Math.random().toString(36).substr(2, 9)}`;
		const data = Pokie.createDefault(tx, ty, rotation, id);

		// Sub-tile Assignment (Each tile gets 4 subtiles)
		data.subTiles = [
			{ x: tx * 2, y: ty * 2 },
			{ x: tx * 2 + 1, y: ty * 2 },
			{ x: tx * 2, y: ty * 2 + 1 },
			{ x: tx * 2 + 1, y: ty * 2 + 1 },
		];
		data.chairSubTiles = [
			{ x: chairPos.x * 2, y: chairPos.y * 2 },
			{ x: chairPos.x * 2 + 1, y: chairPos.y * 2 },
			{ x: chairPos.x * 2, y: chairPos.y * 2 + 1 },
			{ x: chairPos.x * 2 + 1, y: chairPos.y * 2 + 1 },
		];

		this.objects.push(data);
		this.pokieLogics.set(id, new Pokie(data));
		this.grid[machinePos.y][machinePos.x].occupantId = id;
		this.grid[chairPos.y][chairPos.x].occupantId = id;
		return true;
	}

	public getObject(id: string) {
		return this.objects.find((o) => o.id === id);
	}

	public setTile(x: number, y: number, type: TileType) {
		if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
			this.grid[y][x].type = type;
		}
	}

	public getState(): CasinoState {
		return {
			width: this.width,
			height: this.height,
			grid: JSON.parse(JSON.stringify(this.grid)),
			objects: JSON.parse(JSON.stringify(this.objects)),
			guests: JSON.parse(JSON.stringify(this.guests)),
			isOpen: false,
			day: 1,
			dayTimer: 0,
			isPaused: false,
		};
	}
}
