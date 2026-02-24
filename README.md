# Rules Builder API

## Tech Stack

- Node.js v24.13.1
- TypeScript 5.6.3

---

## Setup

```bash
npm install       # install dependencies
npm run build     # compile TypeScript to dist/
npm run start     # run compiled server
npm run dev       # run dev server with hot reload
npm run test      # run API tests
```

---

## Server

| Environment | URL |
|-------------|-----|
| Local | `http://localhost:3000` |
| Deployed | `https://rulesbuilderbe.up.railway.app` |

Override the local port with a `PORT` environment variable.

All protected routes require a `Bearer` token in the `Authorization` header:

```
Authorization: Bearer <token>
```

---

## API Reference

### `GET /health`

Health check. No auth required.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "contacts_loaded": 10,
    "sample_contact": {
      "id": "c001",
      "name": "Alice Johnson",
      "email": "alice@acme.com",
      "country": "US",
      "signupDate": "2022-03-15",
      "purchaseCount": 12,
      "plan": "pro"
    },
    "timestamp": "2024-01-01T00:00:00.000Z"
  },
  "message": "OK"
}
```

---

### `POST /evaluate`

Evaluate a rule and return matching contacts.

**Request body:**
```json
{
  "logic": "AND",
  "conditions": [
    { "field": "country",  "operator": "is",           "value": "US" },
    { "field": "plan",     "operator": "is",           "value": "pro" },
    { "field": "email",    "operator": "contains",     "value": "@acme" },
    { "field": "signupDate","operator": "after",       "value": "2021-01-01" },
    { "field": "purchaseCount","operator": "greater-than","value": 5 }
  ]
}
```

| Field | Type | Values |
|-------|------|--------|
| `logic` | string | `AND`, `OR` |
| `conditions[].field` | string | `email`, `country`, `signupDate`, `purchaseCount`, `plan` |
| `conditions[].operator` | string | See operators table below |
| `conditions[].value` | string \| number | Depends on field |

**Operators by field:**

| Field | Operators |
|-------|-----------|
| `email` | `contains`, `not-contains` |
| `country` | `is`, `is-not` |
| `signupDate` | `before`, `after` |
| `purchaseCount` | `equals`, `greater-than`, `less-than` |
| `plan` | `is`, `is-not` |

**Response:**
```json
{
  "success": true,
  "data": {
    "rule": {
      "logic": "AND",
      "conditions": [
        { "field": "country", "operator": "is", "value": "US" },
        { "field": "plan",    "operator": "is", "value": "pro" }
      ]
    },
    "matched_count": 1,
    "contacts": [
      {
        "id": "c001",
        "name": "Alice Johnson",
        "email": "alice@acme.com",
        "country": "US",
        "signupDate": "2022-03-15",
        "purchaseCount": 12,
        "plan": "pro"
      }
    ]
  },
  "message": "Found 1 matching contact(s)"
}
```

---

### `GET /rules`

List all saved rules.

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 1,
    "rules": [
      {
        "id": "a1b2c3d4-...",
        "name": "VIP US Contacts",
        "description": "Pro plan users in the US",
        "rule": {
          "logic": "AND",
          "conditions": [
            { "field": "country", "operator": "is", "value": "US" },
            { "field": "plan",    "operator": "is", "value": "pro" }
          ]
        },
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ]
  },
  "message": "Rules retrieved successfully"
}
```

---

### `POST /rules`

Save a named rule for reuse.

**Request body:**
```json
{
  "name": "VIP US Contacts",
  "description": "Pro plan users in the US",
  "rule": {
    "logic": "AND",
    "conditions": [
      { "field": "country", "operator": "is", "value": "US" },
      { "field": "plan",    "operator": "is", "value": "pro" }
    ]
  }
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Display name for the rule |
| `description` | No | Optional description |
| `rule` | Yes | Rule object with `logic` and `conditions` |

**Response:**
```json
{
  "success": true,
  "data": {
    "saved": {
      "id": "a1b2c3d4-...",
      "name": "VIP US Contacts",
      "description": "Pro plan users in the US",
      "rule": { "logic": "AND", "conditions": [] },
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  },
  "message": "Rule saved successfully"
}
```

---

### `DELETE /rules`

Delete a saved rule by its ID.

**Request body:**
```json
{
  "id": "a1b2c3d4-..."
}
```

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Rule with id a1b2c3d4-... deleted successfully"
}
```

---

## Error Response

All errors follow this shape:

```json
{
  "success": false,
  "error": "Validation failed",
  "details": ["name is required"]
}
```

## To improve
- logging set up
- Enum for country