import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("/login", "routes/login.tsx"),
    route("/signup", "routes/signup.tsx"),
    // index("routes/forgot-password.tsx"),
    // index("routes/dashboard.tsx"),
    // index("routes/profile.tsx"),
] satisfies RouteConfig;
