import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../theme/apple_theme.dart';
import '../../models/usuario_model.dart';
import '../../models/pedido_mobile_model.dart';
import '../../services/local_db_service.dart';
import '../../services/sync_service.dart';
import '../../services/auth_service.dart';
import '../auth/login_screen.dart';
import 'pedido_detalle_screen.dart';
import '../../widgets/apple_glass_card.dart';
import '../../widgets/pedido_toast_card.dart';

class RepartidorHomeScreen extends StatefulWidget {
  final UsuarioAppModel usuario;

  const RepartidorHomeScreen({super.key, required this.usuario});

  @override
  State<RepartidorHomeScreen> createState() => _RepartidorHomeScreenState();
}

class _RepartidorHomeScreenState extends State<RepartidorHomeScreen> {
  List<PedidoMobileModel> _pedidos = [];
  bool _cargando = true;
  bool _isOnline = true;
  int _colaPendiente = 0;
  String? _mensajeSincronizacion;
  bool _toastYaMostrado = false;

  @override
  void initState() {
    super.initState();
    _cargarDatos();
  }

  Future<void> _cargarDatos() async {
    setState(() => _cargando = true);
    final online = await SyncService.verificarConexion();
    final outbox = await LocalDbService.obtenerColaOutbox();
    final lista = await SyncService.descargarPedidosRemotos();

    if (mounted) {
      setState(() {
        _isOnline = online;
        _colaPendiente = outbox.length;
        _pedidos = lista;
        _cargando = false;
      });

      // Si existe un pedido en oferta y no se ha mostrado aún el Toast automático, desplegarlo
      if (!_toastYaMostrado && lista.any((p) => p.faseEntrega == 'OFERTA_DISPONIBLE' && p.estado == 'PENDIENTE')) {
        _toastYaMostrado = true;
        final pedidoOferta = lista.firstWhere((p) => p.faseEntrega == 'OFERTA_DISPONIBLE' && p.estado == 'PENDIENTE');
        WidgetsBinding.instance.addPostFrameCallback((_) {
          _abrirToastOferta(pedidoOferta);
        });
      }
    }
  }

