import { AsyncLocalStorage } from "node:async_hooks";

export type SiteRequestContext = {
  /** Örn. `/kuafor` */
  prefix: string;
  /** `data/` alt klasörü, örn. `kuafor` */
  subdir: string;
};

const als = new AsyncLocalStorage<SiteRequestContext>();

export function getSiteContext(): SiteRequestContext | undefined {
  return als.getStore();
}

export function runWithSiteContext<T>(ctx: SiteRequestContext, fn: () => T): T {
  return als.run(ctx, fn);
}
