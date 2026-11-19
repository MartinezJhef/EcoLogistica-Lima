import 'package:flutter_test/flutter_test.dart';
import 'package:ecologistica_mobile/main.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:ecologistica_mobile/services/sync_service.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

void main() {
  testWidgets('EcoLogística Mobile App smoke test', (WidgetTester tester) async {
    SharedPreferences.setMockInitialValues({});
    SyncService.client = MockClient((_) async => http.Response('{}',200));
    addTearDown(SyncService.stopRetryTimer);
    await tester.pumpWidget(const EcoLogisticaMobileApp());
    expect(find.text('EcoLogística'), findsOneWidget);
  });
}
