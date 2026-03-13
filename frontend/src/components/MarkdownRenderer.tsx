import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

interface MarkdownRendererProps {
  content: string;
}

function preprocessMath(text: string) {
  return text
    .replace(/(?<!\\)int_/g, "\\int_")
    .replace(/(?<!\\)\bsin\b/g, "\\sin")
    .replace(/(?<!\\)\bcosh\b/g, "\\cosh")
    .replace(/(?<!\\)\bcos\b/g, "\\cos");
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {preprocessMath(content)}
      </ReactMarkdown>
    </div>
  );
}
