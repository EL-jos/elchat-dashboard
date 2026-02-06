import { Site } from "../site/site";

export class KnowledgeQualityScore {
    public site: Site | null = null; // Optionnel : si tu veux relier à Site

    constructor(
        public id: string | null = null,
        public site_id: string | null = null,
        public scope_type: 'global' | string = 'global',
        public coverage_score: number = 0,
        public data_quality_score: number = 0,
        public semantic_score: number = 0,
        public freshness_score: number = 0,
        public global_score: number = 0,
        public created_at: string | null = null,
        public updated_at: string | null = null,
    ) { }

    static fromJson(json: any): KnowledgeQualityScore {
        const score = new KnowledgeQualityScore(
            json.id,
            json.site_id,
            json.scope_type ?? 'global',
            json.coverage_score ?? 0,
            json.data_quality_score ?? 0,
            json.semantic_score ?? 0,
            json.freshness_score ?? 0,
            json.global_score ?? 0,
            json.created_at ?? null,
            json.updated_at ?? null
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
