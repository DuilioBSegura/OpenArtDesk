import type { ComponentType } from "react";
import type { AppearanceController } from "./appearance";

export type AppModuleId =
  | "onboarding"
  | "dashboard"
  | "library"
  | "studies"
  | "references"
  | "activities"
  | "customization"
  | "local-data"
  | "settings";

export type FutureModuleId =
  | "drawings"
  | "brushes"
  | "courses"
  | "projects"
  | "notes"
  | "classes"
  | "collections";

export type ModuleGroup =
  | "start"
  | "study"
  | "workspace"
  | "personalization"
  | "system"
  | "future";

export type ModulePageProps = AppearanceController & {
  module: AppModule;
};

export type AppModule = {
  id: AppModuleId;
  label: string;
  path: string;
  icon: string;
  enabled: boolean;
  order: number;
  group?: ModuleGroup;
  description?: string;
  component: ComponentType<ModulePageProps>;
};

export type ModuleBlueprint = {
  id: FutureModuleId;
  label: string;
  path: string;
  icon: string;
  enabled: false;
  order: number;
  group: "future";
  description: string;
};
