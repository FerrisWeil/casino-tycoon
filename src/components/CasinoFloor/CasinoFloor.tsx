import { Minus, Plus, RotateCcw, Dices as SlotIcon } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { useGameStore } from "../../store/useGameStore";
import styles from "./CasinoFloor.module.css";

const CasinoFloor: React.FC = () => {
	const {
		casinoState,
		setTile,
		zoom,
		setZoom,
		zoomDuration,
		isBuilding,
		addObject,
		selectObject,
	} = useGameStore();
	const { grid, width, height, objects } = casinoState;
	const viewportRef = useRef<HTMLDivElement>(null);

	const BASE_TILE_SIZE = 32;

	const fitToScreen = () => {
		if (!viewportRef.current) return;
		const padding = 120;
		const vWidth = viewportRef.current.clientWidth - padding;
		const vHeight = viewportRef.current.clientHeight - padding;
		const totalBaseWidth = width * BASE_TILE_SIZE + (width - 1);
		const totalBaseHeight = height * BASE_TILE_SIZE + (height - 1);
		const scaleX = vWidth / totalBaseWidth;
		const scaleY = vHeight / totalBaseHeight;
		setZoom(Math.min(scaleX, scaleY));
	};

	useEffect(() => {
		if (zoom === 1.0) {
			fitToScreen();
		}
	}, []);

	const handleTileClick = (
		x: number,
		y: number,
		type: string,
		occupantId?: string,
	) => {
		if (isBuilding) {
			addObject(x, y);
			return;
		}

		if (occupantId) {
			selectObject(occupantId);
			return;
		}

		setTile(x, y, type === "wall" ? "floor" : "wall");
	};

	return (
		<div className={styles.viewport} ref={viewportRef}>
			<div
				className={styles.grid}
				style={{
					gridTemplateColumns: `repeat(${width}, ${BASE_TILE_SIZE}px)`,
					gridTemplateRows: `repeat(${height}, ${BASE_TILE_SIZE}px)`,
					transform: `scale(${zoom})`,
					transitionDuration: `${zoomDuration}s`,
				}}
			>
				{grid.map((row, y) =>
					row.map((tile, x) => {
						const obj = objects.find(
							(o) => o.position.x === x && o.position.y === y,
						);
						return (
							<button
								key={tile.id}
								type="button"
								className={`${styles.tile} ${styles[tile.type]}`}
								onClick={() =>
									handleTileClick(x, y, tile.type, tile.occupantId)
								}
							>
								{obj && (
									<SlotIcon
										size={BASE_TILE_SIZE * 0.7}
										color={obj.isRunning ? "#00ff00" : "#ffd700"}
									/>
								)}
							</button>
						);
					}),
				)}
			</div>

			<div className={styles.controls}>
				<button
					type="button"
					className={styles.controlBtn}
					onClick={() => setZoom(zoom + 0.2)}
					title="Zoom In"
				>
					<Plus size={20} />
				</button>
				<div className={styles.separator} />
				<button
					type="button"
					className={styles.controlBtn}
					onClick={() => fitToScreen()}
					title="Reset Zoom"
				>
					<RotateCcw size={18} />
				</button>
				<div className={styles.separator} />
				<button
					type="button"
					className={styles.controlBtn}
					onClick={() => setZoom(Math.max(0.1, zoom - 0.2))}
					title="Zoom Out"
				>
					<Minus size={20} />
				</button>
			</div>
		</div>
	);
};

export default CasinoFloor;
