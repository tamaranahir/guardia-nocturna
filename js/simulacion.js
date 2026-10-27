/*
     X1 ~ Normal(mu, sigma)     duracion de la consulta base
     X2 ~ Bernoulli(p)          ¿necesita estudios adicionales? (1 = si)
     X3 ~ Exponencial(EX)       tiempo extra de los estudios (solo si X2 = 1)
 */

/* 1) Variables aleatorias */

// X1: duracion de la consulta ~ Normal(mu, sigma) por Teorema del Limite Central.
function PROC_NORMAL(mu, sigma) {
  let suma = 0;
  for (let i = 1; i <= 12; i++) {
    suma = suma + GU();
  }
  let x = sigma * (suma - 6) + mu;
  if (x < 1) {
    x = 1;                  // una consulta no puede durar menos de 1 minuto
  }
  return x;
}

// X2: ¿necesita estudios? Devuelve 1 (si) o 0 (no)
function PROC_BERNOULLI(p) {
  let u = GU();
  if (u <= p) {
    return 1;
  } else {
    return 0;
  }
}

// X3: tiempo extra de los estudios ~ Exponencial con media ex (transformada inversa)
function PROC_EXPONEN(ex) {
  let u = GU();
  while (u === 0) {         // ln(0) no existe: si sale 0 se pide otro
    u = GU();
  }
  let x = -ex * Math.log(u);
  return x;
}

/* 2) Programa principal
   p = datos validados */
function simular(p) {
  let duracion = p.horas * 60;      // duracion del turno en minutos
  let jornadas = [];                // resultado de cada dia
  let detalle_dia1 = [];            // paciente por paciente del primer dia (para mostrar)
  let dias_cumple = 0;
  let total_estudios = 0;
  let suma_minutos = 0;

  let dia = 1;
  while (dia <= p.dias) {

    let tiempo = 0;                 // minutos acumulados en esta jornada
    let estudios = 0;               // pacientes de esta jornada que necesitaron estudios

    for (let paciente = 1; paciente <= p.pacientes; paciente++) {
      let x1 = PROC_NORMAL(p.muConsulta, p.sigmaConsulta);   // consulta base
      let x2 = PROC_BERNOULLI(p.pEstudios);                  // ¿necesita estudios?
      let x3 = 0;
      if (x2 === 1) {
        x3 = PROC_EXPONEN(p.exEstudios);                     // tiempo de los estudios
        estudios = estudios + 1;
      }
      tiempo = tiempo + x1 + x3;

      if (dia === 1) {
        detalle_dia1.push({ n: paciente, x1: x1, x2: x2, x3: x3, total: x1 + x3, acumulado: tiempo });
      }
    }

    // ¿Alcanzo el turno para atender a todos los pacientes?
    let cumple = (tiempo <= duracion);
    if (cumple) {
      dias_cumple = dias_cumple + 1;
    }

    total_estudios = total_estudios + estudios;
    suma_minutos = suma_minutos + tiempo;
    jornadas.push({ dia: dia, tiempo: tiempo, estudios: estudios, cumple: cumple });

    dia = dia + 1;
  }

  // ----- Resultados finales -----
  let minimo = jornadas[0].tiempo;
  let maximo = jornadas[0].tiempo;
  for (let i = 1; i < jornadas.length; i++) {
    if (jornadas[i].tiempo < minimo) minimo = jornadas[i].tiempo;
    if (jornadas[i].tiempo > maximo) maximo = jornadas[i].tiempo;
  }

  return {
    duracion: duracion,
    jornadas: jornadas,
    detalle_dia1: detalle_dia1,
    dias_cumple: dias_cumple,
    dias_no_cumple: p.dias - dias_cumple,
    porcentaje_cumple: dias_cumple * 100 / p.dias,
    total_pacientes: p.dias * p.pacientes,
    total_estudios: total_estudios,
    prom_jornada: suma_minutos / p.dias,
    prom_paciente: suma_minutos / (p.dias * p.pacientes),
    min_jornada: minimo,
    max_jornada: maximo
  };
}
