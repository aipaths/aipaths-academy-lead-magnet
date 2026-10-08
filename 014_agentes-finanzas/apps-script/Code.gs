/**
 * Puerta de la hoja de gastos (aplicación web de Apps Script).
 * Se maneja con: <dirección /exec>?token=...&accion=cargar|categorias|leer
 * El token vive en las Propiedades del script (clave TOKEN), no en este archivo.
 * @OnlyCurrentDoc
 */

var HOJA_MOV = 'Movimientos';
var HOJA_CAT = 'Categorías';
var HOJA_RES = 'Resumen';
var ENC_MOV = ['fecha', 'comercio', 'monto', 'detalle', 'clave', 'categoria', 'ano', 'mes', 'ano_mes'];
var ENC_CAT = ['comercio', 'categoria'];
var SIN_CATEGORIA = '(sin categoría)';

// Nombres de columna que reconoce (ya sin tildes, en minúscula). El primero que aparezca gana.
var ALIAS = {
  fecha: ['fecha', 'date', 'fecha operacion', 'fecha de operacion', 'fecha contable', 'fecha valor', 'transaction date', 'booking date', 'posted date'],
  comercio: ['comercio', 'merchant', 'establecimiento', 'name', 'nombre', 'payee', 'beneficiario', 'descripcion', 'description', 'concepto', 'detalle'],
  monto: ['monto', 'importe', 'amount', 'valor', 'total'],
  debito: ['debito', 'debitos', 'debit', 'cargo', 'cargos', 'retiro', 'retiros', 'money out', 'paid out', 'withdrawal', 'salida', 'egreso'],
  credito: ['credito', 'creditos', 'credit', 'abono', 'abonos', 'deposito', 'depositos', 'money in', 'paid in', 'deposit', 'entrada', 'ingreso'],
  categoria: ['categoria', 'category', 'rubro']
};

// ---------- Entrada ----------

function doGet(e) {
  return atender(e, 'GET');
}

function doPost(e) {
  return atender(e, 'POST');
}

function atender(e, metodo) {
  try {
    var p = (e && e.parameter) || {};
    if (!tokenValido(p.token)) return json({ ok: false, error: 'token' });
    if (p.accion === 'leer') return json(accionLeer());
    if (p.accion === 'cargar' || p.accion === 'categorias' || p.accion === 'resumen') {
      if (metodo !== 'POST') return json({ ok: false, error: 'La acción ' + p.accion + ' se manda por POST.' });
      var cuerpo = (e.postData && e.postData.contents) || '';
      return json(conCandado(function () {
        if (p.accion === 'cargar') return accionCargar(cuerpo, p);
        if (p.accion === 'categorias') return accionCategorias(cuerpo);
        return accionResumen();
      }));
    }
    return json({ ok: false, error: 'acción desconocida: ' + p.accion });
  } catch (err) {
    return json({ ok: false, error: String((err && err.message) || err) });
  }
}

function tokenValido(token) {
  var real = PropertiesService.getScriptProperties().getProperty('TOKEN');
  return !!real && typeof token === 'string' && token === real;
}

