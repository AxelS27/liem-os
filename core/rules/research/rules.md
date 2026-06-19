# Research Rules

These rules govern all data gathering, analysis, and research tasks in Liem OS.

## 1. Evidence-First Approach
- Always gather research and evidence before writing reports, proposals, or plans.
- When searching, prioritize neutral, reputable, and official sources.

## 2. File Conversion & Processing
- **Microsoft MarkItDown**: When research involves non-markdown sources (PDF, DOCX, XLSX, HTML, PPTX), you **MUST** convert them to markdown using the `markitdown` tool managed by `uv`:
  ```bash
  uv run markitdown <input_file> > <output_file.md>
  ```
- Always read and analyze the converted markdown file. Do not attempt to parse binary files directly.

## 3. Facts & Citations
- **Anti-Fabrication**: You must never invent facts, user numbers, company metrics, or quotes. Every statistic must be traced to a real source.
- **Explicit Citations**: Every research report must include a detailed source log mapping findings to their exact file paths, line ranges, or URLs.
- **Inference vs. Fact**: Clearly separate confirmed facts from logical deductions or speculative suggestions.
