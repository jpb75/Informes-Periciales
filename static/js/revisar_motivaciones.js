/* ============================================================================
   REVISAR MOTIVACIONES - JAVASCRIPT
   ============================================================================ */

// Variables globales
let paquetesConfig = {
    'preceptivas': {
        titulo: 'Motivaciones Preceptivas',
        descripcion: 'Surgen del propio enunciado del problema',
        orden: 1,
        key: 'preceptivas'
    },
    'tecnicas': {
        titulo: 'Motivaciones Técnicas',
        descripcion: 'Implícitas en el problema (leyes, normas)',
        orden: 2,
        key: 'tecnicas'
    },
    'facultativas': {
        titulo: 'Motivaciones Facultativas',
        descripcion: 'Motivación profesional del autor',
        orden: 3,
        key: 'facultativas'
    },
    'progresistas': {
        titulo: 'Motivaciones Progresistas',
        descripcion: 'Aportación al conocimiento actual',
        orden: 4,
        key: 'progresistas'
    }
};

let paqueteActual = null;
let motivacionesData = null;
let paquetesProcesando = new Set();
let paquetesCompletados = new Set();

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

document.addEventListener('DOMContentLoaded', async function() {
    console.log('Inicializando revisor de motivaciones...');
    console.log('Informe ID:', informeId);
    console.log('Conjetura:', conjetura);
    console.log('Análisis Data:', analisisData);
    
    // Si no hay análisis, procesarlo con el agente
    if (!analisisData || !analisisData.por_que) {
        await procesarConAgente();
    } else {
        // Guardar los datos de motivaciones
        motivacionesData = JSON.parse(JSON.stringify(analisisData)); // Copia profunda
        
        // Renderizar la lista de paquetes
        renderizarPaquetes();
    }
});

// ============================================================================
// SISTEMA DE NOTIFICACIONES
// ============================================================================

function mostrarNotificacion(mensaje, tipo = 'info') {
    const container = document.getElementById('notificacionesContainer') || crearContenedorNotificaciones();
    
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion notificacion-${tipo}`;
    
    const iconos = {
        'info': 'ℹ️',
        'success': '✅',
        'error': '❌',
        'warning': '⚠️',
        'processing': '🤖'
    };
    
    notificacion.innerHTML = `
        <span class="notificacion-icono">${iconos[tipo] || iconos.info}</span>
        <span class="notificacion-mensaje">${mensaje}</span>
    `;
    
    container.appendChild(notificacion);
    
    // Animar entrada
    setTimeout(() => notificacion.classList.add('notificacion-visible'), 10);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        notificacion.classList.remove('notificacion-visible');
        setTimeout(() => notificacion.remove(), 300);
    }, 5000);
}

function crearContenedorNotificaciones() {
    const container = document.createElement('div');
    container.id = 'notificacionesContainer';
    container.className = 'notificaciones-container';
    document.body.appendChild(container);
    return container;
}

// ============================================================================
// PROCESAR CON AGENTE IA (ASÍNCRONO)
// ============================================================================

async function procesarConAgente() {
    const editorContent = document.getElementById('editorContent');
    const generarBtn = document.getElementById('generarInformeBtn');
    
    // Inicializar estructura de datos
    motivacionesData = {
        por_que: {
            preceptivas: [],
            tecnicas: [],
            facultativas: [],
            progresistas: []
        },
        para_que: [],
        que_es: {}
    };
    
    // Mostrar estado de carga inicial
    editorContent.innerHTML = `
        <div class="welcome-message">
            <div class="welcome-icon">🤖</div>
            <h3>Procesando con Inteligencia Artificial</h3>
            <p>Los paquetes aparecerán automáticamente conforme se generen. Puedes empezar a revisar mientras el sistema sigue procesando.</p>
            <div class="loading-spinner"></div>
            <p style="margin-top: 1rem; font-size: 0.9rem; color: #718096;">
                <strong>Conjetura:</strong><br>
                "${conjetura}"
            </p>
        </div>
    `;
    
    generarBtn.disabled = true;
    generarBtn.innerHTML = '<span class="btn-icon">⏳</span> Procesando...';
    
    // Renderizar paquetes vacíos inicialmente
    renderizarPaquetes();
    
    mostrarNotificacion('🚀 Iniciando análisis del Método Formal Causal', 'processing');
    
    try {
        // Iniciar procesamiento
        const response = await fetch(`/procesar-con-agente/${informeId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.message || 'Error al iniciar procesamiento');
        }
        
        // Procesar paquetes en secuencia (aparecen conforme se generan)
        const paquetes = ['preceptivas', 'tecnicas', 'facultativas', 'progresistas'];
        
        for (const paquete of paquetes) {
            await procesarPaquete(paquete);
        }
        
        // Mostrar mensaje de éxito
        mostrarNotificacion('✅ Análisis completado con éxito', 'success');
        
        editorContent.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-icon">✅</div>
                <h3>¡Análisis completado!</h3>
                <p>Todas las motivaciones han sido generadas exitosamente. Revisa cada paquete y edita lo que necesites antes de generar el informe final.</p>
            </div>
        `;
        
        generarBtn.disabled = false;
        generarBtn.innerHTML = '<span class="btn-icon">📄</span> Generar Informe Final';
        
    } catch (error) {
        console.error('Error al procesar con agente:', error);
        mostrarNotificacion(`Error: ${error.message}`, 'error');
        
        editorContent.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-icon">❌</div>
                <h3>Error al procesar</h3>
                <p>${error.message}</p>
                <button class="btn btn-primary" onclick="location.reload()">Reintentar</button>
            </div>
        `;
    }
}

