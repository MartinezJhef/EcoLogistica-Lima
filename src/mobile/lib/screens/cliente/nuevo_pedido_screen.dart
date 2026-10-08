import 'dart:math';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../theme/apple_theme.dart';
import '../../models/usuario_model.dart';
import '../../models/pedido_mobile_model.dart';
import '../../services/local_db_service.dart';
import '../../services/sync_service.dart';
import '../../services/routing_calculator.dart';
import '../../widgets/apple_button.dart';
import '../../widgets/apple_glass_card.dart';

class DestinoOpcion {
  final String nombre;
  final String direccion;
  final double lat;
  final double lng;

  DestinoOpcion(this.nombre, this.direccion, this.lat, this.lng);
}

class NuevoPedidoScreen extends StatefulWidget {
  final UsuarioAppModel usuario;

  const NuevoPedidoScreen({super.key, required this.usuario});

  @override
  State<NuevoPedidoScreen> createState() => _NuevoPedidoScreenState();
}

class _NuevoPedidoScreenState extends State<NuevoPedidoScreen> {
  final List<DestinoOpcion> _puntosDisponibles = [
    DestinoOpcion('Centro de Distribución EcoLogística', 'Av. Argentina 2050, Cercado de Lima', -12.046374, -77.042793),
    DestinoOpcion('Almacén Central SJL', 'Av. Próceres de la Independencia 1420, SJL', -12.001200, -77.012300),
    DestinoOpcion('Bodega San José · Canto Grande', 'Av. Canto Grande 2450, SJL', -11.995000, -77.008000),
    DestinoOpcion('Minimarket Los Laureles · Ate', 'Av. Los Frutales 120, Ate', -12.045000, -76.965000),
    DestinoOpcion('Tienda Orgánica Miraflores', 'Av. Larco 880, Miraflores', -12.125000, -77.029000),
    DestinoOpcion('Comercial Los Olivos', 'Av. Antúnez de Mayolo 1120, Los Olivos', -11.989000, -77.072000),
  ];

  late DestinoOpcion _puntoA;
  late DestinoOpcion _puntoB;

  final TextEditingController _clienteNombreController = TextEditingController();
  final TextEditingController _telefonoController = TextEditingController(text: '998877665');
  final TextEditingController _precioController = TextEditingController(text: '55.00');

  String _metodoPago = 'CONTRAENTREGA'; // 'PAGADO' | 'CONTRAENTREGA'
  bool _guardando = false;

  // Métricas calculadas dinámicamente
  double _distanciaKm = 0.0;
  int _tiempoMin = 0;
  double _co2Kg = 0.0;
  double _combustibleGal = 0.0;
  double _fleteCalculado = 18.0;

  @override
  void initState() {
    super.initState();
    _puntoA = _puntosDisponibles[0];
    _puntoB = _puntosDisponibles[2];
    _clienteNombreController.text = widget.usuario.nombreCompleto;
    _recalcularMetricas();
  }

  void _recalcularMetricas() {
    final dist = RoutingCalculatorService.calcularDistanciaKm(
      lat1: _puntoA.lat,
      lon1: _puntoA.lng,
      lat2: _puntoB.lat,
      lon2: _puntoB.lng,
    );
    final tiempo = RoutingCalculatorService.calcularTiempoEstimadoMinutos(dist);
    final co2 = RoutingCalculatorService.calcularEmisionesCo2Kg(dist);
    final combustible = RoutingCalculatorService.calcularConsumoGalones(dist);
    final flete = double.parse((12.0 + (dist * 0.95)).toStringAsFixed(2));

    setState(() {
      _distanciaKm = dist;
      _tiempoMin = tiempo;
      _co2Kg = co2;
      _combustibleGal = combustible;
      _fleteCalculado = flete;
    });
  }

