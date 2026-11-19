import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

/// Persist before acknowledging. The server retries by leaving unacknowledged revisions queued.
class ItineraryService {
  static http.Client client = http.Client();
  static String apiUrl = const String.fromEnvironment('API_BASE_URL', defaultValue: 'http://10.0.2.2:8000/api/v1');

  static Future<List<Map<String, dynamic>>> cached(String driverId) async {
    final prefs = await SharedPreferences.getInstance();
    return (jsonDecode(prefs.getString('itineraries_$driverId') ?? '[]') as List)
        .map((e) => Map<String, dynamic>.from(e)).toList();
  }

  static Future<Map<String, String>> headers() async {
    final prefs = await SharedPreferences.getInstance();
    return {'Content-Type': 'application/json', 'Authorization': 'Bearer ${prefs.getString('ecologistica_access_token') ?? ''}'};
  }

  static Future<int> refresh(String driverId) async {
    final response = await client.get(Uri.parse('$apiUrl/rutas/conductor/$driverId/actualizaciones'), headers: await headers())
        .timeout(const Duration(seconds: 8));
    if (response.statusCode != 200) throw Exception('No se pudo actualizar el itinerario');
    final updates = jsonDecode(response.body) as List;
    final prefs = await SharedPreferences.getInstance();
    final routes = await cached(driverId);
    var changed = 0;
    for (final update in updates) {
      final route = Map<String, dynamic>.from(update['itinerario']);
      final existing = routes.indexWhere((r) => r['ruta_id'] == route['ruta_id']);
      if (existing < 0 || routes[existing]['revision'] != update['update_id']) {
        route['revision'] = update['update_id'];
        if (existing < 0) { routes.add(route); } else { routes[existing] = route; }
        // Await the durable write before acknowledging receipt to the server.
        if (!await prefs.setString('itineraries_$driverId', jsonEncode(routes))) {
          throw Exception('No se pudo guardar la ruta; se reintentará su recepción');
        }
        changed++;
      }
      final ack = await client.post(Uri.parse('$apiUrl/rutas/conductor/$driverId/actualizaciones/${update['update_id']}/confirmar'), headers: await headers())
          .timeout(const Duration(seconds: 8));
      if (ack.statusCode != 200) throw Exception('Ruta guardada; confirmación pendiente');
    }
    return changed;
  }
}
