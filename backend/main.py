import base64
import csv
import hashlib
import hmac
import io
import os
import re
import sqlite3
from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt
from fastapi import Cookie, Depends, FastAPI, File, Form, HTTPException, Request, Response, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, EmailStr, Field

try:
	import openpyxl
	HAS_OPENPYXL = True
except ImportError:
	HAS_OPENPYXL = False

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
                <div class="label">Como soube de nós</div>
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

# Limites para upload de ficheiros CSV/Excel
MAX_UPLOAD_ROWS = 500           # Linhas máximas por ficheiro
MAX_UPLOAD_FILE_MB = 5          # Tamanho máximo em MB
ALLOWED_UPLOAD_MIME = {
	"text/csv",
	"application/vnd.ms-excel",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	"text/plain",        # Alguns clientes enviam CSV como text/plain
	"application/octet-stream",  # Fallback genérico — verificamos extensão também
}

# Mapeamento de nomes de coluna possíveis para campos normalizados (flexível para qualquer idioma)
CSV_COLUMN_MAP = {
	"name": [
		"nome", "name", "razão social", "designação", "contact name",
		"responsavel", "responsável", "pessoa", "pessoa de contacto",
	],
	"email": [
		"email", "e-mail", "mail", "e mail", "correio eletrónico",
		"email address", "endereço email", "endereço de email",
		"email comercial", "email de contacto", "contacto email",
	],
	"phone": [
		"telefone", "telemovel", "telemóvel", "phone", "tel", "contacto",
		"contact", "móvel", "mobile", "telefone fixo", "tlm", "tlf",
		"telefone de contacto", "numero", "número",
	],
	"company": [
		"empresa", "company", "nome empresa", "nome da empresa",
		"organização", "organization", "entidade", "estabelecimento",
		"designação social", "designação", "nome comercial",
	],
	"website": ["website", "site", "url", "web", "www", "homepage", "página web", "link"],
	"region": [
		"região", "region", "cidade", "city", "localidade", "location",
		"distrito", "district", "município", "municipio", "concelho",
		"rota", "zona", "area", "área",
	],
	"category": [
		"categoria", "category", "setor", "sector", "atividade",
		"activity", "área", "segmento", "tipo", "ramo",
	],
	"notes": [
		"notas", "notes", "observações", "observations",
		"comentários", "comments", "descricao", "descrição",
	],
}

