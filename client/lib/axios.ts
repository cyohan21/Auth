import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030',
  withCredentials: true, // if you ever use cookies
})

export default api