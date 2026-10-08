class PedidoMobileModel {
  final String id;
  final String codigoSeguimiento;
  final String clienteNombre;
  final String telefonoContacto;
  final String origenDireccion; // Punto A
  final double origenLat;
  final double origenLng;
  final String destinoDireccion; // Punto B
  final double destinoLat;
  final double destinoLng;
  final double precioProducto; // Precio en Soles (S/.)
  final String metodoPago; // 'PAGADO' | 'CONTRAENTREGA'
  String estado; // 'PENDIENTE' | 'EN_TRANSITO' | 'ENTREGADO'
  final double distanciaKm;
  final int tiempoEstimadoMinutos;
  final double consumoCombustibleGal;
  final double emisionCo2Kg;
  String? fotoPodBase64; // Foto de prueba de entrega capturada por el repartidor al cliente final
  String? fechaEntrega;
  bool isSynced; // true = en PostgreSQL, false = solo en SQLite/SQL Local

  // Nuevos campos telemáticos para puja de flete, navegación y validación ambiental
  final double fleteOfrecido; // Monto ofrecido por el cliente (S/.)
  double? fleteContraoferta; // Oferta alternativa del conductor
  double? fleteAcordado; // Flete pactado final
  String faseEntrega; // 'OFERTA_DISPONIBLE' | 'FLETE_ACORDADO' | 'RUMBO_A_RECOJO' | 'LLEGADA_A_ORIGEN' | 'EN_TRANSITO_A_DESTINO' | 'ENTREGADO'
  double conductorLat; // Ubicación en tiempo real del conductor
  double conductorLng;
  double distanciaHaciaOrigenKm; // Distancia desde conductor actual hasta Punto A
  int tiempoHaciaOrigenMin; // ETA para llegar a recoger el paquete
  final double consumoKmGal; // Eficiencia promedio km/gal
  final String restriccionZonal; // 'LIBRE_CIRCULACION' | 'RESTRICCION_HORARIA' | 'ZONA_RESTRINGIDA'
  final double ahorroCo2Porcentaje; // % de mitigación ambiental frente a diésel convencional
  final double co2AhorradoKg; // kg de CO2 evitados
  String? fotoRecepcionOrigen; // Foto capturada al recibir el paquete en el Punto A
  bool avisoClienteLlegadaOrigen; // Notificación enviada al cliente de llegada a Punto A

  PedidoMobileModel({
    required this.id,
    required this.codigoSeguimiento,
    required this.clienteNombre,
    required this.telefonoContacto,
    required this.origenDireccion,
    required this.origenLat,
    required this.origenLng,
    required this.destinoDireccion,
    required this.destinoLat,
    required this.destinoLng,
    required this.precioProducto,
    required this.metodoPago,
    required this.estado,
    required this.distanciaKm,
    required this.tiempoEstimadoMinutos,
    required this.consumoCombustibleGal,
    required this.emisionCo2Kg,
    this.fotoPodBase64,
    this.fechaEntrega,
    this.isSynced = true,
    this.fleteOfrecido = 18.0,
    this.fleteContraoferta,
    this.fleteAcordado,
    this.faseEntrega = 'OFERTA_DISPONIBLE',
    this.conductorLat = -12.052800, // Coordenada conductor de prueba (Breña/Lima Centro)
    this.conductorLng = -77.051200,
    this.distanciaHaciaOrigenKm = 2.4,
    this.tiempoHaciaOrigenMin = 8,
    this.consumoKmGal = 38.0,
    this.restriccionZonal = 'LIBRE_CIRCULACION',
    this.ahorroCo2Porcentaje = 38.0,
    this.co2AhorradoKg = 0.42,
    this.fotoRecepcionOrigen,
    this.avisoClienteLlegadaOrigen = false,
  });

  factory PedidoMobileModel.fromJson(Map<String, dynamic> json) {
    final double dist = (json['distancia_km'] as num?)?.toDouble() ?? 8.5;
    final double co2 = (json['emision_co2_kg'] as num?)?.toDouble() ?? 0.54;
    final double gal = (json['consumo_combustible_gal'] as num?)?.toDouble() ?? 0.22;
    final double fleteOf = (json['flete_ofrecido'] as num?)?.toDouble() ?? 18.0;

    return PedidoMobileModel(
      id: json['pedido_id'] ?? json['id'] ?? 'ped-${DateTime.now().millisecondsSinceEpoch}',
      codigoSeguimiento: json['codigo_seguimiento'] ?? 'PED-LIMA-000',
      clienteNombre: json['cliente_nombre'] ?? 'Cliente Lima',
      telefonoContacto: json['telefono_contacto'] ?? '999888777',
      origenDireccion: json['origen_direccion'] ?? 'Centro de Distribución EcoLogística · Av. Argentina 2050, Lima',
      origenLat: (json['origen_lat'] as num?)?.toDouble() ?? -12.046374,
      origenLng: (json['origen_lng'] as num?)?.toDouble() ?? -77.042793,
      destinoDireccion: json['direccion_destino'] ?? json['destino_direccion'] ?? 'Av. Próceres de la Independencia 1420, SJL',
      destinoLat: (json['ubicacion_destino'] is Map && (json['ubicacion_destino']['coordinates'] as List?)?.length == 2)
          ? ((json['ubicacion_destino']['coordinates'] as List)[1] as num).toDouble()
          : ((json['latitud'] as num?)?.toDouble() ?? (json['destino_lat'] as num?)?.toDouble() ?? -12.001200),
      destinoLng: (json['ubicacion_destino'] is Map && (json['ubicacion_destino']['coordinates'] as List?)?.length == 2)
          ? ((json['ubicacion_destino']['coordinates'] as List)[0] as num).toDouble()
          : ((json['longitud'] as num?)?.toDouble() ?? (json['destino_lng'] as num?)?.toDouble() ?? -77.012300),
      precioProducto: (json['precio_producto'] as num?)?.toDouble() ?? 45.0,
      metodoPago: json['metodo_pago'] ?? 'CONTRAENTREGA',
      estado: json['estado'] ?? 'PENDIENTE',
      distanciaKm: dist,
      tiempoEstimadoMinutos: (json['tiempo_estimado_min'] as num?)?.toInt() ?? (json['tiempo_estimado_minutos'] as num?)?.toInt() ?? 28,
      consumoCombustibleGal: gal,
      emisionCo2Kg: co2,
      fotoPodBase64: json['foto_pod'],
      fechaEntrega: json['fecha_entrega'],
      isSynced: json['is_synced'] == null ? true : (json['is_synced'] == true || json['is_synced'] == 1),
      fleteOfrecido: fleteOf,
      fleteContraoferta: (json['flete_contraoferta'] as num?)?.toDouble(),
      fleteAcordado: (json['flete_acordado'] as num?)?.toDouble() ?? (json['estado'] == 'EN_TRANSITO' || json['estado'] == 'ENTREGADO' ? fleteOf : null),
      faseEntrega: json['fase_entrega'] ?? (json['estado'] == 'ENTREGADO' ? 'ENTREGADO' : (json['estado'] == 'EN_TRANSITO' ? 'EN_TRANSITO_A_DESTINO' : 'OFERTA_DISPONIBLE')),
      conductorLat: (json['conductor_lat'] as num?)?.toDouble() ?? -12.052800,
      conductorLng: (json['conductor_lng'] as num?)?.toDouble() ?? -77.051200,
      distanciaHaciaOrigenKm: (json['distancia_hacia_origen_km'] as num?)?.toDouble() ?? 2.4,
      tiempoHaciaOrigenMin: (json['tiempo_hacia_origen_min'] as num?)?.toInt() ?? 8,
      consumoKmGal: (json['consumo_km_gal'] as num?)?.toDouble() ?? 38.0,
      restriccionZonal: json['restriccion_zonal'] ?? 'LIBRE_CIRCULACION',
      ahorroCo2Porcentaje: (json['ahorro_co2_porcentaje'] as num?)?.toDouble() ?? 38.0,
      co2AhorradoKg: (json['co2_ahorrado_kg'] as num?)?.toDouble() ?? 0.42,
      fotoRecepcionOrigen: json['foto_recepcion_origen'],
      avisoClienteLlegadaOrigen: json['aviso_cliente_llegada_origen'] == true || json['aviso_cliente_llegada_origen'] == 1,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'pedido_id': id,
      'codigo_seguimiento': codigoSeguimiento,
      'cliente_nombre': clienteNombre,
      'telefono_contacto': telefonoContacto,
      'origen_direccion': origenDireccion,
      'origen_lat': origenLat,
      'origen_lng': origenLng,
      'direccion_destino': destinoDireccion,
      'destino_direccion': destinoDireccion,
      'latitud': destinoLat,
      'longitud': destinoLng,
      'precio_producto': precioProducto,
      'metodo_pago': metodoPago,
      'estado': estado,
      'distancia_km': distanciaKm,
      'tiempo_estimado_min': tiempoEstimadoMinutos,
      'consumo_combustible_gal': consumoCombustibleGal,
      'emision_co2_kg': emisionCo2Kg,
      'foto_pod': fotoPodBase64,
      'fecha_entrega': fechaEntrega,
      'is_synced': isSynced ? 1 : 0,
      'flete_ofrecido': fleteOfrecido,
      'flete_contraoferta': fleteContraoferta,
      'flete_acordado': fleteAcordado,
      'fase_entrega': faseEntrega,
      'conductor_lat': conductorLat,
      'conductor_lng': conductorLng,
      'distancia_hacia_origen_km': distanciaHaciaOrigenKm,
      'tiempo_hacia_origen_min': tiempoHaciaOrigenMin,
      'consumo_km_gal': consumoKmGal,
      'restriccion_zonal': restriccionZonal,
      'ahorro_co2_porcentaje': ahorroCo2Porcentaje,
      'co2_ahorrado_kg': co2AhorradoKg,
      'foto_recepcion_origen': fotoRecepcionOrigen,
      'aviso_cliente_llegada_origen': avisoClienteLlegadaOrigen ? 1 : 0,
    };
  }

  PedidoMobileModel copyWith({
    String? estado,
    String? fotoPodBase64,
    String? fechaEntrega,
    bool? isSynced,
    double? fleteOfrecido,
    double? fleteContraoferta,
    double? fleteAcordado,
    String? faseEntrega,
    double? conductorLat,
    double? conductorLng,
    double? distanciaHaciaOrigenKm,
    int? tiempoHaciaOrigenMin,
    double? consumoKmGal,
    String? restriccionZonal,
    double? ahorroCo2Porcentaje,
    double? co2AhorradoKg,
    String? fotoRecepcionOrigen,
    bool? avisoClienteLlegadaOrigen,
  }) {
    return PedidoMobileModel(
      id: id,
      codigoSeguimiento: codigoSeguimiento,
      clienteNombre: clienteNombre,
      telefonoContacto: telefonoContacto,
      origenDireccion: origenDireccion,
      origenLat: origenLat,
      origenLng: origenLng,
      destinoDireccion: destinoDireccion,
      destinoLat: destinoLat,
      destinoLng: destinoLng,
      precioProducto: precioProducto,
      metodoPago: metodoPago,
      estado: estado ?? this.estado,
      distanciaKm: distanciaKm,
      tiempoEstimadoMinutos: tiempoEstimadoMinutos,
      consumoCombustibleGal: consumoCombustibleGal,
      emisionCo2Kg: emisionCo2Kg,
      fotoPodBase64: fotoPodBase64 ?? this.fotoPodBase64,
      fechaEntrega: fechaEntrega ?? this.fechaEntrega,
      isSynced: isSynced ?? this.isSynced,
      fleteOfrecido: fleteOfrecido ?? this.fleteOfrecido,
      fleteContraoferta: fleteContraoferta ?? this.fleteContraoferta,
      fleteAcordado: fleteAcordado ?? this.fleteAcordado,
      faseEntrega: faseEntrega ?? this.faseEntrega,
      conductorLat: conductorLat ?? this.conductorLat,
      conductorLng: conductorLng ?? this.conductorLng,
      distanciaHaciaOrigenKm: distanciaHaciaOrigenKm ?? this.distanciaHaciaOrigenKm,
      tiempoHaciaOrigenMin: tiempoHaciaOrigenMin ?? this.tiempoHaciaOrigenMin,
      consumoKmGal: consumoKmGal ?? this.consumoKmGal,
      restriccionZonal: restriccionZonal ?? this.restriccionZonal,
      ahorroCo2Porcentaje: ahorroCo2Porcentaje ?? this.ahorroCo2Porcentaje,
      co2AhorradoKg: co2AhorradoKg ?? this.co2AhorradoKg,
      fotoRecepcionOrigen: fotoRecepcionOrigen ?? this.fotoRecepcionOrigen,
      avisoClienteLlegadaOrigen: avisoClienteLlegadaOrigen ?? this.avisoClienteLlegadaOrigen,
    );
  }
}
