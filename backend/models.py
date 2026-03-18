from datetime import date, datetime
from typing import List, Optional
from sqlmodel import Field, Relationship, SQLModel, Session, select

class OrganizationSettings(SQLModel, table=True):
    id: Optional[int] = Field(default=1, primary_key=True)
    name: str = Field(default="Ethiopian Electric Power")
    subtitle: str = Field(default="HR Management Portal")
    logo_url: Optional[str] = None
    ceo_employee_id: Optional[int] = Field(default=None, foreign_key="employee.id")

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    email: str = Field(unique=True)
    hashed_password: str
    is_active: bool = Field(default=True)
    is_superuser: bool = Field(default=False)

class UserCreate(SQLModel):
    username: str
    email: str
    password: str

class Token(SQLModel):
    access_token: str
    token_type: str

class TokenData(SQLModel):
    username: Optional[str] = None

class Department(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)
    description: Optional[str] = None

    # Self-referencing hierarchy: business unit / sub-business units
    parent_id: Optional[int] = Field(default=None, foreign_key="department.id")
    parent: Optional["Department"] = Relationship(
        back_populates="children",
        sa_relationship_kwargs={"remote_side": "Department.id"},
    )
    children: List["Department"] = Relationship(back_populates="parent")

    # Responsible person for this business unit (links to Employee)
    responsible_employee_id: Optional[int] = Field(
        default=None, foreign_key="employee.id", index=True
    )
    responsible_employee: Optional["Employee"] = Relationship(
        sa_relationship_kwargs={
            "primaryjoin": "Department.responsible_employee_id==Employee.id",
            "foreign_keys": "[Department.responsible_employee_id]",
            "uselist": False,
        }
    )

    employees: List["Employee"] = Relationship(
        back_populates="department",
        sa_relationship_kwargs={
            "primaryjoin": "Department.id==Employee.department_id",
            "foreign_keys": "[Employee.department_id]",
        },
    )

class Position(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(index=True, unique=True)
    base_salary: Optional[float] = None
    
    employees: List["Employee"] = Relationship(back_populates="position")

class Employee(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    company_id: Optional[str] = Field(default=None, unique=True, index=True)
    first_name: str
    last_name: str
    email: str = Field(unique=True, index=True)
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    national_id: Optional[str] = Field(default=None, unique=True)
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    date_of_joining: date = Field(default_factory=date.today)
    is_active: bool = Field(default=True)
    
    # File attachments
    photo_url: Optional[str] = None
    document_url: Optional[str] = None
    
    department_id: Optional[int] = Field(default=None, foreign_key="department.id")
    department: Optional[Department] = Relationship(
        back_populates="employees",
        sa_relationship_kwargs={
            "primaryjoin": "Employee.department_id==Department.id",
            "foreign_keys": "[Employee.department_id]",
        },
    )
    
    position_id: Optional[int] = Field(default=None, foreign_key="position.id")
    position: Optional[Position] = Relationship(back_populates="employees")


class ActivityLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    action: str                          # e.g. "Employee Created", "Logo Updated"
    description: str                     # e.g. "John Doe was added to Finance Unit"
    entity_type: str                     # e.g. "employee", "department", "settings"
    actor: str                           # username of who did it
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    icon: str = Field(default="📋")     # emoji icon for the UI
    details: Optional[str] = None       # JSON string for structured data (e.g. old vs new values)


class CEOAssign(SQLModel):
    company_id: str


class DepartmentUpdate(SQLModel):
    name: Optional[str] = None
    description: Optional[str] = None
    parent_id: Optional[int] = None
    responsible_employee_id: Optional[int] = None
