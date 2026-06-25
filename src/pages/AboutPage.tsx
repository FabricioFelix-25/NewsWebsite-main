import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-8">Sobre o AlpesNews</h1>

      <div className="prose prose-lg max-w-none">
        <p className="text-xl text-neutral-600 mb-8">
          O AlpesNews e um portal focado em conteudo relevante sobre tecnologia, geopolitica,
          programacao e games. Nosso objetivo e transformar assuntos complexos em informacao clara,
          util e confiavel para o publico brasileiro.
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-4">Nossa missao</h2>
            <p className="text-neutral-600">
              Entregar cobertura de qualidade com contexto, dados e linguagem acessivel, ajudando
              o leitor a entender o que mudou, por que isso importa e qual pode ser o impacto.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-4">Nossos valores</h2>
            <ul className="space-y-2 text-neutral-600">
              <li>- Precisao e transparencia editorial</li>
              <li>- Agilidade com responsabilidade</li>
              <li>- Respeito a diferentes perspectivas</li>
              <li>- Evolucao continua da experiencia do leitor</li>
            </ul>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Frentes de cobertura</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <h3 className="text-xl font-bold text-blue-600 mb-2">Tecnologia</h3>
              <p className="text-neutral-600">IA, produtos, internet e tendencias</p>
            </div>
            <div className="text-center p-6 bg-amber-50 rounded-lg">
              <h3 className="text-xl font-bold text-amber-800 mb-2">Geopolitica</h3>
              <p className="text-neutral-600">Economia global, conflitos e diplomacia</p>
            </div>
            <div className="text-center p-6 bg-purple-50 rounded-lg">
              <h3 className="text-xl font-bold text-purple-600 mb-2">Programacao</h3>
              <p className="text-neutral-600">Web, mobile, DevOps e carreira dev</p>
            </div>
            <div className="text-center p-6 bg-pink-50 rounded-lg">
              <h3 className="text-xl font-bold text-pink-600 mb-2">Games</h3>
              <p className="text-neutral-600">Mercado, analises e lancamentos</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold mb-6">Fale com a gente</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-center">
              <Mail className="h-6 w-6 text-blue-500 mr-3" />
              <div>
                <h3 className="font-medium">Email</h3>
                <p className="text-neutral-600">contato@alpesnews.com.br</p>
              </div>
            </div>
            <div className="flex items-center">
              <Phone className="h-6 w-6 text-blue-500 mr-3" />
              <div>
                <h3 className="font-medium">Telefone</h3>
                <p className="text-neutral-600">+55 (71) 4000-1234</p>
              </div>
            </div>
            <div className="flex items-center">
              <MapPin className="h-6 w-6 text-blue-500 mr-3" />
              <div>
                <h3 className="font-medium">Localizacao</h3>
                <p className="text-neutral-600">Salvador - BA</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
