import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8800';

export const api = axios.create({
  baseURL,
});

// Users API
export const usersAPI = {
  getAll: () => api.get('/api/users'),
  create: (userData) => api.post('/add-user', userData),
  update: (id, userData) => api.post(`/edit-user/${id}`, userData),
  delete: (id) => api.get(`/delete-user/${id}`)
};

// Students API
export const studentsAPI = {
  getAll: () => api.get('/api/students'),
  create: (studentData) => api.post('/add-student', studentData),
  update: (id, studentData) => api.post(`/edit-student/${id}`, studentData),
  delete: (id) => api.get(`/delete-student/${id}`)
};

// Products API
export const productsAPI = {
  getAll: () => api.get('/api/products'),
  create: (productData) => api.post('/add-product', productData),
  update: (id, productData) => api.post(`/edit-product/${id}`, productData),
  delete: (id) => api.get(`/delete-product/${id}`)
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get('/api/categories'),
  create: (categoryData) => api.post('/add-category', categoryData),
  update: (id, categoryData) => api.post(`/edit-category/${id}`, categoryData),
  delete: (id) => api.get(`/delete-category/${id}`)
};

export default api;