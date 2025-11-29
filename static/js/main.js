// ========================================
// Configuración inicial
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    initScrollAnimations();
    initFormHandling();
    initCharCounter();
    initParallaxEffect();
});

// ========================================
// Animaciones de Scroll
// ========================================
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Aplicar delay si existe
                const delay = entry.target.dataset.delay || 0;
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, delay);
            }
        });
    }, observerOptions);

    // Observar todos los elementos con animación de zoom
    const zoomElements = document.querySelectorAll('.zoom-on-scroll');
    zoomElements.forEach(el => observer.observe(el));

    // Observar cards del método
    const methodCards = document.querySelectorAll('.method-card');
    methodCards.forEach(card => observer.observe(card));
}

// ========================================
// Efecto Parallax
// ========================================
function initParallaxEffect() {
    const hero = document.querySelector('.hero');
    
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const parallaxSpeed = 0.5;
        
        if (hero && scrolled < window.innerHeight) {
            hero.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
            
            // Fade out del hero content al hacer scroll
            const heroContent = document.querySelector('.hero-content');
            const opacity = 1 - (scrolled / window.innerHeight);
            if (heroContent) {
                heroContent.style.opacity = Math.max(0, opacity);
            }
        }
    });
}

// ========================================
// Contador de caracteres
// ========================================
function initCharCounter() {
    const textarea = document.getElementById('conjetura');
    const charCount = document.getElementById('charCount');
    
    if (textarea && charCount) {
        textarea.addEventListener('input', function() {
            const count = this.value.length;
            charCount.textContent = count;
            
            // Cambiar color según la longitud
            if (count < 10) {
                charCount.style.color = '#c62828';
            } else if (count < 50) {
                charCount.style.color = '#f57c00';
            } else {
                charCount.style.color = '#2e7d32';
            }
        });
    }
}

// ========================================
// Manejo del formulario
// ========================================
function initFormHandling() {
    const form = document.getElementById('conjeturaForm');
    const submitBtn = document.getElementById('submitBtn');
    const responseMessage = document.getElementById('responseMessage');
    
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const conjetura = document.getElementById('conjetura').value.trim();
        
        // Validación básica
        if (conjetura.length < 10) {
            showMessage('Por favor, introduce al menos 10 caracteres en la conjetura.', 'error');
            return;
        }
        
        // Mostrar estado de carga
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        hideMessage();
        
        try {
            const response = await fetch('/iniciar-informe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ conjetura: conjetura })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                showMessage(data.message, 'success');
                
                // Animación de éxito
                submitBtn.classList.add('success');
                
                // Redirigir a la página de revisión si existe, o al informe
                const redirectUrl = data.redirect_url || `/informe/${data.informe_id}`;
                setTimeout(() => {
                    window.location.href = redirectUrl;
                }, 1500);
            } else {
                showMessage(data.message || 'Ha ocurrido un error al procesar la conjetura.', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('Error de conexión. Por favor, intenta nuevamente.', 'error');
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    });
    
    // Reset del formulario
    form.addEventListener('reset', function() {
        hideMessage();
        document.getElementById('charCount').textContent = '0';
    });
}

// ========================================
// Funciones auxiliares para mensajes
// ========================================
function showMessage(message, type) {
    const responseMessage = document.getElementById('responseMessage');
    if (!responseMessage) return;
    
    responseMessage.textContent = message;
    responseMessage.className = `response-message ${type}`;
    
    // Scroll suave hacia el mensaje
    responseMessage.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest' 
    });
}

function hideMessage() {
    const responseMessage = document.getElementById('responseMessage');
    if (responseMessage) {
        responseMessage.className = 'response-message';
        responseMessage.textContent = '';
    }
}

// ========================================
// Smooth scroll para navegación
// ========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ========================================
// Optimización de performance
// ========================================
let ticking = false;
let lastScrollY = 0;

window.addEventListener('scroll', function() {
    lastScrollY = window.scrollY;
    
    if (!ticking) {
        window.requestAnimationFrame(function() {
            handleScroll(lastScrollY);
            ticking = false;
        });
        
        ticking = true;
    }
});

function handleScroll(scrollY) {
    // Aquí puedes añadir más efectos basados en scroll
    // Por ahora, el parallax ya está implementado arriba
    
    // Mostrar/ocultar botón de volver arriba (opcional)
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
        if (scrollY > 500) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    }
}

// ========================================
// Animación adicional para las cards
// ========================================
const methodCards = document.querySelectorAll('.method-card');
methodCards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.2}s`;
});

// ========================================
// Easter egg: Konami code
// ========================================
let konamiCode = [];
const konamiSequence = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'b', 'a'
];

document.addEventListener('keydown', function(e) {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);
    
    if (konamiCode.join(',') === konamiSequence.join(',')) {
        activateEasterEgg();
        konamiCode = [];
    }
});

function activateEasterEgg() {
    document.body.style.animation = 'rainbow 2s linear infinite';
    setTimeout(() => {
        document.body.style.animation = '';
    }, 5000);
    
    console.log('🎉 ¡Has descubierto el código secreto! 🎉');
}

// Definir animación rainbow
const style = document.createElement('style');
style.textContent = `
    @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
    }
`;
document.head.appendChild(style);

// ========================================
// Prevenir envíos duplicados
// ========================================
let isSubmitting = false;

const originalSubmit = document.getElementById('conjeturaForm')?.onsubmit;
if (document.getElementById('conjeturaForm')) {
    document.getElementById('conjeturaForm').onsubmit = function(e) {
        if (isSubmitting) {
            e.preventDefault();
            return false;
        }
        isSubmitting = true;
        setTimeout(() => {
            isSubmitting = false;
        }, 3000);
    };
}

// ========================================
// Auto-save en localStorage (opcional)
// ========================================
const textarea = document.getElementById('conjetura');
const AUTO_SAVE_KEY = 'conjetura_draft';

if (textarea) {
    // Cargar borrador guardado
    const savedDraft = localStorage.getItem(AUTO_SAVE_KEY);
    if (savedDraft) {
        const shouldRestore = confirm('Se ha encontrado un borrador guardado. ¿Deseas restaurarlo?');
        if (shouldRestore) {
            textarea.value = savedDraft;
            // Actualizar contador
            const charCount = document.getElementById('charCount');
            if (charCount) {
                charCount.textContent = savedDraft.length;
            }
        } else {
            localStorage.removeItem(AUTO_SAVE_KEY);
        }
    }
    
    // Auto-guardar mientras se escribe
    let saveTimeout;
    textarea.addEventListener('input', function() {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            if (this.value.length > 0) {
                localStorage.setItem(AUTO_SAVE_KEY, this.value);
            }
        }, 1000);
    });
    
    // Limpiar borrador al enviar con éxito
    document.getElementById('conjeturaForm')?.addEventListener('submit', function() {
        setTimeout(() => {
            localStorage.removeItem(AUTO_SAVE_KEY);
        }, 1000);
    });
}

// ========================================
// Console info
// ========================================
console.log('%c Sistema de Informes Periciales ', 'background: #1a237e; color: #fff; padding: 10px; font-size: 16px; font-weight: bold;');
console.log('%c Método Formal Causal - v1.0.0 ', 'background: #3949ab; color: #fff; padding: 5px; font-size: 12px;');
console.log('Desarrollado para la redacción motivada de informes profesionales.');
