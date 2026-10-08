import 'package:flutter_test/flutter_test.dart';
import 'package:ecologistica_mobile/main.dart';

void main() {
  testWidgets('EcoLogística Mobile App smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const EcoLogisticaMobileApp());
    expect(find.text('EcoLogística'), findsOneWidget);
  });
}
