import apiClient from "./client";
import type React from "react";
import type { DataEnvelope } from "./schemas/dataEnvelope";

interface Functions {
    get: () => Promise<void>
    post: (data: any) => Promise<void>
    put: (data: any, id: number) => Promise<void>
    delete: (id: number) => Promise<void>
}

//const setData: React.Dispatch<React.SetStateAction<FarmRead[]>>
export default function createDefaultFunctions<T>(baseURL: string, setData: React.Dispatch<React.SetStateAction<DataEnvelope<T>>>): Functions {

    const get = async () => {
        const result = await apiClient.get(baseURL)
        setData(result.data)
    }

    return {
        get: get,
        post: async (data: any) => {
            await apiClient.post(baseURL, data)
            await get()

            //setData((prev) => [...prev, result.data])
        },
        put: async (data: any, id: number) => {
            await apiClient.put(`${baseURL}/${id}`, data)
            await get()
            /*
            setData((prev) => {
                return prev.map((row) => {
                    if (row.id != result.data.id) {
                        return row
                    }

                    return result.data;
                });
            })
            */
        },
        delete: async (id: number) => {
            await apiClient.delete(`${baseURL}/${id}`)
            await get()
        }
    }
}