import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../theme/apple_theme.dart';
import '../models/pedido_mobile_model.dart';
import '../widgets/apple_button.dart';

/// Modal flotante / Toast interactivo estilo iOS para conductores.
/// Muestra detalles del pedido, ETA hacia el punto de recojo (Punto A),
/// eficiencia promedio (km/gal), validación de Libre Circulación Zonal,
/// ahorro de CO2 frente a otros vehículos y puja de flete (aceptar o contraofertar).
class PedidoToastCard extends StatefulWidget {
  final PedidoMobileModel pedido;
  final Function(double fleteFinal) onAceptarFlete;
  final VoidCallback onRechazar;

  const PedidoToastCard({
    super.key,
    required this.pedido,
    required this.onAceptarFlete,
    required this.onRechazar,
  });

  /// Muestra el Toast como un BottomSheet modal flotante responsivo sin desbordes
  static Future<void> mostrar({
    required BuildContext context,
    required PedidoMobileModel pedido,
    required Function(double fleteFinal) onAceptarFlete,
    required VoidCallback onRechazar,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => FractionallySizedBox(
        heightFactor: 0.88,
        child: PedidoToastCard(
          pedido: pedido,
          onAceptarFlete: onAceptarFlete,
          onRechazar: onRechazar,
        ),
      ),
    );
  }

  @override
  State<PedidoToastCard> createState() => _PedidoToastCardState();
}

class _PedidoToastCardState extends State<PedidoToastCard> {
  bool _mostrandoContraoferta = false;
  late double _contraofertaMonto;
  bool _esperandoRespuestaCliente = false;
  String? _mensajeRespuestaCliente;

  @override
  void initState() {
    super.initState();
    _contraofertaMonto = widget.pedido.fleteOfrecido + 4.0; // Sugerencia inicial
  }

