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
  isPublished: boolean;
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
  isPublished: boolean;
  sortOrder: number;
  name: string;
  role: string;
  bio: string;
  locale: Locale;
};

export type JobView = {
  id: string;
  slug: string;
  employmentType: 'full_time' | 'part_time' | 'contract' | 'internship';
  location: string;
  isRemote: boolean;
  isPublished: boolean;
  sortOrder: number;
  title: string;
  summary: string;
  description: string;
  requirements: string;
  locale: Locale;
};

export type JobApplicationView = {
  id: string;
  jobId: string;
  jobTitle: string;
  name: string;
  email: string;
  phone: string;
  portfolioUrl: string;
  coverNote: string;
  cvPath: string;
  cvFilename: string;
  cvContentType: string;
  cvSize: number;
  locale: Locale;
  status: 'new' | 'reviewing' | 'shortlisted' | 'rejected' | 'archived';
  createdAt: string;
};

export type SiteSettingsView = {
  email: string;
  phone: string;
  address: string;
  responseTime: string;
};
