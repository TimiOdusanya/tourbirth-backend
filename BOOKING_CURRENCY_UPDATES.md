# Booking System Currency Updates

## Overview
The booking system has been updated to support multiple currencies (Naira and USD) and separate `totalAmount` and `bookingAmount` fields.

## Changes Made

### 1. Currency Enum
Added new `Currency` enum in `/src/types/roles.ts`:
```typescript
export enum Currency {
  NAIRA = "naira",
  USD = "usd",
}
```

### 2. Booking Models Updated

#### IBooking and IUserBooking Interfaces
- **Removed**: `amount: number`
- **Added**:
  - `totalAmount: number` - Total amount for the booking
  - `bookingAmount: number` - Booking/deposit amount
  - `currency: Currency` - Currency type (Naira or USD)

### 3. API Changes

#### Creating a Booking
**Endpoint**: `POST /api/admin/bookings`

**Old Request Body**:
```json
{
  "userId": "string",
  "destinationId": "string",
  "travelDate": "date",
  "returnDate": "date",
  "amount": 5000,
  "description": "string"
}
```

**New Request Body**:
```json
{
  "userId": "string",
  "destinationId": "string",
  "travelDate": "date",
  "returnDate": "date",
  "totalAmount": 10000,
  "bookingAmount": 5000,
  "currency": "naira",  // or "usd"
  "description": "string"
}
```

#### Updating a Booking
**Endpoint**: `PUT /api/admin/bookings/:bookingId`

**New Fields Available**:
- `totalAmount` (optional)
- `bookingAmount` (optional)
- `currency` (optional) - "naira" or "usd"

### 4. Dashboard Statistics

#### Default Stats (Combined)
**Endpoint**: `GET /api/admin/dashboard/stats`

**Response Format**:
```json
{
  "success": true,
  "dashboard": {
    "totalBookings": 150,
    "revenueThisMonth": {
      "naira": 5000000,
      "usd": 25000
    },
    "bookingAmountThisMonth": {
      "naira": 2500000,
      "usd": 12500
    },
    "totalProfitThisMonth": {
      "naira": 2500000,
      "usd": 12500
    },
    "upcomingTours": 12,
    "totalUsers": 500,
    "upcomingToursDetails": [...]
  }
}
```

**Field Explanations**:
- `revenueThisMonth`: Sum of `totalAmount` for all bookings this month (separated by currency)
- `bookingAmountThisMonth`: Sum of `bookingAmount` (deposits) for all bookings this month (separated by currency)
- `totalProfitThisMonth`: Sum of `(totalAmount - bookingAmount)` for all bookings this month (separated by currency)

#### Stats by Currency
**Endpoint**: `GET /api/admin/dashboard/stats/by-currency?currency=naira`

**Query Parameters**:
- `currency` (required): "naira" or "usd"

**Response Format**:
```json
{
  "success": true,
  "dashboard": {
    "currency": "naira",
    "totalBookings": 100,
    "revenueThisMonth": 5000000,
    "bookingAmountThisMonth": 2500000,
    "totalProfitThisMonth": 2500000,
    "upcomingTours": 8,
    "totalUsers": 500,
    "upcomingToursDetails": [...]
  }
}
```

**Field Explanations**:
- `revenueThisMonth`: Sum of `totalAmount` for all bookings this month in this currency
- `bookingAmountThisMonth`: Sum of `bookingAmount` (deposits) for all bookings this month in this currency
- `totalProfitThisMonth`: Sum of `(totalAmount - bookingAmount)` for all bookings this month in this currency
  - **Formula**: `totalProfitThisMonth = revenueThisMonth - bookingAmountThisMonth`

#### Get USD Stats
**Endpoint**: `GET /api/admin/dashboard/stats/by-currency?currency=usd`

