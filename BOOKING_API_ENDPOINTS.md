# User Booking API Endpoints Documentation

## Overview
This document describes the comprehensive API endpoints for managing user bookings in the Tourbirth application. The system now supports multiple bookings per user with proper separation between user information and booking data.

## Booking Model
```typescript
interface IUserBooking {
  bookingId: string;           // Unique booking ID for this specific booking
  packageName: string;         // Shared package name for primary user and companions
  userId: ObjectId;            // Reference to the user who owns this booking
  destination: ObjectId;       // Reference to destination
  travelDate: Date;
  returnDate: Date;
  bookingDate: Date;           // Auto-generated
  amount: number;
  description: string;
  status: BookingStatus;       // PENDING, CONFIRMED, CANCELLED, COMPLETED
  documents: IDocument[];      // Array of booking documents
  itineraries: IItinerary[];   // Array of booking itineraries
  companions: ObjectId[];      // Array of companion IDs
  isPrimary: boolean;          // true for primary user, false for companions
  isActive: boolean;           // Soft delete flag
  createdAt: Date;             // Auto-generated
  updatedAt: Date;             // Auto-generated
}

interface IDocument {
  name: string;    // Document filename
  size: number;    // Document size in bytes
  type: string;    // MIME type
  link: string;    // Document URL
}

interface IItinerary {
  name: string;    // Itinerary filename
  size: number;    // File size in bytes
  type: string;    // MIME type
  link: string;    // File URL
}
```

## Key Concepts

### Primary vs Companion Bookings
- **Primary Booking**: The main booking created for a user (isPrimary: true)
- **Companion Bookings**: Additional bookings created for companions (isPrimary: false)
- **Package Name**: Same for primary user and all their companions
- **Booking ID**: Unique for each booking (primary and companions)

### Booking Status Flow
- `PENDING` → `CONFIRMED` → `COMPLETED`
- `PENDING` → `CANCELLED`

## Admin Endpoints (Admin Authentication Required)

