# Backend Documentation (`backend/`)

## Project Overview

This backend is built with **Node.js** + **Express** and uses **MongoDB** as the database via **Mongoose**.  
Authentication is handled with **JWT access tokens** (sent via `Authorization: Bearer <token>`) and an **httpOnly refresh token cookie**.

## Environment Variables

Create a `backend/.env` file with the following keys (values not shown here):

- **PORT**
- **MONGO_URI**
- **JWT_SECRET**
- **JWT_REFRESH_SECRET**
- **JWT_EXPIRES_IN**
- **JWT_REFRESH_EXPIRES_IN**
- **CLOUDINARY_CLOUD_NAME**
- **CLOUDINARY_API_KEY**
- **CLOUDINARY_API_SECRET**
- **SSLCOMMERZ_STORE_ID**
- **SSLCOMMERZ_STORE_PASS**
- **SSLCOMMERZ_IS_LIVE**
- **EMAIL_HOST**
- **EMAIL_PORT**
- **EMAIL_USER**
- **EMAIL_PASS**
- **CLIENT_URL**
- **ADMIN_URL**
- **BACKEND_URL**

## API Endpoints

Access levels:

- **Public**: no auth required
- **Private/User**: requires `Authorization: Bearer <accessToken>`
- **Admin**: requires auth + `req.user.role === "admin"`

### Auth (`/api/auth`)

#### **POST** `/api/auth/register` — **Public**
- **Body**:

```json
{ "name": "string", "email": "string", "password": "string" }
```

- **Description**: Creates a user, returns an access token, and sets `refreshToken` as an httpOnly cookie.

#### **POST** `/api/auth/login` — **Public**
- **Body**:

```json
{ "email": "string", "password": "string" }
```

- **Description**: Logs a user in, returns an access token, and sets `refreshToken` as an httpOnly cookie.

#### **POST** `/api/auth/refresh-token` — **Public**
- **Body**: none
- **Description**: Reads `refreshToken` from cookies, validates it, and returns a new access token.

#### **POST** `/api/auth/logout` — **Private/User**
- **Body**: none
- **Description**: Clears the refresh token in DB and clears the `refreshToken` cookie.

#### **POST** `/api/auth/forgot-password` — **Public**
- **Body**:

```json
{ "email": "string" }
```

- **Description**: Generates a reset token, stores its hash/expiry on the user, and emails a reset link to `${CLIENT_URL}/reset-password/<token>`.

#### **POST** `/api/auth/reset-password/:token` — **Public**
- **Body**:

```json
{ "password": "string" }
```

- **Description**: Resets password using the token (hashed match + expiry check).

---

### Users (`/api/users`)

#### **GET** `/api/users/me` — **Private/User**
- **Body**: none
- **Description**: Returns the current user (re-fetched, `-password`, wishlist populated).

#### **PUT** `/api/users/update` — **Private/User**
- **Body** (any subset):

```json
{
  "name": "string",
  "address": [
    {
      "fullName": "string",
      "phone": "string",
      "street": "string",
      "city": "string",
      "district": "string",
      "postalCode": "string",
      "isDefault": true
    }
  ]
}
```

- **Description**: Updates `name` and/or the `address` array and returns the updated user.

#### **PUT** `/api/users/change-password` — **Private/User**
- **Body**:

```json
{ "currentPassword": "string", "newPassword": "string" }
```

- **Description**: Verifies current password and sets a new password.

#### **GET** `/api/users` — **Admin**
- **Query params**:
  - `search` (optional): case-insensitive match on `name` or `email`
- **Description**: Returns all users excluding passwords.

#### **DELETE** `/api/users/:id` — **Admin**
- **Body**: none
- **Description**: Deletes a user by ID (cannot delete self).

---

### Products (`/api/products`)

#### **GET** `/api/products` — **Public**
- **Query params** (all optional):
  - `search`: regex search on `title` and `tags` (case-insensitive)
  - `category`: category **ObjectId** or **slug**
  - `brand`: brand **ObjectId**
  - `minPrice`: `price >= minPrice`
  - `maxPrice`: `price <= maxPrice`
  - `size`: `sizes` contains value
  - `color`: `colors` contains value
  - `isFeatured`: `"true"` or `"false"`
  - `sort`: `price_asc | price_desc | newest | popular` (default: `newest`)
  - `page`: pagination page (default: `1`)
  - `limit`: pagination limit (default: `12`)
- **Description**: Returns active products only (`isActive: true`) with category/brand populated (`name`, `slug`) and pagination metadata.

#### **GET** `/api/products/:id` — **Public**
- **Description**: Gets a product by ID. Populates category, brand, and `reviews.user` (name only). Returns 404 if not found or inactive.

