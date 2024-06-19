# I want to create a class to represent money in python
# this class should use decimal to represent the amount

from decimal import Decimal

from ..schemas.protocol import Currency


class Money:
    def __init__(self, amount: Decimal, currency: Currency):
        self.amount = amount
        self.currency = currency

    def __add__(self, other):
        if self.currency != other.currency:
            raise ValueError("Cannot add different currencies")
        return Money(self.amount + other.amount, self.currency)

    def __sub__(self, other):
        if self.currency != other.currency:
            raise ValueError("Cannot subtract different currencies")
        return Money(self.amount - other.amount, self.currency)

    def __mul__(self, other):
        if not isinstance(other, Decimal):
            raise ValueError("Can only multiply by a Decimal")
        return Money(self.amount * other, self.currency)

    def __truediv__(self, other):
        if not isinstance(other, Decimal):
            raise ValueError("Can only divide by a Decimal")
        return Money(self.amount / other, self.currency)

    def __str__(self):
        return f"{self.amount} {self.currency}"
