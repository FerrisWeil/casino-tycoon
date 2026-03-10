import {
	ChevronDown,
	ChevronUp,
	Database,
	Download,
	Pause,
	Play,
	Save,
	Terminal,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useGameStore } from "../../store/useGameStore";
import styles from "./DevShell.module.css";

const DevShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const state = useGameStore();
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [command, setCommand] = useState("");
	const [localLogs, setLocalLogs] = useState<string[]>(["HUD Ready."]);

	const runCommand = (e: React.FormEvent) => {
		e.preventDefault();
		const trimmed = command.trim();
		if (!trimmed) return;

		setLocalLogs((prev) => [...prev, `> ${trimmed}`]);

		try {
			const cmd = trimmed.toLowerCase();
			if (cmd === "help") {
				setLocalLogs((prev) => [
					...prev,
					"Available commands:",
					"  help        - Show this list",
					"  clear       - Clear the console",
					"  reset       - RESET TO SLOT 0",
          "  sun         - Toggle draggable sun icon",
					"  money = X   - Set money to X",
					"  addmoney X  - Add X to current money",
				]);
			} else if (cmd === "clear") {
				setLocalLogs(["Console cleared."]);
			} else if (cmd === "sun") {
        state.toggleSun();
        setLocalLogs((prev) => [...prev, `Sun visible: ${!state.showSun}`]);
			} else if (cmd === "reset") {
				state.resetGame();
			} else if (trimmed.startsWith("money = ")) {
				const val = Number.parseInt(trimmed.split("=")[1], 10);
				state.addMoney(val - state.money);
				setLocalLogs((prev) => [...prev, `Success: Money set to ${val}`]);
			} else if (trimmed.startsWith("addmoney ")) {
				const val = Number.parseInt(trimmed.split(" ")[1], 10);
				state.addMoney(val);
				setLocalLogs((prev) => [...prev, `Success: Added ${val} to money`]);
			} else {
				setLocalLogs((prev) => [...prev, `Unknown command: ${trimmed}`]);
			}
		} catch (err) {
			setLocalLogs((prev) => [...prev, `Error: ${err}`]);
		}
		setCommand("");
	};

	const allLogs = [...localLogs, ...state._logs];

	return (
		<>
			<div style={{ paddingBottom: isCollapsed ? "30px" : "300px" }}>
				{children}
			</div>
			<div className={styles.wrapper}>
				<div className={`${styles.hud} ${isCollapsed ? styles.collapsed : ""}`}>
					<div className={styles.header}>
						<span>Developer HUD - Slot {state.currentSlot}</span>
						<button
							type="button"
							onClick={() => state.togglePause()}
							style={{
								marginLeft: "20px",
								background: state.isPaused ? "#442222" : "#222",
								padding: "2px 10px",
								fontSize: "10px",
							}}
						>
							{state.isPaused ? (
								<>
									<Play size={10} /> RESUME
								</>
							) : (
								<>
									<Pause size={10} /> PAUSE
								</>
							)}
						</button>
						<button
							type="button"
							onClick={() => setIsCollapsed(!isCollapsed)}
							className={styles.toggle}
						>
							{isCollapsed ? (
								<ChevronUp size={14} />
							) : (
								<ChevronDown size={14} />
							)}
						</button>
					</div>

					<div className={styles.main}>
						<section className={styles.section} style={{ flex: "0 0 250px" }}>
							<div className={styles.sectionTitle}>
								<Save size={12} /> Save Slots
							</div>
							<div className={styles.slotGrid}>
								<div className={styles.slotRow}>
									<button
										type="button"
										className={state.currentSlot === 0 ? styles.slotActive : ""}
										onClick={() => state.loadGame(0)}
									>
										Slot 0 (Clean)
									</button>
								</div>
								{[1, 2, 3, 4, 5].map((slot) => (
									<div key={slot} className={styles.slotRow}>
										<span style={{ fontSize: "10px" }}>Slot {slot}</span>
										<button
											type="button"
											onClick={() => state.loadGame(slot)}
											title="Load"
										>
											<Download size={12} />
										</button>
										<button
											type="button"
											onClick={() => state.saveGame(slot)}
											title="Save"
										>
											<Save size={12} />
										</button>
									</div>
								))}
							</div>
						</section>

						<section className={styles.section}>
							<div className={styles.sectionTitle}>
								<Database size={12} /> State
							</div>
							<div className={styles.content}>
								<pre className={styles.json}>
									{JSON.stringify(
										{
											money: state.money,
											objects: state.casinoState?.objects?.length || 0,
											guests: state.casinoState?.guests?.length || 0,
											isOpen: state.isOpen,
											isPaused: state.isPaused,
										},
										null,
										2,
									)}
								</pre>
							</div>
						</section>

						<section className={styles.section} style={{ flex: "2" }}>
							<div className={styles.sectionTitle}>
								<Terminal size={12} /> Console
							</div>
							<div className={styles.content}>
								<div className={styles.console}>
									<div className={styles.logList}>
										{allLogs.map((log, i) => (
											<div key={i}>{log}</div>
										))}
									</div>
									<form onSubmit={runCommand} className={styles.inputArea}>
										<span>&gt;</span>
										<input
											value={command}
											onChange={(e) => setCommand(e.target.value)}
											placeholder="Type 'help'..."
										/>
									</form>
								</div>
							</div>
						</section>
					</div>
				</div>
			</div>
		</>
	);
};

export default DevShell;
