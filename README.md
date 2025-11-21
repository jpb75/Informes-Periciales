# Sistema de Informes Periciales
## Método Formal Causal

Sistema web para la redacción de informes motivados mediante el Método Formal Causal, desarrollado con Python y Flask.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Python](https://img.shields.io/badge/python-3.8+-green)
![Flask](https://img.shields.io/badge/flask-3.0.0-red)

## 📋 Descripción

Esta aplicación web permite iniciar la redacción de informes periciales motivados siguiendo el **Método Formal Causal**, que estructura el análisis mediante tres preguntas fundamentales:

### El Método Formal Causal

1. **¿Por qué?** - Análisis de motivaciones en cuatro dimensiones:
   - **Preceptivas**: Surgen del propio enunciado del problema
   - **Técnicas**: Implícitas en el problema (leyes, normas, regulaciones)
   - **Facultativas**: Motivación profesional del autor
   - **Progresistas**: Aportación al conocimiento actual

2. **¿Para qué?** - Objetivos y finalidades relacionadas con cada motivación

3. **¿Qué es?** - Definición y contextualización del problema

## 🎨 Características

- **Interfaz moderna y profesional** con efectos visuales atractivos
- **Animaciones de scroll** con efecto parallax
- **Zoom progresivo** de elementos al hacer scroll
- **Formulario interactivo** con validación en tiempo real
- **Contador de caracteres** con indicadores visuales
- **Auto-guardado** de borradores en el navegador
- **Mapa Conceptual Interactivo** para visualizar motivaciones y objetivos
  - Navegación visual por las 4 tipos de motivaciones
  - Visualización de objetivos relacionados con cada motivación
  - Expansión/colapso de nodos con efectos animados
  - Atajos de teclado (E: expandir todo, C: colapsar todo)
- **Generación de Informes Profesionales**
  - 11 secciones estructuradas según método pericial
  - Formato profesional apto para presentación legal
  - Funciones de impresión y exportación
- **Diseño responsive** adaptable a dispositivos móviles
- **Preparado para integración con IA** (próximamente)

## 🚀 Instalación

### Requisitos previos

- Python 3.8 o superior
- pip (gestor de paquetes de Python)

### Pasos de instalación

1. **Clonar o descargar** el repositorio en tu máquina local

2. **Crear un entorno virtual** (recomendado):
   ```powershell
   python -m venv venv
   ```

3. **Activar el entorno virtual**:
   ```powershell
   .\venv\Scripts\Activate.ps1
   ```
   
   Si encuentras un error de permisos en PowerShell, ejecuta:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

4. **Instalar las dependencias**:
   ```powershell
   pip install -r requirements.txt
   ```

## 💻 Uso

1. **Ejecutar la aplicación**:
   ```powershell
   python app.py
   ```

2. **Abrir el navegador** y visitar:
   ```
   http://localhost:5000
   ```

3. **Usar la aplicación**:
   - Desplázate por la página para conocer el método
   - Introduce tu conjetura inicial en el formulario
   - El sistema guardará automáticamente tu progreso
   - Presiona "Generar Informe" para procesar la conjetura
   - **Ver Informe Completo**: Visualiza el informe profesional de 11 secciones
   - **Mapa Conceptual**: Navega interactivamente por las motivaciones y objetivos
     - Haz clic en "Ver más" en cada nodo para expandir detalles
     - Usa la tecla `E` para expandir todos los nodos
     - Usa la tecla `C` para colapsar todos los nodos
     - Usa las flechas ↑↓ para navegar entre nodos

## 📁 Estructura del Proyecto

```
InformesPericiales/
│
├── app.py                      # Aplicación principal Flask
├── requirements.txt            # Dependencias del proyecto
├── README.md                   # Este archivo
│
├── templates/
│   ├── index.html             # Página principal
│   ├── informe.html           # Vista del informe completo
│   └── mapa_conceptual.html   # Visualización interactiva del método
│
└── static/
    ├── css/
    │   ├── styles.css         # Estilos principales
    │   ├── informe.css        # Estilos del informe
    │   └── mapa_conceptual.css # Estilos del mapa conceptual
    │
    ├── js/
    │   ├── main.js            # Lógica principal del cliente
    │   ├── informe.js         # Funcionalidad del informe
    │   └── mapa_conceptual.js # Interactividad del mapa
    │
    └── images/                # Imágenes del proyecto
```

## 🔧 Configuración

### Variables de entorno (opcional)

Puedes crear un archivo `.env` para configurar:

```env
FLASK_ENV=development
SECRET_KEY=tu-clave-secreta-aqui
FLASK_PORT=5000
```

### Integración con IA (Próximamente)

La aplicación está preparada para integrarse con APIs de IA generativa. El endpoint `/procesar-conjetura` está listo para recibir y procesar las conjeturas, y será donde se implemente la lógica de generación de informes mediante IA.

## 🎯 Próximas Funcionalidades

- [x] Mapa Conceptual Interactivo
- [x] Generación de Informes Profesionales
- [x] Navegación entre vista de informe y mapa conceptual
- [ ] Integración con API de IA generativa (OpenAI, Anthropic, etc.)
- [ ] Generación automática de contenido mediante IA
- [ ] Sistema de plantillas personalizables
- [ ] Exportación a PDF mejorada
- [ ] Historial de informes generados
- [ ] Sistema de usuarios y autenticación
- [ ] Dashboard de informes
- [ ] Edición in-situ de secciones del informe

## 🛠️ Tecnologías Utilizadas

- **Backend**: Python 3.x, Flask 3.0
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Fuentes**: Google Fonts (Playfair Display, Roboto)
- **Diseño**: CSS Grid, Flexbox, Animaciones CSS

## 📝 Notas de Desarrollo

- El sistema actualmente usa datos de demostración con:
  - **4 motivaciones** (una por cada tipo: preceptivas, técnicas, facultativas, progresistas)
  - **8 objetivos** ("para qués") relacionados con las motivaciones (2 por cada tipo)
  - Estructura completa de 11 secciones del informe pericial
- Los informes se guardan temporalmente en memoria (`informes_generados`)
- El mapa conceptual permite visualizar la estructura del Método Formal Causal
- Las animaciones están optimizadas con `requestAnimationFrame`
- El diseño es completamente responsive
- El informe generado es profesional, sin marcadores de IA, apto para uso legal

## 🤝 Contribuciones

Este es un proyecto en desarrollo activo. Las sugerencias y mejoras son bienvenidas.

## 📄 Licencia

Proyecto desarrollado para uso académico y profesional.

## 👤 Autor

Sistema desarrollado para la investigación y redacción de informes periciales motivados.

---

**Versión**: 1.0.0  
**Última actualización**: Noviembre 2025
