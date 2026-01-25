import { Chunk } from '../chunk/chunk';
import { CrawlJob } from '../crawl-job/crawl-job';
import { Site } from '../site/site';

export class Page {
    public chunks: Chunk[] = [];
    public crawlJob: CrawlJob | null = null;
    public site: Site | null = null;

    constructor(
        public id: string,
        public site_id: string,
        public url: string,
        public title: string,
        public source: 'crawl' | 'sitemap',
        public chunks_count: number,
        public is_indexed: boolean,
        public created_at: string,
        public updated_at: string,
        public last_crawl?: CrawlJob,
    ) { }

    static fromJson(json: any): Page {
        const page = new Page(
            json.id,
            json.site_id,
            json.url,
            json.title,
            json.source,
            json.chunks_count,
            json.is_indexed,
            json.created_at,
            json.updated_at,
            json.last_crawl ? CrawlJob.fromJson(json.last_crawl) : undefined
        );


        if (json.crawl) {
            page.crawlJob = CrawlJob.fromJson(json.crawl);
        }


        if (json.site) {
            page.site = Site.fromJson(json.site);
        }

        return page;
    }

    /**
   * Status réel de la page
   * Priorité : crawlJob > last_crawl > is_indexed
   */
    get status(): 'pending' | 'processing' | 'done' | 'error' {
        const job = this.crawlJob ?? this.last_crawl;

        if (!job) {
            // Pas de crawl, si indexé c'est "done", sinon "pending"
            return this.is_indexed ? 'done' : 'pending';
        }

        return job.status;
    }

    /** Icône associée au status */
    get statusIcon() {
        switch (this.status) {
            case 'done':
                return 'faCheckCircle';
            case 'pending':
                return 'faHourglassHalf';
            case 'processing':
                return 'faSpinner'; // on peut faire une animation spin
            case 'error':
                return 'faTriangleExclamation';
            default:
                return 'faQuestionCircle';
        }
    }
}
