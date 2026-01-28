import { User } from "../user/user";
import { WidgetSetting } from "../widget-setting/widget-setting";

export interface SiteOverviewResponse {
  site: {
    id: string;
    account_id: string;
    name: string;
    url: string;
    favicon: string;
    status: 'ready' | 'pending' | 'crawling' | 'indexing' | 'error';
    type: { id: string; name: string; description: string };
    account: { id: string; name: string; owner_user_id: string, email: string };
    created_at: string;
    updated_at: string;
    last_crawl_at: string | null;
    last_indexed_at: string | null;
    pending_urls_count: number;
  };
  kpis: {
    documents: number;      // total documents
    chunks: number;         // total chunks indexés
    conversations: number;
    messages: number;
    users: number;
    nb_pages: number;
  };
  activity: {
    conversations_per_day: { date: string; count: number }[];
    messages_per_day: { date: string; count: number }[];
  };
  sources: {
    distribution: { crawl: number; sitemap: number; manuel: number; woocommerce: number };
  };
  chunks: {
    total: number;                 // total chunks
    by_source: { crawl: number; sitemap: number; manuel: number; woocommerce: number };
  };
  users: User[];
  settings_crawl: {
    language: string;
    crawl_depth: number;
    crawl_delay: number;
    include_pages: string[];
    exclude_pages: string[];
    system_prompt: string;
    updated_at: string;
  };
  settings: WidgetSetting
}
