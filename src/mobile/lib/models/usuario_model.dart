enum RolUsuarioApp {
  repartidor,
  cliente,
  oficina,
  admin,
}

class UsuarioAppModel {
  final String usuarioId;
  final String email;
  final String nombreCompleto;
  final String? telefono;
  final RolUsuarioApp rol;
  final List<String> permisos;
  final String estado;

  UsuarioAppModel({
    required this.usuarioId,
    required this.email,
    required this.nombreCompleto,
    this.telefono,
    required this.rol,
    required this.permisos,
    required this.estado,
  });

  factory UsuarioAppModel.fromJson(Map<String, dynamic> json) {
    final rolStr = (json['rol'] as String? ?? 'CLIENTE').toUpperCase();
    RolUsuarioApp rolEnum;
    if (rolStr.contains('REPART') || rolStr.contains('CONDUCTOR')) {
      rolEnum = RolUsuarioApp.repartidor;
    } else if (rolStr.contains('ADMIN')) {
      rolEnum = RolUsuarioApp.admin;
    } else if (rolStr.contains('OFICINA') || rolStr.contains('OPERADOR')) {
      rolEnum = RolUsuarioApp.oficina;
    } else {
      rolEnum = RolUsuarioApp.cliente;
    }

    return UsuarioAppModel(
      usuarioId: json['usuario_id'] ?? json['id'] ?? 'usr-001',
      email: json['email'] ?? '',
      nombreCompleto: json['nombre_completo'] ?? json['nombre'] ?? 'Usuario',
      telefono: json['telefono'],
      rol: rolEnum,
      permisos: (json['permisos'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
      estado: json['estado'] ?? 'ACTIVO',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'usuario_id': usuarioId,
      'email': email,
      'nombre_completo': nombreCompleto,
      'telefono': telefono,
      'rol': rol.name.toUpperCase(),
      'permisos': permisos,
      'estado': estado,
    };
  }
}
