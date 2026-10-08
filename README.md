<div align="center">

# 🌿 EcoLogistica-Lima

### **Plataforma Inteligente Web y Móvil para la Gestión, Optimización Heurística y Logística Verde Urbana**

*Proyecto Final de Carrera (PFA) — Universidad Continental (2026)*  
*Código Institucional: **`PFA-ECOLIMA-2026`***

---

[![Versión](https://img.shields.io/badge/Versi%C3%B3n-1.0.0-10b981?style=for-the-badge&logo=git&logoColor=white)](https://github.com/MartinezJhef/EcoLogistica-Lima)
[![Metodología](https://img.shields.io/badge/Metodolog%C3%ADa-H%C3%ADbrida%20(Scrum%20%2B%20Predictivo)-3b82f6?style=for-the-badge&logo=scrumalliance&logoColor=white)](docs/01%20Inicio/01.%20Selecci%C3%B3n%20del%20enfoque%20del%20proyecto%20V_1_0_0.md)
[![Estándar](https://img.shields.io/badge/Gobernanza-PMBOK%C2%AE%207%C2%AA%20Edici%C3%B3n-8b5cf6?style=for-the-badge&logo=bookstack&logoColor=white)](docs/01%20Inicio/02.%20Acta%20de%20constituci%C3%B3n%20V_1_0_0.md)
[![Calidad](https://img.shields.io/badge/Calidad-ISO%2FIEC%2025010-f59e0b?style=for-the-badge&logo=checkmarx&logoColor=white)](docs/01%20Inicio/07.%20Requisitos%20no%20funcionales%20V_1_0_0.md)
[![Estado](https://img.shields.io/badge/Estado-Fases%2001%2C%2002%20%26%2003%20(Sprint%201)%20Consolidadas-059669?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/MartinezJhef/EcoLogistica-Lima)

</div>

---

## 📑 Tabla de Contenidos

1. [🎯 Propósito y Visión del Proyecto](#-propósito-y-visión-del-proyecto)
2. [📊 Metas y Métricas de Impacto (KPIs)](#-metas-y-métricas-de-impacto-kpis)
3. [🏛️ Arquitectura del Sistema y Flujo Operativo](#️-arquitectura-del-sistema-y-flujo-operativo)
4. [🛠️ Stack Tecnológico](#️-stack-tecnológico)
5. [📐 Marco Metodológico Híbrido](#-marco-metodológico-híbrido)
6. [📚 Matriz Integral de Artefactos del Proyecto](#-matriz-integral-de-artefactos-del-proyecto)
   - [📍 Fase 01: Inicio (13 Documentos Normativos)](#-fase-01-inicio-13-documentos-normativos)
   - [📍 Fase 02: Planificación (4 Artefactos Ágiles y Jira)](#-fase-02-planificación-4-artefactos-ágiles-y-jira)
   - [📍 Fase 03: Implementación (4 Entregables Sprint 1)](#-fase-03-implementación-4-entregables-sprint-1)
7. [💻 Estructura del Código Fuente y Módulos](#-estructura-del-código-fuente-y-módulos)
8. [👥 Directorio del Equipo de Proyecto](#-directorio-del-equipo-de-proyecto)
9. [🌳 Estrategia de Ramas y Flujo Git](#-estrategia-de-ramas-y-flujo-git)
10. [🚀 Puesta en Marcha y Navegación Local](#-puesta-en-marcha-y-navegación-local)

---

## 🎯 Propósito y Visión del Proyecto

El crecimiento acelerado del comercio electrónico en **Lima Metropolitana** ha intensificado la congestión vehicular, los retrasos en la última milla y la emisión desmedida de gases de efecto invernadero ($CO_2$). Los operadores logísticos tradicionales enfrentan pérdidas operativas y altos costos de combustible debido a rutas ineficientes, zonificaciones ambientales restrictivas y una nula trazabilidad de la huella de carbono.

**EcoLogistica-Lima** surge como una solución tecnológica integral de **Logística Verde Urbana (Green Urban Logistics)** que fusiona:

- 🧠 **Motor de Optimización Heurística de Rutas:** Algoritmos conscientes del tráfico metropolitano, capacidad volumétrica/peso (85%-90%) y restricciones ambientales por zona.
- 📱 **Aplicación Móvil de Campo (Mobile-First):** Asignación y navegación para repartidores con soporte offline ante cortes de conectividad y comprobación digital de entrega (POD con tolerancia geográfica de 100 m).
- 🖥️ **Panel Web de Monitoreo y Despacho:** Telemetría geoespacial en tiempo real, re-optimización dinámica ante eventos disruptivos y gestión de flotas multivehiculares.
- 🌱 **Módulo de Analítica y Compensación Ambiental:** Cuantificación estandarizada de emisiones según tipología vehicular ($E_{\text{real}} = d \times F_{\text{vehículo}} \times C_{\text{tráfico}}$) y planes de mitigación mediante créditos de carbono y arborización urbana local.

---

## 📊 Metas y Métricas de Impacto (KPIs)

| Indicador Clave (KPI) | Meta Comprometida | Mecanismo de Medición | Documento Fuente |
| :--- | :---: | :--- | :--- |
| **Reducción de Emisiones ($CO_2$)** | **-22%** | Comparativa entre línea base convencional y ruta optimizada verde | [RF-005 / RF-006](docs/01%20Inicio/06.%20Requisitos%20funcionales%20V_1_0_0.md) |
| **Tiempo de Cálculo del Ruteo** | **< 45 seg** | Procesamiento de hasta 150 pedidos y 15 vehículos en simultáneo | [RNF-001](docs/01%20Inicio/07.%20Requisitos%20no%20funcionales%20V_1_0_0.md) |
| **Cumplimiento de Ventanas SLA** | **≥ 95%** | Verificación de entregas dentro del rango horario comprometido | [RN-007](docs/01%20Inicio/09.%20Reglas%20de%20negocio%20V_1_0_0.md) |
| **Precisión de Geolocalización POD** | **≤ 100 m** | Tolerancia máxima de geocerca GPS para confirmación digital de entrega | [RN-006](docs/01%20Inicio/09.%20Reglas%20de%20negocio%20V_1_0_0.md) |
| **Disponibilidad de la Plataforma** | **≥ 99.5%** | Tiempo de actividad en infraestructura en la nube | [RNF-006](docs/01%20Inicio/07.%20Requisitos%20no%20funcionales%20V_1_0_0.md) |

---

## 🏛️ Arquitectura del Sistema y Flujo Operativo

El sistema sigue los principios del **Modelo C4** (Contexto, Contenedores, Componentes y Despliegue) para asegurar modularidad, seguridad, alta disponibilidad y desacoplamiento.

```mermaid
flowchart TD
    subgraph Actores["👥 Usuarios del Sistema"]
        ADM["👨‍💼 Operador / Administrador"]
        CND["🚚 Conductor / Repartidor"]
        CLI["🏢 Cliente B2B / Destinatario"]
    end

    subgraph Canales["📱 Canales de Usuario"]
        WEB["💻 Plataforma Web (React + Vite)"]
        MOB["📱 App Móvil (React Native)"]
    end

    subgraph Servicios["⚙️ Backend & Motores"]
        API["🔌 API Backend Core (Python / FastAPI)"]
        OPT["🧠 Motor de Optimización Heurística"]
        ENV["🌱 Calculador de Huella CO₂"]
        AUTH["🔒 Servicio de Seguridad (JWT / RBAC)"]
    end

    subgraph Persistencia["🗄️ Capa de Datos"]
        DB[(🐘 PostgreSQL + PostGIS)]
        CACHE[(⚡ Redis Cache)]
    end

    subgraph Externos["🌐 Servicios Externos"]
        GIS["🗺️ OpenStreetMap / Mapbox / OSRM"]
        NOTIF["🔔 Firebase Cloud Messaging"]
    end

    ADM -->|Gestiona flota, pedidos y despacho| WEB
    CND -->|Recibe rutas y registra POD| MOB
    CLI -->|Consulta estado de entrega| WEB

    WEB -->|HTTPS / JSON| API
    MOB -->|HTTPS / Offline Sync| API

    API --> AUTH
    API --> OPT
    API --> ENV
    API --> DB
    API --> CACHE

    OPT -->|Matriz de distancias / tráfico| GIS
    API -->|Push notifications| NOTIF
```

---

## 🛠️ Stack Tecnológico

| Capa / Componente | Tecnología Seleccionada | Justificación Técnica |
| :--- | :--- | :--- |
| **Frontend Web** | `React 18` + `TypeScript` + `Vite` | Renderizado rápido, tipado estricto y componentes modulares para dashboards de alta densidad. |
| **Aplicación Móvil** | `React Native` + `Expo` | Compatibilidad multiplataforma (Android/iOS), soporte para sensores GPS y almacenamiento local offline. |
| **Backend & API** | `Python 3.11+` + `FastAPI` | Modelo asíncrono ASGI de alto rendimiento, OpenAPI/Swagger automático y desacoplamiento en capas con Pydantic. |
| **Base de Datos** | `PostgreSQL 16` + `PostGIS` | Motor relacional robusto con extensiones geoespaciales nativas para cálculo de polígonos, geocercas y distancias. |
| **Servicios GIS** | `Leaflet` / `OpenStreetMap` / `OSRM` | Cartografía de código abierto, flexibilidad sin costos prohibitivos de licenciamiento por volumen. |
| **Contenedores & DevOps** | `Docker` + `Docker Compose` + `GitHub Actions` | Entornos estandarizados, integración continua (CI/CD) y despliegue automatizado sin discrepancias de entorno. |

---

## 📐 Marco Metodológico Híbrido

Conforme a la evaluación formal documentada en `01. Selección del enfoque del proyecto`:

$$\text{Promedio Likert} = \frac{3 + 4 + 2 + 4 + 5}{5} = 3.6 \implies \textbf{Perfil Metodológico HÍBRIDO}$$

```text
┌────────────────────────────────────────────────────────────────────────────┐
│                    ENFOQUE HÍBRIDO: EcoLogistica-Lima                      │
├─────────────────────────────────────┬──────────────────────────────────────┤
│    CAPA PREDICTIVA (PMBOK® 7ª Ed.)  │      CAPA ADAPTATIVA (Scrum / BDD)   │
├─────────────────────────────────────┼──────────────────────────────────────┤
│ • Plazo académico inamovible: 16 sem│ • Cadencia: 8 Sprints de 2 semanas   │
│ • Línea base de alcance y EDT/WBS   │ • Épicas, Historias de Usuario (US)  │
│ • Control presupuestal formal       │ • Criterios BDD en formato Gherkin   │
│ • Gobernanza y control de versiones │ • Definition of Done (DoD) estricto  │
│ • Mitigación predictiva de riesgos  │ • Tablero Scrum y Roadmap en Jira    │
└─────────────────────────────────────┴──────────────────────────────────────┘
```

---

## 📚 Matriz Integral de Artefactos del Proyecto

### 📍 Fase 01: Inicio (13 Documentos Normativos)

Toda la documentación base se encuentra estandarizada y auditada en el directorio [`docs/01 Inicio/`](docs/01%20Inicio):

| Código | Documento Oficial | Responsable | Enfoque / Contenido Clave |
| :---: | :--- | :--- | :--- |
| **01** | [Selección del enfoque del proyecto V_1_0_0.md](docs/01%20Inicio/01.%20Selecci%C3%B3n%20del%20enfoque%20del%20proyecto%20V_1_0_0.md) | Jheferson Martinez | Evaluación cuantitativa de 5 variables Likert, radar metodológico y justificación híbrida PMBOK 7ª Ed. |
| **02** | [Acta de constitución V_1_0_0.md](docs/01%20Inicio/02.%20Acta%20de%20constituci%C3%B3n%20V_1_0_0.md) | Zayuri Cerron | Carta formal del proyecto, objetivos SMART, cronograma macro (16 sem.), presupuesto y designación de autoridad. |
| **03** | [Declaración de la visión V_1_0_0.md](docs/01%20Inicio/03.%20Declaraci%C3%B3n%20de%20la%20visi%C3%B3n%20V_1_0_0.md) | Angela Rojas | Propuesta de valor bajo plantilla canónica de visión, diferenciadores estratégicos y metas de sostenibilidad. |
| **04** | [Registro de supuestos y restricciones V_1_0_0.md](docs/01%20Inicio/04.%20Registro%20de%20supuestos%20y%20restricciones%20V_1_0_0.md) | Maylit Mendoza | Catálogo de supuestos operativos y restricciones técnicas, normativas y financieras con niveles de criticidad. |
| **05** | [Registro de interesados V_1_0_0.md](docs/01%20Inicio/05.%20Registro%20de%20interesados%20V_1_0_0.md) | Diego Angulo | Identificación de 5 perfiles de interesados, matriz Poder vs. Interés y estrategia formal de comunicación. |
| **06** | [Requisitos funcionales V_1_0_0.md](docs/01%20Inicio/06.%20Requisitos%20funcionales%20V_1_0_0.md) | Maylit Mendoza | 10 Requisitos Funcionales (RF-001 a RF-010) con criterios de aceptación BDD Gherkin (Ruta Gold, Feliz e Infeliz). |
| **07** | [Requisitos no funcionales V_1_0_0.md](docs/01%20Inicio/07.%20Requisitos%20no%20funcionales%20V_1_0_0.md) | Diego Angulo | 7 Requisitos de calidad técnica bajo la norma internacional ISO/IEC 25010 (Rendimiento, Seguridad, etc.). |
| **08** | [Usuarios V_1_0_0.md](docs/01%20Inicio/08.%20Usuarios%20V_1_0_0.md) | Jheferson Martinez | Matriz de arquetipos de usuario: Administrador, Despachador, Conductor, Cliente B2B y Receptor final. |
| **09** | [Reglas de negocio V_1_0_0.md](docs/01%20Inicio/09.%20Reglas%20de%20negocio%20V_1_0_0.md) | Zayuri Cerron | 10 Reglas operativas (RN-001 a RN-010) con fórmulas de emisión, control de capacidad y matriz de trazabilidad cruzada. |
| **10** | [Stack tecnológico V_1_0_0.md](docs/01%20Inicio/10.%20Stack%20tecnol%C3%B3gico%20V_1_0_0.md) | Equipo de Desarrollo | Criterios de selección arquitectónica: Frontend, Backend, Base de datos, GIS, Seguridad y Contenedores. |
| **11** | [Base de datos V_1_0_0.md](docs/01%20Inicio/11.%20Base%20de%20datos%20V_1_0_0.md) | Equipo de Datos | Modelo Entidad-Relación y diccionario de datos relacional/geoespacial para flotas, pedidos, rutas y auditoría. |
| **12** | [Modelo C4 V_1_0_0.md](docs/01%20Inicio/12.%20Modelo%20C4%20V_1_0_0.md) | Equipo de Arquitectura | Diagramas de Contexto, Contenedores y Componentes para representar el desacoplamiento sistémico. |
| **13** | [Restricciones V_1_0_0.md](docs/01%20Inicio/13.%20Restricciones%20V_1_0_0.md) | Maylit Mendoza | Análisis multidimensional: seguridad ciudadana en Lima, costo de ciclo de vida (LCC), normativas ambientales y contexto social. |

---

### 📍 Fase 02: Planificación (4 Artefactos Ágiles y Jira)

Toda la descomposición técnica y parametrización ágil reside en [`docs/02 Planificación/`](docs/02%20Planificaci%C3%B3n):

| Código | Artefacto Oficial | Responsable | Enfoque / Contenido Clave |
| :---: | :--- | :--- | :--- |
| **01** | [Transformando a ágil V_1_0_0.md](docs/02%20Planificaci%C3%B3n/01%20Transformando%20a%20%C3%A1gil%20V_1_0_0.md) | Diego Angulo | Desglose formal de Épicas, User Stories (US), Enablers técnicos, criterios BDD, DoR y Definition of Done (DoD). |
| **02** | [Artefactos Jira V_1_0_0.md](docs/02%20Planificaci%C3%B3n/02%20Artefactos%20Jira%20V_1_0_0.md) | Zayuri Cerron | Evidencias visuales de Jira Software: Roadmap temporal, Backlog con Story Points, Sprint 1 Planning, Tablero Scrum y Release. |
| **03** | [Registro de riesgos V_1_0_0.md](docs/02%20Planificaci%C3%B3n/03%20Registro%20de%20riesgos%20V_1_0_0.md) | Maylit Mendoza | Matriz cuantitativa de riesgos (Probabilidad $\times$ Impacto = Severidad), disparadores, planes de mitigación y contingencia. |
| **04** | [Presupuesto del proyecto V_1_0_0.md](docs/02%20Planificaci%C3%B3n/04%20Presupuesto%20del%20proyecto%20V_1_0_0.md) | Jheferson Martinez | Presupuesto detallado y categorizado: Recursos humanos, infraestructura Cloud, licencias y reserva de contingencia. |

---

### 📍 Fase 03: Implementación (Sprint 1)

Los entregables de gestión y código fuente del Sprint 1 residen en [`docs/03 Implementación/`](docs/03%20Implementaci%C3%B3n) y [`src/`](src):

| Código | Entregable Oficial | Responsable | Enfoque / Contenido Clave |
| :---: | :--- | :--- | :--- |
| **01** | [Informe de estado del proyecto V_1_0_0.md](docs/03%20Implementaci%C3%B3n/01%20Informe%20de%20estado%20del%20proyecto%20V_1_0_0.md) | Zayuri Cerron / Jheferson Martinez | Informe formal de avance del Sprint 1 (18 SP completados, 100% velocidad), metas alcanzadas y estado general. |
| **02** | [Registro de Impedimentos V_1_0_0.md](docs/03%20Implementaci%C3%B3n/02%20Registro%20de%20Impedimentos%20V_1_0_0.md) | Maylit Mendoza / Jheferson Martinez | Matriz estructurada con 5 impedimentos técnicos y operativos (PostGIS, Pydantic v2, Docker), análisis de impacto y resolución. |
| **03** | [Revisión del Sprint V_1_0_0.md](docs/03%20Implementaci%C3%B3n/03%20Revisi%C3%B3n%20del%20Sprint%20V_1_0_0.md) | Angela Rojas / Zayuri Cerron | Evidencia formal del demo ante stakeholders de DistriRápido S.A.C., criterios BDD cumplidos (US-001, US-002, US-003) y pendientes. |
| **04** | [Retrospectiva del Sprint V_1_0_0.md](docs/03%20Implementaci%C3%B3n/04%20Retrospectiva%20del%20Sprint%20V_1_0_0.md) | Equipo Scrum PFA | Análisis crítico y profundo en los cuatro ejes (Personas, Relaciones, Procesos, Herramientas) con plan de acción SMART. |
| **05** | [Especificación e Implementación US-001 Gestión de Vehículos](docs/03%20Implementaci%C3%B3n/05%20Especificacion%20e%20Implementacion%20US-001%20Gestion%20de%20Vehiculos%20V_1_0_0.md) | Equipo de Desarrollo | Especificación técnica, endpoints REST, validaciones ambientales y suite de pruebas unitarias. |
| **06** | [Especificación e Implementación US-002 Gestión de Conductores](docs/03%20Implementaci%C3%B3n/06%20Especificacion%20e%20Implementacion%20US-002%20Gestion%20de%20Conductores%20V_1_0_0.md) | Equipo de Desarrollo | Control de jornada máxima de 8h (Ley N° 30224), brevete MTC, origen GPS y pruebas automatizadas. |

---

## 💻 Estructura del Código Fuente y Módulos

El repositorio organiza el código fuente del producto en carpetas modulares desacopladas dentro del directorio [`src/`](src):

```text
EcoLogistica-Lima/
├── docs/                             # Documentación formal de ingeniería de software
│   ├── 01 Inicio/                    # 13 Documentos normativos iniciales
│   ├── 02 Planificación/             # 4 Artefactos ágiles, riesgos y presupuesto
│   └── 03 Implementación/            # Entregables de gestión y especificaciones técnicas US-001 y US-002
├── src/                              # Código fuente modular de la solución
│   ├── backend/                      # API RESTful en Python 3.11+ / FastAPI
│   │   ├── app/
│   │   │   ├── api/v1/endpoints/     # Controladores REST (vehiculos, conductores, pedidos)
│   │   │   ├── core/                 # Configuración centralizada y seguridad
│   │   │   ├── db/                   # Sesión y conexión a PostgreSQL + PostGIS
│   │   │   ├── models/               # Modelos relacionales ORM (SQLAlchemy 2.0)
│   │   │   ├── schemas/              # Validación estricta DTOs (Pydantic v2)
│   │   │   └── services/             # Lógica de dominio y reglas de negocio
│   │   ├── tests/                    # Batería de pruebas unitarias BDD (Pytest)
│   │   ├── main.py                   # Punto de entrada de la aplicación ASGI
│   │   ├── requirements.txt          # Dependencias oficiales de Python
│   │   └── Dockerfile                # Empaquetamiento del contenedor backend
│   ├── frontend/                     # Interfaz de usuario Web SPA en React 18 + Vite (Apple Design)
│   │   ├── src/
│   │   │   ├── pages/                # Vistas reactivas (VehiculosView, ConductoresView, PedidosView)
│   │   │   ├── services/             # Cliente API Axios y contratos TypeScript
│   │   │   ├── App.tsx               # Navegación y estructura de layout
│   │   │   └── index.css             # Sistema de estilos y tokens visuales Apple Design
│   │   ├── package.json              # Dependencias de Node.js / React
│   │   └── Dockerfile                # Empaquetamiento del contenedor frontend
│   └── database/                     # Scripts de persistencia relacional y geoespacial
│       └── init.sql                  # Script DDL oficial PostgreSQL 16 + PostGIS (11 tablas en 3FN)
├── .gitignore                        # Exclusión estricta de node_modules, .venv, logs y temporales
├── docker-compose.yml                # Orquestador multi-contenedor local y de staging
└── README.md                         # Portal maestro y mapa de navegación del proyecto
```

---

## 👥 Directorio del Equipo de Proyecto

<div align="center">

| Integrante | Rol Principal | Responsabilidad Metodológica |
| :--- | :--- | :--- |
| 👩‍💼 **Zayuri Cerron Medina** | **Directora de Proyecto (Project Manager)** | Gobernanza PMBOK, Acta de Constitución, Jira y Control de Reglas |
| 👨‍💻 **Jheferson Martinez Valerio** | **Líder Metodológico / Scrum Master** | Enfoque Híbrido, Presupuesto, Perfiles de Usuario y Repositorio Git |
| 👩‍🔬 **Angela Rojas Quispe** | **Product Owner / Analista de Negocio** | Declaración de la Visión, Definición de Épicas y Priorización de Backlog |
| 👩‍💻 **Maylit Mendoza Alarcon** | **Analista de Riesgos y QA** | Matriz de Riesgos, Especificación de RF (BDD), Restricciones y Supuestos |
| 👨‍💼 **Diego Angulo Gonzales** | **Gestor de Stakeholders & Comunicaciones** | Registro de Interesados, Requisitos No Funcionales (ISO) y Transformación Ágil |

</div>

---

## 🌳 Estrategia de Ramas y Flujo Git

El repositorio implementa una estrategia de ramificación basada en **GitFlow Adaptado** para asegurar la integridad de la línea base:

```text
  main (Producción y Entregables Consolidados)
   │
   ├── develop (Integración continua)
   │    │
   │    ├── feature/fase-01-inicio  <── [Consolidación completa de Fase 01 y Fase 02]
   │    └── feature/sprint-01       <── [En desarrollo activo]
   │
   └── release/v1.0.0 (Versión candidata final)
```

- **`main`**: Rama principal y protegida. Contiene únicamente versiones auditadas y aprobadas para evaluación institucional.
- **`feature/fase-01-inicio`**: Rama de trabajo histórica que consolida la documentación de Inicio y Planificación con sus evidencias.
- **Convención de Commits:** [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`).

---

## 🚀 Puesta en Marcha y Navegación Local

### Clonación del Repositorio
```bash
git clone https://github.com/MartinezJhef/EcoLogistica-Lima.git
cd EcoLogistica-Lima
```

### Navegación entre Ramas
```bash
# Ver el estado consolidado en main
git checkout main

# Explorar la rama de desarrollo de fase 01
git checkout feature/fase-01-inicio
```

---

### 🐘 1. Base de Datos en Docker (PostgreSQL 16 + PostGIS)

Asegúrate de tener abierta la aplicación **Docker Desktop** en Windows (*Engine running* en verde). Luego, desde la raíz del proyecto (`EcoLogistica-Lima`), ejecuta:

```powershell
# Levantar el contenedor de base de datos en segundo plano
docker compose up -d db

# Comprobar que el contenedor esté corriendo en el puerto 5432
docker ps
```

* **Parámetros de conexión local:**
  * **Host:** `localhost` | **Puerto:** `5432`
  * **Base de datos:** `ecologistica_db`
  * **Usuario:** `postgres` | **Contraseña:** `postgrespassword`
  * **Script de inicio:** Carga automáticamente las tablas, tipos espaciales e índices GiST desde [`src/database/init.sql`](src/database/init.sql).

---

### ⚙️ 2. Backend (FastAPI + Python)

Abre una terminal de PowerShell y sigue estos pasos:

```powershell
# 1. Ingresar a la carpeta del backend
cd src/backend

# 2. Crear el entorno virtual (solo la primera vez)
python -m venv .venv

# 3. Activar el entorno virtual en Windows
.venv\Scripts\activate

# 4. Instalar las dependencias del proyecto
pip install -r requirements.txt

# 5. Levantar el servidor backend en modo desarrollo con recarga automática
uvicorn main:app --reload
```

* **Endpoints y Documentación Interactiva:**
  * **API Base:** [http://localhost:8000](http://localhost:8000)
  * **Swagger UI (OpenAPI interactivo):** [http://localhost:8000/docs](http://localhost:8000/docs)
  * **ReDoc:** [http://localhost:8000/redoc](http://localhost:8000/redoc)

* **Ejecutar Suite de Pruebas Automatizadas (Pytest):**
  ```powershell
  # Con el entorno virtual activo (.venv):
  pytest -v
  ```

---

### 💻 3. Frontend (React 18 + Vite + TypeScript)

En una nueva terminal, navega a la carpeta del frontend y levanta la aplicación cliente con estilo Apple Design:

```powershell
# 1. Ingresar a la carpeta del frontend
cd src/frontend

# 2. Instalar dependencias de Node.js (solo la primera vez)
npm install

# 3. Iniciar el servidor local de desarrollo de Vite
npm run dev
```

* **Acceso a la Plataforma Web (Enrutamiento Dinámico con React Router):**
  * **URL Base:** [http://localhost:5173](http://localhost:5173)
  * Cuenta con rutas dinámicas e independientes:
    * 🚚 **Vehículos:** [http://localhost:5173/vehiculos](http://localhost:5173/vehiculos) (US-001: Gestión de Flota y Emisiones)
    * 👥 **Conductores:** [http://localhost:5173/conductores](http://localhost:5173/conductores) (US-002: Control de Fatiga y Jornada Máxima de 8h)
    * 📦 **Pedidos y GPS:** [http://localhost:5173/pedidos](http://localhost:5173/pedidos) (US-003: Registro y Mapa Geoespacial / US-004: Preferencias del Cliente)
    * 🛡️ **Administración y Roles:** [http://localhost:5173/admin](http://localhost:5173/admin) (Gestión RBAC: Alta de Personal de Oficina, Repartidores y Clientes con Permisos Granulares)

---

### 📱 4. Aplicación Móvil (Flutter: Repartidores y Clientes)

En una nueva terminal, ingresa al directorio móvil e inicia la aplicación Flutter:

```powershell
# 1. Ingresar a la carpeta de la app móvil
cd src/mobile

# 2. Obtener las dependencias de Flutter
flutter pub get

# 3. Ejecutar la aplicación en el navegador Chrome, Windows o Emulador Android
flutter run -d chrome     # Opción rápida web
# O bien:
flutter run -d windows    # Opción de escritorio Windows
```

* **Características implementadas:**
  * 🔐 **Autenticación con Detección Automática de Rol:** Deriva a la interfaz de Repartidor o Cliente.
  * 🚚 **Modo Repartidor:** Selección de pedido, visualización de ruta (A ➔ B), cálculo de tiempo de llegada (ETA), consumo de combustible, emisiones de $CO_2$ y captura de foto de entrega (POD).
  * 🏪 **Modo Cliente / Recepción:** Emisión de nuevos pedidos (Punto A a B), especificación de precio del producto y modalidad de pago ("Pago inmediato" o "Contraentrega").
  * 🔄 **Arquitectura Offline-First:** Persistencia en base de datos local SQL en caso de pérdida de conexión; al reconectar con PostgreSQL, las transacciones pendientes se sincronizan automáticamente.
  * 🍎 **Apple Design System:** Interfaz en modo oscuro *Obsidian Glass*, física táctil con resortes y componentes Cupertino fluidos.

---

### 📚 Visualización de Documentación en VS Code
Para una visualización enriquecida de las fórmulas matemáticas LaTeX ($$), tablas y diagramas Mermaid:
1. Instala la extensión **Markdown Preview Enhanced** o utiliza el visor nativo de VS Code (`Ctrl + Shift + V`).
2. Todos los documentos cuentan con navegación cruzada e hipervínculos relativos para saltar entre requisitos, reglas y código.

---

<div align="center">

**EcoLogistica-Lima** — *Innovación Tecnológica para una Logística Urbana Verde, Eficiente y Sostenible.*  
Universidad Continental · 2026

</div>
