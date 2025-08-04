document.addEventListener("DOMContentLoaded", () => {
    const cuerpo = document.querySelector("body");
    const contenedorCompleto = document.querySelector(".container-completo");
    const tablaJugadores = document.querySelector(".container");
    let tiempo = 180; // 3 minutos en segundos
    const cronometro = document.getElementById("cronometro");

    const intervalo = setInterval(() => {
        const minutos = Math.floor(tiempo / 60);
        const segundos = tiempo % 60;

        cronometro.textContent = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;

        if (tiempo <= 0) {
            clearInterval(intervalo);
            cronometro.textContent = "¡Tiempo!";
            cuerpo.style.backgroundImage = "url(../img/gif/pantalla-partida-v.gif)";
            contenedorCompleto.style.display = "none";
            cuerpo.style.overflowY = "auto";
            tablaJugadores.style.display = "block";

            setTimeout(() => {
                window.location.href = "../html/InicioDelJuego.html";
            }, 10000);
        }

        tiempo--;
    }, 1000);

    const cronometro2 = document.getElementById("cronometro-2");
    const cartas = document.querySelectorAll('.carta');
    const ContainerBottones = document.querySelector(".container-bottones");
    const noLanzar = document.querySelector('.no-tirar');
    const tirar = document.querySelector(".tirar");
    let intervalo2;

    cartas.forEach((carta) => {
        carta.addEventListener("click", (evento) => {
            cartas.forEach(c => c.classList.remove('seleccionada'));

            const cartaSeleccionada = evento.currentTarget;
            const idCarta = cartaSeleccionada.id;

            console.log("Carta presionada con ID:", idCarta);
            cartaSeleccionada.classList.add('seleccionada');
            ContainerBottones.style.display = "block";
            cronometro2.style.display = "block";

            iniciarCuentaRegresiva();
        });
    });

   tirar.addEventListener("click", () => {
    const cartaSeleccionada = document.querySelector('.carta.seleccionada');
    if (cartaSeleccionada) {
        cartaSeleccionada.classList.add("dejar");
        cartaSeleccionada.classList.remove("seleccionada", "volteada");
    }

    ContainerBottones.style.display = "none";
    cronometro2.style.display = "none";
    clearInterval(intervalo2);
});


    noLanzar.addEventListener("click", () => {
        cartas.forEach(c => c.classList.remove('seleccionada'));
        ContainerBottones.style.display = "none";
        cronometro2.style.display = "none";
        clearInterval(intervalo2);
    });

    function iniciarCuentaRegresiva() {
        let tiempo2 = 10;

        clearInterval(intervalo2);
        cronometro2.style.color = "";
        cronometro2.style.background = "";
        cronometro2.style.textShadow = "";
        cronometro2.textContent = tiempo2;

        intervalo2 = setInterval(() => {
            if (tiempo2 >= 0) {
                cronometro2.textContent = tiempo2;
                tiempo2--;
            } else {
                clearInterval(intervalo2);
                cronometro2.textContent = "¡BOOM!";
                cronometro2.style.color = "white";
                cronometro2.style.background = "darkred";
                cronometro2.style.textShadow = "0 0 10px white";
            }
        }, 1000);
    }

    function voltearCarta(carta) {
        carta.classList.toggle('volteada');
        // Aquí podrías activar un sonido, si lo deseas
    }
});
