import axios from 'axios'

const api = axios.create({
  // Change this to your backend API URL or set NEXT_PUBLIC_API_URL
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030/api',
  withCredentials: true, // if you ever use cookies
})

export default api
