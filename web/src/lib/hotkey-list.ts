/**
 * The navigation shortcuts, in the order the help dialog lists them. Single
 * source of truth so `NavHotkeys` and the dialog cannot drift apart.
 */
export const NAV_HOTKEYS: readonly { keys: string[]; description: string }[] = [
  { keys: ["h"], description: "Home" },
  { keys: ["l"], description: "Lab setup" },
  { keys: ["s"], description: "Stats" },
  { keys: ["t"], description: "Tools" },
  { keys: ["r"], description: "RTFM" },
  { keys: ["j", "+"], description: "Next topic" },
  { keys: ["k", "-"], description: "Previous topic" },
  { keys: ["?"], description: "This dialog" },
];
