# Cloudinary image upload helper

import io
import logging
import cloudinary
import cloudinary.uploader

from app.core.config import settings

logger = logging.getLogger(__name__)

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
)


def upload_image(data: bytes, folder: str = "helpet", public_id: str | None = None) -> str:
    """
    Upload raw image bytes to Cloudinary.
    Returns the secure HTTPS URL of the uploaded image.
    Raises RuntimeError on failure.
    """
    try:
        result = cloudinary.uploader.upload(
            io.BytesIO(data),
            folder=folder,
            public_id=public_id,
            overwrite=True,
            resource_type="image",
        )
        return result["secure_url"]
    except Exception as exc:
        logger.error(f"Cloudinary upload failed: {exc}")
        raise RuntimeError(f"Image upload failed: {exc}") from exc


def delete_image(public_id: str) -> None:
    """Delete an image from Cloudinary by its public_id (best-effort, no raise)."""
    try:
        cloudinary.uploader.destroy(public_id)
    except Exception as exc:
        logger.warning(f"Cloudinary delete failed for {public_id}: {exc}")
