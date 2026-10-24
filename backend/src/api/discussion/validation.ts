import { yup, validateYupSchema } from '@strapi/utils';

export const DISCUSSION_TYPES = ['question', 'discussion'] as const;
export const DISCUSSION_SORTS = ['recent', 'oldest', 'active'] as const;

export const TITLE_MIN_LENGTH = 10;
export const TITLE_MAX_LENGTH = 160;
export const CONTENT_MAX_LENGTH = 10000;

export type DiscussionType = (typeof DISCUSSION_TYPES)[number];
export type DiscussionSort = (typeof DISCUSSION_SORTS)[number];

const collapseSpaces = (value: unknown) =>
  typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : value;

const listQuerySchema = yup.object({
  category: yup
    .string()
    .trim()
    .matches(/^[a-z0-9-]+$/, 'Identifiant d’espace invalide.')
    .max(80),
  type: yup.string().oneOf([...DISCUSSION_TYPES]),
  status: yup.string().oneOf(['unanswered']),
  q: yup.string().transform(collapseSpaces).max(100, 'La recherche est limitée à 100 caractères.'),
  sort: yup.string().oneOf([...DISCUSSION_SORTS]).default('recent'),
  page: yup.number().integer().min(1).max(1000).default(1),
  pageSize: yup.number().integer().min(1).max(50).default(10),
});

const createDiscussionSchema = yup
  .object({
    title: yup
      .string()
      .transform(collapseSpaces)
      .required('Le titre est obligatoire.')
      .min(TITLE_MIN_LENGTH, `Le titre doit contenir au moins ${TITLE_MIN_LENGTH} caractères.`)
      .max(TITLE_MAX_LENGTH, `Le titre ne peut pas dépasser ${TITLE_MAX_LENGTH} caractères.`),
    content: yup
      .string()
      .trim()
      .required('Le contenu est obligatoire.')
      .max(CONTENT_MAX_LENGTH, `Le contenu ne peut pas dépasser ${CONTENT_MAX_LENGTH} caractères.`),
    type: yup
      .string()
      .required('Choisissez un type de publication.')
      .oneOf([...DISCUSSION_TYPES], 'Le type doit être « question » ou « discussion ».'),
    category: yup.string().trim().required('Choisissez un espace.'),
  })
  .required('Les données de la discussion sont manquantes.');

export interface DiscussionListQuery {
  category?: string;
  type?: DiscussionType;
  status?: 'unanswered';
  q?: string;
  sort: DiscussionSort;
  page: number;
  pageSize: number;
}

export interface CreateDiscussionInput {
  title: string;
  content: string;
  type: DiscussionType;
  category: string;
}

const options = { strict: false, abortEarly: false, stripUnknown: true };

export const validateListQuery = async (query: unknown): Promise<DiscussionListQuery> =>
  (await validateYupSchema(listQuerySchema, options)(query, 'Paramètres de recherche invalides.')) as DiscussionListQuery;

export const validateCreateDiscussion = async (data: unknown): Promise<CreateDiscussionInput> =>
  (await validateYupSchema(createDiscussionSchema, options)(data, 'Certains champs sont invalides.')) as CreateDiscussionInput;
