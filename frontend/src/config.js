const isProd = process.env.NODE_ENV === 'production';

export const API_URL = isProd 
  ? 'https://store-rating-app-backend-ka3t.onrender.com/api'
  : 'http://localhost:5000/api';