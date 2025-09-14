# Waitlist API Endpoints

This document describes the API endpoints for the TourBirth waitlist system. The waitlist allows anyone to sign up for future trips without authentication.

## Base URL
```
/api/v1/waitlist
```

## Public Endpoints (No Authentication Required)

### 1. Add to Waitlist
**POST** `/api/v1/waitlist`

Add someone to the waitlist. This endpoint is public and doesn't require authentication.

#### Request Body
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "+1234567890",
  "tripType": "Adventure Travel",
  "additionalInformation": "Interested in hiking and camping trips"
}
```

#### Required Fields
- `name` (string): Full name of the person
- `email` (string): Valid email address
- `phoneNumber` (string): Phone number
- `tripType` (string): Type of trip they're interested in

#### Optional Fields
- `additionalInformation` (string): Any additional information or preferences

#### Success Response (201)
```json
{
  "success": true,
  "message": "Successfully added to waitlist! We'll notify you when we have trips matching your interests.",
  "data": {
    "id": "64a1b2c3d4e5f6789012345",
    "name": "John Doe",
    "email": "john@example.com",
    "tripType": "Adventure Travel"
  }
}
```

#### Error Responses
- **400 Bad Request**: Missing required fields or invalid email format
- **409 Conflict**: Email already exists in waitlist
- **500 Internal Server Error**: Server error

#### Example cURL
```bash
curl -X POST http://localhost:3000/api/v1/waitlist \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+1234567890",
    "tripType": "Adventure Travel",
    "additionalInformation": "Interested in hiking and camping trips"
  }'
```

## Admin Endpoints (Authentication Required)

### 2. Get All Waitlist Entries
**GET** `/api/v1/waitlist`

Retrieve all waitlist entries with optional filtering and pagination.

#### Query Parameters
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Number of entries per page (default: 10)
- `tripType` (string, optional): Filter by trip type
- `search` (string, optional): Search in name, email, or trip type
- `isActive` (boolean, optional): Filter by active status (default: true)

#### Success Response (200)
```json
{
  "success": true,
  "message": "Waitlist entries retrieved successfully",
  "data": {
    "entries": [
      {
        "_id": "64a1b2c3d4e5f6789012345",
        "name": "John Doe",
        "email": "john@example.com",
        "phoneNumber": "+1234567890",
        "tripType": "Adventure Travel",
        "additionalInformation": "Interested in hiking and camping trips",
        "isActive": true,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalEntries": 50,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

#### Example cURL
```bash
curl -X GET "http://localhost:3000/api/v1/waitlist?page=1&limit=10&tripType=Adventure" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 3. Get Waitlist Entry by ID
**GET** `/api/v1/waitlist/:id`

Retrieve a specific waitlist entry by its ID.

#### Path Parameters
- `id` (string): Waitlist entry ID

#### Success Response (200)
```json
{
  "success": true,
  "message": "Waitlist entry retrieved successfully",
  "data": {
    "_id": "64a1b2c3d4e5f6789012345",
    "name": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+1234567890",
    "tripType": "Adventure Travel",
    "additionalInformation": "Interested in hiking and camping trips",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Error Responses
- **404 Not Found**: Waitlist entry not found
- **500 Internal Server Error**: Server error

### 4. Update Waitlist Entry
**PUT** `/api/v1/waitlist/:id`

Update a waitlist entry. Only admins can perform this action.

#### Path Parameters
- `id` (string): Waitlist entry ID

#### Request Body
```json
{
  "name": "John Smith",
  "phoneNumber": "+1234567891",
  "tripType": "Cultural Tours",
  "additionalInformation": "Updated preferences"
}
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Waitlist entry updated successfully",
  "data": {
    "_id": "64a1b2c3d4e5f6789012345",
    "name": "John Smith",
    "email": "john@example.com",
    "phoneNumber": "+1234567891",
    "tripType": "Cultural Tours",
    "additionalInformation": "Updated preferences",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:45:00.000Z"
  }
}
```

### 5. Remove from Waitlist
**DELETE** `/api/v1/waitlist/:id`

Soft delete a waitlist entry (sets isActive to false).

#### Path Parameters
- `id` (string): Waitlist entry ID

#### Success Response (200)
```json
{
  "success": true,
  "message": "Successfully removed from waitlist"
}
```

#### Error Responses
- **404 Not Found**: Waitlist entry not found
- **500 Internal Server Error**: Server error

### 6. Get Waitlist Statistics
**GET** `/api/v1/waitlist/stats`

Get waitlist statistics and analytics.

#### Success Response (200)
```json
{
  "success": true,
  "message": "Waitlist statistics retrieved successfully",
  "data": {
    "total": 150,
    "tripTypeStats": [
      {
        "_id": "Adventure Travel",
        "count": 45
      },
      {
        "_id": "Cultural Tours",
        "count": 38
      },
      {
        "_id": "Beach Vacations",
        "count": 32
      }
    ],
    "recentEntries": [
      {
        "_id": "64a1b2c3d4e5f6789012345",
        "name": "John Doe",
        "email": "john@example.com",
        "tripType": "Adventure Travel",
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

## Email Notifications

### User Confirmation Email
When someone joins the waitlist, they receive a beautiful confirmation email with:
- Welcome message
- Their waitlist details
- What to expect next
- Contact information

### Admin Notification Email
Admins receive an email notification at `timmycruz36@gmail.com` with:
- New waitlist entry details
- Recommended actions
- Quick access links to admin dashboard

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `409`: Conflict
- `500`: Internal Server Error

## Rate Limiting

The public waitlist endpoint may have rate limiting to prevent spam. Check with the development team for current limits.

## Data Validation

- **Email**: Must be a valid email format
- **Name**: Maximum 100 characters
- **Phone Number**: Maximum 20 characters
- **Trip Type**: Maximum 100 characters
- **Additional Information**: Maximum 1000 characters

## Security Notes

- Public endpoints don't require authentication
- Admin endpoints require valid admin authentication
- Email addresses are stored in lowercase
- Soft delete is used for removing entries
- Input validation prevents malicious data
