import { type ReactNode, createContext, useCallback, useContext, useEffect, useState } from "react";
import { type LoginCredentials, type JWTPayload, type UserInformation, Permission } from '../api/schemas/auth';
import apiClient, { ACCESS_KEY, REFRESH_KEY } from "../api/client";
import type TokenResponse from "../api/schemas/token_schema"

import { refreshAccessToken } from "../api/client";
import type { JwtPayload } from "jwt-decode";

interface AuthContextValues {
    token: string | null
    refreshToken: string | null
    user: UserInformation | null,
    isAuthenticated: boolean,
    login: ({ username, password }: LoginCredentials) => Promise<void>,
    logout: () => Promise<void>,
    updateTokens: (tokens: TokenResponse) => void;
}


const AuthContext = createContext<AuthContextValues | null>(null)

function decodeToken(token: string): JWTPayload | null {
    try {
        const payloadSegment = token.split(".")[1]
        if (!payloadSegment) return null;

        const payload = JSON.parse(atob(payloadSegment));

        return {
            sub: payload.sub,
            role: payload.role,
            permissions: payload.permissions,
            exp: payload.exp
        }
    }
    catch {
        return null;
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem(ACCESS_KEY))
    const [refreshToken, setRefreshToken] = useState<string | null>(() => localStorage.getItem(REFRESH_KEY))

    const updateTokens = useCallback((tokens: TokenResponse) => {
        localStorage.setItem(ACCESS_KEY, tokens.access_token);
        localStorage.setItem(REFRESH_KEY, tokens.refresh_token);

        setToken(tokens.access_token);
        setRefreshToken(tokens.refresh_token);
    }, []);



    const jwtPayload = (token ? decodeToken(token) : null)

    const login = useCallback(async ({
        username,
        password,
    }: LoginCredentials) => {
        const formData = new URLSearchParams();
        formData.append("username", username);
        formData.append("password", password);

        const response = await apiClient.post<TokenResponse>(
            "/auth/token",
            formData,
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            },
        );

        updateTokens(response.data);
    }, [updateTokens]);

    const clearSession = useCallback(() => {
        localStorage.removeItem(ACCESS_KEY);
        localStorage.removeItem(REFRESH_KEY);
        setToken(null);
        setRefreshToken(null);
    }, []);

    const logout = useCallback(async () => {
        try {
            if (refreshToken) {
                await apiClient.post("/auth/invalidate", {
                    refresh_token: refreshToken,
                });
            }
        } finally {
            clearSession();
        }
    }, [refreshToken, clearSession]);


    useEffect(() => {
        const handleTokensUpdated = (event: Event) => {
            const tokens = (event as CustomEvent<TokenResponse>).detail;
            updateTokens(tokens)
        }

        window.addEventListener(
            "auth:tokens-updated",
            handleTokensUpdated
        )

        window.addEventListener("auth:logout", clearSession)

        return () => {
            window.removeEventListener(
                "auth:tokens-updated",
                handleTokensUpdated,
            );

            window.removeEventListener("auth:logout", clearSession)
        };

    }, [updateTokens])

    useEffect(() => {
        if (!token || !refreshToken || jwtPayload?.exp == null) return
        let cancelled = false;

        const delay = jwtPayload.exp * 1000 - Date.now() - 60_000;

        const timer = setTimeout(async () => {
            try {
                await refreshAccessToken();
            } catch {

            }
        }, Math.max(0, delay));


        return () => {
            cancelled = true;
            clearTimeout(timer)
        };
    }, [token, refreshToken, jwtPayload?.exp])


    const isAuthenticated = jwtPayload !== null && jwtPayload.exp * 1000 > Date.now()

    let userPrep = null
    if (jwtPayload !== null) {

        const user_permissions: Permission[] = []
        const values = Object.values(Permission)


        for (const permission of jwtPayload.permissions) {
            if (values.includes(permission as Permission)) {
                user_permissions.push(permission as Permission)
            }
            else {
                console.log(`Foreign Permission present: ${permission}`)
            }
        }

        userPrep = {
            ...jwtPayload,
            permissions: user_permissions
        }
    }
    const user = userPrep

    const value = { token, refreshToken, user, isAuthenticated, login, logout, updateTokens };

    return <AuthContext.Provider value={value}> {children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValues {
    const context = useContext(AuthContext)
    if (context === null) {
        throw new Error("useAuth must be used within AuthProvider")
    }

    return context;
}

export function hasPermission(permission: Permission, allow_wildcard: boolean = true): boolean {
    const context = useAuth()

    let user_permissions = new Set(context.user?.permissions)
    console.log(`Need: ${permission.toString()} User Permissions: ${context.user?.permissions.map((p) => p.toString())}`)
    if (user_permissions.has(permission)) {
        console.log("Valid")
        return true;
    }

    if (allow_wildcard) {
        const neededWildcard =
            `${permission.split(":")[0]}:*` as Permission;

        if (user_permissions.has(neededWildcard)) {
            return true;
        }
    }
    console.log("Invalid")
    return false
}