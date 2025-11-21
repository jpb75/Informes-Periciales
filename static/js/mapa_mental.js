// ========================================
// MAPA CONCEPTUAL INTERACTIVO - JAVASCRIPT
// ========================================

let zoom = 1;
let panX = 0;
let panY = 0;
let isPanning = false;
let startX, startY;

const canvas = document.getElementById('mapaCanvas');
const nodosContenedor = document.getElementById('nodosContenedor');
const svg = document.getElementById('conexiones');

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    console.log('%c Mapa Conceptual Interactivo ', 'background: #667eea; color: #fff; padding: 10px; font-size: 14px; font-weight: bold;');
    
    inicializarMapa();
    dibujarConexiones();
    configurarEventos();
    
    // Animación inicial
    setTimeout(() => {
        document.querySelectorAll('.nodo').forEach((nodo, index) => {
            setTimeout(() => {
                nodo.style.opacity = '1';
            }, index * 100);
        });
    }, 100);
});

// Inicializar mapa
function inicializarMapa() {
    // Ajustar SVG al tamaño del canvas
    svg.setAttribute('width', canvas.offsetWidth);
    svg.setAttribute('height', canvas.offsetHeight);
    
    // Centrar vista inicial
    resetView();
}

// Dibujar conexiones entre nodos
function dibujarConexiones() {
    const raiz = document.getElementById('nodo-raiz');
    if (!raiz) return;
    
    const raizRect = raiz.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    
    const raizX = raizRect.left + raizRect.width / 2 - canvasRect.left;
    const raizY = raizRect.top + raizRect.height / 2 - canvasRect.top;
    
    // Limpiar conexiones existentes
    while (svg.firstChild && svg.firstChild.tagName !== 'defs') {
        svg.removeChild(svg.lastChild);
    }
    
    // Conectar raíz con motivaciones
    const motivaciones = ['preceptivas', 'tecnicas', 'facultativas', 'progresistas'];
    motivaciones.forEach((tipo, index) => {
        const nodo = document.getElementById(`nodo-${tipo}`);
        if (nodo) {
            const nodoRect = nodo.getBoundingClientRect();
            const nodoX = nodoRect.left + nodoRect.width / 2 - canvasRect.left;
            const nodoY = nodoRect.top + nodoRect.height / 2 - canvasRect.top;
            
            crearLinea(raizX, raizY, nodoX, nodoY, `grad${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`);
        }
    });
    
    // Conectar motivaciones con objetivos
    const objetivos = document.querySelectorAll('.nodo-objetivo');
    objetivos.forEach(objetivo => {
        const tipo = objetivo.dataset.tipo;
        const motivacion = document.getElementById(`nodo-${tipo}`);
        
        if (motivacion) {
            const motivacionRect = motivacion.getBoundingClientRect();
            const objetivoRect = objetivo.getBoundingClientRect();
            
            const motivacionX = motivacionRect.left + motivacionRect.width / 2 - canvasRect.left;
            const motivacionY = motivacionRect.top + motivacionRect.height / 2 - canvasRect.top;
            const objetivoX = objetivoRect.left + objetivoRect.width / 2 - canvasRect.left;
            const objetivoY = objetivoRect.top + objetivoRect.height / 2 - canvasRect.top;
            
            crearLinea(motivacionX, motivacionY, objetivoX, objetivoY, `grad${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`);
        }
    });
    
    // NO conectar objetivos con definición (el "qué es" está separado)
}

// Crear línea curva entre dos puntos
// Crear línea curva entre dos puntos con flecha
function crearLinea(x1, y1, x2, y2, gradient) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    
    // Control points para curva Bezier
    const dx = x2 - x1;
    const dy = y2 - y1;
    const controlX = x1 + dx * 0.5;
    const controlY = y1 + dy * 0.3;
    
    const d = `M ${x1} ${y1} Q ${controlX} ${controlY}, ${x2} ${y2}`;
    
    path.setAttribute('d', d);
    path.setAttribute('class', 'linea-conexion');
    path.setAttribute('stroke', `url(#${gradient})`);
    path.setAttribute('stroke-width', '3');
    path.setAttribute('fill', 'none');
    path.setAttribute('opacity', '0.7');
    path.setAttribute('marker-end', 'url(#arrowhead)');
    path.setAttribute('stroke-dasharray', '1000');
    path.setAttribute('stroke-dashoffset', '1000');
    
    svg.appendChild(path);
    
    // Animar línea
    setTimeout(() => {
        path.style.animation = 'lineGrow 1s ease-out forwards';
    }, 50);
}

