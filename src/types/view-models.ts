import type { Locale } from './db';

export type CategoryView = { id: string; slug: string; name: string; sortOrder: number };

export type ProjectView = {
  id: string;
  slug: string;
  category: CategoryView | null;
  clientName: string | null;
  year: number | null;
  tech: string[];
  coverUrl: string | null;
  gallery: string[];
  websiteUrl: string | null;
  isFeatured: boolean;
  title: string;
  summary: string;
  content: string;
  result: string;
  locale: Locale;
};

export type MemberView = {
  id: string;
  slug: string;
  avatarUrl: string | null;
  linkedinUrl: string | null;
  name: string;
  role: string;
  bio: string;
  locale: Locale;
};
