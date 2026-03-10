import type {
	CasinoState,
	GuestState,
	GameObject,
	GameObjectType,
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
	// 7x7 Grid: Bottom Center is 3, 6
	public ENTRANCE_POS = { x: 3, y: 6 };
	public managerPos = { x: 3, y: 5 }; // Start in front of mat
	private quality = 1.0;

	constructor(width = 7, height = 7, savedState?: CasinoState) {
		if (savedState) {
			this.width = savedState.width;
			this.height = savedState.height;
			this.grid = JSON.parse(JSON.stringify(savedState.grid));
			this.objects = JSON.parse(JSON.stringify(savedState.objects));
			this.guests = JSON.parse(JSON.stringify(savedState.guests || []));
			this.managerPos = savedState.managerPos || { x: 3, y: 5 };

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
				if (x === this.ENTRANCE_POS.x && y === this.ENTRANCE_POS.y) type = "entrance";
				row.push({ id: `${x}-${y}`, type, position: { x, y }, occupantId: undefined });
			}
			newGrid.push(row);
		}
		return newGrid;
	}

	public tick(dt: number, isOpen: boolean): number {
		let totalEarnings = 0;
		for (const obj of this.objects) {
			if (obj.type === "pokie-basic") {
				const path = Pathfinder.findPath(
					this.ENTRANCE_POS,
					obj.chairPosition,
					this.width,
					this.height,
					(p) => this.isBlocked(p),
				);
				obj.isUnreachable = path.length === 0;
			}
		}

		if (isOpen) {
			this.spawnTimer += dt;
			if (this.spawnTimer > 1.0) {
				this.spawnTimer = 0;
				this.processSpawning();
			}
		} else {
			for (const guest of this.guests) guest.isLeaving = true;
		}

		for (const [id, guestLogic] of this.guestLogics.entries()) {
			const guest = guestLogic.getData();
			guestLogic.update(dt, {
				width: this.width,
				height: this.height,
				isBlocked: (p) => this.isBlocked(p),
				isOccupiedByGuest: (p, id) => this.isOccupiedByGuest(p, id),
			});

			if (!guest.targetObjectId && !guest.isLeaving && guest.path.length === 0) {
				guestLogic.decide(this.objects, {
					width: this.width,
					height: this.height,
					isBlocked: (p) => this.isBlocked(p),
				});
				if (guest.targetObjectId) {
					const obj = this.objects.find((o) => o.id === guest.targetObjectId);
					if (obj) obj.occupantId = guest.id;
				}
			}

			if (guest.targetObjectId && guest.path.length === 0) {
				const obj = this.objects.find((o) => o.id === guest.targetObjectId);
				if (obj) {
					const onChair =
						obj.chairPosition.x === guest.position.x &&
						obj.chairPosition.y === guest.position.y;
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
						(p) => this.isBlocked(p),
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
		const targetOccupancy = ((this.width * this.height) / 20) * this.quality;
		const occupancyFactor = Math.max(0, 1 - this.guests.length / targetOccupancy);
		const isDoorBlocked = this.guests.some(
			(g) =>
				g.position.x === this.ENTRANCE_POS.x &&
				g.position.y === this.ENTRANCE_POS.y,
		);
		if (!isDoorBlocked && Math.random() < 0.2 * occupancyFactor)
			this.spawnGuest();
	}

	private spawnGuest() {
		const id = `guest-${Math.random().toString(36).substr(2, 5)}`;
		const data = Guest.createRandom(id, this.ENTRANCE_POS);
		this.guests.push(data);
		this.guestLogics.set(id, new Guest(data));
	}

	public addObject(
		tx: number,
		ty: number,
		type: GameObjectType,
		rotation = 0,
	): boolean {
		const machinePos = { x: tx, y: ty };
		let chairPos = { x: tx, y: ty };
		if (rotation === 0) chairPos.y += 1;
		else if (rotation === 90) chairPos.x -= 1;
		else if (rotation === 180) chairPos.y -= 1;
		else if (rotation === 270) chairPos.x += 1;

		if (!this.grid[machinePos.y]?.[machinePos.x]) return false;
		if (this.grid[machinePos.y][machinePos.x].occupantId) return false;

		if (type === "pokie-basic") {
			if (
				!this.grid[chairPos.y]?.[chairPos.x] ||
				this.grid[chairPos.y][chairPos.x].occupantId
			)
				return false;
		}

		const id = `obj-${Math.random().toString(36).substr(2, 9)}`;
		const data = Pokie.createDefault(tx, ty, rotation, id);

		if (type === "pillar") {
			data.type = "pillar";
			data.visualHeight = 32;
			data.chairPosition = { x: -1, y: -1 };
			data.solidSubTiles = [{ x: tx, y: ty }];
		} else {
			data.visualHeight = 32;
			data.chairPosition = chairPos;
			data.solidSubTiles = [{ x: tx, y: ty }];
		}

		this.objects.push(data);
		if (data.type === "pokie-basic") {
			this.pokieLogics.set(id, new Pokie(data));
			this.grid[chairPos.y][chairPos.x].occupantId = id;
		}
		this.grid[machinePos.y][machinePos.x].occupantId = id;
		return true;
	}

	public isBlocked = (p: Point): boolean => {
		if (!this.grid[p.y]?.[p.x]) return true;
		return this.objects.some((obj) =>
			obj.solidSubTiles.some((sp) => sp.x === p.x && sp.y === p.y),
		);
	};

	public isOccupiedByGuest = (p: Point, excludeId: string): boolean => {
		return this.guests.some(
			(g) => g.id !== excludeId && g.position.x === p.x && g.position.y === p.y,
		);
	};

	public getObject(id: string) {
		return this.objects.find((o) => o.id === id);
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
			sunPos: { x: 50, y: 20 },
			showSun: false,
			managerPos: this.managerPos,
		};
	}
}
