import { firstValueFrom } from 'rxjs';
import { Account } from '../account/account';
import { Conversation } from '../conversation/conversation';
import { Role } from '../role/role';
import { Site } from '../site/site';
import { ConversationService } from 'src/app/services/conversation/conversation.service';
import { SiteService } from 'src/app/services/site/site.service';
//import { ConversationService } from '../../services/';

export class User {
    // 🔗 relations lazy
    public role?: Role;
    public ownedAccount?: Account | null;
    public sites: Site[] = [];
    public conversations: Conversation[] = [];

    constructor(
        public id: string,
        public firstname: string,
        public lastname: string,
        public email: string,
        public is_verified: boolean,
        public created_at: string | null,
        public role_id?: string
    ) { }

    static fromJson(json: any): User {
        const user = new User(
            json.id,
            json.firstname,
            json.lastname,
            json.email,
            json.is_verified,
            json.created_at ?? null,
            json.role_id
        );

        if (json.role) {
            user.role = Role.fromJson(json.role);
        }

        if (json.owned_account) {
            user.ownedAccount = Account.fromJson(json.owned_account);
        }

        if (Array.isArray(json.sites)) {
            user.sites = json.sites.map((s: any) => Site.fromJson(s));
        }

        return user;
    }

    exists(): boolean {
        return this.created_at !== null;
    }

    // 🧠 helpers (safe côté UI)
    isAdmin(): boolean {
        return this.role?.name === 'admin';
    }

    isVisitor(): boolean {
        return this.role?.name === 'visitor';
    }

    /*async loadConversations(service: ConversationService): Promise<void> {
        if (this.conversations.length > 0) return;
        try {
            this.conversations = await firstValueFrom(
                service.getByUser(this.id)
            );
        } catch (e) {
            console.error('Erreur chargement conversations user', e);
        }
    }

     async loadSites(service: SiteService): Promise<void> {
        if (this.sites.length > 0) return;
        try {
            this.sites = await firstValueFrom(service.getSitesByUser(this.id));
        } catch (e) {
            console.error('Erreur chargement sites user', e);
        }
    } */

}
