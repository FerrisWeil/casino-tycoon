import { Play, Square, X } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useGameStore } from "../../store/useGameStore";
import styles from "./PokieDialog.module.css";

const PokieDialog: React.FC = () => {
	const {
		casinoState,
		selectedObjectId,
		selectObject,
		togglePokie,
		updatePokieSettings,
	} = useGameStore();
	const [activeTab, setActiveTab] = useState<"settings" | "stats">("settings");
	const [viewWindow, setViewWindow] = useState<10 | 50 | 100>(100);

	const pokie = casinoState.objects.find((o) => o.id === selectedObjectId);
	if (!pokie) return null;

	// Total RTP is now independent of wager in the calculation
	const totalRtp =
		pokie.settings.grand.size * pokie.settings.grand.chance +
		pokie.settings.major.size * pokie.settings.major.chance +
		pokie.settings.minor.size * pokie.settings.minor.chance +
		pokie.settings.mini.size * pokie.settings.mini.chance +
		pokie.settings.additionalRtp;

	const historySlice = pokie.stats.history.slice(-viewWindow);
	const windowPaid = historySlice.reduce(
		(a, b) =>
			a + (typeof b === "object" ? b.payout : typeof b === "number" ? b : 0),
		0,
	);
	const windowWagered = historySlice.reduce(
		(a, b) => a + (typeof b === "object" ? b.wager : 1),
		0,
	);
	const windowRtp = windowWagered > 0 ? windowPaid / windowWagered : 0;

	return (
		<div className={styles.overlay}>
			<div className={styles.dialog}>
				<div className={styles.header}>
					<h3>
						Pokie Management{" "}
						<span style={{ opacity: 0.3, fontSize: "0.7rem" }}>
							#{pokie.id}
						</span>
					</h3>
					<button type="button" onClick={() => selectObject(null)}>
						<X size={18} />
					</button>
				</div>

				<div className={styles.tabs}>
					<button
						type="button"
						className={`${styles.tab} ${activeTab === "settings" ? styles.active : ""}`}
						onClick={() => setActiveTab("settings")}
					>
						Settings
					</button>
					<button
						type="button"
						className={`${styles.tab} ${activeTab === "stats" ? styles.active : ""}`}
						onClick={() => setActiveTab("stats")}
					>
						Live Stats
					</button>
				</div>

				<div className={styles.content}>
					{activeTab === "settings" && (
						<div style={{ opacity: pokie.isRunning ? 0.7 : 1 }}>
							<div
								style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}
							>
								<button
									type="button"
									onClick={() => togglePokie(pokie.id)}
									style={{
										background: pokie.isRunning ? "#442222" : "#224422",
										flex: 1,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										gap: "0.5rem",
									}}
								>
									{pokie.isRunning ? (
										<>
											<Square size={14} /> Stop Machine
										</>
									) : (
										<>
											<Play size={14} /> Start Machine
										</>
									)}
								</button>
							</div>

							<h4>
								Payout Configuration{" "}
								{pokie.isRunning && (
									<span style={{ color: "#ff4444", fontSize: "0.6rem" }}>
										(STOP MACHINE TO EDIT)
									</span>
								)}
							</h4>
							<p
								style={{
									fontSize: "0.7rem",
									opacity: 0.5,
									marginBottom: "1rem",
								}}
							>
								Total Expected RTP: {(totalRtp * 100).toFixed(2)}%
							</p>

							<div className={styles.formGroup}>
								<label htmlFor="bet-range">Bet Amount ($)</label>
								<input
									id="bet-range"
									type="range"
									min="0.25"
									max="10"
									step="0.25"
									value={pokie.settings.wager}
									disabled={pokie.isRunning}
									onChange={(e) =>
										updatePokieSettings(pokie.id, {
											wager: Number(e.target.value),
										})
									}
								/>
								<input
									type="number"
									value={pokie.settings.wager}
									disabled={pokie.isRunning}
									onChange={(e) =>
										updatePokieSettings(pokie.id, {
											wager: Number(e.target.value),
										})
									}
								/>
							</div>

							<div className={styles.formGroup}>
								<label htmlFor="grand-size">Grand Jackpot (x)</label>
								<input
									id="grand-size"
									type="number"
									value={pokie.settings.grand.size}
									disabled={pokie.isRunning}
									onChange={(e) =>
										updatePokieSettings(pokie.id, {
											grand: {
												...pokie.settings.grand,
												size: Number(e.target.value),
											},
										})
									}
								/>
								<input
									type="number"
									step="0.00001"
									value={pokie.settings.grand.chance}
									disabled={pokie.isRunning}
									onChange={(e) =>
										updatePokieSettings(pokie.id, {
											grand: {
												...pokie.settings.grand,
												chance: Number(e.target.value),
											},
										})
									}
								/>
							</div>
							<div className={styles.formGroup}>
								<label htmlFor="major-size">Major Jackpot (x)</label>
								<input
									id="major-size"
									type="number"
									value={pokie.settings.major.size}
									disabled={pokie.isRunning}
									onChange={(e) =>
										updatePokieSettings(pokie.id, {
											major: {
												...pokie.settings.major,
												size: Number(e.target.value),
											},
										})
									}
								/>
								<input
									type="number"
									step="0.0001"
									value={pokie.settings.major.chance}
									disabled={pokie.isRunning}
									onChange={(e) =>
										updatePokieSettings(pokie.id, {
											major: {
												...pokie.settings.major,
												chance: Number(e.target.value),
											},
										})
									}
								/>
							</div>
							<div className={styles.formGroup}>
								<label htmlFor="additional-rtp">Additional RTP</label>
								<input
									id="additional-rtp"
									type="number"
									step="0.01"
									style={{ gridColumn: "span 2" }}
									value={pokie.settings.additionalRtp}
									disabled={pokie.isRunning}
									onChange={(e) =>
										updatePokieSettings(pokie.id, {
											additionalRtp: Number(e.target.value),
										})
									}
								/>
							</div>
							<div className={styles.formGroup}>
								<label htmlFor="poke-speed">Poke Speed (sec)</label>
								<input
									id="poke-speed"
									type="number"
									step="0.1"
									style={{ gridColumn: "span 2" }}
									value={pokie.settings.pokeInterval}
									disabled={pokie.isRunning}
									onChange={(e) =>
										updatePokieSettings(pokie.id, {
											pokeInterval: Number(e.target.value),
										})
									}
								/>
							</div>
						</div>
					)}

					{activeTab === "stats" && (
						<div>
							<div
								style={{
									display: "flex",
									justifyContent: "flex-end",
									gap: "5px",
									marginBottom: "1rem",
								}}
							>
								<span
									style={{
										fontSize: "0.7rem",
										alignSelf: "center",
										marginRight: "5px",
										opacity: 0.5,
									}}
								>
									Window:
								</span>
								{([10, 50, 100] as const).map((val) => (
									<button
										key={val}
										type="button"
										onClick={() => setViewWindow(val)}
										style={{
											padding: "2px 8px",
											fontSize: "0.6rem",
											background: viewWindow === val ? "#646cff" : "#222",
											borderColor: viewWindow === val ? "#fff" : "#444",
										}}
									>
										{val}
									</button>
								))}
							</div>

							<div className={styles.statsGrid}>
								<div className={styles.statCard}>
									<div className={styles.statLabel}>
										Rolling RTP ({viewWindow})
									</div>
									<div
										className={styles.statVal}
										style={{
											color: windowRtp > 1 ? "#ff4444" : "#00ff00",
										}}
									>
										{(windowRtp * 100).toFixed(1)}%
									</div>
								</div>
								<div className={styles.statCard}>
									<div className={styles.statLabel}>Total Pokes</div>
									<div className={styles.statVal}>{pokie.stats.pokesCount}</div>
								</div>
							</div>

							<h4>Payout History (Last {viewWindow})</h4>
							<div className={styles.graphWrapper}>
								<div className={styles.yAxis}>
									<span>$50+</span>
									<span>$10</span>
									<span>$1</span>
									<span>$0</span>
								</div>
								<div className={styles.graphContainer}>
									{historySlice.map((result, i) => {
										const payout =
											typeof result === "object"
												? (result?.payout ?? 0)
												: typeof result === "number"
													? result
													: 0;
										const wager =
											typeof result === "object" ? (result?.wager ?? 1) : 1;

										return (
											<div
												key={i}
												className={styles.bar}
												style={{
													height: `${Math.max(2, Math.min(100, (payout / wager) * 10))}%`,
													background: payout > wager ? "#ffd700" : "#00ff00",
													opacity: 0.5 + (payout > 0 ? 0.5 : 0),
												}}
											>
												<div className={styles.tooltip}>
													Win: ${payout.toFixed(2)}
													<br />
													Bet: ${wager.toFixed(2)}
												</div>
											</div>
										);
									})}
								</div>
							</div>
							<div
								style={{ marginTop: "1rem", fontSize: "0.7rem", color: "#666" }}
							>
								Last Win: $
								{pokie.stats.history[
									pokie.stats.history.length - 1
								]?.payout?.toFixed(2) || "0.00"}{" "}
								(on $
								{pokie.stats.history[
									pokie.stats.history.length - 1
								]?.wager?.toFixed(2) || "0.00"}{" "}
								bet)
							</div>
						</div>
					)}
				</div>

				<div className={styles.footer}>
					<button type="button" onClick={() => selectObject(null)}>
						Close
					</button>
				</div>
			</div>
		</div>
	);
};

export default PokieDialog;
