# File Storage Architecture

> **Status: Deferred, not implemented.** MinIO runs in `docker-compose.yml` but has zero application code references. Photo/attachment fields (`profilePhotoUrl`, `bannerPhotoUrl`, post attachments) are plain URL columns today — the client supplies a URL, there is no upload endpoint or object storage integration. This is a design sketch, kept for reference — see [architecture.md](architecture.md).

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
