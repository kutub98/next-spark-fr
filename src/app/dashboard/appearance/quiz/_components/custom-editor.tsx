// "use client";

// import { useQuill } from "react-quilljs";
// import "quill/dist/quill.snow.css";
// import "katex/dist/katex.min.css"; // Import KaTeX styles
// import katex from "katex";
// import { useEffect, useState } from "react";

// type CustomEditorProps = {
//   height?: string | number; // Make height optional with default "auto"
//   placeholder: string;
//   value: string;
//   onChange: (value: string) => void;
// };

// const CustomEditor = ({
//   height = "auto", // Default to "auto" for dynamic height
//   placeholder,
//   value,
//   onChange,
// }: CustomEditorProps) => {
//   const { quill, quillRef } = useQuill({
//     placeholder,
//     modules: {
//       toolbar: [
//         [
//           { font: [] },
//           // { size: [] }
//         ],
//         [{ header: [1, 2, 3, 4, 5, 6] }], // Add all headers from h1 to h6
//         ["bold", "italic", "underline", "strike"],
//         [{ color: [] }, { background: [] }],
//         [{ script: "sub" }, { script: "super" }],
//         [{ list: "ordered" }, { list: "bullet" }],
//         [{ indent: "-1" }, { indent: "+1" }],
//         [{ align: [] }],
//         ["link", "image", "video"],
//         ["formula"],
//         ["clean"],
//       ],
//     },
//     formats: [
//       "font",
//       "header",
//       "size",
//       "bold",
//       "italic",
//       "underline",
//       "strike",
//       "color",
//       "background",
//       "script",
//       "blockquote",
//       "code-block",
//       "list",
//       "indent",
//       "align",
//       "link",
//       "image",
//       "video",
//       "formula",
//     ],
//   });

//   // State to track whether it's mounted on the client-side
//   const [isClient, setIsClient] = useState(false);

//   useEffect(() => {
//     setIsClient(true);

//     if (isClient && window) {
//       (window as unknown as { katex: typeof katex }).katex = katex;
//     }
//   }, [isClient]);

//   useEffect(() => {
//     if (quill) {
//       // Sync the Quill editor value with the controlled component value
//       if (quill.root.innerHTML !== value) {
//         quill.root.innerHTML = value;
//       }
//       quill.on("text-change", () => {
//         let updatedContent = quill.root.innerHTML;
//         updatedContent = updatedContent.replace(/\$\$(.*?)\$\$/g, `\\($1\\)`);

//         if (!updatedContent.trim() || updatedContent === "<p><br></p>") {
//           updatedContent = ""; // Explicitly set to empty string
//         }

//         onChange(updatedContent.toString());
//       });
//     }
//   }, [quill, value, onChange]);

//   if (!isClient) {
//     return null;
//   }

//   return (
//     <div
//       style={{
//         height: height,
//         width: "100%",
//       }}
//     >
//       <div className="w-full h-full" ref={quillRef} />
//     </div>
//   );
// };

// export default CustomEditor;

"use client";

import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";
import "katex/dist/katex.min.css"; // Import KaTeX styles
import katex from "katex";
import { useEffect, useState } from "react";

type CustomEditorProps = {
  height?: string | number; // Optional height, defaults to "auto"
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
};

const CustomEditor = ({
  height = "auto", // Default to "auto" for dynamic height
  placeholder,
  value,
  onChange,
}: CustomEditorProps) => {
  const { quill, quillRef } = useQuill({
    placeholder,
    modules: {
      toolbar: [
        [
          { font: [] },
          // { size: [] }
        ],
        [{ header: [1, 2, 3, 4, 5, 6] }], // Add all headers from h1 to h6
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }],
        [{ script: "sub" }, { script: "super" }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ align: [] }],
        ["link", "image", "video"],
        ["formula"],
        ["clean"],
      ],
    },
    formats: [
      "font",
      "header",
      "size",
      "bold",
      "italic",
      "underline",
      "strike",
      "color",
      "background",
      "script",
      "blockquote",
      "code-block",
      "list",
      "indent",
      "align",
      "link",
      "image",
      "video",
      "formula",
    ],
  });

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    if (isClient && window) {
      (window as unknown as { katex: typeof katex }).katex = katex;
    }
  }, [isClient]);

  useEffect(() => {
    if (quill) {
      // Sync the Quill editor value with the controlled component value
      if (quill.root.innerHTML !== value) {
        quill.root.innerHTML = value;
      }
      quill.on("text-change", () => {
        let updatedContent = quill.root.innerHTML;
        updatedContent = updatedContent.replace(/\$\$(.*?)\$\$/g, `\\($1\\)`);

        if (!updatedContent.trim() || updatedContent === "<p><br></p>") {
          updatedContent = ""; // Explicitly set to empty string
        }

        onChange(updatedContent.toString());
      });

      // Ensure the Quill container adjusts height dynamically
      const updateHeight = () => {
        if (quillRef.current) {
          quillRef.current.style.height = "auto"; // Reset height
          const height = quillRef.current.scrollHeight; // Get content height
          quillRef.current.style.height = `${height}px`; // Set to content height
        }
      };
      quill.on("text-change", updateHeight);
      updateHeight(); // Initial height adjustment
    }
  }, [quill, value, onChange, quillRef]);

  if (!isClient) {
    return null;
  }

  return (
    <div
      style={{
        height: height === "auto" ? "auto" : height, // Use "auto" or specified height
        width: "auto",
        minHeight: "auto", // Minimum height to ensure visibility
        overflow: "hidden", // Allow content to overflow if needed
      }}
      className="custom-editor-container"
    >
      <div ref={quillRef} />
    </div>
  );
};

export default CustomEditor;
