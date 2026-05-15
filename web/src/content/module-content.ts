type ModuleJson = { id: string; intro: string };

const moduleLoaders: Record<string, () => Promise<{ default: ModuleJson }>> = {
  "linux-fundamentals": () => import("./modules/linux-fundamentals.json"),
  basics: () => import("./modules/basics.json"),
  filesystem: () => import("./modules/filesystem.json"),
  "processes-and-users": () => import("./modules/processes-and-users.json"),
  "net-theory": () => import("./modules/net-theory.json"),
  networking: () => import("./modules/networking.json"),
  exploitation: () => import("./modules/exploitation.json"),
  forensics: () => import("./modules/forensics.json"),
};

export async function getModuleContent(id: string): Promise<ModuleJson | null> {
  const load = moduleLoaders[id];
  if (!load) return null;
  const mod = await load();
  return mod.default;
}