function conCandado(fn) {
  var candado = LockService.getScriptLock();
  candado.waitLock(30000);
  try {
    return fn();
  } finally {
    candado.releaseLock();
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// ---------- Acción: cargar ----------

function accionCargar(texto, p) {
  texto = sinBom(texto);
  if (!texto.trim()) throw new Error('El cuerpo está vacío: mandá el CSV con --data-binary.');
  var filasCsv = parseCsv(texto, detectarSeparador(texto));
  var mapa = mapearColumnas(filasCsv[0]);
  var r = construirFilas(filasCsv, mapa, p.signo);
  var mov = hoja(HOJA_MOV, ENC_MOV);
  var cat = hoja(HOJA_CAT, ENC_CAT);
  var existentes = clavesExistentes(mov);
  var nuevas = r.filas.filter(function (f) {
    return !existentes[f.clave];
  });
  escribirMovimientos(mov, nuevas);
  var categoriasNuevas = completarCategorias(cat, r.categoriasCsv);
  var formulasActualizadas = actualizarFormulas(mov);
  SpreadsheetApp.flush();
  return {
    ok: true,
    recibidas: r.filas.length,
    nuevas: nuevas.length,
    repetidas: r.filas.length - nuevas.length,
    ignoradas: r.ignoradas,
    categorias_nuevas: categoriasNuevas,
    formulas_actualizadas: formulasActualizadas,
    signo_invertido: r.signoInvertido,
    filas_en_hoja: mov.getLastRow() - 1
  };
}

function clavesExistentes(mov) {
  var existentes = {};
  var ultima = mov.getLastRow();
  if (ultima < 2) return existentes;
  mov.getRange(2, 5, ultima - 1, 1).getValues().forEach(function (v) {
    existentes[String(v[0])] = true;
  });
  return existentes;
}

function escribirMovimientos(mov, nuevas) {
  var n = nuevas.length;
  if (!n) return;
  var inicio = mov.getLastRow() + 1;
  var falta = inicio + n - 1 - mov.getMaxRows();
  if (falta > 0) mov.insertRowsAfter(mov.getMaxRows(), falta);
  // Texto plano para que Sheets no "interprete" comercios que empiezan con = o +
  mov.getRange(inicio, 2, n, 1).setNumberFormat('@');
  mov.getRange(inicio, 4, n, 2).setNumberFormat('@');
  mov.getRange(inicio, 9, n, 1).setNumberFormat('@');
  mov.getRange(inicio, 1, n, 1).setNumberFormat('yyyy-mm-dd');
  mov.getRange(inicio, 3, n, 1).setNumberFormat('0.00');
  mov.getRange(inicio, 7, n, 2).setNumberFormat('0');
  mov.getRange(inicio, 1, n, 5).setValues(nuevas.map(function (f) {
    return [f.fecha, f.comercio, f.monto, f.detalle, f.clave];
  }));
  mov.getRange(inicio, 6, n, 1).setFormulas(nuevas.map(function (f, k) {
    return [formulaCategoria(inicio + k)];
  }));
  mov.getRange(inicio, 7, n, 3).setValues(nuevas.map(function (f) {
    return [f.ano, f.mes, f.anoMes];
  }));
}

function formulaCategoria(fila) {
  // Desde la fila 2: así un comercio llamado "Comercio" no se encuentra a sí mismo en la cabecera.
  var buscar = "VLOOKUP(B" + fila + ",'" + HOJA_CAT + "'!A2:B,2,FALSE)";
  return '=IFERROR(IF(' + buscar + '="","' + SIN_CATEGORIA + '",' + buscar + '),"' + SIN_CATEGORIA + '")';
}

// Si las fórmulas de categoría de la hoja son de una versión vieja del código, las reescribe.
function actualizarFormulas(mov) {
  var ultima = mov.getLastRow();
  if (ultima < 2 || mov.getRange(2, 6).getFormula().indexOf('A2:B') >= 0) return 0;
  var formulas = [];
  for (var fila = 2; fila <= ultima; fila++) formulas.push([formulaCategoria(fila)]);
  mov.getRange(2, 6, ultima - 1, 1).setFormulas(formulas);
  return ultima - 1;
}

function completarCategorias(cat, deCsv) {
  var existentes = {};
  var ultima = cat.getLastRow();
  if (ultima >= 2) {
    cat.getRange(2, 1, ultima - 1, 1).getValues().forEach(function (v) {
      existentes[normCom(v[0])] = true;
    });
  }
  var agregar = [];
  Object.keys(deCsv).forEach(function (k) {
    if (!existentes[k]) agregar.push(deCsv[k]);
  });
  agregarCategorias(cat, agregar);
  return agregar.length;
}

function agregarCategorias(cat, pares) {
  if (!pares.length) return;
  var inicio = cat.getLastRow() + 1;
  var falta = inicio + pares.length - 1 - cat.getMaxRows();
  if (falta > 0) cat.insertRowsAfter(cat.getMaxRows(), falta);
  cat.getRange(inicio, 1, pares.length, 2).setNumberFormat('@').setValues(pares);
}

// ---------- Acción: categorias ----------

function accionCategorias(texto) {
  var lista;
  try {
    lista = JSON.parse(texto);
  } catch (err) {
    throw new Error('El cuerpo no es JSON válido. Esperaba [{"comercio":"...","categoria":"..."}].');
  }
  if (!Array.isArray(lista)) throw new Error('Esperaba una lista JSON: [{"comercio":"...","categoria":"..."}].');
  var cat = hoja(HOJA_CAT, ENC_CAT);
  var filaDe = {};
  var ultima = cat.getLastRow();
  var actuales = ultima >= 2 ? cat.getRange(2, 1, ultima - 1, 2).getValues() : [];
  actuales.forEach(function (v, k) {
    filaDe[normCom(v[0])] = { fila: k + 2, categoria: String(v[1]).trim() };
  });
  var cuenta = { nuevas: 0, actualizadas: 0, sin_cambios: 0 };
  var agregar = [];
  lista.forEach(function (it, k) {
    var com = String((it && it.comercio) || '').trim();
    var c = String((it && it.categoria) || '').trim();
    if (!com || !c) throw new Error('Elemento ' + (k + 1) + ' sin comercio o sin categoria. No cambié nada.');
    var previo = filaDe[normCom(com)];
    if (!previo) {
      agregar.push([com, c]);
      filaDe[normCom(com)] = { fila: -1, categoria: c };
      cuenta.nuevas++;
    } else if (previo.categoria === c) {
      cuenta.sin_cambios++;
    } else if (previo.fila > 0) {
      cat.getRange(previo.fila, 2).setNumberFormat('@').setValue(c);
      previo.categoria = c;
      cuenta.actualizadas++;
    } else {
      cuenta.sin_cambios++;
    }
  });
  agregarCategorias(cat, agregar);
  SpreadsheetApp.flush();
  return { ok: true, recibidas: lista.length, nuevas: cuenta.nuevas, actualizadas: cuenta.actualizadas, sin_cambios: cuenta.sin_cambios };
}

// ---------- Acción: leer ----------

function accionLeer() {
  SpreadsheetApp.flush();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var mov = ss.getSheetByName(HOJA_MOV);
  var r = {
    ok: true,
    filas: 0,
    total: 0,
    por_categoria: {},
    por_mes: {},
    categorias: leerCategorias(),
    sin_categoria: [],
    sin_comercio: [],
    no_numericos: [],
    ultima_fecha: null,
    total_en_resumen: totalEnResumen()
  };
  if (!mov || mov.getLastRow() < 2) return r;
  var tz = ss.getSpreadsheetTimeZone();
  var sinCat = {};
  var ultima = null;
  mov.getRange(2, 1, mov.getLastRow() - 1, 9).getValues().forEach(function (d, k) {
    var com = String(d[1]).trim();
    var cat = String(d[5]);
    r.filas++;
    if (typeof d[2] === 'number' && !isNaN(d[2])) {
      var mes = d[8] instanceof Date ? Utilities.formatDate(d[8], tz, 'yyyy-MM') : String(d[8]);
      r.total += d[2];
      r.por_categoria[cat] = (r.por_categoria[cat] || 0) + d[2];
      r.por_mes[mes] = (r.por_mes[mes] || 0) + d[2];
    } else {
      r.no_numericos.push(k + 2);
    }
    if (!com) r.sin_comercio.push(k + 2);
    else if (cat === SIN_CATEGORIA) sinCat[com] = true;
    if (d[0] instanceof Date && (ultima === null || d[0] > ultima)) ultima = d[0];
  });
  r.total = redondear(r.total);
  redondearMapa(r.por_categoria);
  redondearMapa(r.por_mes);
  r.sin_categoria = Object.keys(sinCat);
  r.ultima_fecha = ultima ? Utilities.formatDate(ultima, tz, 'yyyy-MM-dd') : null;
  return r;
}

function leerCategorias() {
  var h = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA_CAT);
  var mapa = {};
  if (!h || h.getLastRow() < 2) return mapa;
  h.getRange(2, 1, h.getLastRow() - 1, 2).getValues().forEach(function (v) {
    if (String(v[0]).trim() !== '') mapa[String(v[0]).trim()] = String(v[1]).trim();
  });
  return mapa;
}

// El total general de "Resumen" es el primer número a la derecha de una celda que dice "Total general".
function totalEnResumen() {
  var h = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA_RES);
  if (!h || h.getLastRow() < 1 || h.getLastColumn() < 2) return null;
  var v = h.getDataRange().getValues();
  for (var i = 0; i < v.length; i++) {
    for (var j = 0; j < v[i].length - 1; j++) {
      if (normalizar(v[i][j]) === 'total general' && typeof v[i][j + 1] === 'number') return redondear(v[i][j + 1]);
    }
  }
  return null;
}

