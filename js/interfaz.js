const CAMPOS = ['dias', 'pacientes', 'horas', 'objetivo', 'muConsulta', 'sigmaConsulta', 'pEstudios', 'exEstudios'];

let grafico_jornadas = null;

function leer_campos() {
  let valores = {};
  for (let i = 0; i < CAMPOS.length; i++) {
    valores[CAMPOS[i]] = document.getElementById(CAMPOS[i]).value;
  }
  return valores;
}

function mostrar_errores(errores) {
  for (let i = 0; i < CAMPOS.length; i++) {
    let id = CAMPOS[i];
    let casillero = document.getElementById(id);
    let mensaje = document.getElementById('err-' + id);
    if (errores[id] !== undefined) {
      casillero.classList.add('invalido');
      mensaje.textContent = errores[id];
    } else {
      casillero.classList.remove('invalido');
      mensaje.textContent = '';
    }
  }
}

function ejecutar_simulacion() {
  // 1) Leer y validar los datos del modelo
  let validacion = validar_entradas(leer_campos());
  mostrar_errores(validacion.errores);

  let estado = document.getElementById('estado');
  if (!validacion.ok) {
    estado.textContent = 'Hay datos inválidos. Corríjalos e ingréselos de nuevo.';
    estado.className = 'estado error';
    return;
  }
  estado.textContent = '';
  estado.className = 'estado';

  let p = validacion.datos;

  // 2) Preparar el generador con una semilla aleatoria y simular
  let semilla = generar_semilla_aleatoria();
  iniciar_generador(semilla);
  let r = simular(p);

  // 3) Mostrar
  document.getElementById('resultados').style.display = 'block';
  mostrar_resultados(r, p);
  mostrar_hipotesis(r, p);
  mostrar_grafico(r);
  mostrar_jornadas(r);
  mostrar_detalle(r);
  mostrar_kpis(r, p);

  document.getElementById('resultados').scrollIntoView({ behavior: 'smooth' });
}

/* Tarjetas KPi (Métricas Principales Superiores)*/
function mostrar_kpis(r, p) {
  // 1) Porcentaje de Éxito
  let elemExito = document.getElementById('kpi-exito');
  let elemDiasSub = document.getElementById('kpi-dias-sub');
  if (elemExito) elemExito.textContent = r.porcentaje_cumple.toFixed(1) + '%';
  if (elemDiasSub) elemDiasSub.textContent = `${r.dias_cumple} de ${p.dias} Días a tiempo`;

  // 2) Tiempo Medio por Guardia y Margen
  let elemMedio = document.getElementById('kpi-tiempo-medio');
  let elemMargenSub = document.getElementById('kpi-margen-sub');
  let margen = r.duracion - r.prom_jornada;

  if (elemMedio) elemMedio.textContent = `${r.prom_jornada.toFixed(0)} min`;
  if (elemMargenSub) {
    if (margen >= 0) {
      elemMargenSub.textContent = `Margen libre: ${margen.toFixed(0)} min`;
    } else {
      elemMargenSub.textContent = `Horas extra: ${Math.abs(margen).toFixed(0)} min`;
    }
  }

  // 3) Pacientes con Estudios
  let elemEstudios = document.getElementById('kpi-estudios');
  let elemEstudiosSub = document.getElementById('kpi-estudios-sub');
  let porcEstudios = r.total_pacientes > 0 ? (r.total_estudios * 100 / r.total_pacientes) : 0;
  let promEstudiosDia = (r.total_estudios / p.dias).toFixed(1);

  if (elemEstudios) elemEstudios.textContent = `${porcEstudios.toFixed(1)}%`;
  if (elemEstudiosSub) elemEstudiosSub.textContent = `~${promEstudiosDia} pac / día prom.`;
}


function mostrar_resultados(r, p) {
  document.getElementById('resultados-tabla').innerHTML =
    '<table>' +
      '<thead><tr><th>Variable de salida</th><th>Resultado</th></tr></thead>' +
      '<tbody>' +
        '<tr><td><strong>Jornadas que completan los ' + p.pacientes + ' pacientes en ' + r.duracion + ' min</strong></td>' +
          '<td><span class="badge badge-success">' + r.dias_cumple + ' de ' + p.dias + ' (' + r.porcentaje_cumple.toFixed(2) + '%)</span></td></tr>' +
        '<tr><td><strong>Jornadas que no alcanzan (horas extra)</strong></td>' +
          '<td><span class="badge badge-danger">' + r.dias_no_cumple + ' de ' + p.dias + '</span></td></tr>' +
        '<tr><td>Tiempo promedio de una jornada</td><td>' + r.prom_jornada.toFixed(2) + ' min</td></tr>' +
        '<tr><td>Jornada más corta / más larga</td><td>' + r.min_jornada.toFixed(2) + ' min / ' + r.max_jornada.toFixed(2) + ' min</td></tr>' +
        '<tr><td>Tiempo promedio por paciente (con estudios)</td><td>' + r.prom_paciente.toFixed(2) + ' min</td></tr>' +
        '<tr><td>Pacientes que necesitaron estudios</td><td>' + r.total_estudios + ' de ' + r.total_pacientes +
          ' (' + (r.total_estudios * 100 / r.total_pacientes).toFixed(2) + '%)</td></tr>' +
      '</tbody>' +
    '</table>';
  document.getElementById('titulo-resultados').textContent =
    'Resultados de la simulación';
}

