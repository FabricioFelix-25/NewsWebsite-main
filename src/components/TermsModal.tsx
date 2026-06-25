import React from 'react';
import { Link } from 'react-router-dom';
import { Cookie, Settings2, ShieldCheck } from 'lucide-react';

interface TermsModalProps {
  analyticsEnabled: boolean;
  marketingEnabled: boolean;
  onToggleAnalytics: (enabled: boolean) => void;
  onToggleMarketing: (enabled: boolean) => void;
  onAcceptAll: () => void;
  onRejectOptional: () => void;
  onSavePreferences: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({
  analyticsEnabled,
  marketingEnabled,
  onToggleAnalytics,
  onToggleMarketing,
  onAcceptAll,
  onRejectOptional,
  onSavePreferences,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-45 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="h-10 w-10 rounded-md bg-neutral-900 text-white flex items-center justify-center flex-shrink-0">
              <Cookie className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Preferencias de cookies</h2>
              <p className="text-sm text-neutral-600 mt-1">
                Usamos cookies necessarios para o funcionamento do AlpesNews. Cookies de analytics e marketing ficam sob sua escolha.
              </p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="border border-neutral-200 rounded-md p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Necessarios</h3>
                  <p className="text-sm text-neutral-600 mt-1">Mantem seguranca, sessao, consentimento e recursos basicos do site.</p>
                </div>
                <span className="text-xs font-medium text-neutral-500 bg-neutral-100 rounded-full px-3 py-1">Sempre ativo</span>
              </div>
            </div>

            <label className="border border-neutral-200 rounded-md p-4 flex items-start justify-between gap-4 cursor-pointer">
              <div>
                <h3 className="font-semibold">Analytics</h3>
                <p className="text-sm text-neutral-600 mt-1">Ajuda a entender audiencia, paginas acessadas e desempenho editorial.</p>
              </div>
              <input
                type="checkbox"
                checked={analyticsEnabled}
                onChange={(e) => onToggleAnalytics(e.target.checked)}
                className="mt-1 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
              />
            </label>

            <label className="border border-neutral-200 rounded-md p-4 flex items-start justify-between gap-4 cursor-pointer">
              <div>
                <h3 className="font-semibold">Marketing</h3>
                <p className="text-sm text-neutral-600 mt-1">Pode apoiar campanhas, medicao de anuncios e personalizacao comercial.</p>
              </div>
              <input
                type="checkbox"
                checked={marketingEnabled}
                onChange={(e) => onToggleMarketing(e.target.checked)}
                className="mt-1 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
          </div>

          <div className="text-sm text-neutral-600 mb-6">
            Leia tambem a{' '}
            <Link to="/privacy-policy" className="text-blue-700 hover:underline" target="_blank">Politica de Privacidade</Link>
            , a{' '}
            <Link to="/cookies" className="text-blue-700 hover:underline" target="_blank">Politica de Cookies</Link>
            {' '}e os{' '}
            <Link to="/terms" className="text-blue-700 hover:underline" target="_blank">Termos de Uso</Link>.
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-end border-t pt-5">
            <button
              onClick={onRejectOptional}
              className="px-5 py-2 text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors duration-200"
            >
              Rejeitar nao essenciais
            </button>
            <button
              onClick={onSavePreferences}
              className="px-5 py-2 text-neutral-800 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-md transition-colors duration-200 font-medium flex items-center justify-center gap-2"
            >
              <Settings2 className="h-4 w-4" />
              Salvar preferencias
            </button>
            <button
              onClick={onAcceptAll}
              className="px-5 py-2 text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors duration-200 font-medium"
            >
              Aceitar todos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
