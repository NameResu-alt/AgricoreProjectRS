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
        if (error.response?.status === 401) {

            const tokenStr = localStorage.getItem("agriCoreToken")
            const { exp } = jwtDecode(tokenStr!)

            const isExpired = Date.now() >= exp! * 1000;

            if (isExpired) {
                alert("Your JWT Token expired, can't make requests!")
                localStorage.removeItem('agriCoreToken')
                window.location.reload()
            }
        }

        return Promise.reject(error)
    })

export default apiClient