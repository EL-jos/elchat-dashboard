export class UnansweredQuestion {
    constructor(
        public id: string,
        public site_id: string,
        public question: string,
        public created_at: string,
    ) { }

    static fromJson(json: any): UnansweredQuestion {
        return new UnansweredQuestion(
            json.id,
            json.site_id,
            json.question,
            json.created_at
        );
    }
}
