import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:ecologistica_mobile/main.dart';
import 'package:ecologistica_mobile/models/pedido_mobile_model.dart';
import 'package:ecologistica_mobile/models/usuario_model.dart';
import 'package:ecologistica_mobile/services/auth_service.dart';
import 'package:ecologistica_mobile/services/local_db_service.dart';
import 'package:ecologistica_mobile/services/sync_service.dart';
import 'package:ecologistica_mobile/services/itinerary_service.dart';
import 'package:ecologistica_mobile/screens/cliente/nuevo_pedido_screen.dart';
import 'package:ecologistica_mobile/screens/repartidor/pedido_detalle_screen.dart';

void main() {
  final customer = UsuarioAppModel.fromJson({
    'usuario_id': 'user-client',
    'nombre_completo': 'Cliente de prueba',
    'rol': 'CLIENTE',
  });
  final driver = UsuarioAppModel.fromJson({
    'usuario_id': 'user-driver',
    'conductor_id': 'driver-1',
    'nombre_completo': 'Conductor de prueba',
    'rol': 'REPARTIDOR',
  });
  final raw = {
    'pedido_id': 'order-1',
    'codigo_seguimiento': 'ORDER-1',
    'cliente_nombre': 'Cliente real',
    'direccion_destino': 'Av. Lima 100',
    'latitud': -12.05,
    'longitud': -77.05,
    'estado': 'ASIGNADO',
    'ventana_inicio': '09:00',
    'ventana_fin': '17:00',
    'restriccion_acceso': 'LIBRE_ACCESO',
    'referencia_ubicacion': 'Puerta azul',
  };
  setUp(() {
    SharedPreferences.setMockInitialValues({
      'ecologistica_access_token': 'test-token',
    });
    LocalDbService.accountId = 'user-client';
    SyncService.modoOfflineForzado = false;
    SyncService.client = MockClient(
      (request) async => http.Response(
        request.url.path.endsWith('/health') ? '{}' : jsonEncode([raw]),
        200,
      ),
    );
    ItineraryService.client = MockClient(
      (request) async => http.Response(
        request.url.path.endsWith('/actualizaciones') ? '[]' : jsonEncode(raw),
        200,
      ),
    );
  });
  tearDown(SyncService.stopRetryTimer);
  Future<void> large(WidgetTester tester) async {
    tester.view.physicalSize = const Size(1000, 3000);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
  }

  Future<void> fill(WidgetTester tester, String label, String text) async {
    final field = find.byWidgetPredicate(
      (w) => w is TextField && w.decoration?.labelText == label,
    );
    await tester.ensureVisible(field);
    await tester.enterText(field, text);
  }

  testWidgets('cliente ve su pedido, abre preferencias y cierra su sesión', (
    tester,
  ) async {
    await large(tester);
    await tester.pumpWidget(EcoLogisticaMobileApp(usuarioInicial: customer));
    await tester.pumpAndSettle();
    expect(find.text('ORDER-1'), findsOneWidget);
    expect(find.text('Estado: ASIGNADO'), findsOneWidget);
    await tester.tap(find.text('Preferencias de ORDER-1'));
    await tester.pumpAndSettle();
    expect(find.text('Mis preferencias de entrega'), findsOneWidget);
    await tester.pageBack();
    await tester.pumpAndSettle();
    await tester.tap(find.byTooltip('Actualizar pedidos'));
    await tester.pumpAndSettle();
    await tester.tap(find.byTooltip('Cerrar sesión'));
    await tester.pumpAndSettle();
    expect(AuthService.usuarioActual, isNull);
    expect(find.text('EcoLogística'), findsOneWidget);
    await tester.pumpWidget(const SizedBox());
    SyncService.stopRetryTimer();
  });
  testWidgets('repartidor consulta su itinerario y abre una entrega asignada', (
    tester,
  ) async {
    await large(tester);
    LocalDbService.accountId = driver.usuarioId;
    await tester.pumpWidget(EcoLogisticaMobileApp(usuarioInicial: driver));
    await tester.pumpAndSettle();
    expect(find.text('Mi itinerario'), findsOneWidget);
    expect(find.text('ORDER-1'), findsOneWidget);
    await tester.tap(find.text('ORDER-1'));
    await tester.pumpAndSettle();
    expect(find.text('Iniciar entrega'), findsOneWidget);
    expect(find.text('Referencia: Puerta azul'), findsOneWidget);
    await tester.pageBack();
    await tester.pumpAndSettle();
    await tester.tap(find.byTooltip('Sincronizar reparto'));
    await tester.pumpAndSettle();
    expect(find.text('0 operaciones pendientes de envío'), findsOneWidget);
    await tester.tap(find.byTooltip('Cerrar sesión'));
    await tester.pumpAndSettle();
    expect(find.text('EcoLogística'), findsOneWidget);
    await tester.pumpWidget(const SizedBox());
    SyncService.stopRetryTimer();
  });
  testWidgets(
    'tener conexión no confirma una entrega rechazada: conserva la cola y el aviso',
    (tester) async {
      await large(tester);
      final order = PedidoMobileModel.fromJson(raw);
      await LocalDbService.guardarTodosLosPedidos([order]);
      SyncService.client = MockClient(
        (request) async =>
            http.Response('{}', request.method == 'GET' ? 200 : 503),
      );
      await tester.pumpWidget(
        MaterialApp(
          home: PedidoDetalleScreen(pedido: order, usuario: driver),
        ),
      );
      await tester.tap(find.text('Iniciar entrega'));
      await tester.pumpAndSettle();
      expect(
        find.textContaining('Cambio pendiente de confirmación'),
        findsOneWidget,
      );
      expect(
        (await LocalDbService.obtenerColaOutbox()).single['estado'],
        'EN_TRANSITO',
      );
      expect(
        (await LocalDbService.obtenerPedidosLocales()).single.isSynced,
        false,
      );
      expect(find.text('Estado confirmado por el servidor.'), findsNothing);
      await tester.tap(find.text('Confirmar entrega'));
      await tester.pumpAndSettle();
      expect((await LocalDbService.obtenerColaOutbox()).length, 2);
      await tester.pumpWidget(const SizedBox());
    },
  );
  testWidgets('solo muestra confirmación cuando el servidor acepta el estado', (
    tester,
  ) async {
    await large(tester);
    final order = PedidoMobileModel.fromJson({...raw, 'estado': 'EN_TRANSITO'});
    await LocalDbService.guardarTodosLosPedidos([order]);
    SyncService.client = MockClient((_) async => http.Response('{}', 200));
    await tester.pumpWidget(
      MaterialApp(
        home: PedidoDetalleScreen(pedido: order, usuario: driver),
      ),
    );
    await tester.tap(find.text('Registrar entrega no realizada'));
    await tester.pumpAndSettle();
    expect(find.text('Estado: NO_ENTREGADO'), findsOneWidget);
    expect(find.text('Estado confirmado por el servidor.'), findsOneWidget);
    expect(await LocalDbService.obtenerColaOutbox(), isEmpty);
  });
  testWidgets(
    'registro valida carga y horario, conserva un rechazo y envía todos los datos reales',
    (tester) async {
      await large(tester);
      await tester.pumpWidget(
        MaterialApp(
          home: Builder(
            builder: (context) => TextButton(
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => NuevoPedidoScreen(usuario: customer),
                ),
              ),
              child: const Text('Abrir registro'),
            ),
          ),
        ),
      );
      await tester.tap(find.text('Abrir registro'));
      await tester.pumpAndSettle();
      await fill(tester, 'Dirección de entrega', 'Av. Lima 100');
      await tester.tap(find.text('Guardar pedido'));
      await tester.pumpAndSettle();
      expect(find.textContaining('peso y volumen'), findsOneWidget);
      await fill(tester, 'Peso (kg)', '20');
      await fill(tester, 'Volumen (m³)', '1');
      await fill(tester, 'Apertura (HH:MM)', '18:00');
      await fill(tester, 'Cierre (HH:MM)', '09:00');
      await tester.tap(find.text('Guardar pedido'));
      await tester.pumpAndSettle();
      expect(find.textContaining('posterior a la apertura'), findsOneWidget);
      await fill(tester, 'Apertura (HH:MM)', '09:00');
      await fill(tester, 'Cierre (HH:MM)', '17:00');
      await fill(tester, 'Referencia de entrega', 'Puerta azul');
      ItineraryService.client = MockClient(
        (_) async => http.Response(
          jsonEncode([
            {'lat': '-12.05', 'lon': '-77.05'},
          ]),
          200,
        ),
      );
      SyncService.client = MockClient((request) async {
        if (request.method == 'GET') return http.Response('{}', 200);
        final body = jsonDecode(request.body);
        expect(body['ventana_inicio'], '09:00');
        expect(body['ventana_fin'], '17:00');
        expect(body['peso_kg'], 20);
        expect(body['volumen_m3'], 1);
        expect(body['referencia_ubicacion'], 'Puerta azul');
        return http.Response('{}', 503);
      });
      await tester.tap(find.text('Guardar pedido'));
      await tester.pumpAndSettle();
      expect(find.text('Pedido guardado en el dispositivo'), findsOneWidget);
      expect(find.text('Pedido confirmado'), findsNothing);
      expect((await LocalDbService.obtenerColaOutbox()).length, 1);
      await tester.tap(find.text('Ver mis pedidos'));
      await tester.pumpAndSettle();
      expect(find.text('Abrir registro'), findsOneWidget);
    },
  );
}
