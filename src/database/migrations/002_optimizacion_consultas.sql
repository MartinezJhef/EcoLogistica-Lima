-- ============================================================================
-- 002 · Optimización de consultas para los listados paginados
--
-- Aplica los índices compuestos de la auditoría Green IT sobre una base ya
-- existente. `init.sql` los crea en instalaciones nuevas; este script los
-- incorpora sin recrear el esquema.
--
-- Uso:
--   psql "$DATABASE_URL" -f src/database/migrations/002_optimizacion_consultas.sql
-- ============================================================================

BEGIN;

-- Vehículos: el listado filtra por estado y propulsión antes de paginar.
CREATE INDEX IF NOT EXISTS idx_vehiculos_estado_tipo
    ON vehiculos(estado, tipo_combustible);
CREATE INDEX IF NOT EXISTS idx_vehiculos_tipo_estado
    ON vehiculos(tipo_combustible, estado);

-- Conductores: filtro por estado y orden por horas de conducción.
CREATE INDEX IF NOT EXISTS idx_conductores_estado_horas
    ON conductores(estado, horas_conduccion_hoy DESC);

-- Pedidos: filtros por estado/prioridad y orden cronológico descendente.
CREATE INDEX IF NOT EXISTS idx_pedidos_estado_creado
    ON pedidos(estado, creado_en DESC);
CREATE INDEX IF NOT EXISTS idx_pedidos_prioridad_creado
    ON pedidos(prioridad, creado_en DESC);

-- Usuarios: segmentación por rol con orden cronológico.
CREATE INDEX IF NOT EXISTS idx_usuarios_rol_creado
    ON usuarios(rol, creado_en DESC);

-- Rutas: histórico por fecha y conductor.
CREATE INDEX IF NOT EXISTS idx_rutas_fecha_conductor
    ON rutas(fecha_operacion DESC, conductor_id);

COMMIT;

-- Comprobación: los índices deben aparecer en el plan de ejecución.
--   EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM pedidos
--   WHERE estado = 'PENDIENTE' ORDER BY creado_en DESC LIMIT 12;
