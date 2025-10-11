# Dashboard Statistics API

## Single Unified Endpoint

All dashboard statistics are now accessed through **one endpoint** with an optional currency filter.

---

## API Endpoint

### **GET** `/api/admin/dashboard/stats`

**Base URL**: `http://localhost:YOUR_PORT/api/admin/dashboard/stats`

**Authentication**: Required (Admin only)

**Headers**:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Usage

### 1️⃣ **Get All Stats (Both Currencies)**

**URL**:
```
GET http://localhost:3000/api/admin/dashboard/stats
```

**No query parameters needed**

**Response**:
```json
{
  "success": true,
  "dashboard": {
    "totalBookings": 150,
    "revenue": {
      "naira": 5000000,
      "usd": 25000
    },
    "totalBookingsAmount": {
      "naira": 2500000,
      "usd": 12500
    },
    "totalProfit": {
      "naira": 2500000,
      "usd": 12500
    },
    "upcomingTours": 12,
    "totalUsers": 500,
    "upcomingToursDetails": [...]
  }
}
```

---

### 2️⃣ **Get Naira Stats Only**

**URL**:
```
GET http://localhost:3000/api/admin/dashboard/stats?currency=naira
```

**Query Parameter**:
- `currency=naira`

**Response**:
```json
{
  "success": true,
  "dashboard": {
    "currency": "naira",
    "totalBookings": 100,
    "revenue": 5000000,
    "totalBookingsAmount": 2500000,
    "totalProfit": 2500000,
    "upcomingTours": 8,
    "totalUsers": 500,
    "upcomingToursDetails": [...]
  }
}
```

---

### 3️⃣ **Get USD Stats Only**

**URL**:
```
GET http://localhost:3000/api/admin/dashboard/stats?currency=usd
```

**Query Parameter**:
- `currency=usd`

**Response**:
```json
{
  "success": true,
  "dashboard": {
    "currency": "usd",
    "totalBookings": 50,
    "revenue": 25000,
    "totalBookingsAmount": 12500,
    "totalProfit": 12500,
    "upcomingTours": 4,
    "totalUsers": 500,
    "upcomingToursDetails": [...]
  }
}
```

---

## Field Definitions

| Field | Description | Calculation | Scope |
|-------|-------------|-------------|-------|
| `totalBookings` | Total number of active bookings | Count of all active bookings | All time |
| `revenue` | Total revenue from paid bookings | Sum of `totalAmount` for PAID bookings | All time |
| `totalBookingsAmount` | Total deposits received | Sum of `bookingAmount` for PAID bookings | All time |
| `totalProfit` | Outstanding balance from customers | Sum of `(totalAmount - bookingAmount)` for PAID bookings | All time |
| `upcomingTours` | Number of upcoming tours | Bookings with `travelDate` in next 30 days | Next 30 days |
| `totalUsers` | Total registered users | Count of all users | All time |

---

## Important Notes

### ✅ **What Changed**:
- **Single endpoint** - No more `/stats/by-currency`, just use query parameter
- **All time data** - Stats include ALL paid bookings (not just this month)
- **Only PAID bookings** - Revenue calculations only include bookings with `status: "paid"`
- **Separate currencies** - Naira and USD are kept separate (cannot be added together)

### 💡 **Understanding the Fields**:

**Example Scenario:**
- Customer books a package for `₦500,000` (totalAmount)
- They pay a deposit of `₦250,000` (bookingAmount)
- Remaining balance: `₦250,000` (totalProfit)

When the booking is marked as PAID:
- `revenue` increases by `₦500,000`
- `totalBookingsAmount` increases by `₦250,000`
- `totalProfit` increases by `₦250,000`

### 🔐 **Authentication**:
All endpoints require admin authentication via Bearer token.

---

## Postman Setup

### Request 1: All Stats (Combined)
- **Method**: GET
- **URL**: `http://localhost:3000/api/admin/dashboard/stats`
- **Headers**:
  - `Authorization`: `Bearer your_token_here`
- **Params**: None

### Request 2: Naira Stats
- **Method**: GET
- **URL**: `http://localhost:3000/api/admin/dashboard/stats`
- **Headers**:
  - `Authorization`: `Bearer your_token_here`
- **Params**:
  - Key: `currency`, Value: `naira`

### Request 3: USD Stats
- **Method**: GET
- **URL**: `http://localhost:3000/api/admin/dashboard/stats`
- **Headers**:
  - `Authorization`: `Bearer your_token_here`
- **Params**:
  - Key: `currency`, Value: `usd`

---

## Error Responses

### Invalid Currency
```json
{
  "success": false,
  "message": "Invalid currency. Must be either 'naira' or 'usd'"
}
```

### Unauthorized
```json
{
  "success": false,
  "message": "Access denied - Admin required"
}
```

---

## Frontend Implementation Example

```typescript
// Get all stats (both currencies)
const getAllStats = async () => {
  const response = await fetch('/api/admin/dashboard/stats', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  
  console.log('Naira Revenue:', data.dashboard.revenue.naira);
  console.log('USD Revenue:', data.dashboard.revenue.usd);
  console.log('Naira Profit:', data.dashboard.totalProfit.naira);
  console.log('USD Profit:', data.dashboard.totalProfit.usd);
};

// Get Naira-only stats
const getNairaStats = async () => {
  const response = await fetch('/api/admin/dashboard/stats?currency=naira', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  
  console.log('Currency:', data.dashboard.currency); // "naira"
  console.log('Revenue:', data.dashboard.revenue); // 5000000
  console.log('Profit:', data.dashboard.totalProfit); // 2500000
};

// Get USD-only stats
const getUSDStats = async () => {
  const response = await fetch('/api/admin/dashboard/stats?currency=usd', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  
  console.log('Currency:', data.dashboard.currency); // "usd"
  console.log('Revenue:', data.dashboard.revenue); // 25000
  console.log('Profit:', data.dashboard.totalProfit); // 12500
};
```