// ---------- Hojas ----------

function hoja(nombre, encabezados) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var h = ss.getSheetByName(nombre);
  if (h) return h;
  h = ss.insertSheet(nombre);
  h.getRange(1, 1, 1, encabezados.length).setValues([encabezados]).setFontWeight('bold');
  h.setFrozenRows(1);
  return h;
}

// ---------- Leer el CSV ----------

function detectarSeparador(texto) {
  var linea = sinBom(texto).split(/\r?\n/)[0];
  var mejor = ',';
  var max = 0;
  [',', ';', '\t'].forEach(function (s) {
    var n = contarFuera(linea, s);
    if (n > max) {
      max = n;
      mejor = s;
    }
  });
  return mejor;
}

function contarFuera(linea, s) {
  var n = 0;
  var enComillas = false;
  for (var i = 0; i < linea.length; i++) {
    if (linea[i] === '"') enComillas = !enComillas;
    else if (linea[i] === s && !enComillas) n++;
  }
  return n;
}

function parseCsv(texto, sep) {
  var filas = [];
  var fila = [];
  var campo = '';
  var enComillas = false;
  for (var i = 0; i < texto.length; i++) {
    var c = texto[i];
    if (enComillas) {
      if (c !== '"') campo += c;
      else if (texto[i + 1] === '"') {
        campo += '"';
        i++;
      } else enComillas = false;
    } else if (c === '"' && campo === '') {
      enComillas = true;
    } else if (c === sep) {
      fila.push(campo);
      campo = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && texto[i + 1] === '\n') i++;
      fila.push(campo);
      filas.push(fila);
      fila = [];
      campo = '';
    } else {
      campo += c;
    }
  }
  if (campo !== '' || fila.length) {
    fila.push(campo);
    filas.push(fila);
  }
  return filas;
}