  void _enviarContraoferta() async {
    setState(() {
      _esperandoRespuestaCliente = true;
    });

    // Simulación de interacción con el cliente en tiempo real (1.2s)
    await Future.delayed(const Duration(milliseconds: 1200));

    if (mounted) {
      setState(() {
        _esperandoRespuestaCliente = false;
        _mensajeRespuestaCliente = '¡El cliente aceptó tu contraoferta de S/. ${_contraofertaMonto.toStringAsFixed(2)}!';
      });

      await Future.delayed(const Duration(milliseconds: 800));

      if (mounted) {
        Navigator.pop(context);
        widget.onAceptarFlete(_contraofertaMonto);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final pedido = widget.pedido;

    return Container(
      margin: const EdgeInsets.only(left: 10, right: 10, bottom: 12, top: 10),
      decoration: BoxDecoration(
        color: const Color(0xFF1B221C),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppleTheme.borderSubtle, width: 1.5),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.65),
            blurRadius: 28,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Column(
          children: [
            // Barra superior fija de arrastre y título
            Padding(
              padding: const EdgeInsets.only(left: 18, right: 18, top: 12, bottom: 8),
              child: Column(
                children: [
                  Container(
                    width: 36,
                    height: 4,
                    margin: const EdgeInsets.only(bottom: 12),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),

                  // Encabezado del Toast: Identificador y Badge de Oferta en Vivo
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(7),
                            decoration: BoxDecoration(
                              color: AppleTheme.accentOrange.withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Icon(CupertinoIcons.bell_fill, color: AppleTheme.accentOrange, size: 16),
                          ),
                          const SizedBox(width: 8),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'NUEVO PEDIDO DISPONIBLE',
                                style: TextStyle(
                                  fontSize: 9,
                                  fontWeight: FontWeight.w800,
                                  color: AppleTheme.accentOrange,
                                  letterSpacing: 0.6,
                                ),
                              ),
                              Text(
                                pedido.codigoSeguimiento,
                                style: const TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w800,
                                  color: AppleTheme.textPrimary,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),

                      // Botón Cerrar
                      GestureDetector(
                        onTap: () {
                          Navigator.pop(context);
                          widget.onRechazar();
                        },
                        child: Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.08),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(CupertinoIcons.xmark, size: 13, color: AppleTheme.textSecondary),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const Divider(color: AppleTheme.borderSubtle, height: 1),

            // Contenido con Scroll para garantizar CERO desbordes de pantalla en cualquier teléfono
            Expanded(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Sección 1: Ruta Completa (Punto Original A -> Punto Destino B)
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.35),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: Colors.white.withValues(alpha: 0.06)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Punto A (Origen / Recojo) + ETA hacia Punto de Recojo
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                width: 10,
                                height: 10,
                                margin: const EdgeInsets.only(top: 4),
                                decoration: const BoxDecoration(
                                  color: AppleTheme.accentCyan,
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Wrap(
                                      alignment: WrapAlignment.spaceBetween,
                                      crossAxisAlignment: WrapCrossAlignment.center,
                                      spacing: 6,
                                      runSpacing: 4,
                                      children: [
                                        const Text(
                                          'PUNTO A · RECOJO DE PAQUETE',
                                          style: TextStyle(
                                            fontSize: 10,
                                            fontWeight: FontWeight.w700,
                                            color: AppleTheme.accentCyan,
                                            letterSpacing: 0.3,
                                          ),
                                        ),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                          decoration: BoxDecoration(
                                            color: AppleTheme.accentRed.withValues(alpha: 0.18),
                                            borderRadius: BorderRadius.circular(6),
                                            border: Border.all(color: AppleTheme.accentRed.withValues(alpha: 0.4)),
                                          ),
                                          child: Text(
                                            'Llegas en ${pedido.tiempoHaciaOrigenMin} min (${pedido.distanciaHaciaOrigenKm} km)',
                                            style: const TextStyle(
                                              fontSize: 9,
                                              fontWeight: FontWeight.w800,
                                              color: AppleTheme.accentRed,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 3),
                                    Text(
                                      pedido.origenDireccion,
                                      style: const TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                        color: AppleTheme.textPrimary,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),

                          // Línea divisoria de conexión
                          Padding(
                            padding: const EdgeInsets.only(left: 4, top: 4, bottom: 4),
                            child: Row(
                              children: [
                                Container(
                                  width: 2,
                                  height: 18,
                                  color: AppleTheme.borderSubtle,
                                ),
                                const SizedBox(width: 14),
                                Expanded(
                                  child: Text(
                                    'Trayecto a recorrer: ${pedido.distanciaKm} km (~${pedido.tiempoEstimadoMinutos} min)',
                                    style: const TextStyle(fontSize: 10, color: AppleTheme.textSecondary),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                          ),

                          // Punto B (Destino / Entrega)
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                width: 10,
                                height: 10,
                                margin: const EdgeInsets.only(top: 4),
                                decoration: const BoxDecoration(
                                  color: AppleTheme.accentGreen,
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text(
                                      'PUNTO B · ENTREGA FINAL AL CLIENTE',
                                      style: TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.w700,
                                        color: AppleTheme.accentGreen,
                                        letterSpacing: 0.3,
                                      ),
                                    ),
                                    const SizedBox(height: 3),
                                    Text(
                                      pedido.destinoDireccion,
                                      style: const TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                        color: AppleTheme.textPrimary,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 10),

                    // Sección 2: Consumo Promedio de Gasolina / Combustible (km/gal)
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.04),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(7),
                            decoration: BoxDecoration(
                              color: AppleTheme.accentOrange.withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Icon(CupertinoIcons.drop_fill, color: AppleTheme.accentOrange, size: 16),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'CONSUMO ESTIMADO DE COMBUSTIBLE',
                                  style: TextStyle(
                                    fontSize: 9,
                                    fontWeight: FontWeight.w700,
                                    color: AppleTheme.textSecondary,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Wrap(
                                  crossAxisAlignment: WrapCrossAlignment.center,
                                  spacing: 6,
                                  children: [
                                    Text(
                                      '${pedido.consumoCombustibleGal} gal',
                                      style: const TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w800,
                                        color: AppleTheme.accentOrange,
                                      ),
                                    ),
                                    Text(
                                      '· Promedio: ${pedido.consumoKmGal} km/gal',
                                      style: const TextStyle(
                                        fontSize: 11,
                                        color: AppleTheme.textSecondary,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 8),

                    // Sección 3: Validación Automática de Restricción Zonal (Libre Circulación)
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: AppleTheme.accentGreen.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppleTheme.accentGreen.withValues(alpha: 0.35)),
                      ),
                      child: const Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Icon(CupertinoIcons.checkmark_shield_fill, color: AppleTheme.accentGreen, size: 18),
                          SizedBox(width: 8),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'LIBRE CIRCULACIÓN · SIN RESTRICCIÓN ZONAL',
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w800,
                                    color: AppleTheme.accentGreen,
                                    letterSpacing: 0.4,
                                  ),
                                ),
                                SizedBox(height: 2),
                                Text(
                                  'Tu unidad limpia posee pase preferencial irrestricto desde Punto A hasta Punto B sin restricción horaria ni perimetral en Lima Metropolitana.',
                                  style: TextStyle(
                                    fontSize: 10,
                                    color: AppleTheme.textPrimary,
                                    height: 1.3,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 8),

                    // Sección 4: CO2 Generado y Ahorro frente a otros vehículos
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: AppleTheme.accentCyan.withValues(alpha: 0.10),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppleTheme.accentCyan.withValues(alpha: 0.3)),
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(7),
                            decoration: BoxDecoration(
                              color: AppleTheme.accentCyan.withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Icon(CupertinoIcons.leaf_arrow_circlepath, color: AppleTheme.accentCyan, size: 16),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    const Expanded(
                                      child: Text(
                                        'IMPACTO AMBIENTAL Y AHORRO',
                                        style: TextStyle(
                                          fontSize: 9,
                                          fontWeight: FontWeight.w700,
                                          color: AppleTheme.accentCyan,
                                        ),
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                    Text(
                                      '${pedido.emisionCo2Kg} kg CO₂',
                                      style: const TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w800,
                                        color: AppleTheme.textPrimary,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  'Ahorro de ${pedido.ahorroCo2Porcentaje}% CO₂ (-${pedido.co2AhorradoKg} kg CO₂ evitados vs diésel estándar).',
                                  style: const TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w600,
                                    color: AppleTheme.accentCyan,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Sección 5: Negociación de Flete (Aceptar precio ofrecido o Lanzar Contraoferta)
                    if (_mensajeRespuestaCliente != null)
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppleTheme.accentGreen.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppleTheme.accentGreen),
                        ),
                        child: Row(
                          children: [
                            const Icon(CupertinoIcons.checkmark_circle_fill, color: AppleTheme.accentGreen, size: 20),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                _mensajeRespuestaCliente!,
                                style: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                  color: AppleTheme.accentGreen,
                                ),
                              ),
                            ),
                          ],
                        ),
                      )
                    else if (_mostrandoContraoferta)
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.05),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: AppleTheme.accentOrange.withValues(alpha: 0.4)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text(
                                  'LANZAR OFERTA DE PRECIO (FLETE)',
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w700,
                                    color: AppleTheme.accentOrange,
                                  ),
                                ),
                                GestureDetector(
                                  onTap: () => setState(() => _mostrandoContraoferta = false),
                                  child: const Text(
                                    'Cancelar',
                                    style: TextStyle(fontSize: 11, color: AppleTheme.textSecondary),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 10),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                IconButton(
                                  icon: const Icon(CupertinoIcons.minus_circle, color: AppleTheme.accentOrange, size: 26),
                                  onPressed: () {
                                    if (_contraofertaMonto > 10.0) {
                                      setState(() => _contraofertaMonto -= 2.0);
                                    }
                                  },
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                                  decoration: BoxDecoration(
                                    color: Colors.black.withValues(alpha: 0.4),
                                    borderRadius: BorderRadius.circular(10),
                                    border: Border.all(color: AppleTheme.accentOrange.withValues(alpha: 0.6)),
                                  ),
                                  child: Text(
                                    'S/. ${_contraofertaMonto.toStringAsFixed(2)}',
                                    style: const TextStyle(
                                      fontSize: 20,
                                      fontWeight: FontWeight.w800,
                                      color: AppleTheme.accentOrange,
                                    ),
                                  ),
                                ),
                                IconButton(
                                  icon: const Icon(CupertinoIcons.plus_circle, color: AppleTheme.accentOrange, size: 26),
                                  onPressed: () {
                                    setState(() => _contraofertaMonto += 2.0);
                                  },
                                ),
                              ],
                            ),
                            const SizedBox(height: 10),
                            AppleButton(
                              text: 'Enviar Oferta al Cliente',
                              icon: CupertinoIcons.paperplane_fill,
                              backgroundColor: AppleTheme.accentOrange,
                              isLoading: _esperandoRespuestaCliente,
                              height: 42,
                              onPressed: _enviarContraoferta,
                            ),
                          ],
                        ),
                      )
                    else
                      Column(
                        children: [
                          // Resumen de Flete Ofrecido por el Cliente
                          Row(
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: const [
                                    Text(
                                      'FLETE OFRECIDO POR CLIENTE',
                                      style: TextStyle(
                                        fontSize: 9,
                                        fontWeight: FontWeight.w700,
                                        color: AppleTheme.textSecondary,
                                      ),
                                    ),
                                    Text(
                                      'Pago directo por servicio de transporte',
                                      style: TextStyle(fontSize: 10, color: AppleTheme.textSecondary),
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 8),
                              Text(
                                'S/. ${pedido.fleteOfrecido.toStringAsFixed(2)}',
                                style: const TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.w800,
                                  color: AppleTheme.accentGreen,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),

                          // Botones de Acción: Aceptar Flete Directo o Lanzar Contraoferta
                          Row(
                            children: [
                              Expanded(
                                child: AppleButton(
                                  text: 'Aceptar',
                                  icon: CupertinoIcons.checkmark_alt,
                                  backgroundColor: AppleTheme.accentGreen,
                                  height: 42,
                                  fontSize: 13,
                                  padding: const EdgeInsets.symmetric(horizontal: 6),
                                  onPressed: () {
                                    Navigator.pop(context);
                                    widget.onAceptarFlete(pedido.fleteOfrecido);
                                  },
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: AppleButton(
                                  text: 'Contraofertar',
                                  icon: CupertinoIcons.arrow_2_squarepath,
                                  isSecondary: true,
                                  height: 42,
                                  fontSize: 13,
                                  padding: const EdgeInsets.symmetric(horizontal: 6),
                                  onPressed: () {
                                    setState(() {
                                      _mostrandoContraoferta = true;
                                    });
                                  },
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
