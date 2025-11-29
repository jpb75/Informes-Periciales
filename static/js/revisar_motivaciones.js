/* ============================================================================
   REVISAR MOTIVACIONES - JAVASCRIPT
   ============================================================================ */

// Variables globales
let paquetesConfig = {
    'preceptivas': {
        titulo: 'Motivaciones Preceptivas',
        descripcion: 'Surgen del propio enunciado del problema',
        orden: 1
    },
    'tecnicas': {
        titulo: 'Motivaciones Técnicas',
        descripcion: 'Implícitas en el problema (leyes, normas)',
        orden: 2
    },
    'facultativas': {
        titulo: 'Motivaciones Facultativas',
        descripcion: 'Motivación profesional del autor',
        orden: 3
    },
    'progresistas': {
        titulo: 'Motivaciones Progresistas',
        descripcion: 'Aportación al conocimiento actual',
        orden: 4
    }
};

let paqueteActual = null;
let motivacionesData = null;

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
// PROCESAR CON AGENTE IA
// ============================================================================

async function procesarConAgente() {
    const editorContent = document.getElementById('editorContent');
    const packagesList = document.getElementById('packagesList');
    const generarBtn = document.getElementById('generarInformeBtn');
    
    // Mostrar estado de carga
    editorContent.innerHTML = `
        <div class="welcome-message">
            <div class="welcome-icon">🤖</div>
            <h3>Procesando con Inteligencia Artificial</h3>
            <p>El agente está analizando tu conjetura y generando las motivaciones...</p>
            <div class="loading-spinner"></div>
            <p style="margin-top: 1rem; font-size: 0.9rem; color: #718096;">
                <strong>Conjetura:</strong><br>
                "${conjetura}"
            </p>
        </div>
    `;
    
    packagesList.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: #718096;">
            <div class="loading-spinner" style="margin: 0 auto 1rem;"></div>
            <p>Generando paquetes...</p>
        </div>
    `;
    
    generarBtn.disabled = true;
    generarBtn.innerHTML = '<span class="btn-icon">⏳</span> Procesando...';
    
    try {
        const response = await fetch(`/procesar-con-agente/${informeId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Guardar los datos de motivaciones
            motivacionesData = result.analisis;
            
            // Renderizar la lista de paquetes
            renderizarPaquetes();
            
            // Mostrar mensaje de éxito
            editorContent.innerHTML = `
                <div class="welcome-message">
                    <div class="welcome-icon">✅</div>
                    <h3>¡Análisis completado!</h3>
                    <p>Las motivaciones han sido generadas exitosamente. Selecciona un paquete de la izquierda para revisar y editar.</p>
                </div>
            `;
            
            generarBtn.disabled = false;
            generarBtn.innerHTML = '<span class="btn-icon">📄</span> Generar Informe Final';
            
        } else {
            throw new Error(result.message || 'Error al procesar');
        }
        
    } catch (error) {
        console.error('Error al procesar con agente:', error);
        editorContent.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-icon">❌</div>
                <h3>Error al procesar</h3>
                <p>${error.message}</p>
                <button class="btn btn-primary" onclick="location.reload()">Reintentar</button>
            </div>
        `;
        
        packagesList.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #e53e3e;">
                <p>Error al generar paquetes</p>
            </div>
        `;
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
        
        const paqueteDiv = document.createElement('div');
        paqueteDiv.className = `package-item ${tieneMotivaciones ? '' : 'disabled'}`;
        paqueteDiv.dataset.paquete = paqueteKey;
        
        if (tieneMotivaciones) {
            paqueteDiv.onclick = () => seleccionarPaquete(paqueteKey);
        }
        
        paqueteDiv.innerHTML = `
            <div class="package-header">
                <span class="package-title">${config.titulo}</span>
                <span class="package-badge">${motivaciones.length} motivacion${motivaciones.length !== 1 ? 'es' : ''}</span>
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
