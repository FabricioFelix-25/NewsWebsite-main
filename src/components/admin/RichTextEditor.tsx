import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Bold, Italic, Underline, Link as LinkIcon, Image as ImageIcon, List, ListOrdered, 
  AlignLeft, AlignCenter, AlignRight, Heading1, Heading2, 
  Quote, Video, Code2, Upload, Globe, X, Check, Loader2,
  Trash2, Edit3
} from 'lucide-react';
import { uploadImage } from '../../api';

interface RichTextEditorProps {
  initialValue: string;
  onChange: (value: string) => void;
}

interface SelectedImageState {
  img: HTMLImageElement;
  figure: HTMLElement;
  src: string;
  alt: string;
  caption: string;
  align: 'full' | 'center' | 'left' | 'right';
  top: number;
  left: number;
  width: number;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ initialValue, onChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [htmlContent, setHtmlContent] = useState(initialValue);

  const [selectedImage, setSelectedImage] = useState<SelectedImageState | null>(null);
  const [isEditingExistingImage, setIsEditingExistingImage] = useState(false);

  const [imageTab, setImageTab] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [imageAlign, setImageAlign] = useState<'full' | 'center' | 'left' | 'right'>('full');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const [videoUrl, setVideoUrl] = useState('');
  const [videoError, setVideoError] = useState('');

