import type { Point } from "../types";

export class Pathfinder {
	public static findPath(
		start: Point,
		end: Point,
		gridWidth: number,
		gridHeight: number,
		isBlocked: (p: Point) => boolean,
	): Point[] {
		const queue: { pos: Point; path: Point[] }[] = [{ pos: start, path: [] }];
		const visited = new Set<string>();
		visited.add(`${start.x},${start.y}`);

		while (queue.length > 0) {
			const { pos, path } = queue.shift()!;

			if (pos.x === end.x && pos.y === end.y) {
				return path;
			}

			const neighbors = [
				{ x: pos.x + 1, y: pos.y },
				{ x: pos.x - 1, y: pos.y },
				{ x: pos.x, y: pos.y + 1 },
				{ x: pos.x, y: pos.y - 1 },
			];

			for (const next of neighbors) {
				const key = `${next.x},${next.y}`;
				if (
					next.x >= 0 &&
					next.x < gridWidth &&
					next.y >= 0 &&
					next.y < gridHeight &&
					!visited.has(key) &&
					(!isBlocked(next) || (next.x === end.x && next.y === end.y))
				) {
					visited.add(key);
					queue.push({ pos: next, path: [...path, next] });
				}
			}
		}

		return []; // No path found
	}

	public static getVision(
		start: Point,
		range: number,
		gridWidth: number,
		gridHeight: number,
		_isOpaque: (p: Point) => boolean,
	): Point[] {
		const visible: Point[] = [];
		// Simple Diamond/Square vision for now
		for (let dy = -range; dy <= range; dy++) {
			for (let dx = -range; dx <= range; dx++) {
				const p = { x: start.x + dx, y: start.y + dy };
				if (p.x >= 0 && p.x < gridWidth && p.y >= 0 && p.y < gridHeight) {
					// In a real LOS we'd raycast, for now simple range
					if (Math.abs(dx) + Math.abs(dy) <= range) {
						visible.push(p);
					}
				}
			}
		}
		return visible;
	}
}
