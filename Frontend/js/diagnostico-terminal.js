#!/usr/bin/env node

// 🔍 SCRIPT DE DIAGNÓSTICO COMPLETO - Card Battles At Freddy's
// Ejecutar desde terminal para verificar el estado del sistema

const fs = require('fs');
const path = require('path');

class DiagnosticoTerminal {
    constructor() {
        this.resultados = {
            timestamp: new Date().toISOString(),
            archivos: {},
            backend: {},
            estructura: {},
            erroresEncontrados: [],
            recomendaciones: []
        };
        
        console.log('🔍 === INICIANDO DIAGNÓSTICO DESDE TERMINAL ===');
    }

    // Ejecutar diagnóstico completo
    async ejecutarDiagnostico() {
        try {
            console.log('📁 1. Verificando estructura de archivos...');
            this.verificarEstructuraArchivos();
            
            console.log('📜 2. Verificando archivos JavaScript...');
            this.verificarArchivosJS();
            
            console.log('🌐 3. Verificando backend...');
            await this.verificarBackend();
            
            console.log('📊 4. Generando reporte final...');
            this.generarReporteFinal();
            
            return this.resultados;
            
        } catch (error) {
            console.error('❌ Error en diagnóstico:', error);
            this.resultados.erroresEncontrados.push({
                tipo: 'ERROR_DIAGNOSTICO',
                mensaje: error.message,
                stack: error.stack
            });
        }
    }

    // 1. Verificar estructura de archivos
    verificarEstructuraArchivos() {
        console.log('🔍 Verificando estructura del proyecto...');
        
        const rutaBase = process.cwd();
        const archivosEsperados = [
            'Frontend/html/Partida.html',
            'Frontend/html/CrearSala.html',
            'Frontend/js/Partida/Partida.js',
            'Frontend/js/Partida/GameFlowController.js',
            'Frontend/js/Partida/CardSelectionManager.js',
            'Frontend/js/Partida/TurnIndicator.js',
            'Frontend/js/Partida/BattleComparator.js',
            'Frontend/js/Partida/RankingFinalDisplay.js',
            'Frontend/css/Partida/GameLogic.css',
            'Backend/Web/Program.cs',
            'Backend/juego.sln'
        ];
        
        this.resultados.estructura = {
            rutaBase: rutaBase,
            archivosEncontrados: {},
            archivosEsperados: archivosEsperados.length,
            archivosFaltantes: []
        };
        
        archivosEsperados.forEach(archivo => {
            const rutaCompleta = path.join(rutaBase, archivo);
            const existe = fs.existsSync(rutaCompleta);
            
            this.resultados.estructura.archivosEncontrados[archivo] = {
                existe: existe,
                ruta: rutaCompleta,
                tamano: existe ? this.obtenerTamanoArchivo(rutaCompleta) : null
            };
            
            if (!existe) {
                this.resultados.estructura.archivosFaltantes.push(archivo);
                this.resultados.erroresEncontrados.push({
                    tipo: 'ARCHIVO_FALTANTE',
                    archivo: archivo,
                    mensaje: `Archivo requerido no encontrado: ${archivo}`
                });
            } else {
                console.log(`✅ ${archivo} - ${this.obtenerTamanoArchivo(rutaCompleta)} bytes`);
            }
        });
        
        if (this.resultados.estructura.archivosFaltantes.length > 0) {
            this.resultados.recomendaciones.push('1. Verificar que todos los archivos del proyecto estén presentes');
        }
    }

