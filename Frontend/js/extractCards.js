// Script para extraer información de las cartas del HTML
const fs = require('fs');
const path = require('path');

// Leer el archivo HTML
const htmlPath = path.join(__dirname, '../html/ListadoCartas.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Función para extraer las cartas
function extractCards() {
    const cards = [];
    
    // Regex para encontrar cada carta
    const cardRegex = /<div class="carta"[^>]*>(.*?)<\/div>\s*<\/div>\s*<\/div>/gs;
    const matches = htmlContent.match(cardRegex);
    
    if (matches) {
        matches.forEach((cardHtml, index) => {
            // Extraer datos de cada carta
            const numeroMatch = cardHtml.match(/<div class="numero-carta">([^<]+)<\/div>/);
            const nombreMatch = cardHtml.match(/<div class="nombre-carta">([^<]+)<\/div>/);
            const imagenMatch = cardHtml.match(/src="([^"]+)"/);
            
            // Extraer estadísticas
            const estadisticas = {};
            const statRegex = /<span class="etiqueta-estadistica">([^<]+)<\/span>\s*<span class="valor-estadistica">([^<]+)<\/span>/g;
            let statMatch;
            while ((statMatch = statRegex.exec(cardHtml)) !== null) {
                estadisticas[statMatch[1]] = statMatch[2];
            }
            
            if (numeroMatch && nombreMatch) {
                cards.push({
                    "numero-carta": numeroMatch[1],
                    "nombre-carta": nombreMatch[1],
                    "imagen-personaje": imagenMatch ? imagenMatch[1] : "",
                    "etiqueta-estadistica": [estadisticas],
                    "texto-trasero": "TRADING CARDS"
                });
            }
        });
    }
    
    return cards;
}

// Extraer y mostrar las cartas
const extractedCards = extractCards();
console.log('=== LISTADO COMPLETO DE CARTAS FNAF ===\n');

extractedCards.forEach((card, index) => {
    console.log(`${index + 1}. Carta ${card["numero-carta"]} - ${card["nombre-carta"]}`);
    console.log(`   Imagen: ${card["imagen-personaje"]}`);
    console.log('   Estadísticas:');
    Object.entries(card["etiqueta-estadistica"][0]).forEach(([stat, value]) => {
        console.log(`     ${stat}: ${value}`);
    });
    console.log('');
});

// Guardar en archivo JSON actualizado
const outputPath = path.join(__dirname, '../json/CartasCompletas.json');
fs.writeFileSync(outputPath, JSON.stringify(extractedCards, null, 2));
console.log(` Archivo guardado en: ${outputPath}`);
