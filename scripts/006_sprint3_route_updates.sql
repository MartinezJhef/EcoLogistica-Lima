-- Apply once to the same PostgreSQL database used by FastAPI and Supabase.
BEGIN;
ALTER TABLE vehiculos ADD COLUMN IF NOT EXISTS altura_m numeric(5,2);
ALTER TABLE vehiculos ADD COLUMN IF NOT EXISTS es_ligero boolean;
ALTER TABLE conductores ADD COLUMN IF NOT EXISTS fecha_jornada date NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE conductores ADD COLUMN IF NOT EXISTS licencia_vencimiento date;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS conductor_id uuid REFERENCES conductores(conductor_id);
UPDATE usuarios u SET conductor_id=c.conductor_id FROM conductores c
 WHERE c.usuario_id=u.usuario_id AND u.conductor_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS usuarios_conductor_unico ON usuarios(conductor_id) WHERE conductor_id IS NOT NULL;
-- Compatibility with the original init.sql: preserve legacy geometry columns and all existing data.
ALTER TABLE rutas ADD COLUMN IF NOT EXISTS co2_computacional_kg numeric(12,8) NOT NULL DEFAULT 0;
ALTER TABLE rutas ADD COLUMN IF NOT EXISTS energia_computacional_kwh numeric(12,8) NOT NULL DEFAULT 0;
ALTER TABLE rutas ADD COLUMN IF NOT EXISTS tiempo_computo_seg numeric(10,4) NOT NULL DEFAULT 0;
ALTER TABLE rutas ADD COLUMN IF NOT EXISTS minutos_transcurridos numeric(8,2) NOT NULL DEFAULT 0;
ALTER TABLE rutas ADD COLUMN IF NOT EXISTS hora_salida time NOT NULL DEFAULT '08:00';
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='rutas' AND column_name='jornada_reservada') THEN
  ALTER TABLE rutas ADD COLUMN jornada_reservada boolean NOT NULL DEFAULT false;
  UPDATE rutas r SET jornada_reservada=true FROM conductores c
   WHERE r.conductor_id=c.conductor_id AND r.fecha_operacion=CURRENT_DATE
     AND r.estado IN ('PLANIFICADA','EN_EJECUCION') AND c.horas_conduccion_hoy >= r.tiempo_total_min/60.0;
 END IF;
END $$;
ALTER TABLE rutas ADD COLUMN IF NOT EXISTS medicion_computacional_disponible boolean NOT NULL DEFAULT false;
ALTER TABLE rutas ALTER COLUMN deposito_origen_id DROP NOT NULL;
ALTER TABLE depositos ADD COLUMN IF NOT EXISTS latitud numeric(10,6);
ALTER TABLE depositos ADD COLUMN IF NOT EXISTS longitud numeric(10,6);
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='depositos' AND column_name='ubicacion_geografica') THEN
    UPDATE depositos SET latitud=ST_Y(ubicacion_geografica), longitud=ST_X(ubicacion_geografica)
      WHERE ubicacion_geografica IS NOT NULL AND (latitud IS NULL OR longitud IS NULL);
    ALTER TABLE depositos ALTER COLUMN ubicacion_geografica DROP NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tramos' AND column_name='origen_geometria') THEN
    ALTER TABLE tramos ALTER COLUMN origen_geometria DROP NOT NULL;
    ALTER TABLE tramos ALTER COLUMN destino_geometria DROP NOT NULL;
  END IF;
END $$;
ALTER TABLE tramos ADD COLUMN IF NOT EXISTS tipo_parada varchar(30) NOT NULL DEFAULT 'ENTREGA';
ALTER TABLE tramos ADD COLUMN IF NOT EXISTS pedido_id uuid REFERENCES pedidos(pedido_id);
ALTER TABLE tramos ADD COLUMN IF NOT EXISTS descripcion text;
ALTER TABLE tramos ADD COLUMN IF NOT EXISTS latitud numeric(10,6);
ALTER TABLE tramos ADD COLUMN IF NOT EXISTS longitud numeric(10,6);
ALTER TABLE tramos ADD COLUMN IF NOT EXISTS alerta_zona_riesgo boolean NOT NULL DEFAULT false;
ALTER TABLE tramos ADD COLUMN IF NOT EXISTS nombre_zona_riesgo varchar(150);
ALTER TABLE tramos ADD COLUMN IF NOT EXISTS geometria_linea_geojson text;
ALTER TABLE pedidos ALTER COLUMN estado TYPE varchar(50);
ALTER TABLE pedidos DROP CONSTRAINT IF EXISTS pedidos_estado_check;
ALTER TABLE pedidos ADD CONSTRAINT pedidos_estado_check CHECK (estado IN (
 'PENDIENTE','ASIGNADO','EN_TRANSITO','ENTREGADO','NO_ENTREGADO','CANCELADO',
 'No Asignados por Exceso de Capacidad','NO ASIGNADOS POR EXCESO DE CAPACIDAD'));
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS referencia_destino text;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS usuario_cliente_id uuid REFERENCES usuarios(usuario_id);
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS precio_producto numeric(10,2) DEFAULT 0;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS metodo_pago varchar(50) DEFAULT 'PAGADO';
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS origen_direccion text;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS origen_lat numeric(10,6);
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS origen_lng numeric(10,6);
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS foto_entrega_url text;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS distancia_km numeric(10,2);
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS tiempo_estimado_min numeric(10,2);
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS consumo_combustible_gal numeric(10,3);
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS emision_co2_kg numeric(10,3);
CREATE TABLE IF NOT EXISTS route_updates (
  update_id uuid PRIMARY KEY,
  ruta_id uuid NOT NULL REFERENCES rutas(ruta_id),
  conductor_id uuid NOT NULL REFERENCES conductores(conductor_id),
  payload text NOT NULL,
  motivo varchar(200) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  acknowledged_at timestamptz
);
CREATE INDEX IF NOT EXISTS route_updates_pending ON route_updates(conductor_id, created_at)
  WHERE acknowledged_at IS NULL;
CREATE TABLE IF NOT EXISTS clientes (
 cliente_id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tipo_documento varchar(10) NOT NULL DEFAULT 'RUC',
 numero_documento varchar(20) UNIQUE NOT NULL, razon_social varchar(200) NOT NULL,
 nombre_contacto varchar(150), telefono varchar(20) NOT NULL, email varchar(150),
 direccion varchar(250) NOT NULL, distrito varchar(100) NOT NULL,
 latitud numeric(10,6) NOT NULL, longitud numeric(10,6) NOT NULL,
 tipo_comercio varchar(50) NOT NULL DEFAULT 'BODEGA',
 ventana_entrega_inicio varchar(10) NOT NULL DEFAULT '08:00', ventana_entrega_fin varchar(10) NOT NULL DEFAULT '18:00',
 restriccion_acceso varchar(100) NOT NULL DEFAULT 'LIBRE_ACCESO', estado varchar(20) NOT NULL DEFAULT 'ACTIVO',
 creado_en timestamptz NOT NULL DEFAULT now()
);
COMMIT;
