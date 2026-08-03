# Security Architecture

## Core Security Principles
- Authentication via JWT and session-based refresh strategy
- Authorization through role-based and permission-based guards
- Secure secret handling via environment variables and secret managers
- Input validation on every boundary
- Audit logging for sensitive operations

## Threat Model
- Credential stuffing and brute-force attacks
- Account takeover and token theft
- Abuse of write APIs and review spam
- File upload abuse and malware
- Data exposure through broken access controls

## Controls
- Password hashing with Argon2 or bcrypt
- Rate limiting on authentication and public write endpoints
- CSRF protections for browser-based sessions
- File scanning and signed URLs for uploaded assets
- Audit trails for moderation actions and administrative changes

## RBAC Model
- super_admin
- admin
- moderator
- company_rep
- user
- anonymous

## Security Operations
- Sentry for error tracking and security-relevant exceptions
- Prometheus alerts for suspicious patterns
- Quarterly access reviews and change management reviews
