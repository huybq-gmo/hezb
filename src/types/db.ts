export type Locale = 'vi' | 'en';

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          slug: string;
          name_vi: string;
          name_en: string;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at' | 'updated_at'> &
          Partial<Pick<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at' | 'updated_at'>>;
        Update: Partial<Database['public']['Tables']['categories']['Insert']>;
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          slug: string;
          category_id: string | null;
          client_name: string | null;
          year: number | null;
          tech: string[];
          cover_url: string | null;
          gallery: string[];
          website_url: string | null;
          is_published: boolean;
          is_featured: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['projects']['Row'], 'id' | 'created_at' | 'updated_at'> &
          Partial<Pick<Database['public']['Tables']['projects']['Row'], 'id' | 'created_at' | 'updated_at'>>;
        Update: Partial<Database['public']['Tables']['projects']['Insert']>;
        Relationships: [];
      };
      project_translations: {
        Row: { project_id: string; locale: Locale; title: string; summary: string; content: string; result: string };
        Insert: Database['public']['Tables']['project_translations']['Row'];
        Update: Partial<Database['public']['Tables']['project_translations']['Insert']>;
        Relationships: [];
      };
      members: {
        Row: {
          id: string;
          slug: string;
          avatar_url: string | null;
          linkedin_url: string | null;
          is_published: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['members']['Row'], 'id' | 'created_at' | 'updated_at'> &
          Partial<Pick<Database['public']['Tables']['members']['Row'], 'id' | 'created_at' | 'updated_at'>>;
        Update: Partial<Database['public']['Tables']['members']['Insert']>;
        Relationships: [];
      };
      member_translations: {
        Row: { member_id: string; locale: Locale; name: string; role: string; bio: string };
        Insert: Database['public']['Tables']['member_translations']['Row'];
        Update: Partial<Database['public']['Tables']['member_translations']['Insert']>;
        Relationships: [];
      };
      contact_messages: {
        Row: {
          id: string;
          name: string;
          email: string;
          company: string | null;
          phone: string | null;
          topic: 'ai' | 'custom_software' | 'automation' | 'other';
          message: string;
          locale: Locale;
          status: 'new' | 'read' | 'replied' | 'archived';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['contact_messages']['Row'], 'id' | 'created_at' | 'updated_at' | 'status'> &
          Partial<Pick<Database['public']['Tables']['contact_messages']['Row'], 'id' | 'created_at' | 'updated_at' | 'status'>>;
        Update: Partial<Database['public']['Tables']['contact_messages']['Insert']>;
        Relationships: [];
      };
      admins: {
        Row: { id: string; created_at: string };
        Insert: Database['public']['Tables']['admins']['Row'];
        Update: Partial<Database['public']['Tables']['admins']['Insert']>;
        Relationships: [];
      };
      jobs: {
        Row: {
          id: string;
          slug: string;
          employment_type: 'full_time' | 'part_time' | 'contract' | 'internship';
          location: string;
          is_remote: boolean;
          is_published: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['jobs']['Row'], 'id' | 'created_at' | 'updated_at'> &
          Partial<Pick<Database['public']['Tables']['jobs']['Row'], 'id' | 'created_at' | 'updated_at'>>;
        Update: Partial<Database['public']['Tables']['jobs']['Insert']>;
        Relationships: [];
      };
      job_translations: {
        Row: {
          job_id: string;
          locale: Locale;
          title: string;
          summary: string;
          description: string;
          requirements: string;
        };
        Insert: Database['public']['Tables']['job_translations']['Row'];
        Update: Partial<Database['public']['Tables']['job_translations']['Insert']>;
        Relationships: [];
      };
      job_applications: {
        Row: {
          id: string;
          job_id: string;
          name: string;
          email: string;
          phone: string | null;
          portfolio_url: string | null;
          cover_note: string;
          cv_path: string;
          cv_filename: string;
          cv_content_type: 'application/pdf' | 'application/msword' | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          cv_size: number;
          locale: Locale;
          status: 'new' | 'reviewing' | 'shortlisted' | 'rejected' | 'archived';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['job_applications']['Row'], 'id' | 'created_at' | 'updated_at' | 'status'> &
          Partial<Pick<Database['public']['Tables']['job_applications']['Row'], 'id' | 'created_at' | 'updated_at' | 'status'>>;
        Update: Partial<Database['public']['Tables']['job_applications']['Insert']>;
        Relationships: [];
      };
      blog_posts: {
        Row: {
          id: string;
          slug: string;
          author_name: string;
          cover_url: string | null;
          tags: string[];
          is_published: boolean;
          is_featured: boolean;
          sort_order: number;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['blog_posts']['Row'], 'id' | 'created_at' | 'updated_at'> &
          Partial<Pick<Database['public']['Tables']['blog_posts']['Row'], 'id' | 'created_at' | 'updated_at'>>;
        Update: Partial<Database['public']['Tables']['blog_posts']['Insert']>;
        Relationships: [];
      };
      blog_post_translations: {
        Row: {
          post_id: string;
          locale: Locale;
          title: string;
          excerpt: string;
          content: string;
          seo_title: string | null;
          seo_description: string | null;
        };
        Insert: Database['public']['Tables']['blog_post_translations']['Row'];
        Update: Partial<Database['public']['Tables']['blog_post_translations']['Insert']>;
        Relationships: [];
      };
      blog_post_attachments: {
        Row: {
          id: string;
          post_id: string;
          kind: 'image' | 'file';
          name: string;
          url: string;
          content_type: string;
          size_bytes: number;
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['blog_post_attachments']['Row'], 'id' | 'created_at'> &
          Partial<Pick<Database['public']['Tables']['blog_post_attachments']['Row'], 'id' | 'created_at'>>;
        Update: Partial<Database['public']['Tables']['blog_post_attachments']['Insert']>;
        Relationships: [];
      };
      site_settings: {
        Row: {
          id: number;
          email: string;
          phone: string;
          address_vi: string;
          address_en: string;
          response_time_vi: string;
          response_time_en: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['site_settings']['Row'], 'created_at' | 'updated_at'> &
          Partial<Pick<Database['public']['Tables']['site_settings']['Row'], 'created_at' | 'updated_at'>>;
        Update: Partial<Database['public']['Tables']['site_settings']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
  };
};
