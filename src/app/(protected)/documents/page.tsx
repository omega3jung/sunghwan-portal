import { DocumentsContent } from "./components/DocumentsContent";
import { documentGroups } from "./constants/documents";
import { loadDocumentsById } from "./server/loader";

// Route entry stays server-side so the page can read markdown files up front
// and hand a ready-to-render document map to the client-facing view.
export default async function DocumentsPage() {
  const documentsById = await loadDocumentsById();

  return (
    <DocumentsContent
      documentGroups={documentGroups}
      documentsById={documentsById}
    />
  );
}
