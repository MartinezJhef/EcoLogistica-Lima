import 'dart:convert';

import 'package:flutter/material.dart';

import '../../models/usuario_model.dart';
import '../../models/pedido_mobile_model.dart';
import '../../services/itinerary_service.dart';
import '../../services/local_db_service.dart';
import '../../services/sync_service.dart';

class NuevoPedidoScreen extends StatefulWidget {
  final UsuarioAppModel usuario;
  const NuevoPedidoScreen({super.key, required this.usuario});
  @override
  State<NuevoPedidoScreen> createState() => _NuevoPedidoScreenState();
}

class _NuevoPedidoScreenState extends State<NuevoPedidoScreen> {
  final _name = TextEditingController(),
      _phone = TextEditingController(),
      _address = TextEditingController();
  final _lat = TextEditingController(),
      _lng = TextEditingController(),
      _weight = TextEditingController(),
      _volume = TextEditingController();
  final _start = TextEditingController(text: '08:00'),
      _end = TextEditingController(text: '18:00'),
      _reference = TextEditingController();
  String _access = 'LIBRE_ACCESO', _message = '';
  bool _busy = false;
  @override
  void initState() {
    super.initState();
    _name.text = widget.usuario.nombreCompleto;
    _phone.text = widget.usuario.telefono ?? '';
  }

