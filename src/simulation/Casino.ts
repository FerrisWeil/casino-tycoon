import type { CasinoState, GameObject, GameObjectType, Tile, TileType } from "../types";
import { Pokie } from "./Pokie";

export class Casino {
	private width: number;
	private height: number;
	private grid: Tile[][];
	private objects: GameObject[] = [];
	private pokieLogics: Map<string, Pokie> = new Map();

	constructor(width = 10, height = 10, savedState?: CasinoState) {
		if (savedState) {
			this.width = savedState.width;
			this.height = savedState.height;
			// Deep clone to ensure internal state is mutable (not frozen by Immer/Persist)
			this.grid = JSON.parse(JSON.stringify(savedState.grid));
			this.objects = JSON.parse(JSON.stringify(savedState.objects));
			
			// Rebuild logic classes from the fresh clones
			for (const obj of this.objects) {
				this.pokieLogics.set(obj.id, new Pokie(obj));
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
				row.push({
					id: `${x}-${y}`,
					type: "floor",
					position: { x, y },
					occupantId: undefined,
				});
			}
			newGrid.push(row);
		}
		return newGrid;
	}

	public tick(dt: number): number {
		let totalEarnings = 0;
		for (const logic of this.pokieLogics.values()) {
			const result = logic.update(dt);
			if (result !== null) {
				totalEarnings += result.wager - result.payout;
			}
		}
		return totalEarnings;
	}

	public addObject(x: number, y: number, _type: GameObjectType): boolean {
		if (!this.grid[y] || !this.grid[y][x]) return false;
		if (this.grid[y][x].type !== "floor" || this.grid[y][x].occupantId)
			return false;

		const id = `obj-${Math.random().toString(36).substr(2, 9)}`;
		const data = Pokie.createDefault(id, x, y);
		
		// This will now succeed because this.objects was cloned in the constructor
		this.objects.push(data);
		this.pokieLogics.set(id, new Pokie(data));
		this.grid[y][x].occupantId = id;
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
		};
	}
}
