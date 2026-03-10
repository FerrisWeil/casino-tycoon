import {
	ChevronDown,
	ChevronUp,
	Maximize2,
	Minimize2,
	Search,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import styles from "./SpriteAtlas.module.css";
import { ChairSprite, GuestSprite, PokieSprite } from "./Sprites";

interface SpriteEntry {
	id: string;
	name: string;
	category: "Objects" | "Guests" | "UI";
	description: string;
	variants: { label: string; render: (size: number) => React.ReactNode }[];
	scale: string;
}

const SpriteAtlas: React.FC = () => {
	const [searchTerm, setSearchBar] = useState("");
	const [expandedItems, setExpandedItems] = useState<Set<string>>(
		new Set(["pokie"]),
	);

	const sprites: SpriteEntry[] = [
		{
			id: "pokie",
			name: "16-Bit Pokie Machine",
			category: "Objects",
			scale: "1.0m x 1.0m (32x32px fidelity)",
			description: "Standard cabinet with glowing marquee and buttons.",
			variants: [
				{
					label: "Idle",
					render: (s) => <PokieSprite size={s} isRunning={false} />,
				},
				{
					label: "Running (Animated)",
					render: (s) => <PokieSprite size={s} isRunning={true} />,
				},
			],
		},
		{
			id: "chair",
			name: "16-Bit Plush Armchair",
			category: "Objects",
			scale: "1.0m x 1.0m (32x32px fidelity)",
			description: "Velvet texture with deep shading.",
			variants: [{ label: "Default", render: (s) => <ChairSprite size={s} /> }],
		},
		{
			id: "guest",
			name: "16-Bit Guest",
			category: "Guests",
			scale: "0.5m x 0.8m (16x32px fidelity)",
			description: "Detailed visitor sprite with hair and shading.",
			variants: [
				{
					label: "Blue Visitor",
					render: (s) => <GuestSprite size={s} color="#44aaff" />,
				},
				{
					label: "Red Visitor",
					render: (s) => <GuestSprite size={s} color="#ff4444" />,
				},
			],
		},
	];

	const toggleItem = (id: string) => {
		const next = new Set(expandedItems);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		setExpandedItems(next);
	};

	const expandAll = () => setExpandedItems(new Set(sprites.map((s) => s.id)));
	const collapseAll = () => setExpandedItems(new Set());

	const filtered = sprites.filter(
		(s) =>
			s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			s.category.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	return (
		<div className={styles.container}>
			<header className={styles.header}>
				<div className={styles.titleGroup}>
					<h1>👾 16-Bit Sprite Atlas</h1>
					<p>32x32 Fidelity Scale Guide</p>
				</div>

				<div className={styles.controls}>
					<div className={styles.searchBar}>
						<Search size={16} />
						<input
							placeholder="Search..."
							value={searchTerm}
							onChange={(e) => setSearchBar(e.target.value)}
						/>
					</div>
					<button
						type="button"
						onClick={expandAll}
						className={styles.actionBtn}
					>
						<Maximize2 size={14} /> Expand All
					</button>
					<button
						type="button"
						onClick={collapseAll}
						className={styles.actionBtn}
					>
						<Minimize2 size={14} /> Collapse All
					</button>
				</div>
			</header>

			<main className={styles.list}>
				{filtered.map((sprite) => (
					<section key={sprite.id} className={styles.entry}>
						<header
							className={styles.entryHeader}
							onClick={() => toggleItem(sprite.id)}
						>
							{expandedItems.has(sprite.id) ? <ChevronUp /> : <ChevronDown />}
							<span className={styles.categoryBadge}>{sprite.category}</span>
							<span className={styles.entryTitle}>{sprite.name}</span>
							<span className={styles.scaleInfo}>{sprite.scale}</span>
						</header>

						{expandedItems.has(sprite.id) && (
							<div className={styles.entryContent}>
								<p className={styles.description}>{sprite.description}</p>
								<div className={styles.variantGrid}>
									{sprite.variants.map((v, i) => (
										<div key={i} className={styles.variantCard}>
											<div className={styles.checkerboard}>
												<div className={styles.spriteWrapper}>
													{v.render(64)}
												</div>
											</div>
											<span className={styles.variantLabel}>{v.label}</span>
										</div>
									))}
								</div>
							</div>
						)}
					</section>
				))}
			</main>
		</div>
	);
};

export default SpriteAtlas;
