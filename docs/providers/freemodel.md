# FreeModel

FreeModel is registered as an OpenAI-compatible provider at `https://freemodel.in/v1`.

- Create an API key in the FreeModel dashboard and add it under **Keys → FreeModel**.
- The API uses Bearer authentication and exposes `GET /v1/models` and `POST /v1/chat/completions`.
- Use **Fetch models** on the key to retrieve the currently available model IDs.
- Model discovery is manual by default. If automatic built-in discovery is enabled, models with published non-zero prices are filtered out.
- The free plan advertises a monthly token allowance, not unlimited free inference. Each model has its own published input/output rates; after the allowance is consumed, usage can draw from the account balance. An empty allowance and balance returns HTTP 402.

The model roster is intentionally discovered from the provider instead of hard-coded: model IDs, capabilities, and prices can change. Check the provider's current catalog before enabling a model.

References:
- <https://freemodel.in/docs>
- <https://freemodel.in/docs/models>
- <https://freemodel.in/docs/authentication>
- <https://freemodel.in/pricing>
