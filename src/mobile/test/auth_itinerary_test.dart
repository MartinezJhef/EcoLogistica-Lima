import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:ecologistica_mobile/models/usuario_model.dart';
import 'package:ecologistica_mobile/services/auth_service.dart';
import 'package:ecologistica_mobile/services/itinerary_service.dart';
import 'package:ecologistica_mobile/services/local_db_service.dart';
import 'package:ecologistica_mobile/services/sync_service.dart';
import 'package:ecologistica_mobile/widgets/itinerary_panel.dart';

void main(){
  setUp((){SharedPreferences.setMockInitialValues({});AuthService.usuarioActual=null;LocalDbService.accountId='';SyncService.modoOfflineForzado=false;});
  test('autentica con la API, restaura la cuenta y elimina su sesión al salir',() async {
    expect(await AuthService.restaurarSesion(),isNull);
    ItineraryService.client=MockClient((request) async {
      expect(jsonDecode(request.body),{'email':'ana@example.test','password':'test-only-password'});
      return http.Response(jsonEncode({'access_token':'test-only-token','usuario':{'usuario_id':'user-1','conductor_id':'driver-1','nombre_completo':'Ana','email':'ana@example.test','rol':'REPARTIDOR','permisos':['SEGUIMIENTO_RUTAS'],'estado':'ACTIVO'}}),200);
    });
    final user=await AuthService.login(email:' ANA@example.test ',password:'test-only-password');
    expect(user.rol,RolUsuarioApp.repartidor);expect(LocalDbService.accountId,'user-1');
    AuthService.usuarioActual=null;
    expect((await AuthService.restaurarSesion())?.conductorId,'driver-1');
    await AuthService.logout();expect(LocalDbService.accountId,'');
    expect(await AuthService.restaurarSesion(),isNull);
    final prefs=await SharedPreferences.getInstance();
    await prefs.setString('ecologistica_access_token','test');await prefs.setString('ecologistica_sesion_activa','invalid-json');
    expect(await AuthService.restaurarSesion(),isNull);
  });
  test('rechaza credenciales y evita saltarse el acceso con el rol',() async {
    ItineraryService.client=MockClient((_) async=>http.Response('{}',401));
    await expectLater(AuthService.login(email:'ana@example.test',password:'wrong'),throwsException);
    await expectLater(AuthService.loginRapido(RolUsuarioApp.admin),throwsException);
    expect(AuthService.usuarioActual,isNull);
    for(final role in ['ADMIN','OFICINA','CLIENTE','CONDUCTOR']){
      final u=UsuarioAppModel.fromJson({'usuario_id':'u','rol':role,'permisos':['P']});
      expect(UsuarioAppModel.fromJson(u.toJson()).rol,u.rol);
    }
  });
  testWidgets('conserva el itinerario y su dibujo vial cuando falla la conexión',(tester) async {
    SharedPreferences.setMockInitialValues({'ecologistica_access_token':'test'});
    final route={'ruta_id':'route-1','estado':'EN_EJECUCION','distancia_total_km':4,'tiempo_total_min':30,'tramos':[
      {'pedido_id':'p1','estado_pedido':'ENTREGADO','orden_secuencia':1,'descripcion':'Entrega confirmada','tiempo_estimado_min':20,'co2_tramo_kg':0,
        'geometria_linea_geojson':jsonEncode({'coordinates':[[-77.05,-12.05],[-77.04,-12.04]]})}]};
    var offline=false;
    ItineraryService.client=MockClient((request) async {
      if(offline)throw Exception('offline');
      return http.Response(request.method=='GET'?jsonEncode([{'update_id':'rev-1','itinerario':route}]):'{}',200);
    });
    SyncService.client=MockClient((_) async=>http.Response('{}',503));
    await tester.pumpWidget(const MaterialApp(home:Scaffold(body:SingleChildScrollView(child:ItineraryPanel(driverId:'driver-1')))));
    await tester.pumpAndSettle();
    expect(find.text('Nuevo itinerario recibido y guardado'),findsOneWidget);
    await tester.tap(find.byType(ExpansionTile));await tester.pumpAndSettle();
    expect(find.text('Entrega confirmada'),findsOneWidget);
    offline=true;
    await tester.tap(find.byTooltip('Actualizar itinerario'));await tester.pumpAndSettle();
    expect(find.textContaining('se conserva el último itinerario'),findsOneWidget);
    expect(find.text('Entrega confirmada'),findsOneWidget);
    await tester.tap(find.text('Confirmo que regresé al depósito: finalizar ruta'));await tester.pumpAndSettle();
    expect((await LocalDbService.obtenerColaOutbox()).single['ruta_id'],'route-1');
    await tester.pumpWidget(const SizedBox());
  });
  testWidgets('explica cómo recibir rutas cuando la cuenta no tiene conductor',(tester) async {
    await tester.pumpWidget(const MaterialApp(home:Scaffold(body:ItineraryPanel())));
    expect(find.textContaining('Vincula tu cuenta'),findsOneWidget);
    await tester.pumpWidget(const SizedBox());
  });
}
