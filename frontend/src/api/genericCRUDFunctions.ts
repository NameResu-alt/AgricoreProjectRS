import apiClient from "./client";
import type React from "react";

interface Functions {
    get: () => Promise<void>
    post: (data: any) => Promise<void>
    put: (data: any, id: number) => Promise<void>
    delete: (id: number) => Promise<void>
}

//const setData: React.Dispatch<React.SetStateAction<FarmRead[]>>
export default function createDefaultFunctions<T extends { id: number }>(baseURL: string, setData: React.Dispatch<React.SetStateAction<T[]>>): Functions {

    const get = async () => {
        const result = await apiClient.get(baseURL)
        setData(result.data)
    }

    return {
        get: get,
        post: async (data: any) => {
            const result = await apiClient.post<T>(baseURL, data)
            setData((prev) => [...prev, result.data])
        },
        put: async (data: any, id: number) => {
            const result = await apiClient.put(`${baseURL}/${id}`, data)
            setData((prev) => {
                return prev.map((row) => {
                    if (row.id != result.data.id) {
                        return row
                    }

                    return result.data;
                });
            })
        },
        delete: async (id: number) => {
            await apiClient.delete(`${baseURL}/${id}`)
            await get()
        }
    }
}