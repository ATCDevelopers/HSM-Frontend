import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ArrowTopRightOnSquareIcon, BuildingOffice2Icon, DocumentArrowUpIcon, DocumentTextIcon, PhotoIcon, TrashIcon } from "@heroicons/react/24/outline";
import Swal from "sweetalert2";
import Modal from "../atoms/ui/Modal";
import { useAuth } from "../../auth/AuthContext";
import { can } from "../../config/ability";
import { getErrorMessage } from "../../services/apiResponse";
import { DOCUMENT_TYPES, documentTypeLabel, patientDocumentAPI, type PatientDocument } from "../../services/patientAPI";

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPT = "application/pdf,image/jpeg,image/png";
const fieldClass = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none";
const EMPTY_FORM = { sourceInstitution: "", documentType: "referral_letter", documentDate: "", notes: "" };

/**
 * Documents a patient brings from other hospitals (referrals, lab reports, scans, discharge summaries).
 * Staff who can update the patient upload them; anyone who can read the patient can preview them in place.
 */
export default function PatientDocuments({ patientId }: { patientId: string }) {
  const { user } = useAuth();
  const canUpload = can("update", "Patient", user?.role);

  const [documents, setDocuments] = useState<PatientDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<{ doc: PatientDocument; url: string } | null>(null);
  const [opening, setOpening] = useState("");

  const load = useCallback(() => {
    patientDocumentAPI
      .list(patientId)
      .then(setDocuments)
      .catch((e: unknown) => setError(getErrorMessage(e, "Failed to load documents")))
      .finally(() => setLoading(false));
  }, [patientId]);

  useEffect(load, [load]);

  // Release the blob URL when the preview closes so files don't stay in memory.
  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview.url);
  }, [preview]);

  const open = async (doc: PatientDocument) => {
    setOpening(doc.id);
    try {
      const blob = await patientDocumentAPI.fileBlob(patientId, doc.id);
      setPreview({ doc, url: URL.createObjectURL(new Blob([blob], { type: doc.mimeType })) });
    } catch (e: unknown) {
      Swal.fire("Could not open document", getErrorMessage(e), "error");
    } finally {
      setOpening("");
    }
  };

  const pickFile = (picked: File | null) => {
    if (picked && picked.size > MAX_BYTES) {
      Swal.fire("File too large", "Documents can be up to 10 MB.", "warning");
      return;
    }
    if (picked && !ACCEPT.split(",").includes(picked.type)) {
      Swal.fire("Unsupported file", "Upload a PDF, JPG or PNG.", "warning");
      return;
    }
    setFile(picked);
  };

  const upload = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return Swal.fire("No file", "Choose the scanned document or photo to upload.", "warning");
    setUploading(true);
    try {
      await patientDocumentAPI.upload(patientId, { file, ...form });
      setUploadOpen(false);
      setFile(null);
      setForm(EMPTY_FORM);
      load();
    } catch (err: unknown) {
      Swal.fire("Upload failed", getErrorMessage(err), "error");
    } finally {
      setUploading(false);
    }
  };

  const remove = async (doc: PatientDocument) => {
    const confirm = await Swal.fire({ title: `Remove ${doc.documentName}?`, text: "It will no longer appear on the patient's record.", icon: "warning", showCancelButton: true, confirmButtonColor: "#d33", confirmButtonText: "Remove" });
    if (!confirm.isConfirmed) return;
    try {
      await patientDocumentAPI.remove(patientId, doc.id);
      setPreview(null);
      load();
    } catch (e: unknown) {
      Swal.fire("Error", getErrorMessage(e), "error");
    }
  };

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-bold text-gray-900">Documents from other institutions</h2>
          <p className="text-xs text-gray-500">Referrals, outside lab results, scans and reports the patient brought in.</p>
        </div>
        {canUpload && (
          <button onClick={() => setUploadOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            <DocumentArrowUpIcon className="h-4 w-4" /> Upload document
          </button>
        )}
      </div>

      {error && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{error}</p>}
      {loading && <p className="mt-3 text-sm text-gray-400">Loading documents...</p>}
      {!loading && !error && documents.length === 0 && (
        <p className="mt-4 rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">No outside documents uploaded yet.</p>
      )}

      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {documents.map((doc) => {
          const Icon = doc.mimeType.startsWith("image/") ? PhotoIcon : DocumentTextIcon;
          return (
            <li key={doc.id}>
              <button
                type="button"
                onClick={() => open(doc)}
                disabled={opening === doc.id}
                className="flex w-full items-start gap-3 rounded-xl border border-gray-200 p-3 text-left transition hover:border-blue-300 hover:bg-blue-50 disabled:opacity-60"
              >
                <Icon className="mt-0.5 h-8 w-8 shrink-0 text-blue-500" />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">{documentTypeLabel(doc.documentType)}</span>
                    {doc.documentDate && <span className="text-[11px] text-gray-500">{new Date(doc.documentDate).toLocaleDateString()}</span>}
                  </span>
                  <span className="mt-1 block truncate text-sm font-semibold text-gray-900">{doc.documentName}</span>
                  {doc.sourceInstitution && (
                    <span className="flex items-center gap-1 text-xs text-gray-600"><BuildingOffice2Icon className="h-3.5 w-3.5" /> {doc.sourceInstitution}</span>
                  )}
                  <span className="block text-[11px] text-gray-400">
                    {opening === doc.id ? "Opening..." : `Uploaded ${new Date(doc.createdAt).toLocaleDateString()}${doc.uploadedByFirstName ? ` by ${doc.uploadedByFirstName} ${doc.uploadedByLastName}` : ""} · ${doc.fileSize}`}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <Modal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload a document" size="lg">
        <form onSubmit={upload} className="space-y-4">
          <label
            className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-300 p-6 text-center hover:border-blue-400 hover:bg-blue-50"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              pickFile(e.dataTransfer.files?.[0] ?? null);
            }}
          >
            <DocumentArrowUpIcon className="h-8 w-8 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">{file ? file.name : "Drop a file here or click to choose"}</span>
            <span className="text-xs text-gray-400">PDF, JPG or PNG · up to 10 MB · a phone photo of the paper works</span>
            <input type="file" accept={ACCEPT} className="hidden" onChange={(e) => pickFile(e.target.files?.[0] ?? null)} />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-sm font-medium text-gray-700">Document type
              <select className={fieldClass} value={form.documentType} onChange={(e) => setForm({ ...form, documentType: e.target.value })}>
                {DOCUMENT_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </label>
            <label className="space-y-1 text-sm font-medium text-gray-700">Date on the document
              <input type="date" className={fieldClass} value={form.documentDate} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setForm({ ...form, documentDate: e.target.value })} />
            </label>
          </div>
          <label className="block space-y-1 text-sm font-medium text-gray-700">Issued by (hospital / institution)
            <input className={fieldClass} value={form.sourceInstitution} onChange={(e) => setForm({ ...form, sourceInstitution: e.target.value })} placeholder="e.g. Muhimbili National Hospital" />
          </label>
          <label className="block space-y-1 text-sm font-medium text-gray-700">Notes
            <textarea rows={2} className={fieldClass} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="e.g. Referred for cardiology review; echo done 2026-10-12" />
          </label>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setUploadOpen(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700">Cancel</button>
            <button type="submit" disabled={uploading || !file} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={Boolean(preview)} onClose={() => setPreview(null)} title={preview ? documentTypeLabel(preview.doc.documentType) : ""} size="xl">
        {preview && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-600">
              <span>
                <strong className="text-gray-900">{preview.doc.documentName}</strong>
                {preview.doc.sourceInstitution && ` · ${preview.doc.sourceInstitution}`}
                {preview.doc.documentDate && ` · ${new Date(preview.doc.documentDate).toLocaleDateString()}`}
              </span>
              <span className="flex gap-2">
                <a href={preview.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                  <ArrowTopRightOnSquareIcon className="h-4 w-4" /> Open full screen
                </a>
                {canUpload && (
                  <button onClick={() => remove(preview.doc)} className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">
                    <TrashIcon className="h-4 w-4" /> Remove
                  </button>
                )}
              </span>
            </div>
            {preview.doc.notes && <p className="rounded-lg bg-blue-50 p-3 text-sm text-blue-900">{preview.doc.notes}</p>}
            {preview.doc.mimeType.startsWith("image/") ? (
              <img src={preview.url} alt={preview.doc.documentName} className="max-h-[70vh] w-full rounded-lg object-contain ring-1 ring-gray-200" />
            ) : (
              <iframe src={preview.url} title={preview.doc.documentName} className="h-[70vh] w-full rounded-lg ring-1 ring-gray-200" />
            )}
          </div>
        )}
      </Modal>
    </section>
  );
}
