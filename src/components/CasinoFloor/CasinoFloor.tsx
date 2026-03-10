import { AlertTriangle, Minus, Plus, RotateCcw } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useGameStore } from "../../store/useGameStore";
import { ChairSprite, GuestSprite, PokieSprite } from "../Graphics/Sprites";
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
		selectedObjectId,
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
	const SUB_TILE_SIZE = BASE_TILE_SIZE / 2;

	const fitToScreen = React.useCallback(() => {
		if (!viewportRef.current) return;
		const padding = 120;
		const vWidth = viewportRef.current.clientWidth - padding;
		const vHeight = viewportRef.current.clientHeight - padding;
		const totalBaseWidth = width * BASE_TILE_SIZE;
		const totalBaseHeight = height * BASE_TILE_SIZE;
		const scaleX = vWidth / totalBaseWidth;
		const scaleY = vHeight / totalBaseHeight;
		setZoom(Math.min(scaleX, scaleY));
	}, [width, height, setZoom]);

	useEffect(() => {
		if (zoom === 1.0) fitToScreen();
	}, [fitToScreen, zoom]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key.toLowerCase() === "r") rotateBuild();
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
			const obj = objects.find((o) => o.id === occupantId);
			const isMachineTile = obj?.position.x === x && obj?.position.y === y;

			if (isMachineTile) {
				selectObject(occupantId);
				return;
			}
		}

		const guest = guests?.find(
			(g) =>
				Math.floor(g.position.x / 2) === x &&
				Math.floor(g.position.y / 2) === y,
		);
		if (guest) {
			selectCustomer(guest.id);
			return;
		}

		// Clear selections if clicking empty floor
		selectObject(null);
		selectCustomer(null);
	};

	const selectedGuest = guests?.find((g) => g.id === selectedCustomerId);

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

						const isVisibleByGuest = selectedGuest?.visionTiles.some(
							(p) => p.x === x && p.y === y,
						);

						// Ghost Logic
						let ghostType: "none" | "machine" | "chair" = "none";
						if (isBuilding && hoveredTile) {
							const chairY =
								buildRotation === 0
									? hoveredTile.y + 1
									: buildRotation === 180
										? hoveredTile.y - 1
										: hoveredTile.y;
							const chairX =
								buildRotation === 90
									? hoveredTile.x - 1
									: buildRotation === 270
										? hoveredTile.x + 1
										: hoveredTile.x;
							if (hoveredTile.x === x && hoveredTile.y === y)
								ghostType = "machine";
							else if (chairX === x && chairY === y) ghostType = "chair";
						}

						const guestAtTile = guests?.find(
							(g) =>
								Math.floor(g.position.x / 2) === x &&
								Math.floor(g.position.y / 2) === y,
						);

						const isInteractable = isBuilding || isMachine || guestAtTile;
						const isSelected = isMachine && obj?.id === selectedObjectId;

						return (
							<button
								key={tile.id}
								type="button"
								className={`${styles.tile} ${styles[tile.type]} ${isInteractable ? styles.interactable : ""} ${isSelected ? styles.selected : ""}`}
								style={{
									width: BASE_TILE_SIZE,
									height: BASE_TILE_SIZE,
									position: "relative",
									backgroundColor: isVisibleByGuest
										? "rgba(255, 255, 0, 0.15)"
										: undefined,
								}}
								aria-label={`Tile ${x},${y}`}
								onClick={() =>
									handleTileClick(x, y, tile.type, tile.occupantId)
								}
								onMouseEnter={() => setHoveredTile({ x, y })}
								onMouseLeave={() => setHoveredTile(null)}
							>
								{isMachine && (
									<div style={{ position: "relative" }}>
										<PokieSprite
											size={BASE_TILE_SIZE}
											isRunning={obj.isRunning}
										/>
										{obj.isUnreachable && (
											<div style={{ position: "absolute", top: -5, right: -5 }}>
												<AlertTriangle size={12} color="#ff4444" />
											</div>
										)}
									</div>
								)}
								{isChair && <ChairSprite size={BASE_TILE_SIZE} />}

								{/* Ghost Render */}
								{ghostType === "machine" && (
									<div style={{ opacity: 0.4 }}>
										<PokieSprite size={BASE_TILE_SIZE} />
									</div>
								)}
								{ghostType === "chair" && (
									<div style={{ opacity: 0.3 }}>
										<ChairSprite size={BASE_TILE_SIZE} />
									</div>
								)}

								{tile.type === "entrance" && (
									<div
										style={{
											width: "4px",
											height: "100%",
											background: "#0f0",
											position: "absolute",
											left: 0,
										}}
									/>
								)}
							</button>
						);
					}),
				)}

				{/* High-Fidelity Guest Layer */}
				{guests?.map((g) => {
					const patienceColor =
						g.patience > 60 ? "#4f4" : g.patience > 30 ? "#ff0" : "#f44";
					const isSelectedGuest = g.id === selectedCustomerId;

					return (
						<div
							key={g.id}
							style={{
								position: "absolute",
								left: g.position.x * SUB_TILE_SIZE,
								top: g.position.y * SUB_TILE_SIZE,
								width: SUB_TILE_SIZE,
								height: SUB_TILE_SIZE,
								transition: "all 0.5s linear",
								pointerEvents: "none",
								zIndex: 100,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								// Highlight the specific sub-tile the guest is on if selected
								background: isSelectedGuest
									? "rgba(255, 215, 0, 0.2)"
									: undefined,
								boxShadow: isSelectedGuest
									? "0 0 10px var(--pixel-accent)"
									: undefined,
							}}
						>
							<GuestSprite
								size={SUB_TILE_SIZE}
								color={g.id.includes("guest-a") ? "#ff4444" : "#44aaff"}
							/>
							{isSelectedGuest && (
								<div className={styles.customerPopup}>
									<b>Guest</b>
									<br />
									Cash: ${g.cash.toFixed(2)}
									<br />
									Patience:{" "}
									<span style={{ color: patienceColor }}>
										{Math.floor(g.patience)}%
									</span>
								</div>
							)}
						</div>
					);
				})}
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
