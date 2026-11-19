import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import '../services/itinerary_service.dart';
import '../services/local_db_service.dart';
import '../services/sync_service.dart';

class ItineraryPanel extends StatefulWidget {
  final String? driverId;
  const ItineraryPanel({super.key, this.driverId});
  @override
  State<ItineraryPanel> createState() => _ItineraryPanelState();
}

class _ItineraryPanelState extends State<ItineraryPanel> {
  Timer? _timer;
  bool _busy = false;
  String _status = 'Consultando itinerario…';
  List<Map<String, dynamic>> _routes = [];
  @override
  void initState() {
    super.initState();
    _refresh();
    _timer = Timer.periodic(const Duration(seconds: 30), (_) => _refresh());
  }
  @override
  void dispose() { _timer?.cancel(); super.dispose(); }

  Future<void> _refresh() async {
    final id = widget.driverId;
    if (_busy || id == null) return;
    _busy = true;
    try {
      final cached = await ItineraryService.cached(id);
      if (mounted) setState(() => _routes = cached);
      final changed = await ItineraryService.refresh(id);
      final routes = await ItineraryService.cached(id);
      if (mounted) setState(() {
        _routes = routes;
        _status = changed > 0 ? 'Nuevo itinerario recibido y guardado' : 'Itinerario al día';
      });
    } catch (_) {
      if (mounted) setState(() => _status = 'Sin conexión: se conserva el último itinerario. Reintentando cada 30 s.');
    } finally { _busy = false; }
  }

  @override
  Widget build(BuildContext context) {
    if (widget.driverId == null) {
      return const Card(child: Padding(padding: EdgeInsets.all(12), child: Text('Vincula tu cuenta con la ficha de conductor en Administración para recibir tu itinerario.')));
    }
    return Card(child: Padding(padding: const EdgeInsets.all(12), child: Column(
      crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [const Expanded(child: Text('Mi itinerario', style: TextStyle(fontWeight: FontWeight.bold))),
          IconButton(onPressed: _refresh, tooltip: 'Actualizar itinerario', icon: const Icon(Icons.refresh))]),
        Text(_status, semanticsLabel: _status),
        for (final route in _routes) ExpansionTile(
          title: Text('${route['estado']} · ${route['distancia_total_km']} km · ${route['tiempo_total_min']} min'),
          children: [
            if (route['estado'] == 'EN_EJECUCION' && (route['tramos'] as List).where((s) => s['pedido_id'] != null)
                .every((s) => ['ENTREGADO','NO_ENTREGADO','CANCELADO'].contains(s['estado_pedido'])))
              TextButton(onPressed: () async {
                final queue = await LocalDbService.obtenerColaOutbox();
                if (!queue.any((t) => t['accion'] == 'FINALIZAR_RUTA' && t['ruta_id'] == route['ruta_id'])) {
                  await LocalDbService.encolarTransaccionOutbox({'accion':'FINALIZAR_RUTA','ruta_id':route['ruta_id']});
                }
                await SyncService.sincronizarSqlHaciaPostgres();
                await _refresh();
              }, child: const Text('Confirmo que regresé al depósito: finalizar ruta')),
            SizedBox(height: 180, width: double.infinity, child: CustomPaint(painter: _RoadPainter(route['tramos'] as List))),
            for (final stop in route['tramos'] as List) ListTile(
              leading: Text('${stop['orden_secuencia']}'), title: Text('${stop['descripcion']}'),
              subtitle: Text('${stop['tiempo_estimado_min']} min · ${stop['co2_tramo_kg']} kg CO₂')),
          ],
        ),
      ],
    )));
  }
}

/// Cached road geometry remains visible without map-tile connectivity.
class _RoadPainter extends CustomPainter {
  final List stops;
  _RoadPainter(this.stops);
  @override
  void paint(Canvas canvas, Size size) {
    final lines = <List<Offset>>[];
    for (final stop in stops) {
      final raw = stop['geometria_linea_geojson'];
      if (raw is! String || raw.isEmpty) continue;
      try {
        final coordinates = jsonDecode(raw)['coordinates'] as List;
        lines.add(coordinates.map((p) => Offset((p[0] as num).toDouble(), (p[1] as num).toDouble())).toList());
      } catch (_) { /* A malformed legacy geometry cannot replace the itinerary text. */ }
    }
    final points = lines.expand((l) => l).toList();
    if (points.isEmpty) return;
    final xs = points.map((p) => p.dx), ys = points.map((p) => p.dy);
    final minX = xs.reduce((a, b) => a < b ? a : b), maxX = xs.reduce((a, b) => a > b ? a : b);
    final minY = ys.reduce((a, b) => a < b ? a : b), maxY = ys.reduce((a, b) => a > b ? a : b);
    Offset project(Offset p) => Offset(12 + (p.dx - minX) / (maxX - minX == 0 ? 1 : maxX - minX) * (size.width - 24),
      size.height - 12 - (p.dy - minY) / (maxY - minY == 0 ? 1 : maxY - minY) * (size.height - 24));
    final paint = Paint()..color = Colors.green..strokeWidth = 3..style = PaintingStyle.stroke;
    for (final line in lines) {
      if (line.isEmpty) continue;
      final path = Path()..moveTo(project(line.first).dx, project(line.first).dy);
      for (final point in line.skip(1)) { final p = project(point); path.lineTo(p.dx, p.dy); }
      canvas.drawPath(path, paint);
    }
  }
  @override
  bool shouldRepaint(covariant _RoadPainter oldDelegate) => oldDelegate.stops != stops;
}
