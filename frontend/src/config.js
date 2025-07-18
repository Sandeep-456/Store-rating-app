const isProd = process.env.NODE_ENV === 'production';

export const API_URL = isProd 
  ? 'https://your-backend.onrender.com/api'
  : 'http://localhost:5000/api';