import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../theme/apple_theme.dart';
import '../models/pedido_mobile_model.dart';

/// Modo de visualización de la ruta en el mapa GPS
enum ModoRutaGps {
  conductorAOrigen, // Línea entrecortada ROJA: Conductor -> Punto A
  enOrigen, // Llegó al Punto A (esperando recepción y foto)
  origenADestino, // Línea entrecortada VERDE: Punto A -> Punto B
  vistaCompleta, // Muestra todos los puntos
}

/// Mapa interactivo vectorial optimizado para Lima Metropolitana
/// con soporte de zoom dinámico, líneas entrecortadas animadas (roja y verde),
/// marcadores físicos y visualización de telemetría de ruta.
class InteractiveGpsMap extends StatefulWidget {
  final PedidoMobileModel pedido;
  final ModoRutaGps modoRuta;
  final double height;
  final bool interactivo;
  final String? etiquetaEstado;

  const InteractiveGpsMap({
    super.key,
    required this.pedido,
    this.modoRuta = ModoRutaGps.conductorAOrigen,
    this.height = 320,
    this.interactivo = true,
    this.etiquetaEstado,
  });

  @override
  State<InteractiveGpsMap> createState() => _InteractiveGpsMapState();
}

class _InteractiveGpsMapState extends State<InteractiveGpsMap>
    with SingleTickerProviderStateMixin {
  late AnimationController _animController;
  final TransformationController _transformController = TransformationController();

  @override
  void initState() {
    super.initState();
    // Controlador de animación para el flujo de las líneas entrecortadas (dash animation)
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();
  }

  @override
  void dispose() {
    _animController.dispose();
    _transformController.dispose();
    super.dispose();
  }

  void _resetZoom() {
    _transformController.value = Matrix4.identity();
  }

  @override
  Widget build(BuildContext context) {
    final bool esFaseRoja = widget.modoRuta == ModoRutaGps.conductorAOrigen;
    final bool esFaseVerde = widget.modoRuta == ModoRutaGps.origenADestino;

    return Container(
      height: widget.height,
      decoration: BoxDecoration(
        color: const Color(0xFF131714),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: esFaseRoja
              ? AppleTheme.accentRed.withValues(alpha: 0.4)
              : (esFaseVerde
                  ? AppleTheme.accentGreen.withValues(alpha: 0.4)
                  : AppleTheme.borderSubtle),
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.4),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Stack(
        children: [
          // Mapa Vectorial Renderizado con CustomPainter
          AnimatedBuilder(
            animation: _animController,
            builder: (context, child) {
              final mapWidget = CustomPaint(
                painter: _LimaGpsMapPainter(
                  pedido: widget.pedido,
                  modoRuta: widget.modoRuta,
                  animValue: _animController.value,
                ),
                child: SizedBox(
                  width: double.infinity,
                  height: widget.height,
                ),
              );

              if (widget.interactivo) {
                return InteractiveViewer(
                  transformationController: _transformController,
                  minScale: 0.8,
                  maxScale: 3.5,
                  child: mapWidget,
                );
              }
              return mapWidget;
            },
          ),

          // Badge Superior de Estado y Modo de Navegación
          Positioned(
            top: 12,
            left: 12,
            right: 12,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Etiqueta de Fase
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.75),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: esFaseRoja
                          ? AppleTheme.accentRed
                          : (esFaseVerde ? AppleTheme.accentGreen : AppleTheme.accentCyan),
                      width: 1.2,
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(
                          color: esFaseRoja
                              ? AppleTheme.accentRed
                              : (esFaseVerde ? AppleTheme.accentGreen : AppleTheme.accentCyan),
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        widget.etiquetaEstado ??
                            (esFaseRoja
                                ? 'Ruta a Recojo (Línea Roja)'
                                : (esFaseVerde
                                    ? 'Ruta a Destino (Línea Verde)'
                                    : 'En Punto A · Recojo')),
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: esFaseRoja
                              ? AppleTheme.accentRed
                              : (esFaseVerde ? AppleTheme.accentGreen : AppleTheme.textPrimary),
                        ),
                      ),
                    ],
                  ),
                ),

                // Botón de reajuste de Zoom / Orientación
                if (widget.interactivo)
                  GestureDetector(
                    onTap: _resetZoom,
                    child: Container(
                      padding: const EdgeInsets.all(7),
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.75),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
                      ),
                      child: const Icon(
                        CupertinoIcons.location_north_fill,
                        size: 16,
                        color: AppleTheme.textPrimary,
                      ),
                    ),
                  ),
              ],
            ),
          ),

          // Leyenda Inferior de Telemetría Dinámica en Tiempo Real
          Positioned(
            bottom: 12,
            left: 12,
            right: 12,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xDD141814),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildMiniStat(
                    label: esFaseRoja ? 'Al Recojo (A)' : 'Al Destino (B)',
                    value: esFaseRoja
                        ? '${widget.pedido.distanciaHaciaOrigenKm} km'
                        : '${widget.pedido.distanciaKm} km',
                    icon: CupertinoIcons.arrow_right_arrow_left,
                    color: esFaseRoja ? AppleTheme.accentRed : AppleTheme.accentGreen,
                  ),
                  _buildMiniStat(
                    label: 'ETA Aprox.',
                    value: esFaseRoja
                        ? '${widget.pedido.tiempoHaciaOrigenMin} min'
                        : '${widget.pedido.tiempoEstimadoMinutos} min',
                    icon: CupertinoIcons.clock,
                    color: AppleTheme.accentCyan,
                  ),
                  _buildMiniStat(
                    label: 'Eficiencia',
                    value: '${widget.pedido.consumoKmGal} km/gal',
                    icon: CupertinoIcons.leaf_arrow_circlepath,
                    color: AppleTheme.accentGreen,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMiniStat({
    required String label,
    required String value,
    required IconData icon,
    required Color color,
  }) {
    return Row(
      children: [
        Icon(icon, size: 14, color: color),
        const SizedBox(width: 5),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              value,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: AppleTheme.textPrimary,
              ),
            ),
            Text(
              label,
              style: const TextStyle(
                fontSize: 9,
                color: AppleTheme.textSecondary,
              ),
            ),
          ],
        ),
      ],
    );
  }
}

