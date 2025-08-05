//  SCRIPT DE DIAGNÓSTICO COMPLETO - Card Battles At Freddy's
// Ejecutar desde cualquier página para verificar el estado del sistema

class DiagnosticoCompleto {
    constructor() {
        this.resultados = {
            timestamp: new Date().toISOString(),
            localStorage: {},
            backend: {},
            archivosJS: {},
            navegacion: {},
            erroresEncontrados: [],
            recomendaciones: []
        };
        
        console.log(' === INICIANDO DIAGNÓSTICO COMPLETO ===');
    }

    // Ejecutar diagnóstico completo
    async ejecutarDiagnostico() {
        try {
            console.log(' 1. Verificando localStorage...');
            this.verificarLocalStorage();
            
            console.log(' 2. Verificando backend...');
            await this.verificarBackend();
            
            console.log(' 3. Verificando archivos JavaScript...');
            this.verificarArchivosJS();
            
            console.log(' 4. Verificando navegación...');
            this.verificarNavegacion();
            
            console.log(' 5. Verificando errores guardados...');
            this.verificarErroresGuardados();
            
            console.log(' 6. Generando reporte final...');
            this.generarReporteFinal();
            
            return this.resultados;
            
        } catch (error) {
            console.error(' Error en diagnóstico:', error);
            this.resultados.erroresEncontrados.push({
                tipo: 'ERROR_DIAGNOSTICO',
                mensaje: error.message,
                stack: error.stack
            });
        }
    }

    // 1. Verificar localStorage
    verificarLocalStorage() {
        console.log(' Verificando datos en localStorage...');
        
        const datosImportantes = [
            'partidaId',
            'jugadorId', 
            'jugadorNombre',
            'debugInfo_errores',
            'debugInfo_ultimoError',
            'debugInfo_partidaData'
        ];
        
        this.resultados.localStorage = {
            todoElStorage: {...localStorage},
            datosPartida: {},
            erroresDebug: {},
            totalItems: localStorage.length
        };
        
        // Verificar datos de partida
        datosImportantes.forEach(key => {
            const valor = localStorage.getItem(key);
            if (key.startsWith('debugInfo_')) {
                this.resultados.localStorage.erroresDebug[key] = valor ? 'PRESENTE' : 'AUSENTE';
                if (valor) {
                    try {
                        const parsed = JSON.parse(valor);
                        this.resultados.localStorage.erroresDebug[key + '_contenido'] = parsed;
                    } catch (e) {
                        this.resultados.localStorage.erroresDebug[key + '_error'] = 'JSON_INVALID';
                    }
                }
            } else {
                this.resultados.localStorage.datosPartida[key] = valor || 'AUSENTE';
            }
        });
        
        // Verificar si hay datos de partida completos
        const partidaCompleta = this.resultados.localStorage.datosPartida.partidaId && 
                               this.resultados.localStorage.datosPartida.jugadorId;
        
        if (!partidaCompleta) {
            this.resultados.erroresEncontrados.push({
                tipo: 'DATOS_PARTIDA_INCOMPLETOS',
                mensaje: 'Faltan datos básicos de partida en localStorage',
                detalles: this.resultados.localStorage.datosPartida
            });
            this.resultados.recomendaciones.push('1. Crear una partida válida desde CrearSala');
        }
        
        console.log(' localStorage verificado:', this.resultados.localStorage);
    }

