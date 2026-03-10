import React from "react";
import { useGameStore } from "../../store/useGameStore";
import styles from "./EndOfDayDialog.module.css";

const EndOfDayDialog: React.FC = () => {
	const { day, dailySpend, dailyEarnings, isOpen } = useGameStore();
	const [show, setShow] = React.useState(false);

	// Detect when casino closes
	React.useEffect(() => {
		if (!isOpen && day > 1) {
			setShow(true);
		}
	}, [isOpen, day]);

	if (!show) return null;

	const profit = dailyEarnings - dailySpend;

	return (
		<div className={styles.overlay}>
			<div className={styles.dialog}>
				<h2>Day {day - 1} Summary</h2>

				<div className={styles.stats}>
					<div className={styles.row}>
						<span>Expenses</span>
						<span style={{ color: "#ff4444" }}>-${dailySpend.toFixed(2)}</span>
					</div>
					<div className={styles.row}>
						<span>Earnings</span>
						<span style={{ color: "#44ff44" }}>
							+${dailyEarnings.toFixed(2)}
						</span>
					</div>
					<div className={`${styles.row} ${styles.profit}`}>
						<span>Net Profit</span>
						<span style={{ color: profit >= 0 ? "#44ff44" : "#ff4444" }}>
							${profit.toFixed(2)}
						</span>
					</div>
				</div>

				<button
					type="button"
					className={styles.btn}
					onClick={() => setShow(false)}
				>
					Start Next Day
				</button>
			</div>
		</div>
	);
};

export default EndOfDayDialog;
