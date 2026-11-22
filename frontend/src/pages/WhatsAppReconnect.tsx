import { useCallback, useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { RotateCw } from "lucide-react";
import { apiErrorMessage } from "../services/api";
import {
  createWhatsappQr,
  fetchWhatsappStatus,
  type WhatsappQr,
} from "../services/messages";

const QR_SECONDS = 60;
const STATUS_INTERVAL = 5000;

type QrState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; qr: WhatsappQr };

function qrImageSource(base64: string) {
  return base64.startsWith("data:") ? base64 : `data:image/png;base64,${base64}`;
}

export default function WhatsAppReconnect() {
  const navigate = useNavigate();
  const [seconds, setSeconds] = useState(QR_SECONDS);
  const [state, setState] = useState<QrState>({ status: "loading" });

  const generate = useCallback(
    () =>
      createWhatsappQr()
        .then((qr) => {
          setState({ status: "ready", qr });
          setSeconds(QR_SECONDS);
        })
        .catch((err) => {
          const disabled = isAxiosError(err) && err.response?.status === 409;
          setState({
            status: "error",
            message: disabled
              ? "A integração com o WhatsApp está desativada neste ambiente."
              : apiErrorMessage(err, "Não foi possível gerar o QR code."),
          });
        }),
    [],
  );

  useEffect(() => {
    generate();
  }, [generate]);

  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      fetchWhatsappStatus()
        .then((status) => {
          if (status.connected) navigate("/mensagens");
        })
        .catch(() => undefined);
    }, STATUS_INTERVAL);
    return () => clearInterval(timer);
  }, [navigate]);

  function newQr() {
    setState({ status: "loading" });
    generate();
  }

  const expired = state.status === "ready" && seconds === 0;
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
          {state.status === "loading" && (
            <p role="status" className="text-center text-muted">
              Gerando QR code...
            </p>
          )}

          {state.status === "error" && (
            <p role="alert" className="text-center text-danger-fg">
              {state.message}
            </p>
          )}

          {state.status === "ready" && (
            <>
              {state.qr.base64 ? (
                <img
                  src={qrImageSource(state.qr.base64)}
                  alt="QR code para conectar o WhatsApp"
                  className={`mx-auto size-52 rounded-lg bg-white p-3 ${expired ? "opacity-30" : ""}`}
                />
              ) : (
                <p className="text-center text-2xl font-semibold tracking-widest">
                  {state.qr.pairingCode ?? state.qr.code}
                </p>
              )}
              <p className="mt-6 text-center font-semibold">
                {state.qr.base64 ? "QR temporário" : "Código de pareamento"}
              </p>
              <p className={`text-center text-sm ${expired ? "text-danger-fg" : "text-warning-fg"}`}>
                {expired ? "QR expirado" : `Expira em ${countdown}`}
              </p>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={newQr}
          className="mx-auto flex cursor-pointer items-center gap-2 text-base font-semibold text-link focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-link"
        >
          <RotateCw size={18} /> Gerar novo QR code
        </button>

        <div className="mt-8 space-y-3 text-center text-sm text-muted">
          <p>A tela atualiza automaticamente após o pareamento.</p>
          <p>Esta conexão é protegida. O código não é armazenado.</p>
        </div>
      </section>
    </>
  );
}