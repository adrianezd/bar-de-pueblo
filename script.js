// Bar de Pueblo Tycoon: precios, género, mejoras y eventos del pueblo, un día por turno. Se guarda en localStorage.
var CLAVE = 'bar-pueblo-v1';
var PROD = {
  cana: { nom: 'Caña', ico: '🍺', ref: 1.5, lote: 50, precioLote: 22, loteNom: 'Barril de 50 cañas' },
  cafe: { nom: 'Café', ico: '☕', ref: 1.3, lote: 100, precioLote: 18, loteNom: 'Saco para 100 cafés' },
  tapa: { nom: 'Tapa', ico: '🍢', ref: 2.5, lote: 20, precioLote: 20, loteNom: 'Bandeja de 20 tapas', caduca: true }
};
var MEJORAS = [
  ['mus', '🃏', 'Tapete de mus', 150, 'Los jubilados vienen todas las tardes.'],
  ['letrero', '💡', 'Letrero luminoso', 300, 'Que se vea el bar desde la carretera.'],
  ['cafetera', '☕', 'Cafetera italiana', 450, 'Mejor café: más gente lo pide y lo paga mejor.'],
  ['futbolin', '⚽', 'Futbolín', 600, 'Atrae a la juventud.'],
  ['bano', '🚽', 'Reforma del baño', 800, 'Adiós a las multas de sanidad. Sube la fama.'],
  ['tele', '📺', 'Tele grande', 1200, 'Los días de partido se llena el bar.'],
  ['tragaperras', '🎰', 'Tragaperras', 1800, 'Ingresos extra cada día.'],
  ['grifo', '🍺', 'Tirador nuevo', 2000, 'La caña sale mejor tirada y se vende más.'],
  ['terraza', '⛱️', 'Terraza', 3500, 'Mucha más gente de mayo a septiembre.'],
  ['aire', '❄️', 'Aire acondicionado', 4500, 'En julio y agosto la gente se queda dentro.'],
  ['cocina', '🍳', 'Cocina', 6000, 'Tapas calientes: más pedidas y más caras.'],
  ['karaoke', '🎤', 'Karaoke', 8000, 'Viernes y sábados hasta las tantas.'],
  ['local', '🏠', 'Comprar el local', 25000, 'Se acabó pagar alquiler. El bar es tuyo.']
];
var SUELDO = 45, FIJOS = 18, CAPACIDAD = 32;
var DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
var F_DIA = [.8, .8, .85, .95, 1.3, 1.5, 1.25];
var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
var F_MES = [.8, .8, .9, 1, 1.05, 1.1, 1.25, 1.4, 1, .9, .8, 1.1];
var NOMBRES = ['Paco', 'Manolo', 'la Puri', 'el tío Julián', 'Conchi', 'el alcalde', 'Ramón el del tractor', 'la Maribel', 'el cura'];
var CARAS = ['🧓', '👴', '👵', '🧔', '👨', '👩', '🧑', '👨‍🌾', '👩‍🦳', '🧑‍🦱', '👱', '🧕'];
var RANGOS = [[20, 'Bar de mala muerte'], [40, 'Bar del pueblo'], [60, 'Bar de confianza'], [80, 'Bar de referencia'], [95, 'Bar de la comarca'], [101, 'Leyenda']];
var META_DINERO = 50000, META_FAMA = 90;

var S, tab = 'barra', R = null;
function $(id) { return document.getElementById(id); }
function eur(x) { return x.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'; }
function eur0(x) { return Math.round(x).toLocaleString('es-ES') + ' €'; }
function azar(a) { return a[Math.floor(Math.random() * a.length)]; }
function tiene(k) { return !!S.mejoras[k]; }
function rango() { for (var i = 0; i < RANGOS.length; i++) if (S.fama < RANGOS[i][0]) return RANGOS[i][1]; return RANGOS[RANGOS.length - 1][1]; }
function fecha(d) { var m = Math.floor((d - 1) / 30) % 12, n = (d - 1) % 30 + 1; return { dia: n, mes: (m + 5) % 12, semana: (d - 1) % 7 }; }
function refPrecio(k) {
  var r = PROD[k].ref;
  if (k === 'cafe' && tiene('cafetera')) r += .3;
  if (k === 'cana' && tiene('grifo')) r += .2;
  if (k === 'tapa' && tiene('cocina')) r += 1;
  return r;
}

function nuevo() {
  return { dia: 1, dinero: 600, fama: 15, precios: { cana: 1.5, cafe: 1.2, tapa: 2.5 }, stock: { cana: 50, cafe: 100, tapa: 0 },
           mejoras: {}, camareros: 0, meta: false, mejorDia: 0 };
}
function guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(S)); } catch (e) {} }
function cargar() { try { var t = JSON.parse(localStorage.getItem(CLAVE)); if (t && t.dia) return t; } catch (e) {} return null; }

