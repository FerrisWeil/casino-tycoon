import { Dices as SlotIcon, X } from "lucide-react";
import type React from "react";
import { useGameStore } from "../../store/useGameStore";
import type { GameObjectType } from "../../types";
import styles from "./ShopMenu.module.css";

const ShopMenu: React.FC = () => {
	const { money, isBuilding, selectedObject, setBuildingMode, casinoState } =
		useGameStore();

	const numObjects = casinoState.objects.length;
	const currentPrice = numObjects === 0 ? 0 : 1000;

	const shopItems: {
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
	];

	if (isBuilding) {
		return (
			<div className={styles.container}>
				<span style={{ fontSize: "0.8rem", alignSelf: "center" }}>
					Placing: <b>{shopItems.find((i) => i.id === selectedObject)?.name}</b>{" "}
					(Press R to Rotate)
				</span>
				<button
					type="button"
					className={styles.cancel}
					onClick={() => setBuildingMode(false)}
				>
					<X size={14} /> Cancel
				</button>
			</div>
		);
	}

	return (
		<div className={styles.container}>
			{shopItems.map((item) => (
				<button
					key={item.id}
					type="button"
					className={styles.shopItem}
					disabled={money < item.cost}
					onClick={() => setBuildingMode(true, item.id)}
					style={{ opacity: money < item.cost ? 0.5 : 1 }}
				>
					{item.icon}
					<span style={{ fontSize: "0.7rem" }}>{item.name}</span>
					<span className={styles.price}>
						{item.cost === 0 ? "FREE" : `$${item.cost}`}
					</span>
				</button>
			))}
		</div>
	);
};

export default ShopMenu;
