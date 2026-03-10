import type {
	CasinoState,
	GameObject,
	GameObjectType,
	GuestState,
	Point,
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
	private quality = 1.0;

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

	public isBlocked = (p: Point): boolean => {
		if (!this.grid[p.y] || !this.grid[p.y][p.x]) return true;
		const obj = this.objects.find(
			(o) => o.position.x === p.x && o.position.y === p.y,
		);
		return !!obj;
	};

	public tick(dt: number, isOpen: boolean): number {
		let totalEarnings = 0;

		for (const obj of this.objects) {
			const path = Pathfinder.findPath(
				this.ENTRANCE_POS,
				obj.chairPosition,
				this.width,
				this.height,
				this.isBlocked,
			);
			obj.isUnreachable = path.length === 0;
		}

		if (!isOpen) {
			for (const guest of this.guests) {
				guest.isLeaving = true;
			}
		} else {
			this.spawnTimer += dt;
			if (this.spawnTimer > 1.0) {
				this.spawnTimer = 0;
				this.processSpawning();
			}
		}

		for (const [id, guestLogic] of this.guestLogics.entries()) {
			const guest = guestLogic.getData();
			guestLogic.update(dt, {
				width: this.width,
				height: this.height,
				isBlocked: this.isBlocked,
			});

			if (
				!guest.targetObjectId &&
				!guest.isLeaving &&
				guest.path.length === 0
			) {
				const targetId = guestLogic.decide(this.objects, {
					width: this.width,
					height: this.height,
					isBlocked: this.isBlocked,
				});
				if (targetId) {
					const obj = this.objects.find((o) => o.id === targetId);
					if (obj) obj.occupantId = guest.id;
				}
			}

			if (guest.targetObjectId && guest.path.length === 0) {
				const obj = this.objects.find((o) => o.id === guest.targetObjectId);
				if (
					obj &&
					guest.position.x === obj.chairPosition.x &&
					guest.position.y === obj.chairPosition.y
				) {
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

			if (guest.isLeaving && guest.path.length === 0) {
				if (
					guest.position.x === this.ENTRANCE_POS.x &&
					guest.position.y === this.ENTRANCE_POS.y
				) {
					this.guests = this.guests.filter((c) => c.id !== id);
					this.guestLogics.delete(id);
				} else {
					guest.path = Pathfinder.findPath(
						guest.position,
						this.ENTRANCE_POS,
						this.width,
						this.height,
						this.isBlocked,
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

	private processSpawning() {
		// 1. Calculate Target Occupancy
		// For Quality 1.0 and 7x7 grid, we want equilibrium at ~2.5 people
		const area = this.width * this.height;
		const targetOccupancy = (area / 20) * this.quality; // ~2.45 for 7x7

		// 2. Crowding Factor (0 to 1)
		// 1.0 when empty, 0.0 when at target
		const occupancyFactor = Math.max(
			0,
			1 - this.guests.length / targetOccupancy,
		);

		// 3. Roll for Spawn
		const baseSpawnProb = 0.2; // 20% chance per second base
		const finalProb = baseSpawnProb * occupancyFactor;

		const isDoorBlocked = this.guests.some(
			(g) =>
				g.position.x === this.ENTRANCE_POS.x &&
				g.position.y === this.ENTRANCE_POS.y,
		);

		if (!isDoorBlocked && Math.random() < finalProb) {
			this.spawnGuest();
		}
	}

	private spawnGuest() {
		const id = `guest-${Math.random().toString(36).substr(2, 5)}`;
		const data = Guest.createRandom(id, this.ENTRANCE_POS);
		this.guests.push(data);
		this.guestLogics.set(id, new Guest(data));
	}

	public addObject(
		x: number,
		y: number,
		_type: GameObjectType,
		rotation = 0,
	): boolean {
		const machinePos = { x, y };
		const chairPos = { x, y };
		if (rotation === 0) chairPos.y += 1;
		else if (rotation === 90) chairPos.x -= 1;
		else if (rotation === 180) chairPos.y -= 1;
		else if (rotation === 270) chairPos.x += 1;

		if (
			(machinePos.x === 1 && machinePos.y === 3) ||
			(chairPos.x === 1 && chairPos.y === 3)
		)
			return false;

		const positions = [machinePos, chairPos];
		for (const pos of positions) {
			if (!this.grid[pos.y] || !this.grid[pos.y][pos.x]) return false;
			if (this.grid[pos.y][pos.x].occupantId) return false;
		}

		const id = `obj-${Math.random().toString(36).substr(2, 9)}`;
		const data = Pokie.createDefault(id, x, y, rotation);
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
