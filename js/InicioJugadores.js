document.addEventListener("DOMContentLoaded",()=>{
    const bottomAgragarJugador= document.querySelector('.caja-contenedor-mas');
    const ContenedorDeJugadorCreados= document.querySelector('jugadores');
    bottomAgragarJugador.addEventListener("click",()=>{
        alert("hola")
        fetch('../json/InicioJugadores.json')
        .then(response => {
            if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            // Aquí puedes trabajar con los datos JSON
            ContenedorDeJugadorCreados.appendChild(data.cajas_usuario)
        })
        .catch(error => {
            console.error('Hubo un problema con la petición Fetch:', error);
        });
    })
})