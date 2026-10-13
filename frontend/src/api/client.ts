import axios from 'axios';
import { jwtDecode } from "jwt-decode"

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"
})

//Request interceptor runs on every outgoing requests
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('agriCoreToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

apiClient.interceptors.response.use((response) => response,
    (error) => {
        const originalRequest = error.config
        if (error.response?.status === 401 && !originalRequest._retry) {

            originalRequest._retry = true; //Mark the request as retried to avoid infinite loops

            try{
                const refreshToken = localStorage.getItem("agriCoreRefreshToken");

                //Make a request to your auth server to refresh the token. 
                const response = await axios.post('http://your.auth.server/refresh', {
                    refreshToken
                })

                const {accessToken, refreshToken: newRefreshToken } = response.data;

                localStorage.setItem('agriCoreAccessToken', accessToken)
                localStorage.setItem('agriCoreRefreshToken', newRefreshToken)

                //axiosInstance.deafults.headers.common['Authorizaiton'] = `Bearer ${accessToken}`;
                
                return apiClient(originalRequest); //Retry the original request with the new access token.
            }

            
        }

        return Promise.reject(error)
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