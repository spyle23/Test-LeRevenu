import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  'users-permissions': {
    config: {
      // A single signed JWT, kept server-side by Next.js in an httpOnly cookie.
      jwtManagement: 'legacy-support',
      jwt: {
        expiresIn: env('JWT_EXPIRES_IN', '7d'),
      },
      register: {
        allowedFields: ['displayName'],
      },
    },
  },
  upload: {
    config: {
      security: {
        allowedTypes: ['image/*'],
        deniedTypes: ['image/svg+xml'],
      },
    },
  },
});

export default config;
