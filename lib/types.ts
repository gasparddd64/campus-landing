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
  suspended?: boolean;
  is_admin?: boolean;
  email_digest_opt_in?: boolean;
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

export type ListingType = "housing" | "sublet" | "furniture" | "other";
export type ListingStatus = "active" | "closed";

export type Listing = {
  id: string;
  campus_id: string;
  author_id: string;
  type: ListingType;
  title: string;
  body: string;
  price: number | null;
  photos: string[];
  status: ListingStatus;
  created_at: string;
};

export type Post = {
  id: string;
  cohort_id: string;
  author_id: string;
  parent_id: string | null;
  body: string;
  created_at: string;
  hidden?: boolean;
};

export type PostReaction = {
  post_id: string;
  profile_id: string;
};

export type Conversation = {
  id: string;
  participant_a: string;
  participant_b: string;
  accepted: boolean;
  created_at: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export type Block = {
  blocker_id: string;
  blocked_id: string;
  created_at: string;
};

export type ReportTarget = "listing" | "post" | "message" | "profile";

export type Report = {
  id: string;
  reporter_id: string;
  target_type: ReportTarget;
  target_id: string;
  reason: string;
  handled: boolean;
  created_at: string;
};
