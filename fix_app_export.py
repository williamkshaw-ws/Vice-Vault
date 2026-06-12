import sys

# 1. Update AuthModal.tsx
auth_path = '/Users/williamkshaw/antigravity/Vice-Vault/src/components/AuthModal.tsx'
with open(auth_path, 'r') as f:
    auth_content = f.read()

# Remove onDeleteBag prop from interface
auth_content = auth_content.replace('  onDeleteBag?: () => void;\n', '')
auth_content = auth_content.replace('  onDeleteBag,\n', '')

# Remove state
auth_content = auth_content.replace('  const [showDeleteBagConfirm, setShowDeleteBagConfirm] = useState(false);\n', '')

# Remove UI
start_delete = "{/* Delete Bag Section */}"
end_delete = "Theme Accent Color"
start_idx = auth_content.find(start_delete)
end_idx = auth_content.find(end_delete)

if start_idx != -1 and end_idx != -1:
    delete_ui = auth_content[start_idx:end_idx]
    # We want to replace everything from start_delete up to just before Theme Accent Color
    auth_content = auth_content.replace(delete_ui, '')

# Remove Delete Confirm Modal
start_modal = "{/* Delete Bag Confirmation Modal */}"
end_modal = "{/* Selected User Bag Manager Modal */}" # Oh wait, this modal is the end of AuthModal, it's before the final div
start_idx = auth_content.find(start_modal)
# Just find the end of the file. It's at the bottom.
if start_idx != -1:
    # Remove from start_modal to the second to last closing div.
    # It's easier to just regex it out, or string replace.
    # Actually, I can just leave the unused state, but I already removed the state so it would cause an error if the UI was still there.
    end_modal_idx = auth_content.find("      {/* Delete Bag Confirmation Modal */}")
    if end_modal_idx != -1:
        # Cut it off before the modal, and just add the final two closing divs
        auth_content = auth_content[:end_modal_idx] + "    </div>\n  );\n}\n"

with open(auth_path, 'w') as f:
    f.write(auth_content)

# 2. Update App.tsx
app_path = '/Users/williamkshaw/antigravity/Vice-Vault/src/App.tsx'
with open(app_path, 'r') as f:
    app_content = f.read()

old_export = """  const handleExportData = () => {
    // Generate JSON payload without images
    const exportData = balls.map((b) => {
      const { image, sleeveImage, boxImage, packagingImage, ...rest } = b;
      return rest;
    });

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vice_vault_bag_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };"""

new_export = """  const handleExportData = () => {
    const exportData = balls.map((b) => {
      const { image, sleeveImage, boxImage, packagingImage, ...rest } = b;
      return rest;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "My Locker");
    XLSX.writeFile(wb, `Vice_Vault_Bag_${new Date().toISOString().split("T")[0]}.xlsx`);
  };"""

app_content = app_content.replace(old_export, new_export)

# Move props from AuthModal to ImportExportModal
app_content = app_content.replace('onDeleteBag={handleDeleteAllLocker}', '')

old_ie = """      <ImportExportModal
        isOpen={importExportModalOpen}
        onClose={() => setImportExportModalOpen(false)}
        onExport={handleExportData}
        onImport={handleImportData}
      />"""

new_ie = """      <ImportExportModal
        isOpen={importExportModalOpen}
        onClose={() => setImportExportModalOpen(false)}
        onExport={handleExportData}
        onImport={handleImportData}
        onDeleteBag={handleDeleteAllLocker}
        hasBagItems={balls.length > 0}
      />"""

app_content = app_content.replace(old_ie, new_ie)

with open(app_path, 'w') as f:
    f.write(app_content)

print("Updated AuthModal and App.tsx!")
