import {
	Minus,
	Plus,
	RotateCcw,
	AlertTriangle,
	Sun as SunIcon,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useGameStore } from "../../store/useGameStore";
import styles from "./CasinoFloor.module.css";
import { 
  PokieSprite, 
  ChairSprite, 
  GuestSprite, 
  BackWallSprite,
  WelcomeMatSprite,
  PillarSprite
} from "../Graphics/Sprites";
import DynamicShadow from "../Graphics/DynamicShadow";

const CasinoFloor: React.FC = () => {
	const {
		casinoState,
		zoom,
		setZoom,
		isBuilding,
		addObject,
		selectObject,
		selectedObjectId,
		selectCustomer,
		selectedCustomerId,
		rotateBuild,
		buildRotation,
    sunPos,
    setSunPos,
    showSun,
    moveManager
	} = useGameStore();
	const { grid, width, height, objects, guests, managerPos } = casinoState;
	const viewportRef = useRef<HTMLDivElement>(null);
	const [hoveredTile, setHoveredTile] = useState<{ x: number; y: number } | null>(null);
  
  const [isDraggingSun, setIsDraggingSun] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [hasMovedSignificantly, setHasMovedSignificantly] = useState(false);

	const BASE_TILE_SIZE = 16;
  const totalGridWidth = (width * BASE_TILE_SIZE) + (width - 1);
  const totalGridHeight = (height * BASE_TILE_SIZE) + (height - 1);

	const fitToScreen = React.useCallback(() => {
		if (!viewportRef.current) return;
		const padding = 120;
		const vWidth = viewportRef.current.clientWidth - padding;
		const vHeight = viewportRef.current.clientHeight - padding;
		setZoom(Math.min(vWidth / totalGridWidth, vHeight / totalGridHeight));
    setPanOffset({ x: 0, y: 0 });
	}, [totalGridWidth, totalGridHeight, setZoom]);

	useEffect(() => { if (zoom === 1.0) fitToScreen(); }, [fitToScreen, zoom]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key.toLowerCase() === "r") rotateBuild();
      if (isBuilding) return;
      if (e.key.toLowerCase() === "w") moveManager(0, -1);
      if (e.key.toLowerCase() === "s") moveManager(0, 1);
      if (e.key.toLowerCase() === "a") moveManager(-1, 0);
      if (e.key.toLowerCase() === "d") moveManager(1, 0);
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [rotateBuild, isBuilding, moveManager]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setLastMousePos({ x: e.clientX, y: e.clientY });
    setHasMovedSignificantly(false);
    if (!isBuilding && !isDraggingSun) setIsPanning(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const dx = e.clientX - lastMousePos.x;
    const dy = e.clientY - lastMousePos.y;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) setHasMovedSignificantly(true);

    if (isDraggingSun && viewportRef.current) {
      const rect = viewportRef.current.getBoundingClientRect();
      setSunPos({ x: 50, y: ((e.clientY - rect.top) / rect.height) * 100 });
    } else if (isPanning) {
      setPanOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    }
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => { setIsDraggingSun(false); setIsPanning(false); };

	const handleTileClick = (x: number, y: number, _type: string, occupantId?: string) => {
		if (hasMovedSignificantly) return;
		if (isBuilding) { addObject(x, y); return; }
		if (occupantId) {
			const obj = objects.find((o) => o.id === occupantId);
			if (obj?.position.x === x && obj?.position.y === y && obj.type === 'pokie-basic') {
        selectObject(occupantId); return;
      }
		}
		const guest = guests?.find((g) => g.position.x === x && g.position.y === y);
		if (guest) { selectCustomer(guest.id); return; }
		selectObject(null); selectCustomer(null);
	};

	const selectedGuest = guests?.find((g) => g.id === selectedCustomerId);
  const wallShadowX = (sunPos.x - 50) * 0.4;

	return (
		<div className={styles.viewport} ref={viewportRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} style={{ cursor: isPanning ? 'grabbing' : (isBuilding ? 'crosshair' : 'grab') }}>
      {showSun && (
        <div style={{ position: 'absolute', left: `50%`, top: `${sunPos.y}%`, cursor: 'grab', zIndex: 5000, color: '#ffd700', filter: 'drop-shadow(0 0 10px #f00)', transform: 'translate(-50%, -50%)' }} onMouseDown={(e) => { e.stopPropagation(); setIsDraggingSun(true); }}>
          <SunIcon size={48} fill="currentColor" />
        </div>
      )}

			<div className={styles.room} style={{ transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`, width: totalGridWidth, height: totalGridHeight, transition: isPanning ? 'none' : 'transform 0.1s ease-out' }}>
        <div className={styles.backWall}><BackWallSprite width={totalGridWidth} /></div>
        <div className={styles.floorContainer}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '32px', background: 'linear-gradient(rgba(0,0,0,0.4), transparent)', transform: `skewX(${wallShadowX}deg)`, transformOrigin: 'top', pointerEvents: 'none', zIndex: 5 }} />
          
          <div className={styles.grid} style={{ gridTemplateColumns: `repeat(${width}, ${BASE_TILE_SIZE}px)`, gridTemplateRows: `repeat(${height}, ${BASE_TILE_SIZE}px)`, width: totalGridWidth, height: totalGridHeight }}>
            {grid.map((row, y) =>
              row.map((tile, x) => {
                const isEntrance = x === 3 && y === 6;
                const isVisibleByGuest = selectedGuest?.visionTiles.some((p) => p.x === x && p.y === y);
                return (
                  <div key={tile.id} className={`${styles.tile} ${styles[tile.type]} ${isBuilding ? styles.interactable : ""}`} style={{ width: BASE_TILE_SIZE, height: BASE_TILE_SIZE, backgroundColor: isVisibleByGuest ? "rgba(255, 255, 0, 0.1) " : undefined, border: 'none' }} onClick={isBuilding ? () => handleTileClick(x, y, tile.type, tile.occupantId) : undefined}>
                    {isEntrance && <WelcomeMatSprite size={16} />}
                  </div>
                );
              }),
            )}

            {/* ENTITY LAYER: Objects, Guests, Manager - Y-Sorted */}
            {objects.map((obj) => {
              const isPillar = obj.type === 'pillar';
              const isSelected = obj.id === selectedObjectId;
              const zIndex = 100 + (obj.position.y * 10);

              return (
                <div 
                  key={obj.id}
                  className={`${styles.entityWrapper} ${isSelected ? styles.selected : ""}`}
                  style={{ 
                    position: 'absolute', 
                    left: obj.position.x * (BASE_TILE_SIZE + 1), 
                    top: obj.position.y * (BASE_TILE_SIZE + 1),
                    width: BASE_TILE_SIZE,
                    height: BASE_TILE_SIZE,
                    zIndex,
                    pointerEvents: obj.type === 'pokie-basic' ? 'all' : 'none'
                  }}
                  onClick={obj.type === 'pokie-basic' ? () => handleTileClick(obj.position.x, obj.position.y, 'floor', obj.id) : undefined}
                >
                  <DynamicShadow sunPos={sunPos} shape="rect" height={obj.visualHeight}>
                    {isPillar ? <PillarSprite size={16} /> : <PokieSprite size={16} isRunning={obj.isRunning} rotation={obj.rotation} />}
                  </DynamicShadow>
                  
                  {!isPillar && (
                    <div style={{ position: 'absolute', left: (obj.chairPosition.x - obj.position.x) * (BASE_TILE_SIZE+1), top: (obj.chairPosition.y - obj.position.y) * (BASE_TILE_SIZE+1), width: 16, height: 16 }}>
                       <DynamicShadow sunPos={sunPos} shape="rect" height={16}><ChairSprite size={16} /></DynamicShadow>
                    </div>
                  )}
                </div>
              );
            })}

            {guests?.map((g) => {
              const isSelectedGuest = g.id === selectedCustomerId;
              const zIndex = 100 + (g.position.y * 10) + 5;
              return (
                <div key={g.id} style={{ position: "absolute", left: g.position.x * (BASE_TILE_SIZE + 1), top: g.position.y * (BASE_TILE_SIZE + 1), width: BASE_TILE_SIZE, height: BASE_TILE_SIZE, transition: "all 0.5s linear", zIndex, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => selectCustomer(g.id)}>
                  <DynamicShadow sunPos={sunPos} shape="circle" height={24}><GuestSprite size={24} color={g.id.includes("guest-a") ? "#ff4444" : "#44aaff"} isRunning={g.path.length > 0} /></DynamicShadow>
                </div>
              );
            })}

            <div style={{ position: "absolute", left: managerPos.x * (BASE_TILE_SIZE + 1), top: managerPos.y * (BASE_TILE_SIZE + 1), width: BASE_TILE_SIZE, height: BASE_TILE_SIZE, transition: "all 0.15s linear", zIndex: 100 + (managerPos.y * 10) + 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <DynamicShadow sunPos={sunPos} shape="circle" height={24}><GuestSprite size={24} color="#800080" isRunning={false} /></DynamicShadow>
            </div>

            {isBuilding && hoveredTile && (
              <div style={{ position: 'absolute', left: hoveredTile.x * (BASE_TILE_SIZE + 1), top: hoveredTile.y * (BASE_TILE_SIZE + 1), width: 16, height: 16, zIndex: 1000, pointerEvents: 'none', opacity: 0.4 }}>
                {selectedObject === 'pillar' ? <PillarSprite size={16} /> : <PokieSprite size={16} rotation={buildRotation} />}
              </div>
            )}
          </div>
        </div>
			</div>

			<div className={styles.controls}>
				<button type="button" className={styles.controlBtn} onClick={() => setZoom(zoom + 0.2)} title="Zoom In"><Plus size={20} /></button>
				<div className={styles.separator} /><button type="button" className={styles.controlBtn} onClick={() => fitToScreen()} title="Reset View"><RotateCcw size={18} /></button>
				<div className={styles.separator} /><button type="button" className={styles.controlBtn} onClick={() => setZoom(Math.max(0.1, zoom - 0.2))} title="Zoom Out"><Minus size={20} /></button>
			</div>
		</div>
	);
};

export default CasinoFloor;
