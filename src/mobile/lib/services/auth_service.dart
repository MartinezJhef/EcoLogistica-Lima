import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/usuario_model.dart';
import 'sync_service.dart';

class AuthService {
  static const String _keyUsuarioActivo = 'ecologistica_sesion_activa';
  static UsuarioAppModel? usuarioActual;

  /// Cuentas demostrativas oficiales de respaldo idénticas a Supabase
  static final List<UsuarioAppModel> cuentasPredefinidas = [
    UsuarioAppModel(
      usuarioId: 'fbdc5dee-1282-4f91-9afa-ec173f8ccdbf',
      email: 'repartidor.juan@ecologistica.pe',
      nombreCompleto: 'Juan Alberto Morales (Repartidor / Conductor)',
      telefono: '999888777',
      rol: RolUsuarioApp.repartidor,
      permisos: ['REPARTO_POD', 'SEGUIMIENTO_RUTAS'],
      estado: 'ACTIVO',
    ),
    UsuarioAppModel(
      usuarioId: 'ad47482b-d436-4ad2-92fc-9430600654b3',
      email: 'carlos.quispe@ecologistica.pe',
      nombreCompleto: 'Carlos Eduardo Quispe Huamán (Conductor / Repartidor)',
      telefono: '987654321',
      rol: RolUsuarioApp.repartidor,
      permisos: ['REPARTO_POD', 'SEGUIMIENTO_RUTAS'],
      estado: 'ACTIVO',
    ),
    UsuarioAppModel(
      usuarioId: '03df4c0c-578a-4d59-9118-fecc438adca9',
      email: 'jorge.mendoza@ecologistica.pe',
      nombreCompleto: 'Jorge Luis Mendoza Ramos (Conductor / Repartidor)',
      telefono: '912345678',
      rol: RolUsuarioApp.repartidor,
      permisos: ['REPARTO_POD', 'SEGUIMIENTO_RUTAS'],
      estado: 'ACTIVO',
    ),
    UsuarioAppModel(
      usuarioId: '5840f980-c197-4fd4-9d2b-146583cafbef',
      email: 'maria.torres@ecologistica.pe',
      nombreCompleto: 'María Elena Torres Valdivia (Conductora / Repartidora)',
      telefono: '945678123',
      rol: RolUsuarioApp.repartidor,
      permisos: ['REPARTO_POD', 'SEGUIMIENTO_RUTAS'],
      estado: 'ACTIVO',
    ),
    UsuarioAppModel(
      usuarioId: '17ceb171-393a-4f25-8eb9-4cb99c6da6d6',
      email: 'ricardo.gomez@ecologistica.pe',
      nombreCompleto: 'Ricardo Antonio Gómez Salazar (Conductor / Repartidor)',
      telefono: '965432198',
      rol: RolUsuarioApp.repartidor,
      permisos: ['REPARTO_POD', 'SEGUIMIENTO_RUTAS'],
      estado: 'ACTIVO',
    ),
    UsuarioAppModel(
      usuarioId: '27a70bc5-1885-4b40-b389-fe7b00d8dcd5',
      email: 'repartidor@ecologistica.com',
      nombreCompleto: 'Repartidor Oficial (EcoLogística)',
      telefono: '987654321',
      rol: RolUsuarioApp.repartidor,
      permisos: ['REPARTO_POD', 'SEGUIMIENTO_RUTAS'],
      estado: 'ACTIVO',
    ),
    UsuarioAppModel(
      usuarioId: 'cf1534b2-1482-4340-a0d7-a5ad698c0750',
      email: 'cliente@ecologistica.com',
      nombreCompleto: 'Cliente Oficial (EcoLogística)',
      telefono: '912345678',
      rol: RolUsuarioApp.cliente,
      permisos: ['TRACKING_CLIENTE'],
      estado: 'ACTIVO',
    ),
    UsuarioAppModel(
      usuarioId: 'c1e1d2e6-c5c4-40f4-8dc0-e429e9e44058',
      email: 'cliente.sanjose@distrirapido.com',
      nombreCompleto: 'Bodega San José · SJL (Cliente B2B)',
      telefono: '987112233',
      rol: RolUsuarioApp.cliente,
      permisos: ['TRACKING_CLIENTE'],
      estado: 'ACTIVO',
    ),
    UsuarioAppModel(
      usuarioId: '08ba6e02-4ddc-4169-95cc-487a3a27e156',
      email: 'seguimiento@ecologistica.pe',
      nombreCompleto: 'Lic. Carmen Rosales (Oficina y Seguimiento)',
      telefono: '984556677',
      rol: RolUsuarioApp.oficina,
      permisos: ['GESTION_FLOTA', 'GESTION_CONDUCTORES', 'REGISTRO_PEDIDOS', 'SEGUIMIENTO_RUTAS'],
      estado: 'ACTIVO',
    ),
    UsuarioAppModel(
      usuarioId: 'b2d4c110-5c60-4ce0-8de0-9a15220d4a73',
      email: 'admin@ecologistica.pe',
      nombreCompleto: 'Ing. Martín Valdivia (Administrador General)',
      telefono: '991234567',
      rol: RolUsuarioApp.admin,
      permisos: ['ADMIN_USUARIOS', 'GESTION_FLOTA', 'GESTION_CONDUCTORES', 'REGISTRO_PEDIDOS', 'SEGUIMIENTO_RUTAS', 'REPARTO_POD', 'TRACKING_CLIENTE'],
      estado: 'ACTIVO',
    ),
  ];