function mapearColumnas(encabezados) {
  var norm = encabezados.map(normalizar);
  var buscar = function (lista) {
    for (var i = 0; i < lista.length; i++) {
      var j = norm.indexOf(lista[i]);
      if (j >= 0) return j;
    }
    return -1;
  };
  var m = {};
  Object.keys(ALIAS).forEach(function (k) {
    m[k] = buscar(ALIAS[k]);
  });
  m.modo = m.debito >= 0 && m.credito >= 0 ? 'par' : 'unica';
  var faltan = [];
  if (m.fecha < 0) faltan.push('fecha');
  if (m.comercio < 0) faltan.push('comercio (o descripción)');
  if (m.modo === 'unica' && m.monto < 0) faltan.push('monto (o importe, o débito y crédito)');
  if (faltan.length) {
    throw new Error('No reconozco la columna de ' + faltan.join(' ni la de ') + '. Columnas del CSV: ' + encabezados.join(' | '));
  }
  return m;
}

function construirFilas(filasCsv, mapa, signoParam) {
  var encabezados = filasCsv[0];
  var usadas = [mapa.fecha, mapa.comercio, mapa.categoria];
  usadas = usadas.concat(mapa.modo === 'par' ? [mapa.debito, mapa.credito] : [mapa.monto]);
  var validas = [];
  var ignoradas = 0;
  var errores = [];
  for (var i = 1; i < filasCsv.length; i++) {
    var fila = filasCsv[i];
    if (esVacia(fila) || ALIAS.fecha.indexOf(normalizar(fila[mapa.fecha])) >= 0) {
      ignoradas++;
      continue;
    }
    var f = parseFecha(fila[mapa.fecha]);
    if (f) validas.push({ f: f, fila: fila });
    else errores.push('fila ' + (i + 1) + ' ("' + fila[mapa.fecha] + '")');
  }
  if (errores.length) {
    throw new Error('No entiendo la fecha en ' + errores.length + ' fila(s) (la fila 1 es el encabezado): ' + errores.slice(0, 5).join(', ') + '. No cargué nada.');
  }
  var montos = validas.map(function (v) {
    return calcularMonto(v.fila, mapa);
  });
  var invertir = decidirSigno(montos, mapa, signoParam);
  var vistos = {};
  var deCsv = {};
  var filas = validas.map(function (v, k) {
    var comercio = String(v.fila[mapa.comercio] || '').trim();
    var monto = invertir && typeof montos[k] === 'number' ? 0 - montos[k] : montos[k];
    var base = v.f.iso + '|' + normCom(comercio) + '|' + (typeof monto === 'number' ? monto.toFixed(2) : monto);
    vistos[base] = (vistos[base] || 0) + 1;
    var cat = mapa.categoria >= 0 ? String(v.fila[mapa.categoria] || '').trim() : '';
    if (cat && comercio && !deCsv[normCom(comercio)]) deCsv[normCom(comercio)] = [comercio, cat];
    return {
      fecha: v.f.iso,
      comercio: comercio,
      monto: monto,
      detalle: armarDetalle(v.fila, encabezados, usadas),
      clave: base + '#' + vistos[base],
      ano: v.f.a,
      mes: v.f.m,
      anoMes: v.f.a + '-' + pad(v.f.m)
    };
  });
  return { filas: filas, ignoradas: ignoradas, categoriasCsv: deCsv, signoInvertido: invertir };
}

