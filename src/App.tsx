import { Clock, Coins, Play, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { HashRouter, Route, Routes, useLocation } from "react-router-dom";
import CasinoFloor from "./components/CasinoFloor/CasinoFloor";
import DesignLab from "./components/DesignLab/DesignLab";
import DevShell from "./components/DevShell/DevShell";
import EndOfDayDialog from "./components/EndOfDayDialog/EndOfDayDialog";
import PokieDialog from "./components/PokieDialog/PokieDialog";
import ShopMenu from "./components/ShopMenu/ShopMenu";
import { useGameStore } from "./store/useGameStore";

function GameView() {
	const {
		money,
		tick,
		loadGame,
		isOpen,
		toggleOpen,
		day,
		dayTimer,
		isHydrated,
	} = useGameStore();
	const location = useLocation();
	const [isDevMode, setIsDevMode] = useState(false);

	const lastTime = useRef(performance.now());
	useEffect(() => {
		loadGame();
		let frameId: number;
		const loop = (time: number) => {
			const dt = (time - lastTime.current) / 1000;
			lastTime.current = time;
			tick(dt);
			frameId = requestAnimationFrame(loop);
		};
		frameId = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(frameId);
	}, [tick, loadGame]);

	// Auto-save every 5 seconds
	const { saveGame } = useGameStore();
	useEffect(() => {
		const interval = setInterval(() => {
			if (isOpen && isHydrated) {
				saveGame();
			}
		}, 5000);
		return () => clearInterval(interval);
	}, [isOpen, isHydrated, saveGame]);

	useEffect(() => {
		const params = new URLSearchParams(location.search);
		const hashParams = new URLSearchParams(window.location.hash.split("?")[1]);
		if (params.get("test") === "true" || hashParams.get("test") === "true") {
			localStorage.removeItem("casino-storage");
		}
		if (params.get("dev") === "true" || hashParams.get("dev") === "true") {
			setIsDevMode(true);
		}
	}, [location.search]);

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	const content = (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				width: "100vw",
				height: "100vh",
				overflow: "hidden",
				background: "#000",
			}}
		>
			{/* Static Block Header */}
			<header
				style={{
					width: "100%",
					height: "60px",
					display: "flex",
					gap: "2rem",
					padding: "0 2rem",
					background: "#151515",
					borderBottom: "2px solid #333",
					alignItems: "center",
					justifyContent: "space-between",
					zIndex: 1000,
					flexShrink: 0,
				}}
			>
				<div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: "0.5rem",
							color: "#aaa",
						}}
					>
						<Clock size={16} />
						<span
							style={{ fontSize: "0.9rem", fontWeight: "bold", color: "#eee" }}
						>
							Day {day} ({formatTime(dayTimer)})
						</span>
					</div>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: "0.5rem",
							color: "#ffd700",
						}}
					>
						<Coins size={20} />
						<span style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
							${money.toFixed(2)}
						</span>
					</div>
					{!isHydrated && (
						<span style={{ color: "#ff4444", fontSize: "10px" }}>
							Loading...
						</span>
					)}
					{isHydrated && (
						<span style={{ color: "#44ff44", fontSize: "8px", opacity: 0.5 }}>
							● Syncing
						</span>
					)}
				</div>

				<button
					type="button"
					onClick={() => toggleOpen()}
					style={{
						padding: "8px 24px",
						borderRadius: "4px",
						fontSize: "0.85rem",
						fontWeight: "bold",
						background: isOpen ? "#442222" : "#224422",
						border: `2px solid ${isOpen ? "#f44" : "#4f4"}`,
						display: "flex",
						alignItems: "center",
						gap: "0.5rem",
						color: "#fff",
						boxShadow: "none",
					}}
				>
					{isOpen ? (
						<>
							<Square size={14} fill="currentColor" /> Close Casino
						</>
					) : (
						<>
							<Play size={14} fill="currentColor" /> Open Casino ($500)
						</>
					)}
				</button>
			</header>

			{/* Main Game Area */}
			<main style={{ flex: 1, position: "relative", overflow: "hidden" }}>
				<CasinoFloor />
				<ShopMenu />
				<PokieDialog />
				<EndOfDayDialog />
			</main>
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
