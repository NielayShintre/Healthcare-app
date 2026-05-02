import fitz  # PyMuPDF

class DocumentExtractor:
    def extract_text_from_pdf(self, stream: bytes) -> str:
        """
        Extracts raw text from a PDF byte stream.
        """
        try:
            doc = fitz.open(stream=stream, filetype="pdf")
            text = ""
            for page in doc:
                text += page.get_text()
            return text
        except Exception as e:
            print(f"Error extracting text from PDF: {e}")
            return ""
