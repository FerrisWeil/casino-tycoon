import React, { useState, useRef } from "react";
import styles from "./CasinoFloor.module.css";
import { useGameStore } from "../../store/useGameStore";
import { Plus, Minus, RotateCcw } from "lucide-react";

const CasinoFloor: React.FC = () => {
	const { casinoState, setTile, zoom, setZoom, zoomDuration } = useGameStore();
	const { grid, width, height } = casinoState;

	// Panning State
	const [offset, setOffset] = useState({ x: 0, y: 0 });
	const [isPanning, setIsPanning] = useState(false);
	const lastMousePos = useRef({ x: 0, y: 0 });

	const onMouseDown = (e: React.MouseEvent) => {
		if (
			e.button === 0 &&
			(e.target as HTMLElement).className.includes("viewport")
		) {
			setIsPanning(true);
			lastMousePos.current = { x: e.clientX, y: e.clientY };
		}
	};

	const onMouseMove = (e: React.MouseEvent) => {
		if (!isPanning) return;
		const dx = e.clientX - lastMousePos.current.x;
		const dy = e.clientY - lastMousePos.current.y;
		setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
		lastMousePos.current = { x: e.clientX, y: e.clientY };
	};

	return (
		<div
			className={styles.viewport}
			onMouseDown={onMouseDown}
			onMouseMove={onMouseMove}
			onMouseUp={() => setIsPanning(false)}
			onMouseLeave={() => setIsPanning(false)}
		>
			<div
				className={styles.panLayer}
				style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
			>
				<div
					className={styles.grid}
					style={{
						gridTemplateColumns: `repeat(${width}, ${zoom}px)`,
						width: width * zoom + (width - 1),
						height: height * zoom + (height - 1),
						transitionDuration: `${zoomDuration}s`,
					}}
				>
					{grid.map((row, y) =>
						row.map((tile, x) => (
							<button
								key={tile.id}
								type="button"
								className={`${styles.tile} ${styles[tile.type]}`}
								style={{ width: zoom, height: zoom }}
								onClick={() =>
									setTile(x, y, tile.type === "wall" ? "floor" : "wall")
								}
							/>
						)),
					)}
				</div>
			</div>

			<div className={styles.controls}>
				<button
					type="button"
					className={styles.controlBtn}
					onClick={() => setZoom(zoom + 16)}
				>
					<Plus size={20} />
				</button>
				<button
					type="button"
					className={styles.controlBtn}
					onClick={() => setZoom(32)}
				>
					<RotateCcw size={20} />
				</button>
				<button
					type="button"
					className={styles.controlBtn}
					onClick={() => setZoom(zoom - 16)}
				>
					<Minus size={20} />
				</button>
			</div>
		</div>
	);
};

export default CasinoFloor;