async function procesarPaquete(paqueteKey) {
    const config = paquetesConfig[paqueteKey];
    
    mostrarNotificacion(`🔍 Analizando ${config.titulo.toLowerCase()}...`, 'processing');
    paquetesProcesando.add(paqueteKey);
    
    try {
        const response = await fetch(`/obtener-paquete/${informeId}/${paqueteKey}`);
        const result = await response.json();
        
        if (result.success) {
            // Actualizar datos
            motivacionesData.por_que[paqueteKey] = result.motivaciones;
            paquetesCompletados.add(paqueteKey);
            paquetesProcesando.delete(paqueteKey);
            
            // Actualizar UI
            renderizarPaquetes();
            
            const numMotivaciones = result.motivaciones.length;
            mostrarNotificacion(
                `✅ ${config.titulo}: ${numMotivaciones} motivación${numMotivaciones !== 1 ? 'es' : ''} generada${numMotivaciones !== 1 ? 's' : ''}`,
                'success'
            );
            
        } else {
            throw new Error(result.message || 'Error al procesar paquete');
        }
        
    } catch (error) {
        paquetesProcesando.delete(paqueteKey);
        mostrarNotificacion(`❌ Error en ${config.titulo.toLowerCase()}`, 'error');
        throw error;
    }
}

// ============================================================================
// RENDERIZADO DE PAQUETES
// ============================================================================

