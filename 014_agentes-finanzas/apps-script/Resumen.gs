/**
 * Pestaña "Resumen": Total general + 3 bloques (selector, mini tabla y gráfico).
 * La arma la acción resumen. Todos los números salen de fórmulas sobre "Movimientos":
 * este código solo deja la estructura, los selectores y los gráficos.
 * Se puede ejecutar de nuevo sin duplicar nada y conserva lo elegido en los selectores.
 */

var HOJA_LISTAS = 'Listas';
var ROT_ANIO = 'Año';
var ROT_CATEGORIA = 'Categoría';
var ROT_MES = 'Mes (1 a 12)';
var TIT_1 = '1 · Total por mes';
var TIT_2 = '2 · Gasto de una categoría';
var TIT_3 = '3 · Detalle de un mes';
var AZUL = '#1a73e8';
var AZUL_OSCURO = '#174ea6';
var AZUL_CLARO = '#d2e3fc';
// Google Sheets solo respeta los colores propios en las primeras 7 porciones de una torta.
var MAX_PORCIONES = 7;
var AZULES = ['#174ea6', '#1a73e8', '#4285f4', '#669df6', '#8ab4f8', '#aecbfa', '#d2e3fc'];
var FMT_NUMERO = '#,##0.00';
var ANCHO_GRAFICO = 640;
var ALTO_GRAFICO = 340;
var FILAS_GRAFICO = 18;
// Listas de los desplegables: [columna en "Listas", cantidad de filas que cubre]
var LISTAS = { anios: [1, 30], categorias: [2, 300], meses: [3, 12] };

function accionResumen() {
  SpreadsheetApp.flush();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var mov = ss.getSheetByName(HOJA_MOV);
  if (!mov || mov.getLastRow() < 2) throw new Error('No hay movimientos todavía: cargá un CSV antes de armar el resumen.');
  var base = analizarMovimientos(mov);
  var listas = hojaSimple(ss, HOJA_LISTAS);
  var hoja = hojaSimple(ss, HOJA_RES);
  var sel = elegirSelecciones(leerSelecciones(hoja), base);
  armarListas(listas);
  limpiarResumen(hoja);
  armarTotalGeneral(hoja);
  var b1 = armarBloque1(hoja, 3, sel);
  var b2 = armarBloque2(hoja, siguienteFila(b1), sel, base.nMeses);
  var b3 = armarBloque3(hoja, siguienteFila(b2), sel, base.categorias.length);
  b1.rango = armarDatosHaciaArriba(listas, b1, 10);
  b2.rango = armarDatosHaciaArriba(listas, b2, 14);
  b3.rango = armarDatosTorta(listas, b3);
  agregarGraficos(hoja, [b1, b2, b3]);
  ordenarPestanas(ss, hoja, listas);
  SpreadsheetApp.flush();
  return {
    ok: true,
    hoja: HOJA_RES,
    graficos: hoja.getCharts().length,
    selecciones: sel,
    meses_en_bloque_2: base.nMeses,
    categorias: base.categorias.length
  };
}

// ---------- Qué hay en los datos (para los valores iniciales y el tamaño de las tablas) ----------

function analizarMovimientos(mov) {
  var datos = mov.getRange(2, 1, mov.getLastRow() - 1, 9).getValues();
  var anios = {};
  var cats = {};
  var suma = {};
  var minK = null;
  var maxK = null;
  datos.forEach(function (d) {
    var cat = String(d[5]);
    if (typeof d[6] !== 'number' || typeof d[7] !== 'number') return;
    anios[d[6]] = true;
    cats[cat] = true;
    if (typeof d[2] === 'number') suma[cat] = (suma[cat] || 0) + d[2];
    var k = d[6] * 12 + (d[7] - 1);
    if (minK === null || k < minK) minK = k;
    if (maxK === null || k > maxK) maxK = k;
  });
  if (minK === null) throw new Error('Los movimientos no tienen año y mes: cargá el CSV de nuevo.');
  var categorias = Object.keys(cats).sort();
  var top = categorias[0];
  categorias.forEach(function (c) {
    if ((suma[c] || 0) > (suma[top] || 0)) top = c;
  });
  return {
    anios: Object.keys(anios).map(Number).sort(function (a, b) {
      return a - b;
    }),
    categorias: categorias,
    topCategoria: top,
    ultimoAnio: Math.floor(maxK / 12),
    ultimoMes: (maxK % 12) + 1,
    nMeses: maxK - minK + 1
  };
}

