import { Site } from "../site/site";

export class KnowledgeQualityScore {
    public site: Site | null = null;

    constructor(
        public id: string | null = null,
        public site_id: string | null = null,
        public scope_type: 'global' | string = 'global',
        public coverage_score: number = 0,
        public integrity_score: number = 0,
        public retrieval_score: number = 0,
        public redundancy_score: number = 0,
        public freshness_score: number = 0,
        public precision: number = 0,
        public global_score: number = 0,
        public created_at: string | null = null,
        public updated_at: string | null = null,
        public recommendations: string[] = [] // 🆕 recommandations actionnables
    ) { }

    static fromJson(json: any): KnowledgeQualityScore {
        const score = new KnowledgeQualityScore(
            json.id,
            json.site_id,
            json.scope_type ?? 'global',
            json.coverage_score ?? 0,
            json.integrity_score ?? 0,
            json.retrieval_score ?? 0,
            json.redundancy_score ?? 0,
            json.freshness_score ?? 0,
            json.global_score ?? 0,
            json.precision ?? 0,
            json.created_at ?? null,
            json.updated_at ?? null,
            json.recommendations ?? []
        );

        if (json.site) {
            score.site = Site.fromJson(json.site);
        }

        return score;
    }

    exists(): boolean {
        return this.id !== null;
    }
}
