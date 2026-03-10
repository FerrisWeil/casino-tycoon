export type TileType = "floor" | "wall" | "entrance" | "void";
export type GameObjectType = "pokie-basic" | "pillar";

export interface Point {
	x: number;
	y: number;
}

export interface SubPoint {
  x: number;
  y: number;
}

export interface Tile {
	id: string;
	type: TileType;
	position: Point;
	occupantId?: string;
}

export interface PokieSettings {
	pokeInterval: number;
	wager: number;
	grand: { size: number; chance: number };
	major: { size: number; chance: number };
	minor: { size: number; chance: number };
	mini: { size: number; chance: number };
	additionalRtp: number;
}

export interface GameObject {
	id: string;
	type: GameObjectType;
	position: Point;
  chairPosition: Point;
  // Bounding & Physics
  subTiles: SubPoint[]; // Full visual footprint
  solidSubTiles: SubPoint[]; // Physical collision area
  chairSubTiles: SubPoint[];
  visualHeight: number; // Pixels tall
  
  rotation: number;
	isRunning: boolean;
	settings: PokieSettings;
	stats: {
    history: { payout: number; wager: number }[];
    totalWagered: number;
    totalPaid: number;
    pokesCount: number;
    runningRtp: number;
  };
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
	position: SubPoint;
	path: SubPoint[];
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
  sunPos: Point;
  showSun: boolean;
  managerPos: Point; // Added for WASD control
}
