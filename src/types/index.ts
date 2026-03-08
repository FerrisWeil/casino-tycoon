export type TileType = "floor" | "wall" | "entrance" | "void";
export type GameObjectType = "pokie-basic";

export interface Point {
	x: number;
	y: number;
}

export interface Tile {
	id: string;
	type: TileType;
	position: Point;
	occupantId?: string;
}

export interface JackpotSettings {
	size: number;
	chance: number; // 0 to 1
}

export interface PokieSettings {
	pokeInterval: number; // seconds
	wager: number;
	grand: JackpotSettings;
	major: JackpotSettings;
	minor: JackpotSettings;
	mini: JackpotSettings;
	additionalRtp: number; // 0 to 1
}

export interface PokeResult {
  payout: number;
  wager: number;
}

export interface PokieStats {
	history: PokeResult[]; // Last 100 pokes with actual data
	totalWagered: number;
	totalPaid: number;
	pokesCount: number;
	runningRtp: number;
}

export interface GameObject {
	id: string;
	type: GameObjectType;
	position: Point;
	isRunning: boolean;
	settings: PokieSettings;
	stats: PokieStats;
}

export interface CasinoState {
	width: number;
	height: number;
	grid: Tile[][];
	objects: GameObject[];
}
