import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor to handle global errors (e.g., 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token
      localStorage.removeItem('token')
      
      // Redirect to login only if not already on auth pages
      const currentPath = window.location.pathname
      if (currentPath !== '/login' && currentPath !== '/signup') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export default api
