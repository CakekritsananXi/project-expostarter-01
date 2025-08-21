// Application constants

export const CONTENT_PILLARS = [
  'Thought Leadership',
  'Product Education', 
  'Industry Insights',
  'Community Building',
] as const;

export const CONTENT_TYPES = [
  'blog',
  'social',
  'email',
  'video',
  'podcast',
] as const;

export const CONTENT_STATUSES = [
  'draft',
  'scheduled',
  'published',
  'archived',
] as const;

export const PRIORITY_LEVELS = [
  'low',
  'medium', 
  'high',
] as const;

export const USER_ROLES = [
  'owner',
  'admin',
  'editor',
  'viewer',
] as const;

export const ROUTES = {
  DASHBOARD: '/',
  CALENDAR: '/calendar',
  IDEATION: '/ideation',
  STRATEGY: '/strategy',
  LIBRARY: '/library',
  ANALYTICS: '/analytics',
  COLLABORATION: '/collaboration',
} as const;