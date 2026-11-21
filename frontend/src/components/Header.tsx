import { useNavigate } from "react-router-dom";
import { ChevronLeft, LogOut, Menu } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

type Props = {
  title: string;
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Header({ title, isCollapsed, setIsCollapsed }: Props) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <header className="relative flex h-20 items-center gap-4 bg-surface px-7 max-[800px]:h-18 max-[800px]:gap-2 max-[800px]:px-3">
      <button
        className="inline-flex h-8 min-w-7 cursor-pointer items-center justify-center rounded-md p-1 text-muted hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-link min-[801px]:hidden"
        aria-label={isCollapsed ? "Abrir menu" : "Fechar menu"}
        aria-expanded={!isCollapsed}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <Menu size={18} />
      </button>

      <button
        className={`inline-flex h-8 min-w-7 cursor-pointer items-center justify-center rounded-md p-1 text-muted hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-link max-[800px]:hidden ${isCollapsed ? "rotate-180" : ""}`}
        aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <ChevronLeft size={18} />
      </button>

      <h1 className="text-lg font-semibold text-card-foreground max-[800px]:text-sm">
        {title}
      </h1>

      <div className="ml-auto flex items-center gap-2">
        <button
          className="inline-flex h-8 min-w-7 cursor-pointer items-center justify-center rounded-md p-1 text-muted hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-link"
          aria-label="Sair da conta"
          onClick={async () => {
            await logout();
            navigate("/login", { replace: true });
          }}
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
