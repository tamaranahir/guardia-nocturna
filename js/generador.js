/* ============================================================================
   generador.js  -  GENERADOR CONGRUENCIAL MULTIPLICATIVO (Laboratorio 1)

   Formula:   X(i+1) = (a * X(i)) mod m
              u(i)   = X(i+1) / m          (queda entre 0 y 1)

   En el diagrama es el procedimiento  GU(u).

   DATOS DEL GENERADOR
   - m y a son CONSTANTES (los del Laboratorio 1).
   - La semilla X0 la genera una funcion aleatoria (Math.random), como pidio la
     profesora. Siempre es un numero impar entre 1 y m-1.

   QUE HACE ESTE GENERADOR (para la defensa)
   - Fabrica UN numero cada vez que se lo piden: genera SOLO LOS NECESARIOS,
     no arma listas por adelantado.
   - Cada numero se usa una sola vez: NO se reutiliza ninguno.
   - Los 30 dias usan numeros distintos: la secuencia sigue de largo, no vuelve
     a la semilla al empezar cada dia.
   - Controla si la secuencia llegara a repetirse (cuando X vuelve a la semilla).
     Con m = 2147483647 el periodo es de 2147483646 numeros y la simulacion usa
     unos 10.000, asi que nunca se repite.
   ============================================================================ */

const MODULO_M = 2147483647;      // m = 2^31 - 1 (primo de Mersenne)
const MULTIPLICADOR_A = 16807;    // a = 7^5

let gcm_a = BigInt(MULTIPLICADOR_A);
let gcm_m = BigInt(MODULO_M);
let gcm_x0 = 0n;                  // semilla (se guarda para detectar repeticiones)
let gcm_x = 0n;                   // ultimo X calculado
let usados = 0;                   // cuantos numeros se generaron (y usaron)
let secuencia_repetida = false;   // true si la secuencia vuelve a la semilla
let primeros = [];                // los primeros 10 numeros, solo para mostrarlos


// Semilla aleatoria: entero IMPAR entre 1 y m-1
function generar_semilla_aleatoria() {
  let semilla = Math.floor(Math.random() * (MODULO_M - 1)) + 1;   // entre 1 y m-1
  if (semilla % 2 === 0) {
    semilla = semilla - 1;                // si es par, pasa a impar
  }
  return semilla;
}


function iniciar_generador(semilla) {
  gcm_x0 = BigInt(semilla);
  gcm_x = BigInt(semilla);
  usados = 0;
  secuencia_repetida = false;
  primeros = [];
}


// GU(u): genera y entrega el proximo numero aleatorio
function GU() {
  gcm_x = (gcm_a * gcm_x) % gcm_m;            // X(i+1) = (a * X(i)) mod m
  let u = Number(gcm_x) / Number(gcm_m);      // u = X / m
  usados = usados + 1;

  if (gcm_x === gcm_x0) {
    secuencia_repetida = true;                // dio la vuelta completa
  }
  if (primeros.length < 10) {
    primeros.push({ i: usados, x: gcm_x, u: u });
  }
  return u;
}