function renderizarPaquetes() {
    const packagesList = document.getElementById('packagesList');
    packagesList.innerHTML = '';
    
    // Ordenar paquetes según el orden definido
    const paquetesOrdenados = Object.keys(paquetesConfig).sort((a, b) => {
        return paquetesConfig[a].orden - paquetesConfig[b].orden;
    });
    
    paquetesOrdenados.forEach(paqueteKey => {
        const config = paquetesConfig[paqueteKey];
        const motivaciones = motivacionesData.por_que[paqueteKey] || [];
        const tieneMotivaciones = motivaciones.length > 0;
        const estaProcesando = paquetesProcesando.has(paqueteKey);
        
        const paqueteDiv = document.createElement('div');
        paqueteDiv.className = `package-item ${tieneMotivaciones ? '' : 'disabled'} ${estaProcesando ? 'processing' : ''}`;
        paqueteDiv.dataset.paquete = paqueteKey;
        
        if (tieneMotivaciones) {
            paqueteDiv.onclick = () => seleccionarPaquete(paqueteKey);
        }
        
        let badgeContent;
        if (estaProcesando) {
            badgeContent = '<span class="spinner-small"></span> Procesando...';
        } else if (tieneMotivaciones) {
            badgeContent = `${motivaciones.length} motivación${motivaciones.length !== 1 ? 'es' : ''}`;
        } else {
            badgeContent = 'Pendiente';
        }
        
        paqueteDiv.innerHTML = `
            <div class="package-header">
                <span class="package-title">${config.titulo}</span>
                <span class="package-badge">${badgeContent}</span>
            </div>
            <div class="package-description">${config.descripcion}</div>
        `;
        
        packagesList.appendChild(paqueteDiv);
    });
}

// ============================================================================
// SELECCIÓN DE PAQUETE
// ============================================================================

