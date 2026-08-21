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

try:
	import psycopg2
	from psycopg2.extras import RealDictCursor
	HAS_PSYCOPG2 = True
except ImportError:
	HAS_PSYCOPG2 = False


APP_NAME = "NEXUGAL API"

DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("POSTGRES_URL")
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
	DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

IS_POSTGRES = bool(DATABASE_URL and HAS_PSYCOPG2)
DB_PATH = os.getenv("SQLITE_DB_PATH", "./leads.db")
JWT_SECRET = os.getenv("JWT_SECRET", "change-this-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRES_MINUTES = int(os.getenv("JWT_EXPIRES_MINUTES", "120"))
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")


def get_db_connection():
	if IS_POSTGRES:
		return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
	conn = sqlite3.connect(DB_PATH)
	conn.row_factory = sqlite3.Row
	return conn


def execute_sql(conn, query: str, params: tuple = ()):
	if IS_POSTGRES:
		pg_query = query.replace("?", "%s")
		with conn.cursor() as cur:
			cur.execute(pg_query, params)
			if cur.description:
				rows = cur.fetchall()
				return [dict(r) for r in rows]
			return []
	else:
		cur = conn.execute(query, params)
		if cur.description:
			rows = cur.fetchall()
			return [dict(r) for r in rows]
		return []


def execute_insert_sql(conn, query: str, params: tuple = ()) -> Optional[int]:
	if IS_POSTGRES:
		pg_query = query.replace("?", "%s") + " RETURNING id"
		with conn.cursor() as cur:
			cur.execute(pg_query, params)
			row = cur.fetchone()
			conn.commit()
			return row["id"] if row else None
	else:
		cur = conn.execute(query, params)
		conn.commit()
		return cur.lastrowid


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

raw_origins = os.getenv("ALLOWED_ORIGINS") or os.getenv("FRONTEND_URL")
if raw_origins:
	allowed_origins = [o.strip() for o in raw_origins.split(",") if o.strip()]
else:
	allowed_origins = [
		"https://nexusgal-laddingpage.vercel.app",
		"https://projeto-teste-weld.vercel.app",
		"http://localhost:3000",
		"http://127.0.0.1:3000",
	]

app.add_middleware(
	CORSMiddleware,
	allow_origins=allowed_origins,
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

bearer_scheme = HTTPBearer(auto_error=True)


def ensure_tables_and_admin() -> None:
	conn = get_db_connection()
	try:
		if IS_POSTGRES:
			execute_sql(
				conn,
				"""
				CREATE TABLE IF NOT EXISTS users (
					id SERIAL PRIMARY KEY,
					username VARCHAR(255) NOT NULL UNIQUE,
					password_hash TEXT NOT NULL,
					created_at TEXT NOT NULL
				);
				""",
			)
			execute_sql(
				conn,
				"""
				CREATE TABLE IF NOT EXISTS leads (
					id SERIAL PRIMARY KEY,
					name VARCHAR(255) NOT NULL,
					email VARCHAR(255) NOT NULL,
					phone VARCHAR(255) NOT NULL,
					company VARCHAR(255) NOT NULL,
					service VARCHAR(255) NOT NULL,
					message TEXT NOT NULL,
					language VARCHAR(10) NOT NULL,
					created_at TEXT NOT NULL
				);
				""",
			)
			conn.commit()
		else:
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
			conn.commit()

		existing_user = execute_sql(
			conn,
			"SELECT id FROM users WHERE username = ?",
			(ADMIN_USERNAME,),
		)

		if not existing_user:
			execute_sql(
				conn,
				"INSERT INTO users (username, password_hash, created_at) VALUES (?, ?, ?)",
				(
					ADMIN_USERNAME,
					hash_password(ADMIN_PASSWORD),
					datetime.now(timezone.utc).isoformat(),
				),
			)
		else:
			execute_sql(
				conn,
				"UPDATE users SET password_hash = ? WHERE username = ?",
				(
					hash_password(ADMIN_PASSWORD),
					ADMIN_USERNAME,
				),
			)

		if IS_POSTGRES:
			conn.commit()
		else:
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


@app.get("/")
def root() -> dict:
	return {"status": "ok", "app": APP_NAME, "db": "postgres" if IS_POSTGRES else "sqlite"}


@app.get("/api/health")
def health() -> dict:
	return {"status": "ok", "app": APP_NAME, "db": "postgres" if IS_POSTGRES else "sqlite"}


@app.post("/api/auth/login", response_model=TokenOut)
def login(payload: LoginIn) -> TokenOut:
	conn = get_db_connection()
	try:
		rows = execute_sql(
			conn,
			"SELECT username, password_hash FROM users WHERE username = ?",
			(payload.username,),
		)
	finally:
		conn.close()

	row = rows[0] if rows else None
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
		lead_id = execute_insert_sql(
			conn,
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
	finally:
		conn.close()

	return {"success": True, "id": lead_id}


@app.get("/api/leads", response_model=list[LeadOut])
def list_leads(_: str = Depends(get_current_user)) -> list[LeadOut]:
	conn = get_db_connection()
	try:
		rows = execute_sql(
			conn,
			"""
			SELECT id, name, email, phone, company, service, message, language, created_at
			FROM leads
			ORDER BY created_at DESC
			""",
		)
	finally:
		conn.close()

	return [LeadOut(**row) for row in rows]
