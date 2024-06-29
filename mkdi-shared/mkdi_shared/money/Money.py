from decimal import Decimal

from ..schemas.protocol import Currency


class Money:

    # add a property called converted_amount that returns the amount converted to another currency

    def __init__(self, amount: Decimal, currency: Currency, rate, other_currency: Currency):
        self.amount = amount
        self.currency = currency
        self.rate = rate
        self.other_currency = other_currency

    @property
    def converted_amount(self):
        return self.amount * self.rate

    def __add__(self, other):
        if self.currency != other.currency:
            raise ValueError("Cannot add different currencies")

        return Money(self.amount + other.amount, self.currency, self.rate, self.other_currency)

    def __sub__(self, other):
        if self.currency != other.currency:
            raise ValueError("Cannot subtract different currencies")
        return Money(self.amount - other.amount, self.currency, self.rate, self.other_currency)

    def __mul__(self, other):
        if not isinstance(other, Decimal):
            raise ValueError("Can only multiply by a Decimal")
        return Money(self.amount * other, self.currency, self.rate, self.other_currency)

    def __truediv__(self, other):
        if not isinstance(other, Decimal):
            raise ValueError("Can only divide by a Decimal")
        return Money(self.amount / other, self.currency)

    def __str__(self):
        return f"{self.amount} {self.currency}"