#### **GET** `/api/products/slug/:slug` — **Public**
- **Description**: Gets a product by slug (same populate behavior as above). Returns 404 if not found or inactive.

#### **POST** `/api/products` — **Admin**
- **Body**:

```json
{
  "title": "string",
  "description": "string",
  "price": 0,
  "discountPrice": 0,
  "category": "CategoryObjectId",
  "brand": "BrandObjectId",
  "tags": ["string"],
  "images": ["string"],
  "sizes": ["string"],
  "colors": ["string"],
  "inventory": [{ "size": "string", "color": "string", "stock": 0 }],
  "stock": 0,
  "sku": "string",
  "isFeatured": false
}
```

- **Description**: Creates a product. Slug is auto-generated from title.

#### **PUT** `/api/products/:id` — **Admin**
- **Body**: any subset of product fields
- **Description**: Updates a product. If `title` changes, slug is regenerated.

#### **DELETE** `/api/products/:id` — **Admin**
- **Body**: none
- **Description**: **Soft delete** by setting `isActive = false` (does not remove from DB).

---

### Categories (`/api/categories`)

#### **GET** `/api/categories` — **Public**
- **Description**: Lists categories.

#### **GET** `/api/categories/:id` — **Public**
- **Description**: Gets a category by ID.

#### **POST** `/api/categories` — **Admin**
- **Body**:

```json
{ "name": "string", "image": "string" }
```

- **Description**: Creates a category; slug is auto-generated from name.

#### **PUT** `/api/categories/:id` — **Admin**
- **Body** (any subset):

```json
{ "name": "string", "slug": "string", "image": "string" }
```

- **Description**: Updates name/slug/image (slug re-generated if name changes).

#### **DELETE** `/api/categories/:id` — **Admin**
- **Description**: Deletes a category.

---

### Brands (`/api/brands`)

#### **GET** `/api/brands` — **Public**
- **Description**: Lists brands.

#### **GET** `/api/brands/:id` — **Public**
- **Description**: Gets a brand by ID.

#### **POST** `/api/brands` — **Admin**
- **Body**:

```json
{ "name": "string", "logo": "string" }
```

- **Description**: Creates a brand; slug is auto-generated from name.

#### **PUT** `/api/brands/:id` — **Admin**
- **Body** (any subset):

```json
{ "name": "string", "slug": "string", "logo": "string" }
```

- **Description**: Updates name/slug/logo (slug re-generated if name changes).

#### **DELETE** `/api/brands/:id` — **Admin**
- **Description**: Deletes a brand.

---

### Orders (`/api/orders`)

#### **POST** `/api/orders` — **Private/User**
- **Body**:

```json
{
  "items": [
    {
      "product": "ProductObjectId",
      "title": "string",
      "image": "string",
      "quantity": 0,
      "price": 0,
      "size": "string",
      "color": "string"
    }
  ],
  "shippingAddress": {
    "fullName": "string",
    "phone": "string",
    "street": "string",
    "city": "string",
    "district": "string",
    "postalCode": "string"
  },
  "paymentMethod": "SSLCommerz",
  "couponCode": "string",
  "discountAmount": 0,
  "shippingCharge": 0
}
```

- **Description**: Creates an order. Calculates `totalPrice` from items and `finalPrice = totalPrice - discountAmount + shippingCharge`. Sets `paymentStatus="pending"` and `orderStatus="pending"` (or `"processing"` immediately for COD).

#### **GET** `/api/orders/my` — **Private/User**
- **Description**: Lists current user’s orders (newest first). Populates `items.product` (`title`, `images`).

#### **GET** `/api/orders/my/:id` — **Private/User**
- **Description**: Gets one order if it belongs to the current user. Populates `items.product` (full) and `user` (`name`, `email`).

#### **GET** `/api/orders` — **Admin**
- **Query params**:
  - `status` (optional): filters by `orderStatus`
  - `page` (optional, default `1`)
  - `limit` (optional, default `20`)
- **Description**: Lists all orders with pagination. Populates `user` (`name`, `email`).

#### **PUT** `/api/orders/:id/status` — **Admin**
- **Body**:

```json
{ "orderStatus": "pending" }
```

- **Description**: Updates `orderStatus`. If set to `"delivered"`, sets `deliveredAt = now`.

#### **PUT** `/api/orders/:id/tracking` — **Admin**
- **Body**:

```json
{ "trackingNumber": "string" }
```

- **Description**: Sets/updates `trackingNumber`.

---

### Reviews (`/api/reviews`)

#### **POST** `/api/reviews` — **Private/User**
- **Body**:

```json
{ "productId": "ProductObjectId", "rating": 5, "comment": "string" }
```

- **Description**: Adds a review to a product (prevents duplicate review by the same user). Recalculates `ratings` (average) and `numReviews`.

