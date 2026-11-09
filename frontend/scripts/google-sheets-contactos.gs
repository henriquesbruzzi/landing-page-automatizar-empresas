/** @OnlyCurrentDoc */
// Recebe o formulário de contacto do site, grava uma linha e avisa por email.
// Cola-se em Extensões > Apps Script, na folha dos contactos (CLAUDE.md, 7.36).

const LIMITE = 'Limite do Google: 100 emails por dia. Acima disso, o contacto fica gravado aqui, mas sem aviso por email.';
const MAX_POR_HORA = 20;
const MAX_POR_DIA = 80;
const COLUNAS = ['Data', 'Nome', 'Email', 'Telefone', 'Empresa', 'Como soube de nós', 'Mensagem', 'Idioma'];

function doPost(e) {
  const dados = (e && e.parameter) || {};

  // Armadilha para robôs: as pessoas não veem este campo, por isso nunca vem preenchido
  if (dados._gotcha) return responder(true);

  const campo = (nome) => String(dados[nome] || '').trim().slice(0, 2000);
  const nome = campo('nome');
  const email = campo('email');
  if (!nome || !email) return responder(false);

  const trinco = LockService.getScriptLock();
  trinco.waitLock(20000);
  try {
    // Contra envios em massa: o endereço deste script é público
    if (!dentroDoLimite()) return responder(false);

    const folha = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    preparar(folha);
    const data = Utilities.formatDate(new Date(), 'Europe/Lisbon', 'yyyy-MM-dd HH:mm');
    const linha = [data, nome, email, campo('telefone'), campo('empresa'), campo('origem'), campo('mensagem'), campo('idioma')];

    // Em texto simples: mantém o + dos telefones, e o que um visitante escrever
    // a começar por = não corre como fórmula
    const destino = folha.getRange(folha.getLastRow() + 1, 1, 1, COLUNAS.length);
    destino.setNumberFormat('@');
    destino.setValues([linha]);
    SpreadsheetApp.flush();
  } finally {
    trinco.releaseLock();
  }

  // O contacto já está gravado: se o aviso falhar, não se perde nada
  try {
    avisar(nome, email, campo);
  } catch (erro) {
    console.error(erro);
  }
  return responder(true);
}

function dentroDoLimite() {
  const guardado = PropertiesService.getScriptProperties();
  const agora = new Date();
  const dia = Utilities.formatDate(agora, 'Europe/Lisbon', 'yyyy-MM-dd');
  const hora = Utilities.formatDate(agora, 'Europe/Lisbon', 'HH');

  let c = JSON.parse(guardado.getProperty('contagem') || '{}');
  if (c.dia !== dia) c = { dia: dia, hora: hora, noDia: 0, naHora: 0 };
  if (c.hora !== hora) {
    c.hora = hora;
    c.naHora = 0;
  }
  if (c.naHora >= MAX_POR_HORA || c.noDia >= MAX_POR_DIA) return false;

  c.naHora += 1;
  c.noDia += 1;
  guardado.setProperty('contagem', JSON.stringify(c));
  return true;
}

function preparar(folha) {
  if (folha.getRange('A1').getValue()) return;
  folha.getRange('A1').setValue(LIMITE).setFontWeight('bold');
  folha.getRange(2, 1, 1, COLUNAS.length).setValues([COLUNAS]).setFontWeight('bold');
  folha.setFrozenRows(2);
}

function avisar(nome, email, campo) {
  const aviso = {
    to: 'geral@nexugal.com',
    subject: 'Novo contacto Nexugal: ' + nome.replace(/[\r\n]+/g, ' ').slice(0, 100),
    body: [
      'Nome: ' + nome,
      'Email: ' + email,
      'Telefone: ' + campo('telefone'),
      'Empresa: ' + campo('empresa'),
      'Como soube de nós: ' + campo('origem'),
      'Idioma: ' + campo('idioma'),
      '',
      campo('mensagem'),
    ].join('\n'),
  };
  if (/^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(email)) aviso.replyTo = email;
  MailApp.sendEmail(aviso);
}

function responder(ok) {
  return ContentService.createTextOutput(JSON.stringify({ ok: ok }))
    .setMimeType(ContentService.MimeType.JSON);
}
