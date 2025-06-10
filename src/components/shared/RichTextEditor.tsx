
"use client";

import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import React, { useEffect } from 'react';
import { EditorToolbar } from './EditorToolbar';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  initialContent?: string;
  onUpdate: (htmlContent: string) => void;
  editable?: boolean;
  placeholder?: string;
  editorClassName?: string; // Class for the main wrapper around page and toolbar
  pageClassName?: string; // Class for the A4-like page
  contentClassName?: string; // Class for EditorContent/ProseMirror itself
}

export function RichTextEditor({
  initialContent = '',
  onUpdate,
  editable = true,
  placeholder = 'Comece a escrever aqui...',
  editorClassName,
  pageClassName,
  contentClassName,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
        // Disable other default block types if needed
      }),
      Underline,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: initialContent,
    editable,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert max-w-none focus:outline-none min-h-full',
          contentClassName
        ),
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onUpdate(currentEditor.getHTML());
    },
  });

  // Effect to update editor content when initialContent changes externally
  // and editor is not focused to avoid disrupting user input.
  useEffect(() => {
    if (editor && !editor.isDestroyed && initialContent !== editor.getHTML() && !editor.isFocused) {
      editor.commands.setContent(initialContent, false);
    }
  }, [initialContent, editor]);
  
  // Update editable status if prop changes
  useEffect(() => {
    if (editor && !editor.isDestroyed && editor.isEditable !== editable) {
      editor.setEditable(editable);
    }
  }, [editable, editor]);


  return (
    <div className={cn("rich-text-editor-wrapper bg-muted/40 p-4 rounded-md overflow-auto", editorClassName)}>
      {editable && <EditorToolbar editor={editor} />}
      <div 
        className={cn(
            "page-container mx-auto mt-4 bg-card text-card-foreground shadow-lg",
            "w-[794px] min-h-[1000px] p-16", // Approx A4: 210mm x 297mm at 96DPI -> ~794px x 1123px. Margins via padding.
                                           // Using min-h-[1000px] to give ample space, scrolling will handle overflow.
            pageClassName
        )}
      >
        <EditorContent editor={editor} className="h-full"/>
      </div>
    </div>
  );
}
