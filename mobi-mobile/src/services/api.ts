// mobi-mobile/src/services/api.ts
import axios from "axios";

// Replace with your computer's IP address
// Run 'ipconfig getifaddr en0' on Mac to find IP
const LOCAL_IP = "192.168.1.18"; // Replace with actual IP

export const api = axios.create({
  baseURL: `http://${LOCAL_IP}:5001/api`,
  timeout: 10000,
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.log("Request error:", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`Response: ${response.status}`);
    return response;
  },
  (error) => {
    console.log("Error:", error.message);
    return Promise.reject(error);
  }
);

// if error run command ipconfig getifaddr en0 on device terminal to get ip address then replace