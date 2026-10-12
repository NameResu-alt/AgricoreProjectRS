from fastapi import HTTPException, Query
from pydantic import BaseModel, ValidationError
from typing import Annotated, Any, Generic, Literal, TypeVar
from sqlalchemy import desc, asc, and_, or_

from app.models import Base
from .FilterFactory import createFilter

class Page(BaseModel):
    page: int
    pageNumber: int

class Sort(BaseModel):
    field: str
    direction: str

class Filter(BaseModel):
    field: str
    operator: str
    value: str


class DataEnvelope[T](BaseModel):
    total: int
    data: list[T]

class DataQuery:
    def __init__(
            self,
            model: type[Base],
            schema: type[BaseModel],
            page: Annotated[int, Query(ge=0)] = 0,
            page_size: Annotated[int, Query(alias="pageSize", gt=0)] = 5,
            sort: Annotated[list[str] | None, Query()] = None,
            filter: Annotated[list[str] | None, Query()] = None,
            filter_mode: Annotated[
                Literal["and","or"],
                Query(),
            ] = "and"
    ):
            print(f"filter_mode received: {filter_mode!r}")
            self.page = page
            self.page_size = page_size
            self.filter_mode = filter_mode
            self.sort = self._parse(sort or [], Sort)
            self.filter = self._parse(filter or [], Filter)

            self.field_names = set(schema.model_fields)
            for item in [*self.sort, *self.filter]:
                if item.field not in self.field_names:
                    raise HTTPException(
                        status_code=422,
                        detail=f"Unknown field: {item.field}"
                    )

            self.generateSort(model)
            self.generateFilter(model)

    def generateSort(self, model: type[Base]):
        self.sortQueries = []
        for sort in self.sort:
            column = getattr(model, sort.field)
            if sort.direction == "asc":
                self.sortQueries.append(asc(column))
                pass
            else:
                self.sortQueries.append(desc(column))
                pass
    def generateFilter(self, model: type[Base]):
        prepQueries = []
        for filter in self.filter:

            generated_filter = createFilter(filter, model)
            if generated_filter is None:
                continue

            prepQueries.append(generated_filter)
        print(f"Filter mode: {self.filter_mode}")
        self.filterQuery = and_(*prepQueries) if self.filter_mode == "and" else or_(*prepQueries)

    @staticmethod
    def _parse(values: list[str], model: type[BaseModel]):
        parsed = []

        for value in values:
            try:       
                parsed.append(model.model_validate_json(value))
            except (ValidationError, ValueError):
                raise HTTPException(
                    status_code=422,
                    detail=f"Invalid query parameter: {value}"
                )
        return parsed