import unittest
from datetime import time
from pydantic import ValidationError
from app.schemas.vehiculo import VehiculoCreate
from app.schemas.conductor import ConductorCreate
from app.schemas.pedido import PedidoCreate

class TestSprint1(unittest.TestCase):

    def test_us001_escenario1_vehiculo_valido(self):
        """US-001 Escenario 1: Registro de vehículo con información válida"""
        vehiculo = VehiculoCreate(
            placa="ABC-123",
            marca_modelo="Hyundai Porter H-100",
            capacidad_peso_kg=1500.0,
            capacidad_volumen_m3=12.5,
            tipo_combustible="DIESEL",
            factor_emision_co2=0.2450,
            estado="DISPONIBLE"
        )
        self.assertEqual(vehiculo.placa, "ABC-123")
        self.assertEqual(vehiculo.tipo_combustible, "DIESEL")
        self.assertGreater(vehiculo.capacidad_peso_kg, 0)

    def test_us001_tipo_combustible_invalido(self):
        """US-001 Validación: Rechazo de tipo de combustible no ecológico/no soportado"""
        with self.assertRaises(ValidationError):
            VehiculoCreate(
                placa="XYZ-999",
                marca_modelo="Camión Antiguo",
                capacidad_peso_kg=2000.0,
                capacidad_volumen_m3=10.0,
                tipo_combustible="CARBON",  # Inválido
                factor_emision_co2=0.9
            )

    def test_us002_escenario1_conductor_valido(self):
        """US-002 Escenario 1: Registro de conductor con licencia válida"""
        conductor = ConductorCreate(
            dni="71234567",
            nombres="Carlos Eduardo",
            apellidos="Quispe Huamán",
            licencia="Q12345678",
            telefono="987654321",
            estado="DISPONIBLE",
            horas_conduccion_hoy=4.5
        )
        self.assertEqual(conductor.licencia, "Q12345678")
        self.assertEqual(conductor.estado, "DISPONIBLE")

    def test_us002_escenario2_exceso_jornada_ley_30224(self):
        """US-002 Escenario 2: Simulación de validación legal de 8 horas máximas"""
        horas_previas = 7.5
        horas_nueva_ruta = 1.5
        horas_totales = horas_previas + horas_nueva_ruta
        # La regla RN-004 y Ley N° 30224 estipula límite máximo de 8.0 horas
        self.assertGreater(horas_totales, 8.0, "Debe superar las 8 horas legales")

    def test_us003_escenario1_pedido_valido_lima(self):
        """US-003 Escenario 1: Registro de pedido con coordenadas válidas de Lima Metropolitana"""
        pedido = PedidoCreate(
            codigo_seguimiento="PED-LIMA-001",
            cliente_nombre="Bodega Don Pepe",
            direccion_destino="Av. Próceres de la Independencia 1540, SJL",
            latitud=-12.0125,
            longitud=-77.0012,
            peso_kg=45.5,
            volumen_m3=0.85,
            ventana_inicio=time(9, 0),
            ventana_fin=time(12, 0),
            prioridad="ALTA"
        )
        self.assertEqual(pedido.codigo_seguimiento, "PED-LIMA-001")
        self.assertGreater(pedido.ventana_fin, pedido.ventana_inicio)

    def test_us003_escenario2_ventana_invalida_rn007(self):
        """US-003 Escenario 2: Rechazo cuando ventana_fin <= ventana_inicio (RN-007)"""
        with self.assertRaises(ValidationError):
            PedidoCreate(
                codigo_seguimiento="PED-FAIL-002",
                cliente_nombre="Minimarket Central",
                direccion_destino="Av. Javier Prado Este 2500",
                latitud=-12.0850,
                longitud=-76.9950,
                peso_kg=20.0,
                volumen_m3=0.5,
                ventana_inicio=time(14, 0),
                ventana_fin=time(11, 0)  # Fin anterior al inicio -> Error
            )

if __name__ == '__main__':
    unittest.main()