### 1. Create Booking
**POST** `/api/v1/admin/bookings`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "64a1b2c3d4e5f6789012345",
  "destinationId": "64a1b2c3d4e5f6789012346",
  "travelDate": "2024-06-15T00:00:00.000Z",
  "returnDate": "2024-06-22T00:00:00.000Z",
  "amount": 2500,
  "description": "7-day vacation to Paris",
  "documents": [
    {
      "name": "passport.pdf",
      "size": 1024000,
      "type": "application/pdf",
      "link": "https://example.com/documents/passport.pdf"
    }
  ],
  "itineraries": [
    {
      "name": "day1.pdf",
      "size": 2048000,
      "type": "application/pdf",
      "link": "https://example.com/itineraries/day1.pdf"
    }
  ],
  "companions": [
    {
      "firstName": "John",
      "lastName": "Doe",
      "relationship": "Spouse",
      "email": "john@example.com",
      "phoneNumber": "+1234567890"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "booking": {
    "_id": "64a1b2c3d4e5f6789012347",
    "bookingId": "TB-ABC123-DEF456",
    "packageName": "PKG-ABC123-DEF456",
    "userId": "64a1b2c3d4e5f6789012345",
    "destination": "64a1b2c3d4e5f6789012346",
    "travelDate": "2024-06-15T00:00:00.000Z",
    "returnDate": "2024-06-22T00:00:00.000Z",
    "amount": 2500,
    "description": "7-day vacation to Paris",
    "status": "PENDING",
    "isPrimary": true,
    "isActive": true,
    "companions": ["64a1b2c3d4e5f6789012348"],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. Get All Bookings
**GET** `/api/v1/admin/bookings?page=1&limit=10&status=PENDING&packageName=PKG-ABC123&destinationId=64a1b2c3d4e5f6789012346&search=Paris`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by booking status
- `packageName` (optional): Filter by package name
- `destinationId` (optional): Filter by destination
- `search` (optional): Search in bookingId, packageName, description

**Response:**
```json
{
  "success": true,
  "bookings": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalBookings": 50,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### 3. Get User Bookings
**GET** `/api/v1/admin/bookings/user/:userId?page=1&limit=10`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "bookings": [...],
  "pagination": {...}
}
```

### 4. Get User Info and Bookings
**GET** `/api/v1/admin/bookings/user/:userId/info`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "64a1b2c3d4e5f6789012345",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "phoneNumber": "+1234567890",
    "destination": {
      "city": "Paris",
      "country": "France"
    }
  },
  "bookings": [...]
}
```

### 5. Get Booking by ID
**GET** `/api/v1/admin/bookings/:bookingId`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "booking": {
    "_id": "64a1b2c3d4e5f6789012347",
    "bookingId": "TB-ABC123-DEF456",
    "packageName": "PKG-ABC123-DEF456",
    "userId": {
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com"
    },
    "destination": {
      "city": "Paris",
      "country": "France"
    },
    "companions": [
      {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "relationship": "Spouse"
      }
    ],
    "travelDate": "2024-06-15T00:00:00.000Z",
    "returnDate": "2024-06-22T00:00:00.000Z",
    "amount": 2500,
    "description": "7-day vacation to Paris",
    "status": "PENDING",
    "isPrimary": true,
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 6. Update Booking
**PUT** `/api/v1/admin/bookings/:bookingId`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "destinationId": "64a1b2c3d4e5f6789012346",
  "travelDate": "2024-06-20T00:00:00.000Z",
  "returnDate": "2024-06-27T00:00:00.000Z",
  "amount": 2800,
  "description": "Updated 7-day vacation to Paris",
  "documents": [...],
  "itineraries": [...],
  "companions": [
    {
      "firstName": "John",
      "lastName": "Doe",
      "relationship": "Spouse",
      "email": "john@example.com",
      "phoneNumber": "+1234567890"
    },
    {
      "firstName": "Jane",
      "lastName": "Doe",
      "relationship": "Child",
      "email": "jane.doe@example.com",
      "phoneNumber": "+1234567891"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking updated successfully",
  "booking": {...}
}
```

### 7. Update Booking Status
**PATCH** `/api/v1/admin/bookings/:bookingId/status`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "CONFIRMED"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking status updated successfully",
  "booking": {...}
}
```

### 8. Delete Booking
**DELETE** `/api/v1/admin/bookings/:bookingId`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Booking deleted successfully"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "userId, destinationId, travelDate, returnDate, amount, and description are required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied - Admin required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Booking not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Validation Rules

1. **userId**: Required, must be valid ObjectId
2. **destinationId**: Required, must be valid ObjectId
3. **travelDate**: Required, must be valid date
4. **returnDate**: Required, must be valid date, must be after travelDate
5. **amount**: Required, must be positive number
6. **description**: Required, max 1000 characters
7. **status**: Must be one of: PENDING, CONFIRMED, CANCELLED, COMPLETED
8. **companions**: Optional array, each companion must have firstName, lastName, relationship, email, phoneNumber

## Notes

- **Booking ID**: Automatically generated with TB- prefix, unique per booking
- **Package Name**: Automatically generated with PKG- prefix, shared between primary user and companions
- **Companion Management**: Adding companions creates separate bookings with same package name
- **Email Notifications**: Welcome emails are sent to new companions automatically
- **Soft Delete**: Bookings are marked as inactive rather than permanently deleted
- **Pagination**: Available for all list endpoints
- **Search**: Supports searching by bookingId, packageName, and description
- **Filtering**: Multiple filter options available for efficient data retrieval

## Workflow Example

1. **Admin creates booking** for user → Primary booking created
2. **Admin adds companions** → Companion bookings created with same package name
3. **Admin updates booking** → All related bookings updated
4. **Admin changes status** → Status updated for specific booking
5. **Admin deletes booking** → Booking marked as inactive
