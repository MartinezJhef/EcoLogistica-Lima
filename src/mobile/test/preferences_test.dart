import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:ecologistica_mobile/screens/cliente/preferencias_screen.dart';

void main() {
  setUp(() => SharedPreferences.setMockInitialValues({'ecologistica_access_token':'token-test'}));
  final pedido={'ventana_inicio':'08:00:00','ventana_fin':'18:00:00','restriccion_acceso':'ALTURA_MAXIMA_2_5M','referencia_ubicacion':'Puerta roja','estado':'PENDIENTE'};
  testWidgets('cliente guarda sus preferencias autenticadas y conserva cambios ante error',(tester) async {
    var fail=true;Map<String,dynamic>? saved;
    final client=MockClient((request) async {
      expect(request.headers['authorization'],'Bearer token-test');
      if(request.method=='GET') return http.Response(jsonEncode(pedido),200);
      saved=jsonDecode(request.body);
      return fail?http.Response(jsonEncode({'detail':'Sin conexión temporal'}),503):http.Response('{}',200);
    });
    await tester.pumpWidget(MaterialApp(home:PreferenciasScreen(pedidoId:'p1',client:client)));
    await tester.pumpAndSettle();
    await tester.enterText(find.widgetWithText(TextField,'Referencia de entrega'),'Puerta azul');
    await tester.ensureVisible(find.text('Guardar preferencias'));
    await tester.tap(find.text('Guardar preferencias'));await tester.pumpAndSettle();
    expect(find.textContaining('Sin conexión temporal'),findsOneWidget);
    expect(saved?['referencia_ubicacion'],'Puerta azul');
    expect(saved?['restriccion_acceso'],'ALTURA_MAXIMA_2_5M');
    fail=false;
    await tester.tap(find.text('Guardar preferencias'));await tester.pumpAndSettle();
    expect(find.textContaining('Preferencias guardadas'),findsOneWidget);
  });
  testWidgets('no guarda un formulario sin cargar ni permite modificar pedidos en tránsito',(tester) async {
    var loaded=false;
    final client=MockClient((request) async => loaded?http.Response(jsonEncode({...pedido,'estado':'EN_TRANSITO'}),200):http.Response('error',500));
    await tester.pumpWidget(MaterialApp(home:PreferenciasScreen(pedidoId:'p1',client:client)));
    await tester.pumpAndSettle();
    expect(tester.widget<ElevatedButton>(find.byType(ElevatedButton)).onPressed,isNull);
    loaded=true;
    await tester.tap(find.text('Volver a cargar preferencias'));await tester.pumpAndSettle();
    expect(find.textContaining('pedido en tránsito'),findsOneWidget);
    expect(tester.widget<ElevatedButton>(find.byType(ElevatedButton)).onPressed,isNull);
  });
}
