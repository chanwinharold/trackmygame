from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import current_user
from ..models import User
from ..schemas import PasswordUpdate, ProfileUpdate, UserRead
from ..security import hash_password, verify_password
from ..serializers import user_read

router = APIRouter(prefix="/profile", tags=["profile"])


@router.patch("", response_model=UserRead)
def update_profile(payload: ProfileUpdate, user: User = Depends(current_user), db: Session = Depends(get_db)) -> UserRead:
    if payload.username is not None:
        user.username = payload.username.strip()
    if payload.displayName is not None:
        user.display_name = payload.displayName.strip()
    if payload.avatarUrl is not None:
        user.avatar_url = payload.avatarUrl
    db.commit()
    db.refresh(user)
    return user_read(user)


@router.patch("/password", status_code=status.HTTP_204_NO_CONTENT)
def update_password(
    payload: PasswordUpdate,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
) -> Response:
    if payload.newPassword != payload.confirmPassword:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password confirmation does not match")
    if not verify_password(payload.currentPassword, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Current password is incorrect")
    user.password_hash = hash_password(payload.newPassword)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def delete_profile(user: User = Depends(current_user), db: Session = Depends(get_db)) -> Response:
    db.delete(user)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
