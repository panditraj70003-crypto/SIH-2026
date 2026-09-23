import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Kept deliberately plain: no extra plugins, so `npm run build` stays fast
// and the output stays small. See public/sw.js for the (also plain) offline cache.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    target: "es2018",
  },
});
