import { type RouteConfig, index } from "@react-router/dev/routes";


export default [
  index("routes/home.tsx"),
  {
    path: "login",
    file: "routes/login.tsx",
  },
  {
    path: "play/:gameId",
    file: "routes/gamePlay.tsx",
  },
  {
    path: "privacy-policy",
    file: "routes/privacy-policy.tsx",
  },
  {
    path: "leaderboard",
    file: "routes/leaderboard.tsx",
  }
] satisfies RouteConfig;
