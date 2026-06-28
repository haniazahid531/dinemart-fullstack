# DineMart - Food, Grocery, Dine-In & Delivery System

DineMart is a full-stack MERN project inspired by Foodpanda/Pandamart-style ordering, grocery shopping, dine-in food ordering, delivery tracking, and table reservation workflows. It is not only a CRUD app. It includes connected customer, admin, and rider dashboards using the same backend and MongoDB database.

## Main Idea

Customers can choose between:

- Restaurant food delivery
- Restaurant dine-in order with estimated waiting/preparation time
- Grocery shopping with cart checkout and rider delivery
- Table reservation with optional food pre-selection

Admin manages all requests, assigns riders for delivery orders, and updates statuses. Riders can view assigned deliveries and update delivery progress.

## Features

### Customer
- Register and login
- Browse restaurants and menu items
- Choose restaurant order mode: **Delivery** or **Dine-In**
- See estimated delivery/waiting time
- Browse grocery products by category with product photos
- Add food/grocery items to cart
- Increase, decrease, manually edit, or remove item quantities from product cards and cart page
- Clear full cart before checkout
- Checkout delivery orders with address and phone number
- Checkout dine-in food orders with guests and arrival time
- Track order status using a timeline
- View rider name and contact number once assigned
- Reserve a restaurant table
- Pre-select food items with table reservation
- View order and reservation history

### Admin
- View platform statistics
- View all customer orders
- See whether an order is Delivery, Dine-In, Grocery, Restaurant, or Mixed
- Accept, cancel, and update order statuses
- Assign rider to delivery orders only
- Update dine-in order statuses such as Preparing, Ready for Dine-In, and Served
- Manage reservation statuses
- See customer details, totals, delivery fees, waiting time, and order workflow

### Rider
- Login as rider
- View assigned delivery orders only
- See customer address and phone number
- Update delivery status: Picked Up, On the Way, Delivered

## Order Workflows

### Restaurant Delivery Flow

```txt
Customer selects restaurant delivery → adds food to cart → checkout with address → admin accepts → admin assigns rider → rider picks up → customer tracks delivery
```

### Restaurant Dine-In Flow

```txt
Customer selects dine-in → adds food to cart → checkout with guests/time → system shows estimated waiting time → admin updates status → customer sees Ready for Dine-In / Served
```

### Grocery Delivery Flow

```txt
Customer selects grocery items → adds to cart → checkout with address → admin assigns available rider → rider delivers to customer address
```

## Tech Stack

- Frontend: React.js, Vite, CSS with a premium food-delivery style UI
- Backend: Node.js, Express.js
- Database: MongoDB, Mongoose
- Authentication: JWT, bcryptjs
- Roles: Customer, Admin, Rider

## Project Structure

```txt
dinemart-fullstack/
├── client/
├── server/
├── README.md
├── package.json
└── .gitignore
```

## Setup Instructions

### 1. Install dependencies

```bash
npm run install-all
```

### 2. Create server environment file

Create a file named `.env` inside the `server` folder.

Use this format:

```env
PORT=5000
MONGO_URI=mongodb+srv://haniazahid531_db_user:YOUR_PASSWORD_HERE@donorhubcluster.6sliovq.mongodb.net/dinemart_system?retryWrites=true&w=majority&appName=DonorHubCluster
JWT_SECRET=dinemart_secret_123
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Replace `YOUR_PASSWORD_HERE` with your actual MongoDB Atlas password.

Important: do not upload your real `.env` file to GitHub.

### 3. Create client environment file

Create a file named `.env` inside the `client` folder.

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Seed demo data

```bash
npm run seed
```

This creates demo users, riders, restaurants, menu items, and grocery items only. It does **not** create demo orders or reservations, so the dashboards stay clean until you test the workflow yourself.

### 5. Run the project

```bash
npm run dev
```

Frontend:

```txt
http://localhost:5173
```

Backend:

```txt
http://localhost:5000
```

## Demo Logins

### Customer

```txt
Email: customer@example.com
Password: customer123
```

### Admin

```txt
Email: admin@example.com
Password: admin12345
```

### Rider

```txt
Email: rider@example.com
Password: rider12345
```


## Cart & Catalog Notes

- Once an item is added, the product card changes from **Add to Cart** to quantity controls.
- You can increase quantity with `+`, decrease with `-`, edit the quantity number manually, or remove the item with the trash icon.
- The cart page also has quantity controls, item removal, and clear cart.
- If grocery or restaurant products are not showing, run `npm run seed` once from the main project folder and refresh the app. The seed creates clean catalog data but no demo orders.

## Suggested Screenshots

Create a `screenshots` folder in the main project directory and add these screenshots:

```txt
01-home-page.png
02-restaurant-delivery-mode.png
03-restaurant-dine-in-mode.png
04-grocery-shopping-page.png
05-cart-checkout-delivery.png
06-cart-checkout-dine-in.png
07-customer-order-tracking.png
08-table-reservation.png
09-admin-dashboard-orders.png
10-admin-assign-rider.png
11-rider-dashboard.png
12-delivered-status.png
```

## Important Security Note

Do not upload your real `.env` file to GitHub. Only upload `.env.example`.

Your `.gitignore` should include:

```txt
node_modules
.env
server/.env
client/.env
dist
```

## Portfolio Description

DineMart is a full-stack food, grocery, dine-in, delivery, and reservation management system built using the MERN stack with a clean Foodpanda/Pandamart-style frontend. Customers can order restaurant food for delivery or dine-in, shop groceries, checkout with cart, track estimated time, view rider contact, and reserve tables. Admin can manage orders, assign riders, update delivery/dine-in statuses, and manage reservations. Riders can view assigned delivery orders and update delivery progress.