#### **PUT** `/api/reviews/:reviewId` — **Private/User**
- **Body** (any subset):

```json
{ "rating": 4, "comment": "string" }
```

- **Description**: Edits **own** review, then recalculates product rating stats.

#### **DELETE** `/api/reviews/:reviewId` — **Private/User**
- **Description**: Deletes **own** review, then recalculates product rating stats.

#### **DELETE** `/api/reviews/admin/:reviewId` — **Admin**
- **Description**: Admin can delete any review, then recalculates product rating stats.

---

### Wishlist (`/api/wishlist`)

#### **GET** `/api/wishlist` — **Private/User**
- **Description**: Returns the user wishlist populated with product fields: `title`, `images`, `price`, `slug`.

#### **POST** `/api/wishlist/:productId` — **Private/User**
- **Description**: Adds product to wishlist if not already present. Returns updated wishlist.

#### **DELETE** `/api/wishlist/:productId` — **Private/User**
- **Description**: Removes product from wishlist. Returns updated wishlist.

---

### Coupons (`/api/coupons`)

#### **POST** `/api/coupons/apply` — **Private/User**
- **Body**:

```json
{ "code": "string", "orderTotal": 0 }
```

- **Description**: Validates coupon (active, not expired, min order met, usage limit not exceeded) and returns calculated discount + final price.

#### **GET** `/api/coupons` — **Admin**
- **Description**: Lists coupons.

#### **POST** `/api/coupons` — **Admin**
- **Body**: coupon fields (e.g. `code`, `type`, `discount`, `expiryDate`, etc.)
- **Description**: Creates a coupon. `code` is uppercased server-side.

#### **PUT** `/api/coupons/:id` — **Admin**
- **Body**: any subset of coupon fields
- **Description**: Updates a coupon. `code` is uppercased server-side if provided.

#### **DELETE** `/api/coupons/:id` — **Admin**
- **Description**: Deletes a coupon.

---

### Uploads (`/api/upload`)

#### **POST** `/api/upload` — **Admin**
- **Content-Type**: `multipart/form-data`
- **Form field**: `image` (file)
- **Description**: Uploads an image to Cloudinary via multer storage.
- **Response**:

```json
{ "success": true, "url": "string", "public_id": "string" }
```

#### **DELETE** `/api/upload` — **Admin**
- **Body**:

```json
{ "public_id": "string" }
```

- **Description**: Deletes an image from Cloudinary by `public_id`.

---

### Admin Dashboard (`/api/admin`)

#### **GET** `/api/admin/stats` — **Admin**
- **Description**: Returns summary stats:
  - `totalRevenue` = sum of `finalPrice` for paid orders
  - `totalOrders`
  - `totalUsers` (role `"user"`)
  - `totalProducts` (active)
  - `pendingOrders`

#### **GET** `/api/admin/recent-orders` — **Admin**
- **Description**: Latest 10 orders, populated `user (name, email)`.

#### **GET** `/api/admin/top-products` — **Admin**
- **Description**: Aggregates order items by product and returns top 5 by quantity sold.

#### **GET** `/api/admin/sales-chart` — **Admin**
- **Description**: Revenue + order count grouped by month for last 12 months.

---

### Payment (SSLCommerz) (`/api/payment`)

#### **POST** `/api/payment/init` — **Private/User**
- **Body**:

```json
{ "orderId": "OrderObjectId" }
```

- **Description**: Initializes SSLCommerz payment for an order belonging to the user and returns `GatewayPageURL`.

#### **POST** `/api/payment/success` — **Public**
- **Body** (from SSLCommerz):

```json
{ "val_id": "string", "tran_id": "string" }
```

- **Description**: Validates payment, marks order as paid/processing, sends confirmation email, redirects to frontend success page.

#### **POST** `/api/payment/fail` — **Public**
- **Body**:

```json
{ "tran_id": "string" }
```

- **Description**: Marks order payment as failed (if `tran_id` provided) and redirects to checkout with `status=failed`.

#### **POST** `/api/payment/cancel` — **Public**
- **Body**: none
- **Description**: Redirects to checkout with `status=cancelled`.

#### **POST** `/api/payment/ipn` — **Public**
- **Body**:

```json
{ "val_id": "string", "tran_id": "string" }
```

- **Description**: Backup listener; same validation + “mark paid” logic as success.

## Postman Testing Guide

- **Base URL**: `http://localhost:5000`
- **Protected routes**:
  - Add header **`Authorization: Bearer <accessToken>`**
  - For endpoints that use refresh tokens, ensure Postman is configured to **store cookies** (refresh token is set as an **httpOnly** cookie named `refreshToken`).
- **Admin routes**:
  - Use an access token for a user with `role: "admin"`.

