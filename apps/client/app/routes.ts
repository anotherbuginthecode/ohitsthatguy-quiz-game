import { type RouteConfig, index } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  {
    path: "play/:gameId",
    file: "routes/gamePlay.tsx",
  },
] satisfies RouteConfig;