/// CustomPainter que proyecta las coordenadas geográficas de Lima Metropolitana
/// y dibuja las vías, la costa, los marcadores y las líneas entrecortadas activas
class _LimaGpsMapPainter extends CustomPainter {
  final PedidoMobileModel pedido;
  final ModoRutaGps modoRuta;
  final double animValue;

  _LimaGpsMapPainter({
    required this.pedido,
    required this.modoRuta,
    required this.animValue,
  });

  // Delimitación geográfica de Lima Metropolitana
  // Lat: ~ -12.16 (Sur: Chorrillos/Miraflores) a -11.95 (Norte: SJL / Comas)
  // Lng: ~ -77.16 (Oeste: Callao / Costa) a -76.92 (Este: Ate / Vitarte)
  static const double minLat = -12.18;
  static const double maxLat = -11.95;
  static const double minLng = -77.15;
  static const double maxLng = -76.94;

  Offset _coordToOffset(double lat, double lng, Size size) {
    // Proyección de Mercator simplificada a plano 2D
    final double normX = (lng - minLng) / (maxLng - minLng);
    final double normY = (maxLat - lat) / (maxLat - minLat); // Latitud invertida en pantalla

    // Márgenes seguros
    final double safeX = normX.clamp(0.05, 0.95);
    final double safeY = normY.clamp(0.05, 0.95);

    return Offset(safeX * size.width, safeY * size.height);
  }

  @override
  void paint(Canvas canvas, Size size) {
    _dibujarFondoYGrid(canvas, size);
    _dibujarCostaPacifica(canvas, size);
    _dibujarAvenidasPrincipales(canvas, size);

    // Calcular puntos de pantalla
    final Offset posConductor = _coordToOffset(pedido.conductorLat, pedido.conductorLng, size);
    final Offset posOrigenA = _coordToOffset(pedido.origenLat, pedido.origenLng, size);
    final Offset posDestinoB = _coordToOffset(pedido.destinoLat, pedido.destinoLng, size);

    // 1. Fase Conductor -> Punto A: Línea entrecortada ROJA
    if (modoRuta == ModoRutaGps.conductorAOrigen || modoRuta == ModoRutaGps.vistaCompleta) {
      _dibujarRutaEntrecortada(
        canvas: canvas,
        inicio: posConductor,
        fin: posOrigenA,
        color: const Color(0xFFFF453A), // Rojo vibrante Apple
        animOffset: animValue,
        curvaturaOffset: 12.0,
      );
    }

    // 2. Fase Punto A -> Punto B: Línea entrecortada VERDE
    if (modoRuta == ModoRutaGps.origenADestino || modoRuta == ModoRutaGps.vistaCompleta) {
      _dibujarRutaEntrecortada(
        canvas: canvas,
        inicio: posOrigenA,
        fin: posDestinoB,
        color: const Color(0xFF30D158), // Verde vibrante Apple
        animOffset: animValue,
        curvaturaOffset: -18.0,
      );
    }

    // 3. Dibujar Marcadores Físicos
    _dibujarMarcadorOrigen(canvas, posOrigenA);
    _dibujarMarcadorDestino(canvas, posDestinoB);
    _dibujarMarcadorConductor(canvas, modoRuta == ModoRutaGps.origenADestino ? posOrigenA : posConductor);
  }