**Response Format**:
```json
{
  "success": true,
  "dashboard": {
    "currency": "usd",
    "totalBookings": 50,
    "revenueThisMonth": 25000,
    "bookingAmountThisMonth": 12500,
    "totalProfitThisMonth": 12500,
    "upcomingTours": 4,
    "totalUsers": 500,
    "upcomingToursDetails": [...]
  }
}
```

**Note**: All three amounts (`revenueThisMonth`, `bookingAmountThisMonth`, `totalProfitThisMonth`) are calculated from **all bookings** created this month in the specified currency, regardless of payment status.

## How to Use

### Frontend Implementation Example

```typescript
// Get combined stats (both currencies)
const getCombinedStats = async () => {
  const response = await fetch('/api/admin/dashboard/stats', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  
  console.log('Naira Revenue:', data.dashboard.revenueThisMonth.naira);
  console.log('USD Revenue:', data.dashboard.revenueThisMonth.usd);
};

// Get Naira-only stats
const getNairaStats = async () => {
  const response = await fetch('/api/admin/dashboard/stats/by-currency?currency=naira', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  
  console.log('Naira Stats:', data.dashboard);
};

// Get USD-only stats
const getUSDStats = async () => {
  const response = await fetch('/api/admin/dashboard/stats/by-currency?currency=usd', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  
  console.log('USD Stats:', data.dashboard);
};

// Create a booking with new fields
const createBooking = async (bookingData) => {
  const response = await fetch('/api/admin/bookings', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify({
      userId: "user123",
      destinationId: "dest456",
      travelDate: "2025-12-01",
      returnDate: "2025-12-10",
      totalAmount: 500000,
      bookingAmount: 250000,
      currency: "naira",
      description: "Family vacation package"
    })
  });
  
  return await response.json();
};
```

## Migration Notes

### Existing Bookings
- Existing bookings in the database will need to be migrated
- The `amount` field needs to be split into `totalAmount` and `bookingAmount`
- Default currency is set to `NAIRA` in the schema

### Database Migration Script (Optional)
If you have existing bookings, run this migration:

```javascript
// Migration script example
db.bookings.updateMany(
  { amount: { $exists: true } },
  [
    {
      $set: {
        totalAmount: "$amount",
        bookingAmount: { $multiply: ["$amount", 0.5] }, // Assuming 50% deposit
        currency: "naira"
      }
    },
    {
      $unset: "amount"
    }
  ]
);

db.userbookings.updateMany(
  { amount: { $exists: true } },
  [
    {
      $set: {
        totalAmount: "$amount",
        bookingAmount: { $multiply: ["$amount", 0.5] },
        currency: "naira"
      }
    },
    {
      $unset: "amount"
    }
  ]
);
```

## Testing

### Test Scenarios

1. **Create Booking in Naira**
   - Verify `totalAmount`, `bookingAmount`, and `currency` are saved correctly

2. **Create Booking in USD**
   - Verify USD bookings are handled separately

3. **Get Combined Stats**
   - Verify response includes separate `naira` and `usd` revenue

4. **Get Naira Stats**
   - Verify only Naira bookings are counted

5. **Get USD Stats**
   - Verify only USD bookings are counted

6. **Update Booking Currency**
   - Verify currency can be changed from Naira to USD and vice versa

## Important Notes

⚠️ **Breaking Changes**:
- The `amount` field has been replaced with `totalAmount` and `bookingAmount`
- All API calls creating or updating bookings must use the new fields
- Frontend applications need to be updated to handle the new response format for dashboard stats

✅ **Backward Compatibility**:
- Default currency is set to NAIRA
- Existing code will need to be updated to use the new fields

📊 **Dashboard Stats**:
- Use `/api/admin/dashboard/stats` for combined view (both currencies separated)
- Use `/api/admin/dashboard/stats/by-currency?currency=naira` for Naira-only stats
- Use `/api/admin/dashboard/stats/by-currency?currency=usd` for USD-only stats
- You **cannot** add Naira and USD amounts together as they are different currencies

