# Casino Tycoon Architecture

## Core Mandates
- **State Management:** Zustand with Immer for complex simulation state.
- **Simulation Engine:** Pure TypeScript classes in `src/simulation`, independent of React.
- **Rendering:** CSS Grid + DOM for the floor view (Rimworld-style top-down).
- **Linter/Formatter:** Biome (Rust-based, ultra-fast).
- **Performance:** Designed to be moved to a Web Worker if simulation complexity scales.
- **Graphics:** "Bit" aesthetic using CSS `image-rendering: pixelated`.

## Simulation Structure
- `Simulation`: The main orchestrator of the game loop.
- `Entity`: Base class for Customers and Employees.
- `Casino`: Manages the grid, objects, and economy.

## Roadmap
1. [ ] Manual Dealing Mechanic (Click to earn)
2. [ ] Basic Grid & Slot Machine Placement
3. [ ] NPC Arrival & Simple AI (Gamble -> Leave)
4. [ ] Staff Hiring (Dealers)
5. [ ] Web Worker Migration (Performance Phase)
