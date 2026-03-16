import api from './axiosConfig';

/**
 * USER API
 *
 * Fixed backend UserRequestDto.role = String ("USER", "OWNER", or "ADMIN")
 * Fixed backend UserResponseDto: { userId, name, phone, email, role }
 */
export const userApi = {
  // POST /api/users/register — role as String
  // 👇 ADDED otp HERE to ensure it gets sent to the backend 👇
  register: ({ name, email, password, phone, role, otp }) =>
    api.post('/api/users/register', {
      name,
      email,
      password,
      phone,
      otp, // 👈 AND ADDED HERE
      role: (role || 'USER').toUpperCase(),
    }),

  // POST /api/users/login — body: { email, password }
  login: (email, password) => api.post('/api/users/login', { email, password }),

  // GET /api/users
  getAllUsers: () => api.get('/api/users'),

  // GET /api/users/:id
  getUserById: (id) => api.get(`/api/users/${id}`),
  
  // POST /api/users/send-otp
  sendOtp: (email) => api.post('/api/users/send-otp', { email }),
};