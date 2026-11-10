import API from "./api";
import { extractList } from "./apiResponse";

export type StatusGroup = "medicine" | "prescription" | "invoice";

export interface Status {
  id: string;
  name: string;
  groupType: string;
}

/** "partially_paid" -> "Partially paid" */
export const statusLabel = (name?: string | null) =>
  name ? name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, " ") : "—";

export const statusAPI = {
  list: async (groupType: StatusGroup): Promise<Status[]> =>
    extractList<Status>(await API.get("statuses", { params: { groupType } })),
};

/** Shown when a status group is empty, which blocks creating records that need one. */
export const MISSING_STATUSES_MESSAGE =
  "No statuses are configured yet. Ask an administrator to run `npm run seed:statuses` in the backend.";
