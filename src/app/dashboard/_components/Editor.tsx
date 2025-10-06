"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useState } from "react";

interface CustomEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function CustomEditor({
  value,
  onChange,
  placeholder,
}: CustomEditorProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder || "Type here...",
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose max-w-none focus:outline-none",
      },
    },
    // ✅ This is the correct placement
    immediatelyRender: false,
  });

  if (!isClient || !editor) return null;

  return (
    <div className="border rounded-md p-2">
      <EditorContent editor={editor} />
    </div>
  );
}
