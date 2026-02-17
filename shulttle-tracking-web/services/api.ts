import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// (เดี๋ยวจะมาเพิ่มโค้ดดักจับ Token ตรงนี้ เพื่อให้มันแนบบัตรผ่านไปกับทุก Request)

export default api;