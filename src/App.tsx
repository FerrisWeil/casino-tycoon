import { Clock, Coins } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { HashRouter, Route, Routes, useLocation } from "react-router-dom";
import CasinoFloor from "./components/CasinoFloor/CasinoFloor";
import DesignLab from "./components/DesignLab/DesignLab";
import DevShell from "./components/DevShell/DevShell";
import EndOfDayDialog from "./components/EndOfDayDialog/EndOfDayDialog";
import SpriteAtlas from "./components/Graphics/SpriteAtlas";
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
			{/* 16-Bit Style Header */}
			<header
				style={{
					width: "100%",
					height: "70px",
					display: "flex",
					padding: "0 2rem",
					background: "#1a1a1a",
					borderBottom: "4px solid #333",
					alignItems: "center",
					justifyContent: "space-between",
					zIndex: 1000,
					flexShrink: 0,
					boxShadow: "inset 0 -4px 0 #000, 0 4px 20px rgba(0,0,0,0.5)",
				}}
			>
				<div style={{ display: "flex", gap: "3rem", alignItems: "center" }}>
					<div style={{ display: "flex", flexDirection: "column" }}>
						<span
							style={{
								fontSize: "0.65rem",
								color: "#666",
								fontWeight: "bold",
								textTransform: "uppercase",
							}}
						>
							Chronometer
						</span>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: "0.5rem",
								color: "#eee",
							}}
						>
							<Clock size={14} />
							<span style={{ fontSize: "1rem", fontWeight: "bold" }}>
								Day {day}
							</span>
							<span style={{ fontSize: "0.8rem", color: "#0f0" }}>
								[{formatTime(dayTimer)}]
							</span>
						</div>
					</div>

					<div style={{ display: "flex", flexDirection: "column" }}>
						<span
							style={{
								fontSize: "0.65rem",
								color: "#666",
								fontWeight: "bold",
								textTransform: "uppercase",
							}}
						>
							Available Funds
						</span>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: "0.5rem",
								color: "#ffd700",
							}}
						>
							<Coins size={18} />
							<span style={{ fontWeight: "bold", fontSize: "1.2rem" }}>
								${money.toFixed(2)}
							</span>
						</div>
					</div>

					<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
						{!isHydrated && (
							<span
								style={{
									color: "#ff4444",
									fontSize: "10px",
									fontWeight: "bold",
								}}
							>
								OFFLINE
							</span>
						)}
						{isHydrated && (
							<>
								<div
									style={{
										width: "6px",
										height: "6px",
										background: "#0f0",
										borderRadius: "50%",
									}}
								/>
								<span
									style={{
										color: "#0f0",
										fontSize: "10px",
										fontWeight: "bold",
										opacity: 0.7,
									}}
								>
									SYNC_OK
								</span>
							</>
						)}
					</div>
				</div>
				<button
					type="button"
					onClick={() => toggleOpen()}
					style={{
						padding: "10px 24px",
						fontSize: "0.9rem",
						background: isOpen ? "#600" : "#060",
						border: "4px solid #000",
						boxShadow: isOpen ? "inset 2px 2px 0 #900" : "inset 2px 2px 0 #0a0",
						color: "#fff",
						marginLeft: "auto",
						marginRight: "1rem",
					}}
				>
					{isOpen ? "CLOSE_CASINO" : `OPEN_CASINO ($500)`}
				</button>

				<ShopMenu />
			</header>

			{/* Main Game Area */}
			<main style={{ flex: 1, position: "relative", overflow: "hidden" }}>
				<CasinoFloor />
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
				<Route path="/sprites" element={<SpriteAtlas />} />
			</Routes>
		</HashRouter>
	);
}

export default App;
