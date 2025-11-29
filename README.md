# Sistema de Informes Periciales

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Python](https://img.shields.io/badge/python-3.10+-green)
![Flask](https://img.shields.io/badge/flask-3.0.0-red)
![IA](https://img.shields.io/badge/IA-Llama%203.1-purple)

Sistema web para la redacción de informes periciales motivados mediante el **Método Formal Causal**, potenciado por IA local (LangGraph + Ollama).

## 🎯 Características

- ✅ **Generación automática con IA** - Análisis contextualizado mediante Llama 3.1
- ✅ **Procesamiento 100% local** - Sin envío de datos externos (privacidad total)
- ✅ **Método Formal Causal** - Estructura de 3 preguntas: ¿Por qué?, ¿Para qué?, ¿Qué es?
- ✅ **Informes profesionales** - 11 secciones listas para uso legal
- ✅ **Mapa conceptual interactivo** - Visualización navegable del análisis
- ✅ **Interfaz moderna** - Diseño responsive con animaciones

---

## 🚀 Instalación Rápida

### 1. Requisitos Previos

- **Python 3.10 o superior**
- **Ollama** para ejecutar modelos IA localmente
- **uv** (gestor de paquetes ultrarrápido)

### 2. Instalar Ollama

#### Windows
```powershell
# Descargar e instalar desde: https://ollama.ai/download
# O usar winget:
winget install Ollama.Ollama
```

#### Verificar instalación
```powershell
ollama --version
```

#### Descargar modelo Llama 3.1
```powershell
ollama pull llama3.1
```

Esto descargará ~4.7 GB. El modelo se ejecuta completamente en tu máquina.

### 3. Instalar uv

#### ¿Por qué uv en lugar de pip?

| Característica | uv | pip |
|----------------|-----|-----|
| **Velocidad** | ⚡ 10-100x más rápido | 🐢 Lento |
| **Gestión de venv** | 🤖 Automática | 🔧 Manual |
| **Lock file** | ✅ uv.lock garantiza reproducibilidad | ❌ Sin lock file nativo |
| **Resolución de dependencias** | 🚀 Ultrarrápida | 🕐 Lenta en proyectos grandes |
| **Instalación** | 📦 Todo en uno (pip + pip-tools + venv) | 🔀 Múltiples herramientas |
| **Escritura en Rust** | ✅ Optimizado y seguro | ⚠️ Python (más lento) |

**Comparativa real**:
```
Instalar 40 paquetes:
pip: ~45 segundos
uv:  ~2 segundos  ⚡
```

#### Instalar uv en Windows
```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

#### Verificar instalación
```powershell
uv --version
```

### 4. Clonar e Instalar el Proyecto

```powershell
# Clonar repositorio
git clone https://github.com/jpb75/Informes-Periciales.git
cd Informes-Periciales

# Sincronizar dependencias (crea .venv automáticamente)
uv sync
```

**¿Qué hace `uv sync`?**
1. Lee `pyproject.toml`
2. Crea entorno virtual en `.venv/`
3. Instala todas las dependencias
4. Genera `uv.lock` para reproducibilidad

---

## 💻 Uso

### Ejecutar la Aplicación

```powershell
uv run python app.py
```

### Abrir en el Navegador

```
http://localhost:5000
```

### Flujo de Uso

1. **Introduce tu conjetura** en el formulario (describe el caso pericial)
2. **Espera 30-60 segundos** mientras la IA procesa
3. **Visualiza tu informe** en formato profesional o mapa conceptual
4. **Imprime o exporta** el resultado

---

## 📊 El Método Formal Causal

Metodología estructurada para análisis periciales basada en 3 preguntas fundamentales:

### 1. ¿Por qué? - Motivaciones (4 tipos)

- **Preceptivas**: Del enunciado del problema
- **Técnicas**: Leyes, normas y regulaciones aplicables
- **Facultativas**: Motivación profesional del perito
- **Progresistas**: Aportación al conocimiento actual

### 2. ¿Para qué? - Objetivos

6-8 objetivos relacionados con cada tipo de motivación.

### 3. ¿Qué es? - Definición

Definición precisa y contextualización del problema.

---

## 🤖 Cómo Funciona la IA

```
Conjetura del usuario
      ↓
Agente LangGraph (6 pasos secuenciales)
      ├─ 1. Analiza motivaciones PRECEPTIVAS
      ├─ 2. Analiza motivaciones TÉCNICAS
      ├─ 3. Analiza motivaciones FACULTATIVAS
      ├─ 4. Analiza motivaciones PROGRESISTAS
      ├─ 5. Genera OBJETIVOS vinculados
      └─ 6. Define QUÉ ES el problema
      ↓
Informe completo (11 secciones)
```

**Cada paso** usa el contexto de los pasos anteriores para mantener coherencia y relación entre todos los elementos del análisis.

---

## 📁 Estructura del Proyecto

```
Informes-Periciales/
├── app.py                          # Backend Flask
├── pyproject.toml                  # Config + dependencias
├── uv.lock                         # Lock file
│
├── agentes/
│   ├── __init__.py
│   └── formal_causal_agent.py     # Agente IA (LangGraph + prompts)
│
├── templates/                      # HTML
│   ├── index.html
│   ├── informe.html
│   └── mapa_conceptual_v2.html
│
├── static/                         # CSS + JavaScript
│
├── docs/
│   └── GUIA_COMPLETA.md           # Documentación técnica detallada
│
└── README.md                       # Este archivo
```

---

## 🛠️ Tecnologías

### Backend
- **Flask 3.0** - Framework web
- **Python 3.10+** - Lenguaje base

### IA
- **LangGraph** - Framework de agentes con grafos de estado
- **LangChain** - Abstracción para LLMs
- **Ollama** - Runtime local de modelos IA
- **Llama 3.1** - Modelo de lenguaje de Meta (4.7 GB)

### Gestión
- **uv** - Gestor de paquetes ultrarrápido
- **pyproject.toml** - Configuración estándar Python

---

## ⚙️ Configuración

### Cambiar el Modelo de IA

Edita `agentes/formal_causal_agent.py`:

```python
OLLAMA_MODEL = "llama3.1"  # Cambiar aquí
OLLAMA_TEMPERATURE = 0.3   # Ajustar creatividad (0.1-1.0)
```

Modelos disponibles: https://ollama.ai/library

### Modificar Prompts

Los prompts están en `agentes/formal_causal_agent.py`. Edita las constantes `PROMPT_PRECEPTIVAS`, `PROMPT_TECNICAS`, etc.

---

## 🔧 Comandos Útiles con uv

```powershell
# Instalar dependencias
uv sync

# Ejecutar aplicación
uv run python app.py

# Añadir nueva dependencia
uv add nombre-paquete

# Añadir dependencia de desarrollo
uv add --dev nombre-paquete

# Actualizar dependencias
uv sync --upgrade

# Ver dependencias instaladas
uv pip list
```

---

## ❓ Solución de Problemas

### Ollama no responde
```powershell
# Verificar que está corriendo
ollama serve
```

### Modelo no encontrado
```powershell
# Descargar el modelo
ollama pull llama3.1
```

### Error al importar módulos
```powershell
# Resincronizar dependencias
uv sync
```

### Procesamiento muy lento

**Causas**:
- Primera ejecución (carga modelo en memoria)
- RAM insuficiente (< 8GB)

**Soluciones**:
- Esperar a segunda ejecución (será más rápida)
- Usar modelo más pequeño: `ollama pull llama3.2:1b`

---

## 📚 Documentación Completa

Para información técnica detallada, arquitectura del sistema, y guías avanzadas:

👉 **[docs/GUIA_COMPLETA.md](docs/GUIA_COMPLETA.md)**

---

## 🎯 Ejemplo de Uso

### Conjetura de Ejemplo

```
Se requiere evaluar si un edificio de viviendas de 5 plantas cumple 
con la normativa vigente de eficiencia energética y accesibilidad. 
Los vecinos reportan problemas de humedad en las plantas bajas y 
ausencia de rampa de acceso para personas con movilidad reducida.
```

### Resultado

El sistema generará automáticamente:
- 4 tipos de motivaciones (10-14 en total)
- 6-8 objetivos contextualizados
- Definición precisa del problema
- Informe de 11 secciones profesionales

**Tiempo de procesamiento**: 30-60 segundos

---

## 📝 Requisitos del Sistema

- **Python**: 3.10 o superior
- **RAM**: 8 GB mínimo, 16 GB recomendado
- **Espacio**: 5 GB para modelo Llama 3.1
- **CPU**: Procesador multinúcleo moderno
- **GPU**: Opcional (acelera procesamiento)
- **SO**: Windows, macOS, Linux

---

## 🤝 Contribuciones

Las sugerencias y mejoras son bienvenidas. Este es un proyecto en desarrollo activo.

---

## 📄 Licencia

Proyecto desarrollado para uso académico y profesional en el ámbito de informes periciales.

---

## 👤 Autor

Sistema desarrollado para la investigación y redacción de informes periciales motivados.

**Repositorio**: https://github.com/jpb75/Informes-Periciales  
**Versión**: 2.0.0  
**Última actualización**: Noviembre 2025

---

## 🔗 Enlaces Útiles

- [Ollama](https://ollama.ai) - Runtime de modelos IA
- [uv](https://docs.astral.sh/uv/) - Gestor de paquetes Python
- [LangGraph](https://langchain-ai.github.io/langgraph/) - Framework de agentes
- [Flask](https://flask.palletsprojects.com/) - Framework web Python
