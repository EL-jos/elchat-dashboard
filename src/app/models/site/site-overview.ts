import { Site } from "./site";

export interface SiteOverview {
  site_id: string;
  status: Site['status'];
  total_documents: number;
  total_conversations: number;
  total_messages: number;
  sources: Record<'crawl' | 'woocommerce' | 'manuel' | 'sitemap', number>;
}