# Pizza Delivery

A web server application for a pizza delivery made using Flask with CRUD operations for pizza orders.


## Setup and Running

1. Clone the repository
2. Create and activate a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
4. Run the application:
   ```
   python app.py
   ```
5. Access the application at: http://localhost:8888

## Default Users

The application comes with two pre-configured user accounts:

- **Staff Account**:
  - Email: staff@pizza.com
  - Password: staff123

- **Customer Account**:
  - Email: customer@example.com
  - Password: customer123

## Features

- **User Authentication**
  - Login/logout functionality
  - Session based auth
  - User account creation
  - Role-based access (staff/customer)

- **Pizza Order Management**
  - View all orders
  - Create new pizza orders
  - Edit existing orders
  - Delete orders with confirmation
  - Automatic price calculations (subtotal, delivery fee, total)

## Tech Stack

- Flask Framework
- WTForms for form handling
- JSON
- Some JavaScript for client side
- HTMX for Frontend