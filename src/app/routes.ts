import { enabledModules, moduleRegistry } from "../modules/moduleRegistry";
import type { AppModule, AppModuleId } from "../types/modules";

export type AppRoute = {
  id: AppModuleId;
  path: string;
  label: string;
  module: AppModule;
};

export const appRoutes = enabledModules.map((module) => ({
  id: module.id,
  path: module.path,
  label: module.label,
  module,
})) satisfies AppRoute[];

export const defaultRoute = appRoutes[0];

export function findRouteByModuleId(moduleId: AppModuleId): AppRoute {
  return (
    appRoutes.find((route) => route.id === moduleId) ??
    defaultRoute
  );
}

export function findRouteByPath(path: string): AppRoute {
  return (
    appRoutes.find((route) => route.path === path) ??
    defaultRoute
  );
}

export function isKnownModuleId(moduleId: string): moduleId is AppModuleId {
  return moduleRegistry.some((module) => module.id === moduleId);
}
