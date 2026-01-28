import { firstValueFrom } from 'rxjs';
import { TypeSite } from '../type-site/type-site';
import { Page } from '../page/page';
import { Conversation } from '../conversation/conversation';
import { Document } from '../document/document';
import { SiteService } from '../../services/site/site.service';
import { User } from '../user/user';
import { Account } from '../account/account';
import { WidgetSetting } from '../widget-setting/widget-setting';

export class Site {
    public type: TypeSite | null = null;
    public account: Account | null = null;
    public pages: Page[] = [];
    public conversations: Conversation[] = [];
    public documents: Document[] = [];
    public widgetSetting: WidgetSetting | null = null;

    // 👥 visiteurs (lazy)
    public users: User[] = [];

    // pivot data (si renvoyé par API)
    public pivot?: {
        first_seen_at: string;
        last_seen_at: string;
    };

    public pivotMap: Record<string, { first_seen_at: string; last_seen_at: string }> = {};

    constructor(
        public id: string | null = null,
        public account_id: string | null = null,
        public type_site_id: string | null = null,
        public name: string | null = null,
        public url: string | null = null,
        public status: 'pending' | 'crawling' | 'ready' | 'error' | 'indexing' = 'pending',
        public crawl_depth: number = 0,
        public crawl_delay: number = 0,
        public exclude_pages: string[] = [],
        public include_pages: string[] = [],
        public pending_urls_count: number = 0,
        public last_sitemap_crawled_at: string | null = null,
        public created_at: string | null = null,
        public favicon: string = "",
        public public_token: string = "", // widget
    ) { }

    static fromJson(json: any): Site {
        const site = new Site(
            json.id,
            json.account_id,
            json.type_site_id,
            json.name,
            json.url,
            json.status,
            json.crawl_depth,
            json.crawl_delay,
            json.exclude_pages ?? [],
            json.include_pages ?? [],
            json.pending_urls_count ?? 0,
            json.last_sitemap_crawled_at ?? null,
            json.created_at,
            json.favicon,
            json.public_token
        );

        if (json.users) {
            site.users = json.users.map((u: any) => {
                const user = User.fromJson(u);
                if (u.pivot) site.pivotMap[user.id] = u.pivot;
                return user;
            });
        }

        if (json.type) {
            site.type = TypeSite.fromJson(json.type);
        }

        if(json.account){
            site.account = Account.fromJson(json.account);
        }

        if (json.widgetSetting) {
            site.widgetSetting = WidgetSetting.fromJson(json.widgetSetting)
        }

        return site;
    }

    exists() {
        return this.created_at !== null;
    }

    getPivot(userId: string) {
        return this.pivotMap[userId] ?? null;
    }

    async loadPages(service: SiteService): Promise<void> {
        if (this.pages.length > 0) return;
        this.pages = await firstValueFrom(service.getPages(this.id!));
    }

    async loadConversations(service: SiteService): Promise<void> {
        if (this.conversations.length > 0) return;
        this.conversations = await firstValueFrom(service.getConversations(this.id!));
    }

    async loadDocuments(service: SiteService): Promise<void> {
        if (this.documents.length > 0) return;
        this.documents = await firstValueFrom(service.getDocuments(this.id!));
    }
}
