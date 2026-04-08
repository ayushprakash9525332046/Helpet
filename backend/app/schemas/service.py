from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime


class ServiceCategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None


class ServiceCategoryResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    order: int = 0
    is_active: bool

    class Config:
        from_attributes = True


class CategoryReorderItem(BaseModel):
    id: UUID
    order: int


class ServiceCreate(BaseModel):
    category_id: UUID
    name: str
    description: Optional[str] = None
    price: float
    duration_minutes: int = 60
    image: Optional[str] = None


class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    duration_minutes: Optional[int] = None
    is_active: Optional[bool] = None


class ServiceResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    price: float
    duration_minutes: int
    is_active: bool
    image: Optional[str] = None
    category: ServiceCategoryResponse

    class Config:
        from_attributes = True
