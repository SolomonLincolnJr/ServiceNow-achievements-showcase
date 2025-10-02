# SNAS API Documentation

## ServiceNow Achievements Showcase - REST API Specification

### Overview

The SNAS API provides comprehensive access to AI-enhanced badge prioritization and content generation capabilities, supporting veteran career advancement through professional excellence demonstration.

### Base URL
```
https://[instance].service-now.com/api/x_snc_snas_port/
```

### Authentication
- **Type**: ServiceNow Session Authentication or OAuth 2.0
- **Scope**: `x_snc_snas_port.user` (read operations), `x_snc_snas_port.admin` (write operations)

---

## Endpoints

### 1. Badge Prioritization

#### POST `/api/v1/prioritize-badges`

Applies AI-powered context-aware prioritization to badge arrays with veteran mission alignment.

**Request Body:**
```json
{
  "user_profile": {
    "id": "solomon.washington",
    "military_background": true,
    "target_role": "ServiceNow Developer",
    "experience_level": "senior"
  },
  "badges_array": [
    {
      "id": "csa-001",
      "name": "Certified System Administrator",
      "type": "certification",
      "issuer": "ServiceNow",
      "date_earned": "2024-08-15",
      "category": "Platform Administration"
    }
  ],
  "context_parameters": {
    "target_audience": "it_recruiters",
    "content_focus": "certifications",
    "veteran_narrative": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "processing_time_ms": 1250,
  "badges": [
    {
      "badge_id": "csa-001",
      "priority_score": 125,
      "reasoning": [
        "CSA certification priority boost (+25)",
        "Recent achievement boost (+20)",
        "ServiceNow platform relevance (+15)"
      ],
      "display_weight": "high",
      "engagement_prediction": 0.92,
      "veteran_mission_alignment": {
        "score": 0.87,
        "service_to_success": true
      }
    }
  ]
}
```

### 2. Content Generation

#### GET `/api/v1/content-suggestions`

Generates AI-enhanced content suggestions for LinkedIn posts, professional summaries, and badge descriptions.

**Query Parameters:**
- `badge_id` (required): Badge identifier
- `content_type`: `linkedin_post`, `badge_description`, `professional_summary`
- `audience`: `it_recruiters`, `veteran_community`, `servicenow_professionals`
- `veteran_narrative`: `true/false`

**Response:**
```json
{
  "success": true,
  "content_type": "linkedin_post",
  "suggestions": [
    {
      "content": "Proud to achieve ServiceNow CSA certification! This milestone represents my commitment to excellence in platform administration, building on leadership skills developed through military service. #ServiceNow #VeteranInTech #ContinuousLearning",
      "confidence": 0.89,
      "veteran_aligned": true,
      "engagement_prediction": 0.85
    }
  ],
  "veteran_mission_alignment": {
    "mission_alignment_score": 0.91,
    "service_to_success_integration": true,
    "community_impact_potential": "high"
  }
}
```

### 3. Badge Management

#### GET `/api/v1/badges`

Retrieves badge list with filtering and pagination support.

**Query Parameters:**
- `type`: Filter by badge type (`certification`, `badge`, `achievement`)
- `issuer`: Filter by issuer name
- `category`: Filter by category
- `limit`: Results per page (default: 50)
- `offset`: Page offset (default: 0)

#### POST `/api/v1/badges`

Creates or updates badge records (October 10 data import support).

**Request Body:**
```json
{
  "name": "Certified Implementation Specialist - ITSM",
  "type": "certification",
  "issuer": "ServiceNow",
  "description": "Advanced ITSM implementation certification",
  "category": "ITSM",
  "date_earned": "2024-07-22"
}
```

---

## Response Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error |

---

## Rate Limiting

- **Standard Users**: 100 requests/minute
- **Premium Users**: 500 requests/minute
- **Admin Users**: 1000 requests/minute

---

## Performance Standards

- **Response Time SLA**: < 2 seconds for all operations
- **Availability**: 99.9% uptime
- **Throughput**: 1000+ concurrent requests

---

## Error Handling

All errors return standardized format:

```json
{
  "success": false,
  "error": "Error description",
  "error_code": "SNAS_001",
  "timestamp": "2024-10-02T16:30:00Z",
  "request_id": "abc123-def456"
}
```

---

## Veteran Mission Integration

All API responses include veteran mission alignment metrics:

- `veteran_mission_score`: 0.0 - 1.0 alignment score
- `service_to_success_integration`: Boolean flag
- `military_heritage_preservation`: Narrative consistency check
- `community_impact_potential`: Impact assessment (high/medium/low)

---

## SDK & Examples

### JavaScript SDK Example

```javascript
// Initialize SNAS API client
const snasClient = new SNASAPIClient({
  instance: 'dev231111.service-now.com',
  apiKey: 'your-api-key'
});

// Prioritize badges
const result = await snasClient.prioritizeBadges({
  user_profile: { military_background: true },
  badges_array: badges,
  context_parameters: { target_audience: 'it_recruiters' }
});

console.log('Prioritized badges:', result.badges);
```

### curl Example

```bash
curl -X POST "https://dev231111.service-now.com/api/x_snc_snas_port/v1/prioritize-badges" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "user_profile": {"military_background": true},
    "badges_array": [...],
    "context_parameters": {"target_audience": "it_recruiters"}
  }'
```

---

## Changelog

### v1.0.0 (2024-10-02)
- Initial release with Epic 3 AI integration
- Context-aware badge prioritization
- AI content generation capabilities
- Veteran mission alignment features
- Performance SLA compliance (<2s response times)