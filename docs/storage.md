# File Storage Architecture

## Goals
- Manage user avatars, company images, verification documents, and other uploaded assets
- Keep storage operations separate from transactional business logic
- Support future cloud compatibility and signed-url access

## Recommended Platform
- MinIO for object storage in self-hosted environments
- Future compatibility with Azure Blob Storage or S3-compatible storage

## Storage Model
- Public assets: avatars, logos, marketing images
- Private assets: verification documents, internal evidence uploads
- Temporary assets: uploads pending review or processing

## Access Strategy
- Signed URLs for private files
- Content-type validation and virus scanning for uploads
- Lifecycle rules for temporary and stale assets
- Metadata stored in PostgreSQL with object references in storage
