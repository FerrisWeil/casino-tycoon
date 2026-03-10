import {
	AlertTriangle,
	Armchair as ChairIcon,
	Minus,
	Plus,
	RotateCcw,
	Dices as SlotIcon,
	User as UserIcon,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useGameStore } from "../../store/useGameStore";
import styles from "./CasinoFloor.module.css";

const CasinoFloor: React.FC = () => {
	const {
		casinoState,
		zoom,
		setZoom,
		zoomDuration,
		isBuilding,
		addObject,
		selectObject,
		selectCustomer,
		selectedCustomerId,
		rotateBuild,
		buildRotation,
	} = useGameStore();
	const { grid, width, height, objects, guests } = casinoState;
	const viewportRef = useRef<HTMLDivElement>(null);
	const [hoveredTile, setHoveredTile] = useState<{
		x: number;
		y: number;
	} | null>(null);

	const BASE_TILE_SIZE = 32;

	const fitToScreen = React.useCallback(() => {
		if (!viewportRef.current) return;
		const padding = 120;
		const vWidth = viewportRef.current.clientWidth - padding;
		const vHeight = viewportRef.current.clientHeight - padding;
		const totalBaseWidth = width * BASE_TILE_SIZE + (width - 1);
		const totalBaseHeight = height * BASE_TILE_SIZE + (height - 1);
		const scaleX = vWidth / totalBaseWidth;
		const scaleY = vHeight / totalBaseHeight;
		setZoom(Math.min(scaleX, scaleY));
	}, [width, height, setZoom]);

	useEffect(() => {
		if (zoom === 1.0) {
			fitToScreen();
		}
	}, [fitToScreen, zoom]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key.toLowerCase() === "r") {
				rotateBuild();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [rotateBuild]);

	const handleTileClick = (
		x: number,
		y: number,
		_type: string,
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

		const guest = guests?.find((g) => g.position.x === x && g.position.y === y);
		if (guest) {
			selectCustomer(guest.id);
			return;
		}

		selectCustomer(null);
	};

	const selectedGuest = guests?.find((g) => g.id === selectedCustomerId);

	// Ghost Logic
	const getGhostPositions = (x: number, y: number, rotation: number) => {
		const chairPos = { x, y };
		if (rotation === 0) chairPos.y += 1;
		else if (rotation === 90) chairPos.x -= 1;
		else if (rotation === 180) chairPos.y -= 1;
		else if (rotation === 270) chairPos.x += 1;
		return { machine: { x, y }, chair: chairPos };
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
							(o) =>
								(o.position.x === x && o.position.y === y) ||
								(o.chairPosition.x === x && o.chairPosition.y === y),
						);

						const isMachine = obj?.position.x === x && obj?.position.y === y;
						const isChair =
							obj?.chairPosition.x === x && obj?.chairPosition.y === y;

						const isVisible = selectedGuest?.visionTiles.some(
							(p) => p.x === x && p.y === y,
						);

						const guestAtTile = guests?.find(
							(g) => g.position.x === x && g.position.y === y,
						);

						// Interactable if building, or there is an object/guest here
						const isInteractable = isBuilding || obj || guestAtTile;

						// Ghost rendering
						let ghostType: "none" | "machine" | "chair" = "none";
						if (isBuilding && hoveredTile) {
							const ghost = getGhostPositions(
								hoveredTile.x,
								hoveredTile.y,
								buildRotation,
							);
							if (ghost.machine.x === x && ghost.machine.y === y)
								ghostType = "machine";
							else if (ghost.chair.x === x && ghost.chair.y === y)
								ghostType = "chair";
						}

						return (
							<button
								key={tile.id}
								type="button"
								className={`${styles.tile} ${styles[tile.type]} ${isInteractable ? styles.interactable : ""}`}
								style={{
									width: BASE_TILE_SIZE,
									height: BASE_TILE_SIZE,
									position: "relative",
									backgroundColor: isVisible
										? "rgba(255, 255, 0, 0.15)"
										: undefined,
								}}
								aria-label={`Tile ${x},${y}`}
								data-testid="casino-tile"
								onClick={() =>
									handleTileClick(x, y, tile.type, tile.occupantId)
								}
								onMouseEnter={() => setHoveredTile({ x, y })}
								onMouseLeave={() => setHoveredTile(null)}
							>
								{isMachine && (
									<div style={{ position: "relative" }}>
										<SlotIcon
											size={BASE_TILE_SIZE * 0.7}
											color={obj.isRunning ? "#00ff00" : "#ffd700"}
										/>
										{obj.isUnreachable && (
											<div title="Unreachable!">
												<AlertTriangle
													size={12}
													color="#ff4444"
													style={{ position: "absolute", top: -5, right: -5 }}
												/>
											</div>
										)}
									</div>
								)}
								{isChair && (
									<ChairIcon
										size={BASE_TILE_SIZE * 0.6}
										color="#888"
										style={{ opacity: 0.8 }}
									/>
								)}

								{/* Ghost Render */}
								{ghostType === "machine" && (
									<SlotIcon
										size={BASE_TILE_SIZE * 0.7}
										color="rgba(0, 255, 0, 0.4)"
									/>
								)}
								{ghostType === "chair" && (
									<ChairIcon
										size={BASE_TILE_SIZE * 0.6}
										color="rgba(255, 255, 255, 0.3)"
									/>
								)}

								{guestAtTile && (
									<div key={guestAtTile.id} style={{ position: "absolute" }}>
										<UserIcon size={BASE_TILE_SIZE * 0.8} color="#44aaff" />
										{selectedCustomerId === guestAtTile.id && (
											<div className={styles.customerPopup}>
												<b>Guest</b>
												<br />
												Cash: ${guestAtTile.cash.toFixed(2)}
												<br />
												Patience:{" "}
												<span
													style={{
														color:
															guestAtTile.patience > 60
																? "#4f4"
																: guestAtTile.patience > 30
																	? "#ff0"
																	: "#f44",
													}}
												>
													{Math.floor(guestAtTile.patience)}%
												</span>
											</div>
										)}
									</div>
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
