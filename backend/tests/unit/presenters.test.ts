import { describe, expect, it } from 'vitest';
import { excerpt, presentAuthor } from '../../src/utils/presenters';
import { slugify } from '../../src/utils/slugify';

describe('slugify', () => {
  it('builds readable French slugs', () => {
    expect(slugify('Assurance-vie après 70 ans : est-ce encore intéressant ?')).toBe(
      'assurance-vie-apres-70-ans-est-ce-encore-interessant'
    );
    expect(slugify("J'ai 25 ans et 10 000 € de côté")).toBe('j-ai-25-ans-et-10-000-de-cote');
    expect(slugify('Œuvres d’art et cœur fiscal')).toBe('oeuvres-d-art-et-coeur-fiscal');
  });

  it('never ends with a dash when truncated', () => {
    expect(slugify('Frais réels ou abattement de 10 %', 21)).toBe('frais-reels-ou-abatte');
    expect(slugify('abc def', 4)).toBe('abc');
  });
});

describe('excerpt', () => {
  it('flattens markdown emphasis and line breaks', () => {
    expect(excerpt('**Pour bien démarrer :**\n- un\n- deux')).toBe('Pour bien démarrer : - un - deux');
  });

  it('cuts on a word boundary', () => {
    expect(excerpt('Un placement prudent et diversifié', 20)).toBe('Un placement prudent…');
  });
});

describe('presentAuthor', () => {
  it('only exposes public fields', () => {
    const author = presentAuthor({ username: 'Camille_B', displayName: '', isEditorial: null, email: 'x@y.z' } as never);

    expect(author).toEqual({ username: 'Camille_B', displayName: 'Camille_B', isEditorial: false, isSubscriber: false });
  });
});
