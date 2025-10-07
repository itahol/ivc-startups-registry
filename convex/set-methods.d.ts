export {};

declare global {
  interface Set<T> {
    /** Returns a new Set with elements common to both sets */
    intersection(other: Set<T>): Set<T>;
  }
}
