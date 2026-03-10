# Casino Tycoon Design Decisions

## Visual Language (16-Bit Handheld RPG)
*   **Perspective:** Top-Down Oblique (Pokémon Platinum style).
*   **Scale:** 1 Tile = 16 "Bit" Pixels = 1.0 Meter.
*   **Grid:** 7x7 playable area.
*   **Walls:** Only the "Top-Back" wall is visible. No side walls.
*   **Lighting:** Sun is locked to the horizontal center. Shadows are simple geometric "footprints" (Rect/Circle) that translate vertically based on Sun Y-position.

## [STRICT] UI & Tile Constraints
*   **Tile Appearance:** Static Dark Grey Slate (`#1e1e1e`). 
*   **NO Elevation:** No inset shadows, bevels, or 3D effects on floor tiles.
*   **NO Interaction Artifacts:** No "active" scaling, no "focus" rings, and no "click flash" on empty tiles. 
*   **Interaction Isolation:** Only Pokies and Guests are interactable. Empty tiles and Scenery (Pillars) must use `div`.
*   **Build Mode:** Ghost previews must be transparent overlays. 
*   **Object Footprints:** ALL objects (Pokies, Pillars, Chairs) occupy a **1x1 Tile (16x16px)** base.

## Gameplay Systems
*   **Manager Control:** WASD keys move a purple-shirted manager.
*   **Collisions:** Manager and Guests cannot walk through objects or off-grid.
*   **Y-Sorting:** All entities (Guests, Objects, Manager) render based on their Y-coordinate to allow "walking behind" effects.

## Persistence
*   **File-Based:** All state saved to `save-slot-X.json` via Vite bridge.
*   **Reset:** Use `reset` command in HUD to clear coordinates and re-initialize layout.
