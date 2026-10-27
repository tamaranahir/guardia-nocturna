function texto_a_numero(texto) {
  if (texto === null || texto === undefined) return NaN;
  texto = String(texto).trim();
  if (texto === '') return NaN;
  return Number(texto);
}

/* Devuelve { ok, errores, datos } */
function validar_entradas(valores) {
  let errores = {};
  let n = {};

  for (let campo in valores) {
    n[campo] = texto_a_numero(valores[campo]);
  }

  if (!Number.isInteger(n.dias) || n.dias < 1 || n.dias > 3650) {
    errores.dias = 'Ingrese una cantidad entera de días entre 1 y 3650.';
  }
  if (!Number.isInteger(n.pacientes) || n.pacientes < 1 || n.pacientes > 500) {
    errores.pacientes = 'Ingrese una cantidad entera de pacientes entre 1 y 500.';
  }
  if (!Number.isFinite(n.horas) || n.horas <= 0 || n.horas > 24) {
    errores.horas = 'El turno debe durar entre 0 y 24 horas.';
  }
  if (!Number.isFinite(n.muConsulta) || n.muConsulta <= 0) {
    errores.muConsulta = 'La media de la consulta debe ser mayor que 0 (ej: 12 min).';
  }
  if (!Number.isFinite(n.sigmaConsulta) || n.sigmaConsulta < 0) {
    errores.sigmaConsulta = 'El desvío debe ser mayor o igual a 0 (ej: 2 min).';
  }
  if (!Number.isFinite(n.pEstudios) || n.pEstudios < 0 || n.pEstudios > 1) {
    errores.pEstudios = 'La proporción debe estar entre 0 y 1 (ej: 0.20).';
  }
  if (!Number.isFinite(n.exEstudios) || n.exEstudios <= 0) {
    errores.exEstudios = 'La media de los estudios debe ser mayor que 0 (ej: 10 min).';
  }
  if (!Number.isFinite(n.objetivo) || n.objetivo <= 0 || n.objetivo > 100) {
    errores.objetivo = 'El objetivo debe estar entre 0 y 100 (%).';
  }

  let hay_errores = Object.keys(errores).length > 0;
  return { ok: !hay_errores, errores: errores, datos: n };
}
