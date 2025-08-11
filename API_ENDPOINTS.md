# TourBirth Travel Booking System API Documentation

## Overview
This API provides endpoints for managing a travel booking system with user profiles, admin management, destinations, bookings, companions, and document management.

## Base URL
```
http://localhost:3000/api
```

## Authentication
Most endpoints require authentication via JWT token in cookies or Authorization header.

## Endpoints

### 1. User Authentication
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password
- `POST /auth/verify-account` - Verify account with OTP
- `POST /auth/resend-verification` - Resend verification OTP
- `POST /auth/logout` - User logout

### 2. Admin Authentication
- `POST /admin/auth/signup` - Admin registration
- `POST /admin/auth/login` - Admin login
- `POST /admin/auth/forgot-password` - Admin password reset request
- `POST /admin/auth/reset-password` - Admin password reset
- `POST /admin/auth/verify-account` - Admin account verification
- `POST /admin/auth/resend-verification` - Resend admin verification OTP
- `POST /admin/auth/logout` - Admin logout

### 3. Companion Authentication
- `POST /companion/complete-registration` - Complete companion registration
- `POST /companion/login` - Companion temporary login

### 4. User Profile Management
- `PUT /user/profile` - Update own profile
- `GET /auth/profile` - Get own profile
- `PUT /auth/profile-picture` - Update profile picture

### 5. Admin Management

#### Destinations
- `POST /admin/destinations` - Create destination
- `GET /admin/destinations` - Get all destinations
- `GET /admin/destinations/:id` - Get destination by ID
- `PUT /admin/destinations/:id` - Update destination
- `DELETE /admin/destinations/:id` - Delete destination

#### Bookings
- `POST /admin/bookings` - Create booking
- `POST /admin/bookings/:bookingId/companions` - Add companions to booking
- `PUT /admin/bookings/:bookingId/status` - Update booking status
- `GET /admin/bookings` - Get all bookings (with pagination and filters)
- `GET /admin/bookings/:bookingId` - Get booking by ID

#### Dashboard
- `GET /admin/dashboard/stats` - Get dashboard statistics
- `GET /admin/dashboard/users` - Get all users (with pagination and search)

#### User Profile Management
- `PUT /admin/profiles/user/:userId` - Update user profile (admin only)
- `PUT /admin/profiles/admin` - Update admin own profile
- `GET /admin/profiles/user/:userId` - Get user profile by ID

#### Document Management
- `POST /admin/documents/:bookingId/documents` - Upload documents to booking
- `POST /admin/documents/:bookingId/itineraries` - Upload itineraries to booking
- `DELETE /admin/documents/:bookingId/documents/:documentIndex` - Remove document
- `DELETE /admin/documents/:bookingId/itineraries/:itineraryIndex` - Remove itinerary

#### Media Upload
- `POST /admin/upload-media` - Upload media files

## Data Models

### User Profile Fields
- `firstName` (required)
- `surname` (required)
- `middleName` (optional)
- `fullName` (optional)
- `email` (required, unique)
- `password` (required)
- `phoneNumber` (required)
- `gender` (required)
- `dateOfBirth` (optional)
- `maritalStatus` (optional) - enum: single, married, divorced, widowed, other
- `anniversaryDate` (optional)
- `address` (optional)
- `instagramUsername` (optional)
- `profilePicture` (optional)
- `role` (required) - enum: user, admin

### Companion Fields
- `firstName` (required)
- `lastName` (required)
- `relationship` (required) - enum: friend, family, spouse, colleague, other
- `email` (required)
- `phoneNumber` (required)
- `isRegistered` (boolean)
- `tempPassword` (optional)
- `userId` (required) - reference to main user

### Booking Fields
- `bookingId` (auto-generated) - TB- prefixed unique ID
- `packageName` (auto-generated) - TB- prefixed package name
- `userId` (required) - reference to main user
- `companions` (array) - array of companion IDs
- `status` (required) - enum: paid, cancelled, pending
- `destination` (required) - reference to destination
- `travelDate` (required)
- `returnDate` (required)
- `bookingDate` (auto-generated)
- `amount` (required)
- `description` (required)
- `documents` (array) - array of document objects
- `itineraries` (array) - array of itinerary objects
- `isActive` (boolean)

### Destination Fields
- `city` (required)
- `country` (required)
- `isActive` (boolean)

### Document/Itinerary Fields
- `name` (required)
- `size` (required)
- `type` (required)
- `link` (required)

## Booking Status Values
- `pending` - Initial status when booking is created
- `paid` - Payment completed
- `cancelled` - Booking cancelled

## Marital Status Values
- `single`
- `married`
- `divorced`
- `widowed`
- `other`

## Relationship Types
- `friend`
- `family`
- `spouse`
- `colleague`
- `other`

## File Upload Limits
- Maximum file size: 10MB
- Supported file types: PDF, DOC, DOCX, JPEG, PNG, GIF, TXT
- Maximum files per upload: 10

## Pagination
Endpoints that support pagination accept:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

## Search and Filtering
- User search: by firstName, surname, or email
- Booking search: by packageName or bookingId
- Booking filters: by status, packageName

## Response Format
All API responses follow this format:
```json
{
  "success": true/false,
  "message": "Response message",
  "data": {}, // or specific field names
  "pagination": {} // for paginated responses
}
```

## Error Handling
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

## Environment Variables Required
- `JWT_SECRET` - JWT signing secret
- `AWS_ACCESS_KEY_ID` - AWS S3 access key
- `AWS_SECRET_ACCESS_KEY` - AWS S3 secret key
- `AWS_REGION` - AWS region
- `S3_BUCKET_NAME` - S3 bucket name
- `MJ_APIKEY_PUBLIC` - Mailjet public API key
- `MJ_APIKEY_PRIVATE` - Mailjet private API key
- `FRONTEND_URL` - Frontend application URL

## Usage Examples

### Create a Destination
```bash
curl -X POST http://localhost:3000/api/admin/destinations \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"city": "Paris", "country": "France"}'
```

### Create a Booking
```bash
curl -X POST http://localhost:3000/api/admin/bookings \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_id_here",
    "destinationId": "destination_id_here",
    "travelDate": "2024-06-01",
    "returnDate": "2024-06-07",
    "amount": 1500,
    "description": "Weekend trip to Paris",
    "companions": [
      {
        "firstName": "John",
        "lastName": "Doe",
        "relationship": "friend",
        "email": "john@example.com",
        "phoneNumber": "+1234567890"
      }
    ]
  }'
```

### Upload Documents
```bash
curl -X POST http://localhost:3000/api/admin/documents/booking_id_here/documents \
  -H "Authorization: Bearer <token>" \
  -F "documents=@passport.pdf" \
  -F "documents=@visa.pdf"
```

## Notes
- All dates should be in ISO 8601 format (YYYY-MM-DD)
- File uploads use multipart/form-data
- Authentication tokens are automatically handled via cookies
- Companion accounts are created automatically when added to bookings
- Temporary passwords are generated automatically for companions
- Email notifications are sent to companions when they're added to trips 