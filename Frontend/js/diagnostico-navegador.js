// 🔍 DIAGNÓSTICO RÁPIDO PARA NAVEGADOR
// Copiar y pegar este código directamente en la consola del navegador

console.log('🔍 === DIAGNÓSTICO RÁPIDO NAVEGADOR ===');

// 1. Verificar archivos cargados
console.log('📜 1. Scripts cargados:');
Array.from(document.scripts).forEach((script, index) => {
    if (script.src) {
        const nombre = script.src.split('/').pop();
        console.log(`  ${index + 1}. ${nombre}`);
    }
});

// 2. Verificar clases principales
console.log('\n🎯 2. Clases principales:');
const clases = [
    'GameFlowController',
    'CardSelectionManager', 
    'TurnIndicator',
    'BattleComparator',
    'RankingFinalDisplay'
];

clases.forEach(clase => {
    const disponible = typeof window[clase] !== 'undefined';
    const estado = disponible ? '✅' : '❌';
    console.log(`  ${estado} ${clase}: ${typeof window[clase]}`);
    
    if (disponible) {
        try {
            const instancia = new window[clase]();
            console.log(`    ↳ Instanciable: ✅`);
        } catch (error) {
            console.log(`    ↳ Error al instanciar: ${error.message}`);
        }
    }
});

// 3. Verificar errores en consola
console.log('\n🚨 3. Errores en consola:');
const erroresConsola = window.debugInfo?.errores || [];
console.log(`  Total errores guardados: ${erroresConsola.length}`);

// 4. Verificar localStorage
console.log('\n💾 4. Datos en localStorage:');
const partidaId = localStorage.getItem('partidaId');
const jugadorId = localStorage.getItem('jugadorId');
console.log(`  partidaId: ${partidaId}`);
console.log(`  jugadorId: ${jugadorId}`);

// 5. Test rápido de backend
console.log('\n🌐 5. Test backend:');
fetch('http://localhost:7147/api/partida')
    .then(response => {
        console.log(`  Backend: ${response.ok ? '✅ Conectado' : '❌ Error'} (${response.status})`);
    })
    .catch(error => {
        console.log(`  Backend: ❌ Error - ${error.message}`);
    });

// 6. Verificar si GameFlowController se puede inicializar
console.log('\n🎮 6. Test inicialización GameFlowController:');
if (typeof GameFlowController !== 'undefined') {
    try {
        const gameFlow = new GameFlowController();
        console.log('  ✅ GameFlowController creado exitosamente');
        
        // Verificar métodos principales
        const metodos = ['init', 'determinarFaseActual', 'iniciarFaseSeleccionCartas'];
        metodos.forEach(metodo => {
            const existe = typeof gameFlow[metodo] === 'function';
            console.log(`    ${metodo}: ${existe ? '✅' : '❌'}`);
        });
        
    } catch (error) {
        console.log(`  ❌ Error al crear GameFlowController: ${error.message}`);
        console.log(`  Stack: ${error.stack}`);
    }
} else {
    console.log('  ❌ GameFlowController no disponible');
}

console.log('\n🔍 === FIN DIAGNÓSTICO ===');
console.log('💡 Si hay errores, revisar la consola del navegador para más detalles');
