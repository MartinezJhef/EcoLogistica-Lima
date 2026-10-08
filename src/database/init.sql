-- =============================================================================
-- EcoLogística Lima - PFA-ECOLIMA-2026
-- Script DDL de Base de Datos - PostgreSQL 16+ con Extensión PostGIS
-- Normalización: 3FN (Tercera Forma Normal)
-- Versión: 1.1.0
-- =============================================================================

-- 1. Habilitar extensiones requeridas
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. TABLA: usuarios (RBAC: ROL-01 a ROL-04)
CREATE TABLE IF NOT EXISTS usuarios (
    usuario_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    nombre_completo VARCHAR(150) NOT NULL DEFAULT 'Usuario',
    telefono VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('ADMIN', 'OFICINA', 'OPERADOR', 'REPARTIDOR', 'CONDUCTOR', 'CLIENTE', 'AUDITOR')),
    permisos JSONB NOT NULL DEFAULT '[]'::jsonb,
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO', 'INACTIVO', 'BLOQUEADO')),
    creado_en TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);

-- 3. TABLA: conductores (US-002: Gestión de Conductores y Jornada)
CREATE TABLE IF NOT EXISTS conductores (
    conductor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID UNIQUE REFERENCES usuarios(usuario_id) ON DELETE SET NULL,
    dni VARCHAR(8) NOT NULL UNIQUE,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    licencia VARCHAR(20) NOT NULL UNIQUE,
    categoria_licencia VARCHAR(10) NOT NULL DEFAULT 'A-IIIc' CHECK (categoria_licencia IN ('A-I', 'A-IIa', 'A-IIb', 'A-IIIa', 'A-IIIb', 'A-IIIc')),
    telefono VARCHAR(15) NOT NULL,
    direccion_origen VARCHAR(200),
    latitud_origen NUMERIC(10,6),
    longitud_origen NUMERIC(10,6),
    estado VARCHAR(20) NOT NULL DEFAULT 'DISPONIBLE' CHECK (estado IN ('DISPONIBLE', 'EN_RUTA', 'DESCANSO', 'INACTIVO')),
    horas_conduccion_hoy DECIMAL(4,2) NOT NULL DEFAULT 0.00 CHECK (horas_conduccion_hoy >= 0)
);

CREATE INDEX IF NOT EXISTS idx_conductores_dni ON conductores(dni);
CREATE INDEX IF NOT EXISTS idx_conductores_licencia ON conductores(licencia);
CREATE INDEX IF NOT EXISTS idx_conductores_usuario ON conductores(usuario_id);
CREATE INDEX IF NOT EXISTS idx_conductores_estado ON conductores(estado);

-- 4. TABLA: vehiculos
CREATE TABLE IF NOT EXISTS vehiculos (
    vehiculo_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    placa VARCHAR(10) NOT NULL UNIQUE,
    marca_modelo VARCHAR(100) NOT NULL,
    capacidad_peso_kg DECIMAL(10,2) NOT NULL CHECK (capacidad_peso_kg > 0),
    capacidad_volumen_m3 DECIMAL(10,2) NOT NULL CHECK (capacidad_volumen_m3 > 0),
    tipo_combustible VARCHAR(30) NOT NULL CHECK (tipo_combustible IN ('DIESEL', 'GNV', 'ELECTRICO', 'HIBRIDO')),
    factor_emision_co2 DECIMAL(8,4) NOT NULL CHECK (factor_emision_co2 >= 0),
    anio_fabricacion INTEGER NOT NULL DEFAULT 2024 CHECK (anio_fabricacion >= 1990),
    consumo_km_gal DECIMAL(8,2) NOT NULL DEFAULT 35.00 CHECK (consumo_km_gal >= 0),
    restriccion_circulacion VARCHAR(100) NOT NULL DEFAULT 'LIBRE_CIRCULACION',
    estado VARCHAR(20) NOT NULL DEFAULT 'DISPONIBLE' CHECK (estado IN ('DISPONIBLE', 'EN_RUTA', 'MANTENIMIENTO', 'INACTIVO'))
);

CREATE INDEX IF NOT EXISTS idx_vehiculos_placa ON vehiculos(placa);
CREATE INDEX IF NOT EXISTS idx_vehiculos_estado ON vehiculos(estado);

