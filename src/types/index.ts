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
	chance: number;
}

export interface PokieSettings {
	pokeInterval: number;
	wager: number;
	grand: JackpotSettings;
	major: JackpotSettings;
	minor: JackpotSettings;
	mini: JackpotSettings; // Added missing property
	additionalRtp: number;
}

export interface PokeResult {
	payout: number;
	wager: number;
}

export interface PokieStats {
	history: PokeResult[];
	totalWagered: number;
	totalPaid: number;
	pokesCount: number;
	runningRtp: number;
}

export interface GameObject {
	id: string;
	type: GameObjectType;
	position: Point;
	chairPosition: Point;
	rotation: number;
	isRunning: boolean;
	settings: PokieSettings;
	stats: PokieStats;
	occupantId?: string;
	isUnreachable?: boolean;
}

export interface GuestState {
	id: string;
	cash: number;
	patience: number;
	consecutiveLosses: number;
	targetObjectId?: string;
	isLeaving: boolean;
	position: Point;
	path: Point[];
	visionTiles: Point[];
}

export interface DailyReport {
	spend: number;
	earnings: number;
}

export interface CasinoState {
	width: number;
	height: number;
	grid: Tile[][];
	objects: GameObject[];
	guests: GuestState[];
	isOpen: boolean;
	day: number;
	dayTimer: number;
	isPaused: boolean;
	lastReport?: DailyReport;
}
