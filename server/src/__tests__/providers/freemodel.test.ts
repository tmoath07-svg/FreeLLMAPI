import { afterEach, describe, expect, it, vi } from 'vitest';
import { getProvider } from '../../providers/index.js';
import { OpenAICompatProvider } from '../../providers/openai-compat.js';
import { AUTH_JSON_PROVIDER_MAP, parseKeysFromFile } from '../../lib/key-parser.js';
import { BUILTIN_DISCOVERY_PLATFORMS, autoRegistrable } from '../../services/builtin-model-discovery.js';

describe('FreeModel provider integration', () => {
  afterEach(() => vi.restoreAllMocks());

  it('registers the OpenAI-compatible FreeModel endpoint', () => {
    const provider = getProvider('freemodel');
    expect(provider).toBeInstanceOf(OpenAICompatProvider);
    expect(provider?.platform).toBe('freemodel');
    expect(provider?.name).toBe('FreeModel');
  });

  it('recognizes FreeModel keys in dotenv and export JSON formats', () => {
    const parsed = parseKeysFromFile('FREEMODEL_API_KEY=test-key', 'keys.env');
    expect(parsed.keys).toHaveLength(1);
    expect(parsed.keys[0]?.platform).toBe('freemodel');
    expect(AUTH_JSON_PROVIDER_MAP.freemodel).toBe('freemodel');
    expect(AUTH_JSON_PROVIDER_MAP['free-model']).toBe('freemodel');
  });

  it('offers live /models discovery while keeping priced models out of automatic discovery', () => {
    expect(BUILTIN_DISCOVERY_PLATFORMS).toContain('freemodel');
    const result = autoRegistrable([
      { id: 'gpt-6-luna', ownedBy: 'FreeModel', priceNote: '$0.10/M in $0.20/M out', isFree: false },
      { id: 'confirmed-free-model', ownedBy: 'FreeModel', priceNote: 'free', isFree: true },
    ]);
    expect(result.accepted.map(model => model.id)).toEqual(['confirmed-free-model']);
    expect(result.paid).toBe(1);
  });

  it('uses the documented FreeModel base URL and bearer authentication', async () => {
    const provider = getProvider('freemodel')!;
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      id: 'chatcmpl-test',
      object: 'chat.completion',
      created: 1,
      model: 'gpt-6-luna',
      choices: [{ index: 0, message: { role: 'assistant', content: 'OK' }, finish_reason: 'stop' }],
      usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
    }), { status: 200, headers: { 'content-type': 'application/json' } }));
    const response = await provider.chatCompletion('fm_test_key', [{ role: 'user', content: 'Hi' }], 'gpt-6-luna');
    expect(response.choices[0]?.message.content).toBe('OK');
    expect(fetchSpy.mock.calls[0]?.[0]).toBe('https://freemodel.in/v1/chat/completions');
    expect(new Headers(fetchSpy.mock.calls[0]?.[1]?.headers).get('authorization')).toBe('Bearer fm_test_key');
  });
});
