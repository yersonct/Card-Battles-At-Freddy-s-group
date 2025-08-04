-- Script para insertar cartas de ejemplo después de la migración
-- Ejecutar después de aplicar las migraciones

-- Limpiar cartas existentes (opcional)
-- DELETE FROM `cartas` WHERE `Active` = 1;

-- Insertar cartas de ejemplo si no existen
INSERT IGNORE INTO `cartas` (`Imagen`, `Nombre`, `Rareza`, `Categoria`, `Vida`, `Defensa`, `Velocidad`, `Ataque`, `Poder`, `Terror`, `Active`) VALUES
(0x, 'Freddy Fazbear', 'Común', 'FREDDY_001', 85, 70, 45, 75, 80, 90, 1),
(0x, 'Bonnie', 'Común', 'BONNIE_001', 80, 65, 70, 80, 75, 85, 1),
(0x, 'Chica', 'Común', 'CHICA_001', 75, 60, 55, 70, 70, 80, 1),
(0x, 'Foxy', 'Rara', 'FOXY_001', 70, 50, 95, 90, 85, 95, 1),
(0x, 'Golden Freddy', 'Legendaria', 'GOLDEN_001', 100, 90, 30, 95, 100, 100, 1),
(0x, 'Springtrap', 'Épica', 'SPRING_001', 90, 85, 60, 85, 90, 98, 1),
(0x, 'Nightmare Freddy', 'Épica', 'NIGHTMARE_001', 95, 80, 40, 88, 92, 99, 1),
(0x, 'Puppet', 'Rara', 'PUPPET_001', 65, 45, 80, 75, 95, 92, 1),
(0x, 'Balloon Boy', 'Común', 'BB_001', 60, 40, 85, 55, 60, 70, 1),
(0x, 'Mangle', 'Rara', 'MANGLE_001', 70, 55, 90, 82, 78, 88, 1),
(0x, 'Withered Bonnie', 'Rara', 'WBONNIE_001', 75, 60, 65, 85, 80, 90, 1),
(0x, 'Withered Chica', 'Rara', 'WCHICA_001', 78, 65, 50, 75, 75, 85, 1),
(0x, 'Toy Freddy', 'Común', 'TFREDDY_001', 82, 68, 48, 72, 70, 75, 1),
(0x, 'Toy Bonnie', 'Común', 'TBONNIE_001', 77, 62, 68, 78, 72, 78, 1),
(0x, 'Toy Chica', 'Común', 'TCHICA_001', 73, 58, 52, 68, 68, 72, 1),
(0x, 'Funtime Freddy', 'Épica', 'FFREDDY_001', 88, 75, 55, 82, 87, 90, 1),
(0x, 'Funtime Foxy', 'Épica', 'FFOXY_001', 80, 65, 88, 90, 85, 92, 1),
(0x, 'Circus Baby', 'Legendaria', 'CBABY_001', 92, 80, 65, 88, 95, 96, 1),
(0x, 'Ennard', 'Legendaria', 'ENNARD_001', 85, 70, 75, 92, 98, 97, 1),
(0x, 'Molten Freddy', 'Épica', 'MFREDDY_001', 90, 78, 70, 85, 90, 94, 1);

-- Verificar que las cartas se insertaron correctamente
SELECT COUNT(*) as 'Total_Cartas_Insertadas' FROM `cartas` WHERE `Active` = 1;
