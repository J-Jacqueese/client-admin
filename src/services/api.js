import axios from 'axios';

// 统一使用 model_api 作为后端前缀
// 优先使用环境变量 VITE_API_URL，未配置时默认走线上地址
const API_BASE_URL = 'http://localhost:3000/model_api/';

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
  getAll: (params) => api.get('/categories', { params }),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// 标签相关API
export const tagAPI = {
  getAll: (params) => api.get('/tags', { params }),
  create: (data) => api.post('/tags', data),
  delete: (id) => api.delete(`/tags/${id}`),
};

// 基座模型相关API
export const baseModelAPI = {
  getAll: (params) => api.get('/base-models', { params }),
};

// 活动相关API（后台可传 include_all=1）
export const eventAPI = {
  getAll: (params) => api.get('/events', { params }),
  getById: (id, params) => api.get(`/events/${id}`, { params }),
  submit: (data) => api.post('/events/submit', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
  approval: (id, approval_status) => api.patch(`/events/${id}/approval`, { approval_status }),
  like: (id) => api.post(`/events/${id}/like`),
  register: (id, data) => api.post(`/events/${id}/register`, data),
  /** multipart，字段名 file */
  uploadEventImage: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/upload/event-image', fd);
  },
};

// 项目相关API（后台可传 include_all=1）
export const projectAPI = {
  getAll: (params) => api.get('/projects', { params }),
  getById: (id, params) => api.get(`/projects/${id}`, { params }),
  submit: (data) => api.post('/projects/submit', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  approval: (id, approval_status) => api.patch(`/projects/${id}/approval`, { approval_status }),
  like: (id) => api.post(`/projects/${id}/like`),
};

// 统计API
export const statsAPI = {
  get: () => api.get('/stats'),
};

export default api;
