import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Coins, UserSquare, Hand } from "lucide-react";
import { useGameStore } from "./store/useGameStore";
import DesignLab from "./components/DesignLab/DesignLab";
import DevShell from "./components/DevShell/DevShell";
import CasinoFloor from "./components/CasinoFloor/CasinoFloor";

function GameView() {
	const { money, reputation, manualDeal } = useGameStore();
	const location = useLocation();
	const [isDevMode, setIsDevMode] = useState(false);

	useEffect(() => {
		const params = new URLSearchParams(location.search);
		if (params.get("dev") === "true") {
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
					<span style={{ fontWeight: "bold" }}>${money}</span>
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
		</div>
	);

	if (isDevMode) {
		return <DevShell>{content}</DevShell>;
	}

	return content;
}

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<GameView />} />
				<Route path="/design-lab" element={<DesignLab />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