    // 2. Verificar archivos JavaScript
    verificarArchivosJS() {
        console.log('🔍 Verificando contenido de archivos JavaScript...');
        
        const archivosJS = [
            'Frontend/js/Partida/GameFlowController.js',
            'Frontend/js/Partida/CardSelectionManager.js',
            'Frontend/js/Partida/TurnIndicator.js',
            'Frontend/js/Partida/BattleComparator.js',
            'Frontend/js/Partida/RankingFinalDisplay.js',
            'Frontend/js/Partida/Partida.js'
        ];
        
        this.resultados.archivos = {
            totalArchivos: archivosJS.length,
            archivosValidos: 0,
            detallesArchivos: {}
        };
        
        archivosJS.forEach(archivo => {
            const rutaCompleta = path.join(process.cwd(), archivo);
            
            if (fs.existsSync(rutaCompleta)) {
                try {
                    const contenido = fs.readFileSync(rutaCompleta, 'utf8');
                    const analisis = this.analizarArchivoJS(contenido, archivo);
                    
                    this.resultados.archivos.detallesArchivos[archivo] = analisis;
                    
                    if (analisis.valido) {
                        this.resultados.archivos.archivosValidos++;
                        console.log(`✅ ${archivo} - ${analisis.lineas} líneas, ${analisis.clases.length} clases`);
                    } else {
                        console.log(`⚠️ ${archivo} - Problemas detectados`);
                    }
                    
                } catch (error) {
                    this.resultados.erroresEncontrados.push({
                        tipo: 'ERROR_LECTURA_ARCHIVO',
                        archivo: archivo,
                        mensaje: `Error leyendo archivo: ${error.message}`
                    });
                }
            }
        });
        
        if (this.resultados.archivos.archivosValidos < this.resultados.archivos.totalArchivos) {
            this.resultados.recomendaciones.push('2. Revisar archivos JavaScript con problemas de sintaxis');
        }
    }

    // 3. Verificar backend con fetch (requiere que esté ejecutándose)
    async verificarBackend() {
        console.log('🔍 Verificando backend...');
        
        // Usar dynamic import para fetch en Node.js
        let fetch;
        try {
            const fetchModule = await import('node-fetch');
            fetch = fetchModule.default;
        } catch (error) {
            console.log('⚠️ node-fetch no disponible, saltando verificación de backend');
            this.resultados.backend = {
                verificado: false,
                razon: 'node-fetch no disponible'
            };
            return;
        }
        
        const endpoints = [
            'http://localhost:7147/api/partida',
            'http://localhost:7147/api/jugador',
            'http://localhost:7147/api/carta',
            'http://localhost:7147/api/ronda'
        ];
        
        this.resultados.backend = {
            baseUrl: 'http://localhost:7147',
            endpointsTesteados: {},
            conexionGeneral: 'DESCONOCIDA',
            verificado: true
        };
        
        let conexionesExitosas = 0;
        
        for (const endpoint of endpoints) {
            try {
                console.log(`🌐 Probando: ${endpoint}`);
                
                const response = await fetch(endpoint, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    timeout: 5000
                });
                
                const endpointName = endpoint.split('/').pop();
                this.resultados.backend.endpointsTesteados[endpointName] = {
                    status: response.status,
                    ok: response.ok,
                    statusText: response.statusText
                };
                
                if (response.ok) {
                    conexionesExitosas++;
                    console.log(`✅ ${endpointName}: OK (${response.status})`);
                } else {
                    console.log(`⚠️ ${endpointName}: ${response.status} ${response.statusText}`);
                }
                
            } catch (error) {
                const endpointName = endpoint.split('/').pop();
                this.resultados.backend.endpointsTesteados[endpointName] = {
                    error: error.message,
                    tipo: 'CONNECTION_ERROR'
                };
                
                console.log(`❌ ${endpointName}: ${error.message}`);
            }
        }
        
