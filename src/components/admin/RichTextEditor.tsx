import React, { useState, useRef, useEffect } from 'react';
import { 
  Bold, Italic, Underline, Link, Image, List, ListOrdered, 
  AlignLeft, AlignCenter, AlignRight, Heading1, Heading2, 
  Quote, Code 
} from 'lucide-react';

interface RichTextEditorProps {
  initialValue: string;
  onChange: (value: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ initialValue, onChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const editorElement = editorRef.current;
    if (editorElement) {
      editorElement.innerHTML = initialValue;
      // Set default paragraph direction
      document.execCommand('defaultParagraphSeparator', false, 'p');
      // Force LTR text direction
      document.execCommand('styleWithCSS', false, 'true');
      document.execCommand('direction', false, 'ltr');
    }
  }, [initialValue]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value: string | null = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const handleImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      execCommand('insertImage', url);
    }
  };

  return (
    <div className="border border-neutral-300 rounded-md overflow-hidden" dir="ltr">
      <div className="bg-neutral-50 border-b border-neutral-300 p-2 flex flex-wrap gap-1">
        <button 
          type="button" 
          onClick={() => execCommand('bold')}
          className="p-2 hover:bg-neutral-200 rounded-md"
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button 
          type="button" 
          onClick={() => execCommand('italic')}
          className="p-2 hover:bg-neutral-200 rounded-md"
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button 
          type="button" 
          onClick={() => execCommand('underline')}
          className="p-2 hover:bg-neutral-200 rounded-md"
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </button>
        <div className="h-6 w-px bg-neutral-300 mx-1"></div>
        <button 
          type="button" 
          onClick={() => execCommand('formatBlock', '<h1>')}
          className="p-2 hover:bg-neutral-200 rounded-md"
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </button>
        <button 
          type="button" 
          onClick={() => execCommand('formatBlock', '<h2>')}
          className="p-2 hover:bg-neutral-200 rounded-md"
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </button>
        <button 
          type="button" 
          onClick={() => execCommand('formatBlock', '<blockquote>')}
          className="p-2 hover:bg-neutral-200 rounded-md"
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </button>
        <button 
          type="button" 
          onClick={() => execCommand('formatBlock', '<pre>')}
          className="p-2 hover:bg-neutral-200 rounded-md"
          title="Code"
        >
          <Code className="h-4 w-4" />
        </button>
        <div className="h-6 w-px bg-neutral-300 mx-1"></div>
        <button 
          type="button" 
          onClick={() => execCommand('insertUnorderedList')}
          className="p-2 hover:bg-neutral-200 rounded-md"
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </button>
        <button 
          type="button" 
          onClick={() => execCommand('insertOrderedList')}
          className="p-2 hover:bg-neutral-200 rounded-md"
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <div className="h-6 w-px bg-neutral-300 mx-1"></div>
        <button 
          type="button" 
          onClick={() => execCommand('justifyLeft')}
          className="p-2 hover:bg-neutral-200 rounded-md"
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </button>
        <button 
          type="button" 
          onClick={() => execCommand('justifyCenter')}
          className="p-2 hover:bg-neutral-200 rounded-md"
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </button>
        <button 
          type="button" 
          onClick={() => execCommand('justifyRight')}
          className="p-2 hover:bg-neutral-200 rounded-md"
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </button>
        <div className="h-6 w-px bg-neutral-300 mx-1"></div>
        <button 
          type="button" 
          onClick={handleLink}
          className="p-2 hover:bg-neutral-200 rounded-md"
          title="Insert Link"
        >
          <Link className="h-4 w-4" />
        </button>
        <button 
          type="button" 
          onClick={handleImage}
          className="p-2 hover:bg-neutral-200 rounded-md"
          title="Insert Image"
        >
          <Image className="h-4 w-4" />
        </button>
      </div>
      <div
        ref={editorRef}
        className="p-4 min-h-[300px] focus:outline-none prose prose-sm max-w-none"
        contentEditable
        onInput={handleInput}
        dir="ltr"
        style={{ 
          unicodeBidi: 'plaintext',
          direction: 'ltr',
          textAlign: 'left'
        }}
      ></div>
    </div>
  );
};

export default RichTextEditor;