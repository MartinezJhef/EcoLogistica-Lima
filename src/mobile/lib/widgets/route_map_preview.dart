import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../theme/apple_theme.dart';
import '../models/pedido_mobile_model.dart';

/// Previsualización interactiva de ruta Punto A -> Punto B y telemetría de eficiencia verde
class RouteMapPreview extends StatelessWidget {
  final PedidoMobileModel pedido;

  const RouteMapPreview({
    super.key,
    required this.pedido,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF243025),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppleTheme.borderSubtle),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Esquema de Ruta Punto A -> Punto B
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Iconos e Hilo de Conexión
              Column(
                children: [
                  Container(
                    width: 14,
                    height: 14,
                    decoration: BoxDecoration(
                      color: AppleTheme.accentBlue,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: AppleTheme.accentBlue.withValues(alpha: 0.6),
                          blurRadius: 8,
                        ),
                      ],
                    ),
                  ),
                  Container(
                    width: 2,
                    height: 38,
                    color: AppleTheme.borderSubtle,
                  ),
                  Container(
                    width: 14,
                    height: 14,
                    decoration: BoxDecoration(
                      color: AppleTheme.accentCyan,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: AppleTheme.accentCyan.withValues(alpha: 0.6),
                          blurRadius: 8,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(width: 14),

              // Etiquetas de Direcciones
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Punto A
                    Row(
                      children: [
                        const Text(
                          'PUNTO A · ORIGEN',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            color: AppleTheme.accentCyan,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      pedido.origenDireccion,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppleTheme.textPrimary,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),

                    const SizedBox(height: 16),

                    // Punto B
                    Row(
                      children: [
                        const Text(
                          'PUNTO B · DESTINO FINAL',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            color: AppleTheme.accentGreen,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      pedido.destinoDireccion,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppleTheme.textPrimary,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),
          const Divider(color: AppleTheme.borderSubtle, height: 1),
          const SizedBox(height: 14),

          // Telemetría de la Ruta: Distancia, Tiempo ETA, Combustible y CO2
          Row(
            children: [
              _buildTelemetryItem(
                icon: CupertinoIcons.clock,
                iconColor: AppleTheme.accentCyan,
                label: 'Tiempo ETA',
                value: '${pedido.tiempoEstimadoMinutos} min',
              ),
              _buildTelemetryItem(
                icon: CupertinoIcons.location,
                iconColor: AppleTheme.accentBlue,
                label: 'Distancia',
                value: '${pedido.distanciaKm} km',
              ),
              _buildTelemetryItem(
                icon: CupertinoIcons.drop,
                iconColor: AppleTheme.accentOrange,
                label: 'Combustible',
                value: '${pedido.consumoCombustibleGal} gal',
              ),
              _buildTelemetryItem(
                icon: CupertinoIcons.leaf_arrow_circlepath,
                iconColor: AppleTheme.accentGreen,
                label: 'CO₂ Emisión',
                value: '${pedido.emisionCo2Kg} kg',
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTelemetryItem({
    required IconData icon,
    required Color iconColor,
    required String label,
    required String value,
  }) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Icon(icon, size: 16, color: iconColor),
          const SizedBox(height: 4),
          Text(
            label,
            style: const TextStyle(
              fontSize: 10,
              color: AppleTheme.textSecondary,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            value,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: AppleTheme.textPrimary,
            ),
          ),
        ],
      ),
    );
  }
}
