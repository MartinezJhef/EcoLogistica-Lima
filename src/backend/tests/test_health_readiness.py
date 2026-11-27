from fastapi import HTTPException
from sqlalchemy.exc import OperationalError
import pytest
from app.api.v1.endpoints.health import health_check


def test_health_endpoint_reads_database(client):
    result=client.get('/api/v1/health')
    assert result.status_code==200 and result.json()['status']=='ONLINE'


def test_database_outage_cannot_produce_a_healthy_response():
    class Unavailable:
        def execute(self,query):raise OperationalError('SELECT 1',{},Exception('private connection detail'))
    with pytest.raises(HTTPException) as error:health_check(Unavailable())
    assert error.value.status_code==503
    assert error.value.detail=='Base de datos no disponible'
