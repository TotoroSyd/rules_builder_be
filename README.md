## Setup

```bash
npm install
npm run build
npm run dev
```

Server starts on **http://localhost:3000** (override with `PORT` env var).

---

## Endpoints

### `POST /evaluate`

Evaluate an ad-hoc rule and receive matching contacts instantly.

**Request body:**
```json
{
  "logic": "AND",
  "conditions": [
    { "field": "country",  "operator": "country-is",  "value": "US" },
    { "field": "plan",  "operator": "plan-is",  "value": "pro" }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "rule": {
      "logic": "AND",
      "conditions": [
        {
          "field": "country",
          "operator": "country-is",
          "value": "US"
        },
        {
          "field": "plan",
          "operator": "plan-is",
          "value": "pro"
        }
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

```bash
curl http://localhost:3000/rules
```

---

### `POST /rules`

Save a named rule for reuse.

```json
{
  "name": "VIP US Contacts",
  "description": "Optional description", // optional
  "rule": {
    "logic": "OR",
      "conditions": [
        {
          "field": "country",
          "operator": "country-is",
          "value": "JP"
        },
        {
          "field": "country",
          "operator": "country-is",
          "value": "AU" }
      ]
  }
}
```

---

### `DELETE /rules/:id`

Remove a saved rule by its UUID.

```bash
RULE_ID=$(curl -s http://localhost:3000/rules | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4) && \
curl -X DELETE http://localhost:3000/rules/$RULE_ID && \
echo "Deleted rule: $RULE_ID"
```
