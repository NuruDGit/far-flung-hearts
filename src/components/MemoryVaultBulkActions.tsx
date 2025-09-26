import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, Download, CheckSquare, Square } from 'lucide-react';
import { toast } from 'sonner';

interface MemoryVaultBulkActionsProps {
  selectedItems: string[];
  onSelectionChange: (selectedItems: string[]) => void;
  allItemIds: string[];
  onBulkDelete: (itemIds: string[]) => Promise<void>;
  onBulkDownload: (itemIds: string[]) => void;
}

const MemoryVaultBulkActions = ({
  selectedItems,
  onSelectionChange,
  allItemIds,
  onBulkDelete,
  onBulkDownload
}: MemoryVaultBulkActionsProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const isAllSelected = selectedItems.length === allItemIds.length && allItemIds.length > 0;
  const isSomeSelected = selectedItems.length > 0 && selectedItems.length < allItemIds.length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(allItemIds);
    } else {
      onSelectionChange([]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;

    setIsDeleting(true);
    try {
      await onBulkDelete(selectedItems);
      onSelectionChange([]); // Clear selection after deletion
      toast.success(`Successfully deleted ${selectedItems.length} memories`);
    } catch (error) {
      console.error('Error during bulk delete:', error);
      toast.error('Failed to delete some memories');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDownload = () => {
    if (selectedItems.length === 0) return;
    
    try {
      onBulkDownload(selectedItems);
      toast.success(`Starting download of ${selectedItems.length} memories`);
    } catch (error) {
      console.error('Error during bulk download:', error);
      toast.error('Failed to start download');
    }
  };

  if (allItemIds.length === 0) {
    return null;
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-start gap-2">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
                aria-label="Select all memories"
                className={isSomeSelected ? "data-[state=checked]:bg-primary/50" : ""}
              />
              <span className="text-sm font-medium">
                {selectedItems.length === 0 ? (
                  "Select memories"
                ) : (
                  `${selectedItems.length} selected`
                )}
              </span>
            </div>

            {selectedItems.length > 0 && (
              <div className="text-xs text-muted-foreground ml-6">
                {isAllSelected ? "All memories selected" : "Some memories selected"}
              </div>
            )}
          </div>

          {selectedItems.length > 0 && (
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 min-w-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDownload}
                className="flex items-center gap-1 w-full sm:w-auto text-xs sm:text-sm"
              >
                <Download size={14} />
                <span className="truncate">Download ({selectedItems.length})</span>
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isDeleting}
                    className="flex items-center gap-1 w-full sm:w-auto text-xs sm:text-sm"
                  >
                    <Trash2 size={14} />
                    <span className="truncate">Delete ({selectedItems.length})</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Selected Memories</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {selectedItems.length} selected memories? 
                      This action cannot be undone and will permanently remove these memories from your vault.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleBulkDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Delete Memories"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSelectionChange([])}
                className="text-xs w-full sm:w-auto"
              >
                Clear
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MemoryVaultBulkActions;