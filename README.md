# n8n Resume Build

This repository contains a resume build project with a LaTeX resume service and Docker support.

## Structure

- `docker-compose.yml` - Compose configuration for running services.
- `latex-service/` - LaTeX resume generation service.
- `AI_Resume_Tailor_v7_final.json` - AI resume tailoring data file.

## Getting Started

1. Install Docker and Docker Compose.
2. Run `docker compose up --build` from the repository root.
3. Access the LaTeX service as configured in `docker-compose.yml`.

## Notes

- The LaTeX service includes `Sanan_Akther_SAP_Resume.tex` and related server code.
- Update Dockerfiles or service configuration as needed for your deployment.
