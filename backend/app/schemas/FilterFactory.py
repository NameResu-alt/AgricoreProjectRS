from fastapi import HTTPException

from app.models import Base, User
from typing import Any, TYPE_CHECKING
from sqlalchemy.orm.attributes import InstrumentedAttribute
from sqlalchemy import ColumnElement, Integer, Float, String, Text, Boolean, DateTime

if TYPE_CHECKING:
    from app.schemas import Filter

"""
export const numeric_operators = ["=", "!=", ">", ">=", "<", "<="]
export const string_operators = ["contains", "does not contain", "equals", "does not equal", "starts with", "ends with"]
export const date_operators = ["before", "after", "on"]
"""

def createFilter(filter: Filter, model: type[Base]) -> ColumnElement[bool] | None:
    column: InstrumentedAttribute[Any] = getattr(model, filter.field)

    column_type = column.property.columns[0].type
    python_type = column_type.python_type

    if python_type in (int, float):
        try:
            value: float = float(filter.value)
        except:
            raise HTTPException(
                status_code=422,
                detail=f"The field {filter.field} was not provided the right type {python_type}"
            )
        match filter.operator:
            case "=":
                return column == value
            case "!=":
                return column != value
            case ">":
                return column > value
            case "<":
                return column < value
            case ">=":
                return column >= value
            case "<=":
                return column <= value
            case _:
                raise ValueError(f"Invalid operator: {filter.operator}")
    elif python_type is str:
        print("Did do a string")
        match filter.operator:
            case "contains":
                print("Did the expected one")
                return column.like(f"%{filter.value}%")
            case "does not contain":
                return column.not_ilike(f"%{filter.value}%")
            case "equals":
                return column == filter.value
            case "does not equal":
                return column != filter.value
            case "starts with":
                return column.startswith(filter.value)
            case "ends with":
                return column.endswith(filter.value)
        pass
    elif python_type is bool:

        value: bool = True if filter.value == "True" else False
        return column == value
        pass
    else:
        print(f"Ignoring Filter {filter.field} due to Type: {python_type}")
        pass

    return None