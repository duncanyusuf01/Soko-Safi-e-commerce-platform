Soko Safi - Local Vendor E-Commerce Platform
Overview
Soko Safi is a digital marketplace connecting local vendors with nearby customers. The platform enables vendors to showcase products while allowing customers to discover, purchase, and chat with sellers in their community. Features include geolocation-based vendor discovery, real-time messaging, shopping cart functionality, and order management - all designed to boost local economic growth.

Installation Guide
Prerequisites
Node.js (v14+)
Python (v3.8+)
PostgreSQL or SQLite

**Backend Setup**
Clone the repository:
git clone https://github.com/yourusername/soko-safi.git
cd soko-safi/server
Create and activate virtual environment:
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate    # Windows


**Install dependencies:**
pip install -r requirements.txt
**Set up database:**
flask db init
flask db migrate
flask db upgrade
**Seed sample data:**
python seed.py

Start the server:
flask run
Frontend Setup
Navigate to client directory:

bash
cd ../client
Install dependencies:

bash
npm install
Start the React app:
npm start

**Configuration**

Create .env file in /server:
DB_URI=sqlite:///instance/app.db
SECRET_KEY=your-secret-key-here


For production, configure:
Database connection string
JWT secret key
CORS settings

**Running the Application**
Start backend server: cd server && flask run

Start frontend development server: cd client && npm start

Access the application at: http://localhost:3000

**Features**
User authentication (vendors/customers)
Product management (CRUD operations)
Location-based vendor discovery
Shopping cart and order system
Real-time messaging
Responsive design

**Technologies Used**
**Frontend:**
React.js
React Router
Context API
CSS/HTML

**Backend:**
Python Flask
SQLAlchemy
Flask-RESTful
JWT Authentication

**Database**:PostgreSQL/SQLite