// Lee lo que hay elegido hoy en los selectores (buscando los títulos de los bloques).
function leerSelecciones(hoja) {
  var sel = {};
  var n = hoja.getLastRow();
  if (n < 1) return sel;
  var bloque = 0;
  hoja.getRange(1, 1, n, 2).getValues().forEach(function (f) {
    var a = String(f[0]);
    if (a === TIT_1) bloque = 1;
    else if (a === TIT_2) bloque = 2;
    else if (a === TIT_3) bloque = 3;
    else if (a === ROT_ANIO && bloque === 1) sel.anio1 = f[1];
    else if (a === ROT_CATEGORIA && bloque === 2) sel.categoria = f[1];
    else if (a === ROT_ANIO && bloque === 3) sel.anio3 = f[1];
    else if (a === ROT_MES && bloque === 3) sel.mes3 = f[1];
  });
  return sel;
}

// Conserva lo elegido si todavía existe; si no, usa el valor inicial.
function elegirSelecciones(previas, base) {
  var meses = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  var valido = function (v, lista) {
    return v !== undefined && lista.indexOf(v) >= 0;
  };
  return {
    anio1: valido(previas.anio1, base.anios) ? previas.anio1 : base.ultimoAnio,
    categoria: valido(previas.categoria, base.categorias) ? previas.categoria : base.topCategoria,
    anio3: valido(previas.anio3, base.anios) ? previas.anio3 : base.ultimoAnio,
    mes3: valido(previas.mes3, meses) ? previas.mes3 : base.ultimoMes
  };
}

// ---------- Hojas ----------

function hojaSimple(ss, nombre) {
  return ss.getSheetByName(nombre) || ss.insertSheet(nombre);
}

// Pestaña auxiliar (oculta) con las listas de los desplegables y el primer mes de los datos.
function armarListas(listas) {
  listas.clear();
  listas.getRange(1, 1, 1, 5).setValues([['anios', 'categorias', 'meses', '', 'primer_mes']]).setFontWeight('bold');
  listas.getRange(2, 1).setFormula('=SORT(UNIQUE(FILTER(Movimientos!$G$2:$G,Movimientos!$G$2:$G<>"")))');
  listas.getRange(2, 2).setFormula('=SORT(UNIQUE(FILTER(Movimientos!$F$2:$F,Movimientos!$F$2:$F<>"")))');
  listas.getRange(2, 3).setFormula('=SEQUENCE(12)');
  listas
    .getRange(2, 5)
    .setFormula('=DATE(YEAR(MIN(Movimientos!$A$2:$A)),MONTH(MIN(Movimientos!$A$2:$A)),1)')
    .setNumberFormat('yyyy-mm-dd');
}

function ordenarPestanas(ss, hoja, listas) {
  try {
    ss.setActiveSheet(hoja);
    ss.moveActiveSheet(1);
    listas.hideSheet();
  } catch (err) {
    // Si Google no deja mover u ocultar desde acá, el resumen funciona igual.
  }
}

function limpiarResumen(hoja) {
  hoja.getCharts().forEach(function (c) {
    hoja.removeChart(c);
  });
  hoja.clear();
  hoja.getRange(1, 1, hoja.getMaxRows(), hoja.getMaxColumns()).clearDataValidations();
  hoja.setHiddenGridlines(true);
  hoja.setColumnWidth(1, 210);
  hoja.setColumnWidth(2, 130);
  hoja.setColumnWidth(3, 24);
}

// ---------- Bloques ----------

function armarTotalGeneral(hoja) {
  hoja.getRange(1, 1).setValue('Total general').setFontWeight('bold').setFontSize(14).setBackground(AZUL_CLARO);
  hoja
    .getRange(1, 2)
    .setFormula('=SUM(Movimientos!$C$2:$C)')
    .setNumberFormat(FMT_NUMERO)
    .setFontWeight('bold')
    .setFontSize(14)
    .setBackground(AZUL_CLARO)
    .setHorizontalAlignment('right');
}

// Bloque 1: un año -> 12 meses (enero a diciembre) con la suma de lo gastado.
function armarBloque1(hoja, fila, sel) {
  var b = { titulo: fila, hdr: fila + 2, ini: fila + 3, fin: fila + 14 };
  ponerTitulo(hoja, fila, TIT_1);
  ponerSelector(hoja, fila + 1, ROT_ANIO, sel.anio1, rangoLista(hoja, 'anios'));
  ponerEncabezado(hoja, b.hdr, ['Año-Mes', 'Total']);
  var anio = '$B$' + (fila + 1);
  var formulas = [];
  for (var m = 1; m <= 12; m++) {
    formulas.push([
      '=' + anio + '&"-"&TEXT(' + m + ',"00")',
      '=SUMIFS(Movimientos!$C$2:$C,Movimientos!$G$2:$G,' + anio + ',Movimientos!$H$2:$H,' + m + ')'
    ]);
  }
  hoja.getRange(b.ini, 1, 12, 2).setFormulas(formulas);
  formatoTabla(hoja, b.ini, 12);
  return b;
}

