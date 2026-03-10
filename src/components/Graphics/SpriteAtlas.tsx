import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  LayoutGrid, 
  Sun,
  Lightbulb,
  LightbulbOff
} from "lucide-react";
import React, { useState } from "react";
import styles from "./SpriteAtlas.module.css";
import { 
  PokieSprite, 
  ChairSprite, 
  GuestSprite, 
  BackWallSprite, 
  WelcomeMatSprite,
  PillarSprite 
} from "./Sprites";
import DynamicShadow from "./DynamicShadow";

interface SpriteEntry {
	id: string;
	name: string;
	category: "Object" | "NPC" | "Environment";
	description: string;
  shape: 'rect' | 'circle';
  height: number;
	variants: React.ReactNode[];
}

const SpriteAtlas: React.FC = () => {
	const [search, setSearch] = useState("");
	const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(["pokie"]));
  const [sunY, setSunY] = useState(25);
  const [isLightingEnabled, setIsLightingEnabled] = useState(true);

	const sprites: SpriteEntry[] = [
		{
			id: "pokie",
			name: "Pokie Machine",
			category: "Object",
      shape: 'rect',
      height: 32,
			description: "4-directional 16-bit slot cabinet with animated reels and marquee.",
			variants: [
				<PokieSprite key="f" size={64} rotation={0} isRunning />,
				<PokieSprite key="l" size={64} rotation={90} />,
				<PokieSprite key="b" size={64} rotation={180} />,
				<PokieSprite key="r" size={64} rotation={270} />,
			],
		},
		{
			id: "chair",
			name: "Velvet Armchair",
			category: "Object",
      shape: 'rect',
      height: 16,
			description: "Classic plush casino seating with floor shadow.",
			variants: [<ChairSprite key="c" size={64} />],
		},
		{
			id: "guest",
			name: "Casino Guest",
			category: "NPC",
      shape: 'circle',
      height: 24,
			description: "Chibi-style character with walking bob animation and dark outline.",
			variants: [
				<GuestSprite key="g1" size={48} color="#44aaff" isRunning />,
				<GuestSprite key="g2" size={48} color="#ff4444" isRunning />,
			],
		},
    {
			id: "pillar",
			name: "Stone Pillar",
			category: "Environment",
      shape: 'rect',
      height: 48,
			description: "Heavy vertical decorative pillar for demonstrating shadow depth.",
			variants: [<PillarSprite key="p" size={64} />],
		},
	];

	const toggleItem = (id: string) => {
		const next = new Set(expandedItems);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		setExpandedItems(next);
	};

	const filtered = sprites.filter(
		(s) =>
			s.name.toLowerCase().includes(search.toLowerCase()) ||
			s.category.toLowerCase().includes(search.toLowerCase()),
	);

	return (
		<div className={styles.container}>
			<header className={styles.header}>
				<div className={styles.titleArea}>
					<LayoutGrid className={styles.titleIcon} />
					<div>
						<h1>SPRITE_ATLAS_V2</h1>
						<p>Asset Registry & Simplified Lighting Lab</p>
					</div>
				</div>

				<div className={styles.controls}>
          <div className={styles.lightingLab}>
            <div className={styles.labToggle} onClick={() => setIsLightingEnabled(!isLightingEnabled)}>
              {isLightingEnabled ? <Lightbulb color="#ffd700" /> : <LightbulbOff />}
              <span>LIGHTING_LAB</span>
            </div>
            <div className={styles.sliderContainer}>
              <Sun size={14} />
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={sunY} 
                onChange={(e) => setSunY(Number(e.target.value))}
                className={styles.slider}
              />
            </div>
          </div>

					<div className={styles.searchBox}>
						<Search size={18} />
						<input
							type="text"
							placeholder="Search assets..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>
				</div>
			</header>

			<main className={styles.grid}>
				{filtered.map((sprite) => (
					<section key={sprite.id} className={styles.entry}>
						<header
							className={styles.entryHeader}
							onClick={() => toggleItem(sprite.id)}
						>
							{expandedItems.has(sprite.id) ? <ChevronUp /> : <ChevronDown />}
							<span className={styles.categoryBadge}>{sprite.category}</span>
							<h3>{sprite.name}</h3>
						</header>

						{expandedItems.has(sprite.id) && (
							<div className={styles.entryContent}>
								<p className={styles.description}>{sprite.description}</p>
								<div className={styles.variantGrid}>
									{sprite.variants.map((v, i) => (
										<div key={i} className={styles.variantCard}>
											<div className={styles.checkerboard}>
												<div className={styles.spriteWrapper}>
                          {isLightingEnabled ? (
                            <DynamicShadow sunPos={{ x: 50, y: sunY }} shape={sprite.shape} height={sprite.height}>
                              {v as React.ReactElement}
                            </DynamicShadow>
                          ) : v}
												</div>
											</div>
											<div className={styles.variantLabel}>
												{sprite.variants.length > 1 ? `VAR_${i + 1}` : "DEFAULT"}
											</div>
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
