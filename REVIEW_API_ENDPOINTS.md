# Review API Endpoints Documentation

## Overview
This document describes the CRUD API endpoints for managing user reviews in the Tourbirth application. Reviews are user-focused and require admin approval before being visible to the public.

## Review Model
```typescript
interface IReview {
  fullName: string;        // User's full name
  review: string;          // Review text (max 1000 chars)
  rating: number;          // Rating from 1-5
  images: IReviewImage[];  // Array of review images
  userId: ObjectId;        // Reference to user account
  isActive: boolean;       // Admin can toggle this (default: true)
  isApproved: boolean;     // Admin approval required (default: false)
  createdAt: Date;         // Auto-generated
  updatedAt: Date;         // Auto-generated
}

interface IReviewImage {
  name: string;    // Image filename
  size: number;    // Image size in bytes
  type: string;    // MIME type
  link: string;    // Image URL
}
```

## User Endpoints (Authentication Required)

### 1. Create Review
**POST** `/api/v1/reviews`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "fullName": "John Doe",
  "review": "Amazing experience! Highly recommended.",
  "rating": 5,
  "images": [
    {
      "name": "review1.jpg",
      "size": 1024000,
      "type": "image/jpeg",
      "link": "https://example.com/images/review1.jpg"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Review created successfully",
  "review": {
    "_id": "64a1b2c3d4e5f6789012345",
    "fullName": "John Doe",
    "review": "Amazing experience! Highly recommended.",
    "rating": 5,
    "images": [...],
    "userId": "64a1b2c3d4e5f6789012346",
    "isActive": true,
    "isApproved": false,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. Get My Reviews
**GET** `/api/v1/reviews/my/reviews?page=1&limit=10`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "reviews": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalReviews": 25,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### 3. Update Review
**PUT** `/api/v1/reviews/:reviewId`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "fullName": "John Doe Updated",
  "review": "Updated review text",
  "rating": 4,
  "images": [...]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Review updated successfully",
  "review": {...}
}
```

### 4. Delete Review
**DELETE** `/api/v1/reviews/:reviewId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

## Public Endpoints (No Authentication Required)

### 1. Get All Reviews
**GET** `/api/v1/reviews?page=1&limit=10&rating=5&search=amazing`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `rating` (optional): Filter by rating (1-5)
- `search` (optional): Search in fullName and review text

**Note:** Only approved and active reviews are returned to users.

**Response:**
```json
{
  "success": true,
  "reviews": [...],
  "pagination": {...}
}
```

### 2. Get Review by ID
**GET** `/api/v1/reviews/:reviewId`

**Response:**
```json
{
  "success": true,
  "review": {...}
}
```

### 3. Get Review Statistics
**GET** `/api/v1/reviews/stats`

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalReviews": 150,
    "averageRating": 4.2,
    "ratingDistribution": {
      "1": 5,
      "2": 10,
      "3": 25,
      "4": 60,
      "5": 50
    }
  }
}
```

## Admin Endpoints (Admin Authentication Required)

### 1. Get All Reviews for Admin
**GET** `/api/v1/admin/reviews?page=1&limit=10&isApproved=false&isActive=true`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `rating` (optional): Filter by rating (1-5)
- `isApproved` (optional): Filter by approval status
- `isActive` (optional): Filter by active status
- `search` (optional): Search in fullName and review text

### 2. Approve Review
**PATCH** `/api/v1/admin/reviews/:reviewId/approve`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Review approved successfully",
  "review": {...}
}
```

### 3. Reject Review
**PATCH** `/api/v1/admin/reviews/:reviewId/reject`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Review rejected successfully",
  "review": {...}
}
```

### 4. Toggle Review Active Status
**PATCH** `/api/v1/admin/reviews/:reviewId/toggle-active`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Review activated successfully",
  "review": {...}
}
```

### 5. Delete Review (Admin - Hard Delete)
**DELETE** `/api/v1/admin/reviews/:reviewId`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

### 6. Get Review Statistics for Admin
**GET** `/api/v1/admin/reviews/stats`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalReviews": 150,
    "approvedReviews": 135,
    "pendingReviews": 15,
    "activeReviews": 140,
    "inactiveReviews": 10,
    "averageRating": 4.2,
    "ratingDistribution": {
      "1": 5,
      "2": 10,
      "3": 25,
      "4": 60,
      "5": 50
    }
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Full name, review, and rating are required"
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
  "message": "Review not found"
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

1. **fullName**: Required, max 100 characters
2. **review**: Required, max 1000 characters
3. **rating**: Required, must be between 1 and 5
4. **images**: Optional array, each image must have name, size, type, and link

## Notes

- Reviews are user-focused and require admin approval before being visible publicly
- Users can only update/delete their own reviews
- Reviews are active by default when created
- Only approved and active reviews are shown to users
- Users can see all their own reviews regardless of approval status
- Admins can manage all reviews including approval/rejection and activation/deactivation
- Admin can perform hard delete (permanent removal) or toggle active status
- Review statistics include comprehensive metrics for admin dashboard
- Pagination is available for all list endpoints