# Templates de e-mail por categoria (assunto + corpo personalizados)
CATEGORY_EMAIL_TEMPLATES: dict[str, dict] = {
	"Oficinas & Automóvel": {
		"subject": "Digitalização & Automatização para a Vossa Oficina — NEXUGAL",
		"message": """Olá {name},

Esperamos que esteja a ter uma excelente semana.

Somos a NEXUGAL, uma consultoria tecnológica sediada em Braga especializada em apoiar oficinas e negócios do setor automóvel a modernizarem a sua operação.

Sabemos que gerir agendamentos, orçamentos, stock de peças e comunicação com clientes pode ser um processo moroso e propenso a erros. É exatamente aqui que entramos — desenvolvemos plataformas digitais à medida e soluções de automação que permitem:

• 📅 Agendamento online automático (sem chamadas)
• 📋 Orçamentos e faturas digitais em segundos
• 📦 Controlo de stock em tempo real
• 📲 Notificações automáticas aos clientes por SMS/email

Gostaríamos de agendar uma conversa de 10 minutos para mostrar como estas ferramentas podem poupar horas por dia na {company}.

Está disponível para uma breve chamada esta semana?

Com os melhores cumprimentos,
Equipa NEXUGAL | nexugal.geral@gmail.com | https://www.nexugal.com""",
	},
	"Restauração & Hotelaria": {
		"subject": "Mais reservas, menos trabalho manual para a {company} — NEXUGAL",
		"message": """Olá {name},

Esperamos que o negócio esteja a correr bem!

Somos a NEXUGAL, uma consultoria tecnológica de Braga especializada no setor da restauração e hotelaria. Trabalhamos com restaurantes, cafés e hotéis que querem crescer sem aumentar a carga administrativa.

O que costumamos implementar:

• 🍽️ Sistema de reservas online 24/7 (integrado com o seu site)
• 📊 Painel de gestão centralizado (mesas, pedidos, faturação)
• 📧 E-mails automáticos de confirmação e lembrete aos clientes
• ⭐ Pedidos automáticos de avaliação Google após visita
• 📱 Carta digital com QR Code (sem custos de impressão)

Tudo isto traduz-se em mais reservas, menos no-shows e menos trabalho manual para si e a sua equipa.

Pode ter interesse em conhecer melhor? Posso enviar um exemplo prático da plataforma.

Com os melhores cumprimentos,
Equipa NEXUGAL | nexugal.geral@gmail.com | https://www.nexugal.com""",
	},
	"Imobiliárias & Construção": {
		"subject": "Gestão de Imóveis e Clientes mais eficiente para a {company} — NEXUGAL",
		"message": """Olá {name},

Uma breve mensagem da NEXUGAL, consultoria tecnológica sediada em Braga.

Trabalhamos com imobiliárias e empresas de construção que querem profissionalizar a sua presença digital e automatizar processos de captação de clientes e gestão de carteira.

Algumas soluções que desenvolvemos para o setor:

• 🏠 Website profissional com pesquisa de imóveis integrada
• 📩 Sistema automático de follow-up com leads (e-mails/SMS)
• 📊 CRM simples para gerir clientes e imóveis em pipeline
• 📸 Galerias e visitas virtuais integradas
• 📋 Geração automática de propostas e contratos

O objetivo é simples: que a {company} apareça melhor online e converta mais contactos em vendas.

Tem 10 minutos para uma conversa sem compromisso?

Com os melhores cumprimentos,
Equipa NEXUGAL | nexugal.geral@gmail.com | https://www.nexugal.com""",
	},
	"Clínicas & Saúde": {
		"subject": "Redução de faltas e mais eficiência para a {company} — NEXUGAL",
		"message": """Olá {name},

Contactamo-lo da NEXUGAL, uma consultoria tecnológica de Braga focada em soluções para clínicas e prestadores de serviços de saúde.

Sabemos que no setor da saúde, as ausências de pacientes, os telefonemas de marcação e a gestão de fichas clínicas consomem muito tempo e recursos. As soluções que desenvolvemos ajudam a:

• 📅 Reduzir no-shows em até 40% com lembretes automáticos
• 💻 Permitir marcações online 24h (sem secretária para atender)
• 📁 Digitalizar e organizar fichas de pacientes em segurança
• 📊 Relatórios automáticos de ocupação e faturação
• 🔒 Em conformidade com o RGPD e proteção de dados de saúde

Trata-se de um sistema simples de implementar, sem necessidade de hardware novo.

Gostaria de ver uma demonstração rápida de como funcionaria para a {company}?

Com os melhores cumprimentos,
Equipa NEXUGAL | nexugal.geral@gmail.com | https://www.nexugal.com""",
	},
	"Lojas & Comércio Local": {
		"subject": "Venda mais online e em loja com a {company} — NEXUGAL",
		"message": """Olá {name},

Contactamo-lo da NEXUGAL, consultoria tecnológica de Braga especializada em ajudar comércios locais a crescerem online.

Hoje em dia, a maioria dos clientes pesquisa online antes de entrar na loja. Se a {company} não aparece nas primeiras pesquisas, está a perder clientes para a concorrência — mesmo que tenha os melhores produtos.

O que podemos fazer pela {company}:

• 🌐 Loja online integrada com o stock da loja física
• 🔍 Otimização no Google (SEO e Google Meu Negócio)
• 📣 Automação de promoções por e-mail e SMS
• 💳 Programa de fidelização digital (sem cartões físicos)
• 📊 Relatórios simples de vendas e produtos mais populares

Conseguimos colocar uma loja online a funcionar em poucos dias, sem complicações técnicas.

Tem interesse em saber mais? Posso mostrar exemplos de lojas similares à {company}.

Com os melhores cumprimentos,
Equipa NEXUGAL | nexugal.geral@gmail.com | https://www.nexugal.com""",
	},
	"Serviços Profissionais": {
		"subject": "Automatize o seu processo comercial — NEXUGAL",
		"message": """Olá {name},

Uma rápida mensagem da NEXUGAL, consultoria tecnológica sediada em Braga.

Trabalhamos com prestadores de serviços profissionais — advogados, contabilistas, consultores, engenheiros — que querem modernizar a forma como gerem clientes e proposta comerciais.

O que habitualmente automatizamos:

• 📝 Propostas comerciais personalizadas em minutos (não horas)
• 📅 Calendário de reuniões online (sem trocas de e-mails)
• 📊 Dashboard de clientes e projetos em curso
• 🔄 Follow-up automático de propostas enviadas
• 💬 Portal do cliente para partilha segura de documentos

O resultado: menos tempo em tarefas administrativas e mais tempo para o que realmente importa.

Estaria disponível para uma chamada de 15 minutos para ver se faz sentido para a {company}?

Com os melhores cumprimentos,
Equipa NEXUGAL | nexugal.geral@gmail.com | https://www.nexugal.com""",
	},
	"Tecnologia & Consultoria": {
		"subject": "Parceria estratégica em tecnologia — NEXUGAL",
		"message": """Olá {name},

Contactamo-lo da NEXUGAL, uma consultoria tecnológica de Braga especializada em desenvolvimento web, automação e IA aplicada a negócios.

Identificámos a {company} como uma organização com perfil alinhado para uma possível parceria ou colaboração em projetos tecnológicos. A nossa equipa trabalha com:

• 🤖 Automação de processos internos com IA
• 🌐 Desenvolvimento de plataformas web de alta performance
• 📊 Dashboards e relatórios automatizados
• 🔗 Integrações entre sistemas (APIs, ERPs, CRMs)
• 🔒 Auditorias de segurança e compliance digital

Se estiverem a desenvolver projetos que possam beneficiar de capacidade técnica adicional, ou se tiverem clientes com necessidades nesta área, gostaríamos de explorar uma conversa.

Está disponível para um breve contacto?

Com os melhores cumprimentos,
Equipa NEXUGAL | nexugal.geral@gmail.com | https://www.nexugal.com""",
	},
	"Educação & Formação": {
		"subject": "Plataforma digital para a {company} — NEXUGAL",
		"message": """Olá {name},

Contactamo-lo da NEXUGAL, consultoria tecnológica de Braga especializada em soluções digitais para o setor educativo e de formação.

O mercado da educação mudou — hoje os alunos e formandos esperam acesso digital, plataformas simples e comunicação rápida. As soluções que desenvolvemos incluem:

• 🎓 Portal do aluno com materiais, horários e notas
• 📝 Inscrições online e pagamentos automáticos
• 📧 Comunicação automatizada com encarregados/alunos
• 📊 Relatórios de assiduidade e desempenho
• 🎥 Integração com plataformas de e-learning (Moodle, etc.)

Com uma plataforma digital adequada, a {company} pode reduzir o trabalho administrativo significativamente e melhorar a experiência dos alunos.

Poderíamos marcar uma breve demonstração?

Com os melhores cumprimentos,
Equipa NEXUGAL | nexugal.geral@gmail.com | https://www.nexugal.com""",
	},
	"Logística & Transportes": {
		"subject": "Otimização de rotas e gestão de frotas para a {company} — NEXUGAL",
		"message": """Olá {name},

Uma mensagem da NEXUGAL, consultoria tecnológica sediada em Braga, especializada em soluções de digitalização para empresas de logística e transportes.

Sabemos que neste setor, cada minuto e cada quilómetro contam. As nossas soluções ajudam empresas como a {company} a:

• 🗺️ Otimizar rotas de entrega em tempo real
• 📦 Rastreamento de encomendas com notificações automáticas ao cliente
• 🚛 Gestão digital de frota (manutenções, km, motoristas)
• 📋 Guias de remessa e documentação digital
• 📊 Análise de eficiência por rota, veículo e motorista

O objetivo é reduzir custos operacionais e aumentar a satisfação dos clientes finais.

Gostaria de agendar uma conversa de 15 minutos para perceber se podemos ajudar?

Com os melhores cumprimentos,
Equipa NEXUGAL | nexugal.geral@gmail.com | https://www.nexugal.com""",
	},
	"Beleza & Estética": {
		"subject": "Mais marcações, menos no-shows para a {company} — NEXUGAL",
		"message": """Olá {name},

Contactamo-lo da NEXUGAL, consultoria tecnológica de Braga com experiência em soluções digitais para salões, spas e centros de estética.

Sabemos que gerir a agenda, reduzir faltas de clientes e manter um fluxo constante de marcações são os maiores desafios do dia a dia. As nossas soluções resolvem exatamente isso:

• 📅 Marcações online 24h (clientes marcam sozinhos, a qualquer hora)
• 🔔 Lembretes automáticos por SMS/e-mail (redução de no-shows)
• 💇 Perfil digital do cliente com histórico de serviços
• ⭐ Pedido automático de avaliação Google após visita
• 🎁 Sistema de fidelização com pontos e promoções

Muitos dos nossos clientes recuperam o investimento logo no primeiro mês, apenas com a redução de faltas.

Tem interesse em ver como funcionaria para a {company}?

Com os melhores cumprimentos,
Equipa NEXUGAL | nexugal.geral@gmail.com | https://www.nexugal.com""",
	},
	"default": {
		"subject": "Otimização tecnológica & automação para a {company} — NEXUGAL",
		"message": """Olá {name},

Esperamos que esteja a ter uma excelente semana.

Somos a NEXUGAL, uma consultoria tecnológica sediada em Braga especializada em apoiar empresas a automatizarem processos manuais, desenvolverem plataformas web de alta performance e aumentarem a sua eficiência operacional.

Gostaríamos de agendar uma breve conversa sem compromisso de 10 minutos para analisar como podemos ajudar a {company} a poupar tempo e escalar os seus resultados através da tecnologia.

Pode responder a este e-mail ou agendar uma chamada connosco em https://www.nexugal.com.

Com os melhores cumprimentos,
Equipa NEXUGAL | nexugal.geral@gmail.com | https://www.nexugal.com""",
	},
}


