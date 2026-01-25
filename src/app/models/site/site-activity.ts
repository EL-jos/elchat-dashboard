export interface SiteActivity {
  site_id: string;

  conversations_per_day: {
    date: string;
    count: number;
  }[];

  messages_per_day: {
    date: string;
    count: number;
  }[];
}