// Bloque 2: una categoría -> un renglón por cada mes de los datos (todos los años).
function armarBloque2(hoja, fila, sel, nMeses) {
  var b = { titulo: fila, hdr: fila + 2, ini: fila + 3, fin: fila + 2 + nMeses };
  ponerTitulo(hoja, fila, TIT_2);
  ponerSelector(hoja, fila + 1, ROT_CATEGORIA, sel.categoria, rangoLista(hoja, 'categorias'));
  ponerEncabezado(hoja, b.hdr, ['Año-Mes', 'Total']);
  var cat = '$B$' + (fila + 1);
  var formulas = [];
  for (var k = 0; k < nMeses; k++) {
    var d = 'EDATE(' + HOJA_LISTAS + '!$E$2,' + k + ')';
    formulas.push([
      '=YEAR(' + d + ')&"-"&TEXT(MONTH(' + d + '),"00")',
      '=SUMIFS(Movimientos!$C$2:$C,Movimientos!$F$2:$F,' + cat + ',Movimientos!$G$2:$G,YEAR(' + d + '),Movimientos!$H$2:$H,MONTH(' + d + '))'
    ]);
  }
  hoja.getRange(b.ini, 1, nMeses, 2).setFormulas(formulas);
  formatoTabla(hoja, b.ini, nMeses);
  return b;
}

// Bloque 3: un año y un mes -> gasto de cada categoría, de mayor a menor (QUERY).
function armarBloque3(hoja, fila, sel, nCategorias) {
  var b = { titulo: fila, hdr: fila + 3, ini: fila + 4, fin: fila + 3 + nCategorias };
  ponerTitulo(hoja, fila, TIT_3);
  ponerSelector(hoja, fila + 1, ROT_ANIO, sel.anio3, rangoLista(hoja, 'anios'));
  ponerSelector(hoja, fila + 2, ROT_MES, sel.mes3, rangoLista(hoja, 'meses'));
  estiloEncabezado(hoja, b.hdr); // los títulos los pone la fórmula QUERY: si hay algo escrito en B, no puede extenderse
  var anio = '$B$' + (fila + 1);
  var mes = '$B$' + (fila + 2);
  var consulta =
    '"select F, sum(C) where G = "&' + anio + '&" and H = "&' + mes +
    '&" group by F order by sum(C) desc label F \'Categoría\', sum(C) \'Total\'"';
  hoja.getRange(b.hdr, 1).setFormula('=IFERROR(QUERY(Movimientos!$A$2:$I,' + consulta + ',0),{"Categoría","Total"})');
  formatoTabla(hoja, b.ini, nCategorias);
  ponerNota(hoja, b.fin + 2, 'La torta dibuja solo los montos positivos (gastos) y junta en "Otras categorías" lo que pasa de las 6 más grandes. Los negativos (ingresos, transferencias recibidas) figuran en la tabla pero no en la torta.');
  return b;
}

// Datos de la torta (en la pestaña oculta): las categorías con monto positivo, de mayor a menor.
// Google Sheets solo respeta nuestros colores en las primeras 7 porciones, y una torta con más
// es difícil de leer: si hay más de 7, quedan las 6 más grandes y el resto se suma en "Otras categorías".
function armarDatosTorta(listas, b) {
  var tabla = HOJA_RES + '!$A$' + b.ini + ':$B$' + b.fin;
  var montos = HOJA_RES + '!$B$' + b.ini + ':$B$' + b.fin;
  var formula =
    '=IFERROR(LET(p,FILTER(' + tabla + ',' + montos + '>0),n,ROWS(p),k,IF(n<=' + MAX_PORCIONES + ',n,' + (MAX_PORCIONES - 1) + '),' +
    'IF(n<=' + MAX_PORCIONES + ',p,{ARRAY_CONSTRAIN(p,k,2);"Otras categorías",SUM(INDEX(p,0,2))-SUM(INDEX(ARRAY_CONSTRAIN(p,k,2),0,2))})),{"",0})';
  listas.getRange(1, 7, 1, 2).setValues([['torta_categoria', 'torta_total']]).setFontWeight('bold');
  listas.getRange(2, 7).setFormula(formula);
  return listas.getRange(1, 7, MAX_PORCIONES + 1, 2);
}

// Nota chica y gris, en dos columnas, debajo de una tabla.
function ponerNota(hoja, fila, texto) {
  hoja.getRange(fila, 1, 1, 2).merge().setValue(texto).setWrap(true).setFontSize(9).setFontColor('#5f6368').setVerticalAlignment('top');
  hoja.setRowHeight(fila, 70);
}

