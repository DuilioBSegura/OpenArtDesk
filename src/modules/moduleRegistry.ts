import { ActivitiesPage } from "../features/activities/ActivitiesPage";
import { CustomizationPage } from "../features/customization/CustomizationPage";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { LibraryPage } from "../features/library/LibraryPage";
import { LocalDataPage } from "../features/local-data/LocalDataPage";
import { OnboardingPage } from "../features/onboarding/OnboardingPage";
import { ReferencesPage } from "../features/references/ReferencesPage";
import { SettingsPage } from "../features/settings/SettingsPage";
import { StudiesPage } from "../features/studies/StudiesPage";
import type { AppModule, ModuleBlueprint } from "../types/modules";

export const moduleRegistry = [
  {
    id: "onboarding",
    label: "Onboarding",
    path: "/",
    icon: "01",
    enabled: true,
    order: 10,
    group: "start",
    description: "Primeira experiencia e orientacao inicial do app.",
    component: OnboardingPage,
  },
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    icon: "02",
    enabled: true,
    order: 20,
    group: "start",
    description: "Visao geral futura dos estudos e materiais locais.",
    component: DashboardPage,
  },
  {
    id: "library",
    label: "Minha Biblioteca",
    path: "/library",
    icon: "03",
    enabled: true,
    order: 30,
    group: "study",
    description: "Base futura para organizar PDFs e materiais locais.",
    component: LibraryPage,
  },
  {
    id: "studies",
    label: "Estudos",
    path: "/studies",
    icon: "04",
    enabled: true,
    order: 40,
    group: "study",
    description: "Espaco futuro para planos e registros de estudo.",
    component: StudiesPage,
  },
  {
    id: "references",
    label: "Referencias",
    path: "/references",
    icon: "05",
    enabled: true,
    order: 50,
    group: "workspace",
    description: "Base futura para referencias visuais e materiais de apoio.",
    component: ReferencesPage,
  },
  {
    id: "activities",
    label: "Atividades",
    path: "/activities",
    icon: "06",
    enabled: true,
    order: 60,
    group: "workspace",
    description: "Espaco futuro para atividades e praticas de estudo.",
    component: ActivitiesPage,
  },
  {
    id: "customization",
    label: "Customizacao",
    path: "/customization",
    icon: "07",
    enabled: true,
    order: 70,
    group: "personalization",
    description: "Fundacao para temas, densidade e preferencias futuras.",
    component: CustomizationPage,
  },
  {
    id: "local-data",
    label: "Dados Locais",
    path: "/local-data",
    icon: "08",
    enabled: true,
    order: 80,
    group: "system",
    description: "Area futura para transparencia sobre dados locais.",
    component: LocalDataPage,
  },
  {
    id: "settings",
    label: "Configuracoes",
    path: "/settings",
    icon: "09",
    enabled: true,
    order: 90,
    group: "system",
    description: "Base futura para ajustes locais do aplicativo.",
    component: SettingsPage,
  },
] satisfies AppModule[];

export const futureModuleBlueprints = [
  {
    id: "drawings",
    label: "Meus Desenhos",
    path: "/drawings",
    icon: "10",
    enabled: false,
    order: 100,
    group: "future",
    description: "Aba futura para trabalhos e estudos visuais.",
  },
  {
    id: "brushes",
    label: "Meus Brushes",
    path: "/brushes",
    icon: "11",
    enabled: false,
    order: 110,
    group: "future",
    description: "Aba futura para organizar brushes e assets locais.",
  },
  {
    id: "courses",
    label: "Meus Cursos",
    path: "/courses",
    icon: "12",
    enabled: false,
    order: 120,
    group: "future",
    description: "Aba futura para cursos e materiais de aprendizado.",
  },
] satisfies ModuleBlueprint[];

export const enabledModules = moduleRegistry
  .filter((module) => module.enabled)
  .slice()
  .sort((left, right) => left.order - right.order);
