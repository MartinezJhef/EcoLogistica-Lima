"""Durable export jobs. The worker claims a job with a database row lock."""
from io import BytesIO
from xml.sax.saxutils import escape
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from app.models.sustainability import SustainabilityExport


def render_pdf(data, kind):
    output = BytesIO()
    styles = getSampleStyleSheet()
    story = [Paragraph('EcoLogística Lima — ' + ('Compensación' if kind == 'COMPENSACION' else 'Sostenibilidad y costos'), styles['Title']),
             Paragraph(escape(f"Periodo: {data['desde']} a {data['hasta']}"), styles['Normal']), Spacer(1, 14)]
    if kind == 'COMPENSACION':
        story.append(Paragraph(escape(data['aviso']), styles['Normal']))
        rows = [['CO2 estimado (kg)', str(data['co2_kg'])], ['Créditos estimados', str(data['creditos'])],
                ['Árboles estimados', str(data['arboles'])], ['Horizonte (años)', str(data['parametros']['horizonte_anios'])]]
        for project in data['proyectos']:
            rows.append([project['nombre'], f"{project['porcentaje']} % / {project['arboles']} árboles"])
        story.append(Paragraph(escape('Fuente: ' + data['parametros']['fuente']), styles['Normal']))
    else:
        story.append(Paragraph(escape(data['metodologia']), styles['Normal']))
        labels = {'rutas': 'Rutas completadas', 'distancia_km': 'Distancia estimada (km)', 'co2_kg': 'CO2 estimado (kg)',
                  'consumo_gal': 'Consumo estimado (gal)', 'energia_kwh': 'Energía estimada (kWh)', 'costo_pen': 'Costo estimado (PEN)'}
        rows = [[label, str(data['totales'][key]) if data['totales'][key] is not None else 'No configurado'] for key, label in labels.items()]
        saving = data.get('ahorro_monetario_pen')
        rows.append(['Ahorro comparativo (PEN; negativo = incremento)',
                     str(saving) if saving is not None else 'No disponible'])
    table = Table([[Paragraph(escape(str(cell)), styles['Normal']) for cell in row] for row in rows], colWidths=[280, 180])
    table.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f0f4ee')), ('VALIGN', (0, 0), (-1, -1), 'TOP'), ('BOTTOMPADDING', (0, 0), (-1, -1), 10)]))
    story.extend([Spacer(1, 12), table])
    if kind != 'COMPENSACION':
        for route in data['detalle']:
            story.extend([Spacer(1, 10), Paragraph(escape(f"Ruta {route['ruta_id']} · {route['fecha']} · {route['distancia_km']} km · {route['co2_kg']} kg CO2 · PEN {route['costo_pen'] if route['costo_pen'] is not None else 'no configurado'}"), styles['Normal'])])
            config = (route.get('parametros') or {}).get('config')
            if config:
                story.append(Paragraph(escape('Parámetros conservados: ' + str(config)), styles['Normal']))
    def footer(canvas, doc):
        canvas.setFont('Helvetica', 8)
        canvas.drawString(45, 25, f'EcoLogística Lima | Página {doc.page} | Estimaciones operativas')
    SimpleDocTemplate(output, title='EcoLogística Lima', leftMargin=45, rightMargin=45).build(story, onFirstPage=footer, onLaterPages=footer)
    return output.getvalue()


def process_next(db):
    job = db.query(SustainabilityExport).filter(SustainabilityExport.status == 'PENDIENTE').order_by(
        SustainabilityExport.created_at).with_for_update(skip_locked=True).first()
    if not job:
        return False
    # A crash rolls the transaction back to PENDIENTE, allowing another worker to resume.
    try:
        job.document = render_pdf(job.data, job.kind)
        job.status, job.error = 'LISTO', None
    except Exception:
        job.status, job.error = 'ERROR', 'No se pudo generar el PDF; reintenta la solicitud.'
    db.commit()
    return True
