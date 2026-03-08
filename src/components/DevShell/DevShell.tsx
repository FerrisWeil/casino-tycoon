import { ChevronDown, ChevronUp, Database, Terminal } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useGameStore } from "../../store/useGameStore";
import styles from "./DevShell.module.css";

const DevShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const state = useGameStore();
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [command, setCommand] = useState("");
	const [logs, setLogs] = useState<string[]>([
		"HUD initialized. Type 'help' for commands.",
	]);

	const runCommand = (e: React.FormEvent) => {
		e.preventDefault();
		const trimmed = command.trim();
		if (!trimmed) return;

		setLogs((prev) => [...prev, `> ${trimmed}`]);

		try {
			const cmd = trimmed.toLowerCase();
			if (cmd === "help") {
				setLogs((prev) => [
					...prev,
					"Available commands:",
					"  help        - Show this list",
					"  clear       - Clear the console",
					"  money = X   - Set money to X",
					"  addmoney X  - Add X to current money",
					"  rep = X     - Set reputation to X",
				]);
			} else if (cmd === "clear") {
				setLogs(["Console cleared."]);
			} else if (trimmed.startsWith("money = ")) {
				const val = Number.parseInt(trimmed.split("=")[1], 10);
				state.addMoney(val - state.money);
				setLogs((prev) => [...prev, `Success: Money set to ${val}`]);
			} else if (trimmed.startsWith("addmoney ")) {
				const val = Number.parseInt(trimmed.split(" ")[1], 10);
				state.addMoney(val);
				setLogs((prev) => [...prev, `Success: Added ${val} to money`]);
			} else if (trimmed.startsWith("rep = ")) {
				const val = Number.parseInt(trimmed.split("=")[1], 10);
				// For now, we don't have a setReputation, but we can add it or just log it
				setLogs((prev) => [
					...prev,
					`Info: Rep setting coming soon (Target: ${val})`,
				]);
			} else {
				setLogs((prev) => [...prev, `Unknown command: ${trimmed}`]);
			}
		} catch (err) {
			setLogs((prev) => [...prev, `Error: ${err}`]);
		}
		setCommand("");
	};

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
										state,
										(_k, v) => (typeof v === "function" ? "[Action]" : v),
										2,
									)}
								</pre>
							</div>
						</section>

						<section className={styles.section}>
							<div className={styles.sectionTitle}>
								<Terminal size={12} /> Console
							</div>
							<div className={styles.content}>
								<div className={styles.console}>
									<div className={styles.logList}>
										{logs.map((log, i) => (
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
