import fs from "fs";

const files = [
  "components/PanelBackup.tsx",
  "components/PanelContent.tsx",
  "components/PanelDashboard.tsx",
  "components/PanelIcerikHeaderMenu.tsx",
  "components/PanelIlanlar.tsx",
  "components/PanelLeads.tsx",
  "components/PanelMedia.tsx",
  "components/PanelMenus.tsx",
  "components/PanelPages.tsx",
  "components/PanelQrMenuTab.tsx",
  "components/PanelSiparisler.tsx",
  "components/PanelUnifiedIcerik.tsx",
  "components/PanelVisitors.tsx",
  "components/vf-inline/AnasayfaInteractive.tsx",
  "components/vf-inline/CmsPageInteractive.tsx",
  "components/vf-inline/GaleriInteractive.tsx",
  "components/vf-inline/HizmetlerInteractive.tsx",
  "components/vf-inline/IletisimInteractive.tsx",
  "components/vf-inline/useVfInlineSession.ts",
];

for (const f of files) {
  let c = fs.readFileSync(f, "utf8");
  if (!c.includes("fetch(wb(")) continue;
  if (!c.includes("usePanelFetch")) {
    c = c.replace(
      /import \{([^}]*)\} from "@\/components\/SitePrefixProvider";/,
      (_m, inner) => {
        const parts = inner.split(",").map((s) => s.trim()).filter(Boolean);
        if (!parts.includes("usePanelFetch")) parts.unshift("usePanelFetch");
        return `import { ${parts.join(", ")} } from "@/components/SitePrefixProvider";`;
      },
    );
    if (!c.includes("const panelFetch = usePanelFetch()")) {
      c = c.replace(
        /const wb = useWithBase\(\);/,
        "const wb = useWithBase();\n  const panelFetch = usePanelFetch();",
      );
    }
  }
  c = c.replace(/\bfetch\(wb\(/g, "panelFetch(wb(");
  c = c.replace(/, credentials: "same-origin"/g, "");
  fs.writeFileSync(f, c);
  console.log("OK", f);
}
