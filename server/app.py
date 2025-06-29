# server/app.py

from flask import request, session, make_response, jsonify
from flask_restful import Resource, Api
from flask_cors import CORS
from config import create_app, db
from models import User, Product, Order
from flask_bcrypt import Bcrypt
from math import radians, sin, cos, sqrt, atan2

app = create_app()
CORS(app, supports_credentials=True) # Enable CORS
api = Api(app)
bcrypt = Bcrypt(app)

# --- AUTHENTICATION ROUTES ---
class Signup(Resource):
    def post(self):
        data = request.get_json()
        try:
            new_user = User(
                username=data['username'],
                email=data['email'],
                password_hash=bcrypt.generate_password_hash(data['password']).decode('utf-8'),
                role=data.get('role', 'customer')
            )
            db.session.add(new_user)
            db.session.commit()
            session['user_id'] = new_user.id # Log in user upon successful registration
            return make_response(new_user.to_dict(), 201)
        except Exception as e:
            db.session.rollback()
            return make_response({"error": str(e)}, 400)

class Login(Resource):
    def post(self):
        data = request.get_json()
        user = User.query.filter_by(username=data['username']).first()
        if user and bcrypt.check_password_hash(user.password_hash, data['password']):
            session['user_id'] = user.id
            return make_response(user.to_dict(), 200)
        return make_response({"error": "Invalid username or password"}, 401)

class Logout(Resource):
    def delete(self):
        if 'user_id' in session:
            session.pop('user_id', None)
            return make_response({}, 204)
        return make_response({"error": "User not logged in"}, 401)
        
class CheckSession(Resource):
    def get(self):
        user = User.query.get(session.get('user_id'))
        if user:
            return make_response(user.to_dict(), 200)
        return make_response({}, 401)

# --- PRODUCT ROUTES (Full CRUD) ---
class Products(Resource):
    def get(self):
        products = [p.to_dict() for p in Product.query.all()]
        return make_response(jsonify(products), 200)

    def post(self):
        user_id = session.get('user_id')
        if not user_id:
            return make_response({"error": "Unauthorized"}, 401)
        user = User.query.get(user_id)
        if user.role != 'vendor':
            return make_response({"error": "Only vendors can create products"}, 403)
        
        data = request.get_json()
        try:
            new_product = Product(
                name=data['name'],
                description=data['description'],
                price=float(data['price']),
                image_url=data['image_url'],
                vendor_id=user_id
            )
            db.session.add(new_product)
            db.session.commit()
            return make_response(new_product.to_dict(), 201)
        except Exception as e:
            db.session.rollback()
            return make_response({"error": str(e)}, 400)

class ProductByID(Resource):
    def get(self, id):
        product = Product.query.get(id)
        if not product:
            return make_response({"error": "Product not found"}, 404)
        return make_response(product.to_dict(), 200)

    def patch(self, id):
        user_id = session.get('user_id')
        if not user_id:
            return make_response({"error": "Unauthorized"}, 401)
        
        product = Product.query.get(id)
        if not product:
            return make_response({"error": "Product not found"}, 404)
        if product.vendor_id != user_id:
            return make_response({"error": "Forbidden: You don't own this product"}, 403)
            
        data = request.get_json()
        try:
            for attr in data:
                setattr(product, attr, data[attr])
            db.session.commit()
            return make_response(product.to_dict(), 200)
        except Exception as e:
            db.session.rollback()
            return make_response({"error": str(e)}, 400)

    def delete(self, id):
        user_id = session.get('user_id')
        if not user_id:
            return make_response({"error": "Unauthorized"}, 401)

        product = Product.query.get(id)
        if not product:
            return make_response({"error": "Product not found"}, 404)
        if product.vendor_id != user_id:
            return make_response({"error": "Forbidden: You don't own this product"}, 403)
        
        db.session.delete(product)
        db.session.commit()
        return make_response({}, 204)

# --- ORDER ROUTES (Create and Read) ---
class Orders(Resource):
    def get(self):
        user_id = session.get('user_id')
        if not user_id:
            return make_response({"error": "Unauthorized"}, 401)
        user = User.query.get(user_id)
        orders = [order.to_dict(rules=('-products',)) for order in user.orders]
        return make_response(jsonify(orders), 200)

    def post(self):
        user_id = session.get('user_id')
        if not user_id:
            return make_response({"error": "Unauthorized"}, 401)
        
        data = request.get_json() # Expected: {"cart": [{"product_id": X, "quantity": Y}]}
        cart_items = data.get('cart')
        if not cart_items:
            return make_response({"error": "Cart is empty"}, 400)
        
        try:
            new_order = Order(customer_id=user_id)
            db.session.add(new_order)
            db.session.flush() # Flush to get new_order.id

            for item in cart_items:
                product = Product.query.get(item['product_id'])
                if not product:
                    raise ValueError(f"Product with id {item['product_id']} not found.")
                
                # Using the association table directly with the 'order_item' helper
                stmt = order_item.insert().values(
                    order_id=new_order.id, 
                    product_id=product.id, 
                    quantity=item['quantity']
                )
                db.session.execute(stmt)

            db.session.commit()
            return make_response(new_order.to_dict(), 201)
        except Exception as e:
            db.session.rollback()
            return make_response({"error": str(e)}, 400)

