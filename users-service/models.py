from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid

db = SQLAlchemy()

class Buyers(db.Model):
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)  # Auto-generated ID
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)  # Foreign key
    user = db.relationship('Users', backref=db.backref('buyers', lazy=True))  # Link to Users table

    def __repr__(self):
        return f'<Buyer {self.id}>'

class Sellers(db.Model):
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    user = db.relationship('Users', backref=db.backref('sellers', lazy=True))

    def __repr__(self):
        return f'<Seller {self.id}>'

    
class Users(db.Model):
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4) 

    def __repr__(self):
        return f'<User {self.id}>'
