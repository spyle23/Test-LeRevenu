import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { api, createCategory, createMember, startStrapi, stopStrapi } from './helpers/strapi';

let author: Awaited<ReturnType<typeof createMember>>;
let helper: Awaited<ReturnType<typeof createMember>>;
let slug: string;

const reply = (content: string, jwt?: string, extra: Record<string, unknown> = {}) => {
  const req = api().post(`/api/discussions/${slug}/replies`);
  if (jwt) req.set('Authorization', `Bearer ${jwt}`);
  return req.send({ data: { content, ...extra } });
};

beforeAll(async () => {
  await startStrapi();
  await createCategory('epargne-tests', 'Épargne');
  author = await createMember({ displayName: 'Hugo' });
  helper = await createMember({ displayName: 'Claire' });

  const res = await api()
    .post('/api/discussions')
    .set('Authorization', `Bearer ${author.jwt}`)
    .send({
      data: { title: 'J’ai 25 ans et 10 000 € de côté', content: 'Comment répartir ?', type: 'question', category: 'epargne-tests' },
    });
  slug = res.body.data.slug;
});

afterAll(stopStrapi);

describe('POST /api/discussions/:slug/replies', () => {
  it('refuses anonymous visitors', async () => {
    const res = await reply('Gardez une épargne de précaution.');

    expect(res.status).toBe(403);
  });

  it('forbids replying on behalf of another member', async () => {
    const res = await reply('Je parle à la place de Hugo.', helper.jwt, { author: author.user.id });

    expect(res.status).toBe(403);
  });

  it('rejects an empty reply', async () => {
    const res = await reply('   ', helper.jwt);

    expect(res.status).toBe(400);
    expect(res.body.error.details.errors[0].path).toEqual(['content']);
  });

  it('returns 404 when the discussion does not exist', async () => {
    const res = await api()
      .post('/api/discussions/introuvable/replies')
      .set('Authorization', `Bearer ${helper.jwt}`)
      .send({ data: { content: 'Bonjour' } });

    expect(res.status).toBe(404);
  });

  it('stores the reply for the signed-in member and refreshes the discussion counters', async () => {
    const before = await api().get(`/api/discussions/${slug}`);

    const res = await reply('Gardez trois à six mois de dépenses sur un livret.', helper.jwt);

    expect(res.status).toBe(201);
    expect(res.body.data.author).toMatchObject({ username: helper.user.username, displayName: 'Claire' });

    const after = await api().get(`/api/discussions/${slug}`);
    expect(after.body.data.replyCount).toBe(before.body.data.replyCount + 1);
    expect(after.body.data.replies.at(-1).content).toBe('Gardez trois à six mois de dépenses sur un livret.');
    expect(new Date(after.body.data.lastActivityAt).getTime()).toBeGreaterThanOrEqual(
      new Date(before.body.data.lastActivityAt).getTime()
    );
  });
});