  Future<void> _handleSincronizarManual() async {
    setState(() => _cargando = true);
    final resultado = await SyncService.sincronizarSqlHaciaPostgres();
    final outbox = await LocalDbService.obtenerColaOutbox();
    final lista = await LocalDbService.obtenerPedidosLocales();

    if (mounted) {
      setState(() {
        _isOnline = SyncService.isOnline;
        _colaPendiente = outbox.length;
        _pedidos = lista;
        _cargando = false;
        _mensajeSincronizacion = resultado['mensaje'];
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(_mensajeSincronizacion ?? 'Sincronización procesada.'),
          backgroundColor: resultado['exito'] == true ? AppleTheme.accentBlue : AppleTheme.accentRed,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  Future<void> _toggleSimularConexion() async {
    final nuevoEstado = await SyncService.alternarModoOffline();
    final outbox = await LocalDbService.obtenerColaOutbox();
    final lista = await LocalDbService.obtenerPedidosLocales();

    if (mounted) {
      setState(() {
        _isOnline = nuevoEstado;
        _colaPendiente = outbox.length;
        _pedidos = lista;
      });
    }
  }

  void _abrirToastOferta(PedidoMobileModel pedido) {
    PedidoToastCard.mostrar(
      context: context,
      pedido: pedido,
      onAceptarFlete: (fleteFinal) async {
        // Conductor aceptó el flete (o el cliente aceptó su contraoferta)
        final actualizado = pedido.copyWith(
          fleteAcordado: fleteFinal,
          faseEntrega: 'RUMBO_A_RECOJO',
          estado: 'PENDIENTE',
        );
        await LocalDbService.actualizarPedidoLocal(actualizado);
        await _cargarDatos();

        if (mounted) {
          // Abrir inmediatamente la pantalla de navegación GPS con zoom y línea roja al Punto A
          Navigator.push(
            context,
            CupertinoPageRoute(
              builder: (_) => PedidoDetalleScreen(pedido: actualizado, usuario: widget.usuario),
            ),
          ).then((_) => _cargarDatos());
        }
      },
      onRechazar: () {},
    );
  }

  void _abrirDetalle(PedidoMobileModel pedido) async {
    // Si el pedido aún está en fase de oferta, abrir primero el Toast de puja de flete
    if (pedido.faseEntrega == 'OFERTA_DISPONIBLE' && pedido.estado == 'PENDIENTE') {
      _abrirToastOferta(pedido);
      return;
    }

    await Navigator.push(
      context,
      CupertinoPageRoute(
        builder: (_) => PedidoDetalleScreen(pedido: pedido, usuario: widget.usuario),
      ),
    );
    _cargarDatos();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Panel de Reparto'),
            Text(
              widget.usuario.nombreCompleto,
              style: const TextStyle(fontSize: 12, color: AppleTheme.textSecondary, fontWeight: FontWeight.normal),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(CupertinoIcons.arrow_clockwise, size: 20),
            onPressed: _cargarDatos,
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
              onRefresh: _cargarDatos,
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                children: [
                  // Banner de Conexión y Estado Offline-First (SQL -> PostgreSQL)
                  _buildConnectionBanner(),
                  const SizedBox(height: 16),

                  // Resumen de Métricas de Turno
                  Row(
                    children: [
                      Expanded(
                        child: _buildMetricCard(
                          label: 'En Oferta',
                          value: '${_pedidos.where((p) => p.faseEntrega == 'OFERTA_DISPONIBLE' || p.faseEntrega == 'RUMBO_A_RECOJO').length}',
                          icon: CupertinoIcons.bell,
                          color: AppleTheme.accentOrange,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: _buildMetricCard(
                          label: 'En Tránsito',
                          value: '${_pedidos.where((p) => p.estado == 'EN_TRANSITO').length}',
                          icon: CupertinoIcons.car_detailed,
                          color: AppleTheme.accentBlue,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: _buildMetricCard(
                          label: 'Entregados',
                          value: '${_pedidos.where((p) => p.estado == 'ENTREGADO').length}',
                          icon: CupertinoIcons.checkmark_seal,
                          color: AppleTheme.accentGreen,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Título de Sección
                  Wrap(
                    alignment: WrapAlignment.spaceBetween,
                    crossAxisAlignment: WrapCrossAlignment.center,
                    spacing: 8,
                    runSpacing: 4,
                    children: [
                      const Text(
                        'HOJA DE RUTA Y OFERTAS',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: AppleTheme.textSecondary,
                          letterSpacing: 0.5,
                        ),
                      ),
                      if (_pedidos.any((p) => p.faseEntrega == 'OFERTA_DISPONIBLE'))
                        GestureDetector(
                          onTap: () {
                            final primerOferta = _pedidos.firstWhere((p) => p.faseEntrega == 'OFERTA_DISPONIBLE');
                            _abrirToastOferta(primerOferta);
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: AppleTheme.accentOrange.withValues(alpha: 0.18),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(CupertinoIcons.sparkles, size: 12, color: AppleTheme.accentOrange),
                                SizedBox(width: 4),
                                Text(
                                  'Ver Toast Oferta',
                                  style: TextStyle(fontSize: 10, color: AppleTheme.accentOrange, fontWeight: FontWeight.w700),
                                ),
                              ],
                            ),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 10),

                  if (_pedidos.isEmpty)
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 40),
                      child: Center(
                        child: Text(
                          'No hay pedidos disponibles por el momento.',
                          style: TextStyle(color: AppleTheme.textSecondary),
                        ),
                      ),
                    )
                  else
                    ..._pedidos.map((pedido) => _buildOrderCard(pedido)),
                ],
              ),
            ),
    );
  }

  Widget _buildConnectionBanner() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: _isOnline
            ? AppleTheme.accentBlue.withValues(alpha: 0.18)
            : AppleTheme.accentOrange.withValues(alpha: 0.18),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: _isOnline ? AppleTheme.borderSubtle : AppleTheme.accentOrange.withValues(alpha: 0.4),
        ),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Icon(
                _isOnline ? CupertinoIcons.wifi : CupertinoIcons.wifi_slash,
                color: _isOnline ? AppleTheme.accentCyan : AppleTheme.accentOrange,
                size: 20,
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _isOnline ? 'En línea con PostgreSQL' : 'Modo SQL Local (Offline)',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: _isOnline ? AppleTheme.accentCyan : AppleTheme.accentOrange,
                      ),
                    ),
                    Text(
                      _isOnline
                          ? 'Sincronizado en tiempo real con la nube.'
                          : 'Se guardará en SQL local. Se subirá al reconectar.',
                      style: const TextStyle(fontSize: 11, color: AppleTheme.textSecondary),
                    ),
                  ],
                ),
              ),
              if (_colaPendiente > 0)
                GestureDetector(
                  onTap: _handleSincronizarManual,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppleTheme.accentOrange,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      'Subir ($_colaPendiente)',
                      style: const TextStyle(color: Colors.black, fontSize: 11, fontWeight: FontWeight.w700),
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              GestureDetector(
                onTap: _toggleSimularConexion,
                child: Text(
                  _isOnline ? 'Simular pérdida de conexión' : 'Simular recuperación de señal',
                  style: const TextStyle(
                    fontSize: 11,
                    color: AppleTheme.textSecondary,
                    decoration: TextDecoration.underline,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMetricCard({
    required String label,
    required String value,
    required IconData icon,
    required Color color,
  }) {
    return AppleGlassCard(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 10),
      child: Column(
        children: [
          Icon(icon, size: 18, color: color),
          const SizedBox(height: 4),
          Text(
            value,
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppleTheme.textPrimary),
          ),
          Text(
            label,
            style: const TextStyle(fontSize: 10, color: AppleTheme.textSecondary, fontWeight: FontWeight.w500),
          ),
        ],
      ),
    );
  }

  Widget _buildOrderCard(PedidoMobileModel pedido) {
    Color estadoColor = AppleTheme.textSecondary;
    String estadoTexto = pedido.estado;

    if (pedido.faseEntrega == 'OFERTA_DISPONIBLE') {
      estadoColor = AppleTheme.accentOrange;
      estadoTexto = 'OFERTA DISPONIBLE';
    } else if (pedido.faseEntrega == 'RUMBO_A_RECOJO') {
      estadoColor = AppleTheme.accentRed;
      estadoTexto = 'RUMBO A RECOJO (ROJO)';
    } else if (pedido.faseEntrega == 'LLEGADA_A_ORIGEN') {
      estadoColor = AppleTheme.accentCyan;
      estadoTexto = 'EN ORIGEN (FOTO)';
    } else if (pedido.faseEntrega == 'EN_TRANSITO_A_DESTINO') {
      estadoColor = AppleTheme.accentGreen;
      estadoTexto = 'EN TRÁNSITO (VERDE)';
    } else if (pedido.estado == 'ENTREGADO') {
      estadoColor = AppleTheme.accentGreen;
      estadoTexto = 'ENTREGADO';
    }

    final double fleteMostrar = pedido.fleteAcordado ?? pedido.fleteOfrecido;

    return AppleGlassCard(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      onTap: () => _abrirDetalle(pedido),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Cabecera: Código, Libre Circulación y Badge de Estado
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Expanded(
                child: Wrap(
                  crossAxisAlignment: WrapCrossAlignment.center,
                  spacing: 6,
                  runSpacing: 4,
                  children: [
                    Text(
                      pedido.codigoSeguimiento,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w800,
                        color: AppleTheme.accentBlue,
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppleTheme.accentGreen.withValues(alpha: 0.18),
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(color: AppleTheme.accentGreen.withValues(alpha: 0.4)),
                      ),
                      child: const Text(
                        'Libre Circulación',
                        style: TextStyle(fontSize: 8.5, fontWeight: FontWeight.w700, color: AppleTheme.accentGreen),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 4),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2.5),
                decoration: BoxDecoration(
                  color: estadoColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  estadoTexto,
                  style: TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: estadoColor),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),

          // Puntos A y B
          Text(
            'De: ${pedido.origenDireccion}',
            style: const TextStyle(fontSize: 11, color: AppleTheme.accentCyan, fontWeight: FontWeight.w600),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 2),
          Text(
            'A: ${pedido.destinoDireccion}',
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppleTheme.textPrimary),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 10),

          // Métricas de la ruta, ETA al recojo y Flete
          Wrap(
            alignment: WrapAlignment.spaceBetween,
            crossAxisAlignment: WrapCrossAlignment.center,
            spacing: 8,
            runSpacing: 4,
            children: [
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(CupertinoIcons.clock, size: 12, color: AppleTheme.accentRed),
                  const SizedBox(width: 3),
                  Text('${pedido.tiempoHaciaOrigenMin} min a Punto A', style: const TextStyle(fontSize: 10, color: AppleTheme.textPrimary, fontWeight: FontWeight.w600)),
                  const SizedBox(width: 8),
                  const Icon(CupertinoIcons.drop, size: 12, color: AppleTheme.accentOrange),
                  const SizedBox(width: 3),
                  Text('${pedido.consumoKmGal} km/gal', style: const TextStyle(fontSize: 10, color: AppleTheme.accentOrange, fontWeight: FontWeight.w600)),
                ],
              ),

              // Monto del Flete
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
                decoration: BoxDecoration(
                  color: AppleTheme.accentGreen.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: AppleTheme.accentGreen.withValues(alpha: 0.3)),
                ),
                child: Text(
                  'Flete: S/. ${fleteMostrar.toStringAsFixed(2)}',
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    color: AppleTheme.accentGreen,
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
