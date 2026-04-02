export interface CmsSourceConfig {
  owner: string;
  repo: string;
  branch?: string;
}

export type CmsSourceOverride = Partial<CmsSourceConfig> | undefined;
