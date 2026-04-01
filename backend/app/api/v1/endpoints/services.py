# /services/, /services/{id}

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.db.session import get_db
from app.models.service import Service, ServiceCategory
from app.models.user import User
from app.schemas.service import (
    ServiceCreate,
    ServiceUpdate,
    ServiceResponse,
    ServiceCategoryCreate,
    ServiceCategoryResponse,
)
from app.core.dependencies import get_current_user, get_current_admin

router = APIRouter()


# ── Categories ───────────────────────────────────────────────────


@router.get("/categories", response_model=List[ServiceCategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    return db.query(ServiceCategory).filter(ServiceCategory.is_active == True).all()


@router.post("/categories", response_model=ServiceCategoryResponse, status_code=201)
def create_category(
    data: ServiceCategoryCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    category = ServiceCategory(**data.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


# ── Services ─────────────────────────────────────────────────────


@router.get("/", response_model=List[ServiceResponse])
def get_services(category_id: UUID = None, db: Session = Depends(get_db)):
    query = db.query(Service).filter(Service.is_active == True)
    if category_id:
        query = query.filter(Service.category_id == category_id)
    return query.all()


@router.get("/{service_id}", response_model=ServiceResponse)
def get_service(service_id: UUID, db: Session = Depends(get_db)):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return service


@router.post("/", response_model=ServiceResponse, status_code=201)
def create_service(
    data: ServiceCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    category = (
        db.query(ServiceCategory).filter(ServiceCategory.id == data.category_id).first()
    )
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    service = Service(**data.model_dump())
    db.add(service)
    db.commit()
    db.refresh(service)
    return service


@router.put("/{service_id}", response_model=ServiceResponse)
def update_service(
    service_id: UUID,
    data: ServiceUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(service, key, value)
    db.commit()
    db.refresh(service)
    return service


@router.delete("/{service_id}", status_code=204)
def delete_service(
    service_id: UUID,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    service.is_active = False
    db.commit()
