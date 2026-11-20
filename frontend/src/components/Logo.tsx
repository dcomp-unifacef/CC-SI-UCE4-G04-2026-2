import LogoAzul from "../assets/logo-azul.png";
import LogoBranco from "../assets/logo-branco.png";

type LogoProps = {
  className?: string;
  variant?: "auto" | "branco" | "azul";
};

export default function Logo({ className = "", variant = "auto" }: LogoProps) {
  if (variant === "branco") {
    return (
      <img src={LogoBranco} alt="Logo Sono Inteligente" className={className} />
    );
  }

  if (variant === "azul") {
    return (
      <img src={LogoAzul} alt="Logo Sono Inteligente" className={className} />
    );
  }

  return (
    <>
      <img
        src={LogoAzul}
        alt="Logo Sono Inteligente"
        className={`${className} dark:hidden`}
      />
      <img
        src={LogoBranco}
        alt=""
        aria-hidden="true"
        className={`${className} hidden dark:block`}
      />
    </>
  );
}
