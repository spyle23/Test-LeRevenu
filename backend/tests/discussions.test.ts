import type { Core } from '@strapi/strapi';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { api, createCategory, createMember, startStrapi, stopStrapi } from './helpers/strapi';

const validDiscussion = {
  title: 'Faut-il ouvrir un PER à 45 ans ?',
  content: 'Je suis salarié et je me pose la question de la déduction fiscale.',
  type: 'question',
  category: 'retraite',
};

let strapi: Core.Strapi;
let alice: Awaited<ReturnType<typeof createMember>>;
let bob: Awaited<ReturnType<typeof createMember>>;

const countDiscussions = () => strapi.documents('api::discussion.discussion').count({});

beforeAll(async () => {
  strapi = await startStrapi();
  await createCategory('retraite', 'Retraite');
  await createCategory('bourse', 'Bourse & actions');
  alice = await createMember({ displayName: 'Alice' });
  bob = await createMember({ displayName: 'Bob' });
});

afterAll(stopStrapi);

describe('POST /api/discussions', () => {
  it('refuses anonymous visitors', async () => {
    const before = await countDiscussions();

    const res = await api().post('/api/discussions').send({ data: validDiscussion });

    expect(res.status).toBe(403);
    expect(await countDiscussions()).toBe(before);
  });

  it('rejects an invalid or expired token', async () => {
    const res = await api()
      .post('/api/discussions')
      .set('Authorization', 'Bearer not-a-real-token')
      .send({ data: validDiscussion });

    expect(res.status).toBe(401);
  });

  it('validates the payload on the server and reports each field', async () => {
    const res = await api()
      .post('/api/discussions')
      .set('Authorization', `Bearer ${alice.jwt}`)
      .send({ data: { title: 'PER ?', content: '   ', type: 'sondage', category: '' } });

    expect(res.status).toBe(400);
    expect(res.body.error.name).toBe('ValidationError');
    const fields = res.body.error.details.errors.map((error: { path: string[] }) => error.path[0]);
    expect(fields).toEqual(expect.arrayContaining(['title', 'content', 'type', 'category']));
  });

  it('counts the 10 characters minimum after collapsing spaces', async () => {
    const res = await api()
      .post('/api/discussions')
      .set('Authorization', `Bearer ${alice.jwt}`)
      .send({ data: { ...validDiscussion, title: '  PER   ?   ' } });

    expect(res.status).toBe(400);
    expect(res.body.error.details.errors[0].message).toMatch(/10 caractères/);
  });

  it('rejects an unknown space', async () => {
    const res = await api()
      .post('/api/discussions')
      .set('Authorization', `Bearer ${alice.jwt}`)
      .send({ data: { ...validDiscussion, category: 'inexistant' } });

    expect(res.status).toBe(400);
    expect(res.body.error.details.errors[0].path).toEqual(['category']);
  });

  it('forbids publishing on behalf of another member', async () => {
    const before = await countDiscussions();

    for (const author of [bob.user.id, bob.user.documentId, { connect: [bob.user.documentId] }]) {
      const res = await api()
        .post('/api/discussions')
        .set('Authorization', `Bearer ${alice.jwt}`)
        .send({ data: { ...validDiscussion, author } });

      expect(res.status).toBe(403);
      expect(res.body.error.details.policy).toBe('forbid-author-override');
    }

    expect(await countDiscussions()).toBe(before);
  });

  it('creates the discussion for the signed-in member and ignores server-managed fields', async () => {
    const res = await api()
      .post('/api/discussions')
      .set('Authorization', `Bearer ${alice.jwt}`)
      .send({ data: { ...validDiscussion, replyCount: 999 } });

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      slug: 'faut-il-ouvrir-un-per-a-45-ans',
      title: validDiscussion.title,
      type: 'question',
      replyCount: 0,
      author: { username: alice.user.username, displayName: 'Alice' },
      category: { slug: 'retraite' },
    });
  });

  it('keeps slugs unique when two discussions share a title', async () => {
    const res = await api()
      .post('/api/discussions')
      .set('Authorization', `Bearer ${bob.jwt}`)
      .send({ data: validDiscussion });

    expect(res.status).toBe(201);
    expect(res.body.data.slug).toMatch(/^faut-il-ouvrir-un-per-a-45-ans-[0-9a-f]{6}$/);
  });
});

describe('GET /api/discussions', () => {
  beforeAll(async () => {
    await api()
      .post('/api/discussions')
      .set('Authorization', `Bearer ${bob.jwt}`)
      .send({
        data: { title: 'ETF monde ou S&P 500 dans un PEA ?', content: 'Votre avis ?', type: 'discussion', category: 'bourse' },
      });
  });

  it('lists discussions with author, space, reply count and publication date', async () => {
    const res = await api().get('/api/discussions');

    expect(res.status).toBe(200);
    expect(res.body.meta.pagination).toMatchObject({ page: 1, total: 3 });
    for (const discussion of res.body.data) {
      expect(discussion).toEqual(
        expect.objectContaining({
          title: expect.any(String),
          slug: expect.any(String),
          replyCount: expect.any(Number),
          createdAt: expect.any(String),
          author: expect.objectContaining({ displayName: expect.any(String) }),
          category: expect.objectContaining({ name: expect.any(String), slug: expect.any(String) }),
        })
      );
    }
  });

  it('never exposes private user data', async () => {
    const res = await api().get('/api/discussions');

    expect(JSON.stringify(res.body)).not.toMatch(/@test\.local|password|"email"/);
  });

  it('filters by space and sorts by publication date', async () => {
    const recent = await api().get('/api/discussions?category=retraite&sort=recent');
    const oldest = await api().get('/api/discussions?category=retraite&sort=oldest');

    expect(recent.body.data).toHaveLength(2);
    expect(recent.body.data.every((d: { category: { slug: string } }) => d.category.slug === 'retraite')).toBe(true);
    expect(oldest.body.data.map((d: { slug: string }) => d.slug)).toEqual(
      recent.body.data.map((d: { slug: string }) => d.slug).reverse()
    );
  });

  it('paginates on the server', async () => {
    const res = await api().get('/api/discussions?pageSize=2&page=2');

    expect(res.body.data).toHaveLength(1);
    expect(res.body.meta.pagination).toEqual({ page: 2, pageSize: 2, pageCount: 2, total: 3 });
  });

  it('rejects out-of-range query parameters', async () => {
    const res = await api().get('/api/discussions?pageSize=500&sort=random');

    expect(res.status).toBe(400);
  });

  it('returns 404 for an unknown slug', async () => {
    const res = await api().get('/api/discussions/introuvable');

    expect(res.status).toBe(404);
    expect(res.body.error.name).toBe('NotFoundError');
  });
});
