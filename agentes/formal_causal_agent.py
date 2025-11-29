"""
Agente LangGraph para el Método Formal Causal
Procesa conjeturas y genera análisis estructurado basado en el método
"""

from typing import TypedDict, List, Dict, Any
from langchain_ollama import ChatOllama
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, SystemMessage
import json
import re


# ============================================================================
# CONFIGURACIÓN DE OLLAMA
# ============================================================================

OLLAMA_MODEL = "llama3.1"
OLLAMA_BASE_URL = "http://127.0.0.1:11434"
OLLAMA_TEMPERATURE = 0.3  # Balance entre creatividad y coherencia (0.1-1.0)


# ============================================================================
# PROMPTS ESPECIALIZADOS
# ============================================================================

PROMPT_PRECEPTIVAS = """Eres un experto en análisis pericial. Tu tarea es identificar las MOTIVACIONES PRECEPTIVAS.

Las motivaciones preceptivas son aquellas que surgen directamente del enunciado del problema. Son los aspectos explícitos y evidentes que están presentes en la descripción del caso.

CONJETURA INICIAL:
{conjetura}

Analiza la conjetura y extrae entre 2-4 motivaciones preceptivas. Para cada una, proporciona:
1. Un título descriptivo (máximo 10 palabras)
2. El contenido detallado explicando por qué es una motivación preceptiva (2-4 frases)

Responde ÚNICAMENTE en formato JSON con esta estructura:
{{
  "preceptivas": [
    {{
      "titulo": "Título de la motivación",
      "contenido": "Explicación detallada..."
    }}
  ]
}}
"""

PROMPT_TECNICAS = """Eres un experto en análisis pericial y normativa técnica. Tu tarea es identificar las MOTIVACIONES TÉCNICAS.

Las motivaciones técnicas son las implícitas en el problema: leyes, normas, regulaciones, estándares técnicos, reglamentos y normativas profesionales que son relevantes para el caso.

CONJETURA INICIAL:
{conjetura}

MOTIVACIONES PRECEPTIVAS YA IDENTIFICADAS:
{preceptivas}

Analiza la conjetura y extrae entre 2-4 motivaciones técnicas. Para cada una, proporciona:
1. Un título descriptivo (máximo 10 palabras)
2. El contenido detallado explicando qué normativa o estándar técnico aplica (2-4 frases)

Responde ÚNICAMENTE en formato JSON con esta estructura:
{{
  "tecnicas": [
    {{
      "titulo": "Título de la motivación técnica",
      "contenido": "Explicación detallada de la normativa aplicable..."
    }}
  ]
}}
"""

PROMPT_FACULTATIVAS = """Eres un experto perito. Tu tarea es identificar las MOTIVACIONES FACULTATIVAS.

Las motivaciones facultativas son las que provienen de la motivación profesional del autor/perito. Representan el interés del experto en resolver el problema utilizando sus conocimientos especializados.

CONJETURA INICIAL:
{conjetura}

MOTIVACIONES PREVIAS:
Preceptivas: {preceptivas}
Técnicas: {tecnicas}

Analiza la conjetura y extrae entre 2-3 motivaciones facultativas. Para cada una, proporciona:
1. Un título descriptivo (máximo 10 palabras)
2. El contenido detallado explicando la motivación profesional (2-4 frases)

Responde ÚNICAMENTE en formato JSON con esta estructura:
{{
  "facultativas": [
    {{
      "titulo": "Título de la motivación facultativa",
      "contenido": "Explicación de la motivación profesional..."
    }}
  ]
}}
"""

PROMPT_PROGRESISTAS = """Eres un experto investigador pericial. Tu tarea es identificar las MOTIVACIONES PROGRESISTAS.

Las motivaciones progresistas representan la aportación al conocimiento actual. Son aspectos novedosos del caso que pueden contribuir al desarrollo de las mejores prácticas profesionales o generar nuevos precedentes técnicos.

CONJETURA INICIAL:
{conjetura}

MOTIVACIONES PREVIAS:
Preceptivas: {preceptivas}
Técnicas: {tecnicas}
Facultativas: {facultativas}

Analiza la conjetura y extrae entre 2-3 motivaciones progresistas. Para cada una, proporciona:
1. Un título descriptivo (máximo 10 palabras)
2. El contenido detallado explicando la aportación al conocimiento (2-4 frases)

Responde ÚNICAMENTE en formato JSON con esta estructura:
{{
  "progresistas": [
    {{
      "titulo": "Título de la motivación progresista",
      "contenido": "Explicación de la aportación al conocimiento..."
    }}
  ]
}}
"""

