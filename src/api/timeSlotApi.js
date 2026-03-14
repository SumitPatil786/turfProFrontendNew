import api from './axiosConfig';

/**
 * TIME SLOT API — matches original backend exactly
 *
 * TimeSlotRequestDto: { turfId, slotDate, startTime, endTime }
 * TimeSlotResponseDto: { slotId, turfId, slotDate, startTime, endTime, isAvailable }
 *
 * Endpoints (TimeSlotController):
 *   POST /api/timeslots/generate           — generates 1-hour slots
 *   GET  /api/timeslots?turfId=&date=      — get slots for turf+date
 */
export const timeSlotApi = {
  /**
   * POST /api/timeslots/generate
   * Backend DTO field is 'slotDate', not 'date'.
   * Generates 1-hour slots from startTime to endTime.
   */
  generateSlots: ({ turfId, date, startTime, endTime }) =>
    api.post('/api/timeslots/generate', {
      turfId,
      slotDate: date,   // backend expects 'slotDate', not 'date'
    }),

  /**
   * GET /api/timeslots?turfId=X&date=YYYY-MM-DD
   * Returns array of TimeSlotResponseDto
   */
  getSlots: (turfId, date) =>
    api.get('/api/timeslots', { params: { turfId, date } }),
};