/* Hipótesis --> al menos el 85 % de las jornadas deben completar la agenda */
function mostrar_hipotesis(r, p) {
  let dias_necesarios = Math.ceil(p.objetivo * p.dias / 100);
  let confirmada = (r.dias_cumple >= dias_necesarios);

  let titulo;
  let clase;
  let cierre;
  if (confirmada) {
    titulo = 'HIPÓTESIS CONFIRMADA';
    clase = 'ok';
    cierre = 'alcanzando el mínimo requerido.';
  } else {
    titulo = 'HIPÓTESIS NO CONFIRMADA';
    clase = 'no';
    cierre = 'sin alcanzar el mínimo requerido.';
  }

  document.getElementById('evaluacion-contenido').innerHTML =
    '<div class="hyp-box ' + clase + '">' +
      '<p class="hyp-titulo">' + titulo + '</p>' +
      '<p>La hipótesis exige completar la agenda de ' + p.pacientes + ' pacientes dentro de ' + r.duracion +
      ' minutos en al menos el ' + p.objetivo + '% de las jornadas (' + dias_necesarios + ' o más de ' + p.dias + '). ' +
      'En la simulación esto ocurrió en <strong>' + r.dias_cumple + ' jornadas (' + r.porcentaje_cumple.toFixed(2) + '%)</strong>, ' + cierre + '</p>' +
      '<p style="margin-top:8px;">Tiempo promedio de una jornada: <strong>' + r.prom_jornada.toFixed(2) +
      ' min</strong> frente a un turno de ' + r.duracion + ' min.</p>' +
    '</div>';
}

/* Gráfico: minutos de cada jornada contra el limite del turno */
function mostrar_grafico(r) {
  if (typeof Chart === 'undefined') return;
  if (grafico_jornadas !== null) grafico_jornadas.destroy();

  let etiquetas = [];
  let tiempos = [];
  let colores = [];
  let limite = [];
  for (let i = 0; i < r.jornadas.length; i++) {
    let j = r.jornadas[i];
    etiquetas.push(String(j.dia));
    tiempos.push(Number(j.tiempo.toFixed(1)));
    colores.push(j.cumple ? '#22c55e' : '#ef4444');
    limite.push(r.duracion);
  }

  grafico_jornadas = new Chart(document.getElementById('chartJornadas').getContext('2d'), {
    data: {
      labels: etiquetas,
      datasets: [
        { type: 'bar', label: 'Tiempo de la jornada (min)', data: tiempos, backgroundColor: colores, borderRadius: 3 },
        { type: 'line', label: 'Duración del turno (' + r.duracion + ' min)', data: limite,
          borderColor: '#0f172a', borderDash: [6, 4], pointRadius: 0, borderWidth: 2 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      scales: {
        x: { title: { display: true, text: 'Jornada (día)' } },
        y: { beginAtZero: false, title: { display: true, text: 'Minutos' } }
      }
    }
  });
}

/* Tabla de jornada */
function mostrar_jornadas(r) {
  let html = '<table><thead><tr><th>Día</th><th>Pacientes con estudios</th><th>Tiempo total</th>' +
             '<th>Sobra / falta</th><th>¿Completa la agenda?</th></tr></thead><tbody>';

  for (let i = 0; i < r.jornadas.length; i++) {
    let j = r.jornadas[i];
    let diferencia = r.duracion - j.tiempo;           // positivo = sobra, negativo = horas extra
    let signo = diferencia >= 0 ? '+' : '';
    let marca = j.cumple ? '<span class="badge badge-success">Sí</span>' : '<span class="badge badge-danger">No</span>';
    html = html + '<tr><td>' + j.dia + '</td><td>' + j.estudios + '</td><td>' + j.tiempo.toFixed(2) + ' min</td>' +
           '<td>' + signo + diferencia.toFixed(2) + ' min</td><td>' + marca + '</td></tr>';
  }
  html = html + '</tbody></table>';
  document.getElementById('tabla-jornadas').innerHTML = html;
}

/* Detalle de la primera jornada)  */
function mostrar_detalle(r) {
  let html = '<table><thead><tr><th>Paciente</th><th>X₁ consulta</th><th>X₂ ¿estudios?</th>' +
             '<th>X₃ tiempo estudios</th><th>Tiempo del paciente</th><th>Acumulado</th></tr></thead><tbody>';

  for (let i = 0; i < r.detalle_dia1.length; i++) {
    let d = r.detalle_dia1[i];
    let estudios = d.x2 === 1 ? 'Sí' : 'No';
    let extra = d.x2 === 1 ? d.x3.toFixed(2) + ' min' : '—';
    html = html + '<tr><td>' + d.n + '</td><td>' + d.x1.toFixed(2) + ' min</td><td>' + estudios + '</td><td>' + extra +
           '</td><td>' + d.total.toFixed(2) + ' min</td><td>' + d.acumulado.toFixed(2) + ' min</td></tr>';
  }
  html = html + '</tbody></table>';
  document.getElementById('tabla-detalle').innerHTML = html;
}

// Enter dentro de un casillero tambien simula
document.addEventListener('DOMContentLoaded', function () {
  for (let i = 0; i < CAMPOS.length; i++) {
    document.getElementById(CAMPOS[i]).addEventListener('keydown', function (e) {
      if (e.key === 'Enter') ejecutar_simulacion();
    });
  }
});
