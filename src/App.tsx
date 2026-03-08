import { useEffect, useState, useRef } from "react";
import { HashRouter, Routes, Route, useLocation } from "react-router-dom";
import { Coins, UserSquare, Hand } from "lucide-react";
import { useGameStore } from "./store/useGameStore";
import DesignLab from "./components/DesignLab/DesignLab";
import DevShell from "./components/DevShell/DevShell";
import CasinoFloor from "./components/CasinoFloor/CasinoFloor";
import ShopMenu from "./components/ShopMenu/ShopMenu";
import PokieDialog from "./components/PokieDialog/PokieDialog";

function GameView() {
	const { money, reputation, manualDeal, tick } = useGameStore();
	const location = useLocation();
	const [isDevMode, setIsDevMode] = useState(false);

	// Game Loop
	const lastTime = useRef(performance.now());
	useEffect(() => {
		let frameId: number;
		const loop = (time: number) => {
			const dt = (time - lastTime.current) / 1000;
			lastTime.current = time;
			tick(dt);
			frameId = requestAnimationFrame(loop);
		};
		frameId = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(frameId);
	}, [tick]);

	useEffect(() => {
		const params = new URLSearchParams(location.search);
		const hashParams = new URLSearchParams(window.location.hash.split("?")[1]);
		if (params.get("dev") === "true" || hashParams.get("dev") === "true") {
			setIsDevMode(true);
		}
	}, [location.search]);

	const content = (
		<div
			style={{
				position: "relative",
				width: "100vw",
				height: "100vh",
				overflow: "hidden",
			}}
		>
			{/* Floating HUD */}
			<header
				style={{
					position: "fixed",
					top: "20px",
					left: "50%",
					transform: "translateX(-50%)",
					zIndex: 1000,
					display: "flex",
					gap: "2rem",
					padding: "0.75rem 1.5rem",
					background: "rgba(20, 20, 20, 0.85)",
					backdropFilter: "blur(8px)",
					border: "1px solid #444",
					borderRadius: "50px",
					boxShadow: "0 4px 15px rgba(0,0,0,0.5)",
					alignItems: "center",
				}}
			>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: "0.5rem",
						color: "#ffd700",
					}}
				>
					<Coins size={18} />
					<span style={{ fontWeight: "bold" }}>${money.toFixed(2)}</span>
				</div>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: "0.5rem",
						color: "#00ff00",
					}}
				>
					<UserSquare size={18} />
					<span>{reputation} Rep</span>
				</div>
				<button
					type="button"
					onClick={() => manualDeal()}
					style={{
						padding: "4px 12px",
						borderRadius: "20px",
						fontSize: "0.7rem",
						display: "flex",
						alignItems: "center",
						gap: "0.4rem",
						background: "#333",
					}}
				>
					<Hand size={12} /> Deal
				</button>
			</header>

			<CasinoFloor />
			<ShopMenu />
			<PokieDialog />
		</div>
	);

	if (isDevMode) {
		return <DevShell>{content}</DevShell>;
	}

	return content;
}

function App() {
	return (
		<HashRouter>
			<Routes>
				<Route path="/" element={<GameView />} />
				<Route path="/design-lab" element={<DesignLab />} />
			</Routes>
		</HashRouter>
	);
}

export default App;
