// ========================================
// JavaScript para Mapa Conceptual
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    initMapaConceptual();
    initAnimaciones();
});

// Inicializar el mapa conceptual
function initMapaConceptual() {
    console.log('%c Mapa Conceptual - Método Formal Causal ', 'background: #1a237e; color: #fff; padding: 10px; font-size: 14px; font-weight: bold;');
    
    // Añadir interactividad a las tarjetas
    const nodoCards = document.querySelectorAll('.nodo-card');
    nodoCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Si el clic es en el botón, no hacer nada (el botón ya tiene su handler)
            if (e.target.classList.contains('btn-expandir')) {
                return;
            }
            
            // Expandir/contraer al hacer clic en la tarjeta
            const contenido = this.querySelector('.nodo-contenido');
            const boton = this.querySelector('.btn-expandir');
            
            if (contenido && boton) {
                toggleNodoFromCard(contenido, boton);
            }
        });
        
        // Añadir efecto hover
        card.addEventListener('mouseenter', function() {
            this.style.cursor = 'pointer';
        });
    });
}

// Función para expandir/contraer nodos
function toggleNodo(boton) {
    const card = boton.closest('.nodo-card');
    const contenido = card.querySelector('.nodo-contenido');
    
    toggleNodoFromCard(contenido, boton);
}

function toggleNodoFromCard(contenido, boton) {
    if (contenido.classList.contains('expandido')) {
        contenido.classList.remove('expandido');
        boton.textContent = 'Ver más';
    } else {
        contenido.classList.add('expandido');
        boton.textContent = 'Ver menos';
        
        // Scroll suave hacia el contenido expandido
        setTimeout(() => {
            contenido.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest' 
            });
        }, 100);
    }
}

// Animaciones al hacer scroll
function initAnimaciones() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Observar secciones
    const secciones = document.querySelectorAll('.mapa-seccion');
    secciones.forEach(seccion => {
        seccion.style.opacity = '0';
        seccion.style.transform = 'translateY(30px)';
        seccion.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(seccion);
    });
}

// Función para expandir todos los nodos
function expandirTodos() {
    const nodoCards = document.querySelectorAll('.nodo-card');
    nodoCards.forEach(card => {
        const contenido = card.querySelector('.nodo-contenido');
        const boton = card.querySelector('.btn-expandir');
        
        if (contenido && !contenido.classList.contains('expandido')) {
            contenido.classList.add('expandido');
            if (boton) {
                boton.textContent = 'Ver menos';
            }
        }
    });
}

// Función para contraer todos los nodos
function contraerTodos() {
    const nodoCards = document.querySelectorAll('.nodo-card');
    nodoCards.forEach(card => {
        const contenido = card.querySelector('.nodo-contenido');
        const boton = card.querySelector('.btn-expandir');
        
        if (contenido && contenido.classList.contains('expandido')) {
            contenido.classList.remove('expandido');
            if (boton) {
                boton.textContent = 'Ver más';
            }
        }
    });
}

// Navegación por teclado
document.addEventListener('keydown', function(e) {
    // E para expandir todos
    if (e.key === 'e' || e.key === 'E') {
        expandirTodos();
    }
    
    // C para contraer todos
    if (e.key === 'c' || e.key === 'C') {
        contraerTodos();
    }
    
    // Navegación con flechas entre nodos
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        navegarNodos(e.key === 'ArrowDown' ? 1 : -1);
        e.preventDefault();
    }
});

// Función para navegar entre nodos con teclado
function navegarNodos(direccion) {
    const nodos = Array.from(document.querySelectorAll('.nodo-card, .nodo-grande'));
    const nodoActual = document.activeElement.closest('.nodo-card, .nodo-grande');
    
    if (nodoActual) {
        const indiceActual = nodos.indexOf(nodoActual);
        let nuevoIndice = indiceActual + direccion;
        
        if (nuevoIndice >= 0 && nuevoIndice < nodos.length) {
            nodos[nuevoIndice].scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
            nodos[nuevoIndice].focus();
        }
    } else if (nodos.length > 0) {
        nodos[0].scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
        nodos[0].focus();
    }
}

// Hacer los nodos enfocables
document.querySelectorAll('.nodo-card, .nodo-grande').forEach(nodo => {
    nodo.setAttribute('tabindex', '0');
});

// Efecto de resaltado al pasar el mouse sobre las relaciones
document.querySelectorAll('.relacion-item').forEach(item => {
    item.addEventListener('mouseenter', function() {
        this.style.transform = 'translateX(10px)';
        this.style.transition = 'transform 0.3s ease';
    });
    
    item.addEventListener('mouseleave', function() {
        this.style.transform = 'translateX(0)';
    });
});

// Crear líneas de conexión dinámicas (visual enhancement)
function crearConexionesVisuales() {
    const conjeturaCentral = document.querySelector('.nodo-central');
    const motivaciones = document.querySelectorAll('.nodo-card');
    
    if (!conjeturaCentral || motivaciones.length === 0) return;
    
    // Este es un placeholder para futuras mejoras visuales
    console.log('Conexiones visuales preparadas');
}

// Llamar a la función al cargar
setTimeout(crearConexionesVisuales, 1000);

// Tooltip informativo
function mostrarTooltip(elemento, texto) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip-custom';
    tooltip.textContent = texto;
    tooltip.style.cssText = `
        position: fixed;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 5px;
        font-size: 0.9rem;
        pointer-events: none;
        z-index: 10000;
        transition: opacity 0.3s ease;
    `;
    
    document.body.appendChild(tooltip);
    
    const actualizarPosicion = (e) => {
        tooltip.style.left = (e.clientX + 15) + 'px';
        tooltip.style.top = (e.clientY + 15) + 'px';
    };
    
    elemento.addEventListener('mousemove', actualizarPosicion);
    
    elemento.addEventListener('mouseleave', function() {
        tooltip.remove();
    });
}

// Añadir tooltips informativos
const tiposMotivaciones = {
    'preceptivas': 'Motivaciones que surgen directamente del enunciado del problema',
    'tecnicas': 'Motivaciones relacionadas con leyes, normas y regulaciones técnicas',
    'facultativas': 'Motivaciones profesionales del perito para abordar el caso',
    'progresistas': 'Motivaciones relacionadas con el avance del conocimiento'
};

document.querySelectorAll('.nodo-card').forEach(card => {
    const tipo = card.dataset.tipo;
    if (tipo && tiposMotivaciones[tipo]) {
        const titulo = card.querySelector('h3');
        if (titulo) {
            titulo.style.cursor = 'help';
            titulo.addEventListener('mouseenter', function(e) {
                mostrarTooltip(this, tiposMotivaciones[tipo]);
            });
        }
    }
});

// Estadísticas en tiempo real
function actualizarEstadisticas() {
    const nodosExpandidos = document.querySelectorAll('.nodo-contenido.expandido').length;
    console.log(`Nodos expandidos: ${nodosExpandidos}`);
}

// Log de ayuda de teclado
console.log('%c Atajos de teclado ', 'background: #2e7d32; color: #fff; padding: 5px; font-size: 12px;');
console.log('E - Expandir todos los nodos');
console.log('C - Contraer todos los nodos');
console.log('↑/↓ - Navegar entre nodos');
