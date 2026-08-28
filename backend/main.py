import base64
import hashlib
import hmac
import os
import sqlite3
from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt
from fastapi import Cookie, Depends, FastAPI, HTTPException, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, EmailStr, Field

try:
	import resend
	HAS_RESEND = True
except ImportError:
	HAS_RESEND = False

try:
	import psycopg2
	from psycopg2.extras import RealDictCursor
	HAS_PSYCOPG2 = True
except ImportError:
	HAS_PSYCOPG2 = False


def send_lead_email_notification(payload: "LeadIn", lead_id: int):
	api_key = os.getenv("RESEND_API_KEY")
	if not api_key:
		print("[RESEND] Aviso: RESEND_API_KEY não definida. Notificação por e-mail ignorada.")
		return

	if not HAS_RESEND:
		print("[RESEND] Erro: biblioteca 'resend' não instalada.")
		return

	resend.api_key = api_key
	to_email = os.getenv("NOTIFICATION_EMAIL", "nexugal.geral@gmail.com")
	from_email = os.getenv("SENDER_EMAIL", "NEXUGAL Leads <onboarding@resend.dev>")
	lead_email = str(payload.email).strip()
	lead_name = payload.name.strip()
	lead_phone = payload.phone.strip() or "Não informado"
	lead_company = payload.company.strip() or "Não informada"
	lead_service = payload.service.strip() or "Não especificado"
	lead_message = payload.message.strip()
	lead_lang = (payload.language.strip() or "pt").upper()

	html_content = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0d1117; margin: 0; padding: 25px; color: #c9d1d9; }}
        .container {{ max-width: 600px; margin: 0 auto; background: #161b22; border-radius: 16px; overflow: hidden; border: 1px solid #30363d; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }}
        .header {{ background: #000000; padding: 28px; text-align: center; border-bottom: 2px solid #00D1FF; }}
        .brand {{ color: #00D1FF; font-size: 24px; font-weight: 800; letter-spacing: 3px; font-family: 'Orbitron', monospace, sans-serif; margin: 0; }}
        .subtitle {{ color: #8b949e; font-size: 13px; margin-top: 6px; letter-spacing: 1px; uppercase; }}
        .content {{ padding: 28px; }}
        .field {{ margin-bottom: 20px; border-bottom: 1px solid #21262d; padding-bottom: 14px; }}
        .field:last-child {{ border-bottom: none; }}
        .label {{ font-size: 11px; font-weight: 700; text-transform: uppercase; color: #00D1FF; letter-spacing: 1.5px; margin-bottom: 6px; }}
        .value {{ font-size: 15px; color: #f0f6fc; line-height: 1.6; font-weight: 500; }}
        .message-box {{ background: #0d1117; border-left: 4px solid #00D1FF; padding: 16px; border-radius: 0 10px 10px 0; margin-top: 8px; font-style: normal; white-space: pre-wrap; color: #e6edf3; font-size: 14px; }}
        .footer {{ background: #0d1117; padding: 20px; text-align: center; font-size: 12px; color: #8b949e; border-top: 1px solid #21262d; }}
        .reply-btn {{ display: inline-block; margin-top: 12px; background: #00D1FF; color: #000000; padding: 10px 22px; border-radius: 50px; text-decoration: none; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="brand">NEXUGAL</div>
            <div class="subtitle">Novo Lead Recebido (#{lead_id})</div>
        </div>
        <div class="content">
            <div class="field">
                <div class="label">Nome do Cliente</div>
                <div class="value">{lead_name}</div>
            </div>
            <div class="field">
                <div class="label">Endereço de E-mail</div>
                <div class="value"><a href="mailto:{lead_email}" style="color: #00D1FF; text-decoration: underline;">{lead_email}</a></div>
            </div>
            <div class="field">
                <div class="label">Telefone / Telemóvel</div>
                <div class="value">{lead_phone}</div>
            </div>
            <div class="field">
                <div class="label">Empresa</div>
                <div class="value">{lead_company}</div>
            </div>
            <div class="field">
                <div class="label">Serviço de Interesse</div>
                <div class="value">{lead_service}</div>
            </div>
            <div class="field">
                <div class="label">Mensagem / Descrição do Projeto</div>
                <div class="value message-box">{lead_message}</div>
            </div>
            <div class="field">
                <div class="label">Idioma do Formulário</div>
                <div class="value">{lead_lang}</div>
            </div>
        </div>
        <div class="footer">
            Notificação automática da plataforma NEXUGAL.<br>
            <a href="mailto:{lead_email}" class="reply-btn">Responder ao Cliente</a>
        </div>
    </div>
</body>
</html>"""

	try:
		params = {
			"from": from_email,
			"to": [to_email],
			"reply_to": lead_email,
			"subject": f"🚀 Novo Lead NEXUGAL: {lead_name} ({lead_service})",
			"html": html_content,
		}
		res = resend.Emails.send(params)
		print(f"[RESEND] E-mail enviado com sucesso para lead #{lead_id}: {res}")
	except Exception as e:
		print(f"[RESEND] Erro ao enviar e-mail para lead #{lead_id}: {e}")


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

COOKIE_NAME = "nexugal_auth"
IS_PRODUCTION = bool(
	os.getenv("RAILWAY_ENVIRONMENT")
	or os.getenv("RAILWAY_PROJECT_ID")
	or os.getenv("IS_PRODUCTION")
)


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


MAX_FAILED_ATTEMPTS = int(os.getenv("MAX_FAILED_ATTEMPTS", "2"))
LOCKOUT_MINUTES = int(os.getenv("LOCKOUT_MINUTES", "15"))

failed_login_attempts: dict[str, dict] = {}


def get_client_ip(request: Request) -> str:
	forwarded = request.headers.get("x-forwarded-for")
	if forwarded:
		return forwarded.split(",")[0].strip()
	if request.client:
		return request.client.host
	return "127.0.0.1"


def check_ip_blocked(ip: str) -> None:
	now = datetime.now(timezone.utc)
	ip_data = failed_login_attempts.get(ip)
	if ip_data and ip_data.get("blocked_until"):
		if now < ip_data["blocked_until"]:
			remaining_seconds = int((ip_data["blocked_until"] - now).total_seconds())
			remaining_minutes = max(1, remaining_seconds // 60)
			raise HTTPException(
				status_code=status.HTTP_429_TOO_MANY_REQUESTS,
				detail=f"Endereço IP bloqueado por excesso de tentativas de login incorretas. Tente novamente em {remaining_minutes} minuto(s).",
			)
		else:
			failed_login_attempts[ip] = {"count": 0, "blocked_until": None}


def record_failed_login(ip: str) -> None:
	now = datetime.now(timezone.utc)
	ip_data = failed_login_attempts.get(ip, {"count": 0, "blocked_until": None})
	count = ip_data.get("count", 0) + 1

	if count >= MAX_FAILED_ATTEMPTS:
		blocked_until = now + timedelta(minutes=LOCKOUT_MINUTES)
		failed_login_attempts[ip] = {"count": count, "blocked_until": blocked_until}
		raise HTTPException(
			status_code=status.HTTP_429_TOO_MANY_REQUESTS,
			detail=f"Endereço IP bloqueado por atingir o limite de {MAX_FAILED_ATTEMPTS} tentativa(s) incorreta(s). Tente novamente em {LOCKOUT_MINUTES} minutos.",
		)
	else:
		failed_login_attempts[ip] = {"count": count, "blocked_until": None}


def record_successful_login(ip: str) -> None:
	failed_login_attempts.pop(ip, None)


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
		"https://nexugal.com",
		"https://www.nexugal.com",
		"http://localhost:3000",
		"http://127.0.0.1:3000",
		"http://localhost:3001",
		"http://127.0.0.1:3001",
	]

app.add_middleware(
	CORSMiddleware,
	allow_origins=allowed_origins,
	allow_credentials=True,
	allow_methods=["GET", "POST", "OPTIONS"],
	allow_headers=["Content-Type", "Authorization"],
)


@app.middleware("http")
async def security_headers(request: Request, call_next):
	response = await call_next(request)
	response.headers["X-Content-Type-Options"] = "nosniff"
	response.headers["X-Frame-Options"] = "DENY"
	response.headers["X-XSS-Protection"] = "1; mode=block"
	response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
	response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
	if IS_PRODUCTION:
		response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
	return response


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
	token: Optional[str] = Cookie(None, alias=COOKIE_NAME),
) -> str:
	if not token:
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail="Não autenticado.",
		)
	payload = decode_access_token(token)
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


@app.post("/api/auth/login")
def login(payload: LoginIn, request: Request, response: Response) -> dict:
	client_ip = get_client_ip(request)
	check_ip_blocked(client_ip)

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
		record_failed_login(client_ip)
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail="Credenciais inválidas.",
		)

	record_successful_login(client_ip)
	token = create_access_token(row["username"])
	cookie_secure = IS_PRODUCTION
	cookie_samesite = "none" if IS_PRODUCTION else "lax"
	response.set_cookie(
		key=COOKIE_NAME,
		value=token,
		httponly=True,
		secure=cookie_secure,
		samesite=cookie_samesite,
		max_age=JWT_EXPIRES_MINUTES * 60,
		path="/",
	)
	return {"success": True, "username": row["username"]}


@app.post("/api/auth/logout")
def logout(response: Response) -> dict:
	response.delete_cookie(
		key=COOKIE_NAME,
		path="/",
		samesite="none" if IS_PRODUCTION else "lax",
		secure=IS_PRODUCTION,
	)
	return {"success": True}


@app.get("/api/auth/me")
def me(username: str = Depends(get_current_user)) -> dict:
	return {"username": username}


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

	# Enviar notificação por e-mail via Resend
	send_lead_email_notification(payload, lead_id)

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
