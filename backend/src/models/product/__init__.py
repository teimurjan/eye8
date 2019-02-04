from sqlalchemy import Column, String, Integer, ForeignKey, orm
from src.models.base import BaseModel


class Product(BaseModel):
    __tablename__ = 'product'

    discount = Column(Integer, default=0)
    price = Column(Integer, nullable=False)
    quantity = Column(Integer, default=0)
    product_type_id = Column(
        Integer,
        ForeignKey(
            'product_type.id'
        ),
        nullable=False
    )
    images = orm.relationship(
        'ProductImage',
        backref='product',
        lazy=True
    )
