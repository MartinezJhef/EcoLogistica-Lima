import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../theme/apple_theme.dart';
import '../../models/usuario_model.dart';
import '../../services/auth_service.dart';
import '../../services/sync_service.dart';
import '../repartidor/repartidor_home_screen.dart';
import '../cliente/cliente_home_screen.dart';
import '../../widgets/apple_button.dart';
import '../../widgets/apple_glass_card.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  bool _cargando = false;
  String? _errorMensaje;
  bool _probandoConexion = false;

  @override
  void initState() {
    super.initState();
    _iniciarConectividad();
  }

  Future<void> _iniciarConectividad() async {
    setState(() => _probandoConexion = true);
    await SyncService.inicializar();
    if (mounted) {
      setState(() => _probandoConexion = false);
    }
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _navegarSegunRol(UsuarioAppModel usuario) {
    if (usuario.rol == RolUsuarioApp.repartidor) {
      Navigator.pushReplacement(
        context,
        CupertinoPageRoute(builder: (_) => RepartidorHomeScreen(usuario: usuario)),
      );
    } else {
      Navigator.pushReplacement(
        context,
        CupertinoPageRoute(builder: (_) => ClienteHomeScreen(usuario: usuario)),
      );
    }
  }

  Future<void> _handleLogin() async {
    setState(() {
      _cargando = true;
      _errorMensaje = null;
    });

    try {
      final user = await AuthService.login(
        email: _emailController.text,
        password: _passwordController.text,
      );
      if (mounted) {
        _navegarSegunRol(user);
      }
    } catch (e) {
      setState(() {
        _errorMensaje = 'Error al verificar credenciales con la base de datos.';
      });
    } finally {
      if (mounted) {
        setState(() => _cargando = false);
      }
    }
  }


  void _mostrarDialogoConfigurarHost() {
    final hostController = TextEditingController(text: SyncService.baseUrl);

    showCupertinoDialog(
      context: context,
      builder: (ctx) => CupertinoAlertDialog(
        title: const Text('Conexión con Supabase Cloud'),
        content: Padding(
          padding: const EdgeInsets.only(top: 12.0),
          child: Column(
            children: [
              const Text(
                'Endpoint de Supabase (PostgreSQL 16 + PostGIS 3.3.7):',
                style: TextStyle(fontSize: 12),
              ),
              const SizedBox(height: 12),
              CupertinoTextField(
                controller: hostController,
                placeholder: SyncService.defaultSupabaseUrl,
                style: const TextStyle(fontSize: 13),
              ),
              const SizedBox(height: 8),
              const Text(
                '• Nube: https://mpeonclcibezbdzdurey.supabase.co/rest/v1',
                style: TextStyle(fontSize: 11, color: CupertinoColors.systemGrey),
                textAlign: TextAlign.left,
              ),
            ],
          ),
        ),
        actions: [
          CupertinoDialogAction(
            child: const Text('Cancelar'),
            onPressed: () => Navigator.pop(ctx),
          ),
          CupertinoDialogAction(
            isDefaultAction: true,
            child: const Text('Conectar'),
            onPressed: () async {
              Navigator.pop(ctx);
              setState(() => _probandoConexion = true);
              await SyncService.setCustomHost(hostController.text);
              if (mounted) {
                setState(() => _probandoConexion = false);
              }
            },
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Identidad Visual EcoLogística Lima
                Container(
                  width: 68,
                  height: 68,
                  decoration: BoxDecoration(
                    color: AppleTheme.accentBlue,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: AppleTheme.borderSpecular, width: 1.5),
                    boxShadow: const [
                      BoxShadow(
                        color: Color(0x33556B2F),
                        blurRadius: 16,
                        offset: Offset(0, 6),
                      ),
                    ],
                  ),
                  child: const Center(
                    child: Icon(
                      CupertinoIcons.sparkles,
                      color: Color(0xFFF5F4EE),
                      size: 34,
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                const Text(
                  'EcoLogística',
                  style: TextStyle(
                    fontSize: 26,
                    fontWeight: FontWeight.w800,
                    letterSpacing: -0.6,
                    color: AppleTheme.textPrimary,
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'App Móvil · Acceso al Sistema',
                  style: TextStyle(
                    fontSize: 13,
                    color: AppleTheme.textSecondary,
                  ),
                ),
                const SizedBox(height: 18),

                // Badge de Estado de Conexión a PostgreSQL en Docker
                GestureDetector(
                  onTap: _mostrarDialogoConfigurarHost,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                    decoration: BoxDecoration(
                      color: SyncService.isOnline
                          ? AppleTheme.accentGreen.withValues(alpha: 0.15)
                          : AppleTheme.accentOrange.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: SyncService.isOnline
                            ? AppleTheme.accentGreen.withValues(alpha: 0.4)
                            : AppleTheme.accentOrange.withValues(alpha: 0.4),
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: SyncService.isOnline
                                ? AppleTheme.accentGreen
                                : AppleTheme.accentOrange,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          _probandoConexion
                              ? 'Comprobando Supabase Cloud...'
                              : (SyncService.isOnline
                                  ? 'Supabase Conectado (PostGIS 3.3.7)'
                                  : 'Modo Offline SQL · Toca para conectar'),
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: SyncService.isOnline
                                ? AppleTheme.accentGreen
                                : AppleTheme.accentOrange,
                          ),
                        ),
                        const SizedBox(width: 6),
                        const Icon(CupertinoIcons.settings, size: 12, color: AppleTheme.textSecondary),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // Tarjeta de Formulario de Login Obsidian Glass
                AppleGlassCard(
                  padding: const EdgeInsets.all(22),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Autenticación en Base de Datos',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: AppleTheme.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'Verifica usuarios y roles reales registrados en PostgreSQL.',
                        style: TextStyle(
                          fontSize: 12,
                          color: AppleTheme.textSecondary,
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Campo Correo
                      const Text(
                        'CORREO ELECTRÓNICO REGISTRADO',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: AppleTheme.textSecondary,
                          letterSpacing: 0.4,
                        ),
                      ),
                      const SizedBox(height: 6),
                      CupertinoTextField(
                        controller: _emailController,
                        placeholder: 'repartidor.juan@ecologistica.pe',
                        placeholderStyle: const TextStyle(color: AppleTheme.textTertiary),
                        style: const TextStyle(color: AppleTheme.textPrimary, fontSize: 14),
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: AppleTheme.borderSubtle, width: 1.5),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Campo Contraseña
                      const Text(
                        'CONTRASEÑA',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: AppleTheme.textSecondary,
                          letterSpacing: 0.4,
                        ),
                      ),
                      const SizedBox(height: 6),
                      CupertinoTextField(
                        controller: _passwordController,
                        obscureText: true,
                        placeholder: '••••••••',
                        placeholderStyle: const TextStyle(color: AppleTheme.textTertiary),
                        style: const TextStyle(color: AppleTheme.textPrimary, fontSize: 14),
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: AppleTheme.borderSubtle, width: 1.5),
                        ),
                      ),

                      if (_errorMensaje != null) ...[
                        const SizedBox(height: 14),
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: AppleTheme.accentRed.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: AppleTheme.accentRed.withValues(alpha: 0.3)),
                          ),
                          child: Row(
                            children: [
                              const Icon(CupertinoIcons.exclamationmark_circle, color: AppleTheme.accentRed, size: 16),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  _errorMensaje!,
                                  style: const TextStyle(color: AppleTheme.accentRed, fontSize: 12),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],

                      const SizedBox(height: 22),
                      AppleButton(
                        text: 'Ingresar con PostgreSQL',
                        icon: CupertinoIcons.arrow_right_circle_fill,
                        isLoading: _cargando,
                        onPressed: _handleLogin,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Footer Sys MTZ
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: const [
                    Icon(CupertinoIcons.shield_lefthalf_fill, size: 14, color: AppleTheme.accentCyan),
                    SizedBox(width: 6),
                    Text(
                      'Sys MTZ',
                      style: TextStyle(
                        fontSize: 12,
                        color: AppleTheme.textTertiary,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 0.2,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
