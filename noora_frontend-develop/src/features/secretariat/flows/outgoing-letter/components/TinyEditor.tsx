"use client";

import { useRef } from "react";
import { ControllerRenderProps } from "react-hook-form";
import { Editor as TinyMceEditor } from "tinymce";

import { Editor, IAllProps } from "@tinymce/tinymce-react";

type TinyEditorProps = IAllProps &
	ControllerRenderProps<Record<string, string>> & {};

function TinyEditor({
	id,
	init,
	value,
	onBlur,
	onChange,
	...props
}: TinyEditorProps) {
	const editorRef = useRef<TinyMceEditor>();

	return (
		<Editor
			id={id}
			textareaName={id}
			tinymceScriptSrc={
				process.env.NEXT_PUBLIC_APP_URL + "/libs/tinymce/tinymce.min.js"
			}
			onEditorChange={async (value) => {
				await onChange(value);
			}}
			value={value}
			onInit={(event, editor) => {
				editorRef.current = editor;
				editorRef.current.targetElm.classList.add("template-custom");
			}}
			onBlur={() => {
				if (!editorRef.current?.queryCommandState("JustifyFull")) {
					// editorRef.current?.focus();
					editorRef.current?.selection.select(
						editorRef.current?.getBody(),
						true,
					);
					editorRef.current?.execCommand("JustifyFull");
					// editorRef.current?.selection.collapse(false);
				}

				onBlur?.();
			}}
			init={{
				table_default_attributes: {
					border: "1",
					cellspacing: "0",
					cellpadding: "0",
				},

				paste_retain_style_properties: "border-collapse",

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
					"pasteword",
				],

				toolbar: [
					"fontfamily fontsize | bold italic | backcolor forecolor",
					"ltr rtl | alignleft aligncenter alignright alignjustify | outdent indent | bullist numlist",
					"table | undo redo | fullscreen removeformat | code",
				],

				content_css: [],
				content_style:
					"@import url('https://cdn.naitco.ir/fonts/vazirmatn/non-latin/font-face.css'); @import url('https://cdn.naitco.ir/fonts/vazirmatn/farsi-digits-non-latin/font-face.css'); body { direction: rtl; font-family:'Vazirmatn'; font-size: 13px; line-height: 22px; } p { margin: 0; } p:not(:last-child) { margin-bottom: 6px; }",

				font_size_formats:
					"8px 9px 10px 11px 12px 13px 14px 16px 18px 24px 36px 48px",

				font_family_formats:
					"Vazirmatn NL='Vazirmatn';Vazirmatn FD NL='Vazirmatn FD NL';",

				...(init ?? {}),
			}}
			{...props}
		/>
	);
}

export { TinyEditor };
