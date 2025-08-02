


function usuarioPresente() {
const inicioFreddy = document.querySelector('.container-logo-inicio');
const Empezar = document.querySelector('.container-video');

Empezar.style.transition = "opacity 1s ease";

inicioFreddy.style.transition = "opacity 1s ease";
inicioFreddy.style.opacity = "0";

setTimeout(() => {
  inicioFreddy.style.display = "none";

  Empezar.style.display = "inline-block";
  Empezar.style.opacity = "0"; 

  setTimeout(() => {
    Empezar.style.opacity = "1"; 
  }, 80);

}, 2000); 

 
}

let yaEjecutado = false;

function activarSoloUnaVez() {
    if (!yaEjecutado) {
        yaEjecutado = true;
        usuarioPresente();
    }
}

window.addEventListener("mousemove", activarSoloUnaVez);    // Mueve el mouse
window.addEventListener("mousedown", activarSoloUnaVez);    // Hace clic
window.addEventListener("keydown", activarSoloUnaVez);      // Presiona una tecla
window.addEventListener("touchstart", activarSoloUnaVez);   // Toca la pantalla (móvil)
window.addEventListener("focus", activarSoloUnaVez);        // Enfoca la pestaña/ventana
window.addEventListener("mouseenter", activarSoloUnaVez); 

document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
        activarSoloUnaVez();
    }
});

// window.addEventListener("DOMContentLoaded", () => {
//   if (document.visibilityState === "visible") {
//     activarSoloUnaVez();
//   }
// });

function irTransmision(){
    window.location.href = '../html/InicioJugadores.html'
}