-- 5. TABLA: depositos
CREATE TABLE IF NOT EXISTS depositos (
    deposito_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(150) NOT NULL,
    direccion TEXT NOT NULL,
    ubicacion_geografica GEOMETRY(Point, 4326) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'OPERATIVO' CHECK (estado IN ('OPERATIVO', 'INOPERATIVO'))
);

CREATE INDEX IF NOT EXISTS idx_depositos_ubicacion_gist ON depositos USING GIST(ubicacion_geografica);

-- 6. TABLA: rutas
CREATE TABLE IF NOT EXISTS rutas (
    ruta_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deposito_origen_id UUID NOT NULL REFERENCES depositos(deposito_id),
    conductor_id UUID NOT NULL REFERENCES conductores(conductor_id),
    vehiculo_id UUID NOT NULL REFERENCES vehiculos(vehiculo_id),
    fecha_operacion DATE NOT NULL,
    distancia_total_km DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK (distancia_total_km >= 0),
    tiempo_total_min INTEGER NOT NULL DEFAULT 0 CHECK (tiempo_total_min >= 0),
    co2_total_kg DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK (co2_total_kg >= 0),
    estado VARCHAR(20) NOT NULL DEFAULT 'PLANIFICADA' CHECK (estado IN ('PLANIFICADA', 'EN_EJECUCION', 'COMPLETADA', 'CANCELADA')),
    creada_en TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rutas_conductor ON rutas(conductor_id);
CREATE INDEX IF NOT EXISTS idx_rutas_vehiculo ON rutas(vehiculo_id);
CREATE INDEX IF NOT EXISTS idx_rutas_fecha ON rutas(fecha_operacion);

-- 7. TABLA: pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    pedido_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ruta_id UUID REFERENCES rutas(ruta_id) ON DELETE SET NULL,
    codigo_seguimiento VARCHAR(30) NOT NULL UNIQUE,
    cliente_nombre VARCHAR(200) NOT NULL,
    direccion_destino TEXT NOT NULL,
    ubicacion_destino GEOMETRY(Point, 4326) NOT NULL,
    peso_kg DECIMAL(10,2) NOT NULL CHECK (peso_kg > 0),
    volumen_m3 DECIMAL(10,2) NOT NULL CHECK (volumen_m3 > 0),
    ventana_inicio TIME NOT NULL,
    ventana_fin TIME NOT NULL,
    prioridad VARCHAR(20) NOT NULL DEFAULT 'ESTANDAR' CHECK (prioridad IN ('BAJA', 'ESTANDAR', 'ALTA', 'URGENTE')),
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'ASIGNADO', 'EN_TRANSITO', 'ENTREGADO', 'NO_ENTREGADO', 'CANCELADO')),
    referencia_ubicacion TEXT,
    restriccion_acceso VARCHAR(100) NOT NULL DEFAULT 'LIBRE_ACCESO',
    foto_referencia_url TEXT,
    telefono_contacto VARCHAR(20),
    creado_en TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_ventana_horaria CHECK (ventana_fin > ventana_inicio)
);

-- Asegurar columnas si la tabla ya existía previamente
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS referencia_ubicacion TEXT;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS restriccion_acceso VARCHAR(100) DEFAULT 'LIBRE_ACCESO';
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS foto_referencia_url TEXT;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS telefono_contacto VARCHAR(20);