// Lo que pasa hoy en el pueblo. Es determinista por día para que el aviso coincida con lo que luego ocurre.
function eventoDe(d) {
  var f = fecha(d), mes = f.mes;
  var h = Math.abs(Math.sin(d * 12.9898) * 43758.5453) % 1;
  if (mes === 7 && f.dia >= 12 && f.dia <= 16) return { id: 'fiestas', nom: 'Fiestas del pueblo', f: 2.2, canas: 1 };
  if (mes === 4 && f.dia === 15) return { id: 'romeria', nom: 'Romería', f: 1.6, canas: 1 };
  if (mes === 9 && f.dia <= 7 && f.semana === 6) return { id: 'feria', nom: 'Feria de ganado', f: 1.5 };
  if (mes === 11 && f.dia === 22) return { id: 'loteria', nom: 'Sorteo de la lotería', f: 1.4 };
  if (mes === 11 && f.dia === 24) return { id: 'nochebuena', nom: 'Nochebuena', f: .55 };
  if (mes === 11 && f.dia === 30) return { id: 'nochevieja', nom: 'Nochevieja', f: 1.8, canas: 1 };
  if (f.semana === 5 || (f.semana === 2 && h < .35)) return { id: 'partido', nom: f.semana === 5 ? 'Partido del sábado' : 'Partido de Champions', f: 1 };
  if (h > .87 && mes !== 6 && mes !== 7) return { id: 'lluvia', nom: 'Día de lluvia', f: .75 };
  return null;
}