// Gasto = positivo, reembolso/ingreso = negativo. Con débito y crédito separados se usa el valor absoluto de cada uno.
function calcularMonto(fila, mapa) {
  if (mapa.modo === 'par') {
    var d = parseNumero(fila[mapa.debito]);
    var c = parseNumero(fila[mapa.credito]);
    if (d === null && c === null) return '';
    if ((d !== null && isNaN(d)) || (c !== null && isNaN(c))) return (fila[mapa.debito] + ' ' + fila[mapa.credito]).trim();
    return redondear6(Math.abs(d || 0) - Math.abs(c || 0));
  }
  var n = parseNumero(fila[mapa.monto]);
  if (n === null) return '';
  return isNaN(n) ? String(fila[mapa.monto]).trim() : n;
}

// Con una sola columna de monto: si hay más negativos que positivos, los gastos vienen en negativo y se invierte el signo.
function decidirSigno(montos, mapa, param) {
  if (mapa.modo !== 'unica') return false;
  if (param === 'invertir') return true;
  if (param === 'normal') return false;
  var neg = 0;
  var pos = 0;
  montos.forEach(function (m) {
    if (typeof m !== 'number') return;
    if (m < 0) neg++;
    else if (m > 0) pos++;
  });
  return neg > pos;
}

function armarDetalle(fila, encabezados, usadas) {
  var partes = [];
  for (var j = 0; j < encabezados.length; j++) {
    var v = String(fila[j] === undefined ? '' : fila[j]).trim();
    if (usadas.indexOf(j) < 0 && v !== '') partes.push(String(encabezados[j]).trim() + ': ' + v);
  }
  return partes.join(' | ');
}

