const LIGATURES: Record<string, string> = { œ: 'oe', æ: 'ae', ß: 'ss' };

export const slugify = (input: string, maxLength = 80): string =>
  input
    .toLowerCase()
    .replace(/[œæß]/g, (char) => LIGATURES[char])
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLength)
    .replace(/-+$/, '');
