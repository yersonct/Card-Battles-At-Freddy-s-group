const bottomAgragarJugador = document.querySelector('.caja-contenedor-mas');
const ContenedorDeJugadorCreados = document.querySelector('.jugadores');
const textoMensaje = document.querySelector('.Text-Cantidad');

function PonerCamposUsuario() {
    const cantidadHijos = ContenedorDeJugadorCreados.children.length;

    if (cantidadHijos <= 6 ) {
        const cajas_usuario = `
            <div class='caja-jugadores' id='caja-${cantidadHijos}'>
               <div class="Cancelar" id="Cancelar-${cantidadHijos}" onclick="eliminarJugador(this)"><b>X</b></div>
                <div class='caja-imagen'></div>
                <div class='caja-nombre'>
                    <input type='text' placeholder='Nombre'>
                </div>
            </div>`;
        ContenedorDeJugadorCreados.insertAdjacentHTML('beforeend', cajas_usuario);
        textoMensaje.textContent = `Jugadores: ${cantidadHijos+1}`;
    } else {
        textoMensaje.textContent = "No se puede agregar más jugadores";
        bottomAgragarJugador.style.display ='none'


        
    }
}

bottomAgragarJugador.addEventListener('click', PonerCamposUsuario);

function eliminarJugador(boton) {
  const contenedor = boton.closest('.caja-jugadores');
  if (contenedor) {
    const cantidadHijos = ContenedorDeJugadorCreados.children.length;
    textoMensaje.textContent = `Jugadores: ${cantidadHijos-1}`;
    if(cantidadHijos<=2){
        textoMensaje.textContent = `Por lo menos son dos Jugadores que ingresa a la sala`;
    }else{
        contenedor.remove();
        bottomAgragarJugador.style.display ='flex'

    }
  }
    
   

}

function IniciarPartidad(){
   window.location.href = "./Partida.html"
}





function ponerAvatar(){

    
fetch('datos.json')
  .then(response => {
    if (!response.ok) throw new Error('No se pudo cargar el JSON');
    return response.json();
  })
  .then(data => {
    console.log('Datos:', data);

    // Puedes recorrerlo
    data.forEach(jugador => {
      console.log(`ID: ${jugador.id}, Nombre: ${jugador.nombre}, Puntos: ${jugador.puntos}`);
    });
  })
  .catch(error => {
    console.error('Error al obtener el JSON:', error);
  });

}