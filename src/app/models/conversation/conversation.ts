import { firstValueFrom } from 'rxjs';
import { Message } from '../message/message';
import { ConversationService } from '../../services/conversation/conversation.service';

export class Conversation {
    public messages: Message[] = [];

    constructor(
        public id: string,
        public site_id: string,
        public created_at: string,
    ) { }

    static fromJson(json: any): Conversation {
        return new Conversation(
            json.id,
            json.site_id,
            json.created_at
        );
    }

    async loadMessages(service: ConversationService): Promise<void> {
        if (this.messages.length > 0) return;
        this.messages = await firstValueFrom(
            service.getMessages(this.id)
        );
    }
}
