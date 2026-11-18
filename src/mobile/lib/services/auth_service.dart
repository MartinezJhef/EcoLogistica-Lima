import 'local_db_service.dart';
import 'itinerary_service.dart';
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/usuario_model.dart';

class AuthService {
  static const String _keyUsuarioActivo = 'ecologistica_sesion_activa';
  static UsuarioAppModel? usuarioActual;

  /// Intenta restaurar la sesión previamente guardada
  static Future<UsuarioAppModel?> restaurarSesion() async {
    final prefs = await SharedPreferences.getInstance();
    if (prefs.getString('ecologistica_access_token') == null) return null;
    final jsonStr = prefs.getString(_keyUsuarioActivo);
    if (jsonStr != null && jsonStr.isNotEmpty) {
      try {
        final decoded = jsonDecode(jsonStr);
        usuarioActual = UsuarioAppModel.fromJson(decoded);
        LocalDbService.accountId = usuarioActual!.usuarioId;
        return usuarioActual;
      } catch (_) {}
    }
    return null;
  }

  /// Autentica contra la API y conserva la sesión de esta cuenta.
  static Future<UsuarioAppModel> login({
    required String email,
    required String password,
  }) async {
    final response = await ItineraryService.client.post(Uri.parse('${ItineraryService.apiUrl}/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email.trim().toLowerCase(), 'password': password}))
        .timeout(const Duration(seconds: 10));
    if (response.statusCode != 200) throw Exception('Correo o contraseña incorrectos, o servidor no disponible.');
    final result = jsonDecode(response.body) as Map<String, dynamic>;
    final user = UsuarioAppModel.fromJson(result['usuario']);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('ecologistica_access_token', result['access_token']);
    await _guardarSesion(user);
    return user;
  }

  static Future<UsuarioAppModel> loginRapido(RolUsuarioApp rol) async {
    throw Exception('Introduce el correo y la contraseña de tu cuenta.');
  }

  static Future<void> _guardarSesion(UsuarioAppModel usuario) async {
    usuarioActual = usuario;
    LocalDbService.accountId = usuario.usuarioId;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyUsuarioActivo, jsonEncode(usuario.toJson()));
  }

  static Future<void> logout() async {
    usuarioActual = null;
    LocalDbService.accountId = '';
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_keyUsuarioActivo);
    await prefs.remove('ecologistica_access_token');
  }
}
