// ========================================
// JavaScript específico para el informe
// ========================================

// Función para exportar a Word (simulada)
function descargarWord() {
    alert('La funcionalidad de exportación a Word se implementará próximamente.\n\nPor ahora, puedes usar la opción de imprimir y seleccionar "Guardar como PDF".');
}

// Mejorar la impresión
window.addEventListener('beforeprint', function() {
    console.log('Preparando informe para impresión...');
});

window.addEventListener('afterprint', function() {
    console.log('Impresión completada o cancelada.');
});

// Confirmar antes de salir si hay cambios sin guardar (futuro)
let cambiosSinGuardar = false;

window.addEventListener('beforeunload', function(e) {
    if (cambiosSinGuardar) {
        e.preventDefault();
        e.returnValue = '';
        return '';
    }
});

// Añadir tooltips a los badges
document.addEventListener('DOMContentLoaded', function() {
    // Crear tooltips informativos
    const badges = {
        'badge-manual': 'Sección que debe ser completada por el perito',
        'badge-auto': 'Sección generada automáticamente por la aplicación',
        'badge-ia': 'Sección generada por Inteligencia Artificial'
    };
    
    // Añadir título a elementos con badges
    Object.keys(badges).forEach(badgeClass => {
        const elementos = document.querySelectorAll(`.${badgeClass}`);
        elementos.forEach(el => {
            if (!el.title) {
                el.title = badges[badgeClass];
            }
        });
    });
    
    // Resaltar secciones críticas
    const seccionesCriticas = document.querySelectorAll('.critical-review');
    seccionesCriticas.forEach(seccion => {
        seccion.style.cursor = 'help';
    });
});

// Función para resaltar secciones que requieren revisión
function resaltarSeccionesRevisar() {
    const seccionesRevisar = document.querySelectorAll('.critical-review');
    seccionesRevisar.forEach(seccion => {
        seccion.style.animation = 'pulse 2s ease-in-out infinite';
    });
}

// Añadir animación de pulso
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% { 
            box-shadow: 0 0 0 0 rgba(198, 40, 40, 0.4);
        }
        50% { 
            box-shadow: 0 0 0 10px rgba(198, 40, 40, 0);
        }
    }
`;
document.head.appendChild(style);

// Navegación rápida por secciones (con teclas)
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + números para navegar a secciones
    if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        const seccionNum = parseInt(e.key);
        const seccion = document.querySelector(`h2:contains("${seccionNum}.")`);
        if (seccion) {
            seccion.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
});

// Contador de páginas (aproximado)
function estimarNumeroPaginas() {
    const contenedor = document.querySelector('.informe-container');
    if (contenedor) {
        const alturaContenido = contenedor.scrollHeight;
        const alturaPagina = 1123; // Aproximado para A4 en píxeles
        const numeroPaginas = Math.ceil(alturaContenido / alturaPagina);
        console.log(`Número estimado de páginas: ${numeroPaginas}`);
        return numeroPaginas;
    }
    return 0;
}

// Log de información del informe
console.log('%c Informe Pericial Generado ', 'background: #1a237e; color: #fff; padding: 10px; font-size: 14px; font-weight: bold;');
console.log('%c Método Formal Causal ', 'background: #2e7d32; color: #fff; padding: 5px; font-size: 12px;');
console.log('Páginas estimadas:', estimarNumeroPaginas());

// Detectar si hay contenido generado por IA que necesita revisión
document.addEventListener('DOMContentLoaded', function() {
    const seccionesIA = document.querySelectorAll('.badge-ia');
    const seccionesCriticas = document.querySelectorAll('.critical-review');
    
    console.log(`Secciones generadas por IA: ${seccionesIA.length}`);
    console.log(`Secciones que requieren revisión crítica: ${seccionesCriticas.length}`);
    
    if (seccionesCriticas.length > 0) {
        console.warn('⚠️ Este informe contiene secciones que requieren revisión obligatoria por el perito.');
    }
});
