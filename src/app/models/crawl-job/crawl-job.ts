export class CrawlJob {
  constructor(
    public id: string,
    public status: 'pending' | 'processing' | 'done' | 'error',
    public error_message: string | null,
    public created_at: string
  ) {}

  static fromJson(json: any): CrawlJob {
    return new CrawlJob(
      json.id,
      json.status,
      json.error_message ?? null,
      json.created_at
    );
  }

  isError(): boolean {
    return this.status === 'error';
  }
}