        // Evaluar conexión general
        if (conexionesExitosas === 0) {
            this.resultados.backend.conexionGeneral = 'FALLIDA';
            this.resultados.recomendaciones.push('3. Verificar que el backend esté ejecutándose en puerto 7147');
            this.resultados.recomendaciones.push('4. Ejecutar: cd Backend && dotnet run');
        } else if (conexionesExitosas < endpoints.length) {
            this.resultados.backend.conexionGeneral = 'PARCIAL';
            this.resultados.recomendaciones.push('5. Algunos endpoints del backend no responden correctamente');
        } else {
            this.resultados.backend.conexionGeneral = 'EXITOSA';
            console.log('✅ Backend funcionando correctamente');
        }
    }

    // Analizar archivo JavaScript
    analizarArchivoJS(contenido, nombreArchivo) {
        const lineas = contenido.split('\n').length;
        const clases = (contenido.match(/class\s+\w+/g) || []);
        const funciones = (contenido.match(/function\s+\w+/g) || []);
        const metodos = (contenido.match(/\w+\s*\([^)]*\)\s*\{/g) || []);
        
        // Verificaciones específicas según el archivo
        let valido = true;
        const problemas = [];
        
        if (nombreArchivo.includes('GameFlowController')) {
            if (!contenido.includes('class GameFlowController')) {
                valido = false;
                problemas.push('Clase GameFlowController no encontrada');
            }
            if (!contenido.includes('init(')) {
                valido = false;
                problemas.push('Método init() no encontrado');
            }
        }
        
        if (nombreArchivo.includes('Partida.js')) {
            if (!contenido.includes('class SalaBackend')) {
                valido = false;
                problemas.push('Clase SalaBackend no encontrada');
            }
            if (!contenido.includes('window.debugInfo')) {
                valido = false;
                problemas.push('Sistema de debugging no encontrado');
            }
        }
        
        return {
            lineas: lineas,
            clases: clases,
            funciones: funciones,
            metodos: metodos.length,
            valido: valido,
            problemas: problemas
        };
    }

    // Obtener tamaño de archivo
    obtenerTamanoArchivo(ruta) {
        try {
            const stats = fs.statSync(ruta);
            return stats.size;
        } catch (error) {
            return null;
        }
    }

    // 4. Generar reporte final
    generarReporteFinal() {
        console.log('🔍 Generando reporte final...');
        
        // Calcular estado general
        const tieneErroresCriticos = this.resultados.erroresEncontrados.some(e => 
            ['ARCHIVO_FALTANTE', 'ERROR_LECTURA_ARCHIVO'].includes(e.tipo)
        );
        
        this.resultados.estadoGeneral = tieneErroresCriticos ? 'CRITICO' : 'ESTABLE';
        
        // Guardar reporte en archivo
        const reporteArchivo = path.join(process.cwd(), 'diagnostico-terminal.json');
        fs.writeFileSync(reporteArchivo, JSON.stringify(this.resultados, null, 2));
        
        // Mostrar reporte en consola
        console.log('\n📊 === REPORTE FINAL ===');
        console.log('🎯 Estado General:', this.resultados.estadoGeneral);
        console.log('⚠️ Errores Encontrados:', this.resultados.erroresEncontrados.length);
        console.log('💡 Recomendaciones:', this.resultados.recomendaciones.length);
        console.log('📁 Archivos verificados:', Object.keys(this.resultados.estructura.archivosEncontrados).length);
        
        if (this.resultados.backend.verificado) {
            console.log('🌐 Backend:', this.resultados.backend.conexionGeneral);
        }
        
        if (this.resultados.erroresEncontrados.length > 0) {
            console.log('\n❌ ERRORES CRÍTICOS:');
            this.resultados.erroresEncontrados.forEach((error, index) => {
                console.log(`${index + 1}. ${error.tipo}: ${error.mensaje}`);
            });
        }
        
        if (this.resultados.recomendaciones.length > 0) {
            console.log('\n💡 RECOMENDACIONES:');
            this.resultados.recomendaciones.forEach((rec, index) => {
                console.log(`${index + 1}. ${rec}`);
            });
        }
        
        console.log(`\n💾 Reporte guardado en: ${reporteArchivo}`);
        console.log('📋 Para ver reporte completo: cat diagnostico-terminal.json | jq');
        
        return this.resultados;
    }

    // Método estático para ejecutar rápidamente
    static async ejecutar() {
        const diagnostico = new DiagnosticoTerminal();
        return await diagnostico.ejecutarDiagnostico();
    }
}

// Si se ejecuta directamente desde terminal
if (require.main === module) {
    DiagnosticoTerminal.ejecutar()
        .then(resultado => {
            console.log('\n🎯 Diagnóstico completado exitosamente');
            process.exit(resultado.estadoGeneral === 'CRITICO' ? 1 : 0);
        })
        .catch(error => {
            console.error('❌ Error ejecutando diagnóstico:', error);
            process.exit(1);
        });
}

module.exports = DiagnosticoTerminal;
