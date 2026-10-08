import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../theme/apple_theme.dart';
import '../../models/usuario_model.dart';
import '../../models/pedido_mobile_model.dart';
import '../../services/sync_service.dart';
import '../../services/auth_service.dart';
import '../auth/login_screen.dart';
import 'nuevo_pedido_screen.dart';
import '../../widgets/apple_button.dart';
import '../../widgets/apple_glass_card.dart';
import '../../widgets/interactive_gps_map.dart';

class ClienteHomeScreen extends StatefulWidget {
  final UsuarioAppModel usuario;

  const ClienteHomeScreen({super.key, required this.usuario});

  @override
  State<ClienteHomeScreen> createState() => _ClienteHomeScreenState();
}

class _ClienteHomeScreenState extends State<ClienteHomeScreen> {
  List<PedidoMobileModel> _pedidos = [];
  bool _cargando = true;

  @override
  void initState() {
    super.initState();
    _cargarPedidos();
  }

  Future<void> _cargarPedidos() async {
    setState(() => _cargando = true);
    final lista = await SyncService.descargarPedidosRemotos();
    if (mounted) {
      setState(() {
        _pedidos = lista;
        _cargando = false;
      });
    }
  }

  void _abrirNuevoPedido() async {
    await Navigator.push(
      context,
      CupertinoPageRoute(
        builder: (_) => NuevoPedidoScreen(usuario: widget.usuario),
      ),
    );
    _cargarPedidos();
  }

