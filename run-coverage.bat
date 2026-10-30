@echo off
echo ==============================================================================
echo 1/3 Generando Cobertura de Backend (Python Pytest Cobertura XML)
echo ==============================================================================
cd src\backend
call .venv\Scripts\activate.bat
python -m pip install pytest-cov
python -m pytest --cov=app --cov-report=xml:coverage.xml --cov-report=term-missing
cd ..\..

echo.
echo ==============================================================================
echo 2/3 Generando Cobertura de Frontend (React Vitest LCOV)
echo ==============================================================================
cd src\frontend
call npm install
call npm run test:coverage
cd ..\..

echo.
echo ==============================================================================
echo 3/3 Generando Cobertura de Mobile (Flutter LCOV)
echo ==============================================================================
cd src\mobile
call flutter test --coverage
cd ..\..

echo.
echo ==============================================================================
echo Reportes de cobertura generados exitosamente:
echo  - Backend:  src\backend\coverage.xml
echo  - Frontend: src\frontend\coverage\lcov.info
echo  - Mobile:   src\mobile\coverage\lcov.info
echo ==============================================================================

