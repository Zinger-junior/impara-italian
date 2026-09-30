/// <reference types="vite/client" />

// The Netlify Identity widget ships without bundled TypeScript types, so we
// declare the module loosely. We only use a handful of its methods and treat
// the user object's fields (email, user_metadata, update) as `any` at the call
// site — see src/auth/netlifyIdentity.ts for the thin typed wrapper.
declare module "netlify-identity-widget";
