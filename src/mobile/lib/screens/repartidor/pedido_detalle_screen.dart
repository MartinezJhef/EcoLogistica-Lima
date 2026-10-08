import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../theme/apple_theme.dart';
import '../../models/usuario_model.dart';
import '../../models/pedido_mobile_model.dart';
import '../../services/local_db_service.dart';
import '../../services/sync_service.dart';
import '../../widgets/apple_button.dart';
import '../../widgets/apple_glass_card.dart';
import '../../widgets/interactive_gps_map.dart';

class PedidoDetalleScreen extends StatefulWidget {
  final PedidoMobileModel pedido;
  final UsuarioAppModel usuario;

  const PedidoDetalleScreen({
    super.key,
    required this.pedido,
    required this.usuario,
  });

  @override
  State<PedidoDetalleScreen> createState() => _PedidoDetalleScreenState();
}

class _PedidoDetalleScreenState extends State<PedidoDetalleScreen> {
  late PedidoMobileModel _pedido;
  bool _guardando = false;
  String? _fotoRecepcionMock; // Foto al recibir el paquete en Punto A

  @override
  void initState() {
    super.initState();
    _pedido = widget.pedido;
    _fotoRecepcionMock = _pedido.fotoRecepcionOrigen;
  }

  // Determinar el modo del mapa GPS según la fase actual de entrega
  ModoRutaGps get _modoMapaActual {
    switch (_pedido.faseEntrega) {
      case 'RUMBO_A_RECOJO':
      case 'FLETE_ACORDADO':
      case 'OFERTA_DISPONIBLE':
        return ModoRutaGps.conductorAOrigen; // Línea entrecortada ROJA
      case 'LLEGADA_A_ORIGEN':
        return ModoRutaGps.enOrigen;
      case 'EN_TRANSITO_A_DESTINO':
        return ModoRutaGps.origenADestino; // Línea entrecortada VERDE
      case 'ENTREGADO':
        return ModoRutaGps.vistaCompleta;
      default:
        return ModoRutaGps.conductorAOrigen;
    }
  }

