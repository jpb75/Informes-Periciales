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

@app.route('/procesar-conjetura', methods=['POST'])
def procesar_conjetura_endpoint():
    """
    Endpoint para procesar la conjetura inicial usando el agente de IA.
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
    
    try:
        # Procesar conjetura con el agente de LangGraph + Ollama
        resultado_agente = procesar_conjetura(conjetura)
        
        if not resultado_agente['success']:
            return jsonify({
                'success': False,
                'message': f'Error al procesar la conjetura: {resultado_agente.get("error", "Error desconocido")}'
            }), 500
        
        # Construir informe completo con el análisis del agente
        informe_data = generar_informe_con_ia(conjetura, resultado_agente['analisis'])
        
        # Guardar el informe temporalmente
        informes_generados[informe_id] = informe_data
        
        return jsonify({
            'success': True,
            'message': 'Informe generado correctamente con IA.',
            'informe_id': informe_id
        })
        
    except Exception as e:
        print(f"Error al procesar conjetura: {e}")
        return jsonify({
            'success': False,
            'message': f'Error interno al procesar la conjetura: {str(e)}'
        }), 500

@app.route('/informe/<informe_id>')
def ver_informe(informe_id):
    """Mostrar el informe generado"""
    if informe_id not in informes_generados:
        return redirect(url_for('index'))
    
    informe_data = informes_generados[informe_id]
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
