# Operational Runbook

## Service Health Checks
- Verify API health endpoint
- Verify database connectivity
- Verify cache connectivity
- Verify object storage health
- Verify search index availability

## Incident Response
1. Triage the incident and identify blast radius.
2. Pause risky changes or roll back the latest deployment if necessary.
3. Mitigate user impact with feature flags or traffic routing.
4. Communicate status internally and externally if needed.
5. Document the incident and improve guardrails.

## Backup and Recovery
- Nightly database backups
- Restore procedure tested at least quarterly
- Object storage versioning enabled where possible
- Runbooks reviewed after major architecture changes
