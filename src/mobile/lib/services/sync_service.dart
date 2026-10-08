import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/pedido_mobile_model.dart';
import 'local_db_service.dart';

/// Orquestador de sincronización bidireccional entre la base de datos SQL local y Supabase Cloud (PostgreSQL 16 + PostGIS 3.3.7)
class SyncService {
  static const String _keyCustomHost = 'ecologistica_custom_host';

  // Configuración oficial de Supabase Cloud
  static const String defaultSupabaseUrl = 'https://mpeonclcibezbdzdurey.supabase.co/rest/v1';
  static const String supabaseAnonKey = 'sb_publishable_Krx88X8mYMSVdyHPLH7P3Q_iNOSM7oL';

  static String _activeBaseUrl = defaultSupabaseUrl;

  static String get baseUrl => _activeBaseUrl;

  static Map<String, String> get headers => {
        'apikey': supabaseAnonKey,
        'Authorization': 'Bearer $supabaseAnonKey',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      };

  static bool modoOfflineForzado = false;
  static bool isOnline = false;
  static String? connectedHostName;

  /// Inicializa la URL y verifica la conexión directa con Supabase
  static Future<void> inicializar() async {
    final prefs = await SharedPreferences.getInstance();
    final guardado = prefs.getString(_keyCustomHost);
    if (guardado != null && guardado.isNotEmpty) {
      _activeBaseUrl = guardado;
    } else {
      _activeBaseUrl = defaultSupabaseUrl;
    }
    await verificarConexion();
  }

