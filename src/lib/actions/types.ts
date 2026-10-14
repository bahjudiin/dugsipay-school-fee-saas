/** Shared types for server actions (kept outside "use server" modules). */
export type FormState = {
  ok?: boolean;
  error?: string;
  id?: number;
  fieldErrors?: Record<string, string>;
};
