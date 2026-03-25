import { useState, useEffect, useCallback } from 'react';
import { folderService, fileService } from '../../services/api';
import {
  Search, Upload, Undo, Trash2, File as FileIcon,
  Folder as FolderIcon, FolderPlus, X, Tag, Clock,
  CheckCircle, AlertCircle
} from 'lucide-react';
import FolderTree from '../folders/FolderTree';
import toast from 'react-hot-toast';
import {
  Button,
  Card,
  CardHeader,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Progress,
  Badge
} from '@/components/ui';

export default function FileExplorer() {
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [selectedFolderName, setSelectedFolderName] = useState('');

  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [folderParentId, setFolderParentId] = useState(null);

  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTags, setUploadTags] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false); // Used for search loading


  // Drag state
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const fetchFolders = useCallback(async () => {
    try {
      const res = await folderService.getFolders();
      setFolders(res.data);
    } catch {
      toast.error('Failed to load folders.');
    }
  }, []);

  const fetchFiles = useCallback(async (folderId) => {
    if (!folderId) return;
    try {
      const res = await fileService.getFiles(folderId);
      setFiles(res.data);
    } catch {
      toast.error('Failed to load files.');
    }
  }, []);

  useEffect(() => { fetchFolders(); }, [fetchFolders]);

  useEffect(() => {
    if (selectedFolderId) {
      fetchFiles(selectedFolderId);
      setSearchResults(null);
      setSearchQuery('');
    }
  }, [selectedFolderId, fetchFiles]);

  const handleSelectFolder = (id, name) => {
    setSelectedFolderId(id);
    setSelectedFolderName(name);
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      await folderService.createFolder(newFolderName, folderParentId);
      setIsFolderModalOpen(false);
      setNewFolderName('');
      fetchFolders();
      toast.success(`Folder "${newFolderName}" created!`);
    } catch {
      toast.error('Failed to create folder.');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile || !selectedFolderId) {
      toast.error('Select a file and destination folder first.');
      return;
    }
    setIsUploading(true);
    setUploadProgress(0);
    // Simulate queue processing progress bar
    const interval = setInterval(() => {
      setUploadProgress(p => {
        if (p >= 90) { clearInterval(interval); return p; }
        return p + 10;
      });
    }, 150);
    try {
      await fileService.uploadFile(uploadFile, selectedFolderId, uploadTags);
      setUploadProgress(100);
      clearInterval(interval);
      setTimeout(() => {
        setIsFileUploadOpen(false);
        setUploadFile(null);
        setUploadTags('');
        setUploadProgress(0);
        setIsUploading(false);
        fetchFiles(selectedFolderId);
        toast.success(`"${uploadFile.name}" successfully archived and processed.`);
      }, 500);
    } catch {
      clearInterval(interval);
      setIsUploading(false);
      setUploadProgress(0);
      toast.error('Upload failed. Please check the file format.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setUploadFile(droppedFile);
      setIsFileUploadOpen(true);
    }
  };

  const handleDeleteFile = async (id, name) => {
    if (!confirm(`Are you sure you want to remove "${name}"? You can restore this file if needed.`)) return;
    try {
      await fileService.deleteFile(id);
      fetchFiles(selectedFolderId);
      toast.success(`"${name}" removed. Undo is available.`);
    } catch {
      toast.error('Delete failed.');
    }
  };

  const handleUndo = async () => {
    try {
      const res = await fileService.undoLastAction();
      toast.success(res.data.message || 'Most recent action reverted.');
      if (selectedFolderId) fetchFiles(selectedFolderId);
    } catch {
      toast.error('No recent actions to revert.');
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) { setSearchResults(null); return; }
    setIsSearching(true);
    try {
      const res = await fileService.searchFiles(searchQuery);
      setSearchResults(res.data);
      if (res.data.length === 0) toast('No results found for your search.', { icon: '🔍' });
      else toast.success(`Found ${res.data.length} document(s).`);
    } catch {
      toast.error('Search failed.');
    } finally {
      setIsSearching(false);
    }
  };

  const displayFiles = searchResults || files;

  return (
    <div className="flex gap-6 h-[calc(100vh-3rem)]">
      {/* Folder Sidebar */}
      <aside className="w-72 shrink-0 flex flex-col gap-4">
        <Card className="overflow-hidden flex-1 flex flex-col">
          <CardHeader className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <FolderIcon className="w-4 h-4 text-blue-500" /> Folders
            </h2>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => { setFolderParentId(null); setIsFolderModalOpen(true); }}
              title="New Root Folder"
            >
              <FolderPlus className="w-4 h-4" />
            </Button>
          </CardHeader>
          <div className="flex-1 overflow-y-auto p-2">
            <FolderTree
              folders={folders}
              selectedFolderId={selectedFolderId}
              onSelectFolder={handleSelectFolder}
              onCreateFolder={(parentId) => { setFolderParentId(parentId); setIsFolderModalOpen(true); }}
            />
            {folders.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <FolderIcon className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-xs">No folders yet</p>
              </div>
            )}
          </div>
        </Card>
      </aside>

      {/* File Area */}
      <div className="flex-1 flex flex-col min-w-0 gap-4">
        {/* Toolbar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              {selectedFolderName || 'File Manager'}
              {selectedFolderName && (
                <Badge variant="secondary">
                  {files.length} files
                </Badge>
              )}
            </h1>
            <p className="text-slate-400 text-xs">
              {searchResults ? `Search results for "${searchQuery}"` : 'Choose a category to browse documents'}
            </p>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search documents by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 w-52"
            />
            {searchResults && (
              <Button type="button" onClick={() => { setSearchResults(null); setSearchQuery(''); }} className="absolute right-2 text-slate-400 hover:text-slate-600 size-sm" variant="ghost">
                <X className="w-3.5 h-3.5" />
              </Button>
            )}
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndo}
              title="Restore Last Action"
            >
              <Undo className="w-4 h-4 mr-1" /> Restore
            </Button>
            <Button
              onClick={() => setIsFileUploadOpen(true)}
              disabled={!selectedFolderId}
            >
              <Upload className="w-4 h-4 mr-1" /> Upload File
            </Button>
          </div>
        </div>

        {/* File Grid - Drop Zone */}
        <div
          className={`flex-1 overflow-y-auto rounded-2xl border-2 transition-all p-4 ${
            isDraggingOver ? 'border-blue-400 bg-blue-50' : 'border-transparent'
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={handleDrop}
        >
          {isDraggingOver && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Upload className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                <p className="text-blue-600 font-semibold">Drop to upload</p>
              </div>
            </div>
          )}

          {!isDraggingOver && !selectedFolderId && !searchResults && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                <FolderIcon className="w-10 h-10 text-slate-300" />
              </div>
              <p className="font-semibold text-slate-500">No folder selected</p>
              <p className="text-sm mt-1">Choose a folder from the sidebar, or drag files here to upload</p>
            </div>
          )}

          {!isDraggingOver && (selectedFolderId || searchResults) && (
            <>
              {displayFiles.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                  <FileIcon className="w-10 h-10 text-slate-300 mb-3" />
                  <p className="font-semibold">No files here yet</p>
                  <p className="text-sm">Upload a file to this folder</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {displayFiles.map(f => (
                    <div
                      key={f.id}
                      draggable
                      className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col gap-3 cursor-pointer hover:-translate-y-0.5"
                    >
                      <div className="flex items-start justify-between">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                          <FileIcon className="w-5 h-5" />
                        </div>
                        <Button
                          onClick={() => handleDeleteFile(f.id, f.name)}
                          className="opacity-0 group-hover:opacity-100 w-7 h-7 size-sm p-0"
                          variant="ghost"
                          size="icon"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-slate-800 text-sm truncate" title={f.name}>{f.name}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {f.type ? f.type.split('/')[1]?.toUpperCase() || 'FILE' : 'FILE'} • {Math.round(f.size)} KB
                        </p>
                      </div>
                      {f.tags && (
                        <div className="flex flex-wrap gap-1">
                          {f.tags.split(',').filter(Boolean).map(tag => (
                            <Badge key={tag} variant="secondary" className="text-[10px]">
                              <Tag className="w-2.5 h-2.5 mr-1" /> {tag.trim()}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      <Dialog open={isFileUploadOpen} onOpenChange={setIsFileUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive Document</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <Label>File</Label>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center mt-2">
                <input
                  type="file"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  required
                  className="w-full text-sm text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-600 file:text-xs file:font-semibold hover:file:bg-blue-100"
                />
                {uploadFile && <p className="text-xs text-green-600 mt-2 font-medium">✓ {uploadFile.name}</p>}
              </div>
            </div>
            <div>
              <Label>
                Tags <span className="text-slate-400 font-normal">(comma separated)</span>
              </Label>
              <Input
                value={uploadTags}
                onChange={(e) => setUploadTags(e.target.value)}
                placeholder="e.g. Science, 2026, Exam"
                className="mt-2"
              />
              <p className="text-[11px] text-slate-400 mt-2 font-medium">Add keywords to categorize and find this document faster.</p>
            </div>

            {isUploading && (
              <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                <div className="flex justify-between text-xs font-bold text-blue-700 mb-2 items-center">
                  <span className="flex items-center gap-2">
                     <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    Organizing files...
                  </span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            <DialogFooter>
              <Button type="button" onClick={() => setIsFileUploadOpen(false)} variant="outline">Cancel</Button>
              <Button type="submit" disabled={isUploading}>
                {isUploading ? 'Finalizing...' : 'Save Document'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Folder Modal */}
      <Dialog open={isFolderModalOpen} onOpenChange={setIsFolderModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Folder</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateFolder} className="space-y-4">
            <div>
              <Label>Folder Name</Label>
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="e.g. Science Dept."
                required
                autoFocus
                className="mt-2"
              />
            </div>
            <DialogFooter>
              <Button type="button" onClick={() => setIsFolderModalOpen(false)} variant="outline">Cancel</Button>
              <Button type="submit">Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