// ---------- Números y fechas ----------

// Devuelve null si está vacío, NaN si está roto, o el número.
function parseNumero(valor) {
  var s = String(valor === null || valor === undefined ? '' : valor).trim();
  if (s === '') return null;
  var neg = false;
  if (/^\(.*\)$/.test(s)) {
    neg = true;
    s = s.slice(1, -1);
  }
  s = s.split(String.fromCharCode(0x2212)).join('-').replace(/[^\d.,\-]/g, '');
  if (/^-/.test(s) || /-$/.test(s)) {
    neg = true;
    s = s.replace(/^-|-$/g, '');
  }
  if (!/^[\d.,]*\d[\d.,]*$/.test(s)) return NaN;
  var decimal = separadorDecimal(s);
  var n;
  if (decimal) {
    var partes = s.split(decimal);
    if (partes.length !== 2 || /[.,]/.test(partes[1])) return NaN;
    n = Number(partes[0].replace(/[.,]/g, '') + '.' + partes[1]);
  } else {
    n = Number(s.replace(/[.,]/g, ''));
  }
  return neg ? 0 - n : n;
}

// Si hay . y , a la vez, el último es el decimal. Si hay uno solo: con 3 dígitos detrás (1.234) es de miles; si no, decimal.
function separadorDecimal(s) {
  var coma = s.lastIndexOf(',');
  var punto = s.lastIndexOf('.');
  if (coma >= 0 && punto >= 0) return coma > punto ? ',' : '.';
  if (coma < 0 && punto < 0) return null;
  var sep = coma >= 0 ? ',' : '.';
  var partes = s.split(sep);
  if (partes.length > 2) return null;
  return partes[1].length === 3 && partes[0] !== '' && partes[0] !== '0' ? null : sep;
}

// Entiende AAAA-MM-DD y día/mes/año (con - / . y año de 2 o 4 cifras). Devuelve null si no la entiende.
function parseFecha(valor) {
  var s = String(valor === null || valor === undefined ? '' : valor).trim();
  var a, mes, d;
  var m = s.match(/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})(?:[T\s,].*)?$/);
  if (m) {
    a = +m[1];
    mes = +m[2];
    d = +m[3];
  } else {
    m = s.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{2}|\d{4})(?:[T\s,].*)?$/);
    if (!m) return null;
    d = +m[1];
    mes = +m[2];
    a = +m[3];
    if (a < 100) a += 2000;
  }
  var f = new Date(Date.UTC(a, mes - 1, d));
  if (f.getUTCFullYear() !== a || f.getUTCMonth() !== mes - 1 || f.getUTCDate() !== d) return null;
  return { a: a, m: mes, d: d, iso: a + '-' + pad(mes) + '-' + pad(d) };
}

// ---------- Utilidades ----------

function normalizar(s) {
  return String(s === null || s === undefined ? '' : s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[_\-.]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function sinBom(texto) {
  return texto.charCodeAt(0) === 0xfeff ? texto.slice(1) : texto;
}

function normCom(s) {
  return String(s).toLowerCase().replace(/\s+/g, ' ').trim();
}

function esVacia(fila) {
  return fila.every(function (c) {
    return String(c).trim() === '';
  });
}

function pad(n) {
  return (n < 10 ? '0' : '') + n;
}

function redondear(x) {
  return Math.round(x * 100) / 100;
}

function redondear6(x) {
  return Math.round(x * 1e6) / 1e6;
}

function redondearMapa(mapa) {
  Object.keys(mapa).forEach(function (k) {
    mapa[k] = redondear(mapa[k]);
  });
}
