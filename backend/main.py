import base64
import hashlib
import hmac
import os
import re
import sqlite3
import time
from datetime import datetime, timedelta, timezone
from typing import Optional
from urllib.parse import urljoin, urlparse
from urllib.robotparser import RobotFileParser

import jwt
from fastapi import Cookie, Depends, FastAPI, HTTPException, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, EmailStr, Field

try:
	import resend
	HAS_RESEND = True
except ImportError:
	HAS_RESEND = False

# O scraper é acessório; o formulário de contactos do site é que dá dinheiro.
# Se estas bibliotecas faltarem, a API tem de arrancar na mesma — só o scraper
# fica indisponível, com uma mensagem clara no painel.
try:
	import httpx
	from bs4 import BeautifulSoup
	HAS_SCRAPER_DEPS = True
except ImportError:
	HAS_SCRAPER_DEPS = False

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
	# Nota: quando a query não devolve linhas (UPDATE/INSERT/DELETE/DDL) é preciso
	# fazer commit explícito. Sem isto, o psycopg2 e o sqlite3 descartam a escrita
	# ao fechar a ligação e a alteração perde-se em silêncio.
	if IS_POSTGRES:
		pg_query = query.replace("?", "%s")
		with conn.cursor() as cur:
			cur.execute(pg_query, params)
			if cur.description:
				rows = cur.fetchall()
				return [dict(r) for r in rows]
			conn.commit()
			return []
	else:
		cur = conn.execute(query, params)
		if cur.description:
			rows = cur.fetchall()
			return [dict(r) for r in rows]
		conn.commit()
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


# Valores aceites para os campos do scraper (allowlist de segurança)
ALLOWED_REGIONS = {
	"braga", "porto", "lisboa", "viana do castelo", "aveiro",
	"leiria", "coimbra", "faro", "setúbal", "viseu", "vila real",
	"guimarães", "barcelos", "évora", "bragança", "portalegre",
	"castelo branco", "santarém", "beja",
}
ALLOWED_CATEGORIES = {
	"oficinas & automóvel", "restauração & hotelaria", "imobiliárias & construção",
	"clínicas & saúde", "lojas & comércio local", "serviços profissionais",
	"tecnologia & consultoria", "educação & formação", "logística & transportes",
	"beleza & estética",
}
ALLOWED_CLIENT_TYPES = {"pmes", "micro-empresas", "corporativo"}
ALLOWED_PRIORITIES = {"alta", "media", "baixa"}
ALLOWED_STATUSES = {"novo", "contactado", "convertido", "ignorado"}

# Domínios de e-mail descartáveis / blacklistados (anti-spam)
BLACKLISTED_EMAIL_DOMAINS = {
	"mailinator.com", "guerrillamail.com", "10minutemail.com", "throwam.com",
	"yopmail.com", "sharklasers.com", "guerrillamailblock.com", "grr.la",
	"guerrillamail.info", "spam4.me", "tempmail.com", "fakeinbox.com",
	"example.com", "test.com", "localhost",
}

# Limite máximo de prospects a inserir por pesquisa
MAX_PROSPECTS_PER_SEARCH = 30

# Limite máximo de e-mails de outreach por operação
MAX_OUTREACH_PER_BATCH = 20


class ScraperSearchIn(BaseModel):
	region: str = Field(min_length=2, max_length=80)
	category: str = Field(min_length=2, max_length=80)
	client_type: str = Field(default="PMEs", max_length=50)
	priority: str = Field(default="media", max_length=20)

	from pydantic import model_validator

	@model_validator(mode="after")
	def validate_allowlists(self):
		if self.region.lower().strip() not in ALLOWED_REGIONS:
			raise ValueError(f"Região não suportada: '{self.region}'. Escolha uma região válida de Portugal.")
		if self.category.lower().strip() not in ALLOWED_CATEGORIES:
			raise ValueError(f"Categoria não suportada: '{self.category}'.")
		if self.client_type.lower().strip() not in ALLOWED_CLIENT_TYPES:
			raise ValueError(f"Tipo de cliente inválido: '{self.client_type}'.")
		if self.priority.lower().strip() not in ALLOWED_PRIORITIES:
			raise ValueError(f"Prioridade inválida: '{self.priority}'.")
		return self


class ProspectOut(BaseModel):
	id: int
	name: str
	email: str
	phone: str
	company: str
	website: str
	region: str
	category: str
	client_type: str
	priority: str
	status: str
	notes: str
	created_at: str
	# Onde o contacto foi recolhido (exigência do art. 14.º do RGPD)
	source_url: str = ""
	# True = endereço da empresa (geral@...); False = endereço de uma pessoa
	is_role_address: bool = True
	# True = pediu para não ser contactado; nunca recebe e-mail
	suppressed: bool = False


class ProspectUpdateIn(BaseModel):
	status: Optional[str] = None
	priority: Optional[str] = None
	notes: Optional[str] = Field(default=None, max_length=2000)

	from pydantic import model_validator

	@model_validator(mode="after")
	def validate_enum_fields(self):
		if self.status is not None and self.status.lower() not in ALLOWED_STATUSES:
			raise ValueError(f"Estado inválido: '{self.status}'. Valores aceites: {ALLOWED_STATUSES}")
		if self.priority is not None and self.priority.lower() not in ALLOWED_PRIORITIES:
			raise ValueError(f"Prioridade inválida: '{self.priority}'. Valores aceites: {ALLOWED_PRIORITIES}")
		return self


class OutreachSendIn(BaseModel):
	prospect_ids: list[int] = Field(min_length=1, max_length=MAX_OUTREACH_PER_BATCH)
	subject: Optional[str] = Field(default=None, max_length=200)
	message: Optional[str] = Field(default=None, max_length=5000)
	# Endereços de pessoas (joao.silva@) só são contactados com confirmação
	# explícita — o RGPD é bem mais exigente com eles do que com geral@empresa.pt.
	allow_personal: bool = False


app = FastAPI(title=APP_NAME)

raw_origins = os.getenv("ALLOWED_ORIGINS") or os.getenv("FRONTEND_URL")
if raw_origins:
	allowed_origins = [o.strip() for o in raw_origins.split(",") if o.strip()]
