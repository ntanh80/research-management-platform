from typing import Any, Optional
from pydantic import BaseModel


class BaseFilter(BaseModel):
    keyword: Optional[str] = None
    status: Optional[str] = None
    date_from: Optional[str] = None
    date_to: Optional[str] = None
    sort_by: Optional[str] = None
    sort_order: Optional[str] = "ASC"
    page: int = 1
    page_size: int = 20


def apply_filters(query, model, filters: BaseFilter):
    if filters.keyword:
        search_fields = ["name", "full_name", "title", "code", "email"]
        from app.common.query_builder import apply_search

        query = apply_search(query, model, filters.keyword, search_fields)
    if filters.status:
        if hasattr(model, "status"):
            query = query.filter(model.status == filters.status)
    return query