// Datos de los gráficos de columnas: todas las barras salen HACIA ARRIBA, también las de montos negativos.
// Cada mes tiene dos columnas apiladas: la de montos positivos (azul oscuro) y la de negativos sin signo
// (azul claro), así no se pierde la diferencia. Quedan en la pestaña oculta; las tablas visibles no cambian.
function armarDatosHaciaArriba(listas, b, columna) {
  var n = b.fin - b.ini + 1;
  var filas = [];
  for (var i = 0; i < n; i++) {
    var monto = HOJA_RES + '!B' + (b.ini + i);
    filas.push(['=' + HOJA_RES + '!A' + (b.ini + i), '=IF(' + monto + '>0,' + monto + ',0)', '=IF(' + monto + '<0,-' + monto + ',0)']);
  }
  listas.getRange(1, columna, 1, 3).setValues([['anio_mes', 'positivo', 'negativo_sin_signo']]).setFontWeight('bold');
  listas.getRange(2, columna, n, 3).setFormulas(filas);
  return listas.getRange(1, columna, n + 1, 3);
}

// Primera fila libre debajo de un bloque (deja lugar para que el gráfico no se pise con el siguiente).
function siguienteFila(b) {
  return Math.max(b.fin, b.titulo + FILAS_GRAFICO) + 2;
}

// ---------- Estilo ----------

function rangoLista(hoja, clave) {
  var listas = hoja.getParent().getSheetByName(HOJA_LISTAS);
  return listas.getRange(2, LISTAS[clave][0], LISTAS[clave][1], 1);
}

function ponerTitulo(hoja, fila, texto) {
  hoja.getRange(fila, 1).setValue(texto).setFontWeight('bold').setFontSize(13).setFontColor(AZUL_OSCURO);
}

function ponerSelector(hoja, fila, rotulo, valor, lista) {
  hoja.getRange(fila, 1).setValue(rotulo).setFontWeight('bold').setBackground(AZUL_CLARO).setHorizontalAlignment('left');
  var regla = SpreadsheetApp.newDataValidation().requireValueInRange(lista, true).setAllowInvalid(false).build();
  hoja
    .getRange(fila, 2)
    .setValue(valor)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setBackground('#ffffff')
    .setBorder(true, true, true, true, false, false, AZUL, SpreadsheetApp.BorderStyle.SOLID_MEDIUM)
    .setDataValidation(regla);
}

function ponerEncabezado(hoja, fila, textos) {
  hoja.getRange(fila, 1, 1, 2).setValues([textos]);
  estiloEncabezado(hoja, fila);
}

function estiloEncabezado(hoja, fila) {
  hoja.getRange(fila, 1, 1, 2).setFontWeight('bold').setFontColor('#ffffff').setBackground(AZUL);
  hoja.getRange(fila, 2).setHorizontalAlignment('right');
}

function formatoTabla(hoja, ini, n) {
  hoja.getRange(ini, 1, n, 1).setHorizontalAlignment('left');
  hoja.getRange(ini, 2, n, 1).setNumberFormat(FMT_NUMERO).setHorizontalAlignment('right');
}

// ---------- Gráficos ----------

// Los gráficos se borran y se vuelven a crear en cada ejecución: nunca quedan repetidos.
function agregarGraficos(hoja, bloques) {
  var tipos = [Charts.ChartType.COLUMN, Charts.ChartType.COLUMN, Charts.ChartType.PIE];
  var titulos = [
    'Total por mes del año elegido (azul claro = negativo)',
    'Gasto por mes de la categoría elegida (azul claro = negativo)',
    'Gasto por categoría del mes elegido'
  ];
  bloques.forEach(function (b, i) {
    var g = hoja
      .newChart()
      .setChartType(tipos[i])
      .addRange(b.rango || hoja.getRange(b.hdr, 1, b.fin - b.hdr + 1, 2))
      .setNumHeaders(1)
      .setPosition(b.titulo, 4, 8, 0)
      .setOption('title', titulos[i])
      .setOption('titleTextStyle', { color: AZUL_OSCURO, bold: true, fontSize: 14 })
      .setOption('width', ANCHO_GRAFICO)
      .setOption('height', ALTO_GRAFICO);
    hoja.insertChart((i < 2 ? opcionesColumnas(g) : opcionesTorta(g)).build());
  });
}

function opcionesColumnas(g) {
  return g
    .setOption('legend.position', 'none')
    .setOption('isStacked', true)
    .setOption('colors', [AZUL_OSCURO, AZULES[4]])
    .setOption('hAxis.slantedText', true)
    .setOption('hAxis.slantedTextAngle', 45)
    .setOption('vAxis.format', FMT_NUMERO);
}

function opcionesTorta(g) {
  return g
    .setOption('colors', AZULES)
    .setOption('pieSliceText', 'percentage')
    .setOption('legend.position', 'labeled')
    .setOption('sliceVisibilityThreshold', 0);
}
