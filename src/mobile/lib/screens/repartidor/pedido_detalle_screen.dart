import 'package:flutter/material.dart';

import '../../models/usuario_model.dart';
import '../../models/pedido_mobile_model.dart';
import '../../services/local_db_service.dart';
import '../../services/sync_service.dart';
import '../../widgets/apple_glass_card.dart';

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
  bool _busy = false;
  String _message = '';
  @override
  void initState() {
    super.initState();
    _pedido = widget.pedido;
  }

  Future<void> _update(String state) async {
    setState(() => _busy = true);
    try {
      final updated = _pedido.copyWith(estado: state, isSynced: false);
      await LocalDbService.actualizarPedidoLocal(updated);
      final result = await SyncService.sincronizarSqlHaciaPostgres();
      final stored = await LocalDbService.obtenerPedidosLocales();
      if (mounted)
        setState(() {
          _pedido = stored.firstWhere(
            (p) => p.id == updated.id,
            orElse: () => updated,
          );
          _message = result['exito'] == true
              ? 'Estado confirmado por el servidor.'
              : 'Cambio pendiente de confirmación. ${result['mensaje']}';
        });
    } catch (_) {
      if (mounted)
        setState(
          () => _message = 'No se pudo confirmar el cambio. Reintenta desde Sincronizar reparto.',
        );
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: Text(_pedido.codigoSeguimiento)),
    body: ListView(
      padding: const EdgeInsets.all(20),
      children: [
        AppleGlassCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                _pedido.clienteNombre,
                style: Theme.of(context).textTheme.titleLarge,
              ),
              Text(_pedido.destinoDireccion),
              Text(
                'Contacto: ${_pedido.telefonoContacto.isEmpty ? 'Sin teléfono registrado' : _pedido.telefonoContacto}',
              ),
              Text('Estado: ${_pedido.estado}'),
              Text('Recepción: ${_pedido.ventanaInicio}–${_pedido.ventanaFin}'),
              Text('Acceso: ${_pedido.restriccionAcceso}'),
              if (_pedido.referenciaUbicacion.isNotEmpty)
                Text('Referencia: ${_pedido.referenciaUbicacion}'),
              Text(
                _pedido.isSynced
                    ? 'Confirmado por el servidor'
                    : 'Pendiente de envío',
              ),
            ],
          ),
        ),
        if (_message.isNotEmpty)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 12),
            child: Text(_message),
          ),
        if (_busy) const LinearProgressIndicator(),
        if (_pedido.estado == 'ASIGNADO')
          ElevatedButton(
            onPressed: _busy ? null : () => _update('EN_TRANSITO'),
            child: const Text('Iniciar entrega'),
          ),
        if (_pedido.estado == 'EN_TRANSITO') ...[
          ElevatedButton(
            onPressed: _busy ? null : () => _update('ENTREGADO'),
            child: const Text('Confirmar entrega'),
          ),
          OutlinedButton(
            onPressed: _busy ? null : () => _update('NO_ENTREGADO'),
            child: const Text('Registrar entrega no realizada'),
          ),
        ],
        const Padding(
          padding: EdgeInsets.only(top: 16),
          child: Text(
            'El recorrido y sus cambios se consultan en Mi itinerario. Al terminar, confirma allí el regreso al depósito.',
          ),
        ),
      ],
    ),
  );
}
