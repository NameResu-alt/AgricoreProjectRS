import { type ReactNode, createContext, useContext, useState } from "react";
import { type LoginCredentials, type JWTPayload } from '../api/schemas/auth';
import apiClient from "../api/client";

interface AuthContextValues {
    token: string | null
    user: JWTPayload | null,
    isAuthenticated: boolean,
    login: ({ username, password }: LoginCredentials) => Promise<void>,
    logout: () => void,
}

const AuthContext = createContext<AuthContextValues | null>(null)

function decodeToken(token: string): JWTPayload {
    const payloadSegment = token.split(".")[1]
    const payload = JSON.parse(atob(payloadSegment));

    return {
        sub: payload.sub,
        role: payload.role,
        exp: payload.exp
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState(() => localStorage.getItem("agriCoreToken"))

    const user = (token ? decodeToken(token) : null)

    const login = async ({ username, password }: LoginCredentials) => {
        const formData = new URLSearchParams()
        formData.append('username', username)
        formData.append('password', password)

        const response = await apiClient.post("/auth/token", formData, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        })
        localStorage.setItem('agriCoreToken', response.data.access_token);
        setToken(response.data.access_token)
    }

    const logout = () => {
        localStorage.removeItem('agriCoreToken')
        setToken(null)
    }

    const isAuthenticated = token !== null &&
        user !== null;

    const value = { token, user, isAuthenticated, login, logout };

    return <AuthContext.Provider value={value}> {children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValues {
    const context = useContext(AuthContext)
    if (context === null) {
        throw new Error("useAuth must be used within AuthProvider")
    }

    return context;
}