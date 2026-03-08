import type { CasinoState, Tile, TileType } from "../types";

export class Casino {
	private width: number;
	private height: number;
	private grid: Tile[][];

	constructor(width = 20, height = 20) {
		this.width = width;
		this.height = height;
		this.grid = this.initializeGrid();
	}

	private initializeGrid(): Tile[][] {
		const newGrid: Tile[][] = [];
		for (let y = 0; y < this.height; y++) {
			const row: Tile[] = [];
			for (let x = 0; x < this.width; x++) {
				// Simple default: floor with wall borders
				let type: TileType = "floor";
				if (
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
				});
			}
			newGrid.push(row);
		}
		return newGrid;
	}

	// Pure logic to set a tile type
	public setTile(x: number, y: number, type: TileType) {
		if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
			this.grid[y][x].type = type;
		}
	}

	// Export the current state for the React Store to consume
	public getState(): CasinoState {
		return {
			width: this.width,
			height: this.height,
			// Deep clone or structured clone to prevent direct React mutation
			grid: JSON.parse(JSON.stringify(this.grid)),
		};
	}
}
