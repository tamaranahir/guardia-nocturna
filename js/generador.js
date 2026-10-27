/*  GENERADOR CONGRUENCIAL MULTIPLICATIVO (Laboratorio 1)

   Formula:   X(i+1) = (a * X(i)) mod m
              u(i)   = X(i+1) / m          (queda entre 0 y 1)

   DATOS DEL GENERADOR
   - m y a son CONSTANTES (los del Laboratorio 1).
   - La semilla X0 la genera una funcion aleatoria (Math.random)
*/

const MODULO_M = 2147483647;      // m = 2^31 - 1 (primo de Mersenne)
const MULTIPLICADOR_A = 16807;    // a = 7^5

let gcm_a = BigInt(MULTIPLICADOR_A);
let gcm_m = BigInt(MODULO_M);
let gcm_x0 = 0n;                  // semilla (se guarda para detectar repeticiones)
let gcm_x = 0n;                   // ultimo X calculado
let usados = 0;                   // cuantos numeros se generaron (y usaron)
let secuencia_repetida = false;   // true si la secuencia vuelve a la semilla

// Semilla aleatoria: entero IMPAR entre 1 y m-1
function generar_semilla_aleatoria() {
  let semilla = Math.floor(Math.random() * (MODULO_M - 1)) + 1;   // entre 1 y m-1
  if (semilla % 2 === 0) {
    semilla = semilla - 1;                                         // si es par, pasa a impar
  }
  return semilla;
}

function iniciar_generador(semilla) {
  gcm_x0 = BigInt(semilla);
  gcm_x = BigInt(semilla);
  usados = 0;
  secuencia_repetida = false;
}

// GU(u): genera y entrega el proximo numero aleatorio
function GU() {
  gcm_x = (gcm_a * gcm_x) % gcm_m;            // X(i+1) = (a * X(i)) mod m
  let u = Number(gcm_x) / Number(gcm_m);      // u = X / m
  usados = usados + 1;

  if (gcm_x === gcm_x0) {
    secuencia_repetida = true;                // dio la vuelta completa
  }
  return u;
}
