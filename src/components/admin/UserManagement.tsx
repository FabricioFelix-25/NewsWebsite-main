import React, { useState, useEffect } from 'react';
import { User, Upload, Trash2, Edit, X } from 'lucide-react';
import { Author } from '../../types';
import { fetchAuthors, createAuthor, updateAuthor, deleteAuthor, uploadImage } from '../../api';

interface UserFormData {
  name: string;
  email: string;
  bio: string;
  avatarUrl: string;
}

const UserManagement: React.FC = () => {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    bio: '',
    avatarUrl: '',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    loadAuthors();
  }, []);

  useEffect(() => {
    if (editingAuthor) {
      setFormData({
        name: editingAuthor.name,
        email: editingAuthor.email,
        bio: editingAuthor.bio || '',
        avatarUrl: editingAuthor.avatarUrl,
      });
      setImagePreview(editingAuthor.avatarUrl);
    }
  }, [editingAuthor]);

  const loadAuthors = async () => {
    try {
      const authorsList = await fetchAuthors();
      setAuthors(authorsList);
    } catch (error) {
      console.error('Erro ao carregar autores:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const imageUrl = await uploadImage(file);
        setImagePreview(imageUrl);
        setFormData((prev) => ({ ...prev, avatarUrl: imageUrl }));
      } catch (error) {
        console.error('Erro ao enviar imagem:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAuthor) {
        await updateAuthor(editingAuthor.id, formData);
      } else {
        await createAuthor(formData);
      }

      await loadAuthors();
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar autor:', error);
    }
  };

  const handleEdit = (author: Author) => {
    setEditingAuthor(author);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este autor?')) {
      try {
        await deleteAuthor(id);
        await loadAuthors();
      } catch (error) {
        console.error('Erro ao excluir autor:', error);
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingAuthor(null);
    setFormData({
      name: '',
      email: '',
      bio: '',
      avatarUrl: '',
    });
    setImagePreview(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-800"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Gestao de autores</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary flex items-center">
          <User className="h-5 w-5 mr-2" />
          Novo autor
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">{editingAuthor ? 'Editar autor' : 'Cadastrar autor'}</h2>
            <button onClick={resetForm} className="p-2 hover:bg-neutral-100 rounded-full">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">Foto de perfil</label>
              <div className="flex items-center space-x-4">
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="h-20 w-20 rounded-full object-cover" />
                )}
                <label className="btn btn-outline flex items-center cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Enviar imagem
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Nome completo</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                className="input-field"
                rows={4}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button type="button" onClick={resetForm} className="btn btn-outline">
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                {editingAuthor ? 'Atualizar autor' : 'Salvar autor'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {authors.map((author) => (
            <div key={author.id} className="bg-neutral-50 rounded-lg p-4">
              <div className="flex items-center space-x-4">
                <img src={author.avatarUrl} alt={author.name} className="h-16 w-16 rounded-full object-cover" />
                <div className="flex-1">
                  <h3 className="font-medium">{author.name}</h3>
                  <p className="text-sm text-neutral-500">{author.email}</p>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => handleEdit(author)} className="p-2 hover:bg-neutral-200 rounded-full">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(author.id)}
                    className="p-2 hover:bg-neutral-200 rounded-full text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-neutral-600 mt-2 line-clamp-2">{author.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
