import React, { useState } from 'react';
import { Mail, MessageSquare, User } from 'lucide-react';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-8">Contato</h1>

      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <div className="prose prose-lg">
            <p className="text-neutral-600 mb-8">
              Tem alguma duvida, sugestao de pauta ou quer contribuir com o AlpesNews?
              Envie sua mensagem que nossa equipe responde o mais rapido possivel.
            </p>
          </div>

          <div className="space-y-6 mb-8">
            <div className="flex items-center p-4 bg-white rounded-lg shadow-sm">
              <Mail className="h-6 w-6 text-blue-500 mr-3" />
              <div>
                <h3 className="font-medium">Email</h3>
                <p className="text-neutral-600">contato@alpesnews.com.br</p>
              </div>
            </div>

            <div className="flex items-center p-4 bg-white rounded-lg shadow-sm">
              <MessageSquare className="h-6 w-6 text-blue-500 mr-3" />
              <div>
                <h3 className="font-medium">Atendimento</h3>
                <p className="text-neutral-600">Seg a Sex, das 9h as 18h (BRT)</p>
              </div>
            </div>
          </div>

          <div className="bg-neutral-100 p-6 rounded-lg">
            <h3 className="font-bold mb-4">Horario de atendimento</h3>
            <div className="space-y-2 text-neutral-600">
              <p>Segunda a sexta: 09:00 - 18:00</p>
              <p>Sabado: 10:00 - 14:00</p>
              <p>Domingo: fechado</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold mb-6">Envie sua mensagem</h2>

          {submitStatus === 'success' && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-md">
              Mensagem enviada com sucesso. Em breve retornaremos.
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
              Nao foi possivel enviar sua mensagem. Tente novamente.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1">
                Nome
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="pl-10 input-field"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="pl-10 input-field"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-neutral-700 mb-1">
                Assunto
              </label>
              <input
                type="text"
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                className="input-field"
                required
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-neutral-700 mb-1">
                Mensagem
              </label>
              <textarea
                id="message"
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                className="input-field"
                required
              ></textarea>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full btn btn-primary">
              {isSubmitting ? 'Enviando...' : 'Enviar mensagem'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
