// ─────────────────────────────────────────────────────────────────────────────
// CVCoach UK — Client-side file extraction
// PDF.js for PDF, mammoth.js for DOCX. Nothing leaves the browser.
// ─────────────────────────────────────────────────────────────────────────────

declare global {
  interface Window {
    pdfjsLib: any;
    mammoth: any;
  }
}

async function loadPDFJS(): Promise<void> {
  if (window.pdfjsLib) return;
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      resolve();
    };
    script.onerror = () => reject(new Error("Failed to load PDF.js"));
    document.head.appendChild(script);
  });
}

export async function extractTextFromPDF(
  file: File,
  onProgress?: (page: number, total: number) => void
): Promise<string> {
  await loadPDFJS();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  let fullText = "";

  for (let i = 1; i <= numPages; i++) {
    onProgress?.(i, numPages);
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    const lineMap = new Map<number, { x: number; str: string }[]>();
    for (const item of content.items as any[]) {
      const bucket = Math.round(item.transform[5] / 2) * 2;
      if (!lineMap.has(bucket)) lineMap.set(bucket, []);
      lineMap.get(bucket)!.push({ x: item.transform[4], str: item.str });
    }

    const sortedLines = [...lineMap.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([, items]) =>
        items.sort((a, b) => a.x - b.x).map(i => i.str).join(" ").trim()
      )
      .filter(line => line.length > 0);

    fullText += sortedLines.join("\n") + "\n\n";
  }

  return fullText.trim();
}

async function loadMammoth(): Promise<void> {
  if (window.mammoth) return;
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load mammoth.js"));
    document.head.appendChild(script);
  });
}

export async function extractTextFromDOCX(file: File): Promise<string> {
  await loadMammoth();
  const arrayBuffer = await file.arrayBuffer();
  const result = await window.mammoth.extractRawValue({ arrayBuffer });
  if (result.value && result.value.trim().length > 50) {
    return result.value.trim();
  }
  throw new Error("mammoth extracted no usable text from this DOCX file.");
}

export async function extractTextFromFile(
  file: File,
  onProgress?: (page: number, total: number) => void
): Promise<string> {
  const name = file.name.toLowerCase();

  if (file.type === "application/pdf" || name.endsWith(".pdf")) {
    return extractTextFromPDF(file, onProgress);
  }

  if (
    name.endsWith(".docx") ||
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return extractTextFromDOCX(file);
  }

  if (name.endsWith(".doc")) {
    throw new Error(
      "Legacy .doc files are not supported. Please save your CV as .docx or PDF and re-upload."
    );
  }

  return file.text();
}
