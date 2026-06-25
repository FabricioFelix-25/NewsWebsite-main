import React from 'react';
import { Shield, Lock, Eye, UserCheck } from 'lucide-react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-8">Politica de Privacidade</h1>

      <div className="prose prose-lg max-w-none">
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="flex items-center mb-4">
            <Shield className="h-6 w-6 text-blue-500 mr-3" />
            <h2 className="text-2xl font-bold">Sua privacidade importa</h2>
          </div>
          <p className="text-neutral-600">
            No AlpesNews, tratamos seus dados com seriedade. Esta politica explica quais
            informacoes coletamos, como usamos esses dados e como protegemos sua privacidade.
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <div className="flex items-center mb-4">
              <Lock className="h-6 w-6 text-blue-500 mr-3" />
              <h2 className="text-2xl font-bold">1. Informacoes coletadas</h2>
            </div>
            <div className="bg-neutral-50 p-6 rounded-lg">
              <ul className="space-y-4 text-neutral-600">
                <li>- Dados cadastrais (nome e email) quando voce cria conta;</li>
                <li>- Dados de uso para melhorar sua experiencia no portal;</li>
                <li>- Preferencias de cookies e consentimento;</li>
                <li>- Informacoes tecnicas de dispositivo e navegador.</li>
              </ul>
            </div>
          </section>

          <section>
            <div className="flex items-center mb-4">
              <Eye className="h-6 w-6 text-blue-500 mr-3" />
              <h2 className="text-2xl font-bold">2. Uso das informacoes</h2>
            </div>
            <div className="bg-neutral-50 p-6 rounded-lg">
              <ul className="space-y-4 text-neutral-600">
                <li>- Operar e evoluir o AlpesNews;</li>
                <li>- Medir audiencia e desempenho editorial quando voce permitir analytics;</li>
                <li>- Enviar comunicacoes importantes sobre o servico;</li>
                <li>- Reforcar a seguranca da plataforma.</li>
              </ul>
            </div>
          </section>

          <section>
            <div className="flex items-center mb-4">
              <UserCheck className="h-6 w-6 text-blue-500 mr-3" />
              <h2 className="text-2xl font-bold">3. Seus direitos</h2>
            </div>
            <div className="bg-neutral-50 p-6 rounded-lg">
              <ul className="space-y-4 text-neutral-600">
                <li>- Solicitar acesso aos seus dados pessoais;</li>
                <li>- Pedir correcao ou exclusao das informacoes;</li>
                <li>- Revogar consentimentos quando aplicavel;</li>
                <li>- Acionar autoridade competente em caso de duvida.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Cookies e IA</h2>
            <div className="bg-neutral-50 p-6 rounded-lg">
              <p className="text-neutral-600 mb-4">
                Cookies nao essenciais, como analytics e marketing, dependem da sua escolha.
                Voce pode alterar suas preferencias na Politica de Cookies.
              </p>
              <p className="text-neutral-600">
                O AlpesNews pode usar IA como apoio editorial interno. Conteudos publicados
                devem passar por revisao humana antes de ir ao ar.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Contato</h2>
            <p className="text-neutral-600">
              Em caso de duvidas sobre esta politica, fale com nossa equipe:
              privacidade@alpesnews.com.br.
            </p>
          </section>

          <section className="bg-neutral-100 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">6. Atualizacoes</h2>
            <p className="text-neutral-600">
              Esta politica pode ser atualizada periodicamente. Sempre que houver mudancas
              relevantes, publicaremos a nova versao nesta pagina.
            </p>
            <p className="text-sm text-neutral-500 mt-4">Ultima atualizacao: 29/04/2026</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