// Crear línea discontinua
function crearLineaDashed(x1, y1, x2, y2, color, opacity) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', color);
    line.setAttribute('stroke-width', '2');
    line.setAttribute('stroke-dasharray', '5,5');
    line.setAttribute('opacity', opacity);
    svg.appendChild(line);
}

// Configurar eventos
function configurarEventos() {
    // Pan con mouse
    canvas.addEventListener('mousedown', iniciarPan);
    canvas.addEventListener('mousemove', moverPan);
    canvas.addEventListener('mouseup', finalizarPan);
    canvas.addEventListener('mouseleave', finalizarPan);
    
    // Zoom con rueda del mouse
    canvas.addEventListener('wheel', manejarZoom);
    
    // Redimensionar
    window.addEventListener('resize', () => {
        dibujarConexiones();
    });
    
    // Atajos de teclado
    document.addEventListener('keydown', manejarTeclado);
}

// Pan
function iniciarPan(e) {
    if (e.target.closest('.nodo')) return; // No pan si clickeamos un nodo
    isPanning = true;
    startX = e.clientX - panX;
    startY = e.clientY - panY;
    canvas.style.cursor = 'grabbing';
}

function moverPan(e) {
    if (!isPanning) return;
    panX = e.clientX - startX;
    panY = e.clientY - startY;
    actualizarTransform();
}

function finalizarPan() {
    isPanning = false;
    canvas.style.cursor = 'grab';
}

// Zoom
function manejarZoom(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    zoom = Math.max(0.3, Math.min(3, zoom + delta));
    actualizarTransform();
}

function zoomIn() {
    zoom = Math.min(3, zoom + 0.2);
    actualizarTransform();
}

function zoomOut() {
    zoom = Math.max(0.3, zoom - 0.2);
    actualizarTransform();
}

function resetView() {
    zoom = 1;
    panX = 0;
    panY = 0;
    actualizarTransform();
}

function actualizarTransform() {
    nodosContenedor.style.transform = `translate(calc(-50% + ${panX}px), calc(-50% + ${panY}px)) scale(${zoom})`;
    
    // Redibujar conexiones después del zoom/pan
    requestAnimationFrame(() => {
        dibujarConexiones();
    });
}

// Toggle nodo
function toggleNodo(nodo) {
    const expandido = nodo.classList.toggle('expandido');
    
    // Animación
    if (expandido) {
        nodo.style.animation = 'none';
        setTimeout(() => {
            nodo.style.animation = '';
        }, 10);
    }
    
    // Redibujar conexiones
    setTimeout(() => {
        dibujarConexiones();
    }, 400);
}

// Expandir/Contraer todos
function expandirTodos() {
    document.querySelectorAll('.nodo').forEach(nodo => {
        if (!nodo.classList.contains('expandido') && !nodo.classList.contains('nodo-raiz')) {
            nodo.classList.add('expandido');
        }
    });
    setTimeout(() => {
        dibujarConexiones();
    }, 400);
}

function contraerTodos() {
    document.querySelectorAll('.nodo.expandido').forEach(nodo => {
        if (!nodo.classList.contains('nodo-raiz')) {
            nodo.classList.remove('expandido');
        }
    });
    setTimeout(() => {
        dibujarConexiones();
    }, 400);
}

// Ayuda
function toggleAyuda() {
    const panel = document.getElementById('ayudaPanel');
    panel.classList.toggle('active');
}

// Teclado
function manejarTeclado(e) {
    switch(e.key.toLowerCase()) {
        case 'e':
            expandirTodos();
            break;
        case 'c':
            contraerTodos();
            break;
        case 'r':
            resetView();
            break;
        case '+':
        case '=':
            zoomIn();
            break;
        case '-':
        case '_':
            zoomOut();
            break;
        case '?':
            toggleAyuda();
            break;
    }
}

// Animación de entrada
document.querySelectorAll('.nodo').forEach((nodo, index) => {
    nodo.style.opacity = '0';
    nodo.style.transform = 'scale(0.3)';
});

// Log de información
console.log('%c Controles del Mapa ', 'background: #764ba2; color: #fff; padding: 5px; font-size: 12px;');
console.log('• Click en nodo: Expandir/contraer');
console.log('• Arrastrar: Mover vista');
console.log('• Rueda ratón: Zoom');
console.log('• +/- : Acercar/alejar');
console.log('• R: Restablecer vista');
console.log('• E: Expandir todo');
console.log('• C: Contraer todo');
console.log('• ?: Ayuda');
