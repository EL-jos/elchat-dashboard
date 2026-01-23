import { firstValueFrom } from 'rxjs';
import { TypeSite } from '../type-site/type-site';
import { Page } from '../page/page';
import { Conversation } from '../conversation/conversation';
import { Document } from '../document/document';
import { SiteService } from '../../services/site/site.service';
import { User } from '../user/user';

export class Site {
    public type: TypeSite | null = null;
    public pages: Page[] = [];
    public conversations: Conversation[] = [];
    public documents: Document[] = [];

    // 👥 visiteurs (lazy)
    public users: User[] = [];

    // pivot data (si renvoyé par API)
    public pivot?: {
        first_seen_at: string;
        last_seen_at: string;
    };

    public pivotMap: Record<string, { first_seen_at: string; last_seen_at: string }> = {};

    constructor(
        public id: string,
        public account_id: string,
        public type_site_id: string,
        public company_name: string,
        public url: string,
        public status: 'pending' | 'crawling' | 'ready' | 'error' | 'indexing',
        public crawl_depth: number,
        public crawl_delay: number,
        public exclude_pages: string[],
        public include_pages: string[],
        public pending_urls_count: number,
        public last_sitemap_crawled_at: string | null,
        public created_at: string,
        public public_token?: string, // widget
    ) { }

    static fromJson(json: any): Site {
        const site = new Site(
            json.id,
            json.account_id,
            json.type_site_id,
            json.company_name,
            json.url,
            json.status,
            json.crawl_depth,
            json.crawl_delay,
            json.exclude_pages ?? [],
            json.include_pages ?? [],
            json.pending_urls_count ?? 0,
            json.last_sitemap_crawled_at ?? null,
            json.created_at,
            json.public_token
        );

        if (json.users) {
            site.users = json.users.map((u: any) => {
                const user = User.fromJson(u);
                if (u.pivot) site.pivotMap[user.id] = u.pivot;
                return user;
            });
        }

        return site;
    }

    getPivot(userId: string) {
        return this.pivotMap[userId] ?? null;
    }

    async loadPages(service: SiteService): Promise<void> {
        if (this.pages.length > 0) return;
        this.pages = await firstValueFrom(service.getPages(this.id));
    }

    async loadConversations(service: SiteService): Promise<void> {
        if (this.conversations.length > 0) return;
        this.conversations = await firstValueFrom(service.getConversations(this.id));
    }

    async loadDocuments(service: SiteService): Promise<void> {
        if (this.documents.length > 0) return;
        this.documents = await firstValueFrom(service.getDocuments(this.id));
    }
}