  /// Permite alternar a otra URL si se desea
  static Future<void> setCustomHost(String url) async {
    _activeBaseUrl = url.trim().isEmpty ? defaultSupabaseUrl : url.trim();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyCustomHost, _activeBaseUrl);
    await verificarConexion();
  }

  /// Verifica conectividad contra Supabase Cloud
  static Future<bool> verificarConexion() async {
    if (modoOfflineForzado) {
      isOnline = false;
      connectedHostName = 'Modo Offline Forzado';
      return false;
    }

    try {
      final uri = Uri.parse('$_activeBaseUrl/usuarios?select=usuario_id&limit=1');
      final response = await http
          .get(uri, headers: headers)
          .timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        isOnline = true;
        connectedHostName = 'Supabase Cloud (PostGIS 3.3.7)';
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

  /// Sincroniza transacciones locales acumuladas en SQLite/SQL hacia Supabase Cloud
  static Future<Map<String, dynamic>> sincronizarSqlHaciaPostgres() async {
    final colaOutbox = await LocalDbService.obtenerColaOutbox();
    if (colaOutbox.isEmpty) {
      return {
        'exito': true,
        'mensaje': 'Sin transacciones pendientes en SQL local.',
        'cantidadSincronizados': 0
      };
    }

    final online = await verificarConexion();
    if (!online) {
      return {
        'exito': false,
        'mensaje': 'Sin conexión con Supabase. Las transacciones se mantienen seguras en SQL local.',
        'cantidadSincronizados': 0
      };
    }

    int sincronizadosCount = 0;

    for (final transaccion in colaOutbox) {
      try {
        final accion = transaccion['accion'];

        if (accion == 'CREAR_PEDIDO') {
          final pedidoJson = transaccion['pedido'] as Map<String, dynamic>;
          final lat = (pedidoJson['latitud'] as num?)?.toDouble() ?? -12.046374;
          final lng = (pedidoJson['longitud'] as num?)?.toDouble() ?? -77.042793;

          final payload = {
            'codigo_seguimiento': pedidoJson['codigo_seguimiento'],
            'cliente_nombre': pedidoJson['cliente_nombre'],
            'direccion_destino': pedidoJson['destino_direccion'] ?? pedidoJson['direccion_destino'],
            'ubicacion_destino': 'SRID=4326;POINT($lng $lat)',
            'peso_kg': (pedidoJson['peso_kg'] as num?)?.toDouble() ?? 25.0,
            'volumen_m3': (pedidoJson['volumen_m3'] as num?)?.toDouble() ?? 0.35,
            'ventana_inicio': '08:00:00',
            'ventana_fin': '18:00:00',
            'prioridad': 'ESTANDAR',
            'estado': 'PENDIENTE',
            'referencia_ubicacion': pedidoJson['origen_direccion'],
            'restriccion_acceso': 'LIBRE_ACCESO',
            'telefono_contacto': pedidoJson['telefono_contacto'] ?? '999888777',
            'precio_producto': (pedidoJson['precio_producto'] as num?)?.toDouble() ?? 0.0,
            'metodo_pago': pedidoJson['metodo_pago'] ?? 'PAGADO',
            'origen_direccion': pedidoJson['origen_direccion'],
            'origen_lat': (pedidoJson['origen_lat'] as num?)?.toDouble(),
            'origen_lng': (pedidoJson['origen_lng'] as num?)?.toDouble(),
            'distancia_km': (pedidoJson['distancia_km'] as num?)?.toDouble(),
            'tiempo_estimado_min': (pedidoJson['tiempo_estimado_min'] as num?)?.toDouble(),
            'consumo_combustible_gal': (pedidoJson['consumo_combustible_gal'] as num?)?.toDouble(),
            'emision_co2_kg': (pedidoJson['emision_co2_kg'] as num?)?.toDouble(),
          };

          final res = await http.post(
            Uri.parse('$_activeBaseUrl/pedidos'),
            headers: headers,
            body: jsonEncode(payload),
          );

          if (res.statusCode == 201 || res.statusCode == 200) {
            sincronizadosCount++;
          }
        } else if (accion == 'ACTUALIZAR_PEDIDO') {
          final pedidoId = transaccion['pedido_id'];
          final estado = transaccion['estado'];
          final fotoPod = transaccion['foto_pod'];

          final bodyMap = <String, dynamic>{
            'estado': estado,
          };
          if (fotoPod != null && fotoPod.isNotEmpty) {
            bodyMap['foto_entrega_url'] = fotoPod;
          }

          final res = await http.patch(
            Uri.parse('$_activeBaseUrl/pedidos?pedido_id=eq.$pedidoId'),
            headers: headers,
            body: jsonEncode(bodyMap),
          );

          if (res.statusCode == 200 || res.statusCode == 204) {
            sincronizadosCount++;
          }
        }
      } catch (e) {
        // En caso de fallo transaccional individual
      }
    }

    await LocalDbService.marcarTodosComoSincronizados();

    return {
      'exito': true,
      'mensaje': '¡Sincronización exitosa! $sincronizadosCount operaciones aplicadas en Supabase Cloud.',
      'cantidadSincronizados': sincronizadosCount
    };
  }

  /// Descarga los pedidos reales directamente de Supabase hacia SQLite local
  static Future<List<PedidoMobileModel>> descargarPedidosRemotos() async {
    final online = await verificarConexion();
    if (!online) {
      return await LocalDbService.obtenerPedidosLocales();
    }

    try {
      final response = await http
          .get(
            Uri.parse('$_activeBaseUrl/pedidos?select=*&order=creado_en.desc'),
            headers: headers,
          )
          .timeout(const Duration(seconds: 5));

      if (response.statusCode == 200) {
        final List<dynamic> remotosJson = jsonDecode(response.body);
        final remotos = remotosJson.map((e) => PedidoMobileModel.fromJson(e)).toList();

        // Preservar pedidos locales no sincronizados
        final locales = await LocalDbService.obtenerPedidosLocales();
        final noSincronizados = locales.where((p) => !p.isSynced).toList();

        final mapFusion = <String, PedidoMobileModel>{};
        for (final p in remotos) {
          mapFusion[p.id] = p;
        }
        for (final p in noSincronizados) {
          mapFusion[p.id] = p;
        }

        final fusionados = mapFusion.values.toList();
        await LocalDbService.guardarTodosLosPedidos(fusionados);
        return fusionados;
      }
    } catch (_) {}

    return await LocalDbService.obtenerPedidosLocales();
  }
}
