import axios from "axios";
import type { ActiveVehicleState } from "@/types/canonical-state";

const publicApi = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api",
    headers: {
        "Content-Type": "application/json",
    },
});

export default publicApi;

export const getActiveVehicles = async (baseUrl?: string): Promise<ActiveVehicleState[]> => {
    const client = baseUrl
        ? axios.create({
            baseURL: `${baseUrl.replace(/\/$/, "")}/api`,
            headers: { "Content-Type": "application/json" },
        })
        : publicApi;
    const response = await client.get<ActiveVehicleState[]>("/public/active-vehicles");
    return response.data;
};