CREATE INDEX IF NOT EXISTS idx_pedidos_ruta ON pedidos(ruta_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON pedidos(estado);
CREATE INDEX IF NOT EXISTS idx_pedidos_ubicacion_gist ON pedidos USING GIST(ubicacion_destino);

-- 8. TABLA: tramos
CREATE TABLE IF NOT EXISTS tramos (
    tramo_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ruta_id UUID NOT NULL REFERENCES rutas(ruta_id) ON DELETE CASCADE,
    orden_secuencia INTEGER NOT NULL CHECK (orden_secuencia > 0),
    origen_geometria GEOMETRY(Point, 4326) NOT NULL,
    destino_geometria GEOMETRY(Point, 4326) NOT NULL,
    distancia_tramo_km DECIMAL(8,2) NOT NULL CHECK (distancia_tramo_km >= 0),
    tiempo_estimado_min DECIMAL(8,2) NOT NULL CHECK (tiempo_estimado_min >= 0),
    co2_tramo_kg DECIMAL(8,2) NOT NULL CHECK (co2_tramo_kg >= 0),
    geometria_linea GEOMETRY(LineString, 4326),
    CONSTRAINT uk_tramo_ruta_secuencia UNIQUE (ruta_id, orden_secuencia)
);

CREATE INDEX IF NOT EXISTS idx_tramos_ruta ON tramos(ruta_id);
CREATE INDEX IF NOT EXISTS idx_tramos_linea_gist ON tramos USING GIST(geometria_linea);
CREATE INDEX IF NOT EXISTS idx_tramos_origen_gist ON tramos USING GIST(origen_geometria);
CREATE INDEX IF NOT EXISTS idx_tramos_destino_gist ON tramos USING GIST(destino_geometria);

-- 9. TABLA: zonas_restringidas
CREATE TABLE IF NOT EXISTS zonas_restringidas (
    zona_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(150) NOT NULL,
    motivo VARCHAR(100) NOT NULL,
    poligono_geografico GEOMETRY(Polygon, 4326) NOT NULL,
    hora_inicio_restriccion TIME,
    hora_fin_restriccion TIME,
    activa BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_zonas_estado ON zonas_restringidas(activa);
CREATE INDEX IF NOT EXISTS idx_zonas_poligono_gist ON zonas_restringidas USING GIST(poligono_geografico);

-- 10. TABLA: incidencias
CREATE TABLE IF NOT EXISTS incidencias (
    incidencia_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id UUID NOT NULL REFERENCES pedidos(pedido_id),
    conductor_id UUID NOT NULL REFERENCES conductores(conductor_id),
    tipo_incidencia VARCHAR(50) NOT NULL CHECK (tipo_incidencia IN ('TRAFICO_EXCESIVO', 'CLIENTE_AUSENTE', 'VEHICULO_AVERIA', 'CLIMA', 'OTRO')),
    descripcion TEXT,
    ubicacion_reporte GEOMETRY(Point, 4326),
    reportada_en TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_incidencias_pedido ON incidencias(pedido_id);
CREATE INDEX IF NOT EXISTS idx_incidencias_conductor ON incidencias(conductor_id);
CREATE INDEX IF NOT EXISTS idx_incidencias_tipo ON incidencias(tipo_incidencia);
CREATE INDEX IF NOT EXISTS idx_incidencias_ubicacion_gist ON incidencias USING GIST(ubicacion_reporte);

-- 11. TABLA: reportes_emisiones
CREATE TABLE IF NOT EXISTS reportes_emisiones (
    reporte_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(200) NOT NULL,
    fecha_inicio_periodo DATE NOT NULL,
    fecha_fin_periodo DATE NOT NULL,
    total_co2_emitido_kg DECIMAL(12,2) NOT NULL CHECK (total_co2_emitido_kg >= 0),
    total_co2_ahorrado_kg DECIMAL(12,2) NOT NULL CHECK (total_co2_ahorrado_kg >= 0),
    generado_por_usuario UUID NOT NULL REFERENCES usuarios(usuario_id),
    generado_en TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_periodo_reporte CHECK (fecha_fin_periodo >= fecha_inicio_periodo)
);

CREATE INDEX IF NOT EXISTS idx_reportes_periodo ON reportes_emisiones(fecha_inicio_periodo, fecha_fin_periodo);
CREATE INDEX IF NOT EXISTS idx_reportes_usuario ON reportes_emisiones(generado_por_usuario);

-- 12. TABLA INTERMEDIA: detalle_reporte_ruta
CREATE TABLE IF NOT EXISTS detalle_reporte_ruta (
    reporte_id UUID NOT NULL REFERENCES reportes_emisiones(reporte_id) ON DELETE CASCADE,
    ruta_id UUID NOT NULL REFERENCES rutas(ruta_id) ON DELETE CASCADE,
    PRIMARY KEY (reporte_id, ruta_id)
);

CREATE INDEX IF NOT EXISTS idx_detalle_reporte_ruta_ruta ON detalle_reporte_ruta(ruta_id);
