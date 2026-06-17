from pydantic import BaseModel


class SignUpIn(BaseModel):
    email: str
    password: str
    name: str


class SignInIn(BaseModel):
    email: str
    password: str


class AuthOut(BaseModel):
    user_id: str
    email: str
    name: str
    access_token: str


class AuthError(BaseModel):
    detail: str


class ChangePasswordIn(BaseModel):
    current_password: str
    new_password: str

class UpdateProfileIn(BaseModel):
    name: str | None = None

class MessageOut(BaseModel):
    message: str
