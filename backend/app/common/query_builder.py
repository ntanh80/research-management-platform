from typing import Any, List, Optional
from sqlalchemy import or_
from sqlalchemy.orm import Query
from app.common.pagination import PaginationParams


def apply_search(
    query: Query, model: Any, keyword: str, search_fields: List[str]
) -> Query:
    if not keyword:
        return query
    filters = []
    for field in search_fields:
        column = getattr(model, field, None)
        if column is not None:
            filters.append(column.ilike(f"%{keyword}%"))
    if filters:
        query = query.filter(or_(*filters))
    return query


def apply_sorting(
    query: Query,
    model: Any,
    sort_by: Optional[str],
    sort_order: Optional[str],
    default_sort: str = "id",
) -> Query:
    order_col = getattr(
        model, sort_by or default_sort, getattr(model, default_sort)
    )
    if sort_order and sort_order.upper() == "DESC":
        query = query.order_by(order_col.desc())
    else:
        query = query.order_by(order_col.asc())
    return query


def apply_pagination(query: Query, pagination: PaginationParams) -> Query:
    return query.offset(pagination.offset).limit(pagination.limit)


def apply_soft_delete_filter(query: Query, model: Any) -> Query:
    if hasattr(model, "deleted_at"):
        query = query.filter(model.deleted_at.is_(None))
    return query
