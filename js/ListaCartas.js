       function voltearCarta(carta) {
            // Alternar la clase 'volteada' para activar la animación
            carta.classList.toggle('volteada');
            
            // Sonido opcional (opcional, puedes comentar esta línea si no quieres sonido)
            // const audio = new Audio('sonido-volteo.mp3');
            // audio.play().catch(e => console.log('No se pudo reproducir el sonido'));
        }

        // Opcional: Auto-voltear todas las cartas después de 3 segundos (para demostración)
        // setTimeout(() => {
        //     const todasLasCartas = document.querySelectorAll('.carta');
        //     todasLasCartas.forEach(carta => {
        //         carta.classList.add('volteada');
        //     });
        // }, 3000);
