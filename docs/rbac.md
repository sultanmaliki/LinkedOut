# Permissions and RBAC

## Roles
- anonymous: can browse public content and view public company profiles
- user: can create reviews, vote, and manage their own profile
- company_rep: can manage company profile and respond to reviews
- moderator: can review flagged content and manage moderation queues
- admin: can manage roles, platform settings, and compliance actions
- super_admin: can manage infrastructure settings and critical platform operations

## Permission Model
- `reviews:create`
- `reviews:edit:own`
- `reviews:delete:own`
- `reviews:moderate`
- `companies:manage:own`
- `users:manage`
- `notifications:read`
- `admin:access`
- `audit:read`

## Enforcement Strategy
- Guard-based checks on controllers and routes
- Resource ownership checks for user-generated content
- Policy-based evaluation for complex moderation and admin scenarios
- Audit logs for role changes and privileged operations
