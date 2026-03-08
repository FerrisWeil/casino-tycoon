export type TileType = "floor" | "wall" | "entrance" | "void";

export interface Point {
	x: number;
	y: number;
}

export interface Tile {
	id: string;
	type: TileType;
	position: Point;
	occupantId?: string; // ID of a machine or NPC
}

export interface CasinoState {
	width: number;
	height: number;
	grid: Tile[][];
}
