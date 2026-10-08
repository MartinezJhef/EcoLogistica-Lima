import 'package:flutter/material.dart';
import 'theme/apple_theme.dart';
import 'models/usuario_model.dart';
import 'services/auth_service.dart';
import 'services/local_db_service.dart';
import 'screens/auth/login_screen.dart';
import 'screens/repartidor/repartidor_home_screen.dart';
import 'screens/cliente/cliente_home_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await LocalDbService.inicializarSiVacio();
  final usuarioSesion = await AuthService.restaurarSesion();

  runApp(EcoLogisticaMobileApp(usuarioInicial: usuarioSesion));
}

class EcoLogisticaMobileApp extends StatelessWidget {
  final UsuarioAppModel? usuarioInicial;

  const EcoLogisticaMobileApp({super.key, this.usuarioInicial});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'EcoLogística Lima Mobile',
      debugShowCheckedModeBanner: false,
      theme: AppleTheme.darkTheme,
      home: _determinarPantallaInicial(),
    );
  }

  Widget _determinarPantallaInicial() {
    if (usuarioInicial == null) {
      return const LoginScreen();
    }

    if (usuarioInicial!.rol == RolUsuarioApp.repartidor) {
      return RepartidorHomeScreen(usuario: usuarioInicial!);
    } else {
      return ClienteHomeScreen(usuario: usuarioInicial!);
    }
  }
}
