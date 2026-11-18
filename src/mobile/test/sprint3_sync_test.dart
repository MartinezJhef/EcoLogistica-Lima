import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:ecologistica_mobile/models/pedido_mobile_model.dart';
import 'package:ecologistica_mobile/services/local_db_service.dart';
import 'package:ecologistica_mobile/services/sync_service.dart';
import 'package:ecologistica_mobile/services/itinerary_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  setUp(() {
    SharedPreferences.setMockInitialValues({'ecologistica_access_token':'test-token'});
    LocalDbService.accountId = 'user-a';
    SyncService.modoOfflineForzado = false;
  });
  Future<void> queue(String id) async {
    final order = PedidoMobileModel.fromJson({'pedido_id':id, 'codigo_seguimiento':id, 'estado':'EN_TRANSITO', 'is_synced':0});
    await LocalDbService.guardarTodosLosPedidos([...(await LocalDbService.obtenerPedidosLocales()), order]);
    await LocalDbService.encolarTransaccionOutbox({'accion':'ACTUALIZAR_PEDIDO','pedido_id':id,'estado':'EN_TRANSITO'});
  }
  test('failed sends stay pending and later changes cannot overtake them', () async {
    await queue('one'); await queue('two');
    var patches = 0;
    SyncService.client = MockClient((request) async {
      if (request.method == 'GET') return http.Response('{}',200);
      patches++;
      return http.Response('server error',500);
    });
    final result = await SyncService.sincronizarSqlHaciaPostgres();
    expect(result['exito'],false);
    expect((await LocalDbService.obtenerColaOutbox()).length,2);
    expect((await LocalDbService.obtenerPedidosLocales()).every((p) => !p.isSynced),true);
    expect(patches,1);
  });
  test('create confirms the server identifier before sending later delivery updates',() async {
    final order=PedidoMobileModel.fromJson({'id':'local-1','codigo_seguimiento':'CODE-1','cliente_nombre':'Cliente de prueba','destino_direccion':'Av. Lima 100','latitud':-12.05,'longitud':-77.05,'peso_kg':20,'volumen_m3':1,'estado':'PENDIENTE','is_synced':0});
    await LocalDbService.agregarPedidoLocal(order);
    await LocalDbService.actualizarPedidoLocal(order.copyWith(estado:'EN_TRANSITO'));
    var created=false;
    SyncService.client=MockClient((request) async {
      if(request.method=='GET')return http.Response('{}',200);
      if(request.method=='POST'){
        final body=jsonDecode(request.body);
        expect(body['codigo_seguimiento'],'CODE-1');expect(body['latitud'],-12.05);
        created=true;return http.Response(jsonEncode({'pedido_id':'remote-1'}),201);
      }
      expect(created,true);expect(request.url.path.endsWith('/remote-1'),true);
      expect(jsonDecode(request.body)['estado'],'EN_TRANSITO');return http.Response('{}',200);
    });
    final result=await SyncService.sincronizarSqlHaciaPostgres();
    expect(result['cantidadSincronizados'],2);expect(await LocalDbService.obtenerColaOutbox(),isEmpty);
  });
  test('download retains pending local edits while merging confirmed server orders',() async {
    await queue('last-known');
    SyncService.client=MockClient((_) async=>http.Response('error',503));
    expect((await SyncService.descargarPedidosRemotos()).single.id,'last-known');
    SyncService.client=MockClient((request) async=>http.Response(request.url.path.endsWith('/health')?'{}':jsonEncode([{'pedido_id':'remote-1','codigo_seguimiento':'REMOTE','estado':'ASIGNADO'}]),200));
    expect((await SyncService.descargarPedidosRemotos()).map((p)=>p.id),containsAll(['remote-1','last-known']));
    expect((await LocalDbService.obtenerPedidosLocales()).map((p)=>p.id),containsAll(['remote-1','last-known']));
    expect(await SyncService.alternarModoOffline(),false);
    expect(await SyncService.verificarConexion(),false);
    expect(await SyncService.alternarModoOffline(),true);
  });
  test('partial success acknowledges only confirmed operations', () async {
    await queue('one'); await queue('two');
    SyncService.client = MockClient((request) async {
      if (request.method == 'GET') return http.Response('{}',200);
      return request.url.path.endsWith('/one') ? http.Response('{}',200) : http.Response('error',500);
    });
    final result = await SyncService.sincronizarSqlHaciaPostgres();
    expect(result['cantidadSincronizados'],1);
    expect((await LocalDbService.obtenerColaOutbox()).single['pedido_id'],'two');
    final orders = await LocalDbService.obtenerPedidosLocales();
    expect(orders.first.isSynced,true); expect(orders.last.isSynced,false);
  });
  test('new edit added while sending is retained', () async {
    await queue('one');
    SyncService.client = MockClient((request) async {
      if (request.method == 'GET') return http.Response('{}',200);
      await LocalDbService.encolarTransaccionOutbox({'accion':'ACTUALIZAR_PEDIDO','pedido_id':'one','estado':'ENTREGADO'});
      return http.Response('{}',200);
    });
    await SyncService.sincronizarSqlHaciaPostgres();
    expect((await LocalDbService.obtenerColaOutbox()).single['estado'],'ENTREGADO');
    expect((await LocalDbService.obtenerPedidosLocales()).single.isSynced,false);
  });
  test('offline data is separated between accounts on a shared device', () async {
    await queue('private-order');
    LocalDbService.accountId = 'user-b';
    expect(await LocalDbService.obtenerPedidosLocales(),isEmpty);
    expect(await LocalDbService.obtenerColaOutbox(),isEmpty);
    LocalDbService.accountId = 'user-a';
    expect((await LocalDbService.obtenerColaOutbox()).length,1);
  });
  test('return confirmation remains queued when the server is unavailable', () async {
    await LocalDbService.encolarTransaccionOutbox({'accion':'FINALIZAR_RUTA','ruta_id':'route-a'});
    var available = false;
    SyncService.client = MockClient((request) async {
      if (request.method == 'GET') return http.Response('{}',200);
      expect(request.url.path.endsWith('/route-a/finalizar'),true);
      return http.Response('{}',available ? 200 : 503);
    });
    expect((await SyncService.sincronizarSqlHaciaPostgres())['exito'],false);
    expect((await LocalDbService.obtenerColaOutbox()).length,1);
    available = true;
    expect((await SyncService.sincronizarSqlHaciaPostgres())['exito'],true);
    expect(await LocalDbService.obtenerColaOutbox(),isEmpty);
  });
  test('itinerary is saved before acknowledgement, retained offline and deduplicated on retry', () async {
    var ackAttempts = 0;
    final revision = {'update_id':'revision-1','motivo':'CIERRE','itinerario':{'ruta_id':'route-1','tramos':[]}};
    ItineraryService.client = MockClient((request) async {
      expect(request.headers['Authorization'],'Bearer test-token');
      if (request.method == 'GET') return http.Response(jsonEncode([revision]),200);
      expect((await ItineraryService.cached('driver-a')).single['ruta_id'],'route-1');
      ackAttempts++;
      return http.Response('{}',ackAttempts == 1 ? 500 : 200);
    });
    await expectLater(ItineraryService.refresh('driver-a'),throwsException);
    expect((await ItineraryService.cached('driver-a')).length,1);
    expect(await ItineraryService.refresh('driver-a'),0);
    expect((await ItineraryService.cached('driver-a')).length,1);
    ItineraryService.client = MockClient((_) async => throw Exception('offline'));
    await expectLater(ItineraryService.refresh('driver-a'),throwsException);
    expect((await ItineraryService.cached('driver-a')).single['revision'],'revision-1');
  });
}
