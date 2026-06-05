from pydantic import BaseModel


class PermissionResponse(BaseModel):
    code: str
    name: str
    module: str
    action: str

    class Config:
        from_attributes = True
