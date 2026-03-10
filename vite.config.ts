import fs from "node:fs";
import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	base: "/casino-tycoon/",
	plugins: [
		react(),
		{
			name: "dev-api",
			configureServer(server) {
				// Design Notes API
				server.middlewares.use("/api/design-notes", (req, res, next) => {
					if (req.method === "POST") {
						let body = "";
						req.on("data", (chunk) => {
							body += chunk.toString();
						});
						req.on("end", () => {
							try {
								const { note, vibeId } = JSON.parse(body);
								const entry = `\n## ${new Date().toLocaleString()} [Vibe: ${vibeId}]\n${note}\n---\n`;
								fs.appendFileSync(
									path.resolve(__dirname, "design-notes.md"),
									entry,
								);
								res.end(JSON.stringify({ success: true }));
							} catch (_e) {
								res.statusCode = 500;
								res.end();
							}
						});
					} else next();
				});

				// Multi-Slot Save Game API
				server.middlewares.use("/api/save-game", (req, res, next) => {
					const url = new URL(req.url || "", `http://${req.headers.host}`);
					const slot = url.searchParams.get("slot") || "1";
					const savePath = path.resolve(__dirname, `save-slot-${slot}.json`);

					if (req.method === "GET") {
						if (!fs.existsSync(savePath) && slot === "0") {
							// Auto-generate slot 0 if missing
							const initialState = {
								money: 1000,
								reputation: 0,
								manualDeals: 0,
								casinoState: {
									width: 7,
									height: 7,
									grid: [],
									objects: [],
									guests: [],
									isOpen: false,
									day: 1,
									dayTimer: 0,
									isPaused: false,
								},
								zoom: 1.0,
								day: 1,
							};
							fs.writeFileSync(savePath, JSON.stringify(initialState, null, 2));
						}

						if (fs.existsSync(savePath)) {
							res.setHeader("Content-Type", "application/json");
							res.end(fs.readFileSync(savePath));
						} else {
							res.statusCode = 404;
							res.end(JSON.stringify({ error: "No save found" }));
						}
					} else if (req.method === "POST") {
						let body = "";
						req.on("data", (chunk) => {
							body += chunk.toString();
						});
						req.on("end", () => {
							fs.writeFileSync(savePath, body);
							res.end(JSON.stringify({ success: true }));
						});
					} else next();
				});
			},
		},
	],
});
