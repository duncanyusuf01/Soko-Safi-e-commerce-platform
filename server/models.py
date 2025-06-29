# server/models.py

from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.orm import validates
from sqlalchemy.ext.hybrid import hybrid_property
from .config import db, create_app

# Association Table for Many-to-Many relationship between Order and Product
order_item = db.Table(
    'order_items',
    db.Column('order_id', db.Integer, db.ForeignKey('orders.id'), primary_key=True),
    db.Column('product_id', db.Integer, db.ForeignKey('products.id'), primary_key=True),
    db.Column('quantity', db.Integer, nullable=False) # User-submittable attribute
)

class User(db.Model, SerializerMixin):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=True, nullable=False)
    email = db.Column(db.String, unique=True, nullable=False)
    password_hash = db.Column(db.String, nullable=False)
    role = db.Column(db.String, nullable=False) # 'vendor' or 'customer'
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    address = db.Column(db.String)

    # Relationships
    products = db.relationship('Product', back_populates='vendor', cascade='all, delete-orphan')
    orders = db.relationship('Order', back_populates='customer', cascade='all, delete-orphan')

    serialize_rules = ('-products.vendor', '-orders.customer', '-password_hash',)

    @validates('email')
    def validate_email(self, key, email):
        if '@' not in email:
            raise ValueError("Invalid email format")
        return email

    @validates('role')
    def validate_role(self, key, role):
        if role not in ['vendor', 'customer']:
            raise ValueError("Role must be 'vendor' or 'customer'")
        return role

class Message(db.Model, SerializerMixin):
    __tablename__ = 'messages'
    
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String, nullable=False)
    timestamp = db.Column(db.DateTime, server_default=db.func.now())
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    recipient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    read = db.Column(db.Boolean, default=False)
    
    # Relationships
    sender = db.relationship('User', foreign_keys=[sender_id], backref='sent_messages')
    recipient = db.relationship('User', foreign_keys=[recipient_id], backref='received_messages')
    
    serialize_rules = ('-sender.sent_messages', '-sender.received_messages',
                     '-recipient.sent_messages', '-recipient.received_messages')
    
    def to_dict(self):
        return {
            'id': self.id,
            'content': self.content,
            'timestamp': self.timestamp.isoformat(),
            'sender_id': self.sender_id,
            'recipient_id': self.recipient_id,
            'read': self.read,
            'sender_name': self.sender.username,
            'recipient_name': self.recipient.username
        }

class Product(db.Model, SerializerMixin):
    __tablename__ = 'products'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    description = db.Column(db.String)
    price = db.Column(db.Float, nullable=False)
    image_url = db.Column(db.String)
    vendor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # Relationships
    vendor = db.relationship('User', back_populates='products')
    
    serialize_rules = ('-vendor.products', '-vendor.orders')

    @validates('price')
    def validate_price(self, key, price):
        if not isinstance(price, (int, float)) or price <= 0:
            raise ValueError("Price must be a positive number")
        return price

class Order(db.Model, SerializerMixin):
    __tablename__ = 'orders'
    
    id = db.Column(db.Integer, primary_key=True)
    order_date = db.Column(db.DateTime, server_default=db.func.now())
    status = db.Column(db.String, default='Pending')
    customer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Relationships
    customer = db.relationship('User', back_populates='orders')
    products = db.relationship('Product', secondary=order_item, backref='orders')
    
    serialize_rules = ('-customer.orders', '-customer.products', '-products.orders')