  void _abrirTrackingEnVivo(PedidoMobileModel pedido) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => Container(
        margin: const EdgeInsets.only(top: 50),
        decoration: const BoxDecoration(
          color: Color(0xFF161B17),
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 36,
                    height: 4,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'TRACKING EN VIVO · ECOLOGÍSTICA',
                          style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppleTheme.accentGreen, letterSpacing: 0.5),
                        ),
                        Text(
                          pedido.codigoSeguimiento,
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppleTheme.textPrimary),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppleTheme.accentGreen.withValues(alpha: 0.18),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Row(
                        children: [
                          Icon(CupertinoIcons.location_fill, size: 12, color: AppleTheme.accentGreen),
                          SizedBox(width: 4),
                          Text('Ruta Activa Verde', style: TextStyle(color: AppleTheme.accentGreen, fontSize: 11, fontWeight: FontWeight.w700)),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Mapa interactivo para el cliente en ruta Punto A -> Punto B (Línea Verde)
                InteractiveGpsMap(
                  pedido: pedido,
                  modoRuta: ModoRutaGps.origenADestino,
                  height: 280,
                  etiquetaEstado: 'Repartidor en Ruta al Punto B',
                ),
                const SizedBox(height: 16),

                // Destino y ETA
                AppleGlassCard(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          const Icon(CupertinoIcons.house_alt_fill, color: AppleTheme.accentGreen, size: 20),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('Destino de entrega:', style: TextStyle(fontSize: 11, color: AppleTheme.textSecondary)),
                                Text(pedido.destinoDireccion, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppleTheme.textPrimary)),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('ETA: ${pedido.tiempoEstimadoMinutos} minutos aprox.', style: const TextStyle(fontSize: 12, color: AppleTheme.accentCyan, fontWeight: FontWeight.w600)),
                          Text('Distancia: ${pedido.distanciaKm} km', style: const TextStyle(fontSize: 12, color: AppleTheme.textSecondary)),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),

                AppleButton(
                  text: 'Cerrar Mapa',
                  isSecondary: true,
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final double totalCo2Mitigado = _pedidos.fold(0.0, (acc, p) => acc + p.emisionCo2Kg);

    // Pedido activo en llegada a origen
    final PedidoMobileModel? pedidoLlegadaOrigen = _pedidos.cast<PedidoMobileModel?>().firstWhere(
      (p) => p?.faseEntrega == 'LLEGADA_A_ORIGEN' || (p?.avisoClienteLlegadaOrigen == true && p?.estado != 'ENTREGADO'),
      orElse: () => null,
    );

    // Pedido activo en tránsito hacia destino
    final PedidoMobileModel? pedidoEnTransito = _pedidos.cast<PedidoMobileModel?>().firstWhere(
      (p) => p?.faseEntrega == 'EN_TRANSITO_A_DESTINO' || p?.estado == 'EN_TRANSITO',
      orElse: () => null,
    );

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Portal de Clientes y Tracking'),
            Text(
              widget.usuario.nombreCompleto,
              style: const TextStyle(fontSize: 12, color: AppleTheme.textSecondary, fontWeight: FontWeight.normal),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(CupertinoIcons.arrow_clockwise, size: 20),
            onPressed: _cargarPedidos,
          ),
          IconButton(
            icon: const Icon(CupertinoIcons.square_arrow_right, size: 20),
            onPressed: () async {
              await AuthService.logout();
              if (!context.mounted) return;
              Navigator.pushReplacement(
                context,
                CupertinoPageRoute(builder: (_) => const LoginScreen()),
              );
            },
          ),
        ],
      ),
      body: _cargando
          ? const Center(child: CupertinoActivityIndicator(radius: 14))
          : RefreshIndicator(
              onRefresh: _cargarPedidos,
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                children: [
                  // 1. Notificación en vivo si el repartidor acaba de pulsar "Ya llegué a la ubicación"
                  if (pedidoLlegadaOrigen != null) ...[
                    _buildNotificacionLlegadaRepartidor(pedidoLlegadaOrigen),
                    const SizedBox(height: 14),
                  ],

                  // 2. Tarjeta de Tracking en Vivo si el repartidor está en tránsito (Punto A -> B)
                  if (pedidoEnTransito != null) ...[
                    _buildTrackingEnTransitoCard(pedidoEnTransito),
                    const SizedBox(height: 14),
                  ],

                  // 3. Tarjeta de Certificado de Impacto Ecológico (CO2 Ahorrado)
                  AppleGlassCard(
                    padding: const EdgeInsets.all(18),
                    child: Row(
                      children: [
                        Container(
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            color: AppleTheme.accentGreen.withValues(alpha: 0.18),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: AppleTheme.accentGreen.withValues(alpha: 0.4)),
                          ),
                          child: const Icon(CupertinoIcons.leaf_arrow_circlepath, color: AppleTheme.accentGreen, size: 26),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'HUELLA DE CARBONO MITIGADA',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w700,
                                  color: AppleTheme.accentGreen,
                                  letterSpacing: 0.5,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                '${totalCo2Mitigado.toStringAsFixed(2)} kg CO₂',
                                style: const TextStyle(
                                  fontSize: 22,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: -0.5,
                                  color: AppleTheme.textPrimary,
                                ),
                              ),
                              const Text(
                                'Ahorrados con repartos en unidades eco-amigables.',
                                style: TextStyle(fontSize: 11, color: AppleTheme.textSecondary),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Botón Principal: Generar Nuevo Pedido
                  AppleButton(
                    text: 'Generar Nuevo Pedido (Punto A ➔ B)',
                    icon: CupertinoIcons.add_circled_solid,
                    onPressed: _abrirNuevoPedido,
                  ),
                  const SizedBox(height: 22),

                  const Text(
                    'MIS PEDIDOS REGISTRADOS',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: AppleTheme.textSecondary,
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 10),

                  if (_pedidos.isEmpty)
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 40),
                      child: Center(
                        child: Text(
                          'No tienes pedidos activos. Pulsa arriba para crear uno.',
                          style: TextStyle(color: AppleTheme.textSecondary),
                        ),
                      ),
                    )
                  else
                    ..._pedidos.map((pedido) => _buildClienteOrderCard(pedido)),
                ],
              ),
            ),
    );
  }

  // Banner especial cuando el repartidor presiona "Ya llegué a la ubicación"
  Widget _buildNotificacionLlegadaRepartidor(PedidoMobileModel pedido) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppleTheme.accentCyan.withValues(alpha: 0.18),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppleTheme.accentCyan, width: 1.5),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: AppleTheme.accentCyan.withValues(alpha: 0.25),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(CupertinoIcons.bell_fill, color: AppleTheme.accentCyan, size: 22),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      '¡REPARTIDOR EN EL PUNTO DE RECOJO!',
                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppleTheme.accentCyan),
                    ),
                    Text(
                      pedido.codigoSeguimiento,
                      style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppleTheme.textSecondary),
                    ),
                  ],
                ),
                const SizedBox(height: 3),
                Text(
                  'El conductor ha llegado a ${pedido.origenDireccion}. Está recibiendo el paquete para iniciar el trayecto hacia tu ubicación.',
                  style: const TextStyle(fontSize: 12, color: AppleTheme.textPrimary, height: 1.3),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // Tarjeta de seguimiento en vivo con mapa y líneas entrecortadas verdes
  Widget _buildTrackingEnTransitoCard(PedidoMobileModel pedido) {
    return AppleGlassCard(
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Row(
                children: [
                  Icon(CupertinoIcons.paperplane_fill, size: 16, color: AppleTheme.accentGreen),
                  SizedBox(width: 6),
                  Text(
                    'EN RUTA HACIA TU DESTINO (PUNTO B)',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppleTheme.accentGreen),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppleTheme.accentGreen.withValues(alpha: 0.18),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: const Text('Línea Verde GPS', style: TextStyle(color: AppleTheme.accentGreen, fontSize: 10, fontWeight: FontWeight.w700)),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Mini mapa interactivo embebido
          InteractiveGpsMap(
            pedido: pedido,
            modoRuta: ModoRutaGps.origenADestino,
            height: 180,
            interactivo: false,
            etiquetaEstado: 'Ruta Activa Punto A ➔ B',
          ),
          const SizedBox(height: 10),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Llegada en ~${pedido.tiempoEstimadoMinutos} min',
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppleTheme.accentCyan),
              ),
              GestureDetector(
                onTap: () => _abrirTrackingEnVivo(pedido),
                child: const Text(
                  'Ver Mapa Grande ➔',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppleTheme.accentGreen),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildClienteOrderCard(PedidoMobileModel pedido) {
    Color estadoColor = AppleTheme.accentBlue;
    if (pedido.faseEntrega == 'EN_TRANSITO_A_DESTINO' || pedido.estado == 'EN_TRANSITO') {
      estadoColor = AppleTheme.accentOrange;
    }
    if (pedido.estado == 'ENTREGADO') estadoColor = AppleTheme.accentGreen;

    return AppleGlassCard(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      onTap: () {
        if (pedido.faseEntrega == 'EN_TRANSITO_A_DESTINO' || pedido.estado == 'EN_TRANSITO') {
          _abrirTrackingEnVivo(pedido);
        }
      },
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                pedido.codigoSeguimiento,
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppleTheme.accentCyan),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: estadoColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  pedido.estado,
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: estadoColor),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),

          // Puntos A y B
          Row(
            children: [
              const Icon(CupertinoIcons.arrow_up_right_circle, size: 13, color: AppleTheme.accentCyan),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  'De: ${pedido.origenDireccion}',
                  style: const TextStyle(fontSize: 12, color: AppleTheme.textSecondary),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 3),
          Row(
            children: [
              const Icon(CupertinoIcons.location_solid, size: 13, color: AppleTheme.accentGreen),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  'Hacia: ${pedido.destinoDireccion}',
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppleTheme.textPrimary),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // Modalidad de Pago y Monto
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Importe: S/. ${pedido.precioProducto.toStringAsFixed(2)}',
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppleTheme.textPrimary),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: pedido.metodoPago == 'CONTRAENTREGA'
                      ? AppleTheme.accentOrange.withValues(alpha: 0.15)
                      : AppleTheme.accentGreen.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  pedido.metodoPago == 'CONTRAENTREGA' ? 'Contraentrega' : 'Pagado',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    color: pedido.metodoPago == 'CONTRAENTREGA' ? AppleTheme.accentOrange : AppleTheme.accentGreen,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
