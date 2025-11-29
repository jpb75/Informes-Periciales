# Guía Completa - Sistema de Informes Periciales con IA

## Índice

1. [Descripción del Proyecto](#descripción-del-proyecto)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [El Método Formal Causal](#el-método-formal-causal)
4. [Tecnologías Utilizadas](#tecnologías-utilizadas)
5. [Funcionamiento del Agente IA](#funcionamiento-del-agente-ia)
6. [Estructura del Código](#estructura-del-código)
7. [Solución de Problemas](#solución-de-problemas)

---

## Descripción del Proyecto

Sistema web desarrollado con Flask que permite generar informes periciales profesionales aplicando el **Método Formal Causal** mediante un agente de IA basado en LangGraph y Ollama (Llama 3.1).

### Características Principales

✅ **Generación automática con IA** - Análisis contextualizado de conjeturas  
✅ **Método Formal Causal** - Estructura de 3 preguntas: ¿Por qué?, ¿Para qué?, ¿Qué es?  
✅ **Procesamiento local** - Ollama ejecuta en tu máquina (privacidad total)  
✅ **Informes profesionales** - 11 secciones listas para uso legal  
✅ **Mapa conceptual interactivo** - Visualización navegable del análisis  
✅ **Sin marcadores de IA** - Output profesional y natural  

---

## Arquitectura del Sistema

### Flujo Completo

```
Usuario introduce conjetura en formulario web
         ↓
Flask recibe POST → /procesar-conjetura
         ↓
Agente LangGraph procesa en 6 pasos secuenciales
         ↓
    PASO 1: Motivaciones PRECEPTIVAS (del enunciado)
    PASO 2: Motivaciones TÉCNICAS (normativas)
    PASO 3: Motivaciones FACULTATIVAS (profesionales)
    PASO 4: Motivaciones PROGRESISTAS (conocimiento)
    PASO 5: OBJETIVOS vinculados (¿Para qué?)
    PASO 6: DEFINICIÓN del problema (¿Qué es?)
         ↓
Genera informe completo de 11 secciones
         ↓
Muestra informe o mapa conceptual interactivo
```

### Grafo LangGraph

```
StateGraph (FormalCausalState)
├── Estado inicial: conjetura
├── Nodos secuenciales:
│   ├── analizar_preceptivas()
│   ├── analizar_tecnicas()
│   ├── analizar_facultativas()
│   ├── analizar_progresistas()
│   ├── analizar_objetivos()
│   └── analizar_que_es()
└── Cada nodo:
    1. Recibe estado actual
    2. Construye prompt contextualizado
    3. Llama a Ollama
    4. Extrae JSON de respuesta
    5. Actualiza estado
    6. Pasa al siguiente nodo
```

---

## El Método Formal Causal

Metodología estructurada para redacción de informes fundamentados.

### 1. ¿Por qué? - Motivaciones (4 tipos)

#### Preceptivas
Surgen directamente del enunciado del problema. Aspectos explícitos del caso.

#### Técnicas
Leyes, normas, regulaciones y estándares técnicos aplicables.

#### Facultativas
Motivación profesional del perito para resolver el problema.

#### Progresistas
Aportaciones al conocimiento actual y generación de precedentes.

### 2. ¿Para qué? - Objetivos

6-8 objetivos relacionados con cada tipo de motivación. Cada objetivo se vincula a su motivación correspondiente (preceptivas, técnicas, facultativas o progresistas).

### 3. ¿Qué es? - Definición

- **Definición precisa**: Características fundamentales y naturaleza técnica
- **Contextualización**: Marco técnico, legal y práctico aplicable

---

## Tecnologías Utilizadas

### Backend
- **Flask 3.0** - Framework web Python
- **Python 3.10+** - Lenguaje base

### IA y Agentes
- **LangGraph** - Framework de grafos de estado para agentes
- **LangChain** - Abstracción para LLMs
- **Ollama** - Runtime local de modelos LLM
- **Llama 3.1** - Modelo de lenguaje (4.7 GB)

### Frontend
- **HTML5 + CSS3** - Interfaz moderna con animaciones
- **JavaScript Vanilla** - Sin frameworks, código limpio
- **Google Fonts** - Playfair Display + Roboto

### Gestión de Proyecto
- **uv** - Gestor de paquetes ultrarrápido
- **pyproject.toml** - Configuración estándar Python

---

## Funcionamiento del Agente IA

### Configuración del Modelo

```python
# En agentes/formal_causal_agent.py
OLLAMA_MODEL = "llama3.1"
OLLAMA_BASE_URL = "http://127.0.0.1:11434"
OLLAMA_TEMPERATURE = 0.3  # Balance precisión/creatividad
```

### Procesamiento de Conjetura

Cada conjetura pasa por 6 nodos secuenciales:

#### 1. Analizar Preceptivas
- **Input**: Conjetura inicial
- **Prompt**: "Identifica aspectos explícitos del enunciado"
- **Output**: 2-4 motivaciones preceptivas

#### 2. Analizar Técnicas
- **Input**: Conjetura + preceptivas
- **Prompt**: "Identifica normativa y leyes aplicables"
- **Output**: 2-4 motivaciones técnicas

#### 3. Analizar Facultativas
- **Input**: Conjetura + preceptivas + técnicas
- **Prompt**: "Identifica motivación profesional del perito"
- **Output**: 2-3 motivaciones facultativas

#### 4. Analizar Progresistas
- **Input**: Todo lo anterior
- **Prompt**: "Identifica aportación al conocimiento"
- **Output**: 2-3 motivaciones progresistas

#### 5. Analizar Objetivos
- **Input**: Todas las motivaciones
- **Prompt**: "Genera objetivos vinculados a cada tipo"
- **Output**: 6-8 objetivos distribuidos

#### 6. Definir Qué Es
- **Input**: Análisis completo
- **Prompt**: "Define el problema precisamente"
- **Output**: Definición + contextualización

### Ventajas del Diseño

✅ **Contexto acumulativo** - Cada paso usa resultados anteriores  
✅ **Coherencia garantizada** - Análisis relacionado y estructurado  
✅ **Trazabilidad** - Logs de cada paso en consola  
✅ **Robustez** - Manejo de errores por nodo  
✅ **Modularidad** - Fácil añadir/modificar pasos  
✅ **Privacidad** - Todo local, sin envío externo de datos  

---

## Estructura del Código

### Organización de Archivos

```
Informes-Periciales/
├── app.py                          # Flask backend
├── pyproject.toml                  # Config uv + dependencias
├── uv.lock                         # Lock file
│
├── agentes/
│   ├── __init__.py
│   └── formal_causal_agent.py     # Grafo LangGraph + Prompts
│
├── templates/
│   ├── index.html                 # Página principal
│   ├── informe.html               # Vista de informe
│   └── mapa_conceptual_v2.html    # Mapa interactivo
│
├── static/
│   ├── css/
│   │   ├── styles.css
│   │   ├── informe.css
│   │   └── mapa_conceptual.css
│   └── js/
│       ├── main.js
│       ├── informe.js
│       └── mapa_conceptual.js
│
├── docs/
│   └── GUIA_COMPLETA.md           # Este archivo
│
└── README.md                       # Guía rápida de instalación
```

### Archivo Principal: formal_causal_agent.py

Contiene TODO el agente en un solo archivo:

1. **Configuración de Ollama** (constantes)
2. **6 Prompts especializados** (strings con formato)
3. **Estado del grafo** (TypedDict)
4. **6 Funciones nodo** (procesan cada paso)
5. **Construcción del grafo** (LangGraph)
6. **Función principal** `procesar_conjetura()`

### Endpoints de Flask

#### POST /procesar-conjetura
- Valida conjetura (mínimo 10 caracteres)
- Llama al agente: `procesar_conjetura(texto)`
- Genera informe completo con análisis IA
- Retorna: `{success: true, informe_id: "..."}`

#### GET /informe/<id>
- Muestra informe de 11 secciones
- Formato profesional apto para uso legal

#### GET /mapa-conceptual/<id>
- Visualización interactiva del análisis
- Navegación por motivaciones y objetivos
- Expansión/colapso de nodos

---

## Solución de Problemas

### Error: Connection refused (Ollama)
**Solución**: Verifica que Ollama está corriendo
```powershell
ollama serve
```

### Error: Model not found
**Solución**: Descarga el modelo
```powershell
ollama pull llama3.1
```

### Respuestas en inglés
**Causa**: Prompts diseñados para español en Llama 3.1  
**Solución**: Verifica que usas `llama3.1`, no otras versiones

### Procesamiento muy lento
**Causas posibles**:
- Primera ejecución (carga del modelo en memoria)
- Recursos insuficientes (RAM < 8GB)

**Soluciones**:
- Esperar a segunda ejecución (será más rápida)
- Usar modelo más pequeño: `ollama pull llama3.2:1b`
- Cerrar aplicaciones que consumen RAM

### Error al importar módulos
**Solución**: Resincronizar dependencias
```powershell
uv sync
```

### Conjeturas con análisis genérico
**Mejora la conjetura**:
- ✅ Específica y detallada
- ✅ Incluye contexto relevante
- ✅ Menciona hechos concretos
- ✅ Mínimo 50 caracteres

**Ejemplo BUENO**:
```
Se requiere analizar si las instalaciones eléctricas de un edificio 
comercial de 2010 cumplen con el REBT vigente. Se han detectado 
fusibles antiguos, ausencia de diferenciales en algunos circuitos 
y cables sin identificar en cuadro general.
```

**Ejemplo MALO**:
```
Revisar instalación eléctrica
```

---

## Personalización

### Cambiar Temperatura del Modelo

En `agentes/formal_causal_agent.py`:

```python
OLLAMA_TEMPERATURE = 0.3  # Cambiar aquí

# 0.1-0.3: Más preciso y consistente
# 0.4-0.6: Balance creatividad/precisión
# 0.7-1.0: Más creativo pero menos consistente
```

Para informes periciales, recomendamos mantener **0.3-0.4**.

### Modificar Prompts

Edita los prompts en `agentes/formal_causal_agent.py`:

```python
PROMPT_PRECEPTIVAS = """Eres un experto en análisis pericial...
# Modificar instrucciones aquí
"""
```

### Cambiar Modelo

```python
OLLAMA_MODEL = "llama3.2"  # O cualquier otro modelo
```

Modelos disponibles en: https://ollama.ai/library

### Añadir Nuevo Paso al Grafo

1. Crear función nodo en `formal_causal_agent.py`
2. Agregar al grafo: `workflow.add_node("nombre", funcion)`
3. Definir conexiones: `workflow.add_edge("anterior", "nombre")`

---

## Información Técnica

### Requisitos del Sistema

- **Python**: 3.10 o superior
- **RAM**: 8 GB mínimo, 16 GB recomendado
- **Espacio**: 5 GB para modelo Llama 3.1
- **CPU**: Procesador multinúcleo moderno
- **GPU**: Opcional (acelera procesamiento)

### Tiempos de Procesamiento

- **Primera ejecución**: 45-90 segundos
- **Ejecuciones posteriores**: 30-45 segundos
- **Depende de**: Hardware, modelo usado, longitud de conjetura

### Formato de Salida

El agente retorna:

```python
{
    "success": True,
    "analisis": {
        "por_que": {
            "preceptivas": [...],
            "tecnicas": [...],
            "facultativas": [...],
            "progresistas": [...]
        },
        "para_que": [...],
        "que_es": {
            "contenido": "...",
            "contexto": "..."
        }
    }
}
```

Cada motivación:
```python
{
    "titulo": "Título descriptivo",
    "contenido": "Explicación detallada..."
}
```

Cada objetivo:
```python
{
    "titulo": "Título del objetivo",
    "tipo": "preceptivas|tecnicas|facultativas|progresistas",
    "contenido": "Explicación..."
}
```

---

## Contacto y Contribuciones

**Repositorio**: https://github.com/jpb75/Informes-Periciales  
**Versión**: 2.0.0 con IA integrada  
**Última actualización**: Noviembre 2025

---

*Sistema desarrollado para la investigación y redacción de informes periciales motivados mediante el Método Formal Causal.*
