import pytest
from httpx import ASGITransport, AsyncClient

from app.core.security import get_password_hash, verify_password
from app.main import app


@pytest.mark.asyncio
async def test_health():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_password_hash_roundtrip():
    hashed = get_password_hash("DolfTech123!")
    assert verify_password("DolfTech123!", hashed)
    assert not verify_password("wrong", hashed)
