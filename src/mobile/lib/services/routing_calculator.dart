import 'dart:math';

/// Motor de estimación telemática de rutas, tiempos de viaje y huella ambiental
/// adaptado para el parque automotor de Lima Metropolitana.
class RoutingCalculatorService {
  // Constante promedio de velocidad urbana en Lima (congestión comercial diurna)
  static const double velocidadPromedioKmH = 20.0;
  
  // Eficiencia de combustible flota eco-amigable: 38.0 km por galón equivalente
  static const double kmPorGalonEco = 38.0;

  // Factor de emisión GNV: 0.165 kg CO2 por km recorrido (frente a 0.264 kg de diésel convencional)
  static const double factorEmisionGnvCo2 = 0.165;
  static const double factorEmisionDieselCo2 = 0.264;

  /// Calcula la distancia geodésica en kilómetros entre dos coordenadas usando Haversine
  static double calcularDistanciaKm({
    required double lat1,
    required double lon1,
    required double lat2,
    required double lon2,
  }) {
    const double radioTierraKm = 6371.0;
    final double dLat = _gradosARadianes(lat2 - lat1);
    final double dLon = _gradosARadianes(lon2 - lon1);

    final double a = sin(dLat / 2) * sin(dLat / 2) +
        cos(_gradosARadianes(lat1)) *
            cos(_gradosARadianes(lat2)) *
            sin(dLon / 2) *
            sin(dLon / 2);
    final double c = 2 * atan2(sqrt(a), sqrt(1 - a));

    // Multiplicador 1.35 para estimar distancia real por red vial de calles en Lima
    final double distanciaRecta = radioTierraKm * c;
    final double distanciaVialEstimada = distanciaRecta * 1.35;
    return double.parse(distanciaVialEstimada.toStringAsFixed(2));
  }

  /// Calcula el tiempo estimado de viaje (ETA) en minutos
  static int calcularTiempoEstimadoMinutos(double distanciaKm) {
    if (distanciaKm <= 0.1) return 5;
    final double horas = distanciaKm / velocidadPromedioKmH;
    final int minutosTransito = (horas * 60).round();
    // Suma 6 minutos para maniobra de estacionamiento y descarga
    return max(8, minutosTransito + 6);
  }

  /// Calcula el consumo de combustible estimado en galones
  static double calcularConsumoGalones(double distanciaKm) {
    final double galones = distanciaKm / kmPorGalonEco;
    return double.parse(galones.toStringAsFixed(2));
  }

  /// Calcula las emisiones de CO2 generadas en kilogramos
  static double calcularEmisionesCo2Kg(double distanciaKm) {
    final double co2 = distanciaKm * factorEmisionGnvCo2;
    return double.parse(co2.toStringAsFixed(2));
  }

  /// Calcula el CO2 ahorrado frente a un camión diésel convencional
  static double calcularAhorroCo2Kg(double distanciaKm) {
    final double co2Diesel = distanciaKm * factorEmisionDieselCo2;
    final double co2Eco = distanciaKm * factorEmisionGnvCo2;
    return double.parse((co2Diesel - co2Eco).toStringAsFixed(2));
  }

  /// Calcula el porcentaje de reducción de emisiones
  static double calcularPorcentajeAhorroCo2() {
    final ahorro = ((factorEmisionDieselCo2 - factorEmisionGnvCo2) / factorEmisionDieselCo2) * 100.0;
    return double.parse(ahorro.toStringAsFixed(1));
  }

  /// Valida la restricción zonal entre origen y destino para el parque automotor de Lima.
  /// Los vehículos limpios (GNV / Eléctricos EcoLogística) poseen Libre Circulación irrestricta.
  static Map<String, dynamic> validarRestriccionZonal({
    required double latOrigen,
    required double lngOrigen,
    required double latDestino,
    required double lngDestino,
    bool esVehiculoLimpio = true,
  }) {
    if (esVehiculoLimpio) {
      return {
        'tipo': 'LIBRE_CIRCULACION',
        'titulo': 'Libre Circulación Garantizada',
        'descripcion': 'Sin restricciones de horario ni perimetrales. Acceso 100% autorizado por baja huella de carbono.',
        'autorizado': true,
        'badgeColor': 0xFF30D158, // Verde Apple
      };
    } else {
      return {
        'tipo': 'RESTRICCION_HORARIA',
        'titulo': 'Restricción Vehicular Horaria (Pico y Placa Ambiental)',
        'descripcion': 'Prohibida circulación en zonas comerciales de 07:00 a 10:00 y de 17:00 a 21:00.',
        'autorizado': false,
        'badgeColor': 0xFFFF453A, // Rojo Apple
      };
    }
  }

  static double _gradosARadianes(double grados) {
    return grados * (pi / 180.0);
  }
}
