import { useEffect, useState } from "react";
import { RotateCw } from "lucide-react";

const QR_SECONDS = 60;

// Placeholder visual, NÃO é um QR legível.
// Trocar por <img src={qr} /> com a imagem que a API devolver.
function QrPlaceholder({ seed, expired }: { seed: number; expired: boolean }) {
  const size = 21;
  const cells = Array.from({ length: size * size }, (_, i) => {
    const x = i % size;
    const y = Math.floor(i / size);
    const corner =
      x < 7 && y < 7 ? [x, y]
      : x >= size - 7 && y < 7 ? [x - (size - 7), y]
      : x < 7 && y >= size - 7 ? [x, y - (size - 7)]
      : null;

    if (corner) {
      const [a, b] = corner;
      return a === 0 || a === 6 || b === 0 || b === 6 || (a >= 2 && a <= 4 && b >= 2 && b <= 4);
    }
    return (x * 31 + y * 17 + x * y * seed) % 7 < 3;
  });

  return (
    <div
      role="img"
      aria-label="QR code de exemplo"
      className={`mx-auto grid size-52 grid-cols-[repeat(21,1fr)] rounded-lg bg-white p-3 ${expired ? "opacity-30" : ""}`}
    >
      {cells.map((dark, i) => <span key={i} className={dark ? "bg-brand-900" : ""} />)}
    </div>
  );
}

export default function WhatsAppReconnect() {
  const [seconds, setSeconds] = useState(QR_SECONDS);
  const [qrSeed, setQrSeed] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  function newQr() {
    // TODO: pedir um novo QR à API
    setQrSeed((s) => s + 1);
    setSeconds(QR_SECONDS);
  }

  const expired = seconds === 0;
  const countdown = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <>
      <header className="mb-6">
        <h2 className="text-[30px] leading-10 font-bold text-foreground max-[800px]:text-[25px]">
          Conectar WhatsApp Business
        </h2>
        <p className="text-sm leading-6 text-muted">
          Escaneie o QR temporário usando o WhatsApp do número empresarial.
        </p>
      </header>

      <div
        role="status"
        className="mb-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-1 rounded-xl bg-warning-bg px-6 py-5 text-warning-fg"
      >
        <p className="flex items-center gap-3 text-lg font-semibold">
          <span aria-hidden>!</span> Sessão desconectada
        </p>
        <p className="text-sm">Os envios automáticos estão pausados até a reconexão.</p>
      </div>

      <section className="mx-auto max-w-140 rounded-[20px] bg-surface p-8 text-card-foreground">
        <h3 className="text-2xl font-semibold">Parear dispositivo</h3>

        <ol className="mt-4 list-decimal space-y-2 pl-5 text-[15px] text-muted">
          <li>Abra o WhatsApp Business no celular da empresa</li>
          <li>Acesse Dispositivos conectados → Conectar dispositivo</li>
        </ol>

        <div className="my-8">
          <QrPlaceholder seed={qrSeed} expired={expired} />
          <p className="mt-6 text-center font-semibold">QR temporário</p>
          <p className={`text-center text-sm ${expired ? "text-danger-fg" : "text-warning-fg"}`}>
            {expired ? "QR expirado" : `Expira em ${countdown}`}
          </p>
        </div>

        <button
          type="button"
          onClick={newQr}
          className="mx-auto flex cursor-pointer items-center gap-2 text-base font-semibold text-link focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-link"
        >
          <RotateCw size={18} /> Gerar novo QR code
        </button>

        <div className="mt-8 space-y-3 text-center text-sm text-muted">
          {/* TODO: consultar a API e ir para /mensagens quando o pareamento for concluído */}
          <p>A tela atualiza automaticamente após o pareamento.</p>
          <p>Esta conexão é protegida. O código não é armazenado.</p>
        </div>
      </section>
    </>
  );
}