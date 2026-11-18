import 'package:flutter/material.dart';

import '../../models/usuario_model.dart';
import '../../models/pedido_mobile_model.dart';
import '../../services/auth_service.dart';
import '../../services/sync_service.dart';
import '../../widgets/apple_glass_card.dart';
import '../auth/login_screen.dart';
import 'nuevo_pedido_screen.dart';
import 'preferencias_screen.dart';

class ClienteHomeScreen extends StatefulWidget {
  final UsuarioAppModel usuario;
  const ClienteHomeScreen({super.key, required this.usuario});
  @override
  State<ClienteHomeScreen> createState() => _ClienteHomeScreenState();
}

class _ClienteHomeScreenState extends State<ClienteHomeScreen> {
  List<PedidoMobileModel> _pedidos = [];
  bool _busy = false;
  String _status = '';
  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _busy = true);
    try {
      final sent = await SyncService.sincronizarSqlHaciaPostgres();
      final orders = await SyncService.descargarPedidosRemotos();
      if (mounted)
        setState(() {
          _pedidos = orders;
          _status = SyncService.isOnline ? sent['mensaje'] : 'Sin conexión: se muestran tus pedidos guardados en este dispositivo.';
        });
    } catch (_) {
      if (mounted)
        setState(
          () =>
              _status = 'No se pudieron cargar los pedidos. Puedes reintentar.',
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

  Future<void> _newOrder() async {
    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => NuevoPedidoScreen(usuario: widget.usuario),
      ),
    );
    if (mounted) await _load();
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: const Text('Mis pedidos'),
      actions: [
        IconButton(
          tooltip: 'Actualizar pedidos',
          onPressed: _busy ? null : _load,
          icon: const Icon(Icons.refresh),
        ),
        IconButton(
          tooltip: 'Cerrar sesión',
          onPressed: _logout,
          icon: const Icon(Icons.logout),
        ),
      ],
    ),
    floatingActionButton: FloatingActionButton.extended(
      onPressed: _newOrder,
      icon: const Icon(Icons.add),
      label: const Text('Nuevo pedido'),
    ),
    body: ListView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
      children: [
        Text(
          widget.usuario.nombreCompleto,
          style: Theme.of(context).textTheme.titleLarge,
        ),
        if (_busy) const LinearProgressIndicator(),
        if (_status.isNotEmpty)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 12),
            child: Text(_status),
          ),
        if (!_busy && _pedidos.isEmpty)
          const Text('Todavía no tienes pedidos asociados a tu cuenta.'),
        for (final p in _pedidos)
          Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: AppleGlassCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    p.codigoSeguimiento,
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  Text(p.destinoDireccion),
                  Text('Estado: ${p.estado}'),
                  Text(
                    p.isSynced
                        ? 'Confirmado por el servidor'
                        : 'Pendiente de envío: se conserva en este dispositivo',
                  ),
                  Text('Recepción: ${p.ventanaInicio}–${p.ventanaFin}'),
                  TextButton(
                    onPressed: p.isSynced
                        ? () async {
                            await Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) =>
                                    PreferenciasScreen(pedidoId: p.id),
                              ),
                            );
                            if (mounted) await _load();
                          }
                        : null,
                    child: Text('Preferencias de ${p.codigoSeguimiento}'),
                  ),
                ],
              ),
            ),
          ),
      ],
    ),
  );
}
