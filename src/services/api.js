import axios from 'axios';

// 统一使用 model_api 作为后端前缀
// 优先使用环境变量 VITE_API_URL，未配置时默认走线上地址
const API_BASE_URL = 'https://dpsk.ai/model_api/';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// 模型相关API
export const modelAPI = {
  getAll: (params) => api.get('/models', { params }),
  getById: (id) => api.get(`/models/${id}`),
  create: (data) => api.post('/models', data),
  update: (id, data) => api.put(`/models/${id}`, data),
  delete: (id) => api.delete(`/models/${id}`),
};

// 应用相关API
export const appAPI = {
  getAll: (params) => api.get('/apps', { params }),
  getById: (id) => api.get(`/apps/${id}`),
  create: (data) => api.post('/apps', data),
  update: (id, data) => api.put(`/apps/${id}`, data),
  delete: (id) => api.delete(`/apps/${id}`),
};

// 分类相关API
export const categoryAPI = {
  getAll: (type) => api.get('/categories', { params: { type } }),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// 标签相关API
export const tagAPI = {
  getAll: () => api.get('/tags'),
  create: (data) => api.post('/tags', data),
  delete: (id) => api.delete(`/tags/${id}`),
};

// 基座模型相关API
export const baseModelAPI = {
  getAll: (params) => api.get('/base-models', { params }),
};

// 统计API
export const statsAPI = {
  get: () => api.get('/stats'),
};

export default api;
