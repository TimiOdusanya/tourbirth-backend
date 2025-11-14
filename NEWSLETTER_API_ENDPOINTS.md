# Newsletter API Endpoints

## Public Endpoints (No Authentication Required)

### Subscribe to Newsletter
- **POST** `/newsletter/subscribe`
- **Description**: Subscribe to the newsletter with email
- **Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response** (201):
  ```json
  {
    "success": true,
    "message": "Successfully subscribed to newsletter! You'll receive updates about our latest trips and offers.",
    "data": {
      "id": "newsletter_id",
      "email": "user@example.com"
    }
  }
  ```

### Unsubscribe from Newsletter
- **POST** `/newsletter/unsubscribe`
- **Description**: Unsubscribe from the newsletter
- **Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response** (200):
  ```json
  {
    "success": true,
    "message": "Successfully unsubscribed from newsletter"
  }
  ```

## Admin Endpoints (Authentication Required)

### Get All Newsletter Subscriptions
- **GET** `/newsletter/`
- **Description**: Get all newsletter subscriptions with pagination and filtering
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
  - `search` (optional): Search by email
  - `isActive` (optional): Filter by active status (default: true)
- **Response** (200):
  ```json
  {
    "success": true,
    "message": "Newsletter subscriptions retrieved successfully",
    "data": {
      "subscriptions": [...],
      "pagination": {
        "currentPage": 1,
        "totalPages": 5,
        "totalSubscriptions": 50,
        "hasNextPage": true,
        "hasPrevPage": false
      }
    }
  }
  ```

### Get Newsletter Subscription by ID
- **GET** `/newsletter/:id`
- **Description**: Get a specific newsletter subscription
- **Response** (200):
  ```json
  {
    "success": true,
    "message": "Newsletter subscription retrieved successfully",
    "data": {
      "id": "newsletter_id",
      "email": "user@example.com",
      "isActive": true,
      "subscribedAt": "2024-01-01T00:00:00.000Z",
      "unsubscribedAt": null
    }
  }
  ```

### Get Newsletter Statistics
- **GET** `/newsletter/stats`
- **Description**: Get newsletter subscription statistics
- **Response** (200):
  ```json
  {
    "success": true,
    "message": "Newsletter statistics retrieved successfully",
    "data": {
      "total": 150,
      "recentSubscriptions": [...]
    }
  }
  ```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Email is required"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "This email is already subscribed to our newsletter!"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to subscribe to newsletter. Please try again later."
}
```
