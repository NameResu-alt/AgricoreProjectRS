import axios from 'axios';

const apiClient = axios.create({
    baseURL: "http://127.0.0.1:8000"
})

//Request interceptor runs on every outgoing requests
apiClient.interceptors.request.use((config) =>{
    const token = localStorage.getItem('agriCoreToken');
    if(token){
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export default apiClient