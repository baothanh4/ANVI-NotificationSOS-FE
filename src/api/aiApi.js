import axiosClient from "./axiosClient";

export const aiApi = {
    chat: (message) => {
        return axiosClient.post('/ai/chat', { message });
    }
};