PROMPT_OBJETIVOS = """Eres un experto en análisis pericial. Tu tarea es identificar los OBJETIVOS relacionados con cada tipo de motivación.

Los objetivos responden a "¿Para qué?" y deben estar relacionados con las motivaciones identificadas. Cada objetivo debe vincularse con su tipo de motivación correspondiente.

CONJETURA INICIAL:
{conjetura}

MOTIVACIONES IDENTIFICADAS:
Preceptivas: {preceptivas}
Técnicas: {tecnicas}
Facultativas: {facultativas}
Progresistas: {progresistas}

Genera entre 6-8 objetivos en total, distribuyéndolos entre los 4 tipos de motivaciones. Para cada objetivo:
1. Un título claro (máximo 12 palabras)
2. El tipo de motivación al que pertenece: "preceptivas", "tecnicas", "facultativas" o "progresistas"
3. Contenido explicando para qué sirve este objetivo (2-3 frases)

Responde ÚNICAMENTE en formato JSON con esta estructura:
{{
  "para_que": [
    {{
      "titulo": "Título del objetivo",
      "tipo": "preceptivas",
      "contenido": "Explicación del objetivo..."
    }},
    {{
      "titulo": "Otro objetivo",
      "tipo": "tecnicas",
      "contenido": "Explicación..."
    }}
  ]
}}
"""

PROMPT_QUE_ES = """Eres un experto en análisis pericial. Tu tarea es crear la DEFINICIÓN del problema (responde a "¿Qué es?").

La definición debe ser precisa y establecer las características fundamentales, naturaleza técnica y alcance del problema.

CONJETURA INICIAL:
{conjetura}

ANÁLISIS COMPLETO REALIZADO:
Motivaciones Preceptivas: {preceptivas}
Motivaciones Técnicas: {tecnicas}
Motivaciones Facultativas: {facultativas}
Motivaciones Progresistas: {progresistas}
Objetivos: {objetivos}

Basándote en todo el análisis, proporciona:
1. Una definición precisa del problema (contenido: 3-5 frases)
2. Una contextualización del problema (contexto: 3-5 frases)

Responde ÚNICAMENTE en formato JSON con esta estructura:
{{
  "que_es": {{
    "contenido": "Definición precisa del problema...",
    "contexto": "Contextualización del problema..."
  }}
}}
"""


# ============================================================================
# DEFINICIÓN DEL ESTADO
# ============================================================================
class FormalCausalState(TypedDict):
    """Estado del grafo de análisis del Método Formal Causal"""
    conjetura: str
    preceptivas: List[Dict[str, str]]
    tecnicas: List[Dict[str, str]]
    facultativas: List[Dict[str, str]]
    progresistas: List[Dict[str, str]]
    objetivos: List[Dict[str, str]]
    que_es: Dict[str, str]
    error: str


# ============================================================================
# INICIALIZACIÓN DEL LLM
# ============================================================================
def get_llm():
    """Crea instancia del LLM con configuración de Ollama"""
    return ChatOllama(
        model=OLLAMA_MODEL,
        base_url=OLLAMA_BASE_URL,
        temperature=OLLAMA_TEMPERATURE
    )


# ============================================================================
# UTILIDADES
# ============================================================================
def extract_json_from_response(response_text: str) -> dict:
    """Extrae JSON de la respuesta del LLM, manejando markdown y texto adicional"""
    try:
        # Intentar parsear directamente
        return json.loads(response_text)
    except json.JSONDecodeError:
        # Buscar JSON entre ```json y ```
        json_match = re.search(r'```json\s*(.*?)\s*```', response_text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group(1))
        
        # Buscar JSON entre { y }
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group(0))
        
        raise ValueError("No se pudo extraer JSON de la respuesta")


def safe_llm_call(llm, prompt: str, default_value: Any = None) -> Any:
    """Llama al LLM con manejo de errores"""
    try:
        messages = [
            SystemMessage(content="Eres un experto en análisis pericial. Responde siempre en el formato JSON solicitado."),
            HumanMessage(content=prompt)
        ]
        response = llm.invoke(messages)
        return extract_json_from_response(response.content)
    except Exception as e:
        print(f"Error en llamada al LLM: {e}")
        return default_value