function abrir() {
  var f = fecha(S.dia), ev = eventoDe(S.dia), frases = [];
  var base = 8 + S.fama * .5 + (tiene('mus') ? 3 : 0) + (tiene('letrero') ? 3 : 0);
  var mult = F_DIA[f.semana] * F_MES[f.mes];
  if (ev) mult *= ev.f;
  if (ev && ev.id === 'partido') {
    if (tiene('tele')) { mult *= 1.4; frases.push(azar(NOMBRES) + ': ¡Goooool! Ponnos otra ronda.'); }
    else { mult *= .85; frases.push('Hay partido y la gente se va a verlo al bar de enfrente. Haría falta una tele.'); }
  }
  var verano = f.mes >= 4 && f.mes <= 8;
  if (tiene('terraza') && !(ev && ev.id === 'lluvia')) mult *= verano ? 1.35 : 1.08;
  if (tiene('aire') && (f.mes === 6 || f.mes === 7)) mult *= 1.15;
  if (tiene('futbolin')) mult *= 1.05;
  if (tiene('karaoke') && (f.semana === 4 || f.semana === 5)) mult *= 1.25;
  // Precios: la caña es lo que más mira la gente.
  var atr = 0, peso = { cana: .55, cafe: .3, tapa: .15 };
  Object.keys(PROD).forEach(function (k) { atr += peso[k] * Math.max(.3, Math.min(1.5, Math.pow(refPrecio(k) / S.precios[k], 1.3))); });
  var llegan = Math.max(0, Math.round(base * mult * atr * (.85 + Math.random() * .3)));
  var capacidad = CAPACIDAD * (1 + S.camareros) + (tiene('terraza') && verano ? 15 : 0);
  var atendidos = Math.min(llegan, capacidad), seVan = llegan - atendidos;

  var vendido = { cana: 0, cafe: 0, tapa: 0 }, contentos = 0, sinGenero = 0, falta = {};
  var pCafe = .5 + (tiene('cafetera') ? .15 : 0), pCana = .7 + (tiene('grifo') ? .1 : 0), pTapa = .35 * (tiene('cocina') ? 1.5 : 1);
  for (var i = 0; i < atendidos; i++) {
    var ok = true, pide = {};
    if (Math.random() < pCafe * Math.min(1.3, refPrecio('cafe') / S.precios.cafe)) pide.cafe = 1;
    if (Math.random() < pCana * Math.min(1.3, refPrecio('cana') / S.precios.cana)) pide.cana = 1 + Math.floor(Math.random() * 3) + (ev && ev.canas ? 1 : 0);
    if (Math.random() < pTapa * Math.min(1.4, refPrecio('tapa') / S.precios.tapa)) pide.tapa = 1;
    Object.keys(pide).forEach(function (k) {
      var n = Math.min(pide[k], S.stock[k]);
      if (n < pide[k]) { ok = false; falta[k] = true; }
      S.stock[k] -= n; vendido[k] += n;
    });
    if (ok) contentos++; else sinGenero++;
  }

  var ingresos = 0, lineas = [];
  Object.keys(PROD).forEach(function (k) {
    var x = vendido[k] * S.precios[k]; ingresos += x;
    if (vendido[k]) lineas.push([PROD[k].ico + ' ' + vendido[k] + ' ' + PROD[k].nom.toLowerCase() + (vendido[k] === 1 ? '' : 's'), x]);
  });
  if (tiene('tragaperras')) { var tg = Math.round(atendidos * (.3 + Math.random() * .6)); ingresos += tg; lineas.push(['🎰 Tragaperras', tg]); }
  var gastos = [[tiene('local') ? 'Luz' : 'Luz y alquiler', -(tiene('local') ? 6 : FIJOS)]];
  if (S.camareros) gastos.push(['Sueldo de camareros', -SUELDO * S.camareros]);
  if (!tiene('bano') && Math.random() < .025) { gastos.push(['Multa de sanidad por el baño', -120]); frases.push('Ha venido el inspector de sanidad y ha visto el baño.'); }
  var tiradas = S.stock.tapa;
  if (tiradas) { S.stock.tapa = 0; frases.push('Se han echado a perder ' + tiradas + ' tapas.'); }
  var neto = ingresos + gastos.reduce(function (s, g) { return s + g[1]; }, 0);
  S.dinero += neto;

  // Fama: sube con los clientes contentos y baja con los que se quedan sin nada o sin sitio.
  var caro = S.precios.cana > refPrecio('cana') * 1.35;
  var sat = llegan ? (contentos - 3 * sinGenero - 2 * seVan) / llegan : -.3;
  var dFama = (sat > 0 ? sat * 1.2 * (1 - S.fama / 115) : sat * 4) + (tiene('bano') ? .1 : 0) - (caro ? .8 : 0);
  S.fama = Math.max(0, Math.min(100, S.fama + dFama));

  if (falta.cana) frases.push(azar(NOMBRES) + ': ¿Que no queda cerveza? ¿En un bar? Vamos, hombre.');
  if (falta.cafe) frases.push(azar(NOMBRES) + ': Sin café no arranco, ¿eh?');
  if (falta.tapa) frases.push(azar(NOMBRES) + ': ¿Y la tapa? Antes ponías tapa.');
  if (seVan) frases.push(seVan + ' clientes se han ido sin que nadie les atendiera.' + (S.camareros < 2 ? ' Contrata a alguien.' : ''));
  if (caro) frases.push(azar(NOMBRES) + ': ¿A ' + eur(S.precios.cana) + ' la caña? Ni en Madrid.');
  if (ev && ev.id === 'lluvia') frases.push(azar(NOMBRES) + ': Con esta lluvia no sale ni el gato.');
  if (ev && ev.id === 'fiestas') frases.push('¡Fiestas! La charanga ha pasado tres veces por la puerta.');
  if (!frases.length) frases.push(azar(NOMBRES) + ': ' + azar(['Aquí se está como en casa.', 'Ponme lo de siempre.', 'Esta tapa está de muerte.', 'Apúntamelo, que mañana te pago.', '¿Echamos un mus?']));

  if (neto > S.mejorDia) S.mejorDia = neto;
  R = { f: f, ev: ev, vendido: vendido, llegan: llegan, atendidos: atendidos, contentos: contentos, lineas: lineas, gastos: gastos, neto: neto, dFama: dFama, frases: frases };
  S.dia++;
  if (!S.meta && S.dinero >= META_DINERO && S.fama >= META_FAMA) { S.meta = S.dia - 1; R.meta = true; }
  if (S.dinero < -200) R.quiebra = true;
  guardar();
  pintar();
}

