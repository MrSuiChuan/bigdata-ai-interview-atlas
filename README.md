# Big Data + AI Interview System

This repository is a markdown-first knowledge system for big data and AI agent interview preparation.

It is designed around four rules:

1. Markdown is the source of truth for learning content.
2. Claims are stored separately from articles and questions.
3. Every reviewed item must point to official or otherwise approved sources.
4. Code examples live in dedicated files so they can be checked automatically.

## Repository map

- `docs/`: learning articles
- `questions/`: interview questions with standard answers and follow-up prompts
- `claims/`: minimal factual statements with source bindings
- `sources/`: approved references
- `examples/`: runnable or syntax-checkable examples
- `rubrics/`: answer scoring rules
- `templates/`: authoring templates
- `scripts/`: validation tools
- `web/`: future docs site and interview app
- `api/`: future backend services

## Current seed scope

- Big data: Kafka overview and consumer groups
- AI agent: OpenAI Agents SDK and MCP
- Validation: frontmatter, source and claim references, example file existence

## Principles for accuracy

The system does not claim literal absolute truth. Instead, it aims for high-confidence, auditable accuracy:

1. reviewed content must cite approved sources
2. each item must declare version scope
3. fast-moving topics must include `last_verified_at`
4. AI-generated drafts must be reviewed before publication
5. code samples should be syntax-checked and, when practical, smoke-tested

## Quick start

```bash
npm install
npm run validate
```

## Docs site

The documentation portal lives in `web/docs-site`.

```bash
cd web/docs-site
npm install
npm run start
```

## Authoring flow

1. add or update a source in `sources/`
2. add claims in `claims/`
3. write a document in `docs/`
4. add matching questions in `questions/`
5. place example files under `examples/`
6. run `npm run validate`

## Next build targets

1. expand seed content for Spark, Flink, Hive, Iceberg, LangGraph, CrewAI, and Microsoft Agent Framework
2. generate a search index from frontmatter and claims
3. build a docs site and interview practice app
4. add AI-guided mock interview and rubric-based scoring