  Future<void> _handleCrearPedido() async {
    final precio = double.tryParse(_precioController.text.trim()) ?? 0.0;
    if (precio <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Por favor ingresa un precio válido para el producto.'),
          backgroundColor: AppleTheme.accentRed,
        ),
      );
      return;
    }

    setState(() => _guardando = true);
    final online = await SyncService.verificarConexion();

    final nuevoCodigo = 'PED-LIMA-${Random().nextInt(900) + 100}';
    final nuevoPedido = PedidoMobileModel(
      id: 'ped-mob-${DateTime.now().millisecondsSinceEpoch}',
      codigoSeguimiento: nuevoCodigo,
      clienteNombre: _clienteNombreController.text.trim(),
      telefonoContacto: _telefonoController.text.trim(),
      origenDireccion: _puntoA.direccion,
      origenLat: _puntoA.lat,
      origenLng: _puntoA.lng,
      destinoDireccion: _puntoB.direccion,
      destinoLat: _puntoB.lat,
      destinoLng: _puntoB.lng,
      precioProducto: precio,
      metodoPago: _metodoPago,
      estado: 'PENDIENTE',
      distanciaKm: _distanciaKm,
      tiempoEstimadoMinutos: _tiempoMin,
      consumoCombustibleGal: _combustibleGal,
      emisionCo2Kg: _co2Kg,
      fleteOfrecido: _fleteCalculado,
      faseEntrega: 'OFERTA_DISPONIBLE',
      tiempoHaciaOrigenMin: 8,
      distanciaHaciaOrigenKm: 2.4,
      consumoKmGal: 38.0,
      restriccionZonal: 'LIBRE_CIRCULACION',
      ahorroCo2Porcentaje: 38.0,
      co2AhorradoKg: RoutingCalculatorService.calcularAhorroCo2Kg(_distanciaKm),
      isSynced: false,
    );

    // Guardar en SQL Local (se encola automáticamente en Outbox)
    await LocalDbService.agregarPedidoLocal(nuevoPedido);

    if (online) {
      await SyncService.sincronizarSqlHaciaPostgres();
    }

    if (mounted) {
      setState(() => _guardando = false);

      showCupertinoDialog(
        context: context,
        builder: (_) => CupertinoAlertDialog(
          title: const Text('Orden Generada'),
          content: Text(
            online
                ? 'El pedido $nuevoCodigo ha sido registrado y enviado directamente a PostgreSQL con flete ofrecido de S/. ${_fleteCalculado.toStringAsFixed(2)}.'
                : 'El pedido $nuevoCodigo fue almacenado en la base de datos SQL local. Al reconectar con PostgreSQL se sincronizará automáticamente.',
          ),
          actions: [
            CupertinoDialogAction(
              child: const Text('Ver Mis Pedidos'),
              onPressed: () {
                Navigator.pop(context);
                Navigator.pop(context);
              },
            ),
          ],
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Generar Nuevo Pedido'),
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        children: [
          // Selección de Ruta Punto A -> Punto B
          AppleGlassCard(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'DEFINICIÓN DEL TRAYECTO (A ➔ B)',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: AppleTheme.accentCyan,
                    letterSpacing: 0.5,
                  ),
                ),
                const SizedBox(height: 12),

                // Selector Punto A
                const Text('Punto A · Lugar de Recojo / Origen:', style: TextStyle(fontSize: 12, color: AppleTheme.textSecondary)),
                const SizedBox(height: 4),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.06),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<DestinoOpcion>(
                      value: _puntoA,
                      isExpanded: true,
                      dropdownColor: AppleTheme.bgSecondary,
                      items: _puntosDisponibles.map((op) {
                        return DropdownMenuItem(
                          value: op,
                          child: Text(op.nombre, style: const TextStyle(fontSize: 13, color: AppleTheme.textPrimary)),
                        );
                      }).toList(),
                      onChanged: (nueva) {
                        if (nueva != null) {
                          setState(() => _puntoA = nueva);
                          _recalcularMetricas();
                        }
                      },
                    ),
                  ),
                ),
                const SizedBox(height: 14),

                // Selector Punto B
                const Text('Punto B · Lugar de Entrega / Destino:', style: TextStyle(fontSize: 12, color: AppleTheme.textSecondary)),
                const SizedBox(height: 4),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.06),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<DestinoOpcion>(
                      value: _puntoB,
                      isExpanded: true,
                      dropdownColor: AppleTheme.bgSecondary,
                      items: _puntosDisponibles.map((op) {
                        return DropdownMenuItem(
                          value: op,
                          child: Text(op.nombre, style: const TextStyle(fontSize: 13, color: AppleTheme.textPrimary)),
                        );
                      }).toList(),
                      onChanged: (nueva) {
                        if (nueva != null) {
                          setState(() => _puntoB = nueva);
                          _recalcularMetricas();
                        }
                      },
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Estimación Automática
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF243025),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppleTheme.borderSubtle),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      Column(
                        children: [
                          const Text('Distancia', style: TextStyle(fontSize: 10, color: AppleTheme.textSecondary)),
                          const SizedBox(height: 2),
                          Text('$_distanciaKm km', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppleTheme.accentCyan)),
                        ],
                      ),
                      Column(
                        children: [
                          const Text('Tiempo ETA', style: TextStyle(fontSize: 10, color: AppleTheme.textSecondary)),
                          const SizedBox(height: 2),
                          Text('$_tiempoMin min', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppleTheme.textPrimary)),
                        ],
                      ),
                      Column(
                        children: [
                          const Text('Emisión CO₂', style: TextStyle(fontSize: 10, color: AppleTheme.textSecondary)),
                          const SizedBox(height: 2),
                          Text('$_co2Kg kg', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppleTheme.accentGreen)),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Precio, Flete y Modalidad de Pago
          AppleGlassCard(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'PRECIO Y CONDICIONES DE PAGO',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: AppleTheme.textSecondary,
                    letterSpacing: 0.5,
                  ),
                ),
                const SizedBox(height: 12),

                // Flete Propuesto
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Flete de Transporte Ofrecido:', style: TextStyle(fontSize: 12, color: AppleTheme.textSecondary)),
                    Text('S/. ${_fleteCalculado.toStringAsFixed(2)}', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppleTheme.accentGreen)),
                  ],
                ),
                const SizedBox(height: 12),

                // Precio del Producto
                const Text('Precio del Paquete / Mercadería (S/.):', style: TextStyle(fontSize: 12, color: AppleTheme.textSecondary)),
                const SizedBox(height: 4),
                CupertinoTextField(
                  controller: _precioController,
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  prefix: const Padding(
                    padding: EdgeInsets.only(left: 12),
                    child: Text('S/. ', style: TextStyle(color: AppleTheme.accentCyan, fontWeight: FontWeight.w700)),
                  ),
                  style: const TextStyle(color: AppleTheme.textPrimary, fontSize: 16, fontWeight: FontWeight.w700),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.06),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
                  ),
                ),
                const SizedBox(height: 16),

                // Selector de Método de Pago: Pagado vs Contraentrega
                const Text('Modalidad de Pago:', style: TextStyle(fontSize: 12, color: AppleTheme.textSecondary)),
                const SizedBox(height: 6),
                Row(
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _metodoPago = 'PAGADO'),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          decoration: BoxDecoration(
                            color: _metodoPago == 'PAGADO' ? AppleTheme.accentGreen.withValues(alpha: 0.2) : Colors.white.withValues(alpha: 0.04),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: _metodoPago == 'PAGADO' ? AppleTheme.accentGreen : Colors.white.withValues(alpha: 0.1),
                              width: _metodoPago == 'PAGADO' ? 1.5 : 1.0,
                            ),
                          ),
                          child: Column(
                            children: [
                              Icon(CupertinoIcons.creditcard, size: 20, color: _metodoPago == 'PAGADO' ? AppleTheme.accentGreen : AppleTheme.textSecondary),
                              const SizedBox(height: 4),
                              Text(
                                'Pago Inmediato',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                  color: _metodoPago == 'PAGADO' ? AppleTheme.accentGreen : AppleTheme.textSecondary,
                                ),
                              ),
                              const Text('Ya cancelado', style: TextStyle(fontSize: 10, color: AppleTheme.textTertiary)),
                            ],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _metodoPago = 'CONTRAENTREGA'),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          decoration: BoxDecoration(
                            color: _metodoPago == 'CONTRAENTREGA' ? AppleTheme.accentOrange.withValues(alpha: 0.2) : Colors.white.withValues(alpha: 0.04),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: _metodoPago == 'CONTRAENTREGA' ? AppleTheme.accentOrange : Colors.white.withValues(alpha: 0.1),
                              width: _metodoPago == 'CONTRAENTREGA' ? 1.5 : 1.0,
                            ),
                          ),
                          child: Column(
                            children: [
                              Icon(CupertinoIcons.money_dollar_circle, size: 20, color: _metodoPago == 'CONTRAENTREGA' ? AppleTheme.accentOrange : AppleTheme.textSecondary),
                              const SizedBox(height: 4),
                              Text(
                                'Contraentrega',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                  color: _metodoPago == 'CONTRAENTREGA' ? AppleTheme.accentOrange : AppleTheme.textSecondary,
                                ),
                              ),
                              const Text('Cobrar en destino', style: TextStyle(fontSize: 10, color: AppleTheme.textTertiary)),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Botón de Envío
          AppleButton(
            text: 'Emitir y Guardar Orden',
            icon: CupertinoIcons.paperplane_fill,
            isLoading: _guardando,
            onPressed: _handleCrearPedido,
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }
}