# ============================================================================
# NODOS DEL GRAFO
# ============================================================================
def analizar_preceptivas(state: FormalCausalState) -> FormalCausalState:
    """Nodo: Analiza motivaciones preceptivas"""
    print("🔍 Analizando motivaciones PRECEPTIVAS...")
    
    llm = get_llm()
    prompt = PROMPT_PRECEPTIVAS.format(conjetura=state['conjetura'])
    
    result = safe_llm_call(llm, prompt, {"preceptivas": []})
    state['preceptivas'] = result.get('preceptivas', [])
    
    print(f"✅ Encontradas {len(state['preceptivas'])} motivaciones preceptivas")
    return state


def analizar_tecnicas(state: FormalCausalState) -> FormalCausalState:
    """Nodo: Analiza motivaciones técnicas"""
    print("🔍 Analizando motivaciones TÉCNICAS...")
    
    llm = get_llm()
    preceptivas_str = json.dumps(state['preceptivas'], indent=2, ensure_ascii=False)
    prompt = PROMPT_TECNICAS.format(
        conjetura=state['conjetura'],
        preceptivas=preceptivas_str
    )
    
    result = safe_llm_call(llm, prompt, {"tecnicas": []})
    state['tecnicas'] = result.get('tecnicas', [])
    
    print(f"✅ Encontradas {len(state['tecnicas'])} motivaciones técnicas")
    return state


def analizar_facultativas(state: FormalCausalState) -> FormalCausalState:
    """Nodo: Analiza motivaciones facultativas"""
    print("🔍 Analizando motivaciones FACULTATIVAS...")
    
    llm = get_llm()
    preceptivas_str = json.dumps(state['preceptivas'], indent=2, ensure_ascii=False)
    tecnicas_str = json.dumps(state['tecnicas'], indent=2, ensure_ascii=False)
    
    prompt = PROMPT_FACULTATIVAS.format(
        conjetura=state['conjetura'],
        preceptivas=preceptivas_str,
        tecnicas=tecnicas_str
    )
    
    result = safe_llm_call(llm, prompt, {"facultativas": []})
    state['facultativas'] = result.get('facultativas', [])
    
    print(f"✅ Encontradas {len(state['facultativas'])} motivaciones facultativas")
    return state


def analizar_progresistas(state: FormalCausalState) -> FormalCausalState:
    """Nodo: Analiza motivaciones progresistas"""
    print("🔍 Analizando motivaciones PROGRESISTAS...")
    
    llm = get_llm()
    preceptivas_str = json.dumps(state['preceptivas'], indent=2, ensure_ascii=False)
    tecnicas_str = json.dumps(state['tecnicas'], indent=2, ensure_ascii=False)
    facultativas_str = json.dumps(state['facultativas'], indent=2, ensure_ascii=False)
    
    prompt = PROMPT_PROGRESISTAS.format(
        conjetura=state['conjetura'],
        preceptivas=preceptivas_str,
        tecnicas=tecnicas_str,
        facultativas=facultativas_str
    )
    
    result = safe_llm_call(llm, prompt, {"progresistas": []})
    state['progresistas'] = result.get('progresistas', [])
    
    print(f"✅ Encontradas {len(state['progresistas'])} motivaciones progresistas")
    return state


def analizar_objetivos(state: FormalCausalState) -> FormalCausalState:
    """Nodo: Analiza objetivos (¿Para qué?)"""
    print("🔍 Analizando OBJETIVOS (¿Para qué?)...")
    
    llm = get_llm()
    preceptivas_str = json.dumps(state['preceptivas'], indent=2, ensure_ascii=False)
    tecnicas_str = json.dumps(state['tecnicas'], indent=2, ensure_ascii=False)
    facultativas_str = json.dumps(state['facultativas'], indent=2, ensure_ascii=False)
    progresistas_str = json.dumps(state['progresistas'], indent=2, ensure_ascii=False)
    
    prompt = PROMPT_OBJETIVOS.format(
        conjetura=state['conjetura'],
        preceptivas=preceptivas_str,
        tecnicas=tecnicas_str,
        facultativas=facultativas_str,
        progresistas=progresistas_str
    )
    
    result = safe_llm_call(llm, prompt, {"para_que": []})
    state['objetivos'] = result.get('para_que', [])
    
    print(f"✅ Encontrados {len(state['objetivos'])} objetivos")
    return state


