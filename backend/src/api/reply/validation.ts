import { yup, validateYupSchema } from '@strapi/utils';

export const REPLY_MIN_LENGTH = 2;
export const REPLY_MAX_LENGTH = 5000;

const createReplySchema = yup
  .object({
    content: yup
      .string()
      .trim()
      .required('Votre réponse est vide.')
      .min(REPLY_MIN_LENGTH, 'Votre réponse est trop courte.')
      .max(REPLY_MAX_LENGTH, `Votre réponse ne peut pas dépasser ${REPLY_MAX_LENGTH} caractères.`),
  })
  .required('Les données de la réponse sont manquantes.');

export interface CreateReplyInput {
  content: string;
}

export const validateCreateReply = async (data: unknown): Promise<CreateReplyInput> =>
  (await validateYupSchema(createReplySchema, { strict: false, abortEarly: false, stripUnknown: true })(
    data,
    'Certains champs sont invalides.'
  )) as CreateReplyInput;
