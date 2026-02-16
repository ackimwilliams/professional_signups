import type { AuthBindings } from "@refinedev/core";

// @todo: temporary authentication
const TEST_USER = "test@test.com";
const TEST_PASS = "test";

export const authProvider: AuthBindings = {
    login: async ({ email, username, password }) => {
        const user = (email ?? username ?? "").toString().trim();
        const pass = (password ?? "").toString();

        if (user === TEST_USER && pass === TEST_PASS) {
            localStorage.setItem("refine-auth", "1");
            return { success: true, redirectTo: "/professionals" };
        }

        return {
            success: false,
            error: {
                name: "InvalidCredentials",
                message: "Use email: test@test.com and password: test",
            },
        };
    },

    logout: async () => {
        localStorage.removeItem("refine-auth");
        return { success: true, redirectTo: "/login" };
    },

    check: async () => {
        const ok = localStorage.getItem("refine-auth") === "1";
        return ok ? { authenticated: true } : { authenticated: false, redirectTo: "/login" };
    },

    getIdentity: async () => {
        const ok = localStorage.getItem("refine-auth") === "1";
        if (!ok) return null;
        return { id: 1, name: "Test User", email: TEST_USER };
    },

    onError: async (error) => ({ error }),
};
