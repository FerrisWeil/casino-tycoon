import { ChevronDown, Dices as SlotIcon, X, Box } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useGameStore } from "../../store/useGameStore";
import type { GameObjectType } from "../../types";
import styles from "./ShopMenu.module.css";

const ShopMenu: React.FC = () => {
	const { money, isBuilding, selectedObject, setBuildingMode, casinoState } =
		useGameStore();
	const [isOpen, setIsOpen] = useState(false);
	const [activeCategory, setActiveCategory] = useState<
		"GAMES" | "DECOR" | "STAFF"
	>("GAMES");

	const numObjects = casinoState.objects.length;
	const currentPrice = numObjects === 0 ? 0 : 1000;

	const gameItems: {
		id: GameObjectType;
		name: string;
		cost: number;
		icon: React.ReactNode;
	}[] = [
		{
			id: "pokie-basic",
			name: "Pokie",
			cost: currentPrice,
			icon: <SlotIcon size={20} />,
		},
    {
      id: "pillar",
      name: "Stone Pillar",
      cost: 0,
      icon: <Box size={20} />, // Changed icon to Box for pillar
    }
	];

	const handleSelectItem = (id: GameObjectType) => {
		setBuildingMode(true, id);
		setIsOpen(false);
	};

	if (isBuilding) {
		return (
			<div className={styles.buildOverlay}>
				<span style={{ fontSize: "0.8rem", alignSelf: "center" }}>
					Placing: <b>{gameItems.find((i) => i.id === selectedObject)?.name}</b>{" "}
					(Press R to Rotate)
				</span>
				<button
					type="button"
					className={styles.cancelBtn}
					onClick={() => setBuildingMode(false)}
				>
					<X size={14} /> Cancel
				</button>
			</div>
		);
	}

	return (
		<div className={styles.shopWrapper}>
			{/* The Toggle Button - Placed in the Header via Portal or simple absolute */}
			<button
				type="button"
				className={`${styles.shopToggle} ${isOpen ? styles.activeToggle : ""}`}
				onClick={() => setIsOpen(!isOpen)}
			>
				CASINO_SHOP {isOpen ? <X size={14} /> : <ChevronDown size={14} />}
			</button>

			{/* The Drawer */}
			<div className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ""}`}>
				<nav className={styles.categoryNav}>
					{(["GAMES", "DECOR", "STAFF"] as const).map((cat) => (
						<button
							key={cat}
							type="button"
							className={`${styles.navTab} ${activeCategory === cat ? styles.navActive : ""}`}
							onClick={() => setActiveCategory(cat)}
							disabled={cat !== "GAMES"}
						>
							{cat}
						</button>
					))}
				</nav>

				<div className={styles.content}>
					{activeCategory === "GAMES" && (
						<div className={styles.itemGrid}>
							{gameItems.map((item) => (
								<button
									key={item.id}
									type="button"
									className={styles.shopItem}
									disabled={money < item.cost}
									onClick={() => handleSelectItem(item.id)}
								>
									<div className={styles.iconBox}>{item.icon}</div>
									<div className={styles.itemInfo}>
										<span className={styles.itemName}>{item.name}</span>
										<span className={styles.itemPrice}>
											{item.cost === 0 ? "FREE" : `$${item.cost}`}
										</span>
									</div>
								</button>
							))}
						</div>
					)}
					{activeCategory !== "GAMES" && (
						<div className={styles.emptyState}>Coming soon...</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default ShopMenu;
