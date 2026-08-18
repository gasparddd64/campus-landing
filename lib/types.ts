export type Campus = {
  id: string;
  name: string;
  city: string;
  state: string;
  slug: string;
  email_domains: string[];
};

export type Cohort = {
  id: string;
  campus_id: string;
  intake_month: number;
  intake_year: number;
};

export type Profile = {
  id: string;
  campus_id: string;
  display_name: string;
  avatar_url: string | null;
  program: string | null;
  bio: string | null;
  languages: string[];
  origin_country: string | null;
  origin_country_visible: boolean;
};

export type OnboardingStep1 = {
  campus_id: string;
  intake_month: number;
  intake_year: number;
};

export type OnboardingStep2 = {
  display_name: string;
  program: string;
};

export type OnboardingStep3 = {
  languages: string[];
  origin_country: string;
  origin_country_visible: boolean;
};
