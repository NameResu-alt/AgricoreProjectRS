import apiClient from "./client";
import type React from "react";

interface Functions {
    post: (data: any) => Promise<void>
    put: (data: any, id: number) => Promise<void>
    delete: (id: number) => Promise<void>
}

//const setData: React.Dispatch<React.SetStateAction<FarmRead[]>>
export default function createDefaultFunctions(baseURL: string, setGetSignal: React.Dispatch<React.SetStateAction<number>>): Functions {
    return {
        post: async (data: any) => {
            await apiClient.post(baseURL, data)
            setGetSignal((prev)=>prev+1)
        },
        put: async (data: any, id: number) => {
            await apiClient.put(`${baseURL}/${id}`, data)
            setGetSignal((prev)=>prev+1)
        },
        delete: async (id: number) => {
            await apiClient.delete(`${baseURL}/${id}`)
            setGetSignal((prev)=>prev+1)
        }
    }
}