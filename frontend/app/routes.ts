import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("/auth/login", "routes/auth/login.tsx"),
    route("/auth/signup", "routes/auth/signup.tsx"),
    //route("routes/forgot-password.tsx"),
    route("/dashboard", "routes/dashboard.tsx"),
    route("/settings", "routes/settings.tsx"),
    route("/onboarding/rss-feed", "routes/onboarding/rss-feed.tsx"),
    route("/onboarding/voice-sample", "routes/onboarding/voice-sample.tsx"),
    route("/onboarding/languages", "routes/onboarding/languages.tsx"),
    route("/onboarding/complete", "routes/onboarding/complete.tsx"),

] satisfies RouteConfig;