  @override
  void dispose() {
    for (final c in [
      _name,
      _phone,
      _address,
      _lat,
      _lng,
      _weight,
      _volume,
      _start,
      _end,
      _reference,
    ]) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _locate() async {
    if (_address.text.trim().isEmpty)
      throw Exception('Introduce una dirección de entrega.');
    final uri = Uri.https('nominatim.openstreetmap.org', '/search', {
      'format': 'jsonv2',
      'q': _address.text.trim(),
      'countrycodes': 'pe',
      'bounded': '1',
      'viewbox': '-77.5,-11.5,-76.5,-12.5',
      'limit': '1',
    });
    final response = await ItineraryService.client
        .get(
          uri,
          headers: {
            'Accept-Language': 'es',
            'User-Agent': 'EcoLogistica-Lima/1.0',
          },
        )
        .timeout(const Duration(seconds: 8));
    if (response.statusCode != 200)
      throw Exception(
        'No se pudo localizar la dirección. Introduce coordenadas verificadas o reintenta.',
      );
    final results = jsonDecode(response.body) as List;
    if (results.isEmpty)
      throw Exception(
        'Dirección no encontrada en Lima. Introduce coordenadas verificadas.',
      );
    _lat.text = results.first['lat'].toString();
    _lng.text = results.first['lon'].toString();
  }

  Future<void> _locateFromButton() async {
    setState(() => _busy = true);
    try {
      await _locate();
      if (mounted)
        setState(
          () => _message =
              'Coordenadas encontradas. Verifica el punto antes de guardar.',
        );
    } catch (error) {
      if (mounted) setState(() => _message = error.toString());
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _save() async {
    setState(() {
      _busy = true;
      _message = '';
    });
    try {
      final weight = double.tryParse(_weight.text),
          volume = double.tryParse(_volume.text);
      if (_name.text.trim().isEmpty || _address.text.trim().isEmpty)
        throw Exception('Completa el cliente y la dirección.');
      if (weight == null ||
          !weight.isFinite ||
          weight <= 0 ||
          volume == null ||
          !volume.isFinite ||
          volume <= 0)
        throw Exception('El peso y volumen deben ser mayores que cero.');
      final time = RegExp(r'^(?:[01]\d|2[0-3]):[0-5]\d$');
      if (!time.hasMatch(_start.text) ||
          !time.hasMatch(_end.text) ||
          _end.text.compareTo(_start.text) <= 0)
        throw Exception(
          'La hora de cierre debe ser posterior a la apertura, en formato HH:MM.',
        );
      if (_lat.text.isEmpty && _lng.text.isEmpty) await _locate();
      final lat = double.tryParse(_lat.text), lng = double.tryParse(_lng.text);
      if (lat == null ||
          lng == null ||
          !lat.isFinite ||
          !lng.isFinite ||
          lat < -12.5 ||
          lat > -11.5 ||
          lng < -77.5 ||
          lng > -76.5)
        throw Exception('Introduce coordenadas válidas de Lima.');
      final id = DateTime.now().microsecondsSinceEpoch.toRadixString(36);
      final order = PedidoMobileModel(
        id: 'local-$id',
        codigoSeguimiento: 'PED-$id',
        clienteNombre: _name.text.trim(),
        telefonoContacto: _phone.text.trim(),
        origenDireccion: '',
        origenLat: 0,
        origenLng: 0,
        destinoDireccion: _address.text.trim(),
        destinoLat: lat,
        destinoLng: lng,
        pesoKg: weight,
        volumenM3: volume,
        ventanaInicio: _start.text,
        ventanaFin: _end.text,
        restriccionAcceso: _access,
        referenciaUbicacion: _reference.text.trim(),
        precioProducto: 0,
        metodoPago: 'PAGADO',
        estado: 'PENDIENTE',
        distanciaKm: 0,
        tiempoEstimadoMinutos: 0,
        consumoCombustibleGal: 0,
        emisionCo2Kg: 0,
        isSynced: false,
      );
      await LocalDbService.agregarPedidoLocal(order);
      final result = await SyncService.sincronizarSqlHaciaPostgres();
      if (!mounted) return;
      setState(() => _busy = false);
      await showDialog<void>(
        context: context,
        builder: (ctx) => AlertDialog(
          title: Text(
            result['exito'] == true
                ? 'Pedido confirmado'
                : 'Pedido guardado en el dispositivo',
          ),
          content: Text(
            result['exito'] == true
                ? 'El servidor confirmó el pedido ${order.codigoSeguimiento}. Oficina podrá incluirlo en una ruta.'
                : 'El pedido ${order.codigoSeguimiento} está pendiente de envío. Se reintentará al recuperar la conexión.',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Ver mis pedidos'),
            ),
          ],
        ),
      );
      if (mounted) Navigator.pop(context);
    } catch (error) {
      if (mounted) setState(() => _message = error.toString());
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Widget _field(
    String label,
    TextEditingController controller, {
    bool numeric = false,
  }) => TextField(
    controller: controller,
    enabled: !_busy,
    keyboardType: numeric
        ? const TextInputType.numberWithOptions(decimal: true, signed: true)
        : TextInputType.text,
    decoration: InputDecoration(labelText: label),
  );
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Nuevo pedido')),
    body: ListView(
      padding: const EdgeInsets.all(20),
      children: [
        if (_message.isNotEmpty) Text(_message),
        if (_busy) const LinearProgressIndicator(),
        _field('Nombre del cliente', _name),
        _field('Teléfono de contacto', _phone),
        TextField(
          controller: _address,
          enabled: !_busy,
          decoration: const InputDecoration(labelText: 'Dirección de entrega'),
          onChanged: (_) {
            _lat.clear();
            _lng.clear();
          },
        ),
        TextButton(
          onPressed: _busy ? null : _locateFromButton,
          child: const Text('Localizar dirección'),
        ),
        const Text(
          'Puedes introducir coordenadas verificadas manualmente si la dirección no se encuentra.',
        ),
        _field('Latitud', _lat, numeric: true),
        _field('Longitud', _lng, numeric: true),
        _field('Peso (kg)', _weight, numeric: true),
        _field('Volumen (m³)', _volume, numeric: true),
        _field('Apertura (HH:MM)', _start),
        _field('Cierre (HH:MM)', _end),
        _field('Referencia de entrega', _reference),
        DropdownButtonFormField<String>(
          initialValue: _access,
          decoration: const InputDecoration(labelText: 'Restricción de acceso'),
          onChanged: _busy ? null : (v) => setState(() => _access = v!),
          items: const [
            DropdownMenuItem(
              value: 'LIBRE_ACCESO',
              child: Text('Libre acceso'),
            ),
            DropdownMenuItem(
              value: 'ALTURA_MAXIMA_2_5M',
              child: Text('Altura máxima 2,5 m'),
            ),
            DropdownMenuItem(
              value: 'SOLO_VEHICULOS_LIGEROS',
              child: Text('Solo vehículos ligeros'),
            ),
            DropdownMenuItem(
              value: 'NO_CAMIONES_PESADOS',
              child: Text('Sin camiones pesados'),
            ),
            DropdownMenuItem(
              value: 'ZONA_PEATONAL',
              child: Text('Zona peatonal'),
            ),
          ],
        ),
        const SizedBox(height: 20),
        ElevatedButton(
          onPressed: _busy ? null : _save,
          child: const Text('Guardar pedido'),
        ),
      ],
    ),
  );
}