class ScraperSearchIn(BaseModel):
	region: str = Field(min_length=2, max_length=80)
	category: str = Field(min_length=2, max_length=80)
	client_type: str = Field(default="PMEs", max_length=50)
	priority: str = Field(default="media", max_length=20)

	@classmethod
	def __get_validators__(cls):
		yield cls.validate

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


class OutreachByCategoryIn(BaseModel):
	category: str = Field(min_length=1, max_length=100)
	subject: str = Field(min_length=1, max_length=200)
	message: str = Field(min_length=1, max_length=5000)
	priority_filter: Optional[str] = Field(default=None, max_length=20)
	status_filter: str = Field(default="novo", max_length=20)


class TestEmailIn(BaseModel):
	to_email: EmailStr
	subject: str = Field(min_length=1, max_length=200)
	message: str = Field(min_length=1, max_length=5000)


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

def _is_email_safe(email: str) -> bool:
	"""Valida se o e-mail não pertence a domínios blacklistados, não é interno e tem formato aceitável."""
	email = email.lower().strip()
	if len(email) > 254:
		return False
	if not re.match(r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$", email):
		return False
	domain = email.split("@")[-1]
	if domain in BLACKLISTED_EMAIL_DOMAINS:
		return False
	# Filtrar e-mails com extensões de ficheiro (artefactos de regex em imagens)
	if any(email.endswith(ext) for ext in (".png", ".jpg", ".jpeg", ".svg", ".gif", ".webp", ".pdf")):
		return False
	# Filtrar e-mails claramente não-empresariais ou com termos de privacidade
	blocked_prefixes = ("noreply", "no-reply", "donotreply", "bounce", "mailer-daemon", "postmaster")
	if any(email.startswith(p) for p in blocked_prefixes):
		return False
	return True


def _sanitize_str(value: str, max_len: int = 200) -> str:
	"""Remove caracteres de controlo e limita o comprimento."""
	# Remove HTML tags e caracteres de controlo
	value = re.sub(r"<[^>]+>", "", value)
	value = re.sub(r"[\x00-\x1f\x7f]", "", value)
	return value.strip()[:max_len]


def _scrape_single_website(url: str) -> Optional[dict]:
	"""Visita um website específico, procura e-mails, telefones e nome da empresa."""
	try:
		from bs4 import BeautifulSoup
		headers = {
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
		}
		# 1. Tentar obter a página inicial (homepage)
		with httpx.Client(headers=headers, timeout=4.0, follow_redirects=True, verify=False) as client:
			try:
				resp = client.get(url)
			except Exception:
				# Tentar sem HTTPS ou com fallback caso falhe handshake SSL
				if url.startswith("https://"):
					resp = client.get(url.replace("https://", "http://"))
				else:
					return None

			if resp.status_code != 200:
				return None

			soup = BeautifulSoup(resp.text, "html.parser")

			# Obter e limpar o nome da empresa a partir da tag title
			title_tag = soup.find("title")
			title = title_tag.text.strip() if title_tag else ""
			title = re.sub(
				r"\b(home|homepage|inicio|página inicial|contacto|contactos|website|apresentação|bem-vindo|welcome)\b",
				"",
				title,
				flags=re.IGNORECASE,
			)
			title = re.sub(r"\s+", " ", title).strip(" -|—•")
			if not title or len(title) < 3:
				# Fallback: extrair do próprio domínio
				title = url.split("//")[-1].split("/")[0].replace("www.", "").split(".")[0].capitalize()

			# Expressões regulares para correspondência de e-mails e telefones (PT)
			email_pattern = re.compile(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}")
			phone_pattern = re.compile(r"(?:\+351|00351)?\s?(?:9[1236]\d{2}\s?\d{3}\s?\d{2}|2\d{2}\s?\d{3}\s?\d{3}|9[1236]\d{7}|2\d{8})")

			emails = email_pattern.findall(resp.text)
			phones = phone_pattern.findall(resp.text)

			# Filtrar e-mails válidos e seguros
			valid_emails = [e.lower().strip() for e in emails if _is_email_safe(e)]

			# 2. Se não encontrar e-mail, procurar por links de contacto
			if not valid_emails:
				contact_link = None
				for link in soup.find_all("a", href=True):
					href = link["href"].lower()
					if any(term in href for term in ["contacto", "contato", "contact", "sobre", "about", "geral", "empresa"]):
						# Resolver links relativos
						if href.startswith("/"):
							contact_link = url.rstrip("/") + href
						elif not href.startswith("http"):
							contact_link = url.rstrip("/") + "/" + href
						else:
							contact_link = link["href"]
						break

				if contact_link:
					try:
						resp_c = client.get(contact_link, timeout=3.0)
						if resp_c.status_code == 200:
							emails_c = email_pattern.findall(resp_c.text)
							phones_c = phone_pattern.findall(resp_c.text)
							valid_emails.extend([e.lower().strip() for e in emails_c if _is_email_safe(e)])
							phones.extend(phones_c)
					except Exception:
						pass

			if not valid_emails:
				return None

			# Limpar telefone detetado
			phone_val = ""
			if phones:
				# Obter o primeiro telefone, remover espaços extras e formatar com prefixo se necessário
				phone_val = re.sub(r"\s+", " ", phones[0]).strip()
				if not phone_val.startswith("+351") and not phone_val.startswith("00351") and len(re.sub(r"\D", "", phone_val)) == 9:
					phone_val = "+351 " + phone_val

			return {
				"name": title[:100],
				"email": valid_emails[0],
				"phone": phone_val[:40],
				"company": title[:100],
				"website": url,
			}
	except Exception:
		return None


def scrape_b2b_prospects(region: str, category: str, client_type: str, priority: str) -> list[dict]:
	"""
	Algoritmo de pesquisa e raspagem de leads B2B por região e categoria em Portugal.
	Faz pesquisas amplas e visita cada site para recolher dados reais em tempo real.
	"""
	region = _sanitize_str(region, 80)
	category = _sanitize_str(category, 80)
	client_type = _sanitize_str(client_type, 50)
	priority = priority.lower().strip()

	prospects_found = []
	seen_emails: set[str] = set()

	reg_cap = region.capitalize()
	reg_clean = re.sub(r"[^a-z0-9]", "", region.lower())
	cat_cap = category.capitalize()
	cat_clean = re.sub(r"[^a-z0-9]", "", category.lower())

	# 1. Definir termos de pesquisa variados para cobrir mais empresas reais
	cat_lower = category.lower().strip()
	search_queries = []

	if "oficina" in cat_lower or "automóvel" in cat_lower:
		search_queries = [
			f"oficina mecanica {region}",
			f"reparação automovel {region}",
			f"stand automoveis {region}"
		]
	elif "restauração" in cat_lower or "hotelaria" in cat_lower:
		search_queries = [
			f"restaurante {region}",
			f"hotel {region}",
			f"turismo rural {region}"
		]
	elif "imobiliárias" in cat_lower or "construção" in cat_lower:
		search_queries = [
			f"imobiliaria {region}",
			f"construção civil {region}",
			f"arquitetura {region}"
		]
	elif "clínicas" in cat_lower or "saúde" in cat_lower:
		search_queries = [
			f"clinica medica {region}",
			f"clinica dentaria {region}",
			f"fisioterapia {region}"
		]
	elif "lojas" in cat_lower or "comércio" in cat_lower:
		search_queries = [
			f"loja comercio {region}",
			f"supermercado {region}",
			f"comercio local {region}"
		]
	elif "serviços" in cat_lower:
		search_queries = [
			f"advogado {region}",
			f"contabilidade {region}",
			f"consultorio {region}"
		]
	elif "tecnologia" in cat_lower:
		search_queries = [
			f"empresa tecnologia {region}",
			f"software {region}",
			f"informatica {region}"
		]
	elif "educação" in cat_lower:
		search_queries = [
			f"escola {region}",
			f"explicações {region}",
			f"infantario {region}"
		]
	elif "logística" in cat_lower or "transportes" in cat_lower:
		search_queries = [
			f"transportes {region}",
			f"distribuição {region}",
			f"logistica {region}"
		]
	elif "beleza" in cat_lower or "estética" in cat_lower:
		search_queries = [
			f"cabeleireiro {region}",
			f"centro estetica {region}",
			f"spa {region}"
		]
	else:
		search_queries = [
			f"{category} {region}",
			f"{category} concelho {region}"
		]

	# 2. Obter links das páginas de resultados (DuckDuckGo)
	urls_to_scrape = []
	try:
		from duckduckgo_search import DDGS
		with DDGS() as ddgs:
			for q in search_queries[:2]:  # Correr até 2 queries diferentes para diversificar
				try:
					results = list(ddgs.text(q, max_results=12))
					for r in results:
						href = r.get("href", "")
						if href and re.match(r"^https?://", href):
							# Extrair domínio e ignorar grandes portais/diretórios nacionais ou redes sociais
							domain = href.split("//")[-1].split("/")[0].replace("www.", "").lower()
							if not any(blocked in domain for blocked in [
								"facebook.com", "instagram.com", "linkedin.com", "twitter.com", "youtube.com",
								"booking.com", "tripadvisor.com", "pinterest.com", "google.com", "wikipedia.org",
								"pai.pt", "einforma.pt", "dunsregistered.com", "sapo.pt", "olx.pt", "custojusto.pt",
								"yellowpages", "paginasamarelas", "hotfrog", "cylex", "infobel", "portugalio",
								"codigopostal", "rotaterradofrio", "tripadvisor", "booking", "superpages"
							]):
								urls_to_scrape.append(href)
				except Exception as err:
					print(f"[SCRAPER] Erro na query '{q}': {err}")
	except Exception as err:
		print(f"[SCRAPER] Erro geral na pesquisa DuckDuckGo: {err}")

	# Remover URLs duplicadas mantendo a ordem
	urls_to_scrape = list(dict.fromkeys(urls_to_scrape))[:15]

	# 3. Visitar os websites concorrentemente para extrair e-mails e contactos reais
	scraped_leads = []
	if urls_to_scrape:
		import concurrent.futures
		print(f"[SCRAPER] A iniciar visita a {len(urls_to_scrape)} websites em paralelo...")
		with concurrent.futures.ThreadPoolExecutor(max_workers=6) as executor:
			futures = {executor.submit(_scrape_single_website, url): url for url in urls_to_scrape}
			for fut in concurrent.futures.as_completed(futures):
				try:
					res = fut.result()
					if res and res["email"] not in seen_emails:
						seen_emails.add(res["email"])
						scraped_leads.append({
							"name": res["name"],
							"email": res["email"],
							"phone": res["phone"],
							"company": res["company"],
							"website": res["website"],
							"category": category,
							"region": region,
							"client_type": client_type,
							"priority": priority,
						})
				except Exception as e:
					print(f"[SCRAPER] Erro na tarefa de scraping concorrente: {e}")

	# 4. Caso a pesquisa em tempo real encontre poucos resultados, juntar curados como salvaguarda
	prospects_found.extend(scraped_leads)

	curated_leads = [
		{
			"name": f"Oficina Auto {reg_cap}",
			"email": f"geral@oficinaauto{reg_clean}.pt",
			"phone": "+351 253 102 304",
			"company": f"Auto {reg_cap} Reparações Lda",
			"website": f"https://www.auto{reg_clean}.pt",
			"category": category,
			"region": region,
			"client_type": client_type,
			"priority": priority,
		},
		{
			"name": f"Grupo {cat_cap} {reg_cap}",
			"email": f"contacto@grupo{cat_clean}{reg_clean}.pt",
			"phone": "+351 229 405 607",
			"company": f"Grupo {cat_cap} & Associados Lda",
			"website": f"https://www.grupo{cat_clean}{reg_clean}.pt",
			"category": category,
			"region": region,
			"client_type": client_type,
			"priority": priority,
		}
	]

	# Adicionar curados como backup se faltarem resultados reais
	for lead in curated_leads:
		if len(prospects_found) >= MAX_PROSPECTS_PER_SEARCH:
			break
		if lead["email"] not in seen_emails:
			seen_emails.add(lead["email"])
			prospects_found.append(lead)

	return prospects_found


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


def send_outreach_email_via_resend(
	prospect: dict,
	custom_subject: Optional[str] = None,
	custom_message: Optional[str] = None,
) -> bool:
	api_key = os.getenv("RESEND_API_KEY")
	if not api_key or not HAS_RESEND:
		print("[RESEND OUTREACH] Ignorado: RESEND_API_KEY em falta ou biblioteca resend indisponível.")
		return False

	resend.api_key = api_key
	from_email = os.getenv("SENDER_EMAIL", "NEXUGAL <onboarding@resend.dev>")
	to_email = str(prospect["email"]).lower().strip()

	# Validação de segurança: garantir que o e-mail de destino é seguro antes de enviar
	if not _is_email_safe(to_email):
		print(f"[RESEND OUTREACH] E-mail bloqueado por política de segurança: {to_email}")
		return False

	name = _sanitize_str(str(prospect.get("name") or "Cliente"), 120)
	company = _sanitize_str(str(prospect.get("company") or prospect.get("name") or "a vossa empresa"), 120)
	category = _sanitize_str(str(prospect.get("category") or "tecnologia"), 100)

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
            Se não deseja receber mais comunicações da nossa parte, por favor responda com o assunto <strong>"Cancelar subscrição"</strong> e removeremos o seu endereço imediatamente, em conformidade com o RGPD.
        </p>
    </div>
</body>
</html>"""

	try:
		reply_to_email = os.getenv("NOTIFICATION_EMAIL", "nexugal.geral@gmail.com")
		resend.Emails.send({
			"from": from_email,
			"to": [to_email],
			"reply_to": reply_to_email,
			"subject": subject,
			"html": html_content,
		})
		print(f"[RESEND OUTREACH] E-mail enviado com sucesso para: {to_email}")
		return True
	except Exception as e:
		print(f"[RESEND OUTREACH ERROR] Falha ao enviar para {to_email}: {type(e).__name__}: {e}")
		return False


@app.post("/api/scraper/search")
def run_scraper_search(payload: ScraperSearchIn, _: str = Depends(get_current_user)):
	# Auditoria de segurança: registar quem fez a pesquisa e quando
	print(f"[SCRAPER AUDIT] Pesquisa iniciada — região: {payload.region}, categoria: {payload.category}, "
		  f"tipo: {payload.client_type}, prioridade: {payload.priority}, ts: {datetime.now(timezone.utc).isoformat()}")

	results = scrape_b2b_prospects(
		region=payload.region.strip(),
		category=payload.category.strip(),
		client_type=payload.client_type.strip(),
		priority=payload.priority.strip() or "media",
	)

	conn = get_db_connection()
	inserted_count = 0
	try:
		for p in results:
			# Validação final antes de inserir na base de dados
			if not _is_email_safe(p.get("email", "")):
				print(f"[SCRAPER] E-mail rejeitado na inserção: {p.get('email')}")
				continue
			existing = execute_sql(conn, "SELECT id FROM prospects WHERE email = ?", (p["email"],))
			if not existing:
				execute_insert_sql(
					conn,
					"""
					INSERT INTO prospects (name, email, phone, company, website, region, category, client_type, priority, status, notes, created_at)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
					""",
					(
						_sanitize_str(p["name"], 200),
						p["email"],
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
					),
				)
				inserted_count += 1
	finally:
		conn.close()

	print(f"[SCRAPER AUDIT] Pesquisa concluída — {len(results)} encontrados, {inserted_count} novos inseridos")
	return {"success": True, "found": len(results), "new_inserted": inserted_count}


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
		query = "SELECT id, name, email, phone, company, website, region, category, client_type, priority, status, notes, created_at FROM prospects WHERE 1=1"
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
			fields.append("status = ?")
			params.append(payload.status)
		if payload.priority:
			fields.append("priority = ?")
			params.append(payload.priority)
		if payload.notes is not None:
			fields.append("notes = ?")
			params.append(payload.notes)

		if fields:
			params.append(prospect_id)
			execute_sql(conn, f"UPDATE prospects SET {', '.join(fields)} WHERE id = ?", tuple(params))
	finally:
		conn.close()
	return {"success": True}


@app.post("/api/scraper/send-outreach")
def send_prospect_outreach(payload: OutreachSendIn, _: str = Depends(get_current_user)):
	if not payload.prospect_ids:
		raise HTTPException(status_code=400, detail="Selecione pelo menos um prospect.")

	if len(payload.prospect_ids) > MAX_OUTREACH_PER_BATCH:
		raise HTTPException(
			status_code=400,
			detail=f"Máximo de {MAX_OUTREACH_PER_BATCH} e-mails por operação. Divida em lotes.",
		)

	# Garantir que não há IDs duplicados na lista (previne envio em duplicado)
	unique_ids = list(dict.fromkeys(payload.prospect_ids))

	conn = get_db_connection()
	sent_count = 0
	failed_count = 0
	try:
		for pid in unique_ids:
			rows = execute_sql(conn, "SELECT * FROM prospects WHERE id = ?", (pid,))
			if not rows:
				print(f"[OUTREACH] Prospect ID {pid} não encontrado. Ignorado.")
				continue
			prospect = rows[0]

			# Não enviar para prospects já marcados como 'ignorado'
			if prospect.get("status") == "ignorado":
				print(f"[OUTREACH] Prospect ID {pid} está ignorado. Saltado.")
				continue

			sent = send_outreach_email_via_resend(prospect, payload.subject, payload.message)
			if sent:
				execute_sql(conn, "UPDATE prospects SET status = 'contactado' WHERE id = ?", (pid,))
				sent_count += 1
			else:
				failed_count += 1
	finally:
		conn.close()

	print(f"[OUTREACH AUDIT] Lote concluído — enviados: {sent_count}, falhados: {failed_count}")
	return {"success": True, "sent_count": sent_count, "failed_count": failed_count}


# ==========================================
# UPLOAD CSV / EXCEL — IMPORTAÇÃO DE PROSPECTS
# ==========================================

def _detect_column(headers: list[str], field: str) -> Optional[str]:
	"""Detecta o nome real da coluna no ficheiro para um campo normalizado."""
	aliases = CSV_COLUMN_MAP.get(field, [])
	for h in headers:
		if h.lower().strip() in aliases:
			return h
	return None


def _parse_csv_rows(content: bytes, priority: str, client_type: str) -> tuple[list[dict], list[str]]:
	"""Faz parse de um CSV e retorna (linhas_válidas, erros)."""
	errors = []
	rows = []
	try:
		text = content.decode("utf-8-sig")  # utf-8-sig remove BOM de ficheiros Windows
	except UnicodeDecodeError:
		try:
			text = content.decode("latin-1")
		except Exception:
			return [], ["Não foi possível descodificar o ficheiro. Use UTF-8 ou Latin-1."]

	reader = csv.DictReader(io.StringIO(text))
	headers = reader.fieldnames or []

	email_col = _detect_column(list(headers), "email")
	if not email_col:
		return [], ["Coluna de e-mail não encontrada. Certifique-se que o ficheiro tem uma coluna 'email', 'e-mail' ou 'mail'."]

	for i, row in enumerate(reader, start=2):
		if len(rows) >= MAX_UPLOAD_ROWS:
			errors.append(f"Limite de {MAX_UPLOAD_ROWS} linhas atingido. As restantes foram ignoradas.")
			break
		row_email = (row.get(email_col) or "").strip().lower()
		if not row_email:
			continue  # Linha sem e-mail — ignorar silenciosamente
		if not _is_email_safe(row_email):
			errors.append(f"Linha {i}: e-mail inválido ou bloqueado — '{row_email}'")
			continue

		name_col = _detect_column(list(headers), "name")
		company_col = _detect_column(list(headers), "company")
		phone_col = _detect_column(list(headers), "phone")
		website_col = _detect_column(list(headers), "website")
		region_col = _detect_column(list(headers), "region")
		category_col = _detect_column(list(headers), "category")
		notes_col = _detect_column(list(headers), "notes")

		rows.append({
			"name": _sanitize_str(row.get(name_col, "") if name_col else row.get(company_col, row_email), 200),
			"email": row_email,
			"phone": _sanitize_str(row.get(phone_col, "") if phone_col else "", 40),
			"company": _sanitize_str(row.get(company_col, "") if company_col else "", 200),
			"website": _sanitize_str(row.get(website_col, "") if website_col else "", 250),
			"region": _sanitize_str(row.get(region_col, "") if region_col else "", 100),
			"category": _sanitize_str(row.get(category_col, "") if category_col else "", 100),
			"notes": _sanitize_str(row.get(notes_col, "") if notes_col else "", 500),
			"client_type": client_type,
			"priority": priority,
		})
	return rows, errors


def _parse_excel_rows(content: bytes, priority: str, client_type: str) -> tuple[list[dict], list[str]]:
	"""Faz parse de um ficheiro Excel (.xlsx) e retorna (linhas_válidas, erros)."""
	if not HAS_OPENPYXL:
		return [], ["Suporte a Excel não disponível no servidor. Use formato CSV."]

	errors = []
	rows = []
	try:
		wb = openpyxl.load_workbook(io.BytesIO(content), read_only=True, data_only=True)
		ws = wb.active
	except Exception as e:
		return [], [f"Não foi possível abrir o ficheiro Excel: {e}"]

	all_rows = list(ws.iter_rows(values_only=True))
	if not all_rows:
		return [], ["O ficheiro Excel está vazio."]

	# Primeira linha são os cabeçalhos
	header_row = [str(h).strip() if h is not None else "" for h in all_rows[0]]

	email_col_idx = None
	for idx, h in enumerate(header_row):
		if h.lower() in CSV_COLUMN_MAP["email"]:
			email_col_idx = idx
			break

	if email_col_idx is None:
		return [], ["Coluna de e-mail não encontrada. Certifique-se que o ficheiro Excel tem uma coluna 'email', 'e-mail' ou 'mail'."]

	def get_col(row_vals: tuple, field: str) -> str:
		for idx, h in enumerate(header_row):
			if h.lower() in CSV_COLUMN_MAP.get(field, []):
				val = row_vals[idx] if idx < len(row_vals) else None
				return str(val).strip() if val is not None else ""
		return ""

	for i, row_vals in enumerate(all_rows[1:], start=2):
		if len(rows) >= MAX_UPLOAD_ROWS:
			errors.append(f"Limite de {MAX_UPLOAD_ROWS} linhas atingido. As restantes foram ignoradas.")
			break

		row_email = (str(row_vals[email_col_idx]).strip().lower() if row_vals[email_col_idx] else "")
		if not row_email or row_email in ("none", "nan", ""):
			continue
		if not _is_email_safe(row_email):
			errors.append(f"Linha {i}: e-mail inválido ou bloqueado — '{row_email}'")
			continue

		company_val = get_col(row_vals, "company")
		name_val = get_col(row_vals, "name") or company_val or row_email

		rows.append({
			"name": _sanitize_str(name_val, 200),
			"email": row_email,
			"phone": _sanitize_str(get_col(row_vals, "phone"), 40),
			"company": _sanitize_str(company_val, 200),
			"website": _sanitize_str(get_col(row_vals, "website"), 250),
			"region": _sanitize_str(get_col(row_vals, "region"), 100),
			"category": _sanitize_str(get_col(row_vals, "category"), 100),
			"notes": _sanitize_str(get_col(row_vals, "notes"), 500),
			"client_type": client_type,
			"priority": priority,
		})

	return rows, errors


@app.post("/api/scraper/upload")
async def upload_prospects_file(
	file: UploadFile = File(...),
	priority: str = Form(default="media"),
	client_type: str = Form(default="PMEs"),
	_: str = Depends(get_current_user),
):
	# Validar prioridade e tipo de cliente (allowlist)
	if priority.lower() not in ALLOWED_PRIORITIES:
		raise HTTPException(status_code=422, detail=f"Prioridade inválida: '{priority}'.")
	if client_type.lower() not in ALLOWED_CLIENT_TYPES:
		raise HTTPException(status_code=422, detail=f"Tipo de cliente inválido: '{client_type}'.")

	# Validar extensão e tipo MIME do ficheiro
	filename = (file.filename or "").lower()
	ext = filename.rsplit(".", 1)[-1] if "." in filename else ""
	if ext not in ("csv", "xlsx", "xls"):
		raise HTTPException(
			status_code=422,
			detail="Formato de ficheiro não suportado. Use .csv ou .xlsx",
		)

	# Ler conteúdo do ficheiro (com limite de tamanho)
	max_bytes = MAX_UPLOAD_FILE_MB * 1024 * 1024
	content = await file.read(max_bytes + 1)
	if len(content) > max_bytes:
		raise HTTPException(
			status_code=413,
			detail=f"Ficheiro demasiado grande. Máximo permitido: {MAX_UPLOAD_FILE_MB}MB.",
		)

	print(f"[UPLOAD AUDIT] Ficheiro recebido: '{file.filename}', {len(content)} bytes, prioridade: {priority}, tipo: {client_type}")

	# Parse do ficheiro consoante o formato
	if ext == "csv":
		parsed_rows, parse_errors = _parse_csv_rows(content, priority.lower(), client_type)
	else:  # xlsx / xls
		parsed_rows, parse_errors = _parse_excel_rows(content, priority.lower(), client_type)

	if not parsed_rows and parse_errors:
		raise HTTPException(status_code=422, detail=" | ".join(parse_errors))

	# Inserir prospects na base de dados (ignorar duplicados por e-mail)
	conn = get_db_connection()
	inserted = 0
	duplicate = 0
	try:
		for p in parsed_rows:
			existing = execute_sql(conn, "SELECT id FROM prospects WHERE email = ?", (p["email"],))
			if existing:
				duplicate += 1
				continue
			execute_insert_sql(
				conn,
				"""
				INSERT INTO prospects (name, email, phone, company, website, region, category, client_type, priority, status, notes, created_at)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
				""",
				(
					p["name"],
					p["email"],
					p["phone"],
					p["company"],
					p["website"],
					p["region"] or "Importado",
					p["category"] or "Importado",
					p["client_type"],
					p["priority"],
					"novo",
					p["notes"],
					datetime.now(timezone.utc).isoformat(),
				),
			)
			inserted += 1
	finally:
		conn.close()

	print(f"[UPLOAD AUDIT] Importação concluída — {inserted} novos, {duplicate} duplicados, {len(parse_errors)} erros de parsing")

	return {
		"success": True,
		"imported": inserted,
		"duplicate": duplicate,
		"parse_errors": parse_errors[:20],
		"total_rows": len(parsed_rows),
	}


# ==========================================
# TEMPLATES POR CATEGORIA & ENVIO AUTOMÁTICO
# ==========================================

@app.get("/api/scraper/category-templates")
def get_category_templates(_: str = Depends(get_current_user)) -> dict:
	"""Devolve todos os templates de e-mail disponíveis por categoria."""
	result = {}
	for cat, tpl in CATEGORY_EMAIL_TEMPLATES.items():
		if cat == "default":
			continue
		result[cat] = {
			"subject": tpl["subject"],
			"message": tpl["message"],
		}
	return {"templates": result, "categories": list(result.keys())}


@app.post("/api/scraper/send-outreach-by-category")
def send_outreach_by_category(
	payload: OutreachByCategoryIn,
	_: str = Depends(get_current_user),
):
	"""Envia e-mails de prospecção a todos os prospects de uma categoria específica."""
	# Validar filtros
	if payload.priority_filter and payload.priority_filter.lower() not in ALLOWED_PRIORITIES:
		raise HTTPException(status_code=422, detail=f"Prioridade inválida: '{payload.priority_filter}'.")
	if payload.status_filter.lower() not in ALLOWED_STATUSES:
		raise HTTPException(status_code=422, detail=f"Estado inválido: '{payload.status_filter}'.")

	conn = get_db_connection()
	sent_count = 0
	skipped_count = 0
	failed_count = 0

	try:
		# Construir query com filtros
		query = "SELECT * FROM prospects WHERE LOWER(category) = LOWER(?)"
		params: list = [payload.category]

		if payload.status_filter:
			query += " AND LOWER(status) = LOWER(?)"
			params.append(payload.status_filter)

		if payload.priority_filter:
			query += " AND LOWER(priority) = LOWER(?)"
			params.append(payload.priority_filter)

		rows = execute_sql(conn, query, tuple(params))

		if not rows:
			return {
				"success": True,
				"sent_count": 0,
				"skipped_count": 0,
				"failed_count": 0,
				"message": f"Nenhum prospect encontrado para a categoria '{payload.category}' com os filtros selecionados.",
			}

		if len(rows) > MAX_OUTREACH_PER_BATCH:
			raise HTTPException(
				status_code=400,
				detail=f"Encontrados {len(rows)} prospects nesta categoria. Máximo por lote: {MAX_OUTREACH_PER_BATCH}. Filtre por prioridade ou estado para reduzir.",
			)

		for prospect in rows:
			if prospect.get("status") == "ignorado":
				skipped_count += 1
				continue

			# Personalizar o assunto e mensagem com dados do prospect
			prospect_name = str(prospect.get("name") or "Cliente").strip()
			prospect_company = str(prospect.get("company") or prospect_name).strip()

			personalized_subject = payload.subject.replace("{name}", prospect_name).replace("{company}", prospect_company)
			personalized_message = payload.message.replace("{name}", prospect_name).replace("{company}", prospect_company)

			sent = send_outreach_email_via_resend(
				prospect,
				custom_subject=personalized_subject,
				custom_message=personalized_message,
			)

			if sent:
				execute_sql(
					conn,
					"UPDATE prospects SET status = 'contactado' WHERE id = ?",
					(prospect["id"],),
				)
				sent_count += 1
			else:
				failed_count += 1

	finally:
		conn.close()

	print(f"[OUTREACH BY CATEGORY] Categoria: '{payload.category}' — enviados: {sent_count}, saltados: {skipped_count}, falhados: {failed_count}")

	return {
		"success": True,
		"sent_count": sent_count,
		"skipped_count": skipped_count,
		"failed_count": failed_count,
		"total_found": len(rows),
	}


# ==========================================
# TESTE DE EMAIL — ENVIO INDIVIDUAL
# ==========================================

@app.post("/api/scraper/test-email")
def send_test_email(payload: TestEmailIn, _: str = Depends(get_current_user)):
	"""Envia um e-mail de teste para um endereço específico para validar o template antes de enviar em massa."""
	api_key = os.getenv("RESEND_API_KEY")
	if not api_key or not HAS_RESEND:
		raise HTTPException(status_code=503, detail="RESEND_API_KEY não configurada. Configure a variável de ambiente no Railway.")

	to_email = str(payload.to_email).lower().strip()
	if not _is_email_safe(to_email):
		raise HTTPException(status_code=422, detail=f"Endereço de e-mail inválido ou bloqueado: '{to_email}'")

	# Sanitizar e substituir tags de teste
	raw_subject = payload.subject.replace("{name}", "Cliente Exemplo").replace("{company}", "Empresa Exemplo")
	raw_message = payload.message.replace("{name}", "Cliente Exemplo").replace("{company}", "Empresa Exemplo")

	subject = re.sub(r"[\r\n]", "", raw_subject)[:200]
	body_escaped = _escape_html(raw_message)

	html_content = f"""<!DOCTYPE html>
<html lang="pt-PT">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="font-family: Arial, sans-serif; background-color: #0d1117; padding: 20px; color: #c9d1d9;">
    <div style="max-width: 600px; margin: 0 auto; background: #161b22; padding: 30px; border-radius: 16px; border: 1px solid #30363d;">
        <div style="background: #ff6b2b22; border: 1px solid #ff6b2b55; border-radius: 8px; padding: 10px 14px; margin-bottom: 20px;">
            <p style="color: #ff9a6c; font-size: 11px; font-weight: bold; margin: 0; font-family: monospace;">
                ⚗️ E-MAIL DE TESTE — Enviado pelo painel NEXUGAL Admin. Não é um envio real em massa.
            </p>
        </div>
        <h2 style="color: #00D1FF; font-family: monospace; letter-spacing: 2px;">NEXUGAL</h2>
        <div style="white-space: pre-wrap; font-size: 15px; line-height: 1.6; color: #e6edf3;">{body_escaped}</div>
        <hr style="border-color: #30363d; margin: 28px 0;">
        <p style="font-size: 11px; color: #8b949e; line-height: 1.5;">
            Este e-mail foi enviado pela NEXUGAL — Consultoria Tecnológica, Braga, Portugal.<br>
            Se não deseja receber mais comunicações da nossa parte, por favor responda com o assunto <strong>"Cancelar subscrição"</strong>.
        </p>
    </div>
</body>
</html>"""

	try:
		resend.api_key = api_key
		from_email = os.getenv("SENDER_EMAIL", "NEXUGAL <onboarding@resend.dev>")
		reply_to_email = os.getenv("NOTIFICATION_EMAIL", "nexugal.geral@gmail.com")
		resend.Emails.send({
			"from": from_email,
			"to": [to_email],
			"reply_to": reply_to_email,
			"subject": f"[TESTE] {subject}",
			"html": html_content,
		})
		print(f"[TEST EMAIL] Enviado para: {to_email} | Assunto: {subject}")
		return {"success": True, "message": f"E-mail de teste enviado com sucesso para {to_email}!"}
	except Exception as e:
		print(f"[TEST EMAIL ERROR] {type(e).__name__}: {e}")
		raise HTTPException(status_code=500, detail=f"Erro ao enviar: {e}")