function seleccionarPaquete(paqueteKey) {
    console.log('Seleccionando paquete:', paqueteKey);
    
    // Actualizar estado activo en la lista
    document.querySelectorAll('.package-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const paqueteItem = document.querySelector(`.package-item[data-paquete="${paqueteKey}"]`);
    if (paqueteItem) {
        paqueteItem.classList.add('active');
    }
    
    // Actualizar paquete actual
    paqueteActual = paqueteKey;
    
    // Renderizar el editor
    renderizarEditor(paqueteKey);
}

// ============================================================================
// RENDERIZADO DEL EDITOR
// ============================================================================

function renderizarEditor(paqueteKey) {
    const editorContent = document.getElementById('editorContent');
    const config = paquetesConfig[paqueteKey];
    const motivaciones = motivacionesData.por_que[paqueteKey] || [];
    
    if (motivaciones.length === 0) {
        editorContent.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-icon">⚠️</div>
                <h3>Sin motivaciones</h3>
                <p>Este paquete aún no tiene motivaciones generadas.</p>
            </div>
        `;
        return;
    }
    
    // Crear el header del editor
    let html = `
        <div class="package-editor-header">
            <h2>${config.titulo}</h2>
            <p>${config.descripcion}</p>
        </div>
        <div class="motivaciones-grid">
    `;
    
    // Crear tarjetas para cada motivación
    motivaciones.forEach((motivacion, index) => {
        html += crearTarjetaMotivacion(paqueteKey, index, motivacion);
    });
    
    html += '</div>';
    
    editorContent.innerHTML = html;
}

// ============================================================================
// CREACIÓN DE TARJETA DE MOTIVACIÓN
// ============================================================================

function crearTarjetaMotivacion(paqueteKey, index, motivacion) {
    return `
        <div class="motivacion-card" data-paquete="${paqueteKey}" data-indice="${index}">
            <div class="motivacion-header">
                <h4 class="motivacion-titulo-label">Título:</h4>
                <input 
                    type="text" 
                    class="motivacion-titulo-input" 
                    value="${escapeHtml(motivacion.titulo || '')}"
                    placeholder="Título de la motivación"
                    data-field="titulo"
                >
            </div>
            <div class="motivacion-body">
                <h4 class="motivacion-contenido-label">Contenido:</h4>
                <textarea 
                    class="motivacion-contenido-input" 
                    rows="5" 
                    placeholder="Contenido de la motivación"
                    data-field="contenido"
                >${escapeHtml(motivacion.contenido || '')}</textarea>
            </div>
            <div class="motivacion-actions">
                <button class="btn btn-small btn-primary guardar-btn" onclick="guardarMotivacion(this)">
                    Guardar cambios
                </button>
                <span class="save-status"></span>
            </div>
        </div>
    `;
}

// ============================================================================
// GUARDAR MOTIVACIÓN
// ============================================================================

async function guardarMotivacion(boton) {
    const card = boton.closest('.motivacion-card');
    const paqueteKey = card.dataset.paquete;
    const indice = parseInt(card.dataset.indice);
    
    const tituloInput = card.querySelector('[data-field="titulo"]');
    const contenidoInput = card.querySelector('[data-field="contenido"]');
    const statusSpan = card.querySelector('.save-status');
    
    const nuevoTitulo = tituloInput.value.trim();
    const nuevoContenido = contenidoInput.value.trim();
    
    // Validar
    if (!nuevoTitulo || !nuevoContenido) {
        mostrarEstado(statusSpan, 'error', 'El título y contenido son obligatorios');
        return;
    }
    
    // Deshabilitar botón mientras se guarda
    boton.disabled = true;
    boton.textContent = 'Guardando...';
    
    try {
        // Actualizar datos locales
        motivacionesData.por_que[paqueteKey][indice] = {
            titulo: nuevoTitulo,
            contenido: nuevoContenido
        };
        
        // Enviar al servidor
        const response = await fetch('/guardar-motivacion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                informe_id: informeId,
                paquete: paqueteKey,
                indice: indice,
                motivacion: {
                    titulo: nuevoTitulo,
                    contenido: nuevoContenido
                }
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            mostrarEstado(statusSpan, 'success', '✓ Guardado');
            console.log('Motivación guardada correctamente');
        } else {
            throw new Error(result.message || 'Error al guardar');
        }
        
    } catch (error) {
        console.error('Error al guardar motivación:', error);
        mostrarEstado(statusSpan, 'error', '✗ Error al guardar');
    } finally {
        // Restaurar botón
        boton.disabled = false;
        boton.textContent = 'Guardar cambios';
    }
}

// ============================================================================
// GENERAR INFORME FINAL
// ============================================================================

async function generarInforme() {
    const boton = document.getElementById('generarInformeBtn');
    
    // Confirmar
    if (!confirm('¿Deseas generar el informe final? Asegúrate de haber revisado todas las motivaciones.')) {
        return;
    }
    
    // Deshabilitar botón
    boton.disabled = true;
    boton.innerHTML = '<span class="btn-icon">⏳</span> Generando...';
    
    try {
        const response = await fetch('/generar-informe-final', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                informe_id: informeId
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Redirigir al informe
            window.location.href = `/informe/${informeId}`;
        } else {
            throw new Error(result.message || 'Error al generar informe');
        }
        
    } catch (error) {
        console.error('Error al generar informe:', error);
        alert('Error al generar el informe. Por favor, inténtalo de nuevo.');
        
        // Restaurar botón
        boton.disabled = false;
        boton.innerHTML = '<span class="btn-icon">📄</span> Generar Informe Final';
    }
}

// ============================================================================
// UTILIDADES
// ============================================================================

function mostrarEstado(elemento, tipo, mensaje) {
    elemento.className = `save-status ${tipo}`;
    elemento.textContent = mensaje;
    
    // Limpiar después de 3 segundos
    setTimeout(() => {
        elemento.className = 'save-status';
        elemento.textContent = '';
    }, 3000);
}

function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ============================================================================
// PREVENIR PÉRDIDA DE DATOS
// ============================================================================

window.addEventListener('beforeunload', function(e) {
    // Verificar si hay cambios sin guardar
    const inputs = document.querySelectorAll('.motivacion-titulo-input, .motivacion-contenido-input');
    let hayCambios = false;
    
    inputs.forEach(input => {
        const card = input.closest('.motivacion-card');
        if (card) {
            const paqueteKey = card.dataset.paquete;
            const indice = parseInt(card.dataset.indice);
            const field = input.dataset.field;
            
            const valorOriginal = motivacionesData.por_que[paqueteKey][indice][field];
            const valorActual = input.value.trim();
            
            if (valorOriginal !== valorActual) {
                hayCambios = true;
            }
        }
    });
    
    if (hayCambios) {
        e.preventDefault();
        e.returnValue = '';
    }
});
