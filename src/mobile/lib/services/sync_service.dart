import 'dart:async';

import 'itinerary_service.dart';

import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../models/pedido_mobile_model.dart';
import 'local_db_service.dart';

/// Orquestador de sincronización bidireccional entre la base de datos SQL local y servidor EcoLogística (PostgreSQL 16 + PostGIS 3.3.7)
class SyncService {
  static http.Client client = http.Client();
  static bool _syncing = false;
  static const String _keyCustomHost = 'ecologistica_custom_host';

  static String _activeBaseUrl = ItineraryService.apiUrl;
  static String get baseUrl => _activeBaseUrl;
  static Timer? _retryTimer;
  static void stopRetryTimer() {
    _retryTimer?.cancel();
    _retryTimer = null;
  }

  static bool modoOfflineForzado = false;
  static bool isOnline = false;
  static String? connectedHostName;

  /// Inicializa la URL y verifica la conexión directa con servidor
  static Future<void> inicializar() async {
    final prefs = await SharedPreferences.getInstance();
    final guardado = prefs.getString(_keyCustomHost);
    if (guardado != null &&
        guardado.isNotEmpty &&
        !guardado.contains('/rest/v1')) {
      _activeBaseUrl = guardado;
    } else {
      _activeBaseUrl = ItineraryService.apiUrl;
    }
    ItineraryService.apiUrl = _activeBaseUrl;
    await verificarConexion();
    _retryTimer ??= Timer.periodic(const Duration(seconds: 30), (_) async {
      if (LocalDbService.accountId.isEmpty) return;
      try {
        await sincronizarSqlHaciaPostgres();
      } catch (_) {
        /* Pending operations stay on this device. */
      }
    });
  }

