# TurfPro Frontend — Setup & Integration Guide

## Prerequisites
- Node.js 16+ and npm
- Spring Boot backend running on port **8080**

---

## 1. Install & Run

```bash
cd turf-fixed
npm install
npm start
```

The app will open at **http://localhost:3000**

---

## 2. Environment Configuration

The `.env` file controls the backend URL:

```
REACT_APP_API_BASE_URL=http://localhost:8080
```

Change the port here if your Spring Boot runs on a different port.

---

## 3. REQUIRED: Spring Boot CORS Configuration

Your backend **must** allow requests from `http://localhost:3000`.
Without this, all API calls will fail with a CORS error.

### Option A — Global CORS config (recommended)

Create or update your Spring Boot `WebMvcConfig.java`:

```java
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

### Option B — Annotate each controller

```java
@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/users")
public class UserController { ... }
```

### Option C — If using Spring Security

Add this inside your `SecurityFilterChain` or `HttpSecurity` config:

```java
http.cors(cors -> cors.configurationSource(request -> {
    var config = new CorsConfiguration();
    config.setAllowedOrigins(List.of("http://localhost:3000"));
    config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(true);
    return config;
}));
```

---

## 4. Backend API Endpoints Expected

The frontend calls these endpoints. Make sure your Spring Boot controllers match:

### Users
| Method | URL | Body |
|--------|-----|------|
| POST | `/api/users/register` | `{ name, email, password, phone, role }` |
| POST | `/api/users/login` | `{ email, password }` |
| GET  | `/api/users` | — |
| GET  | `/api/users/{id}` | — |

**Register — role field:** The frontend sends `role` as a string: `"USER"` or `"ADMIN"`.
Map this to your Role entity in the backend.

**Login — response:** Return user object. If using JWT, include a `token` field:
```json
{
  "userId": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "USER",
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```
The frontend will extract and store the token automatically.

---

### Turfs
| Method | URL | Body |
|--------|-----|------|
| GET  | `/api/turfs` | — |
| GET  | `/api/turfs/{id}` | — |
| POST | `/api/turfs` | `{ turfName, location, address, areaInMetres, pricePerHour, sportType, openTime, closeTime, description }` |

**Turf object shape expected by frontend:**
```json
{
  "turfId": 1,
  "turfName": "Green Arena",
  "location": "Pune",
  "address": "123, Baner Road",
  "areaInMetres": 400,
  "pricePerHour": 800,
  "sportType": "FOOTBALL",
  "openTime": "06:00",
  "closeTime": "22:00",
  "description": "Premium football turf"
}
```

---

### Time Slots
| Method | URL | Body / Params |
|--------|-----|------|
| POST | `/api/timeslots/generate` | `{ turfId, slotDate, startTime, endTime }` |
| GET  | `/api/timeslots?turfId=1&date=2025-01-15` | — |

**Slot object shape expected:**
```json
{
  "slotId": 1,
  "turfId": 1,
  "slotDate": "2025-01-15",
  "startTime": "06:00",
  "endTime": "07:00",
  "isAvailable": true
}
```

---

### Bookings
| Method | URL | Body / Params |
|--------|-----|------|
| POST | `/api/bookings` | See below |
| GET  | `/api/bookings` | — |
| GET  | `/api/bookings/user/{userId}` | — |
| GET  | `/api/bookings/turf/{turfId}` | — |
| PUT  | `/api/bookings/cancel/{id}` | — |
| DELETE | `/api/bookings/{id}` | — |

**Booking creation body:**
```json
{
  "userId": 1,
  "turfId": 2,
  "slotId": 5,
  "bookingDate": "2025-01-15",
  "startTime": "09:00",
  "endTime": "10:00",
  "totalAmount": 800,
  "paymentMethod": "UPI",
  "userName": "John Doe",
  "turfName": "Green Arena"
}
```

**Booking object shape expected in responses:**
```json
{
  "bookingId": 1,
  "userId": 1,
  "turfId": 2,
  "turfName": "Green Arena",
  "userName": "John Doe",
  "bookingDate": "2025-01-15",
  "startTime": "09:00",
  "endTime": "10:00",
  "totalAmount": 800,
  "status": "CONFIRMED"
}
```

---

## 5. Typical First-Run Workflow

1. Start Spring Boot backend
2. Start React frontend (`npm start`)
3. Open http://localhost:3000
4. Register an **Admin** account via `/register`
5. Login as Admin → you'll be redirected to `/admin`
6. Go to **Turfs** tab → add a few turfs
7. Go to **Slots** tab → generate slots for a turf + date
8. Register a **User** account
9. Login as User → Browse turfs → Book a slot
10. Check **My Bookings** page to see the booking

---

## 6. Troubleshooting

| Problem | Likely Cause | Fix |
|---------|-------------|-----|
| "Failed to load turfs" | Backend not running or CORS not configured | Start backend, add CORS config |
| Login fails with 401 | Wrong credentials or backend auth logic | Check password hashing in backend |
| Register fails | Role field format mismatch | Ensure backend accepts `"USER"` / `"ADMIN"` strings |
| Booking fails | Missing userId/turfId/slotId on backend entity | Check `@NotNull` constraints in your Booking entity |
| Slots not showing | Admin hasn't generated slots for that date | Go to Admin → Slots → generate for that turf+date |
| CORS error in browser | Spring Boot CORS not configured | Apply one of the CORS solutions in section 3 |

---

## 7. Project Structure

```
turf-fixed/
├── public/
│   └── index.html
├── src/
│   ├── api/
│   │   ├── axiosConfig.js      ← Base URL, JWT interceptor
│   │   ├── userApi.js          ← Register, Login
│   │   ├── turfApi.js          ← CRUD turfs
│   │   ├── bookingApi.js       ← Create/cancel/get bookings
│   │   └── timeSlotApi.js      ← Generate/get slots
│   ├── context/
│   │   └── AuthContext.js      ← Login state, JWT token, isAdmin
│   ├── components/
│   │   ├── common/             ← Navbar, Footer, ProtectedRoute
│   │   ├── turf/               ← TurfCard
│   │   └── booking/            ← BookingCard
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── TurfsPage.jsx
│   │   ├── TurfDetailPage.jsx  ← Booking flow (3 steps)
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── MyBookingsPage.jsx
│   │   ├── AdminPage.jsx       ← 5 tabs: dashboard/turfs/bookings/users/slots
│   │   └── NotFoundPage.jsx
│   ├── styles/
│   │   └── global.css
│   ├── App.js
│   └── index.js
├── .env                        ← REACT_APP_API_BASE_URL=http://localhost:8080
└── package.json
```
