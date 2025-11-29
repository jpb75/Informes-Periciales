from flask import Flask, render_template, request, jsonify, session, redirect, url_for
import os
from datetime import datetime
import uuid

# Importar el agente de LangGraph
from agentes import procesar_conjetura

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'

# Almacenamiento temporal de informes (en producción usar base de datos)
informes_generados = {}

@app.route('/')
def index():
    """Renderiza la página principal"""
    return render_template('index.html')

@app.route('/iniciar-informe', methods=['POST'])
def iniciar_informe():
    """
    Endpoint para iniciar un nuevo informe guardando la conjetura.
    Redirige a la página de revisión donde se procesará con el agente.
    """
    data = request.get_json()
    conjetura = data.get('conjetura', '')
    
    if not conjetura or len(conjetura.strip()) < 10:
        return jsonify({
            'success': False,
            'message': 'La conjetura debe tener al menos 10 caracteres.'
        }), 400
    
    # Generar ID único para el informe
    informe_id = str(uuid.uuid4())
    
    # Guardar solo la conjetura inicialmente
    informes_generados[informe_id] = {
        'conjetura': conjetura,
        'analisis': None,
        'informe_generado': False
    }
    
    return jsonify({
        'success': True,
        'message': 'Redirigiendo a revisión...',
        'informe_id': informe_id,
        'redirect_url': f'/revisar-motivaciones/{informe_id}'
    })

@app.route('/procesar-con-agente/<informe_id>', methods=['POST'])
def procesar_con_agente(informe_id):
    """
    Endpoint para iniciar el procesamiento asíncrono con el agente de IA.
    """
    if informe_id not in informes_generados:
        return jsonify({
            'success': False,
            'message': 'Informe no encontrado'
        }), 404
    
    # Inicializar estructura de análisis vacía si no existe
    if not informes_generados[informe_id].get('analisis'):
        informes_generados[informe_id]['analisis'] = {
            'por_que': {
                'preceptivas': [],
                'tecnicas': [],
                'facultativas': [],
                'progresistas': []
            },
            'para_que': [],
            'que_es': {}
        }
    
    return jsonify({
        'success': True,
        'message': 'Procesamiento iniciado'
    })

@app.route('/obtener-paquete/<informe_id>/<paquete>', methods=['GET'])
def obtener_paquete(informe_id, paquete):
    """
    Endpoint para obtener un paquete específico de motivaciones.
    Procesa el paquete si aún no está generado.
    """
    if informe_id not in informes_generados:
        return jsonify({
            'success': False,
            'message': 'Informe no encontrado'
        }), 404
    
    try:
        conjetura = informes_generados[informe_id]['conjetura']
        analisis = informes_generados[informe_id]['analisis']
        
        # Verificar si el paquete ya fue generado
        if paquete in ['preceptivas', 'tecnicas', 'facultativas', 'progresistas']:
            if analisis['por_que'][paquete]:
                return jsonify({
                    'success': True,
                    'paquete': paquete,
                    'motivaciones': analisis['por_que'][paquete],
                    'cached': True
                })
            
            # Generar el paquete específico
            from agentes.formal_causal_agent import get_llm, safe_llm_call
            from agentes.formal_causal_agent import (
                PROMPT_PRECEPTIVAS, PROMPT_TECNICAS, 
                PROMPT_FACULTATIVAS, PROMPT_PROGRESISTAS
            )
            
            llm = get_llm()
            prompts = {
                'preceptivas': PROMPT_PRECEPTIVAS,
                'tecnicas': PROMPT_TECNICAS,
                'facultativas': PROMPT_FACULTATIVAS,
                'progresistas': PROMPT_PROGRESISTAS
            }
            
            prompt = prompts[paquete].format(conjetura=conjetura)
            result = safe_llm_call(llm, prompt, {paquete: []})
            motivaciones = result.get(paquete, [])
            
            # Guardar en memoria
            analisis['por_que'][paquete] = motivaciones
            
            return jsonify({
                'success': True,
                'paquete': paquete,
                'motivaciones': motivaciones,
                'cached': False
            })
            
        elif paquete == 'objetivos':
            if analisis['para_que']:
                return jsonify({
                    'success': True,
                    'paquete': 'objetivos',
                    'objetivos': analisis['para_que'],
                    'cached': True
                })
            
            # Generar objetivos
            from agentes.formal_causal_agent import get_llm, safe_llm_call, PROMPT_OBJETIVOS
            import json
            
            llm = get_llm()
            preceptivas_str = json.dumps(analisis['por_que']['preceptivas'], indent=2, ensure_ascii=False)
            tecnicas_str = json.dumps(analisis['por_que']['tecnicas'], indent=2, ensure_ascii=False)
            facultativas_str = json.dumps(analisis['por_que']['facultativas'], indent=2, ensure_ascii=False)
            progresistas_str = json.dumps(analisis['por_que']['progresistas'], indent=2, ensure_ascii=False)
            
            prompt = PROMPT_OBJETIVOS.format(
                conjetura=conjetura,
                preceptivas=preceptivas_str,
                tecnicas=tecnicas_str,
                facultativas=facultativas_str,
                progresistas=progresistas_str
            )
            
            result = safe_llm_call(llm, prompt, {"para_que": []})
            objetivos = result.get('para_que', [])
            analisis['para_que'] = objetivos
            
            return jsonify({
                'success': True,
                'paquete': 'objetivos',
                'objetivos': objetivos,
                'cached': False
            })
            
        elif paquete == 'que_es':
            if analisis['que_es']:
                return jsonify({
                    'success': True,
                    'paquete': 'que_es',
                    'definicion': analisis['que_es'],
                    'cached': True
                })
            
            # Generar qué es
            from agentes.formal_causal_agent import get_llm, safe_llm_call, PROMPT_QUE_ES
            import json
            
            llm = get_llm()
            preceptivas_str = json.dumps(analisis['por_que']['preceptivas'], indent=2, ensure_ascii=False)
            tecnicas_str = json.dumps(analisis['por_que']['tecnicas'], indent=2, ensure_ascii=False)
            facultativas_str = json.dumps(analisis['por_que']['facultativas'], indent=2, ensure_ascii=False)
            progresistas_str = json.dumps(analisis['por_que']['progresistas'], indent=2, ensure_ascii=False)
            objetivos_str = json.dumps(analisis['para_que'], indent=2, ensure_ascii=False)
            
            prompt = PROMPT_QUE_ES.format(
                conjetura=conjetura,
                preceptivas=preceptivas_str,
                tecnicas=tecnicas_str,
                facultativas=facultativas_str,
                progresistas=progresistas_str,
                objetivos=objetivos_str
            )
            
            result = safe_llm_call(llm, prompt, {"que_es": {}})
            definicion = result.get('que_es', {})
            analisis['que_es'] = definicion
            
            return jsonify({
                'success': True,
                'paquete': 'que_es',
                'definicion': definicion,
                'cached': False
            })
        
        return jsonify({
            'success': False,
            'message': 'Paquete no reconocido'
        }), 400
        
    except Exception as e:
        print(f"Error al obtener paquete {paquete}: {e}")
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