  // 1. Conductor notifica: "Ya llegué a la ubicación" (Punto A)
  Future<void> _handleYaLlegueAUbicacion() async {
    setState(() => _guardando = true);
    final online = await SyncService.verificarConexion();

    final pedidoActualizado = _pedido.copyWith(
      faseEntrega: 'LLEGADA_A_ORIGEN',
      avisoClienteLlegadaOrigen: true,
      isSynced: online,
    );

    await LocalDbService.actualizarPedidoLocal(pedidoActualizado);
    if (online) {
      await SyncService.sincronizarSqlHaciaPostgres();
    }

    if (mounted) {
      setState(() {
        _pedido = pedidoActualizado;
        _guardando = false;
      });

      // Notificación inmediata al conductor y al sistema
      showCupertinoDialog(
        context: context,
        builder: (_) => CupertinoAlertDialog(
          title: const Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(CupertinoIcons.bell_fill, color: AppleTheme.accentCyan, size: 22),
              SizedBox(width: 8),
              Text('Llegada Registrada'),
            ],
          ),
          content: const Text(
            'Se ha enviado la notificación en tiempo real al cliente: '
            '"¡El repartidor ha llegado al punto de recojo!"\n\n'
            'Ahora toma la fotografía del paquete recibido para empezar la entrega.',
          ),
          actions: [
            CupertinoDialogAction(
              child: const Text('Entendido'),
              onPressed: () => Navigator.pop(context),
            ),
          ],
        ),
      );
    }
  }

  // 2. Tomar foto del paquete en el punto de recojo
  void _tomarFotoRecepcion() {
    final horaActual = DateFormat('yyyy-MM-dd HH:mm:ss').format(DateTime.now());
    final latStr = _pedido.origenLat.toStringAsFixed(6);
    final lngStr = _pedido.origenLng.toStringAsFixed(6);

    setState(() {
      _fotoRecepcionMock = 'RECOJO_FOTO_${_pedido.codigoSeguimiento}_GPS[$latStr,$lngStr]_$horaActual.jpg';
    });

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Foto del paquete capturada con marca de agua GPS e inmutabilidad.'),
        backgroundColor: AppleTheme.accentBlue,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  // 3. Empezar entrega: Punto A -> Punto B (Línea verde)
  Future<void> _handleEmpezarEntrega() async {
    if (_fotoRecepcionMock == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Debes capturar una fotografía del paquete antes de empezar la entrega.'),
          backgroundColor: AppleTheme.accentRed,
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    setState(() => _guardando = true);
    final online = await SyncService.verificarConexion();

    final pedidoActualizado = _pedido.copyWith(
      faseEntrega: 'EN_TRANSITO_A_DESTINO',
      estado: 'EN_TRANSITO',
      fotoRecepcionOrigen: _fotoRecepcionMock,
      isSynced: online,
    );

    await LocalDbService.actualizarPedidoLocal(pedidoActualizado);
    if (online) {
      await SyncService.sincronizarSqlHaciaPostgres();
    }

    if (mounted) {
      setState(() {
        _pedido = pedidoActualizado;
        _guardando = false;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('¡Entrega iniciada! Mostrando ruta Punto A ➔ Punto B con líneas verdes.'),
          backgroundColor: AppleTheme.accentGreen,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  // 4. Confirmar entrega final al cliente en Punto B
  Future<void> _handleConfirmarEntregaFinal() async {
    final horaActual = DateFormat('yyyy-MM-dd HH:mm:ss').format(DateTime.now());
    final latStr = _pedido.destinoLat.toStringAsFixed(6);
    final lngStr = _pedido.destinoLng.toStringAsFixed(6);
    final fotoFinal = 'POD_FINAL_${_pedido.codigoSeguimiento}_GPS[$latStr,$lngStr]_$horaActual.jpg';

    setState(() => _guardando = true);
    final online = await SyncService.verificarConexion();

    final pedidoEntregado = _pedido.copyWith(
      faseEntrega: 'ENTREGADO',
      estado: 'ENTREGADO',
      fotoPodBase64: fotoFinal,
      fechaEntrega: horaActual,
      isSynced: online,
    );

    await LocalDbService.actualizarPedidoLocal(pedidoEntregado);
    if (online) {
      await SyncService.sincronizarSqlHaciaPostgres();
    }

    if (mounted) {
      setState(() {
        _pedido = pedidoEntregado;
        _guardando = false;
      });

      showCupertinoDialog(
        context: context,
        builder: (_) => CupertinoAlertDialog(
          title: const Text('¡Entrega Completada!'),
          content: Text(
            'El paquete fue entregado con éxito en ${_pedido.destinoDireccion}.\n\n'
            'Emisión final de CO₂: ${_pedido.emisionCo2Kg} kg\n'
            'Ahorro mitigado: ${_pedido.co2AhorradoKg} kg CO₂\n'
            'Flete cobrado: S/. ${(_pedido.fleteAcordado ?? _pedido.fleteOfrecido).toStringAsFixed(2)}',
          ),
          actions: [
            CupertinoDialogAction(
              child: const Text('Finalizar'),
              onPressed: () {
                Navigator.pop(context);
                Navigator.pop(context);
              },
            ),
          ],
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(_pedido.codigoSeguimiento),
            Text(
              _getTituloFase(),
              style: const TextStyle(fontSize: 11, color: AppleTheme.textSecondary, fontWeight: FontWeight.normal),
            ),
          ],
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        children: [
          // 1. MAPA INTERACTIVO CON LÍNEAS ENTRECORTADAS Y ZOOM AUTOMÁTICO
          InteractiveGpsMap(
            pedido: _pedido,
            modoRuta: _modoMapaActual,
            height: 310,
            etiquetaEstado: _getTextoEtiquetaMapa(),
          ),
          const SizedBox(height: 16),

          // 2. BANNER DE FASE Y ACCIÓN DINÁMICA
          _buildFaseBanner(),
          const SizedBox(height: 16),

          // 3. TARJETA DE RUTA DETALLADA Y TELEMETRÍA AMBIENTAL
          _buildTelemetryDetailCard(),
          const SizedBox(height: 16),

          // 4. MÓDULO DE FOTOGRAFÍA SEGÚN LA ETAPA
          if (_pedido.faseEntrega == 'LLEGADA_A_ORIGEN' || _pedido.faseEntrega == 'EN_TRANSITO_A_DESTINO' || _pedido.faseEntrega == 'ENTREGADO')
            _buildFotoRecepcionCard(),
          const SizedBox(height: 20),

          // 5. BOTONES DE ACCIÓN PRINCIPAL DEL CONDUCTOR
          _buildBotonAccionPrincipal(),
          const SizedBox(height: 28),
        ],
      ),
    );
  }

  String _getTituloFase() {
    switch (_pedido.faseEntrega) {
      case 'RUMBO_A_RECOJO':
      case 'FLETE_ACORDADO':
      case 'OFERTA_DISPONIBLE':
        return 'Fase 1: En Camino al Punto A (Línea Roja)';
      case 'LLEGADA_A_ORIGEN':
        return 'Fase 2: En Punto de Recojo A';
      case 'EN_TRANSITO_A_DESTINO':
        return 'Fase 3: Rumbo a Punto B (Línea Verde)';
      case 'ENTREGADO':
        return 'Entrega Completada con Éxito';
      default:
        return 'Gestión de Entrega';
    }
  }

  String _getTextoEtiquetaMapa() {
    switch (_pedido.faseEntrega) {
      case 'RUMBO_A_RECOJO':
      case 'FLETE_ACORDADO':
      case 'OFERTA_DISPONIBLE':
        return 'Rumbo al Punto A · Línea Roja';
      case 'LLEGADA_A_ORIGEN':
        return 'En Punto A · Esperando Paquete';
      case 'EN_TRANSITO_A_DESTINO':
        return 'Rumbo al Punto B · Línea Verde';
      case 'ENTREGADO':
        return 'Ruta Completada';
      default:
        return 'Mapa GPS';
    }
  }

  Widget _buildFaseBanner() {
    final fase = _pedido.faseEntrega;

    if (fase == 'RUMBO_A_RECOJO' || fase == 'FLETE_ACORDADO' || fase == 'OFERTA_DISPONIBLE') {
      return Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppleTheme.accentRed.withValues(alpha: 0.14),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppleTheme.accentRed.withValues(alpha: 0.4)),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppleTheme.accentRed.withValues(alpha: 0.25),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(CupertinoIcons.location_fill, color: AppleTheme.accentRed, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'DIRÍGETE AL PUNTO DE RECOJO (A)',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppleTheme.accentRed),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Sigue la línea entrecortada roja hasta ${_pedido.origenDireccion}. Al llegar presiona el botón inferior.',
                    style: const TextStyle(fontSize: 12, color: AppleTheme.textPrimary, height: 1.3),
                  ),
                ],
              ),
            ),
          ],
        ),
      );
    }

    if (fase == 'LLEGADA_A_ORIGEN') {
      return Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppleTheme.accentCyan.withValues(alpha: 0.14),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppleTheme.accentCyan.withValues(alpha: 0.4)),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppleTheme.accentCyan.withValues(alpha: 0.25),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(CupertinoIcons.bell_fill, color: AppleTheme.accentCyan, size: 20),
            ),
            const SizedBox(width: 12),
            const Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'NOTIFICACIÓN ENVIADA AL CLIENTE',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppleTheme.accentCyan),
                  ),
                  SizedBox(height: 2),
                  Text(
                    'El cliente sabe que estás en la ubicación. Toma una foto del paquete recibido para iniciar el viaje al Punto B.',
                    style: TextStyle(fontSize: 12, color: AppleTheme.textPrimary, height: 1.3),
                  ),
                ],
              ),
            ),
          ],
        ),
      );
    }

    if (fase == 'EN_TRANSITO_A_DESTINO') {
      return Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppleTheme.accentGreen.withValues(alpha: 0.14),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppleTheme.accentGreen.withValues(alpha: 0.4)),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppleTheme.accentGreen.withValues(alpha: 0.25),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(CupertinoIcons.paperplane_fill, color: AppleTheme.accentGreen, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'EN RUTA A PUNTO B (ENTREGA FINAL)',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppleTheme.accentGreen),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Sigue la línea entrecortada verde. El cliente está siguiendo tu ubicación en tiempo real.',
                    style: const TextStyle(fontSize: 12, color: AppleTheme.textPrimary, height: 1.3),
                  ),
                ],
              ),
            ),
          ],
        ),
      );
    }

    return const SizedBox.shrink();
  }

  Widget _buildTelemetryDetailCard() {
    final double fleteMonto = _pedido.fleteAcordado ?? _pedido.fleteOfrecido;

    return AppleGlassCard(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Wrap(
            alignment: WrapAlignment.spaceBetween,
            crossAxisAlignment: WrapCrossAlignment.center,
            spacing: 8,
            runSpacing: 6,
            children: [
              const Text(
                'DETALLES DE LA OPERACIÓN',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: AppleTheme.textSecondary,
                  letterSpacing: 0.5,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppleTheme.accentGreen.withValues(alpha: 0.18),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: AppleTheme.accentGreen.withValues(alpha: 0.3)),
                ),
                child: Text(
                  'Flete: S/. ${fleteMonto.toStringAsFixed(2)}',
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    color: AppleTheme.accentGreen,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Puntos A y B
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Column(
                children: [
                  Container(
                    width: 12,
                    height: 12,
                    decoration: const BoxDecoration(color: AppleTheme.accentCyan, shape: BoxShape.circle),
                  ),
                  Container(width: 2, height: 28, color: AppleTheme.borderSubtle),
                  Container(
                    width: 12,
                    height: 12,
                    decoration: const BoxDecoration(color: AppleTheme.accentGreen, shape: BoxShape.circle),
                  ),
                ],
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Punto A (Origen): ${_pedido.origenDireccion}',
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppleTheme.textPrimary),
                    ),
                    const SizedBox(height: 14),
                    Text(
                      'Punto B (Destino): ${_pedido.destinoDireccion}',
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppleTheme.textPrimary),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          const Divider(color: AppleTheme.borderSubtle, height: 1),
          const SizedBox(height: 12),

          // Métricas ecológicas en cuadrícula
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildMiniMetric(
                label: 'Consumo',
                val: '${_pedido.consumoKmGal} km/gal',
                icon: CupertinoIcons.drop,
                color: AppleTheme.accentOrange,
              ),
              _buildMiniMetric(
                label: 'Huella CO₂',
                val: '${_pedido.emisionCo2Kg} kg',
                icon: CupertinoIcons.leaf_arrow_circlepath,
                color: AppleTheme.accentCyan,
              ),
              _buildMiniMetric(
                label: 'Ahorro vs Diésel',
                val: '-${_pedido.ahorroCo2Porcentaje}%',
                icon: CupertinoIcons.sparkles,
                color: AppleTheme.accentGreen,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMiniMetric({
    required String label,
    required String val,
    required IconData icon,
    required Color color,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, size: 12, color: color),
            const SizedBox(width: 4),
            Text(label, style: const TextStyle(fontSize: 10, color: AppleTheme.textSecondary)),
          ],
        ),
        const SizedBox(height: 2),
        Text(
          val,
          style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: color),
        ),
      ],
    );
  }

  Widget _buildFotoRecepcionCard() {
    return AppleGlassCard(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Wrap(
            alignment: WrapAlignment.spaceBetween,
            crossAxisAlignment: WrapCrossAlignment.center,
            spacing: 8,
            runSpacing: 6,
            children: [
              const Text(
                'FOTO DE RECEPCIÓN DEL PAQUETE',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: AppleTheme.textSecondary,
                  letterSpacing: 0.5,
                ),
              ),
              if (_fotoRecepcionMock != null)
                const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(CupertinoIcons.checkmark_circle_fill, color: AppleTheme.accentGreen, size: 14),
                    SizedBox(width: 4),
                    Text('Foto Registrada', style: TextStyle(color: AppleTheme.accentGreen, fontSize: 11, fontWeight: FontWeight.w600)),
                  ],
                ),
            ],
          ),
          const SizedBox(height: 12),

          if (_fotoRecepcionMock == null)
            Container(
              padding: const EdgeInsets.symmetric(vertical: 20),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.03),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
              ),
              child: Center(
                child: Column(
                  children: [
                    const Icon(CupertinoIcons.camera, color: AppleTheme.textSecondary, size: 32),
                    const SizedBox(height: 6),
                    const Text(
                      'Toma una foto al recibir el paquete del Punto A',
                      style: TextStyle(fontSize: 12, color: AppleTheme.textSecondary),
                    ),
                    const SizedBox(height: 10),
                    AppleButton(
                      text: 'Tomar Foto del Paquete',
                      icon: CupertinoIcons.camera_fill,
                      height: 38,
                      onPressed: _tomarFotoRecepcion,
                    ),
                  ],
                ),
              ),
            )
          else
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF1E2620),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppleTheme.accentGreen.withValues(alpha: 0.4)),
              ),
              child: Row(
                children: [
                  const Icon(CupertinoIcons.photo_fill, color: AppleTheme.accentGreen, size: 28),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Evidencia de Recojo Confirmada',
                          style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppleTheme.textPrimary),
                        ),
                        Text(
                          _fotoRecepcionMock!,
                          style: const TextStyle(fontSize: 10, color: AppleTheme.textSecondary),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(CupertinoIcons.camera, color: AppleTheme.accentCyan, size: 20),
                    onPressed: _tomarFotoRecepcion,
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildBotonAccionPrincipal() {
    final fase = _pedido.faseEntrega;

    // Fase 1: Rumbo al Punto A -> Botón "Ya llegué a la ubicación"
    if (fase == 'RUMBO_A_RECOJO' || fase == 'FLETE_ACORDADO' || fase == 'OFERTA_DISPONIBLE') {
      return AppleButton(
        text: 'Ya llegué a la ubicación (Punto A)',
        icon: CupertinoIcons.location_solid,
        backgroundColor: AppleTheme.accentRed,
        isLoading: _guardando,
        onPressed: _handleYaLlegueAUbicacion,
      );
    }

    // Fase 2: En Punto A -> Botón "Empezar Entrega" (Punto A -> B)
    if (fase == 'LLEGADA_A_ORIGEN') {
      return AppleButton(
        text: 'Empezar Entrega (Hacia Punto B)',
        icon: CupertinoIcons.play_arrow_solid,
        backgroundColor: AppleTheme.accentGreen,
        isLoading: _guardando,
        onPressed: _handleEmpezarEntrega,
      );
    }

    // Fase 3: Rumbo a Punto B -> Botón "Confirmar Entrega Final"
    if (fase == 'EN_TRANSITO_A_DESTINO') {
      return AppleButton(
        text: 'Confirmar Entrega Final al Cliente',
        icon: CupertinoIcons.checkmark_seal_fill,
        backgroundColor: AppleTheme.accentGreen,
        isLoading: _guardando,
        onPressed: _handleConfirmarEntregaFinal,
      );
    }

    // Fase 4: Entregado
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppleTheme.accentGreen.withValues(alpha: 0.14),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppleTheme.accentGreen.withValues(alpha: 0.4)),
      ),
      child: const Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(CupertinoIcons.checkmark_seal_fill, color: AppleTheme.accentGreen, size: 22),
          SizedBox(width: 8),
          Text(
            'Pedido Entregado con Éxito',
            style: TextStyle(color: AppleTheme.accentGreen, fontWeight: FontWeight.w700, fontSize: 14),
          ),
        ],
      ),
    );
  }
}
