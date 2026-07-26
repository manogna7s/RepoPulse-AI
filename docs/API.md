# RepoPulse AI — API Reference

Base URL (local): `http://localhost:5000/api`  
Base URL (production): `https://<your-render-service>.onrender.com/api`

All successful responses use:

```json
{
  "success": true,
  "message": "string",
  "data": {}
}
```

All error responses use:

```json
{
  "success": false,
  "message": "string",
  "error": { "code": "OPTIONAL_CODE" }
}
```

---

## POST `/api/repository/analyze`

Runs the full engineering analysis pipeline for a public GitHub repository.

### Request

```http
POST /api/repository/analyze
Content-Type: application/json
```

```json
{
  "url": "https://github.com/facebook/react"
}
```

| Field | Type   | Required | Description                          |
|-------|--------|----------|--------------------------------------|
| `url` | string | yes      | GitHub repository URL (`owner/repo`) |

### Success response `200`

```json
{
  "success": true,
  "message": "Engineering analysis complete for facebook/react",
  "data": {
    "repository": {},
    "scores": {
      "documentation": 0,
      "community": 0,
      "activity": 0,
      "dependency": 0,
      "metadata": 0
    },
    "engineeringHealth": {
      "overallScore": 0,
      "grade": "A"
    },
    "technicalDebt": [],
    "technicalDebtMeta": {},
    "aiInsights": {},
    "persistence": {
      "saved": true,
      "reason": "created",
      "analysisId": "…",
      "analysisDate": "2026-07-26T00:00:00.000Z"
    }
  }
}
```

### Error responses

| Status | Code (typical)        | When                                      |
|--------|-----------------------|-------------------------------------------|
| `400`  | `INVALID_URL`         | Missing or malformed GitHub URL           |
| `404`  | —                     | Repository not found on GitHub             |
| `429`  | `ANALYZE_RATE_LIMITED`| Too many analyze requests from this IP    |
| `504`  | `REQUEST_TIMEOUT`     | Analysis exceeded the server timeout      |
| `500`  | `INTERNAL_ERROR`      | Unexpected server failure                 |

---

## GET `/api/history`

Lists previously saved analyses (requires MongoDB).

### Query parameters

| Param    | Type   | Default  | Description                                      |
|----------|--------|----------|--------------------------------------------------|
| `search` | string | `""`     | Match repository name / URL substring            |
| `owner`  | string | `""`     | Filter by GitHub owner                           |
| `sort`   | string | `newest` | `newest` \| `oldest` \| `highest` \| `lowest`    |
| `limit`  | number | server   | Cap number of rows returned                      |

### Success response `200`

```json
{
  "success": true,
  "message": "Analysis history loaded",
  "data": [
    {
      "_id": "…",
      "owner": "facebook",
      "repositoryName": "react",
      "repositoryUrl": "https://github.com/facebook/react",
      "analysisDate": "2026-07-26T00:00:00.000Z",
      "engineeringHealth": { "overallScore": 88, "grade": "A" }
    }
  ]
}
```

### Error responses

| Status | When                                              |
|--------|---------------------------------------------------|
| `503`  | Database unavailable / history service cannot run |
| `500`  | Unexpected server failure                         |

---

## GET `/api/history/:id`

Loads one saved analysis by MongoDB ObjectId.

### Success response `200`

```json
{
  "success": true,
  "message": "Analysis loaded",
  "data": {
    "id": "…",
    "repositoryUrl": "https://github.com/facebook/react",
    "owner": "facebook",
    "repositoryName": "react",
    "analysisDate": "2026-07-26T00:00:00.000Z",
    "repository": {},
    "scores": {},
    "engineeringHealth": {},
    "technicalDebt": [],
    "technicalDebtMeta": {},
    "aiInsights": {}
  }
}
```

### Error responses

| Status | When                    |
|--------|-------------------------|
| `400`  | Invalid ObjectId           |
| `404`  | Analysis not found       |
| `503`  | Database unavailable    |
| `500`  | Unexpected server failure |

---

## DELETE `/api/history/:id`

Deletes one saved analysis.

### Success response `200`

```json
{
  "success": true,
  "message": "Analysis deleted",
  "data": { "id": "…" }
}
```

### Error responses

Same as `GET /api/history/:id` for invalid / missing IDs and DB failures.

---

## GET `/api/health`

Liveness check for local development and Render health probes.

### Success response `200`

```json
{
  "success": true,
  "message": "RepoPulse API Running",
  "data": {
    "status": "ok",
    "database": "connected"
  },
  "timestamp": "2026-07-26T00:00:00.000Z"
}
```

`database` is `"connected"` or `"disconnected"`. The process is still healthy when MongoDB is down — analysis without history remains available.
