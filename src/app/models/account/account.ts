import { Site } from '../site/site';
import { User } from '../user/user';

export class Account {
    public owner?: User;
    public sites: Site[] = [];

    constructor(
        public id: string,
        public name: string,
        public email: string,
        public created_at?: string,
        public owner_user_id?: string
    ) { }

    static fromJson(json: any): Account {
        const account = new Account(
            json.id,
            json.name,
            json.email,
            json.created_at,
            json.owner_user_id
        );

        if (json.owner) {
            account.owner = User.fromJson(json.owner);
        }

        if (Array.isArray(json.sites)) {
            account.sites = json.sites.map((s: any) => Site.fromJson(s));
        }

        return account;
    }

    isOwnedBy(user: User): boolean {
        return this.owner?.id === user.id;
    }

}
