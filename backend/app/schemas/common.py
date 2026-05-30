from math import ceil
from typing import Generic, List, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class Page(BaseModel, Generic[T]):
    """Generic paginated response envelope."""

    items: List[T]
    total: int
    page: int
    page_size: int
    total_pages: int


def paginate(items: List[T], total: int, page: int, page_size: int) -> dict:
    """Build the Page payload from a slice of items + total count."""
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": ceil(total / page_size) if page_size else 1,
    }