  useEffect(() => {
    if (editorRef.current && !isHtmlMode) {
      if (editorRef.current.innerHTML !== initialValue) {
        editorRef.current.innerHTML = initialValue;
      }
    }
    setHtmlContent(initialValue);
  }, [initialValue, isHtmlMode]);

  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  }, []);

  const restoreSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && savedRangeRef.current && editorRef.current) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      const newHtml = editorRef.current.innerHTML;
      setHtmlContent(newHtml);
      onChange(newHtml);
      saveSelection();
    }
  };

  const execCommand = (command: string, value: string | null = null) => {
    if (isHtmlMode) return;
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
    }
  };

  const detectAlignment = (figure: HTMLElement): 'full' | 'center' | 'left' | 'right' => {
    const className = figure.className || '';
    if (className.includes('float-left')) return 'left';
    if (className.includes('float-right')) return 'right';
    if (className.includes('mx-auto') || className.includes('text-center')) return 'center';
    return 'full';
  };

  const updateSelectedImagePosition = useCallback((targetImg: HTMLImageElement) => {
    if (!containerRef.current) return;
    let figure = targetImg.closest('figure') as HTMLElement | null;
    if (!figure) {
      const parent = targetImg.parentNode;
      if (parent) {
        figure = document.createElement('figure');
        figure.className = 'my-6 w-full clear-both';
        parent.insertBefore(figure, targetImg);
        figure.appendChild(targetImg);
        handleInput();
      }
    }
    if (!figure) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const imgRect = targetImg.getBoundingClientRect();
    const figcaption = figure.querySelector('figcaption');
    setSelectedImage({
      img: targetImg,
      figure: figure,
      src: targetImg.src || '',
      alt: targetImg.alt || '',
      caption: figcaption ? figcaption.textContent || '' : '',
      align: detectAlignment(figure),
      top: imgRect.top - containerRect.top + containerRef.current.scrollTop,
      left: imgRect.left - containerRect.left,
      width: imgRect.width,
    });
  }, []);

  const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG') {
      updateSelectedImagePosition(target as HTMLImageElement);
    } else if (!target.closest('.image-action-toolbar')) {
      setSelectedImage(null);
    }
  };

  const applyAlignmentToSelected = (align: 'full' | 'center' | 'left' | 'right') => {
    if (!selectedImage) return;
    const { figure, img } = selectedImage;
    if (align === 'left') {
      figure.className = 'my-4 float-left mr-6 mb-4 max-w-[280px] sm:max-w-xs clear-left';
      img.className = 'w-full rounded-xl shadow-md object-cover max-h-[320px]';
    } else if (align === 'right') {
      figure.className = 'my-4 float-right ml-6 mb-4 max-w-[280px] sm:max-w-xs clear-right';
      img.className = 'w-full rounded-xl shadow-md object-cover max-h-[320px]';
    } else if (align === 'center') {
      figure.className = 'my-6 max-w-lg mx-auto clear-both text-center';
      img.className = 'w-full rounded-xl shadow-md object-cover max-h-[420px] mx-auto';
    } else {
      figure.className = 'my-6 w-full clear-both';
      img.className = 'w-full rounded-xl shadow-md object-cover max-h-[520px]';
    }
    handleInput();
    updateSelectedImagePosition(img);
  };

  const handleDeleteSelectedImage = () => {
    if (!selectedImage) return;
    selectedImage.figure.remove();
    setSelectedImage(null);
    handleInput();
  };

  const handleEditSelectedImage = () => {
    if (!selectedImage) return;
    setImageUrl(selectedImage.src);
    setImageAlt(selectedImage.alt);
    setImageCaption(selectedImage.caption);
    setImageAlign(selectedImage.align);
    setImageTab('url');
    setUploadError('');
    setIsEditingExistingImage(true);
    setIsImageModalOpen(true);
  };

  const openNewImageModal = () => {
    saveSelection();
    setImageUrl('');
    setImageCaption('');
    setImageAlt('');
    setImageAlign('full');
    setUploadError('');
    setIsEditingExistingImage(false);
    setIsImageModalOpen(true);
  };

  const insertHtmlAtCursor = (htmlToInsert: string) => {
    if (isHtmlMode) {
      const updated = htmlContent + '\n' + htmlToInsert;
      setHtmlContent(updated);
      onChange(updated);
      return;
    }
    if (editorRef.current) {
      editorRef.current.focus();
      restoreSelection();
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && editorRef.current.contains(sel.anchorNode)) {
        const range = sel.getRangeAt(0);
        range.deleteContents();
        const tempEl = document.createElement('div');
        tempEl.innerHTML = htmlToInsert;
        const frag = document.createDocumentFragment();
        let node: Node | null;
        let lastNode: Node | null = null;
        while ((node = tempEl.firstChild)) lastNode = frag.appendChild(node);
        range.insertNode(frag);
        if (lastNode) {
          const newRange = document.createRange();
          newRange.setStartAfter(lastNode);
          newRange.collapse(true);
          sel.removeAllRanges();
          sel.addRange(newRange);
          savedRangeRef.current = newRange;
        }
      } else {
        editorRef.current.innerHTML += htmlToInsert;
      }
      handleInput();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setUploadError('');
    try {
      const url = await uploadImage(file);
      setImageUrl(url);
      if (!imageAlt) setImageAlt(file.name.replace(/\.[^/.]+$/, ''));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Falha ao enviar arquivo.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) {
      setUploadError('Informe uma imagem válida ou envie um arquivo.');
      return;
    }
    const altText = imageAlt.trim() || 'Imagem da matéria';
    const captionHtml = imageCaption.trim()
      ? `<figcaption class="text-center text-xs text-neutral-500 mt-2 italic">${imageCaption.trim()}</figcaption>`
      : '';

    if (isEditingExistingImage && selectedImage) {
      const { figure, img } = selectedImage;
      img.src = imageUrl.trim();
      img.alt = altText;
      let figcaption = figure.querySelector('figcaption');
      if (imageCaption.trim()) {
        if (!figcaption) {
          figcaption = document.createElement('figcaption');
          figure.appendChild(figcaption);
        }
        figcaption.className = 'text-center text-xs text-neutral-500 mt-2 italic';
        figcaption.textContent = imageCaption.trim();
      } else if (figcaption) {
        figcaption.remove();
      }
      applyAlignmentToSelected(imageAlign);
      setIsImageModalOpen(false);
      return;
    }

    let figureClass = 'my-6 w-full clear-both';
    let imgClass = 'w-full rounded-xl shadow-md object-cover max-h-[500px]';
    if (imageAlign === 'center') {
      figureClass = 'my-6 max-w-lg mx-auto clear-both text-center';
      imgClass = 'w-full rounded-xl shadow-md object-cover max-h-[420px] mx-auto';
    } else if (imageAlign === 'left') {
      figureClass = 'my-4 float-left mr-6 mb-4 max-w-[280px] sm:max-w-xs clear-left';
      imgClass = 'w-full rounded-xl shadow-md object-cover max-h-[300px]';
    } else if (imageAlign === 'right') {
      figureClass = 'my-4 float-right ml-6 mb-4 max-w-[280px] sm:max-w-xs clear-right';
      imgClass = 'w-full rounded-xl shadow-md object-cover max-h-[300px]';
    }

    const figureHtml = `<figure class="${figureClass}"><img src="${imageUrl.trim()}" alt="${altText}" class="${imgClass}" />${captionHtml}</figure><p><br></p>`;
    insertHtmlAtCursor(figureHtml);
    setIsImageModalOpen(false);
  };

  const openVideoModal = () => {
    saveSelection();
    setVideoUrl('');
    setVideoError('');
    setIsVideoModalOpen(true);
  };

  const handleConfirmVideo = (e: React.FormEvent) => {
    e.preventDefault();
    const url = videoUrl.trim();
    if (!url) return;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (!match || !match[1]) {
      setVideoError('URL do YouTube inválida.');
      return;
    }
    const embedHtml = `<div class="my-6 aspect-video rounded-xl overflow-hidden shadow-md"><iframe class="w-full h-full" src="https://www.youtube.com/embed/${match[1]}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div><p><br></p>`;
    insertHtmlAtCursor(embedHtml);
    setIsVideoModalOpen(false);
  };

  const handleLink = () => {
    saveSelection();
    const url = prompt('Cole o link (URL):');
    if (url) execCommand('createLink', url);
  };

  const toggleHtmlMode = () => {
    if (isHtmlMode) {
      if (editorRef.current) editorRef.current.innerHTML = htmlContent;
      onChange(htmlContent);
      setIsHtmlMode(false);
    } else {
      if (editorRef.current) setHtmlContent(editorRef.current.innerHTML);
      setIsHtmlMode(true);
    }
    setSelectedImage(null);
  };

  return (
    <div ref={containerRef} className="relative border border-neutral-300 rounded-xl overflow-visible shadow-sm bg-white" dir="ltr">
      <div className="bg-neutral-50 border-b border-neutral-200 p-2 flex flex-wrap items-center gap-1 rounded-t-xl sticky top-0 z-20">
        <button type="button" onClick={() => execCommand('bold')} className="p-2 hover:bg-neutral-200 rounded-md text-neutral-700" title="Negrito" disabled={isHtmlMode}><Bold className="h-4 w-4" /></button>
        <button type="button" onClick={() => execCommand('italic')} className="p-2 hover:bg-neutral-200 rounded-md text-neutral-700" title="Itálico" disabled={isHtmlMode}><Italic className="h-4 w-4" /></button>
        <button type="button" onClick={() => execCommand('underline')} className="p-2 hover:bg-neutral-200 rounded-md text-neutral-700" title="Sublinhado" disabled={isHtmlMode}><Underline className="h-4 w-4" /></button>
        <div className="h-5 w-px bg-neutral-300 mx-1"></div>
        <button type="button" onClick={() => execCommand('formatBlock', '<h2>')} className="p-2 hover:bg-neutral-200 rounded-md text-neutral-700" title="Subtítulo" disabled={isHtmlMode}><Heading1 className="h-4 w-4" /></button>
        <button type="button" onClick={() => execCommand('formatBlock', '<h3>')} className="p-2 hover:bg-neutral-200 rounded-md text-neutral-700" title="Intertítulo" disabled={isHtmlMode}><Heading2 className="h-4 w-4" /></button>
        <button type="button" onClick={() => execCommand('formatBlock', '<blockquote>')} className="p-2 hover:bg-neutral-200 rounded-md text-neutral-700" title="Citação" disabled={isHtmlMode}><Quote className="h-4 w-4" /></button>
        <div className="h-5 w-px bg-neutral-300 mx-1"></div>
        <button type="button" onClick={() => execCommand('insertUnorderedList')} className="p-2 hover:bg-neutral-200 rounded-md text-neutral-700" title="Lista" disabled={isHtmlMode}><List className="h-4 w-4" /></button>
        <button type="button" onClick={() => execCommand('insertOrderedList')} className="p-2 hover:bg-neutral-200 rounded-md text-neutral-700" title="Lista Numerada" disabled={isHtmlMode}><ListOrdered className="h-4 w-4" /></button>
        <div className="h-5 w-px bg-neutral-300 mx-1"></div>
        <button type="button" onClick={() => execCommand('justifyLeft')} className="p-2 hover:bg-neutral-200 rounded-md text-neutral-700" title="Alinhar Esquerda" disabled={isHtmlMode}><AlignLeft className="h-4 w-4" /></button>
        <button type="button" onClick={() => execCommand('justifyCenter')} className="p-2 hover:bg-neutral-200 rounded-md text-neutral-700" title="Centralizar" disabled={isHtmlMode}><AlignCenter className="h-4 w-4" /></button>
        <button type="button" onClick={() => execCommand('justifyRight')} className="p-2 hover:bg-neutral-200 rounded-md text-neutral-700" title="Alinhar Direita" disabled={isHtmlMode}><AlignRight className="h-4 w-4" /></button>
        <div className="h-5 w-px bg-neutral-300 mx-1"></div>
        <button type="button" onClick={handleLink} className="p-2 hover:bg-neutral-200 rounded-md text-neutral-700" title="Link" disabled={isHtmlMode}><LinkIcon className="h-4 w-4" /></button>
        <button type="button" onClick={openNewImageModal} className="px-2.5 py-1.5 bg-blue-50 text-blue-700 font-medium text-xs rounded-md border border-blue-200 flex items-center gap-1.5"><ImageIcon className="h-4 w-4" /> Imagem</button>
        <button type="button" onClick={openVideoModal} className="px-2.5 py-1.5 bg-neutral-100 text-neutral-700 font-medium text-xs rounded-md border border-neutral-300 flex items-center gap-1.5"><Video className="h-4 w-4 text-red-600" /> Vídeo</button>
        <button type="button" onClick={toggleHtmlMode} className={`ml-auto px-3 py-1.5 text-xs font-semibold rounded-md ${isHtmlMode ? 'bg-neutral-900 text-white' : 'bg-white border border-neutral-300'}`}><Code2 className="h-3.5 w-3.5" /> {isHtmlMode ? 'Visual' : 'HTML'}</button>
      </div>

      {selectedImage && !isHtmlMode && (
        <div className="image-action-toolbar bg-neutral-900 text-white px-3 py-2 border-b border-neutral-700 flex flex-wrap items-center gap-2 text-xs z-10">
          <span className="text-blue-400">Imagem:</span>
          <div className="flex gap-1 bg-neutral-800 p-0.5 rounded-lg border border-neutral-700">
            <button onClick={() => applyAlignmentToSelected('left')} className={`px-2 py-1 rounded ${selectedImage.align === 'left' ? 'bg-blue-600' : ''}`}>Esquerda</button>
            <button onClick={() => applyAlignmentToSelected('center')} className={`px-2 py-1 rounded ${selectedImage.align === 'center' ? 'bg-blue-600' : ''}`}>Centro</button>
            <button onClick={() => applyAlignmentToSelected('full')} className={`px-2 py-1 rounded ${selectedImage.align === 'full' ? 'bg-blue-600' : ''}`}>Total</button>
            <button onClick={() => applyAlignmentToSelected('right')} className={`px-2 py-1 rounded ${selectedImage.align === 'right' ? 'bg-blue-600' : ''}`}>Direita</button>
          </div>
          <button onClick={handleEditSelectedImage} className="px-2.5 py-1 bg-neutral-800 text-yellow-400 border border-neutral-700 rounded"><Edit3 className="h-3 w-3 inline" /></button>
          <button onClick={handleDeleteSelectedImage} className="px-2.5 py-1 bg-red-900 text-red-300 border border-red-800 rounded"><Trash2 className="h-3 w-3 inline" /></button>
        </div>
      )}

      {isHtmlMode ? (
        <textarea value={htmlContent} onChange={(e) => { setHtmlContent(e.target.value); onChange(e.target.value); }} className="w-full p-4 font-mono text-sm min-h-[450px] bg-neutral-900 text-neutral-100 rounded-b-xl" />
      ) : (
        <div ref={editorRef} onClick={handleEditorClick} className="p-6 min-h-[450px] focus:outline-none prose max-w-none bg-white rounded-b-xl" contentEditable onInput={handleInput} onKeyUp={saveSelection} onMouseUp={saveSelection} style={{ unicodeBidi: 'plaintext', direction: 'ltr', textAlign: 'left' }} />
      )}

      {isImageModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <h3 className="font-bold text-lg mb-4">{isEditingExistingImage ? 'Editar Imagem' : 'Inserir Imagem'}</h3>
            <div className="flex bg-neutral-100 p-1 rounded-lg mb-4">
              <button onClick={() => setImageTab('upload')} className={`flex-1 py-1 rounded ${imageTab === 'upload' ? 'bg-white shadow' : ''}`}>Upload</button>
              <button onClick={() => setImageTab('url')} className={`flex-1 py-1 rounded ${imageTab === 'url' ? 'bg-white shadow' : ''}`}>URL</button>
            </div>
            {imageTab === 'upload' ? (
              <label className="border-2 border-dashed border-neutral-300 rounded-xl p-6 flex flex-col items-center cursor-pointer">
                <Upload className="h-8 w-8 text-neutral-400 mb-2" />
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                <span>Escolher arquivo</span>
              </label>
            ) : (
              <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="https://..." />
            )}
            <input type="text" value={imageCaption} onChange={(e) => setImageCaption(e.target.value)} className="w-full mt-3 px-3 py-2 border rounded-lg" placeholder="Legenda" />
            <div className="mt-4 flex gap-2">
              <button onClick={() => setIsImageModalOpen(false)} className="px-4 py-2 text-sm text-neutral-600">Cancelar</button>
              <button onClick={handleConfirmImage} className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg">{isEditingExistingImage ? 'Salvar' : 'Inserir'}</button>
            </div>
          </div>
        </div>
      )}

      {isVideoModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="font-bold text-lg mb-4">Inserir Vídeo</h3>
            <input type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="URL do YouTube" />
            {videoError && <p className="text-red-600 text-xs mt-2">{videoError}</p>}
            <div className="mt-4 flex gap-2">
              <button onClick={() => setIsVideoModalOpen(false)} className="px-4 py-2 text-sm text-neutral-600">Cancelar</button>
              <button onClick={handleConfirmVideo} className="px-5 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg">Inserir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;