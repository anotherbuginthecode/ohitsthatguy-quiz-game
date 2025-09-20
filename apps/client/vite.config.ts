import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { VitePWA } from "vite-plugin-pwa";
// Add a module declaration for importing JSON files if not present
import icons from "./public/AppImages/icons.json";

export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      devOptions: { enabled: true },
      includeAssets: [
        "favicon.ico",
        "apple-touch-icon.png",
        "assets/*",
        "AppImages/ios/180.png",
        "AppImages/android/180.png",
      ],
      manifest: {
        short_name: "OTTG!",
        name: "Oh, It's That Guy! - Quiz Game",
        description:
          "A quiz game where users have to remember the highest number of times they saw an actor before the time ran out",
        start_url: "/",
        background_color: "#030712",
        theme_color: "#030712",
        display: "standalone",
        icons: icons.icons.map((icon) => ({
          ...icon,
          src: icon.src.startsWith("/") ? icon.src : "/" + icon.src,
          type: icon.type || "image/png",
          purpose: icon.purpose || "any maskable",
        })),
      },
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
      },
    }),
  ],
});
