# Foodoscope API Issue Log

**Team:** CodeCatalysts
**Project:** FlavorPrint (Molecular Recipe Fingerprinting)
**Date:** 2026-02-15
**API Base URL:** `http://192.168.1.92:6969`

---

## Issue #1: Entity Endpoint Returns No Molecules

**Severity:** Critical
**Endpoint:** `GET /flavordb/entities/by-entity-alias-readable`
**Category:** Entity Controller

### Request

```
GET /flavordb/entities/by-entity-alias-readable?entity_alias_readable=grapefruit&page=0&size=1
Authorization: Bearer <API_KEY>
Accept: application/json
```

### Actual Response

```json
{
  "content": [
    {
      "_id": "674d8d47f45f52b897bfaf79",
      "entity_id": 238,
      "category": "fruit-citrus",
      "category_readable": "Fruit Citrus",
      "entity_alias": "grapefruit",
      "entity_alias_basket": "grapefruit, grapefruit-juice",
      "entity_alias_readable": "Grapefruit",
      "entity_alias_synonyms": "Grapefruit",
      "entity_alias_url": "https://en.wikipedia.org/wiki/Grapefruit",
      "natural_source_name": "Citrus",
      "natural_source_url": "https://en.wikipedia.org/wiki/Citrus"
    }
  ],
  "pageable": { "offset": 0, "pageNumber": 0, "pageSize": 1, "paged": true },
  "totalElements": 2,
  "totalPages": 2
}
```

The response contains entity metadata only. There is **no `molecules` field** in the entity object.

### Expected Behavior

The entity response should include a `molecules` array containing the flavor molecules associated with that ingredient. For reference, the original FlavorDB API at `cosylab.iiitd.edu.in` returns entities WITH molecules via the `entities_json?id={entity_id}` endpoint, where Grapefruit (entity_id=238) has **165 molecules**.

Expected response should include something like:

```json
{
  "content": [
    {
      "entity_id": 238,
      "entity_alias_readable": "Grapefruit",
      "category": "fruit-citrus",
      "molecules": [
        {
          "pubchem_id": 323,
          "common_name": "coumarin",
          "flavor_profile": "sweet@new mown hay@green@tonka@bitter",
          "molecular_weight": 146.145
        }
      ]
    }
  ]
}
```

### Impact

Without molecules in the entity response, it is impossible to build live molecular analysis for arbitrary ingredients using only the provided API. We cannot:
- Display molecular profiles for user-searched ingredients
- Compare molecular overlap between ingredients found via the API
- Generate flavor category breakdowns from API data

### Workaround Applied

We fall back to our static FlavorDB molecule library (bundled dataset) when the API entity response lacks molecules. This limits "live" analysis to ingredients already in our static dataset.

### Suggestion

Either:
1. Include the `molecules` array in the `/entities/by-entity-alias-readable` response, or
2. Provide a dedicated endpoint like `GET /flavordb/entities/{entity_id}/molecules` that returns molecules for a given entity, or
3. Provide a `GET /flavordb/entities_json?id={entity_id}` endpoint (as exists on the original cosylab server)

---

## Issue #2: Molecule Controller Parameter Name Mismatch

**Severity:** Medium
**Endpoint:** `GET /flavordb/molecules_data/by-flavorProfile`
**Category:** Molecule Controller

### Request (as documented)

```
GET /flavordb/molecules_data/by-flavorProfile?flavorProfile=sweet&page=0&size=5
Authorization: Bearer <API_KEY>
```

### Actual Response

```json
{
  "statusCode": 400,
  "message": "Parameter 'flavor_profile' cannot be empty.",
  "details": "uri=/flavordb/molecules_data/by-flavorProfile?flavorProfile=sweet&page=0&size=2"
}
```

### Expected Behavior

The endpoint path uses camelCase (`by-flavorProfile`), which implies the query parameter should be `flavorProfile`. However, the API actually requires the snake_case parameter name `flavor_profile`.

### Correct Request

```
GET /flavordb/molecules_data/by-flavorProfile?flavor_profile=sweet&page=0&size=5
```

### Impact

Developers following the endpoint URL naming convention will use `flavorProfile` as the parameter name and receive a 400 error. The error message does hint at the correct name (`flavor_profile`), but the inconsistency between URL path style (camelCase) and parameter name style (snake_case) is confusing.

### Suggestion

Either:
1. Accept both `flavorProfile` and `flavor_profile` as parameter names, or
2. Update the documentation to clearly state the parameter name is `flavor_profile` (snake_case), or
3. Make the URL path consistent with the parameter naming convention

---

## Issue #3: Molecule Controller `by-commonName` Parameter Name Inconsistency

**Severity:** Medium
**Endpoint:** `GET /flavordb/molecules_data/by-commonName`
**Category:** Molecule Controller

### Description

Same issue as #2. The endpoint path uses `by-commonName` (camelCase) but likely requires `common_name` (snake_case) as the query parameter, not `commonName`. This follows the same pattern observed with `by-flavorProfile` expecting `flavor_profile`.

### Suggestion

Standardize parameter naming across all endpoints. Either use camelCase everywhere or snake_case everywhere.

---

## Issue #4: No Endpoint to Get Molecules by Entity/Ingredient

**Severity:** High
**Category:** Missing Endpoint

### Description

There is no endpoint that maps an entity (food ingredient) to its constituent flavor molecules. The Entity Controller returns entity metadata, and the Molecule Controller allows filtering molecules by their own properties (flavor profile, type, weight, etc.), but there is no way to ask "What molecules does ingredient X contain?"

### Available Endpoints Checked

| Endpoint | Returns |
|---|---|
| `/entities/by-entity-alias-readable` | Entity metadata only (no molecules) |
| `/molecules_data/by-flavorProfile` | Molecules filtered by flavor type |
| `/molecules_data/by-commonName` | Molecules filtered by chemical name |
| `/molecules_data/filter-by-type` | Molecules filtered by chemical type |
| `/food/by-alias` | Food pairing suggestions (no molecules) |

### Expected Endpoint

Something like:
- `GET /flavordb/entities/{entity_id}/molecules` - returns all molecules for an entity
- `GET /flavordb/molecules_data/by-entity?entity_id=238` - returns molecules associated with a specific entity

### Impact

This is the most critical missing functionality for building molecular analysis features. The core use case of "look up an ingredient and see its molecular profile" cannot be achieved with the current API alone.

---

## Environment Details

- **API Host:** `http://192.168.1.92:6969`
- **Authentication:** Bearer token via `Authorization` header
- **Client:** Next.js 16.1.6 with TypeScript, running on `localhost:3000`
- **Testing method:** Direct `curl` requests and browser `fetch()` calls
- **Date tested:** 2026-02-15
