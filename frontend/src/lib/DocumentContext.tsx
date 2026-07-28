import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { api } from "./api";
import type { Document } from "../types";

interface DocumentState {
  documents: Document[];
  loading: boolean;
  addDocument: (doc: Document) => void;
  removeDocument: (docId: string) => void;
  refreshDocuments: () => Promise<void>;
}

const DocumentContext = createContext<DocumentState | null>(null);

export function DocumentProvider({ children }: { children: React.ReactNode }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await api.get<{ documents: Document[] }>("/api/documents");
      setDocuments(res.documents);
    } catch {
      // silently handle
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const addDocument = useCallback((doc: Document) => {
    setDocuments((prev) => [doc, ...prev]);
  }, []);

  const removeDocument = useCallback((docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
  }, []);

  const refreshDocuments = useCallback(async () => {
    await fetchDocuments();
  }, [fetchDocuments]);

  return (
    <DocumentContext.Provider value={{ documents, loading, addDocument, removeDocument, refreshDocuments }}>
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocuments() {
  const ctx = useContext(DocumentContext);
  if (!ctx) throw new Error("useDocuments must be used within DocumentProvider");
  return ctx;
}
