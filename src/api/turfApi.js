import api from './axiosConfig';

/**
 * TURF API — matches original backend exactly
 *
 * Backend endpoints (TurfController):
 *   GET  /api/turfs         — getAllTurfs()
 *   POST /api/turfs         — addTurf(@RequestBody TurfDto)
 *
 * NOTE: There is NO GET /api/turfs/{id} endpoint in the original backend.
 * TurfDetailPage uses getTurfById with a fallback to getAll+filter — that fallback
 * is what actually works here.
 *
 * TurfDto fields: { turfId, turfName, location, areaInMetres, pricePerHour,
 *                   sportType, address, openTime, closeTime, description }
 * NOTE: Turf entity has owner (nullable=false). Backend TurfService uses
 * ModelMapper which will fail without an owner. Admin must exist in DB first.
 * We pass ownerId in the payload for the fixed backend; original backend ignores it.
 */
export const turfApi = {
  // GET /api/turfs
  getAllTurfs: () => api.get('/api/turfs'),

  // GET /api/turfs/:id — NOT in original backend, will 404.
  // TurfDetailPage has a fallback to getAllTurfs + find, which works.
  getTurfById: (id) => api.get(`/api/turfs/${id}`),

  // POST /api/turfs
  // ownerId is accepted by the fixed backend; original backend may fail without a valid owner.
  addTurf: (data) => api.post('/api/turfs', data),
};
