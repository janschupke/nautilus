/** Zero-padded two-digit module index string, e.g. 0 → "01", 5 → "06". */
export function formatModuleIndex(zeroBasedIndex: number): string {
  return String(zeroBasedIndex + 1).padStart(2, "0");
}
