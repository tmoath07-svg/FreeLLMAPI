# Free Render deployment (test)

This Blueprint deploys the Docker image as a **free Render web service**. It is intended for testing, not production: Render sleeps after 15 minutes without inbound traffic, cold starts can take about a minute, and the local filesystem is ephemeral.

## Why the backup settings are required

Free Render services cannot attach persistent disks. FreeLLMAPI stores provider credentials and settings in SQLite, so this guide uses the application's built-in **encrypted database backup** to a private Hugging Face dataset repository. The database backup is encrypted before upload; keep the Render environment variables `ENCRYPTION_KEY` and `FREEAPI_DB_BACKUP_KEY` unchanged. If either is lost or regenerated, stored provider credentials or the backup cannot be decrypted.

## One-time setup

1. Create a **private dataset repository** on Hugging Face, for example `freellmapi-backups`.
2. Create a Hugging Face access token with write access to that dataset repository. Do not put the token in GitHub, source files, screenshots, or chat messages.
3. In Render, create a **New → Blueprint** deployment and select this fork.
4. When Render asks for the two unsynced environment variables, enter:
   - `FREEAPI_DB_BACKUP_URL`: `https://huggingface.co/datasets/USERNAME/freellmapi-backups/resolve/main/freeapi.db.backup`
   - `FREEAPI_DB_BACKUP_TOKEN`: the write-enabled Hugging Face token.
5. Deploy. Wait for the service health check to pass, then open its Render URL.
6. Complete FreeLLMAPI's first-run dashboard setup. The one-time setup code is printed in the service logs; keep the dashboard account credentials private.

Replace `USERNAME` with the Hugging Face account or organization that owns the private dataset. The backup URL path and filename must remain stable.

## Test the backup before adding provider keys

1. Open the dashboard and finish initial setup.
2. Check Render logs for a `[db-backup] uploaded ...` message. The first backup is attempted as soon as the server starts its backup pump; later backups run every 15 minutes.
3. Restart or redeploy the service once, then check the logs for `[db-backup] restored ...` if the local database was absent.
4. Only after the backup succeeds, add provider keys and configure model routing.

## Important limits

- The free service sleeps after 15 minutes of inactivity. The first request after sleep incurs a cold start.
- Render may restart a free instance at any time. The encrypted backup reduces data-loss risk but is not a transactional, zero-loss guarantee; changes made since the last successful 15-minute backup can be lost.
- Keep the Render-generated `ENCRYPTION_KEY` and `FREEAPI_DB_BACKUP_KEY` stable. Save them securely in Render; never commit them to the repository.
- Keep the Hugging Face dataset private. The backup contains encrypted application data, but it should not be published.
- Free provider quotas, availability, context windows, and terms are controlled by each provider. The router cannot make them unlimited.
- This setup is for testing. Do not expose the unified API key publicly or share the service URL with people you do not trust.
