import api from './axiosConfig';

/**
 * BOOKING API — matches original backend exactly
 *
 * BookingRequestDto fields (original): { bookingId, bookingDate, startTime, endTime,
 *                                        totalAmount, userName, turfName }
 * The original backend finds User by userName and Turf by turfName.
 * It does NOT use userId/turfId/slotId from the request.
 *
 * BookingResponseDto fields (original): { bookingId, bookingDate, startTime, endTime,
 *                                         totalAmount, userName, turfName }
 * NOTE: 'status' is NOT in the original BookingResponseDto.
 * We handle this in components by defaulting to 'CONFIRMED' when status is missing.
 */
export const bookingApi = {
  /**
   * POST /api/bookings
   * Backend finds user by userName, turf by turfName.
   * userId, turfId, slotId are ignored by the original backend
   * but included for forward compatibility with any fixed backend.
   */
  createBooking: (data) => api.post('/api/bookings', data),

  // GET /api/bookings
  getAllBookings: () => api.get('/api/bookings'),

  // GET /api/bookings/:id
  getBookingById: (id) => api.get(`/api/bookings/${id}`),

  // GET /api/bookings/user/:userId
  getBookingsByUser: (userId) => api.get(`/api/bookings/user/${userId}`),

  // GET /api/bookings/turf/:turfId
  getBookingsByTurf: (turfId) => api.get(`/api/bookings/turf/${turfId}`),

  // GET /api/bookings/date/:date
  getBookingsByDate: (date) => api.get(`/api/bookings/date/${date}`),

  // PUT /api/bookings/cancel/:id
  cancelBooking: (id) => api.put(`/api/bookings/cancel/${id}`),

  // DELETE /api/bookings/:id
  deleteBooking: (id) => api.delete(`/api/bookings/${id}`),
};