function comprar(k) { var p = PROD[k]; if (S.dinero < p.precioLote) return; S.dinero -= p.precioLote; S.stock[k] += p.lote; guardar(); pintar(); }
function precio(k, d) { S.precios[k] = Math.max(.5, Math.min(9.9, Math.round((S.precios[k] + d) * 10) / 10)); guardar(); pintar(); }
function mejorar(k, c) { if (S.dinero < c || tiene(k)) return; S.dinero -= c; S.mejoras[k] = S.dia; guardar(); pintar(); }
function contratar(d) { S.camareros = Math.max(0, Math.min(3, S.camareros + d)); guardar(); pintar(); }

function pintar() {
  var app = $('app');
  if (R) return pintarResumen(app);
  var f = fecha(S.dia), ev = eventoDe(S.dia);
  var h = '<div class="tarjeta"><div class="dia"><b>' + DIAS[f.semana] + ' ' + f.dia + ' de ' + MESES[f.mes] + '</b>' +
    (ev ? '<span class="evento">' + ev.nom + '</span>' : '<span class="evento" style="background:var(--border);color:var(--muted)">Día normal</span>') + '</div>' +
    '<div class="estado" style="margin-top:12px"><div><b>' + eur0(S.dinero) + '</b><span>Caja</span></div><div><b>' + Math.round(S.fama) + '</b><span>Fama</span></div>' +
    '<div><b>' + (S.dia) + '</b><span>Día</span></div><div><b>' + S.camareros + '</b><span>Camareros</span></div></div>' +
    '<div style="margin-top:10px;font-size:.9rem"><b>' + rango() + '</b>' + (S.meta ? ' · Meta cumplida el día ' + S.meta : ' · Meta: ' + eur0(META_DINERO) + ' y fama ' + META_FAMA) + '</div>' +
    '<div class="barra"><div style="width:' + S.fama + '%"></div></div></div>';
  h += '<div class="tabs">' + [['barra', 'Barra'], ['mejoras', 'Mejoras'], ['personal', 'Personal']].map(function (t) {
    return '<button data-tab="' + t[0] + '" class="' + (tab === t[0] ? 'on' : '') + '">' + t[1] + '</button>'; }).join('') + '</div>';
  h += '<div class="tarjeta">';
  if (tab === 'barra') {
    h += Object.keys(PROD).map(function (k) {
      var p = PROD[k];
      return '<div class="prod"><span class="nom">' + p.ico + ' ' + p.nom + '</span>' +
        '<span class="ctrl"><button class="mini" data-p="' + k + '" data-d="-0.1">−</button><b>' + eur(S.precios[k]) + '</b><button class="mini" data-p="' + k + '" data-d="0.1">+</button></span>' +
        '<span class="info">Quedan ' + S.stock[k] + (p.caduca ? ', se tiran al cerrar' : '') + ' · Precio normal en el pueblo ' + eur(refPrecio(k)) + '</span>' +
        '<span></span><button class="boton peq" data-c="' + k + '"' + (S.dinero < p.precioLote ? ' disabled' : '') + '>' + p.loteNom + ' ' + eur0(p.precioLote) + '</button></div>';
    }).join('');
  } else if (tab === 'mejoras') {
    h += MEJORAS.map(function (m) {
      var t = tiene(m[0]);
      return '<div class="mejora' + (t ? ' tiene' : '') + '"><span class="ico">' + m[1] + '</span><span><b>' + m[2] + '</b><small>' + m[4] + '</small></span>' +
        (t ? '<span>✔</span>' : '<button class="boton peq" data-m="' + m[0] + '" data-coste="' + m[3] + '"' + (S.dinero < m[3] ? ' disabled' : '') + '>' + eur0(m[3]) + '</button>') + '</div>';
    }).join('');
  } else {
    h += '<p>Tú solo puedes atender a unos ' + CAPACIDAD + ' clientes al día. Cada camarero atiende a otros ' + CAPACIDAD + ' y cobra ' + SUELDO + ' € al día.</p>' +
      '<div class="ctrl" style="justify-content:center"><button class="mini" data-cam="-1"' + (S.camareros ? '' : ' disabled') + '>−</button><b>' + S.camareros + '</b><button class="mini" data-cam="1"' + (S.camareros >= 3 ? ' disabled' : '') + '>+</button></div>' +
      '<p class="frase">Gastos fijos de luz y alquiler: ' + FIJOS + ' € al día. Mejor día hasta ahora: ' + eur(S.mejorDia) + '.</p>' +
      '<button class="boton peq" id="reiniciar" style="background:var(--malo)">Empezar de cero</button>';
  }
  h += '</div><button class="boton" id="abrir">Abrir el bar</button>';
  app.innerHTML = h;
  app.querySelectorAll('[data-tab]').forEach(function (b) { b.onclick = function () { tab = b.dataset.tab; pintar(); }; });
  app.querySelectorAll('[data-p]').forEach(function (b) { b.onclick = function () { precio(b.dataset.p, +b.dataset.d); }; });
  app.querySelectorAll('[data-c]').forEach(function (b) { b.onclick = function () { comprar(b.dataset.c); }; });
  app.querySelectorAll('[data-m]').forEach(function (b) { b.onclick = function () { mejorar(b.dataset.m, +b.dataset.coste); }; });
  app.querySelectorAll('[data-cam]').forEach(function (b) { b.onclick = function () { contratar(+b.dataset.cam); }; });
  if ($('reiniciar')) $('reiniciar').onclick = function () { if (confirm('¿Seguro? Se pierde todo el progreso.')) { S = nuevo(); guardar(); pintar(); } };
  $('abrir').onclick = abrir;
}

