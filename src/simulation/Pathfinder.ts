import type { SubPoint } from "../types";

export class Pathfinder {
	public static findPath(
		start: SubPoint,
		end: SubPoint,
		gridWidth: number, // Sub-grid width
		gridHeight: number, // Sub-grid height
		isBlocked: (p: SubPoint) => boolean,
	): SubPoint[] {
		const queue: { pos: SubPoint; path: SubPoint[] }[] = [
			{ pos: start, path: [] },
		];
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

		return [];
	}
}
