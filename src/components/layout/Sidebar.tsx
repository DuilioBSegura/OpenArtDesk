import type { AppRoute } from "../../app/routes";
import type { AppModule } from "../../types/modules";

type SidebarProps = {
  activeModuleId: AppModule["id"];
  routes: AppRoute[];
  onNavigate: (moduleId: AppModule["id"]) => void;
};

export function Sidebar({ activeModuleId, routes, onNavigate }: SidebarProps) {
  return (
    <aside className="sidebar" aria-label="Modulos do OpenArtDesk">
      <div className="brand-block">
        <div className="brand-mark" aria-hidden="true">
          OA
        </div>
        <div>
          <strong>OpenArtDesk</strong>
          <span>Local workspace</span>
        </div>
      </div>

      <nav className="module-nav">
        {routes.map((route) => {
          const { module } = route;
          const isActive = module.id === activeModuleId;

          return (
            <button
              aria-current={isActive ? "page" : undefined}
              className="module-nav-item"
              data-active={isActive}
              key={route.path}
              onClick={() => onNavigate(module.id)}
              type="button"
              title={module.description}
            >
              <span className="module-icon" aria-hidden="true">
                {module.icon}
              </span>
              <span>{module.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
