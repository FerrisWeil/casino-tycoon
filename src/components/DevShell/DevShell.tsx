import React, { useState } from "react";
import styles from "./DevShell.module.css";
import { Terminal, Database, ChevronUp, ChevronDown } from "lucide-react";
import { useGameStore } from "../../store/useGameStore";

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
					"  reset       - RESET ALL PROGRESS",
					"  money = X   - Set money to X",
					"  addmoney X  - Add X to current money",
				]);
			} else if (cmd === "clear") {
				setLocalLogs(["Console cleared."]);
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

	// Combine local command logs with global simulation logs
	const allLogs = [...localLogs, ...state._logs];

	return (
		<>
			<div style={{ paddingBottom: isCollapsed ? "30px" : "300px" }}>
				{children}
			</div>
			<div className={styles.wrapper}>
				<div className={`${styles.hud} ${isCollapsed ? styles.collapsed : ""}`}>
					<div className={styles.header}>
						<span>Developer HUD</span>
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
						<section className={styles.section}>
							<div className={styles.sectionTitle}>
								<Database size={12} /> Live State
							</div>
							<div className={styles.content}>
								<pre className={styles.json}>
									{JSON.stringify(
										{
											money: state.money,
											isBuilding: state.isBuilding,
											selectedObject: state.selectedObject,
											objects: state.casinoState.objects.length,
										},
										null,
										2,
									)}
								</pre>
							</div>
						</section>

						<section className={styles.section}>
							<div className={styles.sectionTitle}>
								<Terminal size={12} /> Console & Logs
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
