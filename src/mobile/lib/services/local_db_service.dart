import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/pedido_mobile_model.dart';

/// Servicio de Base de Datos SQL / SQLite Local Emulada (Offline-First Storage).
/// Garantiza persistencia transaccional incluso si se pierde la conexión con PostgreSQL.
class LocalDbService {
  static const String _keyPedidos = 'ecologistica_pedidos_local_db';
  static const String _keyOutboxSync = 'ecologistica_outbox_sync_queue';

  /// Inicializa datos mock para demostración si la base SQL local está vacía
  static Future<void> inicializarSiVacio() async {
    final prefs = await SharedPreferences.getInstance();
    if (!prefs.containsKey(_keyPedidos)) {
      final pedidosIniciales = [
        PedidoMobileModel(
          id: 'ped-sjl-001',
          codigoSeguimiento: 'PED-LIMA-101',
          clienteNombre: 'Bodega Don Pepe · San Juan de Lurigancho',
          telefonoContacto: '987112233',
          origenDireccion: 'Centro de Distribución EcoLogística · Av. Argentina 2050, Lima',
          origenLat: -12.046374,
          origenLng: -77.042793,
          destinoDireccion: 'Av. Canto Grande 2450, SJL',
          destinoLat: -12.001200,
          destinoLng: -77.012300,
          precioProducto: 85.00,
          metodoPago: 'CONTRAENTREGA',
          estado: 'PENDIENTE',
          distanciaKm: 9.4,
          tiempoEstimadoMinutos: 32,
          consumoCombustibleGal: 0.25,
          emisionCo2Kg: 0.61,
          fleteOfrecido: 22.50,
          faseEntrega: 'OFERTA_DISPONIBLE',
          conductorLat: -12.052800,
          conductorLng: -77.051200,
          tiempoHaciaOrigenMin: 7,
          distanciaHaciaOrigenKm: 2.1,
          consumoKmGal: 38.0,
          restriccionZonal: 'LIBRE_CIRCULACION',
          ahorroCo2Porcentaje: 38.0,
          co2AhorradoKg: 0.42,
          isSynced: true,
        ),
        PedidoMobileModel(
          id: 'ped-ate-002',
          codigoSeguimiento: 'PED-LIMA-102',
          clienteNombre: 'Minimarket Los Laureles · Santa Anita',
          telefonoContacto: '912334455',
          origenDireccion: 'Almacén Central · Jr. Huancavelica 850, Cercado de Lima',
          origenLat: -12.046000,
          origenLng: -77.038000,
          destinoDireccion: 'Av. Los Frutales 120, Ate',
          destinoLat: -12.045000,
          destinoLng: -76.965000,
          precioProducto: 140.50,
          metodoPago: 'PAGADO',
          estado: 'PENDIENTE',
          distanciaKm: 8.8,
          tiempoEstimadoMinutos: 29,
          consumoCombustibleGal: 0.23,
          emisionCo2Kg: 0.57,
          fleteOfrecido: 26.00,
          faseEntrega: 'OFERTA_DISPONIBLE',
          conductorLat: -12.052800,
          conductorLng: -77.051200,
          tiempoHaciaOrigenMin: 9,
          distanciaHaciaOrigenKm: 3.2,
          consumoKmGal: 38.0,
          restriccionZonal: 'LIBRE_CIRCULACION',
          ahorroCo2Porcentaje: 38.0,
          co2AhorradoKg: 0.39,
          isSynced: true,
        ),
        PedidoMobileModel(
          id: 'ped-mira-003',
          codigoSeguimiento: 'PED-LIMA-103',
          clienteNombre: 'Café Orgánico · Miraflores',
          telefonoContacto: '998443322',
          origenDireccion: 'Centro de Distribución EcoLogística · Av. Argentina 2050, Lima',
          origenLat: -12.046374,
          origenLng: -77.042793,
          destinoDireccion: 'Av. Larco 880, Miraflores',
          destinoLat: -12.125000,
          destinoLng: -77.029000,
          precioProducto: 62.00,
          metodoPago: 'CONTRAENTREGA',
          estado: 'PENDIENTE',
          distanciaKm: 11.2,
          tiempoEstimadoMinutos: 36,
          consumoCombustibleGal: 0.29,
          emisionCo2Kg: 0.72,
          fleteOfrecido: 30.00,
          faseEntrega: 'OFERTA_DISPONIBLE',
          conductorLat: -12.052800,
          conductorLng: -77.051200,
          tiempoHaciaOrigenMin: 12,
          distanciaHaciaOrigenKm: 4.5,
          consumoKmGal: 38.0,
          restriccionZonal: 'LIBRE_CIRCULACION',
          ahorroCo2Porcentaje: 38.0,
          co2AhorradoKg: 0.49,
          isSynced: true,
        ),
      ];

      await guardarTodosLosPedidos(pedidosIniciales);
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
  static Future<void> guardarTodosLosPedidos(List<PedidoMobileModel> pedidos) async {
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
  static Future<void> actualizarPedidoLocal(PedidoMobileModel pedidoActualizado) async {
    final lista = await obtenerPedidosLocales();
    final index = lista.indexWhere((p) => p.id == pedidoActualizado.id);
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
  static Future<void> encolarTransaccionOutbox(Map<String, dynamic> transaccion) async {
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
