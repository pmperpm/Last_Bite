# Last Bite - API Documentation

Base URL: `/api/` (or `http://localhost:8000/api/` during local development)

## Authentication (JWT)

All protected endpoints require an `Authorization` header with a valid JWT access token:
`Authorization: Bearer <your_access_token>`

### 1. Obtain Token (Login)
*   **URL:** `/api/token/`
*   **Method:** `POST`
*   **Body:**
    ```json
    {
      "email": "user@example.com",
      "password": "yourpassword"
    }
    ```
*   **Success Response:** `200 OK` (Returns `access` and `refresh` tokens)

### 2. Refresh Token
*   **URL:** `/api/token/refresh/`
*   **Method:** `POST`
*   **Body:**
    ```json
    {
      "refresh": "<refresh_token>"
    }
    ```
*   **Success Response:** `200 OK` (Returns new `access` token)

---

## Meals API

Endpoints for managing surplus food listings.

### 1. List / Create Meals
*   **URL:** `/api/meals/`
*   **Method:** `GET` | `POST`
*   **Auth Required:** Yes
*   **Body (POST):**
    ```json
    {
      "name": "Surplus Bread",
      "description": "Freshly baked bread from today",
      "price": "5.00",
      "quantity_total": 10,
      "quantity_remaining": 10,
      "pickup_start_time": "2024-04-11T18:00:00Z",
      "pickup_end_time": "2024-04-11T20:00:00Z"
    }
    ```

### 2. Retrieve / Update / Delete Meal
*   **URL:** `/api/meals/<id>/`
*   **Method:** `GET` | `PUT` | `PATCH` | `DELETE`

### 3. Mark Meal as Published
*   **URL:** `/api/meals/<id>/mark_published/`
*   **Method:** `POST`
*   **Description:** Transitions meal status to `PUBLISHED` making it visible to consumers.
*   **Success Response:** `200 OK`

### 4. Mark Meal as Cancelled
*   **URL:** `/api/meals/<id>/mark_cancelled/`
*   **Method:** `POST`
*   **Description:** Cancels the meal listing.

---

## Bookings API

Endpoints for consumers booking meals and managing the booking lifecycle (State Machine).

### 1. List / Create Bookings
*   **URL:** `/api/bookings/`
*   **Method:** `GET` | `POST`
*   **Body (POST):**
    ```json
    {
      "meal": 1,
      "quantity": 2
    }
    ```

### 2. Retrieve Booking
*   **URL:** `/api/bookings/<id>/`
*   **Method:** `GET`

### 3. Booking State Transitions (Custom Actions)

All state transitions are `POST` requests to `/api/bookings/<id>/<action>/`.
If a transition is invalid based on the current state, it will return `400 Bad Request` with an error message (handled by the Business Logic Layer).

*   **Confirm Received:** `/api/bookings/<id>/confirm_received/`
    *   *Actor:* Business Owner
    *   *Effect:* Acknowledges the booking.
*   **Confirm Payment:** `/api/bookings/<id>/confirm_payment/`
    *   *Actor:* Business Owner
    *   *Effect:* Confirms the payment has been matched (often called automatically by Payment app).
*   **Mark Ready:** `/api/bookings/<id>/mark_ready/`
    *   *Actor:* Business Owner
    *   *Effect:* Marks the food as ready for pickup.
*   **Finish:** `/api/bookings/<id>/finish/`
    *   *Actor:* Consumer / Business Owner
    *   *Effect:* Completes the order once picked up.
*   **Cancel:** `/api/bookings/<id>/cancel/`
    *   *Actor:* Consumer / Business Owner
    *   *Effect:* Cancels the order and releases the meal quantity back.

---

## Payments API

Endpoints for Consumers to upload payment slips, and Businesses to verify/reject them.

### 1. List / Create Payments (Upload Slip)
*   **URL:** `/api/payments/`
*   **Method:** `GET` | `POST`
*   **Body (POST - form-data):**
    *   `booking`: `<booking_id>`
    *   `amount`: `10.00`
    *   `slip_image`: `<file>`

### 2. Verify Payment
*   **URL:** `/api/payments/<id>/verify/`
*   **Method:** `POST`
*   **Actor:** Business Owner
*   **Description:** Approves the payment slip. Automatically triggers the booking to confirm payment.
*   **Success Response:** `200 OK` (`{"status": "verified"}`)

### 3. Reject Payment
*   **URL:** `/api/payments/<id>/reject/`
*   **Method:** `POST`
*   **Actor:** Business Owner
*   **Body:**
    ```json
    {
      "reason": "Slip image is blurry or incorrect amount"
    }
    ```
*   **Success Response:** `200 OK` (`{"status": "rejected"}`)