import base64
import hashlib
import hmac
import os
import sqlite3
from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, EmailStr, Field


APP_NAME = "Nexugal API"
DB_PATH = os.getenv("SQLITE_DB_PATH", "./leads.db")
JWT_SECRET = os.getenv("JWT_SECRET", "change-this-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRES_MINUTES = int(os.getenv("JWT_EXPIRES_MINUTES", "120"))
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")


def get_db_connection() -> sqlite3.Connection:
	conn = sqlite3.connect(DB_PATH)
	conn.row_factory = sqlite3.Row
	return conn


def hash_password(password: str, salt: Optional[bytes] = None) -> str:
	salt = salt or os.urandom(16)
	digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 120_000)
	return f"{base64.b64encode(salt).decode('utf-8')}${base64.b64encode(digest).decode('utf-8')}"


def verify_password(password: str, encoded_hash: str) -> bool:
	try:
		salt_b64, digest_b64 = encoded_hash.split("$", maxsplit=1)
		salt = base64.b64decode(salt_b64.encode("utf-8"))
		expected = base64.b64decode(digest_b64.encode("utf-8"))
		current = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 120_000)
		return hmac.compare_digest(current, expected)
	except Exception:
		return False


def create_access_token(username: str) -> str:
	expires_at = datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRES_MINUTES)
	payload = {"sub": username, "exp": expires_at}
	return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> dict:
	try:
		return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
	except jwt.InvalidTokenError as exc:
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail="Token inválido ou expirado.",
		) from exc


class LeadIn(BaseModel):
	name: str = Field(min_length=2, max_length=120)
	email: EmailStr
	phone: str = Field(default="", max_length=40)
	company: str = Field(default="", max_length=120)
	service: str = Field(default="", max_length=120)
	message: str = Field(min_length=5, max_length=5000)
	language: str = Field(default="pt", max_length=8)


class LeadOut(BaseModel):
	id: int
	name: str
	email: str
	phone: str
	company: str
	service: str
	message: str
	language: str
	created_at: str


class LoginIn(BaseModel):
	username: str
	password: str


class TokenOut(BaseModel):
	access_token: str
	token_type: str = "bearer"


app = FastAPI(title=APP_NAME)

app.add_middleware(
	CORSMiddleware,
	allow_origins=[
		"http://localhost:3000",
		"http://127.0.0.1:3000",
	],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

bearer_scheme = HTTPBearer(auto_error=True)


def ensure_tables_and_admin() -> None:
	conn = get_db_connection()
	try:
		conn.execute(
			"""
			CREATE TABLE IF NOT EXISTS users (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				username TEXT NOT NULL UNIQUE,
				password_hash TEXT NOT NULL,
				created_at TEXT NOT NULL
			)
			"""
		)
		conn.execute(
			"""
			CREATE TABLE IF NOT EXISTS leads (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				name TEXT NOT NULL,
				email TEXT NOT NULL,
				phone TEXT NOT NULL,
				company TEXT NOT NULL,
				service TEXT NOT NULL,
				message TEXT NOT NULL,
				language TEXT NOT NULL,
				created_at TEXT NOT NULL
			)
			"""
		)

		existing_user = conn.execute(
			"SELECT id FROM users WHERE username = ?",
			(ADMIN_USERNAME,),
		).fetchone()

		if not existing_user:
			conn.execute(
				"INSERT INTO users (username, password_hash, created_at) VALUES (?, ?, ?)",
				(
					ADMIN_USERNAME,
					hash_password(ADMIN_PASSWORD),
					datetime.now(timezone.utc).isoformat(),
				),
			)

		conn.commit()
	finally:
		conn.close()


@app.on_event("startup")
def startup() -> None:
	ensure_tables_and_admin()


def get_current_user(
	credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> str:
	payload = decode_access_token(credentials.credentials)
	username = payload.get("sub")
	if not username:
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail="Token inválido.",
		)
	return username


@app.get("/api/health")
def health() -> dict:
	return {"status": "ok", "app": APP_NAME}


@app.post("/api/auth/login", response_model=TokenOut)
def login(payload: LoginIn) -> TokenOut:
	conn = get_db_connection()
	try:
		row = conn.execute(
			"SELECT username, password_hash FROM users WHERE username = ?",
			(payload.username,),
		).fetchone()
	finally:
		conn.close()

	if not row or not verify_password(payload.password, row["password_hash"]):
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail="Credenciais inválidas.",
		)

	return TokenOut(access_token=create_access_token(row["username"]))


@app.post("/api/leads")
def create_lead(payload: LeadIn) -> dict:
	conn = get_db_connection()
	try:
		cursor = conn.execute(
			"""
			INSERT INTO leads (name, email, phone, company, service, message, language, created_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?)
			""",
			(
				payload.name.strip(),
				str(payload.email).strip(),
				payload.phone.strip(),
				payload.company.strip(),
				payload.service.strip(),
				payload.message.strip(),
				payload.language.strip() or "pt",
				datetime.now(timezone.utc).isoformat(),
			),
		)
		conn.commit()
		lead_id = cursor.lastrowid
	finally:
		conn.close()

	return {"success": True, "id": lead_id}


@app.get("/api/leads", response_model=list[LeadOut])
def list_leads(_: str = Depends(get_current_user)) -> list[LeadOut]:
	conn = get_db_connection()
	try:
		rows = conn.execute(
			"""
			SELECT id, name, email, phone, company, service, message, language, created_at
			FROM leads
			ORDER BY datetime(created_at) DESC
			"""
		).fetchall()
	finally:
		conn.close()

	return [LeadOut(**dict(row)) for row in rows]