  /// Permite alternar a otra URL si se desea
  static Future<void> setCustomHost(String url) async {
    final parsed = Uri.tryParse(url.trim());
    if (parsed == null ||
        !['http', 'https'].contains(parsed.scheme) ||
        parsed.host.isEmpty ||
        parsed.path.contains('/rest/v1'))
      throw ArgumentError('Introduce la URL del servidor EcoLogística /api/v1');
    _activeBaseUrl = url.trim().replaceAll(RegExp(r'/$'), '');
    ItineraryService.apiUrl = _activeBaseUrl;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyCustomHost, _activeBaseUrl);
    await verificarConexion();
  }

  /// Verifica conectividad contra servidor EcoLogística
  static Future<bool> verificarConexion() async {
    if (modoOfflineForzado) {
      isOnline = false;
      connectedHostName = 'Modo Offline Forzado';
      return false;
    }

    try {
      final uri = Uri.parse('$_activeBaseUrl/health');
      final response = await client
          .get(uri, headers: await ItineraryService.headers())
          .timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        isOnline = true;
        connectedHostName = 'Servidor EcoLogística';
        return true;
      }
    } catch (_) {
      // Fallback a endpoints locales si estuviesen configurados
    }

    isOnline = false;
    connectedHostName = null;
    return false;
  }

  /// Alterna entre modo online y offline manual para pruebas de resiliencia
  static Future<bool> alternarModoOffline() async {
    modoOfflineForzado = !modoOfflineForzado;
    if (modoOfflineForzado) {
      isOnline = false;
    } else {
      await verificarConexion();
      if (isOnline) {
        await sincronizarSqlHaciaPostgres();
      }
    }
    return isOnline;
  }

  /// Sincroniza transacciones locales acumuladas en SQLite/SQL hacia servidor EcoLogística
  static Future<Map<String, dynamic>> sincronizarSqlHaciaPostgres() async {
    if (_syncing)
      return {
        'exito': false,
        'mensaje': 'Sincronización en curso',
        'cantidadSincronizados': 0,
      };
    _syncing = true;
    try {
      final account = LocalDbService.accountId;
      final sessionHeaders = await ItineraryService.headers();
      final colaOutbox = await LocalDbService.obtenerColaOutbox();
      if (colaOutbox.isEmpty) {
        return {
          'exito': true,
          'mensaje': 'No hay cambios pendientes de envío.',
          'cantidadSincronizados': 0,
        };
      }

      final online = await verificarConexion();
      if (!online) {
        return {
          'exito': false,
          'mensaje': 'Sin conexión. Los cambios quedan guardados en este dispositivo.',
          'cantidadSincronizados': 0,
        };
      }

      int sincronizadosCount = 0;
      final confirmadas = <Map<String, dynamic>>[];
      final prefs = await SharedPreferences.getInstance();
      final remoteIdsKey = 'ecologistica_remote_ids_$account';
      final remoteIds = Map<String, dynamic>.from(
        jsonDecode(prefs.getString(remoteIdsKey) ?? '{}'),
      );

      for (final transaccion in colaOutbox) {
        if (account != LocalDbService.accountId) break;
        var applied = false;
        try {
          final accion = transaccion['accion'];

          if (accion == 'CREAR_PEDIDO') {
            final pedidoJson = transaccion['pedido'] as Map<String, dynamic>;
            final lat =
                (pedidoJson['latitud'] as num?)?.toDouble() ?? -12.046374;
            final lng =
                (pedidoJson['longitud'] as num?)?.toDouble() ?? -77.042793;

            final payload = {
              'codigo_seguimiento': pedidoJson['codigo_seguimiento'],
              'cliente_nombre': pedidoJson['cliente_nombre'],
              'direccion_destino':
                  pedidoJson['destino_direccion'] ??
                  pedidoJson['direccion_destino'],
              'latitud': lat,
              'longitud': lng,
              'peso_kg': (pedidoJson['peso_kg'] as num?)?.toDouble() ?? 25.0,
              'volumen_m3':
                  (pedidoJson['volumen_m3'] as num?)?.toDouble() ?? 0.35,
              'ventana_inicio': pedidoJson['ventana_inicio'] ?? '08:00:00',
              'ventana_fin': pedidoJson['ventana_fin'] ?? '18:00:00',
              'prioridad': 'ESTANDAR',
              'estado': 'PENDIENTE',
              'referencia_ubicacion': pedidoJson['referencia_ubicacion'],
              'restriccion_acceso':
                  pedidoJson['restriccion_acceso'] ?? 'LIBRE_ACCESO',
              'telefono_contacto': pedidoJson['telefono_contacto'],
              'precio_producto':
                  (pedidoJson['precio_producto'] as num?)?.toDouble() ?? 0.0,
              'metodo_pago': pedidoJson['metodo_pago'] ?? 'PAGADO',
              'origen_direccion': pedidoJson['origen_direccion'],
              'origen_lat': (pedidoJson['origen_lat'] as num?)?.toDouble(),
              'origen_lng': (pedidoJson['origen_lng'] as num?)?.toDouble(),
              'distancia_km': (pedidoJson['distancia_km'] as num?)?.toDouble(),
              'tiempo_estimado_min': (pedidoJson['tiempo_estimado_min'] as num?)
                  ?.toDouble(),
              'consumo_combustible_gal':
                  (pedidoJson['consumo_combustible_gal'] as num?)?.toDouble(),
              'emision_co2_kg': (pedidoJson['emision_co2_kg'] as num?)
                  ?.toDouble(),
            };

            var res = await client
                .post(
                  Uri.parse('$_activeBaseUrl/mobile/pedidos'),
                  headers: sessionHeaders,
                  body: jsonEncode(payload),
                )
                .timeout(const Duration(seconds: 10));
            if (res.statusCode == 201 || res.statusCode == 200) {
              final created = jsonDecode(res.body) as Map;
              remoteIds[pedidoJson['id']] = created['pedido_id'];
              await prefs.setString(remoteIdsKey, jsonEncode(remoteIds));
              applied = true;
              confirmadas.add(transaccion);
              sincronizadosCount++;
            }
          } else if (accion == 'ACTUALIZAR_PEDIDO') {
            final localId = transaccion['pedido_id'];
            final pedidoId = remoteIds[localId] ?? localId;
            final estado = transaccion['estado'] == 'PENDIENTE'
                ? 'ASIGNADO'
                : transaccion['estado'];
            final fotoPod = transaccion['foto_pod'];

            final bodyMap = <String, dynamic>{'estado': estado};
            if (fotoPod != null && fotoPod.isNotEmpty) {
              bodyMap['foto_entrega_url'] = fotoPod;
            }

            final res = await client
                .patch(
                  Uri.parse('$_activeBaseUrl/mobile/pedidos/$pedidoId'),
                  headers: sessionHeaders,
                  body: jsonEncode(bodyMap),
                )
                .timeout(const Duration(seconds: 10));

            if (res.statusCode == 200) {
              applied = true;
              confirmadas.add(transaccion);
              sincronizadosCount++;
            }
          } else if (accion == 'FINALIZAR_RUTA') {
            final res = await client
                .post(
                  Uri.parse(
                    '$_activeBaseUrl/rutas/${transaccion['ruta_id']}/finalizar',
                  ),
                  headers: sessionHeaders,
                  body: jsonEncode({'regreso_confirmado': true}),
                )
                .timeout(const Duration(seconds: 10));
            if (res.statusCode == 200) {
              applied = true;
              confirmadas.add(transaccion);
              sincronizadosCount++;
            }
          }
        } catch (e) {
          // Keep this operation and all later operations in order for retry.
        }
        if (!applied) break;
      }

      if (account != LocalDbService.accountId)
        return {
          'exito': false,
          'mensaje':
              'La cuenta cambió. Se verificará el envío al retomar esa sesión.',
          'cantidadSincronizados': sincronizadosCount,
        };
      await LocalDbService.confirmarTransacciones(confirmadas);

      return {
        'exito': sincronizadosCount == colaOutbox.length,
        'mensaje':
            '$sincronizadosCount operaciones enviadas; ${colaOutbox.length - sincronizadosCount} pendientes de reintento.',
        'cantidadSincronizados': sincronizadosCount,
      };
    } finally {
      _syncing = false;
    }
  }

  /// Descarga los pedidos reales directamente de servidor hacia SQLite local
  static Future<List<PedidoMobileModel>> descargarPedidosRemotos() async {
    final online = await verificarConexion();
    if (!online) {
      return await LocalDbService.obtenerPedidosLocales();
    }

    try {
      final response = await client
          .get(
            Uri.parse('$_activeBaseUrl/mobile/pedidos'),
            headers: await ItineraryService.headers(),
          )
          .timeout(const Duration(seconds: 5));

      if (response.statusCode == 200) {
        final List<dynamic> remotosJson = jsonDecode(response.body);
        final remotos = remotosJson
            .map((e) => PedidoMobileModel.fromJson(e))
            .toList();

        // Preservar pedidos locales no sincronizados
        final locales = await LocalDbService.obtenerPedidosLocales();
        final noSincronizados = locales.where((p) => !p.isSynced).toList();

        final mapFusion = <String, PedidoMobileModel>{};
        for (final p in remotos) {
          mapFusion[p.codigoSeguimiento] = p;
        }
        for (final p in noSincronizados) {
          mapFusion[p.codigoSeguimiento] = p;
        }

        final fusionados = mapFusion.values.toList();
        await LocalDbService.guardarTodosLosPedidos(fusionados);
        return fusionados;
      }
    } catch (_) {}

    return await LocalDbService.obtenerPedidosLocales();
  }
}