function pintarResumen(app) {
  var r = R, n = Math.min(r.llegan, 80);
  var h = '<div class="tarjeta"><h2>' + DIAS[r.f.semana] + ' ' + r.f.dia + ' de ' + MESES[r.f.mes] + (r.ev ? ' · ' + r.ev.nom : '') + '</h2>' +
    '<div class="clientes">' + Array.from({ length: n }, function (_, i) { return '<span style="animation-delay:' + (i * 25) + 'ms">' + (i < r.atendidos ? azar(CARAS) : '🚶') + '</span>'; }).join('') + '</div>' +
    '<p style="text-align:center;margin:8px 0 0">' + r.llegan + ' clientes, ' + r.contentos + ' contentos</p></div>';
  h += '<div class="tarjeta"><table class="cuentas">' + r.lineas.concat(r.gastos).map(function (l) {
    return '<tr><td>' + l[0] + '</td><td class="' + (l[1] < 0 ? 'neg' : '') + '">' + eur(l[1]) + '</td></tr>'; }).join('') +
    '<tr><td><b>Resultado del día</b></td><td class="' + (r.neto >= 0 ? 'pos' : 'neg') + '"><b>' + eur(r.neto) + '</b></td></tr>' +
    '<tr><td>Fama</td><td class="' + (r.dFama >= 0 ? 'pos' : 'neg') + '">' + (r.dFama >= 0 ? '+' : '') + r.dFama.toFixed(1) + '</td></tr></table></div>';
  h += '<div class="tarjeta">' + r.frases.map(function (t) { return '<p class="frase">' + t + '</p>'; }).join('') + '</div>';
  if (r.meta) h += '<div class="tarjeta"><h2>🏆 ¡Eres el bar de la comarca!</h2><p>Lo has conseguido en ' + S.meta + ' días. Puedes seguir jugando.</p></div>';
  if (r.quiebra) h += '<div class="tarjeta"><h2>🔒 El banco te cierra el bar</h2><p>Has llegado a ' + S.dia + ' días.</p></div>';
  h += '<button class="boton" id="seguir">' + (r.quiebra ? 'Empezar de nuevo' : 'Siguiente día') + '</button>';
  app.innerHTML = h;
  $('seguir').onclick = function () { if (r.quiebra) S = nuevo(); R = null; guardar(); pintar(); window.scrollTo(0, 0); };
}

S = cargar() || nuevo();
pintar();
