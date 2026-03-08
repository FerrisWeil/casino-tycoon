import { Dices as SlotIcon, X } from "lucide-react";
import React from "react";
import { useGameStore } from "../../store/useGameStore";
import type { GameObjectType } from "../../types";
import styles from "./ShopMenu.module.css";

const ShopMenu: React.FC = () => {
	const { money, isBuilding, selectedObject, setBuildingMode } = useGameStore();

	const shopItems: {
		id: GameObjectType;
		name: string;
		cost: number;
		icon: React.ReactNode;
	}[] = [
		{
			id: "pokie-basic",
			name: "Pokie",
			cost: 50,
			icon: <SlotIcon size={20} />,
		},
	];

	if (isBuilding) {
		return (
			<div className={styles.container}>
				<span style={{ fontSize: "0.8rem", alignSelf: "center" }}>
					Placing: <b>{shopItems.find((i) => i.id === selectedObject)?.name}</b>
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
					<span className={styles.price}>${item.cost}</span>
				</button>
			))}
		</div>
	);
};

export default ShopMenu;
