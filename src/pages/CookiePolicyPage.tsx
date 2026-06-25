import React from 'react';
import { Cookie, BarChart3, Megaphone, SlidersHorizontal } from 'lucide-react';
import { useTerms } from '../contexts/TermsContext';

const CookiePolicyPage: React.FC = () => {
  const { reopenCookiePreferences, preferences } = useTerms();

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-8">Politica de Cookies</h1>

      <div className="space-y-8">
        <section className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center mb-4">
            <Cookie className="h-6 w-6 text-blue-500 mr-3" />
            <h2 className="text-2xl font-bold">Como usamos cookies</h2>
          </div>
          <p className="text-neutral-600">
            Cookies e tecnologias similares ajudam o AlpesNews a funcionar com seguranca,
            lembrar suas escolhas e entender como o portal e usado. Cookies nao essenciais
            so devem ser usados conforme sua preferencia.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Categorias</h2>
          <div className="grid gap-4">
            <div className="bg-neutral-50 p-5 rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Cookie className="h-4 w-4" />
                Necessarios
              </h3>
              <p className="text-neutral-600">
                Mantem login, seguranca, preferencias de cookies e funcionamento basico.
                Eles ficam sempre ativos.
              </p>
            </div>

            <div className="bg-neutral-50 p-5 rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </h3>
              <p className="text-neutral-600">
                Podem medir audiencia, paginas acessadas e desempenho editorial para melhorar
                conteudo e experiencia.
              </p>
            </div>

            <div className="bg-neutral-50 p-5 rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Megaphone className="h-4 w-4" />
                Marketing
              </h3>
              <p className="text-neutral-600">
                Podem apoiar campanhas, anuncios e medicao comercial. Essa categoria deve
                permanecer desativada se nao houver ferramentas desse tipo no portal.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-neutral-100 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Suas preferencias</h2>
          <p className="text-neutral-600 mb-4">
            Preferencia atual: analytics {preferences?.analytics ? 'ativo' : 'inativo'} e
            marketing {preferences?.marketing ? 'ativo' : 'inativo'}.
          </p>
          <button
            type="button"
            onClick={reopenCookiePreferences}
            className="btn btn-primary inline-flex items-center"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Gerenciar cookies
          </button>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Atualizacoes</h2>
          <p className="text-neutral-600">
            Esta politica pode ser atualizada quando novas tecnologias, ferramentas de
            analytics ou parceiros forem adicionados ao AlpesNews.
          </p>
          <p className="text-sm text-neutral-500 mt-4">Ultima atualizacao: 29/04/2026</p>
        </section>
      </div>
    </div>
  );
};

export default CookiePolicyPage;
