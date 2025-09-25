import { type RouteConfig, index } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  {
    path: "play/:gameId",
    file: "routes/gamePlay.tsx",
  },
  {
    path: "privacy-policy",
    file: "routes/privacy-policy.tsx",
  },
] satisfies RouteConfig;
