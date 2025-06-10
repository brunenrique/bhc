
"use client";

import type { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  Undo,
  Redo,
} from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

type Props = {
  editor: Editor | null;
  className?: string;
};

export function EditorToolbar({ editor, className }: Props) {
  if (!editor) {
    return null;
  }

  const toolbarButtonClass = "h-8 w-8 p-1.5 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground";

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1 rounded-t-md border border-input bg-card p-2 sticky top-0 z-10",
        className
      )}
    >
      <Toggle
        size="sm"
        pressed={editor.isActive('bold')}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
        className={toolbarButtonClass}
        aria-label="Bold"
      >
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('italic')}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        className={toolbarButtonClass}
        aria-label="Italic"
      >
        <Italic className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('underline')}
        onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
        className={toolbarButtonClass}
        aria-label="Underline"
      >
        <Underline className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('strike')}
        onPressedChange={() => editor.chain().focus().toggleStrike().run()}
        className={toolbarButtonClass}
        aria-label="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </Toggle>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <Toggle
        size="sm"
        pressed={editor.isActive('heading', { level: 1 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={toolbarButtonClass}
        aria-label="Heading 1"
      >
        <Heading1 className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('heading', { level: 2 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={toolbarButtonClass}
        aria-label="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('heading', { level: 3 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={toolbarButtonClass}
        aria-label="Heading 3"
      >
        <Heading3 className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('heading', { level: 4 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
        className={toolbarButtonClass}
        aria-label="Heading 4"
      >
        <Heading4 className="h-4 w-4" />
      </Toggle>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <Toggle
        size="sm"
        pressed={editor.isActive('bulletList')}
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
        className={toolbarButtonClass}
        aria-label="Bullet List"
      >
        <List className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('orderedList')}
        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
        className={toolbarButtonClass}
        aria-label="Ordered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Toggle>
      
      <Separator orientation="vertical" className="h-6 mx-1" />

      <Toggle
        size="sm"
        onPressedChange={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className={toolbarButtonClass}
        aria-label="Undo"
      >
        <Undo className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        onPressedChange={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className={toolbarButtonClass}
        aria-label="Redo"
      >
        <Redo className="h-4 w-4" />
      </Toggle>
    </div>
  );
}