else:
	allowed_origins = [
		"https://nexusgal-laddingpage.vercel.app",
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
	allow_methods=["GET", "POST", "PATCH", "OPTIONS"],
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


def _try_ddl(conn, statement: str, label: str) -> None:
	"""
	Executa uma instrução de estrutura tolerando falhas (ex.: coluna já existe).
	No Postgres uma instrução falhada aborta a transação, por isso é preciso
	fazer rollback antes de continuar.
	"""
	try:
		execute_sql(conn, statement)
	except Exception as err:
		try:
			conn.rollback()
		except Exception:
			pass
		print(f"[MIGRAÇÃO] '{label}' ignorada: {type(err).__name__}")


def ensure_scraper_schema(conn) -> None:
	"""
	Acrescenta o que o scraper passou a precisar, sem destruir dados existentes:
	origem do contacto (exigido pelo art. 14.º do RGPD), marca de endereço de
	função, lista de quem pediu para não ser contactado e registo de envios.
	"""
	bool_type = "BOOLEAN DEFAULT FALSE" if IS_POSTGRES else "INTEGER DEFAULT 0"
	pk = "SERIAL PRIMARY KEY" if IS_POSTGRES else "INTEGER PRIMARY KEY AUTOINCREMENT"
	text_type = "VARCHAR(255)" if IS_POSTGRES else "TEXT"

	_try_ddl(conn, f"ALTER TABLE prospects ADD COLUMN source_url {text_type} DEFAULT ''", "prospects.source_url")
	_try_ddl(conn, f"ALTER TABLE prospects ADD COLUMN is_role_address {bool_type}", "prospects.is_role_address")

	# Quem pediu para não voltar a ser contactado. Sobrevive a novas pesquisas:
	# mesmo que a empresa volte a aparecer, nunca mais recebe e-mail.
	_try_ddl(
		conn,
		f"""
		CREATE TABLE IF NOT EXISTS email_suppressions (
			id {pk},
			email {text_type} NOT NULL UNIQUE,
			reason TEXT DEFAULT '',
			created_at TEXT NOT NULL
		)
		""",
		"tabela email_suppressions",
	)

	# Registo de todos os envios — prova de diligência exigida pelo RGPD e base
	# para o limite de envios por hora.
	_try_ddl(
		conn,
		f"""
		CREATE TABLE IF NOT EXISTS outreach_log (
			id {pk},
			prospect_id INTEGER,
			email {text_type} NOT NULL,
			subject TEXT DEFAULT '',
			outcome {text_type} NOT NULL,
			created_at TEXT NOT NULL
		)
		""",
		"tabela outreach_log",
	)

	# Impede duplicados à conta da base de dados, não só à conta do código.
	_try_ddl(conn, "CREATE UNIQUE INDEX IF NOT EXISTS idx_prospects_email ON prospects (email)", "índice único prospects.email")
	_try_ddl(conn, "CREATE INDEX IF NOT EXISTS idx_outreach_log_created ON outreach_log (created_at)", "índice outreach_log.created_at")


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
			execute_sql(
				conn,
				"""
				CREATE TABLE IF NOT EXISTS prospects (
					id SERIAL PRIMARY KEY,
					name VARCHAR(255) NOT NULL,
					email VARCHAR(255) NOT NULL,
					phone VARCHAR(255) DEFAULT '',
					company VARCHAR(255) DEFAULT '',
					website VARCHAR(255) DEFAULT '',
					region VARCHAR(100) NOT NULL,
					category VARCHAR(100) NOT NULL,
					client_type VARCHAR(50) NOT NULL,
					priority VARCHAR(20) NOT NULL DEFAULT 'media',
					status VARCHAR(50) NOT NULL DEFAULT 'novo',
					notes TEXT DEFAULT '',
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
			conn.execute(
				"""
				CREATE TABLE IF NOT EXISTS prospects (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					name TEXT NOT NULL,
					email TEXT NOT NULL,
					phone TEXT DEFAULT '',
					company TEXT DEFAULT '',
					website TEXT DEFAULT '',
					region TEXT NOT NULL,
					category TEXT NOT NULL,
					client_type TEXT NOT NULL,
					priority TEXT NOT NULL DEFAULT 'media',
					status TEXT NOT NULL DEFAULT 'novo',
					notes TEXT DEFAULT '',
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

		ensure_scraper_schema(conn)

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


# ==========================================
# SCRAPER & PROSPECÇÃO B2B (PROTEGIDO)
# ==========================================

# --- Configuração da raspagem (ajustável por variáveis de ambiente) ---

# Identifica o robô perante os sites visitados, como manda a boa prática.
SCRAPER_USER_AGENT = os.getenv(
	"SCRAPER_USER_AGENT",
	"NexugalProspectBot/1.0 (+https://www.nexugal.com; contacto: nexugal.geral@gmail.com)",
)
# Nº máximo de sites que a raspagem abre por pesquisa.
SCRAPER_MAX_SITES = int(os.getenv("SCRAPER_MAX_SITES", "12"))
# Nº máximo de subpáginas ("contactos", "sobre") abertas por site.
SCRAPER_MAX_SUBPAGES = int(os.getenv("SCRAPER_MAX_SUBPAGES", "2"))
SCRAPER_TIMEOUT_SECONDS = float(os.getenv("SCRAPER_TIMEOUT_SECONDS", "8"))
# Pausa entre pedidos, para não sobrecarregar sites pequenos.
SCRAPER_DELAY_SECONDS = float(os.getenv("SCRAPER_DELAY_SECONDS", "1.0"))
# Limite de bytes lidos por página (evita descarregar ficheiros enormes).
SCRAPER_MAX_PAGE_BYTES = 1_200_000

# Prefixos de endereços "de função": pertencem à empresa e não identificam uma
# pessoa concreta. Em contexto B2B são muito menos sensíveis à luz do RGPD, por
# isso são os únicos que o outreach contacta por omissão.
ROLE_EMAIL_PREFIXES = {
	"geral", "info", "contacto", "contactos", "contact", "comercial",
	"vendas", "sales", "email", "mail", "escritorio", "secretaria",
	"secretariado", "administracao", "admin", "hello", "ola", "marketing",
	"apoio", "suporte", "support", "office", "reservas", "encomendas",
	"financeiro", "loja", "clientes", "empresa", "agenda", "marcacoes",
	"apoiocliente", "apoioaocliente", "atendimento", "servicos", "oficina",
	"assistencia", "orcamentos", "orcamento", "direcao", "gerencia",
	"administrativo", "rececao", "correio", "restaurante", "hotel",
	"geral1", "geral2",
}

# Caixas que existem para outro fim. Escrever-lhes com uma proposta comercial
# é intrusivo e não chega a quem decide — não vale a pena recolhê-las.
WRONG_PURPOSE_PREFIXES = (
	"recrutamento", "recursoshumanos", "rh", "emprego", "empregos",
	"curriculo", "curriculos", "candidaturas", "jobs", "careers",
	"privacidade", "dpo", "rgpd", "legal", "juridico",
	"reclamacoes", "livroreclamacoes", "denuncias", "imprensa", "press",
)

# Sites que aparecem nas pesquisas mas não são a empresa em si: diretórios,
# redes sociais, jornais, portais de emprego, classificados.
EXCLUDED_SITE_DOMAINS = (
	"facebook.com", "instagram.com", "linkedin.com", "twitter.com", "x.com",
	"youtube.com", "tiktok.com", "pinterest.com", "wikipedia.org",
	"paginasamarelas.pt", "infoempresas.com.pt", "racius.com", "einforma.pt",
	"olx.pt", "custojusto.pt", "standvirtual.com", "indeed.com",
	"netempregos.com", "sapo.pt", "publico.pt", "jn.pt", "dn.pt",
	"tripadvisor.com", "booking.com", "google.com", "bing.com",
	"yelp.com", "empresite.jornaldenegocios.pt", "guiadaempresa.pt",
	"amazon.com", "ebay.com", "marktplaats.nl", "coberturaonline.pt",
)

# Domínios que aparecem no código dos sites mas nunca são contactos reais.
JUNK_EMAIL_DOMAINS = {
	"sentry.io", "wixpress.com", "wix.com", "godaddy.com", "squarespace.com",
	"shopify.com", "cloudflare.com", "gstatic.com", "googleapis.com",
	"schema.org", "w3.org", "domain.com", "email.com", "yourdomain.com",
	"site.com", "empresa.pt", "seudominio.pt",
}

# Caminhos típicos de páginas de contacto em sites portugueses.
CONTACT_LINK_HINTS = (
	"contacto", "contactos", "contact", "contacte", "fale-connosco",
	"quem-somos", "sobre", "about", "empresa",
)


def _mask_email(email: str) -> str:
	"""Mascara um e-mail para poder aparecer nos registos sem expor dados pessoais."""
	try:
		local, domain = email.split("@", 1)
	except ValueError:
		return "***"
	return f"{local[:1]}{'*' * max(1, len(local) - 1)}@{domain}"


def _is_role_address(email: str) -> bool:
	"""True se for um endereço da empresa (geral@, info@...) e não de uma pessoa."""
	local = email.split("@", 1)[0].lower()
	local_base = re.sub(r"[._-]?\d+$", "", local)
	return local_base in ROLE_EMAIL_PREFIXES or local in ROLE_EMAIL_PREFIXES


def _is_email_safe(email: str) -> bool:
	"""Valida se o e-mail não pertence a domínios blacklistados, não é interno e tem formato aceitável."""
	email = email.lower().strip()
	if len(email) > 254:
		return False
	if not re.match(r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$", email):
		return False
	if ".." in email:
		return False
	domain = email.split("@")[-1]
	if domain in BLACKLISTED_EMAIL_DOMAINS or domain in JUNK_EMAIL_DOMAINS:
		return False
	# Subdomínios de serviços técnicos (ex.: o1234.ingest.sentry.io)
	if any(domain.endswith("." + junk) for junk in JUNK_EMAIL_DOMAINS):
		return False
	# Filtrar e-mails com extensões de ficheiro (artefactos de regex em imagens)
	if any(email.endswith(ext) for ext in (".png", ".jpg", ".jpeg", ".svg", ".gif", ".webp", ".pdf", ".css", ".js")):
		return False
	# Filtrar e-mails claramente não-empresariais ou com termos de privacidade
	blocked_prefixes = ("noreply", "no-reply", "donotreply", "bounce", "mailer-daemon", "postmaster", "abuse")
	if any(email.startswith(p) for p in blocked_prefixes):
		return False
	# Caixas de recrutamento, jurídico, reclamações... não são contactos comerciais
	local = email.split("@", 1)[0]
	local_base = re.sub(r"[._-]", "", local)
	if local_base in WRONG_PURPOSE_PREFIXES:
		return False
	return True


def _sanitize_str(value: str, max_len: int = 200) -> str:
	"""Remove caracteres de controlo e limita o comprimento."""
	# Remove HTML tags e caracteres de controlo
	value = re.sub(r"<[^>]+>", "", value)
	value = re.sub(r"[\x00-\x1f\x7f]", "", value)
	return value.strip()[:max_len]


def _robots_allows(client, url: str, robots_cache: dict) -> bool:
	"""Verifica o robots.txt do site antes de o visitar. Em caso de dúvida, permite."""
	try:
		parts = urlparse(url)
		origin = f"{parts.scheme}://{parts.netloc}"
	except Exception:
		return False

	if origin not in robots_cache:
		parser = RobotFileParser()
		try:
			resp = client.get(f"{origin}/robots.txt", timeout=SCRAPER_TIMEOUT_SECONDS)
			if resp.status_code == 200 and len(resp.text) < 200_000:
				parser.parse(resp.text.splitlines())
			else:
				# Sem robots.txt legível: o site não impõe restrições.
				parser.parse([])
		except Exception:
			parser.parse([])
		robots_cache[origin] = parser

	try:
		return robots_cache[origin].can_fetch(SCRAPER_USER_AGENT, url)
	except Exception:
		return True


def _fetch_html(client, url: str) -> str:
	"""Descarrega uma página HTML com limites de tempo e de tamanho. '' em caso de falha."""
	try:
		resp = client.get(url, timeout=SCRAPER_TIMEOUT_SECONDS)
	except Exception:
		return ""
	if resp.status_code != 200:
		return ""
	if "html" not in resp.headers.get("content-type", "").lower():
		return ""
	return resp.text[:SCRAPER_MAX_PAGE_BYTES]


def _extract_contacts_from_html(html: str, page_url: str) -> dict:
	"""Extrai título, e-mails e telefone de uma página. Prefere mailto:/tel: ao texto solto."""
	emails: list[str] = []
	phones: list[str] = []
	title = ""

	try:
		soup = BeautifulSoup(html, "html.parser")
	except Exception:
		soup = None

	if soup is not None:
		if soup.title and soup.title.string:
			title = _sanitize_str(str(soup.title.string), 160)
		for tag in soup.find_all("a", href=True):
			href = tag["href"].strip()
			low = href.lower()
			if low.startswith("mailto:"):
				candidate = href[7:].split("?")[0].strip().lower()
				if candidate:
					emails.append(candidate)
			elif low.startswith("tel:"):
				phones.append(re.sub(r"[^\d+]", "", href[4:]))
		# Remover script/style antes de ler o texto solto
		for bad in soup(["script", "style", "noscript"]):
			bad.decompose()
		text = soup.get_text(" ", strip=True)
	else:
		text = re.sub(r"<[^>]+>", " ", html)

	text = text[:200_000]
	emails.extend(re.findall(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}", text))
	phones.extend(re.findall(r"(?:\+351[\s.\-]?)?[29]\d{2}[\s.\-]?\d{3}[\s.\-]?\d{3}", text))

	clean_emails: list[str] = []
	for em in emails:
		em = em.lower().strip().strip(".")
		if _is_email_safe(em) and em not in clean_emails:
			clean_emails.append(em)

	phone = ""
	for raw in phones:
		digits = re.sub(r"[^\d]", "", raw)
		if digits.startswith("351"):
			digits = digits[3:]
		if len(digits) == 9 and digits[0] in "29":
			phone = f"+351 {digits}"
			break

	return {"title": title, "emails": clean_emails, "phone": phone, "url": page_url}


def _find_contact_pages(html: str, base_url: str) -> list[str]:
	"""Devolve ligações internas para páginas de contacto/sobre."""
	found: list[str] = []
	try:
		soup = BeautifulSoup(html, "html.parser")
	except Exception:
		return found

	base_host = urlparse(base_url).netloc
	for tag in soup.find_all("a", href=True):
		href = tag["href"].strip()
		if href.startswith(("mailto:", "tel:", "#", "javascript:")):
			continue
		label = f"{href} {tag.get_text(' ', strip=True)}".lower()
		if not any(hint in label for hint in CONTACT_LINK_HINTS):
			continue
		full = urljoin(base_url, href).split("#")[0]
		if urlparse(full).netloc != base_host:
			continue
		if full not in found and full != base_url:
			found.append(full)
		if len(found) >= SCRAPER_MAX_SUBPAGES:
			break
	return found


def _search_candidate_sites(query: str, max_results: int) -> tuple[list[dict], str]:
	"""Pesquisa no DuckDuckGo e devolve (resultados, mensagem_de_erro)."""
	try:
		try:
			from ddgs import DDGS
		except ImportError:
			from duckduckgo_search import DDGS
	except ImportError:
		return [], "Biblioteca de pesquisa não instalada no servidor."

	try:
		with DDGS() as ddgs:
			raw = list(ddgs.text(query, max_results=max_results))
	except Exception as err:
		return [], (
			f"A pesquisa falhou ({type(err).__name__}). "
			"Pode ser limite de pedidos do DuckDuckGo — tente daqui a alguns minutos."
		)

	results = []
	for r in raw:
		href = (r.get("href") or r.get("url") or "").strip()
		if not re.match(r"^https?://", href):
			continue
		results.append({"url": href[:250], "title": _sanitize_str(r.get("title", ""), 160)})
	return results, ""


def scrape_b2b_prospects(region: str, category: str, client_type: str, priority: str) -> tuple[list[dict], dict]:
	"""
	Procura empresas reais por região e categoria, abre os sites encontrados e
	recolhe os contactos publicamente disponíveis nessas páginas.

	Só recolhe o que a própria empresa publica no seu site, respeita o robots.txt
	de cada site, identifica-se no User-Agent e espaça os pedidos. Nunca inventa
	dados: se não encontrar nada, devolve lista vazia.

	Devolve (prospects, diagnóstico).
	"""
	region = _sanitize_str(region, 80)
	category = _sanitize_str(category, 80)
	client_type = _sanitize_str(client_type, 50)
	priority = priority.lower().strip()

	diag = {
		"search_error": "",
		"sites_found": 0,
		"sites_visited": 0,
		"pages_read": 0,
		"blocked_by_robots": 0,
		"directories_skipped": 0,
		"personal_addresses": 0,
	}

	if not HAS_SCRAPER_DEPS:
		diag["search_error"] = (
			"As bibliotecas de raspagem (httpx, beautifulsoup4) não estão instaladas "
			"no servidor. O resto da aplicação continua a funcionar."
		)
		return [], diag

	query = f"{category} {region} Portugal contactos"
	candidates, search_error = _search_candidate_sites(query, SCRAPER_MAX_SITES * 2)
	diag["search_error"] = search_error
	diag["sites_found"] = len(candidates)

	if not candidates:
		return [], diag

	prospects_found: list[dict] = []
	seen_emails: set[str] = set()
	seen_hosts: set[str] = set()
	robots_cache: dict = {}

	headers = {
		"User-Agent": SCRAPER_USER_AGENT,
		"Accept": "text/html,application/xhtml+xml",
		"Accept-Language": "pt-PT,pt;q=0.9",
	}

	try:
		client = httpx.Client(headers=headers, follow_redirects=True, timeout=SCRAPER_TIMEOUT_SECONDS)
	except Exception as err:
		diag["search_error"] = f"Não foi possível iniciar o cliente HTTP: {type(err).__name__}"
		return [], diag

	try:
		for candidate in candidates:
			if diag["sites_visited"] >= SCRAPER_MAX_SITES:
				break
			if len(prospects_found) >= MAX_PROSPECTS_PER_SEARCH:
				break

			url = candidate["url"]
			host = urlparse(url).netloc.lower()
			# Um prospect por empresa: chega o primeiro site de cada domínio.
			if not host or host in seen_hosts:
				continue
			# Diretórios, redes sociais e jornais não são a empresa que procuramos.
			bare_host = host[4:] if host.startswith("www.") else host
			if any(bare_host == d or bare_host.endswith("." + d) for d in EXCLUDED_SITE_DOMAINS):
				diag["directories_skipped"] += 1
				continue
			seen_hosts.add(host)

			if not _robots_allows(client, url, robots_cache):
				diag["blocked_by_robots"] += 1
				continue

			diag["sites_visited"] += 1
			html = _fetch_html(client, url)
			time.sleep(SCRAPER_DELAY_SECONDS)
			if not html:
				continue
			diag["pages_read"] += 1

			info = _extract_contacts_from_html(html, url)

			# Se a página inicial não tiver contactos, tentar a página de contactos.
			if not info["emails"]:
				for sub_url in _find_contact_pages(html, url):
					if not _robots_allows(client, sub_url, robots_cache):
						continue
					sub_html = _fetch_html(client, sub_url)
					time.sleep(SCRAPER_DELAY_SECONDS)
					if not sub_html:
						continue
					diag["pages_read"] += 1
					sub_info = _extract_contacts_from_html(sub_html, sub_url)
					if sub_info["emails"]:
						sub_info["title"] = sub_info["title"] or info["title"] or candidate["title"]
						sub_info["phone"] = sub_info["phone"] or info["phone"]
						info = sub_info
						break

			if not info["emails"]:
				continue

			company_name = info["title"] or candidate["title"] or host
			# Limpar sufixos comuns dos títulos de página ("Empresa | Contactos")
			company_name = re.split(r"\s+[|\-–—]\s+", company_name)[0][:200] or host

			for email in info["emails"]:
				if email in seen_emails:
					continue
				is_role = _is_role_address(email)
				if not is_role:
					# Endereços pessoais são recolhidos mas ficam marcados; o
					# outreach não lhes escreve sem autorização explícita.
					diag["personal_addresses"] += 1
				seen_emails.add(email)
				prospects_found.append({
					"name": company_name,
					"email": email,
					"phone": info["phone"],
					"company": company_name,
					"website": f"{urlparse(url).scheme}://{host}",
					"source_url": info["url"][:250],
					"is_role_address": is_role,
					"category": category,
					"region": region,
					"client_type": client_type,
					"priority": priority,
				})
				# Um contacto por empresa é suficiente para prospeção.
				break
	finally:
		try:
			client.close()
		except Exception:
			pass

	return prospects_found, diag



def _escape_html(text: str) -> str:
	"""Escapa caracteres HTML para prevenir XSS no corpo do e-mail."""
	return (
		text
		.replace("&", "&amp;")
		.replace("<", "&lt;")
		.replace(">", "&gt;")
		.replace('"', "&quot;")
		.replace("'", "&#x27;")
	)


# ==========================================
# OUTREACH: SUPRESSÃO, LIMITES E ENVIO
# ==========================================

# Endereço público desta API — usado nas ligações de cancelamento dos e-mails.
PUBLIC_API_URL = (
	os.getenv("PUBLIC_API_URL")
	or "https://carefree-unity-production-49b1.up.railway.app"
).rstrip("/")

# Teto de segurança de envios por hora, independente do tamanho dos lotes.
MAX_OUTREACH_PER_HOUR = int(os.getenv("MAX_OUTREACH_PER_HOUR", "50"))

# Endereço para onde vão os pedidos de remoção enviados por e-mail.
UNSUBSCRIBE_MAILBOX = os.getenv("UNSUBSCRIBE_MAILBOX", "nexugal.geral@gmail.com")


def _unsubscribe_token(email: str) -> str:
	"""Assinatura que prova que a ligação de cancelamento saiu de um e-mail nosso."""
	mac = hmac.new(
		JWT_SECRET.encode("utf-8"),
		email.lower().strip().encode("utf-8"),
		hashlib.sha256,
	).hexdigest()
	return mac[:32]


def _unsubscribe_url(email: str) -> str:
	from urllib.parse import quote

	return (
		f"{PUBLIC_API_URL}/api/outreach/unsubscribe"
		f"?e={quote(email)}&t={_unsubscribe_token(email)}"
	)


def is_email_suppressed(conn, email: str) -> bool:
	"""True se este endereço pediu para não voltar a ser contactado."""
	rows = execute_sql(
		conn,
		"SELECT id FROM email_suppressions WHERE email = ?",
		(email.lower().strip(),),
	)
	return bool(rows)


def add_email_suppression(conn, email: str, reason: str) -> None:
	"""Acrescenta um endereço à lista de não-contactar (idempotente)."""
	email = email.lower().strip()
	if is_email_suppressed(conn, email):
		return
	try:
		execute_insert_sql(
			conn,
			"INSERT INTO email_suppressions (email, reason, created_at) VALUES (?, ?, ?)",
			(email, _sanitize_str(reason, 200), datetime.now(timezone.utc).isoformat()),
		)
	except Exception as err:
		try:
			conn.rollback()
		except Exception:
			pass
		print(f"[SUPRESSÃO] Falha ao registar {_mask_email(email)}: {type(err).__name__}")


def log_outreach(conn, prospect_id: Optional[int], email: str, subject: str, outcome: str) -> None:
	"""Regista o envio. Serve de prova de diligência e alimenta o limite horário."""
	try:
		execute_insert_sql(
			conn,
			"INSERT INTO outreach_log (prospect_id, email, subject, outcome, created_at) VALUES (?, ?, ?, ?, ?)",
			(
				prospect_id,
				email.lower().strip()[:255],
				_sanitize_str(subject, 200),
				outcome[:50],
				datetime.now(timezone.utc).isoformat(),
			),
		)
	except Exception as err:
		try:
			conn.rollback()
		except Exception:
			pass
		print(f"[OUTREACH LOG] Falha ao registar envio: {type(err).__name__}")


def outreach_sent_last_hour(conn) -> int:
	cutoff = (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()
	try:
		rows = execute_sql(
			conn,
			"SELECT COUNT(*) AS total FROM outreach_log WHERE outcome = 'sent' AND created_at > ?",
			(cutoff,),
		)
	except Exception:
		return 0
	if not rows:
		return 0
	return int(list(rows[0].values())[0] or 0)


def resolve_sender() -> tuple[str, str]:
	"""
	Devolve (remetente, erro). Recusa enviar prospeção a partir do domínio de
	testes do Resend: os e-mails iriam quase todos para spam e queimariam a
	reputação de envio antes de haver clientes.
	"""
	sender = (os.getenv("SENDER_EMAIL") or "").strip()
	if not sender:
		return "", (
			"SENDER_EMAIL não está definida no servidor. Configure um remetente "
			"do domínio nexugal.com (verificado no Resend com SPF/DKIM) antes de enviar."
		)
	if "resend.dev" in sender.lower() and os.getenv("ALLOW_TEST_SENDER") != "1":
		return "", (
			"O remetente configurado ainda é o domínio de testes do Resend "
			"(onboarding@resend.dev). Verifique o domínio nexugal.com no Resend e "
			"defina SENDER_EMAIL antes de enviar prospeção."
		)
	return sender, ""


def send_outreach_email_via_resend(
	prospect: dict,
	sender: str,
	custom_subject: Optional[str] = None,
	custom_message: Optional[str] = None,
) -> tuple[bool, str]:
	"""Envia um e-mail de prospeção. Devolve (enviado, motivo_da_falha)."""
	api_key = os.getenv("RESEND_API_KEY")
	if not api_key or not HAS_RESEND:
		return False, "RESEND_API_KEY em falta ou biblioteca resend indisponível."

	resend.api_key = api_key
	to_email = str(prospect["email"]).lower().strip()

	# Validação de segurança: garantir que o e-mail de destino é seguro antes de enviar
	if not _is_email_safe(to_email):
		return False, "Endereço bloqueado pela política de segurança."

	name = _sanitize_str(str(prospect.get("name") or "Cliente"), 120)
	company = _sanitize_str(str(prospect.get("company") or prospect.get("name") or "a vossa empresa"), 120)
	category = _sanitize_str(str(prospect.get("category") or "tecnologia"), 100)
	source_url = _sanitize_str(str(prospect.get("source_url") or prospect.get("website") or ""), 250)

	# Sanitizar o assunto e a mensagem personalizada para prevenir header injection
	raw_subject = custom_subject or f"Otimização tecnológica & automação para {company} — NEXUGAL"
	subject = re.sub(r"[\r\n]", "", raw_subject)[:200]

	raw_message = custom_message or f"""Olá {name},

Esperamos que esteja a ter uma excelente semana.

Somos a NEXUGAL, uma consultoria tecnológica sediada em Braga especializada em apoiar empresas do setor de {category} a automatizarem processos manuais, desenvolverem plataformas web de alta performance e aumentarem a sua eficiência operacional.

Gostaríamos de agendar uma breve conversa sem compromisso de 10 minutos para analisar como podemos ajudar a {company} a poupar tempo e escalar os seus resultados através da tecnologia.

Pode responder a este e-mail ou agendar uma chamada connosco em https://www.nexugal.com.

Com os melhores cumprimentos,

Equipa NEXUGAL
Braga, Portugal
nexugal.geral@gmail.com
https://www.nexugal.com"""

	# Escapar HTML para prevenir XSS
	body_escaped = _escape_html(raw_message)
	unsubscribe_link = _unsubscribe_url(to_email)

	# Art. 14.º do RGPD: dizer à empresa de onde veio o contacto.
	if source_url:
		origem_html = (
			"Obtivemos o seu endereço a partir da informação de contacto publicada em "
			f'<a href="{_escape_html(source_url)}" style="color:#8b949e;">{_escape_html(source_url)}</a>. '
		)
	else:
		origem_html = "Obtivemos o seu endereço a partir da informação de contacto publicada no site da sua empresa. "

	html_content = f"""<!DOCTYPE html>
<html lang="pt-PT">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="font-family: Arial, sans-serif; background-color: #0d1117; padding: 20px; color: #c9d1d9;">
    <div style="max-width: 600px; margin: 0 auto; background: #161b22; padding: 30px; border-radius: 16px; border: 1px solid #30363d;">
        <h2 style="color: #00D1FF; font-family: monospace; letter-spacing: 2px;">NEXUGAL</h2>
        <div style="white-space: pre-wrap; font-size: 15px; line-height: 1.6; color: #e6edf3;">{body_escaped}</div>
        <hr style="border-color: #30363d; margin: 28px 0;">
        <p style="font-size: 11px; color: #8b949e; line-height: 1.5;">
            Este e-mail foi enviado pela NEXUGAL — Consultoria Tecnológica, Braga, Portugal.<br>
            {origem_html}<br>
            Não deseja receber mais comunicações nossas?
            <a href="{unsubscribe_link}" style="color: #00D1FF;">Cancelar com um clique</a>.
            O seu endereço é removido de imediato e em definitivo, nos termos do RGPD.
        </p>
    </div>
</body>
</html>"""

	try:
		resend.Emails.send({
			"from": sender,
			"to": [to_email],
			"subject": subject,
			"html": html_content,
			"headers": {
				# Exigido na prática pelo Gmail/Yahoo a quem envia em massa.
				"List-Unsubscribe": f"<{unsubscribe_link}>, <mailto:{UNSUBSCRIBE_MAILBOX}?subject=Cancelar%20subscricao>",
				"List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
			},
		})
		print(f"[RESEND OUTREACH] E-mail enviado para: {_mask_email(to_email)}")
		return True, ""
	except Exception as e:
		print(f"[RESEND OUTREACH ERROR] Falha ao enviar para {_mask_email(to_email)}: {type(e).__name__}")
		return False, f"Falha no envio ({type(e).__name__})."


# ==========================================
# ENDPOINTS DO SCRAPER
# ==========================================


@app.post("/api/scraper/search")
def run_scraper_search(payload: ScraperSearchIn, _: str = Depends(get_current_user)):
	# Auditoria de segurança: registar quem fez a pesquisa e quando
	print(f"[SCRAPER AUDIT] Pesquisa iniciada — região: {payload.region}, categoria: {payload.category}, "
		  f"tipo: {payload.client_type}, prioridade: {payload.priority}, ts: {datetime.now(timezone.utc).isoformat()}")

	results, diag = scrape_b2b_prospects(
		region=payload.region.strip(),
		category=payload.category.strip(),
		client_type=payload.client_type.strip(),
		priority=payload.priority.strip() or "media",
	)

	conn = get_db_connection()
	inserted_count = 0
	suppressed_skipped = 0
	try:
		for p in results:
			email = p.get("email", "")
			# Validação final antes de inserir na base de dados
			if not _is_email_safe(email):
				continue
			# Nunca voltar a guardar quem pediu para não ser contactado
			if is_email_suppressed(conn, email):
				suppressed_skipped += 1
				continue
			existing = execute_sql(conn, "SELECT id FROM prospects WHERE email = ?", (email,))
			if existing:
				continue
			try:
				execute_insert_sql(
					conn,
					"""
					INSERT INTO prospects (name, email, phone, company, website, region, category, client_type, priority, status, notes, created_at, source_url, is_role_address)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
					""",
					(
						_sanitize_str(p["name"], 200),
						email,
						_sanitize_str(p.get("phone", ""), 40),
						_sanitize_str(p.get("company", ""), 200),
						_sanitize_str(p.get("website", ""), 250),
						_sanitize_str(p["region"], 100),
						_sanitize_str(p["category"], 100),
						_sanitize_str(p["client_type"], 50),
						p["priority"],
						"novo",
						"",
						datetime.now(timezone.utc).isoformat(),
						_sanitize_str(p.get("source_url", ""), 250),
						bool(p.get("is_role_address", False)),
					),
				)
				inserted_count += 1
			except Exception as err:
				try:
					conn.rollback()
				except Exception:
					pass
				print(f"[SCRAPER] Inserção ignorada para {_mask_email(email)}: {type(err).__name__}")
	finally:
		conn.close()

	print(f"[SCRAPER AUDIT] Pesquisa concluída — {len(results)} encontrados, {inserted_count} novos, "
		  f"{diag['sites_visited']} sites visitados, {diag['blocked_by_robots']} bloqueados por robots.txt")

	if diag["search_error"]:
		message = diag["search_error"]
	elif not results:
		message = (
			f"Nenhum contacto encontrado. Visitámos {diag['sites_visited']} site(s) "
			f"mas nenhum publica e-mail acessível. Tente outra categoria ou região."
		)
	else:
		message = (
			f"{len(results)} contacto(s) encontrado(s) em {diag['sites_visited']} site(s) visitado(s); "
			f"{inserted_count} novo(s) guardado(s)."
		)

	return {
		"success": not bool(diag["search_error"]),
		"found": len(results),
		"new_inserted": inserted_count,
		"message": message,
		"diagnostics": {
			**diag,
			"suppressed_skipped": suppressed_skipped,
		},
	}


@app.get("/api/scraper/prospects", response_model=list[ProspectOut])
def list_prospects(
	region: Optional[str] = None,
	category: Optional[str] = None,
	priority: Optional[str] = None,
	status: Optional[str] = None,
	_: str = Depends(get_current_user),
):
	conn = get_db_connection()
	try:
		query = (
			"SELECT id, name, email, phone, company, website, region, category, client_type, "
			"priority, status, notes, created_at, source_url, is_role_address FROM prospects WHERE 1=1"
		)
		params = []
		if region:
			query += " AND LOWER(region) = LOWER(?)"
			params.append(region)
		if category:
			query += " AND LOWER(category) = LOWER(?)"
			params.append(category)
		if priority:
			query += " AND LOWER(priority) = LOWER(?)"
			params.append(priority)
		if status:
			query += " AND LOWER(status) = LOWER(?)"
			params.append(status)
		query += " ORDER BY created_at DESC"

		rows = execute_sql(conn, query, tuple(params))
		suppressed_rows = execute_sql(conn, "SELECT email FROM email_suppressions", ())
		suppressed = {str(r["email"]).lower() for r in suppressed_rows}
	finally:
		conn.close()

	return [
		ProspectOut(
			id=r["id"],
			name=r["name"],
			email=r["email"],
			phone=r["phone"] or "",
			company=r["company"] or "",
			website=r["website"] or "",
			region=r["region"],
			category=r["category"],
			client_type=r["client_type"],
			priority=r["priority"],
			status=r["status"],
			notes=r["notes"] or "",
			created_at=r["created_at"],
			source_url=r.get("source_url") or "",
			is_role_address=bool(r.get("is_role_address")),
			suppressed=str(r["email"]).lower() in suppressed,
		)
		for r in rows
	]


@app.patch("/api/scraper/prospects/{prospect_id}")
def update_prospect(prospect_id: int, payload: ProspectUpdateIn, _: str = Depends(get_current_user)):
	conn = get_db_connection()
	try:
		fields = []
		params = []
		if payload.status:
			# Guardar sempre em minúsculas: o resto do código compara com 'ignorado'
			fields.append("status = ?")
			params.append(payload.status.lower().strip())
		if payload.priority:
			fields.append("priority = ?")
			params.append(payload.priority.lower().strip())
		if payload.notes is not None:
			fields.append("notes = ?")
			params.append(payload.notes)

		if not fields:
			return {"success": True, "updated": False}

		params.append(prospect_id)
		execute_sql(conn, f"UPDATE prospects SET {', '.join(fields)} WHERE id = ?", tuple(params))

		# Marcar como 'ignorado' equivale a pedir para não ser contactado.
		if payload.status and payload.status.lower().strip() == "ignorado":
			rows = execute_sql(conn, "SELECT email FROM prospects WHERE id = ?", (prospect_id,))
			if rows:
				add_email_suppression(conn, str(rows[0]["email"]), "marcado como ignorado no painel")
	finally:
		conn.close()
	return {"success": True, "updated": True}


@app.post("/api/scraper/send-outreach")
def send_prospect_outreach(payload: OutreachSendIn, _: str = Depends(get_current_user)):
	if not payload.prospect_ids:
		raise HTTPException(status_code=400, detail="Selecione pelo menos um prospect.")

	if len(payload.prospect_ids) > MAX_OUTREACH_PER_BATCH:
		raise HTTPException(
			status_code=400,
			detail=f"Máximo de {MAX_OUTREACH_PER_BATCH} e-mails por operação. Divida em lotes.",
		)

	sender, sender_error = resolve_sender()
	if sender_error:
		raise HTTPException(status_code=400, detail=sender_error)

	# Garantir que não há IDs duplicados na lista (previne envio em duplicado)
	unique_ids = list(dict.fromkeys(payload.prospect_ids))

	conn = get_db_connection()
	sent_count = 0
	failed_count = 0
	skipped: list[str] = []
	try:
		already_sent = outreach_sent_last_hour(conn)
		remaining_quota = max(0, MAX_OUTREACH_PER_HOUR - already_sent)
		if remaining_quota <= 0:
			raise HTTPException(
				status_code=429,
				detail=(
					f"Limite de {MAX_OUTREACH_PER_HOUR} e-mails por hora atingido "
					"(proteção da reputação do domínio). Tente mais tarde."
				),
			)

		for pid in unique_ids:
			if sent_count >= remaining_quota:
				skipped.append("limite horário atingido")
				break

			rows = execute_sql(conn, "SELECT * FROM prospects WHERE id = ?", (pid,))
			if not rows:
				continue
			prospect = rows[0]
			email = str(prospect.get("email") or "").lower().strip()

			# Não enviar para prospects já marcados como 'ignorado'
			if str(prospect.get("status") or "").lower() == "ignorado":
				skipped.append(f"{prospect.get('company') or email}: marcado como ignorado")
				continue

			# Nunca escrever a quem pediu para não ser contactado
			if is_email_suppressed(conn, email):
				skipped.append(f"{prospect.get('company') or email}: pediu para não ser contactado")
				log_outreach(conn, pid, email, payload.subject or "", "suppressed")
				continue

			# Endereços de pessoas (joao.silva@) exigem confirmação explícita:
			# o RGPD trata-os de forma bem mais exigente do que geral@empresa.pt.
			if not bool(prospect.get("is_role_address")) and not payload.allow_personal:
				skipped.append(f"{prospect.get('company') or email}: endereço pessoal, precisa de confirmação")
				continue

			ok, reason = send_outreach_email_via_resend(prospect, sender, payload.subject, payload.message)
			if ok:
				execute_sql(conn, "UPDATE prospects SET status = 'contactado' WHERE id = ?", (pid,))
				log_outreach(conn, pid, email, payload.subject or "", "sent")
				sent_count += 1
			else:
				log_outreach(conn, pid, email, payload.subject or "", "failed")
				skipped.append(f"{prospect.get('company') or email}: {reason}")
				failed_count += 1
	finally:
		conn.close()

	print(f"[OUTREACH AUDIT] Lote concluído — enviados: {sent_count}, falhados: {failed_count}, ignorados: {len(skipped)}")
	return {
		"success": True,
		"sent_count": sent_count,
		"failed_count": failed_count,
		"skipped": skipped[:MAX_OUTREACH_PER_BATCH],
	}


# ==========================================
# CANCELAMENTO DE SUBSCRIÇÃO (PÚBLICO)
# ==========================================

_UNSUB_PAGE = """<!DOCTYPE html>
<html lang="pt-PT"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>NEXUGAL — Subscrição cancelada</title></head>
<body style="font-family: Arial, sans-serif; background:#0d1117; color:#c9d1d9; padding:40px;">
  <div style="max-width:540px; margin:0 auto; background:#161b22; border:1px solid #30363d; border-radius:16px; padding:32px;">
    <h2 style="color:#00D1FF; font-family:monospace; letter-spacing:2px;">NEXUGAL</h2>
    <p style="font-size:16px; line-height:1.6;">{mensagem}</p>
    <p style="font-size:12px; color:#8b949e;">NEXUGAL — Consultoria Tecnológica, Braga, Portugal</p>
  </div>
</body></html>"""


def _process_unsubscribe(email: str, token: str) -> str:
	email = (email or "").lower().strip()
	if not email or not hmac.compare_digest(token or "", _unsubscribe_token(email)):
		return "Ligação de cancelamento inválida ou expirada. Responda ao e-mail que recebeu e removemos o seu endereço manualmente."

	conn = get_db_connection()
	try:
		add_email_suppression(conn, email, "cancelamento pedido pelo destinatário")
		execute_sql(conn, "UPDATE prospects SET status = 'ignorado' WHERE email = ?", (email,))
	finally:
		conn.close()
	print(f"[UNSUBSCRIBE] Endereço removido a pedido: {_mask_email(email)}")
	return "O seu endereço foi removido. Não voltará a receber comunicações da NEXUGAL."


@app.get("/api/outreach/unsubscribe", response_class=HTMLResponse)
def unsubscribe_get(e: str = "", t: str = ""):
	return HTMLResponse(_UNSUB_PAGE.replace("{mensagem}", _process_unsubscribe(e, t)))


@app.post("/api/outreach/unsubscribe", response_class=HTMLResponse)
def unsubscribe_post(e: str = "", t: str = ""):
	# Suporta o cancelamento de um clique do Gmail/Yahoo (List-Unsubscribe-Post).
	return HTMLResponse(_UNSUB_PAGE.replace("{mensagem}", _process_unsubscribe(e, t)))
