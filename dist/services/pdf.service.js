"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractPdfText = extractPdfText;
const pdf_js_extract_1 = require("pdf.js-extract");
async function extractPdfText(buffer) {
    const pdfExtract = new pdf_js_extract_1.PDFExtract();
    return new Promise((resolve, reject) => {
        pdfExtract.extractBuffer(buffer, {}, (err, data) => {
            if (err)
                return reject(err);
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
//# sourceMappingURL=pdf.service.js.map