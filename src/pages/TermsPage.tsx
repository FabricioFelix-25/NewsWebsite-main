import React from 'react';
import { FileText, Shield, AlertTriangle, HelpCircle } from 'lucide-react';

const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-8">Termos de Uso</h1>

      <div className="prose prose-lg max-w-none">
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="flex items-center mb-4">
            <FileText className="h-6 w-6 text-blue-500 mr-3" />
            <h2 className="text-2xl font-bold">1. Aceitacao dos termos</h2>
          </div>
          <p className="text-neutral-600">
            Ao acessar o AlpesNews, voce concorda com estes Termos de Uso e com nossa Politica
            de Privacidade. Caso nao concorde, interrompa o uso do portal.
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">2. Definicoes</h2>
            <div className="bg-neutral-50 p-6 rounded-lg">
              <ul className="space-y-4 text-neutral-600">
                <li>- Usuario: qualquer pessoa que acessa o portal;</li>
                <li>- Administrador: usuario autorizado a publicar conteudo;</li>
                <li>- Conteudo: textos, imagens e demais materiais publicados;</li>
                <li>- IA: ferramentas usadas para apoiar a redacao editorial.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. Acesso administrativo</h2>
            <div className="bg-neutral-50 p-6 rounded-lg">
              <p className="text-neutral-600 mb-4">
                3.1. Para criar ou editar materias, e obrigatorio autenticar-se como administrador.
              </p>
              <p className="text-neutral-600">
                3.2. Credenciais sao pessoais e intransferiveis. Cada usuario e responsavel por sua
                conta e seguranca de acesso.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Publicacao de conteudo</h2>
            <div className="bg-neutral-50 p-6 rounded-lg">
              <p className="text-neutral-600 mb-4">
                4.1. Materias podem ser produzidas manualmente ou com apoio de IA.
              </p>
              <p className="text-neutral-600 mb-4">4.2. E responsabilidade do administrador:</p>
              <ul className="list-disc pl-6 space-y-2 text-neutral-600">
                <li>Verificar veracidade e atualidade das informacoes;</li>
                <li>Referenciar fontes quando necessario;</li>
                <li>Registrar revisao humana quando houver apoio de IA;</li>
                <li>Evitar conteudo ilegal, difamatorio ou protegido sem permissao.</li>
              </ul>
            </div>
          </section>

          <section>
            <div className="flex items-center mb-4">
              <Shield className="h-6 w-6 text-blue-500 mr-3" />
              <h2 className="text-2xl font-bold">5. Direitos autorais</h2>
            </div>
            <div className="bg-neutral-50 p-6 rounded-lg">
              <p className="text-neutral-600 mb-4">
                5.1. O conteudo publicado no AlpesNews e protegido por direitos autorais.
              </p>
              <p className="text-neutral-600">
                5.2. O portal pode reproduzir e exibir o conteudo para operacao e divulgacao do servico.
              </p>
            </div>
          </section>

          <section>
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-blue-500 mr-3" />
              <h2 className="text-2xl font-bold">6. Responsabilidades</h2>
            </div>
            <div className="bg-neutral-50 p-6 rounded-lg">
              <p className="text-neutral-600 mb-4">
                6.1. O administrador responde pelo conteudo que publica no portal.
              </p>
              <p className="text-neutral-600">
                6.2. Conteudo gerado por IA deve sempre ser revisado antes da publicacao.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Condutas proibidas</h2>
            <div className="bg-neutral-50 p-6 rounded-lg">
              <ul className="list-disc pl-6 space-y-2 text-neutral-600">
                <li>Publicar conteudo ilegal ou que viole direitos de terceiros;</li>
                <li>Espalhar desinformacao de forma deliberada;</li>
                <li>Executar automacoes que prejudiquem a estabilidade do portal.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">8. Moderacao</h2>
            <div className="bg-neutral-50 p-6 rounded-lg">
              <p className="text-neutral-600">
                O AlpesNews pode remover ou editar conteudos que violem estes termos, sem aviso previo.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">9. Correcoes editoriais</h2>
            <div className="bg-neutral-50 p-6 rounded-lg">
              <p className="text-neutral-600">
                Erros, pedidos de correcao, remocao ou revisao de conteudo podem ser enviados
                para correcoes@alpesnews.com.br. Solicitacoes serao avaliadas conforme a
                legislacao aplicavel e os criterios editoriais do portal.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">10. Alteracoes dos termos</h2>
            <div className="bg-neutral-50 p-6 rounded-lg">
              <p className="text-neutral-600">
                Estes termos podem ser atualizados a qualquer momento. A versao mais recente sera
                sempre publicada nesta pagina.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">11. Legislacao aplicavel</h2>
            <div className="bg-neutral-50 p-6 rounded-lg">
              <p className="text-neutral-600">
                Estes termos seguem a legislacao brasileira, com foro da comarca do usuario para
                solucao de eventuais controversias.
              </p>
            </div>
          </section>

          <section className="bg-neutral-100 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <HelpCircle className="h-6 w-6 text-blue-500 mr-3" />
              <h2 className="text-2xl font-bold">Duvidas</h2>
            </div>
            <p className="text-neutral-600">
              Se precisar de ajuda sobre estes termos, entre em contato: termos@alpesnews.com.br.
            </p>
            <p className="text-sm text-neutral-500 mt-4">Ultima atualizacao: 29/04/2026</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