    // 2. Verificar backend
    async verificarBackend() {
        console.log(' Verificando conexión al backend...');
        
        const endpoints = [
            'http://localhost:7147/api/partida',
            'http://localhost:7147/api/jugador',
            'http://localhost:7147/api/carta',
            'http://localhost:7147/api/ronda'
        ];
        
        this.resultados.backend = {
            baseUrl: 'http://localhost:7147',
            endpointsTesteados: {},
            conexionGeneral: 'DESCONOCIDA'
        };
        
        let conexionesExitosas = 0;
        
        for (const endpoint of endpoints) {
            try {
                console.log(` Probando: ${endpoint}`);
                
                const response = await fetch(endpoint, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                const endpointName = endpoint.split('/').pop();
                this.resultados.backend.endpointsTesteados[endpointName] = {
                    status: response.status,
                    ok: response.ok,
                    statusText: response.statusText
                };
                
                if (response.ok) {
                    conexionesExitosas++;
                    console.log(` ${endpointName}: OK (${response.status})`);
                } else {
                    console.log(` ${endpointName}: ${response.status} ${response.statusText}`);
                }
                
            } catch (error) {
                const endpointName = endpoint.split('/').pop();
                this.resultados.backend.endpointsTesteados[endpointName] = {
                    error: error.message,
                    tipo: 'CONNECTION_ERROR'
                };
                
                console.log(` ${endpointName}: ${error.message}`);
                
                this.resultados.erroresEncontrados.push({
                    tipo: 'BACKEND_ERROR',
                    endpoint: endpoint,
                    mensaje: error.message
                });
            }
        }
        
        // Evaluar conexión general
        if (conexionesExitosas === 0) {
            this.resultados.backend.conexionGeneral = 'FALLIDA';
            this.resultados.recomendaciones.push('2. Verificar que el backend esté ejecutándose en puerto 7147');
            this.resultados.recomendaciones.push('3. Verificar configuración CORS del backend');
        } else if (conexionesExitosas < endpoints.length) {
            this.resultados.backend.conexionGeneral = 'PARCIAL';
            this.resultados.recomendaciones.push('4. Algunos endpoints del backend no responden correctamente');
        } else {
            this.resultados.backend.conexionGeneral = 'EXITOSA';
            console.log(' Backend funcionando correctamente');
        }
    }

    // 3. Verificar archivos JavaScript
    verificarArchivosJS() {
        console.log(' Verificando archivos JavaScript...');
        
        const clases = [
            'GameFlowController',
            'CardSelectionManager', 
            'TurnIndicator',
            'BattleComparator',
            'RankingFinalDisplay',
            'SalaBackend'
        ];
        
        const servicios = [
            'window.partidaService',
            'window.debugInfo'
        ];
        
        this.resultados.archivosJS = {
            clases: {},
            servicios: {},
            scriptsTotales: document.scripts.length,
            scriptsEncontrados: []
        };
        
        // Verificar clases principales
        clases.forEach(clase => {
            const disponible = typeof window[clase] !== 'undefined';
            this.resultados.archivosJS.clases[clase] = {
                disponible: disponible,
                tipo: typeof window[clase]
            };
            
            if (!disponible) {
                this.resultados.erroresEncontrados.push({
                    tipo: 'CLASE_NO_ENCONTRADA',
                    clase: clase,
                    mensaje: `La clase ${clase} no está disponible`
                });
            }
        });
        
        // Verificar servicios
        servicios.forEach(servicio => {
            const path = servicio.split('.');
            let obj = window;
            let disponible = true;
            
            for (const prop of path.slice(1)) {
                if (obj && typeof obj[prop] !== 'undefined') {
                    obj = obj[prop];
                } else {
                    disponible = false;
                    break;
                }
            }
            
            this.resultados.archivosJS.servicios[servicio] = {
                disponible: disponible,
                tipo: disponible ? typeof obj : 'undefined'
            };
        });
        
        // Listar scripts cargados
        Array.from(document.scripts).forEach(script => {
            if (script.src) {
                this.resultados.archivosJS.scriptsEncontrados.push({
                    src: script.src,
                    async: script.async,
                    defer: script.defer
                });
            }
        });
        
        // Recomendaciones
        const clasesRequeridas = clases.filter(clase => !this.resultados.archivosJS.clases[clase].disponible);
        if (clasesRequeridas.length > 0) {
            this.resultados.recomendaciones.push(`5. Cargar los archivos JS faltantes: ${clasesRequeridas.join(', ')}`);
        }
        
        console.log(' Archivos JS verificados:', this.resultados.archivosJS);
    }

    // 4. Verificar navegación
    verificarNavegacion() {
        console.log(' Verificando estado de navegación...');
        
        this.resultados.navegacion = {
            url: window.location.href,
            pathname: window.location.pathname,
            search: window.location.search,
            hash: window.location.hash,
            paginaActual: this.detectarPaginaActual(),
            historyLength: window.history.length,
            referrer: document.referrer,
            preventRedirects: window.preventRedirects || false
        };
        
        console.log(' Navegación verificada:', this.resultados.navegacion);
    }

    // 5. Verificar errores guardados
    verificarErroresGuardados() {
        console.log(' Verificando errores previamente guardados...');
        
        const erroresLS = localStorage.getItem('debugInfo_errores');
        const ultimoErrorLS = localStorage.getItem('debugInfo_ultimoError');
        
        this.resultados.erroresGuardados = {
            hayErrores: !!erroresLS,
            cantidadErrores: 0,
            ultimoError: null,
            erroresDetallados: []
        };
        
        if (erroresLS) {
            try {
                const errores = JSON.parse(erroresLS);
                this.resultados.erroresGuardados.cantidadErrores = errores.length;
                this.resultados.erroresGuardados.erroresDetallados = errores;
            } catch (e) {
                this.resultados.erroresEncontrados.push({
                    tipo: 'ERROR_PARSING_ERRORES',
                    mensaje: 'No se pudieron parsear los errores guardados'
                });
            }
        }
        
        if (ultimoErrorLS) {
            try {
                this.resultados.erroresGuardados.ultimoError = JSON.parse(ultimoErrorLS);
            } catch (e) {
                this.resultados.erroresEncontrados.push({
                    tipo: 'ERROR_PARSING_ULTIMO_ERROR',
                    mensaje: 'No se pudo parsear el último error guardado'
                });
            }
        }
        
        console.log(' Errores guardados verificados:', this.resultados.erroresGuardados);
    }

    // Detectar página actual
    detectarPaginaActual() {
        const pathname = window.location.pathname;
        if (pathname.includes('Partida.html')) return 'PARTIDA';
        if (pathname.includes('CrearSala.html')) return 'CREAR_SALA';
        if (pathname.includes('Lobby.html')) return 'LOBBY';
        if (pathname.includes('InicioDelJuego.html')) return 'INICIO_JUEGO';
        return 'OTRA';
    }

    // 6. Generar reporte final
    generarReporteFinal() {
        console.log(' Generando reporte final...');
        
        // Calcular estado general
        const tieneErroresCriticos = this.resultados.erroresEncontrados.some(e => 
            ['DATOS_PARTIDA_INCOMPLETOS', 'BACKEND_ERROR', 'CLASE_NO_ENCONTRADA'].includes(e.tipo)
        );
        
        this.resultados.estadoGeneral = tieneErroresCriticos ? 'CRITICO' : 'ESTABLE';
        
        // Guardar reporte en localStorage
        localStorage.setItem('diagnostico_completo', JSON.stringify(this.resultados, null, 2));
        
        // Mostrar reporte en consola
        console.log(' === REPORTE FINAL ===');
        console.log(' Estado General:', this.resultados.estadoGeneral);
        console.log(' Errores Encontrados:', this.resultados.erroresEncontrados.length);
        console.log(' Recomendaciones:', this.resultados.recomendaciones.length);
        
        if (this.resultados.erroresEncontrados.length > 0) {
            console.error(' ERRORES CRÍTICOS:');
            this.resultados.erroresEncontrados.forEach((error, index) => {
                console.error(`${index + 1}. ${error.tipo}: ${error.mensaje}`);
            });
        }
        
        if (this.resultados.recomendaciones.length > 0) {
            console.warn(' RECOMENDACIONES:');
            this.resultados.recomendaciones.forEach((rec, index) => {
                console.warn(`${index + 1}. ${rec}`);
            });
        }
        
        console.log(' Reporte guardado en localStorage como "diagnostico_completo"');
        console.log(' Para ver reporte completo: JSON.parse(localStorage.getItem("diagnostico_completo"))');
        
        return this.resultados;
    }

    // Método estático para ejecutar rápidamente
    static async ejecutar() {
        const diagnostico = new DiagnosticoCompleto();
        return await diagnostico.ejecutarDiagnostico();
    }
}

// Exportar para uso global
window.DiagnosticoCompleto = DiagnosticoCompleto;

// Método rápido para consola
window.diagnosticar = () => DiagnosticoCompleto.ejecutar();

console.log(' === SCRIPT DE DIAGNÓSTICO CARGADO ===');
console.log(' Para ejecutar: diagnosticar() o DiagnosticoCompleto.ejecutar()');
console.log(' Para ver último reporte: JSON.parse(localStorage.getItem("diagnostico_completo"))');
