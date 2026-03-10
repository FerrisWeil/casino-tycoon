import type React from "react";

interface SpriteProps {
	size: number;
	color?: string;
	isRunning?: boolean;
}

export const PokieSprite: React.FC<SpriteProps> = ({ size, isRunning }) => {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 32 32"
			style={{ imageRendering: "pixelated" }}
		>
			{/* Fun Retro Cabinet (Red/Gold) */}
			<rect x="2" y="2" width="28" height="28" fill="#800" />
			<rect x="4" y="4" width="24" height="24" fill="#a00" />
			<rect x="2" y="2" width="28" height="2" fill="#ffd700" />{" "}
			{/* Gold Top Line */}
			<rect x="2" y="28" width="28" height="2" fill="#ffd700" />{" "}
			{/* Gold Bottom Line */}
			{/* Marquee with Neon Lights */}
			<rect x="6" y="5" width="20" height="5" fill="#111" />
			<rect x="7" y="6" width="18" height="3" fill="#ff00ff" opacity="0.8">
				{isRunning && (
					<animate
						attributeName="fill"
						values="#ff00ff;#00ffff;#ffd700;#ff00ff"
						dur="1s"
						repeatCount="indefinite"
					/>
				)}
			</rect>
			{/* The Reels (3-Column Design) */}
			<rect x="6" y="11" width="20" height="12" fill="#000" />
			{/* Reel 1 */}
			<rect x="7" y="12" width="5" height="10" fill="#eee" />
			{isRunning && (
				<rect x="7" y="12" width="5" height="10" fill="url(#reel-grad)">
					<animate
						attributeName="opacity"
						values="0.5;1;0.5"
						dur="0.2s"
						repeatCount="indefinite"
					/>
				</rect>
			)}
			<rect x="8" y="14" width="3" height="2" fill="#f00" /> {/* Symbol */}
			<rect x="8" y="18" width="3" height="2" fill="#00f" /> {/* Symbol */}
			{/* Reel 2 */}
			<rect x="13.5" y="12" width="5" height="10" fill="#eee" />
			{isRunning && (
				<rect x="13.5" y="12" width="5" height="10" fill="url(#reel-grad)">
					<animate
						attributeName="opacity"
						values="0.5;1;0.5"
						dur="0.3s"
						repeatCount="indefinite"
					/>
				</rect>
			)}
			<rect x="14.5" y="16" width="3" height="2" fill="#0f0" /> {/* Symbol */}
			{/* Reel 3 */}
			<rect x="20" y="12" width="5" height="10" fill="#eee" />
			{isRunning && (
				<rect x="20" y="12" width="5" height="10" fill="url(#reel-grad)">
					<animate
						attributeName="opacity"
						values="0.5;1;0.5"
						dur="0.25s"
						repeatCount="indefinite"
					/>
				</rect>
			)}
			<rect x="21" y="13" width="3" height="2" fill="#ffd700" /> {/* Symbol */}
			<rect x="21" y="19" width="3" height="2" fill="#f0f" /> {/* Symbol */}
			{/* Reel Polish: Dividers */}
			<rect x="12" y="12" width="1.5" height="10" fill="#000" />
			<rect x="18.5" y="12" width="1.5" height="10" fill="#000" />
			{/* Control Panel */}
			<rect x="4" y="24" width="24" height="4" fill="#333" />
			<rect x="8" y="25" width="3" height="2" fill="#ffd700" />
			<rect x="15" y="25" width="3" height="2" fill="#0f0" />
			<rect x="22" y="25" width="3" height="2" fill="#f00" />
			{/* Handle */}
			<rect x="30" y="8" width="2" height="12" fill="#666" />
			<circle cx="31" cy="8" r="2" fill="#ffd700" />
			<defs>
				<linearGradient id="reel-grad" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stopColor="#fff" />
					<stop offset="50%" stopColor="#aaa" />
					<stop offset="100%" stopColor="#fff" />
				</linearGradient>
			</defs>
		</svg>
	);
};

export const ChairSprite: React.FC<SpriteProps> = ({ size }) => {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 32 32"
			style={{ imageRendering: "pixelated" }}
		>
			<rect x="4" y="26" width="24" height="2" fill="rgba(0,0,0,0.4)" />
			<rect x="4" y="12" width="24" height="14" rx="2" fill="#600" />
			<rect x="6" y="14" width="20" height="10" rx="1" fill="#800" />
			<rect x="8" y="16" width="16" height="6" fill="#a00" />
			<rect x="4" y="4" width="24" height="10" rx="4" fill="#500" />
			<rect x="6" y="6" width="20" height="8" rx="2" fill="#800" />
		</svg>
	);
};

export const GuestSprite: React.FC<SpriteProps & { isMoving?: boolean }> = ({
	size,
	color = "#44aaff",
}) => {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 16 16"
			style={{ imageRendering: "pixelated" }}
		>
			<rect x="5" y="1" width="6" height="6" fill="#ffdbac" />
			<rect x="5" y="1" width="6" height="2" fill="#422" />
			<rect x="6" y="4" width="1" height="1" fill="#000" />
			<rect x="9" y="4" width="1" height="1" fill="#000" />
			<rect x="4" y="7" width="8" height="6" fill={color} />
			<rect x="5" y="8" width="6" height="4" fill="rgba(255,255,255,0.1)" />
			<rect x="5" y="13" width="2" height="2" fill="#222" />
			<rect x="9" y="13" width="2" height="2" fill="#222" />
		</svg>
	);
};
