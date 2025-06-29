# server/seed.py

from app import app, bcrypt  # Import bcrypt from app
from config import db
from models import User, Product, Order
from faker import Faker

faker = Faker()

def seed_data():
    with app.app_context():
        print("Clearing old data...")
        Product.query.delete()
        Order.query.delete()
        User.query.delete()
        db.session.commit()

        print("Seeding users (vendors and customers)...")
        users = []
        # Create vendors
        for i in range(5):
            vendor = User(
                username=faker.user_name(),
                email=faker.unique.email(),
                password_hash=bcrypt.generate_password_hash('password123').decode('utf-8'),  # Use bcrypt directly
                role='vendor'
            )
            users.append(vendor)
        
        # Create customers
        for i in range(10):
            customer = User(
                username=faker.user_name(),
                email=faker.unique.email(),
                password_hash=bcrypt.generate_password_hash('password123').decode('utf-8'),  # Use bcrypt directly
                role='customer'
            )
            users.append(customer)

        db.session.add_all(users)
        db.session.commit()

        print("Seeding products...")
        vendors = User.query.filter_by(role='vendor').all()
        products = []
        for vendor in vendors:
            for _ in range(faker.random_int(min=3, max=8)):
                product = Product(
                    name=faker.word().capitalize() + " " + faker.word().capitalize(),
                    description=faker.text(max_nb_chars=200),
                    price=round(faker.random_int(min=10, max=500) / 1.0, 2),
                    image_url=f"https://picsum.photos/seed/{faker.word()}/400/300",
                    vendor_id=vendor.id
                )
                products.append(product)
        
        db.session.add_all(products)
        db.session.commit()
        
        print("Database seeded successfully!")

if __name__ == '__main__':
    seed_data()