import type { MouseEvent as ReactMouseEvent } from "react";
import type { HomeHeroAltBlok, SiteIcerik } from "@/lib/content-store";
import type { VfMenuItem } from "@/components/vf-inline/VfContextMenu";

export type KuaforHome = SiteIcerik["home"];

export type KuaforHeroProps = {
  home: KuaforHome;
  inline: boolean;
  salonAdLive: string;
  setSalonAdLive: (v: string) => void;
  patchSalonAd: (v: string) => void | Promise<void>;
  updateHome: (fn: (h: KuaforHome) => KuaforHome) => void;
  pathname: string;
  openCtx: (e: ReactMouseEvent, items: VfMenuItem[]) => void;
  heroAltBlokMenuItems: (bl: HomeHeroAltBlok, blokIndex: number) => VfMenuItem[];
};
