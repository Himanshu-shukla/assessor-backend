import { PDFExtract } from "pdf.js-extract";

export async function extractPdfText(buffer: Buffer): Promise<string> {
  const pdfExtract = new PDFExtract();

  return new Promise((resolve, reject) => {
    pdfExtract.extractBuffer(buffer, {}, (err, data) => {
      if (err) return reject(err);
      
      let text = "";
      data?.pages.forEach(page => {
        page.content.forEach(item => {
          text += item.str + " ";
        });
      });
      resolve(text);
    });
  });
}