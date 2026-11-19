import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../models/pedido_mobile_model.dart';

/// Servicio de Base de Datos local persistente (Offline-First Storage).
/// Garantiza persistencia local incluso si se pierde la conexión con PostgreSQL.
class LocalDbService {
  static String accountId = '';
  static String get _keyPedidos => 'ecologistica_pedidos_local_db_$accountId';
  static String get _keyOutboxSync =>
      'ecologistica_outbox_sync_queue_$accountId';

  /// Inicializa una colección vacía si la base SQL local está vacía
  static Future<void> inicializarSiVacio() async {
    final prefs = await SharedPreferences.getInstance();
    if (!prefs.containsKey(_keyPedidos)) {
      await guardarTodosLosPedidos([]);
    }
  }

  /// Recupera todos los pedidos almacenados en la base de datos local
  static Future<List<PedidoMobileModel>> obtenerPedidosLocales() async {
    final prefs = await SharedPreferences.getInstance();
    final jsonStr = prefs.getString(_keyPedidos);
    if (jsonStr == null || jsonStr.isEmpty) {
      await inicializarSiVacio();
      final nuevoJson = prefs.getString(_keyPedidos);
      if (nuevoJson == null) return [];
      final List<dynamic> decoded = jsonDecode(nuevoJson);
      return decoded.map((e) => PedidoMobileModel.fromJson(e)).toList();
    }

    final List<dynamic> decoded = jsonDecode(jsonStr);
    return decoded.map((e) => PedidoMobileModel.fromJson(e)).toList();
  }

  /// Guarda la colección completa de pedidos localmente
  static Future<void> guardarTodosLosPedidos(
    List<PedidoMobileModel> pedidos,
  ) async {
    final prefs = await SharedPreferences.getInstance();
    final jsonList = pedidos.map((p) => p.toJson()).toList();
    await prefs.setString(_keyPedidos, jsonEncode(jsonList));
  }

  /// Agrega un nuevo pedido a la base local y lo encola en outbox si no está sincronizado
  static Future<void> agregarPedidoLocal(PedidoMobileModel pedido) async {
    final lista = await obtenerPedidosLocales();
    lista.insert(0, pedido);
    await guardarTodosLosPedidos(lista);

    if (!pedido.isSynced) {
      await encolarTransaccionOutbox({
        'accion': 'CREAR_PEDIDO',
        'pedido': pedido.toJson(),
        'timestamp': DateTime.now().toIso8601String(),
      });
    }
  }

  /// Actualiza un pedido en la base local (ej. cambiar a EN_TRANSITO o ENTREGADO con foto POD)
  static Future<void> actualizarPedidoLocal(
    PedidoMobileModel pedidoActualizado,
  ) async {
    final lista = await obtenerPedidosLocales();
    final index = lista.indexWhere((p) => p.id == pedidoActualizado.id);
    if (index == -1)
      throw StateError(
        'Pedido no disponible en este dispositivo. Actualiza el reparto antes de cambiarlo.',
      );
    if (index != -1) {
      lista[index] = pedidoActualizado;
      await guardarTodosLosPedidos(lista);

      if (!pedidoActualizado.isSynced) {
        await encolarTransaccionOutbox({
          'accion': 'ACTUALIZAR_PEDIDO',
          'pedido_id': pedidoActualizado.id,
          'estado': pedidoActualizado.estado,
          'fase_entrega': pedidoActualizado.faseEntrega,
          'flete_acordado': pedidoActualizado.fleteAcordado,
          'foto_pod': pedidoActualizado.fotoPodBase64,
          'foto_recepcion': pedidoActualizado.fotoRecepcionOrigen,
          'aviso_llegada': pedidoActualizado.avisoClienteLlegadaOrigen,
          'fecha_entrega': pedidoActualizado.fechaEntrega,
          'timestamp': DateTime.now().toIso8601String(),
        });
      }
    }
  }

  /// Encola una transacción en la tabla outbox_sync para envío diferido a PostgreSQL
  static Future<void> encolarTransaccionOutbox(
    Map<String, dynamic> transaccion,
  ) async {
    final prefs = await SharedPreferences.getInstance();
    final cola = await obtenerColaOutbox();
    cola.add(transaccion);
    await prefs.setString(_keyOutboxSync, jsonEncode(cola));
  }

  /// Obtiene la cola de transacciones pendientes por subir a PostgreSQL
  static Future<List<Map<String, dynamic>>> obtenerColaOutbox() async {
    final prefs = await SharedPreferences.getInstance();
    final jsonStr = prefs.getString(_keyOutboxSync);
    if (jsonStr == null || jsonStr.isEmpty) return [];
    final List<dynamic> decoded = jsonDecode(jsonStr);
    return decoded.map((e) => Map<String, dynamic>.from(e)).toList();
  }

  /// Remove only acknowledged snapshot entries. New edits and failures stay queued.
  static Future<void> confirmarTransacciones(
    List<Map<String, dynamic>> confirmadas,
  ) async {
    final prefs = await SharedPreferences.getInstance();
    final cola = await obtenerColaOutbox();
    for (final confirmada in confirmadas) {
      final index = cola.indexWhere(
        (t) => jsonEncode(t) == jsonEncode(confirmada),
      );
      if (index >= 0) cola.removeAt(index);
    }
    await prefs.setString(_keyOutboxSync, jsonEncode(cola));
    final pedidos = await obtenerPedidosLocales();
    final pendientes = cola
        .map((t) => t['pedido_id'] ?? (t['pedido'] as Map?)?['id'])
        .toSet();
    final idsConfirmados = confirmadas
        .map((t) => t['pedido_id'] ?? (t['pedido'] as Map?)?['id'])
        .toSet();
    await guardarTodosLosPedidos(
      pedidos
          .map(
            (p) => idsConfirmados.contains(p.id) && !pendientes.contains(p.id)
                ? p.copyWith(isSynced: true)
                : p,
          )
          .toList(),
    );
  }

  /// Limpia la cola de transacciones una vez completada la sincronización
  static Future<void> limpiarColaOutbox() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_keyOutboxSync);
  }

  /// Marca todos los pedidos locales como sincronizados (isSynced = true)
  static Future<void> marcarTodosComoSincronizados() async {
    final lista = await obtenerPedidosLocales();
    final actualizados = lista.map((p) => p.copyWith(isSynced: true)).toList();
    await guardarTodosLosPedidos(actualizados);
    await limpiarColaOutbox();
  }
}
