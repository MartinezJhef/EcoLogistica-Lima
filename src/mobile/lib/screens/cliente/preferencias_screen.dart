import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';

import '../../services/itinerary_service.dart';

class PreferenciasScreen extends StatefulWidget {
  final String pedidoId;
  final http.Client? client;
  const PreferenciasScreen({super.key, required this.pedidoId, this.client});
  @override
  State<PreferenciasScreen> createState() => _PreferenciasScreenState();
}

class _PreferenciasScreenState extends State<PreferenciasScreen> {
  final _inicio = TextEditingController(),
      _fin = TextEditingController(),
      _referencia = TextEditingController(),
      _telefono = TextEditingController();
  String _restriccion = 'LIBRE_ACCESO', _foto = '', _message = '';
  bool _busy = true, _transito = false, _loaded = false;
  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _inicio.dispose();
    _fin.dispose();
    _referencia.dispose();
    _telefono.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    if (mounted) setState(() => _busy = true);
    try {
      final response = await (widget.client ?? ItineraryService.client)
          .get(
            Uri.parse(
              '${ItineraryService.apiUrl}/mobile/pedidos/${widget.pedidoId}',
            ),
            headers: await ItineraryService.headers(),
          )
          .timeout(const Duration(seconds: 8));
      if (response.statusCode != 200)
        throw Exception('No se pudo consultar este pedido.');
      final p = jsonDecode(response.body);
      _inicio.text = p['ventana_inicio'].toString().substring(0, 5);
      _fin.text = p['ventana_fin'].toString().substring(0, 5);
      _referencia.text = p['referencia_ubicacion'] ?? '';
      _telefono.text = p['telefono_contacto'] ?? '';
      _restriccion = p['restriccion_acceso'] ?? 'LIBRE_ACCESO';
      _foto = p['foto_referencia_url'] ?? '';
      _transito = p['estado'] == 'EN_TRANSITO';
      _loaded = true;
      _message = '';
    } catch (_) {
      _message = 'No se pudieron cargar las preferencias. Revisa la conexión.';
    }
    if (mounted) setState(() => _busy = false);
  }

  Future<void> _pick() async {
    final image = await ImagePicker().pickImage(
      source: ImageSource.gallery,
      maxWidth: 1600,
      imageQuality: 80,
    );
    if (image == null) return;
    final bytes = await image.readAsBytes();
    if (bytes.length > 3 * 1024 * 1024) {
      if (mounted)
        setState(() => _message = 'La foto debe pesar como máximo 3 MB.');
      return;
    }
    final mime =
        image.mimeType ??
        (image.name.toLowerCase().endsWith('.png')
            ? 'image/png'
            : 'image/jpeg');
    if (!['image/jpeg', 'image/png', 'image/webp'].contains(mime)) {
      if (mounted)
        setState(() => _message = 'Usa una fotografía JPG, PNG o WebP.');
      return;
    }
    if (mounted)
      setState(() => _foto = 'data:$mime;base64,${base64Encode(bytes)}');
  }

  Future<void> _save() async {
    setState(() => _busy = true);
    try {
      final response = await (widget.client ?? ItineraryService.client)
          .patch(
            Uri.parse(
              '${ItineraryService.apiUrl}/mobile/pedidos/${widget.pedidoId}/preferencias',
            ),
            headers: await ItineraryService.headers(),
            body: jsonEncode({
              'ventana_inicio': _inicio.text,
              'ventana_fin': _fin.text,
              'restriccion_acceso': _restriccion,
              'referencia_ubicacion': _referencia.text,
              'telefono_contacto': _telefono.text,
              'foto_referencia_url': _foto,
            }),
          )
          .timeout(const Duration(seconds: 10));
      if (response.statusCode != 200) {
        final data = jsonDecode(response.body);
        throw Exception(data['detail'] ?? 'No se guardaron los cambios.');
      }
      if (mounted)
        setState(
          () => _message =
              'Preferencias guardadas y aplicadas al cálculo de rutas.',
        );
    } catch (error) {
      if (mounted) setState(() => _message = error.toString());
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Mis preferencias de entrega')),
    body: ListView(
      padding: const EdgeInsets.all(20),
      children: [
        if (_message.isNotEmpty) Text(_message),
        if (!_loaded && !_busy)
          TextButton(
            onPressed: _load,
            child: const Text('Volver a cargar preferencias'),
          ),
        if (_transito)
          const Text(
            'No se pueden alterar las preferencias de un pedido en tránsito.',
          ),
        TextField(
          controller: _inicio,
          enabled: !_busy && !_transito,
          decoration: const InputDecoration(
            labelText: 'Hora de apertura (HH:MM)',
          ),
        ),
        TextField(
          controller: _fin,
          enabled: !_busy && !_transito,
          decoration: const InputDecoration(
            labelText: 'Hora de cierre (HH:MM)',
          ),
        ),
        DropdownButtonFormField<String>(
          key: ValueKey(_restriccion),
          initialValue: _restriccion,
          decoration: const InputDecoration(labelText: 'Restricción de acceso'),
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
          onChanged: _busy || _transito
              ? null
              : (value) => setState(() => _restriccion = value!),
        ),
        TextField(
          controller: _referencia,
          enabled: !_busy && !_transito,
          decoration: const InputDecoration(labelText: 'Referencia de entrega'),
        ),
        TextField(
          controller: _telefono,
          enabled: !_busy && !_transito,
          decoration: const InputDecoration(labelText: 'Teléfono de contacto'),
        ),
        TextButton(
          onPressed: _busy || _transito ? null : _pick,
          child: Text(
            _foto.isEmpty
                ? 'Adjuntar fotografía de referencia'
                : 'Cambiar fotografía de referencia',
          ),
        ),
        ElevatedButton(
          onPressed: _busy || _transito || !_loaded ? null : _save,
          child: Text(_busy ? 'Procesando…' : 'Guardar preferencias'),
        ),
      ],
    ),
  );
}