@app.route('/revisar-motivaciones/<informe_id>')
def revisar_motivaciones(informe_id):
    """Página para revisar y editar motivaciones antes de generar el informe"""
    if informe_id not in informes_generados:
        return redirect(url_for('index'))
    
    data = informes_generados[informe_id]
    return render_template('revisar_motivaciones.html', 
                         informe_id=informe_id,
                         conjetura=data['conjetura'],
                         analisis_data=data.get('analisis'))

@app.route('/guardar-motivacion', methods=['POST'])
def guardar_motivacion():
    """Guardar una motivación editada"""
    data = request.get_json()
    informe_id = data.get('informe_id')
    paquete = data.get('paquete')
    indice = data.get('indice')
    motivacion = data.get('motivacion')
    
    if informe_id not in informes_generados:
        return jsonify({
            'success': False,
            'message': 'Informe no encontrado'
        }), 404
    
    try:
        # Actualizar la motivación en memoria
        analisis = informes_generados[informe_id]['analisis']
        analisis['por_que'][paquete][indice] = motivacion
        
        return jsonify({
            'success': True,
            'message': 'Motivación guardada correctamente'
        })
    except Exception as e:
        print(f"Error al guardar motivación: {e}")
        return jsonify({
            'success': False,
            'message': f'Error al guardar: {str(e)}'
        }), 500

@app.route('/generar-informe-final', methods=['POST'])
def generar_informe_final():
    """Generar el informe final después de revisar las motivaciones"""
    data = request.get_json()
    informe_id = data.get('informe_id')
    
    if informe_id not in informes_generados:
        return jsonify({
            'success': False,
            'message': 'Informe no encontrado'
        }), 404
    
    try:
        datos = informes_generados[informe_id]
        
        # Generar el informe completo con las motivaciones revisadas
        informe_data = generar_informe_con_ia(datos['conjetura'], datos['analisis'])
        
        # Reemplazar los datos con el informe completo
        informes_generados[informe_id] = informe_data
        informes_generados[informe_id]['informe_generado'] = True
        
        return jsonify({
            'success': True,
            'message': 'Informe generado correctamente'
        })
    except Exception as e:
        print(f"Error al generar informe final: {e}")
        return jsonify({
            'success': False,
            'message': f'Error al generar informe: {str(e)}'
        }), 500

