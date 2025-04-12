import axios from 'axios';

// Create axios instance with base backend URL
const API = axios.create({
  baseURL: 'http://localhost:8001/api/', // Change if backend runs on a different port or domain
});

// Attach token to every request if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// Auth endpoints
export const register = (data) => API.post('register/', data);
export const login = (data) => API.post('login/', data);

// Chat + Code Evaluation endpoints
export const chat = (data) => API.post('chat/', data);
export const evaluate = (data) => API.post('evaluate-code/', data);
export const upload = (data) => API.post('upload-file/', data);

// 🚀 New endpoint: Get question by topic and difficulty
export const getQuestion = (topic, difficulty) => 
  API.get('get-problem-by-topic/', {
    params: { topic, difficulty }
  });

export default API;
