import { appRoutes } from "../app/routes";

export const routeSummaries = appRoutes.map(({ id, label, path }) => ({
  id,
  label,
  path,
}));
