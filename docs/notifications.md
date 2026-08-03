# Notification Architecture

## Goals
- Keep users informed about review activity, moderation outcomes, and employer responses
- Support in-app, email, and webhook channels
- Avoid notification spam with preference-based delivery

## Components
- Notification service
- Delivery adapters for email, push, webhook, and in-app
- Notification templates and preference management
- Event subscription layer for background dispatch

## Event Types
- review_published
- review_flagged
- review_approved
- company_response_received
- application_decision
- verification_completed

## Delivery Model
- Synchronous for lightweight acknowledgements
- Asynchronous for fan-out to multiple channels
- Retry and dead-letter handling for failed deliveries