# --- VENDOR ROUTES (Read Only) ---
class Vendors(Resource):
    def get(self):
        vendors = User.query.filter_by(role='vendor').all()
        return make_response(jsonify([v.to_dict(rules=('-orders',)) for v in vendors]), 200)

class VendorByID(Resource):
     def get(self, id):
        vendor = User.query.filter_by(id=id, role='vendor').first()
        if not vendor:
            return make_response({"error": "Vendor not found"}, 404)
        return make_response(vendor.to_dict(rules=('-orders',)), 200)

#Location route
class NearbyVendors(Resource):
    def get(self):
        # Get parameters from request
        lat = float(request.args.get('lat'))
        lng = float(request.args.get('lng'))
        radius = float(request.args.get('radius', 10))  # default 10km
        
        # Calculate distance for each vendor
        vendors = User.query.filter_by(role='vendor').all()
        nearby_vendors = []
        
        for vendor in vendors:
            if vendor.latitude and vendor.longitude:
                # Haversine formula to calculate distance
                R = 6371.0  # Earth radius in km
                
                lat1 = radians(lat)
                lon1 = radians(lng)
                lat2 = radians(vendor.latitude)
                lon2 = radians(vendor.longitude)
                
                dlon = lon2 - lon1
                dlat = lat2 - lat1
                
                a = sin(dlat / 2)**2 + cos(lat1) * cos(lat2) * sin(dlon / 2)**2
                c = 2 * atan2(sqrt(a), sqrt(1 - a))
                distance = R * c
                
                if distance <= radius:
                    vendor_data = vendor.to_dict()
                    vendor_data['distance'] = distance
                    nearby_vendors.append(vendor_data)
        
        return make_response(jsonify(nearby_vendors), 200)

class Messages(Resource):
    def get(self):
        user_id = session.get('user_id')
        if not user_id:
            return make_response({"error": "Unauthorized"}, 401)
        
        # Get conversations for current user
        conversations = db.session.query(
            Message,
            User.username.label('partner_name')
        ).join(
            User,
            (User.id == Message.sender_id) | (User.id == Message.recipient_id)
        ).filter(
            (Message.sender_id == user_id) | (Message.recipient_id == user_id),
            User.id != user_id
        ).order_by(
            Message.timestamp.desc()
        ).all()
        
        # Format response
        conversations_dict = {}
        for msg, partner_name in conversations:
            partner_id = msg.recipient_id if msg.sender_id == user_id else msg.sender_id
            if partner_id not in conversations_dict:
                conversations_dict[partner_id] = {
                    'partner_id': partner_id,
                    'partner_name': partner_name,
                    'last_message': msg.content,
                    'timestamp': msg.timestamp.isoformat(),
                    'unread': False
                }
        
        return make_response(jsonify(list(conversations_dict.values())), 200)

    def post(self):
        user_id = session.get('user_id')
        if not user_id:
            return make_response({"error": "Unauthorized"}, 401)
        
        data = request.get_json()
        try:
            new_message = Message(
                content=data['content'],
                sender_id=user_id,
                recipient_id=data['recipient_id']
            )
            db.session.add(new_message)
            db.session.commit()
            
            # For real-time updates, we'd typically use WebSocket here
            return make_response(new_message.to_dict(), 201)
        except Exception as e:
            db.session.rollback()
            return make_response({"error": str(e)}, 400)

class MessagesBetween(Resource):
    def get(self, user_id):
        current_user_id = session.get('user_id')
        if not current_user_id:
            return make_response({"error": "Unauthorized"}, 401)
        
        messages = Message.query.filter(
            ((Message.sender_id == current_user_id) & (Message.recipient_id == user_id)) |
            ((Message.sender_id == user_id) & (Message.recipient_id == current_user_id))
        ).order_by(Message.timestamp.asc()).all()
        
        # Mark messages as read
        Message.query.filter_by(recipient_id=current_user_id, sender_id=user_id, read=False).update({'read': True})
        db.session.commit()
        
        return make_response(jsonify([m.to_dict() for m in messages]), 200)

# Add resources to API
api.add_resource(Signup, '/signup', endpoint='signup')
api.add_resource(Login, '/login', endpoint='login')
api.add_resource(Logout, '/logout', endpoint='logout')
api.add_resource(CheckSession, '/check_session', endpoint='check_session')
api.add_resource(Products, '/products', endpoint='products')
api.add_resource(ProductByID, '/products/<int:id>', endpoint='product_by_id')
api.add_resource(Orders, '/orders', endpoint='orders')
api.add_resource(Vendors, '/vendors', endpoint='vendors')
api.add_resource(VendorByID, '/vendors/<int:id>', endpoint='vendor_by_id')
api.add_resource(NearbyVendors, '/vendors/nearby', endpoint='nearby_vendors')
api.add_resource(Messages, '/messages', endpoint='messages')
api.add_resource(MessagesBetween, '/messages/<int:user_id>', endpoint='messages_between')

if __name__ == '__main__':
    app.run(port=5555, debug=True)