@app.route('/informe/<informe_id>')
def ver_informe(informe_id):
    """Mostrar el informe generado"""
    if informe_id not in informes_generados:
        return redirect(url_for('index'))
    
    informe_data = informes_generados[informe_id]
    
    # Si el informe no ha sido generado aún, redirigir a revisión
    if not informe_data.get('informe_generado', True):
        return redirect(url_for('revisar_motivaciones', informe_id=informe_id))
    
    return render_template('informe.html', informe=informe_data, informe_id=informe_id)

@app.route('/mapa-conceptual/<informe_id>')
def ver_mapa_conceptual(informe_id):
    """Mostrar el mapa conceptual del informe"""
    if informe_id not in informes_generados:
        return redirect(url_for('index'))
    
    informe_data = informes_generados[informe_id]
    return render_template('mapa_conceptual_v2.html', informe=informe_data, informe_id=informe_id)

@app.route('/metodo-formal-causal')
def metodo_info():
    """Información sobre el método formal causal"""
    metodo = {
        'nombre': 'Método Formal Causal',
        'fases': [
            {
                'pregunta': '¿Por qué?',
                'tipos': [
                    {'nombre': 'Preceptivas', 'descripcion': 'Surgen del propio enunciado del problema'},
                    {'nombre': 'Técnicas', 'descripcion': 'Implícitas en el problema (leyes, normas, etc.)'},
                    {'nombre': 'Facultativas', 'descripcion': 'Motivan al autor a resolver el problema'},
                    {'nombre': 'Progresistas', 'descripcion': 'Aportación al conocimiento actual'}
                ]
            },
            {
                'pregunta': '¿Para qué?',
                'descripcion': 'Se relacionan con sus respectivos por qué'
            },
            {
                'pregunta': '¿Qué es?',
                'descripcion': 'Definición y contextualización del problema'
            }
        ]
    }
    return jsonify(metodo)

