# Sentry

**Multi-Agent Financial Intelligence & Portfolio Risk Management Platform**

Sentry is an AI-powered financial intelligence platform that combines real-time financial data, news, weather intelligence, historical event retrieval and quantitative risk modeling to analyze how global events affect investment portfolios.

## Architecture

The platform consists of four modules:

| Module        | Responsibility                                                   |
| ------------- | ---------------------------------------------------------------- |
| Orchestrator  | LangGraph multi-agent coordination and final analysis            |
| Data Platform | Financial data ingestion, historical retrieval and external APIs |
| Risk Engine   | Portfolio exposure, scenario simulation and quantitative risk    |
| Frontend      | Interactive financial intelligence terminal                      |

## Team Responsibilities

* Person 1: `backend/orchestrator/`
* Person 2: `backend/data_platform/` and `data/`
* Person 3: `backend/risk_engine/`
* Person 4: `frontend/`

## Data Flow

User → Orchestrator → Data Platform → Risk Engine → Orchestrator → Frontend

## Technology Stack

* Backend: Python, FastAPI
* Agent Orchestration: LangGraph
* Frontend: React, TypeScript
* Database: PostgreSQL
* Cache: Redis
* Vector Database: To be finalized
* Infrastructure: Docker

## Initial Demo

Analyze the potential impact of a Category 4 hurricane approaching the Gulf of Mexico on an energy-sector investment portfolio.

The platform will gather evidence, analyze historical parallels, calculate portfolio risk, simulate scenarios and present evidence-backed strategies.

**Development status:** Initial architecture and team setup.
