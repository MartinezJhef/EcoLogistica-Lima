import 'dart:io';

/// Global coverage of the application libraries loaded by the test suite.
void main(List<String> args) {
  final source = File(args.isEmpty ? 'coverage/lcov.info' : args.first);
  final lines = source.readAsLinesSync();
  var found = 0, hit = 0;
  for (final line in lines) {
    if (line.startsWith('LF:')) found += int.parse(line.substring(3));
    if (line.startsWith('LH:')) hit += int.parse(line.substring(3));
  }
  if (found == 0) throw StateError('No se encontró cobertura ejecutable.');
  final percent = 100 * hit / found;
  stdout.writeln(
    'Cobertura móvil: $hit/$found líneas (${percent.toStringAsFixed(2)} %). Umbral: 80 %.',
  );
  if (percent < 80) exitCode = 1;
}
