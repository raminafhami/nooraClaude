"use client";

import { Editor, type IAllProps } from "@tinymce/tinymce-react";
import { useRef } from "react";
import { Editor as TinyMCEEditor } from "tinymce";

interface Props extends IAllProps {
  id: string;
  value: string | undefined;
  onMutate: (value: string) => Promise<void> | void;
}

export function TinyEditor({ id, init, value, onMutate, ...props }: Props) {
  const editorRef = useRef<TinyMCEEditor | null>(null);
  return (
    <Editor
      id={id}
      textareaName={id}
      tinymceScriptSrc={
        process.env.NEXT_PUBLIC_APP_URL + "/libs/tinymce/tinymce.min.js"
      }
      onEditorChange={async (a) => {
        await onMutate(a);
      }}
      value={value}
      onInit={(evt, editor) => {
        editorRef.current = editor;
        editorRef.current.targetElm.classList.add("template-custom");
      }}
      init={{
        table_default_attributes: {
          border: "1",
        },
        menubar: false,
        plugins: [
          "advlist",
          "autolink",
          "directionality",
          "lists",
          "link",
          "image",
          "charmap",
          "anchor",
          "searchreplace",
          "visualblocks",
          "code",
          "fullscreen",
          "insertdatetime",
          "media",
          "table",
          "preview",
          "help",
          "wordcount",
        ],
        toolbar:
          "ltr rtl table undo redo | blocks | " +
          "bold italic forecolor | alignleft aligncenter " +
          "alignright alignjustify | bullist numlist outdent indent | " +
          "removeformat | code",
        // Self-hosted (was a Google Fonts @import) so the editor iframe
        // doesn't depend on reaching fonts.googleapis.com.
        content_style: `
          @font-face { font-family: 'Vazirmatn'; font-weight: 400; font-style: normal; src: url('${process.env.NEXT_PUBLIC_APP_URL}/fonts/vazirmatn/Vazirmatn-Regular.woff2') format('woff2'); }
          @font-face { font-family: 'Vazirmatn'; font-weight: 700; font-style: normal; src: url('${process.env.NEXT_PUBLIC_APP_URL}/fonts/vazirmatn/Vazirmatn-Bold.woff2') format('woff2'); }
          body { direction: rtl; font-family: 'Vazirmatn'; font-size: 14px }
        `,
        ...(init ?? {}),
      }}
      {...props}
    />
  );
}
