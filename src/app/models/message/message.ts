export class Message {
    constructor(
        public id: string,
        public content: string,
        public role: 'user' | 'bot',
        public created_at: string,
    ) { }

    static fromJson(json: any): Message {
        return new Message(
            json.id,
            json.content,
            json.role,
            json.created_at
        );
    }
}
