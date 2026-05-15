# Content Service

This is the first runnable backend service in the repository.

## Responsibilities

1. expose approved docs, questions, claims, and sources
2. provide a health endpoint for local integration
3. act as the backend foundation for the future interview app

## Run

```bash
npm install
npm run start
```

Default address:

`http://127.0.0.1:4000`

## Endpoints

1. `GET /health`
2. `GET /api`
3. `GET /api/docs`
4. `GET /api/docs/:kb_id`
5. `GET /api/questions`
6. `GET /api/questions/:id`
7. `GET /api/claims`
8. `GET /api/sources`
