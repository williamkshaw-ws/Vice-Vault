import sys

# 1. Update ImportExportModal.tsx
import_export_path = '/Users/williamkshaw/antigravity/Vice-Vault/src/components/ImportExportModal.tsx'
with open(import_export_path, 'r') as f:
    ie_content = f.read()

# Add imports
ie_content = ie_content.replace('import { Download, Upload, X, AlertTriangle } from "lucide-react";', 'import { Download, Upload, X, AlertTriangle, Trash2 } from "lucide-react";\nimport * as XLSX from "xlsx";')

# Add Props
old_props = """interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
  onImport: (data: any) => Promise<void>;
}"""
new_props = """interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
  onImport: (data: any) => Promise<void>;
  onDeleteBag?: () => void;
  hasBagItems?: boolean;
}"""
ie_content = ie_content.replace(old_props, new_props)

# Add state and destructured props
old_func_def = """export default function ImportExportModal({ isOpen, onClose, onExport, onImport }: ImportExportModalProps) {"""
new_func_def = """export default function ImportExportModal({ isOpen, onClose, onExport, onImport, onDeleteBag, hasBagItems }: ImportExportModalProps) {"""
ie_content = ie_content.replace(old_func_def, new_func_def)

# Add state inside component
old_state = """  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);"""
new_state = """  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);"""
ie_content = ie_content.replace(old_state, new_state)

# Replace file change logic for XLSX and JSON
old_file_change = """    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Basic validation
      if (!Array.isArray(data)) {
        throw new Error("Invalid format: The backup file must contain an array of items.");
      }

      await onImport(data);
      onClose();
    } catch (err: any) {"""

new_file_change = """    try {
      let data: any[] = [];
      if (file.name.toLowerCase().endsWith('.json')) {
        const text = await file.text();
        data = JSON.parse(text);
      } else {
        // Handle XLSX
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        data = XLSX.utils.sheet_to_json(worksheet);
      }
      
      // Basic validation
      if (!Array.isArray(data)) {
        throw new Error("Invalid format: The backup file must contain an array of items.");
      }

      await onImport(data);
      onClose();
    } catch (err: any) {"""
ie_content = ie_content.replace(old_file_change, new_file_change)

# Update accept attribute
ie_content = ie_content.replace('accept=".json"', 'accept=".json,.xlsx,.xls"')
ie_content = ie_content.replace('Download a slim JSON file', 'Download an Excel (.xlsx) file')
ie_content = ie_content.replace('exported JSON backup', 'exported .xlsx or .json backup')

# Add Delete button to modal body
old_body_end = """        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-start gap-2">
            <AlertTriangle size={16} className="text-rose-500 shrink-0 mt-0.5" weight="fill" />
            <span className="text-xs text-rose-400 font-mono">{error}</span>
          </div>
        )}
      </div>
    </div>"""

new_body_end = """        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-start gap-2">
            <AlertTriangle size={16} className="text-rose-500 shrink-0 mt-0.5" weight="fill" />
            <span className="text-xs text-rose-400 font-mono">{error}</span>
          </div>
        )}

        {/* Delete Bag Section */}
        <div className="pt-6 mt-6 border-t border-neutral-800">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={!hasBagItems}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-rose-950/10 border border-rose-950/50 hover:border-rose-500/50 hover:bg-rose-950/30 transition-colors group text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div>
              <div className="font-bold text-rose-500 text-sm uppercase tracking-wider">Delete My Bag</div>
              <div className="text-xs text-rose-500/60 mt-1">Permanently wipe all your inventory.</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-black transition-colors shrink-0">
              <Trash2 size={20} weight="bold" />
            </div>
          </button>
        </div>
      </div>

      {/* Delete Bag Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-neutral-900 border border-rose-900/50 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-2xl animate-scale-in relative">
            <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto animate-pulse" />
            <h4 className="text-white font-sans font-black text-base uppercase tracking-wider">
              Delete My Bag
            </h4>
            <p className="text-xs text-neutral-400 leading-relaxed font-mono">
              Are you absolutely sure you want to permanently delete all items in your bag? This action cannot be undone.
            </p>
            <div className="flex gap-3 mt-6 pt-2 w-full">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 px-3 bg-neutral-950 border border-neutral-800 hover:bg-neutral-900 text-neutral-400 font-mono text-[10px] uppercase font-bold tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteBag?.();
                  setShowDeleteConfirm(false);
                  onClose();
                }}
                className="flex-1 py-2.5 px-3 bg-rose-600 hover:bg-rose-500 text-white font-mono text-[10px] uppercase font-extrabold tracking-wider rounded-xl transition-all cursor-pointer border-none"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>"""

ie_content = ie_content.replace(old_body_end, new_body_end)

with open(import_export_path, 'w') as f:
    f.write(ie_content)

print("Updated ImportExportModal!")
