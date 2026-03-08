import fs from "node:fs";
import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
	base: "/casino-tycoon/",
	plugins: [
		react(),
		{
			name: "design-notes-api",
			configureServer(server) {
				server.middlewares.use("/api/design-notes", (req, res, next) => {
					if (req.method === "POST") {
						let body = "";
						req.on("data", (chunk) => {
							body += chunk.toString();
						});
						req.on("end", () => {
							try {
								const data = JSON.parse(body);
								const { note, vibeId } = data;
								const timestamp = new Date().toLocaleString();
								const logEntry = `\n## ${timestamp} [Vibe: ${vibeId}]\n${note}\n---\n`;

								const notesPath = path.resolve(__dirname, "design-notes.md");
								fs.appendFileSync(notesPath, logEntry);
								console.log(
									`[DesignLab API] Successfully saved note for vibe: ${vibeId}`,
								);

								res.setHeader("Content-Type", "application/json");
								res.statusCode = 200;
								res.end(JSON.stringify({ success: true }));
							} catch (err) {
								console.error(
									`[DesignLab API] Error parsing or saving note: ${err}`,
								);
								res.statusCode = 500;
								res.end(JSON.stringify({ error: "Failed to save note" }));
							}
						});
					} else {
						next();
					}
				});
			},
		},
	],
});
