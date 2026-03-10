import React from "react";

interface SpriteProps {
	size: number;
	color?: string;
	isRunning?: boolean;
  rotation?: number;
}

/**
 * 16px SCALE SPRITES (1m = 16px)
 * All bases are strictly 16px wide to match the 1x1 tile.
 */

export const PillarSprite: React.FC<SpriteProps> = ({ size }) => {
  return (
    <svg width={16} height={32} viewBox="0 0 16 32" style={{ imageRendering: 'pixelated', display: 'block' }}>
      {/* Body - 12px wide center */}
      <rect x="2" y="4" width="12" height="24" fill="#444" />
      <rect x="4" y="6" width="8" height="20" fill="#666" />
      {/* Top Cap - 16px full width */}
      <rect x="0" y="0" width="16" height="4" fill="#333" />
      {/* Base - 16px full width, sitting flush on tile */}
      <rect x="0" y="28" width="16" height="4" fill="#222" />
    </svg>
  );
};

export const WelcomeMatSprite: React.FC<SpriteProps> = ({ size }) => {
  return (
    <div style={{ position: 'relative', width: 16, height: 16 }}>
      <svg width={16} height={24} viewBox="0 0 16 24" style={{ imageRendering: 'pixelated', position: 'absolute', top: 0, left: 0, zIndex: 10 }}>
        <rect x="0" y="0" width={16} height={16} fill="#840" />
        <rect x="1" y="1" width={14} height={14} fill="#a62" />
        <rect x="0" y="16" width={16} height={6} fill="#840" />
        <rect x="1" y="16" width={14} height={5} fill="#a62" />
      </svg>
    </div>
  );
};

export const BackWallSprite: React.FC<{ width: number }> = ({ width }) => {
  return (
    <svg width={width} height={64} viewBox={`0 0 ${width} 64`} style={{ imageRendering: 'pixelated', display: 'block' }}>
      <rect x="0" y="0" width={width} height="30" fill="#88ccff" />
      <rect x="0" y="0" width={width} height="6" fill="#55aaff" />
      <rect x="0" y="30" width={width} height="34" fill="#532" />
      <rect x="0" y="30" width={width} height="6" fill="#321" />
      <rect x="0" y="60" width={width} height="4" fill="#ffd700" />
    </svg>
  );
};

export const PokieSprite: React.FC<SpriteProps> = ({ size, isRunning, rotation = 0 }) => {
	return (
		<svg width={16} height={32} viewBox="0 0 16 32" style={{ imageRendering: "pixelated", display: 'block' }}>
      <defs>
        <linearGradient id="reel-grad-anim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="50%" stopColor="#888" />
          <stop offset="100%" stopColor="#fff" />
        </linearGradient>
      </defs>
      <g id="pokie-base">
        <rect x="0" y="2" width="16" height="30" fill="#800" />
        <rect x="1" y="4" width="14" height="26" fill="#a00" />
        <rect x="0" y="2" width="16" height="2" fill="#ffd700" />
        <rect x="0" y="28" width="16" height="2" fill="#ffd700" />
        
        {rotation === 0 && (
          <g id="front-details">
            <rect x="2" y="5" width="12" height="4" fill="#111" />
            <rect x="3" y="6" width="10" height="2" fill="#ff00ff">
              {isRunning && <animate attributeName="fill" values="#ff00ff;#00ffff;#ffd700;#ff00ff" dur="1s" repeatCount="indefinite" />}
            </rect>
            <rect x="2" y="10" width="12" height="8" fill="#000" />
            <rect x="3" y="11" width="2" height="6" fill="#eee" />
            <rect x="7" y="11" width="2" height="6" fill="#eee" />
            <rect x="11" y="11" width="2" height="6" fill="#eee" />
            <rect x="2" y="20" width="12" height="4" fill="#333" />
          </g>
        )}
      </g>
		</svg>
	);
};

export const ChairSprite: React.FC<SpriteProps> = ({ size }) => {
	return (
		<svg width={16} height={16} viewBox="0 0 16 16" style={{ imageRendering: "pixelated", display: 'block' }}>
			<rect x="0" y="0" width={16} height={16} rx="2" fill="#600" />
			<rect x="2" y="2" width="12" height="12" rx="1" fill="#a00" />
		</svg>
	);
};

export const GuestSprite: React.FC<SpriteProps & { isRunning?: boolean }> = ({ size, color = "#44aaff", isRunning }) => {
	return (
		<svg width={16} height={24} viewBox="0 0 16 24" style={{ imageRendering: "pixelated", overflow: 'visible', display: 'block' }}>
      <g>
        {isRunning && (
          <animateTransform attributeName="transform" type="translate" values="0,0; 0,-1; 0,0" dur="0.4s" repeatCount="indefinite" />
        )}
        <rect x="4" y="1" width="8" height="10" fill="#000" rx="1" />
        <rect x="3" y="10" width="10" height="10" fill="#000" rx="1" />
        <rect x="5" y="2" width="6" height="8" fill="#ffdbac" />
        <rect x="5" y="2" width="6" height="3" fill="#422" />
        <rect x="6" y="6" width="1" height="1" fill="#000" />
        <rect x="9" y="6" width="1" height="1" fill="#000" />
        <rect x="4" y="11" width="8" height="8" fill={color} />
        <rect x="5" y="12" width="6" height="2" fill="rgba(255,255,255,0.2)" />
        <rect x="5" y="19" width="3" height="3" fill="#226" />
        <rect x="8" y="19" width="3" height="3" fill="#226" />
        <rect x="5" y="22" width="2" height="1" fill="#111" />
        <rect x="9" y="22" width="2" height="1" fill="#111" />
      </g>
		</svg>
	);
};
