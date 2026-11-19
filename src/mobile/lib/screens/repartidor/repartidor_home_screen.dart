import 'package:flutter/material.dart';

import '../../models/usuario_model.dart';
import '../../models/pedido_mobile_model.dart';
import '../../services/auth_service.dart';
import '../../services/local_db_service.dart';
import '../../services/sync_service.dart';
import '../../widgets/apple_glass_card.dart';
import '../../widgets/itinerary_panel.dart';
import '../auth/login_screen.dart';
import 'pedido_detalle_screen.dart';

class RepartidorHomeScreen extends StatefulWidget {
  final UsuarioAppModel usuario;
  const RepartidorHomeScreen({super.key, required this.usuario});
  @override
  State<RepartidorHomeScreen> createState() => _RepartidorHomeScreenState();
}

class _RepartidorHomeScreenState extends State<RepartidorHomeScreen> {
  List<PedidoMobileModel> _pedidos = [];
  bool _busy = false;
  String _status = '';
  int _pending = 0;
  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _busy = true);
    try {
      final result = await SyncService.sincronizarSqlHaciaPostgres();
      final orders = await SyncService.descargarPedidosRemotos();
      final queue = await LocalDbService.obtenerColaOutbox();
      if (mounted)
        setState(() {
          _pedidos = orders;
          _pending = queue.length;
          _status = result['mensaje'];
        });
    } catch (_) {
      if (mounted)
        setState(
          () => _status =
              'No se pudo actualizar. Los cambios pendientes se conservan.',
        );
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _logout() async {
    await AuthService.logout();
    if (mounted)
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const LoginScreen()),
        (_) => false,
      );
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: const Text('Mi reparto'),
      actions: [
        IconButton(
          tooltip: 'Sincronizar reparto',
          onPressed: _busy ? null : _load,
          icon: const Icon(Icons.sync),
        ),
        IconButton(
          tooltip: 'Cerrar sesión',
          onPressed: _logout,
          icon: const Icon(Icons.logout),
        ),
      ],
    ),
    body: ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(
          widget.usuario.nombreCompleto,
          style: Theme.of(context).textTheme.titleLarge,
        ),
        if (_busy) const LinearProgressIndicator(),
        Text('$_pending operaciones pendientes de envío'),
        if (_status.isNotEmpty) Text(_status),
        ItineraryPanel(driverId: widget.usuario.conductorId),
        if (!_busy && _pedidos.isEmpty)
          const Text(
            'No tienes entregas asignadas. Oficina debe generar tu ruta.',
          ),
        for (final p in _pedidos)
          Padding(
            padding: const EdgeInsets.only(top: 12),
            child: AppleGlassCard(
              child: Material(
                type: MaterialType.transparency,
                child: ListTile(
                  title: Text(p.codigoSeguimiento),
                  subtitle: Text(
                    '${p.destinoDireccion}\n${p.estado}${p.isSynced ? '' : ' · Pendiente de envío'}',
                  ),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () async {
                    await Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => PedidoDetalleScreen(
                          pedido: p,
                          usuario: widget.usuario,
                        ),
                      ),
                    );
                    if (mounted) await _load();
                  },
                ),
              ),
            ),
          ),
      ],
    ),
  );
}