def analizar_que_es(state: FormalCausalState) -> FormalCausalState:
    """Nodo: Define qué es el problema"""
    print("🔍 Definiendo QUÉ ES el problema...")
    
    llm = get_llm()
    preceptivas_str = json.dumps(state['preceptivas'], indent=2, ensure_ascii=False)
    tecnicas_str = json.dumps(state['tecnicas'], indent=2, ensure_ascii=False)
    facultativas_str = json.dumps(state['facultativas'], indent=2, ensure_ascii=False)
    progresistas_str = json.dumps(state['progresistas'], indent=2, ensure_ascii=False)
    objetivos_str = json.dumps(state['objetivos'], indent=2, ensure_ascii=False)
    
    prompt = PROMPT_QUE_ES.format(
        conjetura=state['conjetura'],
        preceptivas=preceptivas_str,
        tecnicas=tecnicas_str,
        facultativas=facultativas_str,
        progresistas=progresistas_str,
        objetivos=objetivos_str
    )
    
    result = safe_llm_call(llm, prompt, {"que_es": {"contenido": "", "contexto": ""}})
    state['que_es'] = result.get('que_es', {"contenido": "", "contexto": ""})
    
    print("✅ Definición completada")
    return state


# ============================================================================
# CONSTRUCCIÓN DEL GRAFO
# ============================================================================
def crear_grafo_formal_causal() -> StateGraph:
    """Crea y configura el grafo de análisis del Método Formal Causal"""
    
    workflow = StateGraph(FormalCausalState)
    
    # Agregar nodos
    workflow.add_node("preceptivas", analizar_preceptivas)
    workflow.add_node("tecnicas", analizar_tecnicas)
    workflow.add_node("facultativas", analizar_facultativas)
    workflow.add_node("progresistas", analizar_progresistas)
    workflow.add_node("objetivos", analizar_objetivos)
    workflow.add_node("que_es", analizar_que_es)
    
    # Definir flujo secuencial
    workflow.set_entry_point("preceptivas")
    workflow.add_edge("preceptivas", "tecnicas")
    workflow.add_edge("tecnicas", "facultativas")
    workflow.add_edge("facultativas", "progresistas")
    workflow.add_edge("progresistas", "objetivos")
    workflow.add_edge("objetivos", "que_es")
    workflow.add_edge("que_es", END)
    
    return workflow.compile()


# ============================================================================
# FUNCIÓN PRINCIPAL
# ============================================================================
def procesar_conjetura(conjetura: str) -> Dict[str, Any]:
    """
    Procesa una conjetura usando el Método Formal Causal con LangGraph
    
    Args:
        conjetura: Texto de la conjetura inicial del usuario
        
    Returns:
        Diccionario con todo el análisis estructurado
    """
    print(f"\n{'='*60}")
    print("🚀 INICIANDO ANÁLISIS DEL MÉTODO FORMAL CAUSAL")
    print(f"{'='*60}\n")
    
    # Crear estado inicial
    estado_inicial = {
        'conjetura': conjetura,
        'preceptivas': [],
        'tecnicas': [],
        'facultativas': [],
        'progresistas': [],
        'objetivos': [],
        'que_es': {},
        'error': ''
    }
    
    try:
        # Ejecutar el grafo
        grafo = crear_grafo_formal_causal()
        resultado = grafo.invoke(estado_inicial)
        
        print(f"\n{'='*60}")
        print("✅ ANÁLISIS COMPLETADO CON ÉXITO")
        print(f"{'='*60}\n")
        
        return {
            'success': True,
            'analisis': {
                'por_que': {
                    'preceptivas': resultado['preceptivas'],
                    'tecnicas': resultado['tecnicas'],
                    'facultativas': resultado['facultativas'],
                    'progresistas': resultado['progresistas']
                },
                'para_que': resultado['objetivos'],
                'que_es': resultado['que_es']
            }
        }
        
    except Exception as e:
        print(f"\n❌ ERROR EN EL ANÁLISIS: {e}\n")
        return {
            'success': False,
            'error': str(e),
            'analisis': None
        }


# ============================================================================
# TESTING
# ============================================================================
if __name__ == "__main__":
    # Ejemplo de uso
    conjetura_test = """
    Se requiere determinar si un edificio de viviendas de 5 plantas construido en 2010
    cumple con la normativa vigente de eficiencia energética y accesibilidad.
    Los vecinos reportan problemas de humedad en las plantas bajas y ausencia de
    rampa de acceso para personas con movilidad reducida.
    """
    
    resultado = procesar_conjetura(conjetura_test.strip())
    
    if resultado['success']:
        print("\n📊 RESULTADO DEL ANÁLISIS:")
        print(json.dumps(resultado['analisis'], indent=2, ensure_ascii=False))
    else:
        print(f"\n❌ Error: {resultado['error']}")
