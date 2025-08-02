document.addEventListener("DOMContentLoaded", () => {
    const elementos = document.querySelectorAll(".elementos");

    elementos.forEach((elemento) => {
        elemento.addEventListener("click", () => {
            const destino = elemento.getAttribute("data-url");
            if (destino) {
                // Guardamos la URL de destino en el almacenamiento local
                localStorage.setItem("urlDestino", destino);

                // Redirigimos a la página de transición
                window.location.href = "../html/Pantalla.html";
            }
        });
    });
});