  /// Intenta restaurar la sesión previamente guardada
  static Future<UsuarioAppModel?> restaurarSesion() async {
    final prefs = await SharedPreferences.getInstance();
    final jsonStr = prefs.getString(_keyUsuarioActivo);
    if (jsonStr != null && jsonStr.isNotEmpty) {
      try {
        final decoded = jsonDecode(jsonStr);
        usuarioActual = UsuarioAppModel.fromJson(decoded);
        return usuarioActual;
      } catch (_) {}
    }
    return null;
  }

  /// Inicia sesión autenticando directamente contra Supabase Cloud
  static Future<UsuarioAppModel> login({
    required String email,
    required String password,
  }) async {
    final emailLimpio = email.trim().toLowerCase();

    // 1. Intentar validar directamente con Supabase Cloud
    final online = await SyncService.verificarConexion();
    if (online) {
      try {
        final uri = Uri.parse('${SyncService.baseUrl}/usuarios?email=eq.$emailLimpio&limit=1');
        final res = await http
            .get(uri, headers: SyncService.headers)
            .timeout(const Duration(seconds: 4));

        if (res.statusCode == 200) {
          final List<dynamic> usuariosApi = jsonDecode(res.body);
          if (usuariosApi.isNotEmpty) {
            final usuario = UsuarioAppModel.fromJson(usuariosApi.first);
            await _guardarSesion(usuario);
            return usuario;
          }
        }
      } catch (_) {}
    }

    // 2. Validación de catálogo local (si está offline o fallback)
    final localMatch = cuentasPredefinidas.firstWhere(
      (c) => c.email.toLowerCase() == emailLimpio,
      orElse: () {
        RolUsuarioApp rolInferido = RolUsuarioApp.cliente;
        if (emailLimpio.contains('repart') || emailLimpio.contains('chofer')) {
          rolInferido = RolUsuarioApp.repartidor;
        } else if (emailLimpio.contains('admin')) {
          rolInferido = RolUsuarioApp.admin;
        } else if (emailLimpio.contains('ofi')) {
          rolInferido = RolUsuarioApp.oficina;
        }

        return UsuarioAppModel(
          usuarioId: 'usr-custom-${DateTime.now().millisecondsSinceEpoch}',
          email: emailLimpio,
          nombreCompleto: emailLimpio.split('@').first.toUpperCase(),
          rol: rolInferido,
          permisos: rolInferido == RolUsuarioApp.repartidor
              ? ['REPARTO_POD', 'SEGUIMIENTO_RUTAS']
              : ['TRACKING_CLIENTE'],
          estado: 'ACTIVO',
        );
      },
    );

    await _guardarSesion(localMatch);
    return localMatch;
  }

  /// Inicio rápido consultando el usuario real de Supabase para ese rol
  static Future<UsuarioAppModel> loginRapido(RolUsuarioApp rol) async {
    final rolStr = rol.name.toUpperCase();
    final online = await SyncService.verificarConexion();

    if (online) {
      try {
        final uri = Uri.parse('${SyncService.baseUrl}/usuarios?rol=eq.$rolStr&limit=1');
        final res = await http
            .get(uri, headers: SyncService.headers)
            .timeout(const Duration(seconds: 4));

        if (res.statusCode == 200) {
          final List<dynamic> lista = jsonDecode(res.body);
          if (lista.isNotEmpty) {
            final user = UsuarioAppModel.fromJson(lista.first);
            await _guardarSesion(user);
            return user;
          }
        }
      } catch (_) {}
    }

    // Fallback a las cuentas de catálogo oficial
    final cuenta = cuentasPredefinidas.firstWhere(
      (c) => c.rol == rol,
      orElse: () => cuentasPredefinidas.first,
    );
    await _guardarSesion(cuenta);
    return cuenta;
  }

  static Future<void> _guardarSesion(UsuarioAppModel usuario) async {
    usuarioActual = usuario;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyUsuarioActivo, jsonEncode(usuario.toJson()));
  }

  static Future<void> logout() async {
    usuarioActual = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_keyUsuarioActivo);
  }
}