  void _dibujarFondoYGrid(Canvas canvas, Size size) {
    // Fondo de asfalto nocturno
    final fondoPaint = Paint()..color = const Color(0xFF141A16);
    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height), fondoPaint);

    // Malla de calles secundarias (cuadrícula sutil)
    final gridPaint = Paint()
      ..color = const Color(0xFF1F2922)
      ..strokeWidth = 0.8;

    const double step = 28.0;
    for (double x = 0; x < size.width; x += step) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), gridPaint);
    }
    for (double y = 0; y < size.height; y += step) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), gridPaint);
    }
  }

  void _dibujarCostaPacifica(Canvas canvas, Size size) {
    // Dibujo del litoral y Océano Pacífico (Callao - Costa Verde - Chorrillos)
    final marPaint = Paint()..color = const Color(0xFF0F1B22);
    final costaPath = Path();

    costaPath.moveTo(0, size.height * 0.25);
    costaPath.quadraticBezierTo(
      size.width * 0.18, size.height * 0.45,
      size.width * 0.25, size.height * 0.65,
    );
    costaPath.quadraticBezierTo(
      size.width * 0.35, size.height * 0.85,
      size.width * 0.42, size.height,
    );
    costaPath.lineTo(0, size.height);
    costaPath.close();

    canvas.drawPath(costaPath, marPaint);

    // Borde de la costa con glow
    final costaBorde = Paint()
      ..color = const Color(0xFF224455).withValues(alpha: 0.6)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;
    canvas.drawPath(costaPath, costaBorde);
  }

  void _dibujarAvenidasPrincipales(Canvas canvas, Size size) {
    final arterialPaint = Paint()
      ..color = const Color(0xFF2B3A2F)
      ..strokeWidth = 3.5
      ..strokeCap = StrokeCap.round;

    // Panamericana Norte / Sur (Eje vertebral)
    final ejePanamericana = Path();
    ejePanamericana.moveTo(size.width * 0.65, 0);
    ejePanamericana.quadraticBezierTo(
      size.width * 0.52, size.height * 0.48,
      size.width * 0.70, size.height,
    );
    canvas.drawPath(ejePanamericana, arterialPaint);

    // Vía de Evitamiento / Av. Argentina
    final ejeArgentina = Path();
    ejeArgentina.moveTo(size.width * 0.15, size.height * 0.38);
    ejeArgentina.lineTo(size.width * 0.85, size.height * 0.42);
    canvas.drawPath(ejeArgentina, arterialPaint);

    // Av. Javier Prado
    final ejeJavierPrado = Path();
    ejeJavierPrado.moveTo(size.width * 0.25, size.height * 0.72);
    ejeJavierPrado.lineTo(size.width * 0.90, size.height * 0.68);
    canvas.drawPath(ejeJavierPrado, arterialPaint);

    // Av. Próceres de la Independencia (Hacia SJL)
    final ejeSJL = Path();
    ejeSJL.moveTo(size.width * 0.55, size.height * 0.42);
    ejeSJL.lineTo(size.width * 0.78, size.height * 0.12);
    canvas.drawPath(ejeSJL, arterialPaint);
  }

  void _dibujarRutaEntrecortada({
    required Canvas canvas,
    required Offset inicio,
    required Offset fin,
    required Color color,
    required double animOffset,
    required double curvaturaOffset,
  }) {
    // Generar curva realista entre dos puntos con curvatura urbana
    final controlPoint = Offset(
      (inicio.dx + fin.dx) / 2 + curvaturaOffset,
      (inicio.dy + fin.dy) / 2 - curvaturaOffset,
    );

    final path = Path();
    path.moveTo(inicio.dx, inicio.dy);
    path.quadraticBezierTo(controlPoint.dx, controlPoint.dy, fin.dx, fin.dy);

    // 1. Resplandor exterior (Glow)
    final glowPaint = Paint()
      ..color = color.withValues(alpha: 0.3)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 7.0
      ..strokeCap = StrokeCap.round
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 4.0);
    canvas.drawPath(path, glowPaint);

    // 2. Línea Entrecortada Dinámica (Dashed Line)
    final metricas = path.computeMetrics().toList();
    if (metricas.isEmpty) return;

    final dashPaint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3.5
      ..strokeCap = StrokeCap.round;

    const double dashLength = 8.0;
    const double gapLength = 6.0;
    final double cycleLength = dashLength + gapLength;

    for (final metrica in metricas) {
      final double totalLength = metrica.length;
      final double initialShift = (animOffset * cycleLength) % cycleLength;

      double currentDistance = initialShift;
      while (currentDistance < totalLength) {
        final double end = (currentDistance + dashLength).clamp(0.0, totalLength);
        final subPath = metrica.extractPath(currentDistance, end);
        canvas.drawPath(subPath, dashPaint);
        currentDistance += cycleLength;
      }
    }
  }

  void _dibujarMarcadorOrigen(Canvas canvas, Offset pos) {
    // Pin de Punto A (Origen / Recepción del paquete)
    final pinGlow = Paint()
      ..color = AppleTheme.accentCyan.withValues(alpha: 0.35)
      ..style = PaintingStyle.fill;
    canvas.drawCircle(pos, 16, pinGlow);

    final pinBase = Paint()
      ..color = AppleTheme.accentCyan
      ..style = PaintingStyle.fill;
    canvas.drawCircle(pos, 9, pinBase);

    final pinInner = Paint()
      ..color = Colors.black
      ..style = PaintingStyle.fill;
    canvas.drawCircle(pos, 4, pinInner);

    // Texto descriptivo Punto A
    _dibujarTextoEtiqueta(canvas, 'Punto A (Recojo)', pos + const Offset(12, -8), AppleTheme.accentCyan);
  }

  void _dibujarMarcadorDestino(Canvas canvas, Offset pos) {
    // Pin de Punto B (Destino Final de Entrega)
    final pinGlow = Paint()
      ..color = AppleTheme.accentGreen.withValues(alpha: 0.35)
      ..style = PaintingStyle.fill;
    canvas.drawCircle(pos, 16, pinGlow);

    final pinBase = Paint()
      ..color = AppleTheme.accentGreen
      ..style = PaintingStyle.fill;
    canvas.drawCircle(pos, 9, pinBase);

    final pinInner = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;
    canvas.drawCircle(pos, 4, pinInner);

    // Texto descriptivo Punto B
    _dibujarTextoEtiqueta(canvas, 'Punto B (Entrega)', pos + const Offset(12, -8), AppleTheme.accentGreen);
  }

  void _dibujarMarcadorConductor(Canvas canvas, Offset pos) {
    // Marcador del Conductor / Repartidor (Vehículo de Flota EcoLogística)
    final pulseGlow = Paint()
      ..color = const Color(0xFFFF9F0A).withValues(alpha: 0.3)
      ..style = PaintingStyle.fill;
    canvas.drawCircle(pos, 18, pulseGlow);

    final autoPaint = Paint()
      ..color = const Color(0xFFFF9F0A)
      ..style = PaintingStyle.fill;
    canvas.drawCircle(pos, 10, autoPaint);

    final centroPaint = Paint()
      ..color = Colors.black
      ..style = PaintingStyle.fill;
    canvas.drawCircle(pos, 4.5, centroPaint);

    _dibujarTextoEtiqueta(canvas, 'Tu Vehículo', pos + const Offset(12, 10), const Color(0xFFFF9F0A));
  }

  void _dibujarTextoEtiqueta(Canvas canvas, String texto, Offset pos, Color color) {
    final textSpan = TextSpan(
      text: texto,
      style: TextStyle(
        color: color,
        fontSize: 10,
        fontWeight: FontWeight.w800,
        backgroundColor: Colors.black.withValues(alpha: 0.7),
      ),
    );
    final textPainter = TextPainter(
      text: textSpan,
      textDirection: TextDirection.ltr,
    );
    textPainter.layout();
    textPainter.paint(canvas, pos);
  }

  @override
  bool shouldRepaint(covariant _LimaGpsMapPainter oldDelegate) {
    return oldDelegate.animValue != animValue ||
        oldDelegate.modoRuta != modoRuta ||
        oldDelegate.pedido != pedido;
  }
}
