import axios from "axios";
import { backendConnection } from "@/config/backend";
import type { ActiveVehicleState } from "@/types/canonical-state";

const publicApi = axios.create({
    baseURL: backendConnection.apiBaseUrl,
    headers: {
        "Content-Type": "application/json",
    },
});

export default publicApi;

export const getActiveVehicles = async (): Promise<ActiveVehicleState[]> => {
    const response = await publicApi.get<ActiveVehicleState[]>("/public/active-vehicles");
    return response.data;
};
