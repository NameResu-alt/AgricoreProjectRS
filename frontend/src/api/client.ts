import axios, { type InternalAxiosRequestConfig } from 'axios';
import { jwtDecode } from "jwt-decode"
import type TokenResponse from './schemas/token_schema';

export const ACCESS_KEY = "agriCoreAccessToken";
export const REFRESH_KEY = "agriCoreRefreshToken";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"
const apiClient = axios.create({
    baseURL: baseURL
})

//Prevent concurrent requests from using the same refresh token. 
let refreshPromise: Promise<TokenResponse> | null = null;

export async function refreshAccessToken(): Promise<TokenResponse>{
    if(!refreshPromise){
        refreshPromise = (async ()=>{
            const refreshToken = localStorage.getItem(REFRESH_KEY)

            if(!refreshToken){
                throw new Error("No refresh token avaialble")
            }

            //Need to use plain Axios so that it doesn't attempt to auto-put an Authetnication header.
            const response = await axios.post<TokenResponse>(
                `${baseURL}/auth/refresh`,
                {refresh_token: refreshToken}
            )

            const tokens = response.data

            localStorage.setItem(
                ACCESS_KEY,
                tokens.access_token
            )

            localStorage.setItem(
                REFRESH_KEY,
                tokens.refresh_token
            )

            //Notify AuthProvider so its React state stays synchronized
            window.dispatchEvent(
                new CustomEvent("auth:tokens-updated", {
                    detail: tokens,
                })
            )

            return tokens;
        })().finally(()=>{
            refreshPromise = null;
        })
    }

    return refreshPromise
}

//Request interceptor runs on every outgoing requests
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem(ACCESS_KEY);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    else{
        config.headers.delete("Authorization")
    }
    return config
})

type RetryConfig = InternalAxiosRequestConfig & {
    _retry?: boolean
}

const noRepeatPaths = ["/auth/token", "/auth/refresh","/auth/invalidate"]

apiClient.interceptors.response.use((response) => response,
    async (error) => {
        const originalRequest = error.config as RetryConfig | undefined

        const containsRepeatPath = noRepeatPaths.find((path)=>originalRequest?.url?.includes(path))
        
        if(error.response.status !== 401 || !originalRequest || originalRequest._retry || containsRepeatPath != undefined){
            return Promise.reject(error)
        }

        originalRequest._retry = true;

        try{
            const tokens = await refreshAccessToken();

            //Explicitly retry with the newly issued access token.
            originalRequest.headers.set(
                "Authorization",
                `Bearer ${tokens.access_token}`
            );

            return apiClient(originalRequest)
        } catch(refreshError){
            localStorage.removeItem(ACCESS_KEY)
            localStorage.removeItem(REFRESH_KEY)

            window.dispatchEvent(new Event("auth:logout"));
            
            return Promise.reject(refreshError);
        }
    })

export default apiClient

/**
 * const tokenStr = localStorage.getItem("agriCoreToken")
            const { exp } = jwtDecode(tokenStr!)

            const isExpired = Date.now() >= exp! * 1000;

            if (isExpired) {
                alert("Your JWT Token expired, can't make requests!")
                localStorage.removeItem('agriCoreToken')
                window.location.reload()
            }
 */