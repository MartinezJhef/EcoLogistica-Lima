import 'dart:convert';
import 'dart:io';
import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:ecologistica_mobile/main.dart';
import 'package:ecologistica_mobile/models/usuario_model.dart';
import 'package:ecologistica_mobile/services/local_db_service.dart';
import 'package:ecologistica_mobile/services/sync_service.dart';
import 'package:ecologistica_mobile/services/itinerary_service.dart';

void main() {
  testWidgets('pantallas de cliente y conductor caben en teléfono de 414 px', (tester) async {
    tester.view.physicalSize = const Size(414,896);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    // Use the SDK fonts for readable local review images; layout assertions also run without them.
    final sdk=Platform.environment['FLUTTER_ROOT']??'../../../flutter-sdk';
    await tester.runAsync(() async {
      for(final pair in [['.SF Pro Text','roboto-regular.ttf'],['MaterialIcons','MaterialIcons-Regular.otf']]){
        final file=File('$sdk/bin/cache/artifacts/material_fonts/${pair[1]}');
        if(await file.exists()){
          final loader=FontLoader(pair[0])..addFont(file.readAsBytes().then((b)=>ByteData.sublistView(b)));
          await loader.load();
        }
      }
    });
    SharedPreferences.setMockInitialValues({'ecologistica_access_token':'test'});
    final order={'pedido_id':'p1','codigo_seguimiento':'PED-PRUEBA','cliente_nombre':'Cliente de prueba','direccion_destino':'Av. José Pardo 805, Miraflores','estado':'ASIGNADO','ventana_inicio':'09:00','ventana_fin':'17:00'};
    SyncService.client=MockClient((request) async=>http.Response(request.url.path.endsWith('/health')?'{}':jsonEncode([order]),200));
    ItineraryService.client=MockClient((_) async=>http.Response('[]',200));
    for(final role in ['CLIENTE','REPARTIDOR']) {
      LocalDbService.accountId=role;
      final user=UsuarioAppModel.fromJson({'usuario_id':role,'nombre_completo':'Cuenta de prueba','rol':role,'conductor_id':role=='REPARTIDOR'?'driver-1':null});
      final key=GlobalKey();
      await tester.pumpWidget(RepaintBoundary(key:key,child:EcoLogisticaMobileApp(key:ValueKey(role),usuarioInicial:user)));
      await tester.pumpAndSettle();
      expect(tester.takeException(),isNull);
      expect(find.text('PED-PRUEBA'),findsOneWidget);
      final boundary=key.currentContext!.findRenderObject() as RenderRepaintBoundary;
      await tester.runAsync(()async {
        final image=await boundary.toImage();
        final data=await image.toByteData(format:ui.ImageByteFormat.png);
        final directory=Directory('build/review-images');await directory.create(recursive:true);
        await File('${directory.path}/${role.toLowerCase()}.png').writeAsBytes(data!.buffer.asUint8List());
        image.dispose();
      });
      await tester.pumpWidget(const SizedBox());
    }
  });
}
