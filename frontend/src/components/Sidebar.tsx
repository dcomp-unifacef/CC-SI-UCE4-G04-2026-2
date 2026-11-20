import { NavLink } from "react-router-dom";
import Logo from "./Logo";

type Props = {
  links: string[][];
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Sidebar({ links, isCollapsed, setIsCollapsed }: Props) {
  const closeOnMobile = () => {
    if (window.matchMedia("(max-width: 800px)").matches) setIsCollapsed(true);
  };

  return (
    <>
      {!isCollapsed && (
        <button
          aria-label="Fechar menu"
          onClick={() => setIsCollapsed(true)}
          className="fixed inset-0 z-25 hidden bg-black/45 max-[800px]:block"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 bg-surface px-3.5 py-2 max-[800px]:w-64 ${
          isCollapsed ? "w-18 max-[800px]:-translate-x-full" : "w-64"
        }`}
      >
        <div
          className={`flex justify-center items-center ${
            isCollapsed ? "h-26" : "h-18"
          }`}
        >
          {!isCollapsed && <Logo className="h-18 w-43 object-contain" />}
        </div>

        <nav aria-label="Menu lateral" className="grid gap-3 mt-4">
          {links.map(([route, name]) => (
            <NavLink
              key={route}
              to={route}
              onClick={closeOnMobile}
              className={({ isActive }) =>
                `flex min-h-10 items-center gap-5 rounded-[9px] px-4 py-2 text-sm hover:bg-primary/90 hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-link ${isActive ? "bg-primary font-semibold text-primary-foreground" : "text-muted"} ${isCollapsed ? "justify-center" : ""}`
              }
            >
              •
              <span className={isCollapsed ? "hidden max-[800px]:inline" : ""}>
                {name}
              </span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}