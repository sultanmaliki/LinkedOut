# Feature Flag Strategy

## Goals
- Launch features safely with low-risk rollout
- Enable progressive exposure to internal users or cohorts
- Support staged release and rollback without redeploying core services

## Rollout Model
- `off`: disabled
- `internal`: enabled for internal users only
- `beta`: enabled for selected cohorts
- `100%`: fully enabled

## Recommended Flag Categories
- auth
- reviews
- search
- ai-assistant
- moderation
- notifications
- admin-tools

## Implementation Approach
- Store flags in the database with rollout metadata and owner information
- Evaluate flags per request and per user context
- Record flag evaluations in audit logs for major decisions
- Use a small set of standardized evaluation rules to reduce operational complexity
