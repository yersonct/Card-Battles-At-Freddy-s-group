const inicioFreddy = document.querySelector('.container-logo-inicio');
const Empezar = document.querySelector('.container-video');

Empezar.style.display ="none"
setTimeout(()=>{
Empezar.style.display ="flex"
inicioFreddy.style.display = "none"
},2000)
function irTransmision(){
    window.location.href = '../html/InicioJugadores.html'
}