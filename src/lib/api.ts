import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

// Axios Request Interceptor ማዋቀር
API.interceptors.request.use(
  (config) => {
    // ከሎካል ስቶሬጅ አክሰስ ቶክኑን መውሰድ
    const token = localStorage.getItem("accessToken");
    
    // ቶክኑ ካለ በፈጠራነው Request Header ላይ ማያያዝ
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    // ጥሪው ሳይወጣ ስህተት ካጋጠመ እዚህ ጋር ማስተናገድ ይቻላል
    return Promise.reject(error);
  }
);

export default API;