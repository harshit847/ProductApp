// Tiny utility that keeps class name composition readable without adding a heavy dependency.
// Accepts any number of class strings, falsy values, or objects — falsy entries are stripped out.
export function cn(...values: Array<string | false | null | undefined | Record<string, boolean>>): string {
  return values
    .flat()
    .filter((value) => {
      if (!value) return false;
      if (typeof value === "object") {
        return Object.values(value).some(Boolean);
      }
      return true;
    })
    .map((value) => {
      if (typeof value === "object" && value !== null) {
        return Object.entries(value)
          .filter(([, v]) => v)
          .map(([k]) => k)
          .join(" ");
      }
      return String(value);
    })
    .join(" ");
}
