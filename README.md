# n8n AI Resume Tailor

Automated resume tailoring pipeline built on [n8n](https://n8n.io). Upload your LaTeX resume + job description via a web form — the workflow rewrites your resume and cover letter for that specific role, scores it against the JD, runs ATS analysis, and emails you the results as PDFs.

## What it does

1. **Form trigger** — upload your `.tex` resume, paste the job description, set your ATS threshold
2. **Resume optimization** — Ollama (qwen2.5:3b) ensemble rewrites each bullet against the JD; source LaTeX structure preserved (hrefs, itemize, role headers); garbage model output falls back to source
3. **Summary rewrite** — injects 4-6 high-value JD keywords, ATS-optimized prose
4. **Cover letter** — qwen2.5:3b generates a recruiter-POV cover letter (Hook / Proof / Alignment / Close)
5. **ATS scoring** — deterministic ATS scorer computes keyword match, section breakdown, and formatting flags
6. **JD scoring** — qwen2.5:3b judge scores resume fit vs role requirements
7. **Vision audit** — rendered PDF pages converted to PNG, passed to vision model for layout validation
8. **Email delivery** — resume PDF + cover letter PDF + score report sent to your inbox

## Stack

| Component | Role |
|-----------|------|
| n8n | Workflow orchestration |
| Ollama (qwen2.5:3b) | Local section rewriting, cover letter generation, ground-truth verification, JD scoring |
| Deterministic ATS scorer (n8n code node) | Local keyword/format ATS scoring (no external API) |
| Ollama (llava) | Vision audit for rendered resume pages |
| latex-service | Sidecar HTTP service — compiles LaTeX → PDF + PNG page images |
| Ghostscript | PDF → PNG conversion inside latex-service |
| SMTP | Email delivery |

## Setup

### Prerequisites

- Docker + Docker Compose
- Ollama running locally with `qwen2.5:3b` pulled (`ollama pull qwen2.5:3b`)
- Ollama running locally with `llava` pulled (`ollama pull llava`)
- SMTP credentials

### Run

```bash
docker compose up --build
```

n8n available at `http://localhost:5678`.

### Import the workflow

1. Open n8n → **Workflows** → **Import from file**
2. Select `AI Resume Tailor v7 — Hybrid (Ollama ensemble + Groq judge_cover + Gemini ATS).json`
3. Configure credentials in n8n (Header Auth account for local Ollama, SMTP)
4. Activate the workflow

### Credentials to configure in n8n

- **Header Auth account** — HTTP Header Auth used by HTTP nodes calling local Ollama (`Authorization: Bearer ollama`)
- **SMTP** — Email node credentials for delivery

## Usage

1. Open the workflow's **Form trigger URL** (shown in n8n after activating)
2. Upload your LaTeX resume (`.tex`)
3. Paste the job description
4. Set ATS threshold (default 75)
5. Enter your email
6. Submit — PDF + cover letter arrive by email in ~2-3 minutes

## Project structure

```
├── docker-compose.yml                       # n8n + latex-service stack
├── latex-service/
│   ├── Dockerfile                           # Production image
│   ├── latex-service-Dockerfile             # Alternate Dockerfile
│   ├── server.js                            # LaTeX compile + PDF→PNG server
│   └── latex-service-server.js             # Alternate server entry
└── Resume_Tailor_v.json    # n8n workflow export
```

## Notes

- Ollama must be reachable from Docker via `host.docker.internal` (configured in `docker-compose.yml`)
- latex-service exposes port 3000 internally only; n8n calls it via Docker network
- n8n credentials are referenced by node name/id; secrets remain in n8n credential storage (not embedded in this repo)
- The workflow is designed for extensibility — you can swap out the ATS scorer, add more LLM-based analysis nodes, or integrate additional data sources as needed

