# Create in-app notifications

from sqlalchemy.orm import Session
from app.models.notification import Notification, NotificationType


def create_notification(
    db: Session,
    user_id,
    title: str,
    message: str,
    type: NotificationType = NotificationType.GENERAL,
):
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=type,
    )
    db.add(notification)
    db.commit()
    return notification
