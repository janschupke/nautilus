export type CheatsheetMeta = {
  slug: string;
  title: string;
  description: string;
};

export const RTFM_MANIFEST: CheatsheetMeta[] = [
  {
    slug: "nmap",
    title: "nmap",
    description:
      "Network mapper — host discovery, port scanning, OS and service detection.",
  },
];

export function findCheatsheet(slug: string): CheatsheetMeta | undefined {
  return RTFM_MANIFEST.find((c) => c.slug === slug);
}
