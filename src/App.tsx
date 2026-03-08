import { useState } from "react";
import { Coins, UserSquare, FlaskConical, Play } from "lucide-react";
import { useGameStore } from "./store/useGameStore";
import DesignLab from "./components/DesignLab/DesignLab";

function App() {
	const { money, reputation, manualDeals, manualDeal } = useGameStore();
	const [showDesignLab, setShowDesignLab] = useState(false);

	if (showDesignLab) {
		return (
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					gap: "1rem",
				}}
			>
				<button onClick={() => setShowDesignLab(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
					<Play size={16} /> Back to Game
				</button>
				<DesignLab />
			</div>
		);
	}

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				gap: "2rem",
				alignItems: "center",
			}}
		>
			<div
				style={{
					width: "100%",
					display: "flex",
					justifyContent: "flex-end",
					padding: "1rem",
				}}
			>
				<button
					onClick={() => setShowDesignLab(true)}
					style={{
						display: "flex",
						alignItems: "center",
						gap: "0.5rem",
						background: "#333",
					}}
				>
					<FlaskConical size={16} /> Design Lab
				</button>
			</div>

			<h1>🎰 Casino Tycoon</h1>

			<div
				style={{
					display: "flex",
					gap: "2rem",
					padding: "1rem",
					border: "2px solid #333",
					borderRadius: "8px",
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
					<Coins size={24} color="#ffd700" />
					<span>Cash: ${money}</span>
				</div>
				<div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
					<UserSquare size={24} color="#00ff00" />
					<span>Reputation: {reputation}</span>
				</div>
			</div>

			<div
				style={{
					display: "flex",
					flexDirection: "column",
					gap: "1rem",
					width: "100%",
					maxWidth: "400px",
				}}
			>
				<h2>Floor Operations</h2>
				<button type="button" onClick={() => manualDeal()}>
					Manual Deal (+$5)
				</button>
				<p style={{ opacity: 0.6 }}>Deals completed: {manualDeals}</p>
			</div>

			<div style={{ marginTop: "2rem", fontSize: "0.8rem", opacity: 0.4 }}>
				Phase 1: Bootstrap & Manual Deal
			</div>
		</div>
	);
}

export default App;