def generar_informe_con_ia(conjetura: str, analisis: dict):
    """
    Genera un informe completo usando el análisis del agente de IA
    
    Args:
        conjetura: Texto de la conjetura inicial
        analisis: Diccionario con el análisis generado por el agente (por_que, para_que, que_es)
    """
    fecha_actual = datetime.now().strftime('%d de %B de %Y')
    
    return {
        'numero_expediente': f'EXP-{datetime.now().strftime("%Y%m%d")}-{uuid.uuid4().hex[:6].upper()}',
        'fecha_elaboracion': fecha_actual,
        'conjetura': conjetura,
        
        'perito': {
            'nombre': 'Dr./Dra. [NOMBRE DEL PERITO]',
            'dni': '[DNI/NIE]',
            'direccion': '[Dirección profesional completa]',
            'telefono': '[Teléfono de contacto]',
            'email': '[email@ejemplo.com]',
            'titulo': '[Título profesional]',
            'especialidad': '[Especialidad del perito]',
            'num_colegiado': '[Número de colegiado]',
            'experiencia': 'El perito cuenta con [X] años de experiencia en el ámbito de [especialidad], habiendo realizado numerosos informes periciales en casos similares. [Añadir más detalles relevantes sobre la experiencia].',
            'juramento': 'Juro o prometo, por mi conciencia y honor, que ejerceré fielmente el cargo de perito, desempeñando mis funciones con imparcialidad y objetividad, cumpliendo con los deberes inherentes al mismo.'
        },
        
        'solicitante': {
            'nombre': '[Nombre del solicitante / Juzgado]',
            'representacion': '[Abogado/Procurador o tipo de representación]',
            'domicilio': '[Domicilio del solicitante]',
            'tipo_encargo': '[Judicial / Extrajudicial / Particular]'
        },
        
        'descripcion': {
            'hecho': f'El presente informe pericial tiene por objeto analizar y determinar los aspectos técnicos relacionados con la siguiente conjetura: "{conjetura}". Se procederá a realizar un análisis exhaustivo aplicando el Método Formal Causal para garantizar la fundamentación de las conclusiones.',
            'fecha_lugar': '[Fecha y lugar del suceso si aplica]',
            'alcance': 'El alcance del presente informe pericial comprende el análisis técnico y científico de todos los aspectos relevantes relacionados con la conjetura planteada, aplicando la metodología del Método Formal Causal para establecer las motivaciones (preceptivas, técnicas, facultativas y progresistas), los objetivos (para qué) y la definición precisa del problema (qué es).'
        },
        
        'antecedentes': {
            'hechos_previos': 'Con carácter previo al presente análisis, se han identificado los siguientes hechos relevantes que constituyen el contexto de la pericia. Se establecen a continuación los antecedentes fácticos que resultan de aplicación al caso objeto de estudio.',
            'documentacion': [
                'Documentación aportada por el solicitante',
                'Normativa técnica aplicable',
                'Informes previos (si los hubiere)',
                'Fotografías y material gráfico',
                'Otra documentación relevante'
            ],
            'normativa': 'Normativa legal y técnica aplicable al caso según el análisis realizado y el ámbito de aplicación correspondiente.'
        },
        
        'metodologia': {
            'tecnicas': [
                'Aplicación del Método Formal Causal',
                'Análisis documental exhaustivo',
                'Inspección técnica (si procede)',
                'Análisis normativo aplicable',
                'Consulta de fuentes técnicas y científicas especializadas'
            ],
            'criterios': 'Los criterios de valoración empleados se basan en principios de objetividad, imparcialidad y rigor científico-técnico, aplicando las mejores prácticas profesionales del sector y la normativa vigente aplicable al caso.',
            'normas': 'Normas técnicas, legales y reglamentarias específicas aplicadas en el análisis según corresponda.',
            'herramientas': [
                'Sistema de Informes Periciales',
                'Software de análisis técnico especializado',
                'Bases de datos jurídicas y técnicas',
                'Herramientas de medición y cálculo (si aplica)'
            ]
        },
        
        'analisis': {
            'por_que': analisis['por_que'],  # Datos generados por la IA
            'para_que': analisis['para_que'],  # Datos generados por la IA
            'que_es': analisis['que_es'],  # Datos generados por la IA
            'inspecciones': 'Descripción detallada de las inspecciones realizadas, metodología empleada, condiciones de la inspección y observaciones relevantes.',
            'resultados': 'Presentación de resultados técnicos, cálculos realizados, mediciones obtenidas y datos cuantitativos relevantes para el análisis.',
            'evaluacion': 'Evaluación objetiva de los resultados obtenidos, contrastándolos con los estándares técnicos aplicables y la normativa vigente.'
        },
        
        'conclusiones': {
            'respuestas': [
                'Primera conclusión técnica fundamentada en el análisis realizado.',
                'Segunda conclusión técnica fundamentada en los resultados obtenidos.',
                'Tercera conclusión técnica basada en la evaluación de los elementos probatorios.',
                'Conclusiones adicionales según el desarrollo del análisis pericial.'
            ],
            'opinion_tecnica': 'Opinión técnica profesional del perito sobre el caso analizado, fundamentada en el análisis realizado y en su experiencia profesional, estableciendo de forma clara y precisa su valoración técnica del caso.',
            'recomendaciones': [
                'Recomendación técnica basada en las conclusiones del análisis.',
                'Recomendación profesional derivada de los hallazgos del informe.'
            ]
        },
        
        'anexos': [
            'Documentación fotográfica',
            'Planos y esquemas técnicos',
            'Cálculos y tablas detalladas',
            'Normativa aplicable (textos completos)',
            'Otra documentación de referencia'
        ],
        
        'firma': {
            'lugar': '[Ciudad]',
            'fecha': fecha_actual
        }
    }


def generar_informe_demo(conjetura):
    """
    Genera datos de demostración para el informe (BACKUP)
    Esta función se mantiene como respaldo en caso de que falle la IA
    """
    fecha_actual = datetime.now().strftime('%d de %B de %Y')
    
    # Análisis básico de respaldo
    analisis_demo = {
        'por_que': {
            'preceptivas': [
                {
                    'titulo': 'Análisis del enunciado del problema',
                    'contenido': 'Estudio detallado de los elementos esenciales del problema tal como ha sido formulado.'
                }
            ],
            'tecnicas': [
                {
                    'titulo': 'Marco normativo aplicable',
                    'contenido': 'Identificación de leyes, normas técnicas y estándares profesionales aplicables.'
                }
            ],
            'facultativas': [
                {
                    'titulo': 'Interés profesional en el caso',
                    'contenido': 'Motivación del perito para aplicar conocimientos especializados.'
                }
            ],
            'progresistas': [
                {
                    'titulo': 'Aportación al conocimiento técnico',
                    'contenido': 'Identificación de aspectos novedosos del caso.'
                }
            ]
        },
        'para_que': [
            {
                'titulo': 'Establecer la verdad técnica de los hechos',
                'tipo': 'preceptivas',
                'contenido': 'Determinar con precisión la naturaleza de los hechos.'
            }
        ],
        'que_es': {
            'contenido': 'Definición precisa del problema objeto de análisis.',
            'contexto': 'Contextualización del problema dentro del marco técnico aplicable.'
        }
    }
    
    return generar_informe_con_ia(conjetura, analisis_demo)


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
