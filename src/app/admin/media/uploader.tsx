"use client";

import { ArrowUpRight, Check, Clipboard, FileImage, Folder, FolderOpen, FolderPlus, Grid2X2, List, Search, UploadCloud, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { type ChangeEvent, type DragEvent, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { AdminButton, AdminInput, AdminSelect } from "@/components/admin/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUploadThing } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";
import { createMediaFolderAction, moveMediaAssetAction, renameMediaFolderAction } from "./actions";

export type MediaAssetRecord = {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  bytes: number;
  alt: string | null;
  decorative: boolean;
  lifecycle: string;
  folderId: string | null;
  createdAt: string;
};

export type MediaFolderRecord = {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  createdAt: string;
};

type ViewMode = "grid" | "list";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function getFolderPath(folders: MediaFolderRecord[], folderId: string | null) {
  const path: MediaFolderRecord[] = [];
  let current = folderId ? folders.find((folder) => folder.id === folderId) : undefined;
  const visited = new Set<string>();
  while (current && !visited.has(current.id)) {
    path.unshift(current);
    visited.add(current.id);
    current = current.parentId ? folders.find((folder) => folder.id === current?.parentId) : undefined;
  }
  return path;
}

function getDescendantIds(folders: MediaFolderRecord[], folderId: string) {
  const ids = new Set([folderId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const folder of folders) {
      if (folder.parentId && ids.has(folder.parentId) && !ids.has(folder.id)) {
        ids.add(folder.id);
        changed = true;
      }
    }
  }
  return ids;
}

function flattenFolders(folders: MediaFolderRecord[], parentId: string | null = null, depth = 0): Array<MediaFolderRecord & { depth: number }> {
  return folders
    .filter((folder) => folder.parentId === parentId)
    .sort((a, b) => a.name.localeCompare(b.name, "id"))
    .flatMap((folder) => [{ ...folder, depth }, ...flattenFolders(folders, folder.id, depth + 1)]);
}

function MediaUploader({ folderId, folderName }: { folderId: string | null; folderName: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const { startUpload, isUploading } = useUploadThing("image", {
    onClientUploadComplete: () => {
      setFiles([]);
      toast.success("Media berhasil diunggah");
      router.refresh();
    },
    onUploadError: (error) => {
      toast.error(error.message || "Upload media gagal");
    },
  });

  const addFiles = (incoming: File[]) => {
    const images = incoming.filter((file) => file.type.startsWith("image/"));
    if (images.length !== incoming.length) toast.error("Hanya file gambar yang dapat diunggah di sini");
    setFiles(images);
  };

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => addFiles(Array.from(event.target.files ?? []));
  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(event.dataTransfer.files));
  };

  return (
    <details className="group border-y border-dgb-100 bg-white/55">
      <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3.5 marker:content-none sm:px-5">
        <span className="grid size-9 shrink-0 place-items-center rounded-md bg-dgb text-white"><UploadCloud size={16} /></span>
        <span className="min-w-0 flex-1"><span className="block font-montserrat text-sm font-semibold text-dgb-900">Unggah media</span><span className="block truncate text-xs text-muted-foreground">Folder tujuan: {folderName}</span></span>
        <span className="text-xs font-semibold text-dgb group-open:hidden">Buka panel</span>
        <span className="hidden text-xs font-semibold text-dgb group-open:inline">Tutup panel</span>
      </summary>
      <div className="grid gap-4 border-t border-dgb-100 bg-[linear-gradient(120deg,var(--color-dgb-50),white_60%,var(--color-fb-50))] p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)] lg:items-center">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-fb-700">Upload media</p>
          <h2 className="mt-1 font-montserrat text-base font-semibold text-dgb-900">Tambahkan ke {folderName}</h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">JPEG, PNG, WebP, atau AVIF. Maksimal 20 MB per gambar.</p>
          <Button type="button" variant="outline" className="mt-3 h-9 rounded-md border-dgb-200 bg-white text-dgb-700 hover:bg-dgb-50" onClick={() => inputRef.current?.click()}><UploadCloud size={15} /> Pilih file</Button>
        </div>
        <div onDragEnter={() => setIsDragging(true)} onDragOver={(event) => event.preventDefault()} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop} className={cn("rounded-lg border border-dashed px-4 py-4 text-center transition-colors", isDragging ? "border-fb-400 bg-fb-50" : "border-dgb-200 bg-white/70")}>
          <input ref={inputRef} className="hidden" type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={handleInput} />
          <UploadCloud size={20} className="mx-auto text-dgb" />
          <p className="mt-2 text-sm font-semibold text-dgb-900">Tarik gambar ke area ini</p>
          <p className="mt-1 text-xs text-muted-foreground">{files.length ? `${files.length} file siap diunggah` : "File baru akan masuk ke folder aktif"}</p>
          {files.length ? <div className="mt-3 flex flex-wrap justify-center gap-2">{files.map((file) => <span key={`${file.name}-${file.lastModified}`} className="inline-flex max-w-full items-center gap-2 rounded-md bg-dgb-50 px-2.5 py-1.5 text-xs font-medium text-dgb-700"><FileImage size={13} /><span className="max-w-36 truncate">{file.name}</span><button type="button" aria-label={`Hapus ${file.name}`} onClick={() => setFiles((current) => current.filter((item) => item !== file))}><X size={13} /></button></span>)}</div> : null}
          <Button type="button" disabled={!files.length || isUploading} className="mt-3 h-9 rounded-md bg-dgb px-4 text-xs hover:bg-dgb-600" onClick={() => startUpload(files, { folderId })}>{isUploading ? "Mengunggah..." : files.length ? `Unggah ${files.length} file` : "Pilih file dahulu"}</Button>
        </div>
      </div>
    </details>
  );
}

export function MediaExplorer({ assets, folders }: { assets: MediaAssetRecord[]; folders: MediaFolderRecord[] }) {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const currentFolder = folders.find((folder) => folder.id === currentFolderId) ?? null;
  const selectedAsset = assets.find((asset) => asset.id === selectedId) ?? null;
  const flatFolders = useMemo(() => flattenFolders(folders), [folders]);
  const folderPath = useMemo(() => getFolderPath(folders, currentFolderId), [folders, currentFolderId]);
  const childFolders = useMemo(() => folders.filter((folder) => folder.parentId === currentFolderId).sort((a, b) => a.name.localeCompare(b.name, "id")), [folders, currentFolderId]);
  const folderCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const folder of folders) {
      const descendants = getDescendantIds(folders, folder.id);
      counts.set(folder.id, assets.filter((asset) => asset.folderId && descendants.has(asset.folderId)).length);
    }
    return counts;
  }, [assets, folders]);
  const normalizedQuery = query.trim().toLowerCase();
  const visibleAssets = useMemo(() => {
    const pool = normalizedQuery ? assets : assets.filter((asset) => asset.folderId === currentFolderId);
    return pool.filter((asset) => `${asset.filename} ${asset.alt ?? ""}`.toLowerCase().includes(normalizedQuery));
  }, [assets, currentFolderId, normalizedQuery]);

  const folderCount = (folderId: string) => folderCounts.get(folderId) ?? 0;

  const openFolder = (folderId: string | null) => {
    setCurrentFolderId(folderId);
    setSelectedId(null);
    setQuery("");
  };

  const copyUrl = async () => {
    if (!selectedAsset) return;
    await navigator.clipboard.writeText(selectedAsset.url);
    toast.success("URL media disalin");
  };

  return (
    <div className="space-y-5">
      <MediaUploader folderId={currentFolderId} folderName={currentFolder?.name ?? "Root media"} />

      <div className="grid min-h-[38rem] overflow-hidden border-y border-dgb-100 bg-card xl:grid-cols-[230px_minmax(0,1fr)_300px]">
        <aside className="border-b border-border bg-dgb-50/35 p-3 xl:border-b-0 xl:border-r">
          <div className="flex items-center justify-between px-2 py-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-dgb-700">Folder media</p>
            <FolderOpen size={15} className="text-fb-600" />
          </div>
          <button type="button" onClick={() => openFolder(null)} className={cn("mt-2 flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors", currentFolderId === null ? "bg-dgb text-white" : "text-dgb-800 hover:bg-dgb-50")}>
            <FolderOpen size={16} /> Root media <span className="ml-auto text-xs opacity-65">{assets.length}</span>
          </button>
          <div className="mt-1 space-y-0.5">
            {flatFolders.map((folder) => (
              <button key={folder.id} type="button" onClick={() => openFolder(folder.id)} className={cn("flex w-full items-center gap-2 rounded-md py-2 pr-2 text-left text-sm transition-colors", currentFolderId === folder.id ? "bg-white font-semibold text-dgb shadow-sm" : "text-dgb-800/75 hover:bg-white/75 hover:text-dgb", folder.depth === 0 ? "pl-3" : folder.depth === 1 ? "pl-7" : "pl-10")}>
                <Folder size={15} className="shrink-0" /><span className="truncate">{folder.name}</span><span className="ml-auto text-[11px] opacity-55">{folderCount(folder.id)}</span>
              </button>
            ))}
          </div>
          {folders.length === 0 ? <p className="px-3 py-5 text-xs leading-5 text-muted-foreground">Belum ada folder. Buat struktur pertama dari area file.</p> : null}
        </aside>

        <section className="min-w-0 p-4 sm:p-5">
          <div className="flex flex-col gap-4 border-b border-border pb-4">
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              <button type="button" className="font-semibold text-dgb hover:underline" onClick={() => openFolder(null)}>Media</button>
              {folderPath.map((folder) => <span key={folder.id} className="flex items-center gap-1.5"><span>/</span><button type="button" className="hover:text-dgb hover:underline" onClick={() => openFolder(folder.id)}>{folder.name}</button></span>)}
            </div>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div><h2 className="font-montserrat text-xl font-semibold text-dgb-900">{currentFolder?.name ?? "Root media"}</h2><p className="mt-1 text-xs text-muted-foreground">{normalizedQuery ? `${visibleAssets.length} hasil pencarian` : `${visibleAssets.length} file dan ${childFolders.length} folder`}</p></div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative sm:w-56"><Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari seluruh media" className="h-10 rounded-md border-input pl-9 text-sm" /></div>
                <div className="flex h-10 rounded-md border border-border bg-muted p-1"><button type="button" aria-label="Tampilan grid" className={cn("grid w-8 place-items-center rounded-sm", viewMode === "grid" ? "bg-white text-dgb shadow-sm" : "text-muted-foreground")} onClick={() => setViewMode("grid")}><Grid2X2 size={15} /></button><button type="button" aria-label="Tampilan list" className={cn("grid w-8 place-items-center rounded-sm", viewMode === "list" ? "bg-white text-dgb shadow-sm" : "text-muted-foreground")} onClick={() => setViewMode("list")}><List size={15} /></button></div>
              </div>
            </div>
            <form action={createMediaFolderAction} className="flex flex-col gap-2 rounded-lg border border-dashed border-dgb-200 bg-dgb-50/35 p-3 sm:flex-row">
              <input type="hidden" name="parentId" value={currentFolderId ?? ""} />
              <AdminInput name="name" required maxLength={80} placeholder={currentFolder ? `Folder baru di ${currentFolder.name}` : "Nama folder baru"} />
              <AdminButton type="submit" variant="secondary" className="shrink-0"><FolderPlus size={15} /> Buat folder</AdminButton>
            </form>
          </div>

          {!normalizedQuery && childFolders.length ? (
            <div className="grid gap-2 border-b border-border py-4 sm:grid-cols-2 lg:grid-cols-3">
              {childFolders.map((folder) => (
                <button type="button" key={folder.id} onClick={() => openFolder(folder.id)} className="flex items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:border-fb-300 hover:bg-fb-50">
                  <span className="grid size-9 place-items-center rounded-md bg-fb-50 text-fb-700"><Folder size={17} /></span>
                  <span className="min-w-0"><span className="block truncate text-sm font-semibold text-dgb-900">{folder.name}</span><span className="block text-xs text-muted-foreground">{folderCount(folder.id)} file</span></span>
                </button>
              ))}
            </div>
          ) : null}

          {visibleAssets.length === 0 ? (
            <div className="py-16 text-center"><span className="mx-auto grid size-11 place-items-center rounded-md bg-muted text-muted-foreground"><FileImage size={19} /></span><h3 className="mt-3 font-montserrat text-base font-semibold text-dgb-900">File tidak ditemukan</h3><p className="mt-1 text-sm text-muted-foreground">Unggah file atau pilih folder lain.</p></div>
          ) : (
            <div className={viewMode === "grid" ? "grid gap-3 pt-4 sm:grid-cols-2 lg:grid-cols-3" : "space-y-2 pt-4"}>
              {visibleAssets.map((asset) => (
                <button type="button" key={asset.id} onClick={() => setSelectedId(asset.id)} className={viewMode === "grid" ? cn("group overflow-hidden rounded-lg border text-left transition-colors", selectedId === asset.id ? "border-fb-400 bg-fb-50/45 ring-2 ring-fb-100" : "border-border bg-white hover:border-dgb-200") : cn("flex w-full items-center gap-3 rounded-md border p-2 text-left transition-colors", selectedId === asset.id ? "border-fb-400 bg-fb-50/45" : "border-border hover:border-dgb-200")}>
                  {viewMode === "grid" ? (
                    <><div className="relative aspect-[4/3] overflow-hidden bg-muted">{asset.mimeType.startsWith("image/") ? <Image src={asset.url} alt={asset.alt ?? asset.filename} fill sizes="(max-width: 640px) 100vw, 260px" className="object-cover transition-transform duration-300 group-hover:scale-[1.02]" /> : <FileImage size={26} className="absolute inset-0 m-auto text-muted-foreground" />}</div><div className="p-3"><p className="truncate text-sm font-semibold text-dgb-900">{asset.filename}</p><p className="mt-1 text-xs text-muted-foreground">{formatBytes(asset.bytes)} · {asset.lifecycle}</p></div></>
                  ) : (
                    <><div className="relative size-11 shrink-0 overflow-hidden rounded-md bg-muted">{asset.mimeType.startsWith("image/") ? <Image src={asset.url} alt="" fill sizes="44px" className="object-cover" /> : <FileImage size={17} className="absolute inset-0 m-auto text-muted-foreground" />}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-dgb-900">{asset.filename}</p><p className="mt-1 text-xs text-muted-foreground">{formatBytes(asset.bytes)} · {asset.lifecycle}</p></div>{selectedId === asset.id ? <Check size={15} className="mr-2 text-fb-600" /> : null}</>
                  )}
                </button>
              ))}
            </div>
          )}
        </section>

        <aside className="border-t border-border bg-muted/35 p-4 xl:border-l xl:border-t-0">
          {selectedAsset ? (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-fb-700">Detail file</p>
              <div className="relative mt-3 aspect-square overflow-hidden rounded-lg bg-muted">{selectedAsset.mimeType.startsWith("image/") ? <Image src={selectedAsset.url} alt={selectedAsset.alt ?? selectedAsset.filename} fill sizes="280px" className="object-cover" /> : <FileImage size={28} className="absolute inset-0 m-auto text-muted-foreground" />}</div>
              <h3 className="mt-4 break-words font-montserrat text-base font-semibold text-dgb-900">{selectedAsset.filename}</h3>
              <dl className="mt-3 space-y-2 text-xs"><div className="flex justify-between gap-4"><dt className="text-muted-foreground">Ukuran</dt><dd className="font-medium text-foreground">{formatBytes(selectedAsset.bytes)}</dd></div><div className="flex justify-between gap-4"><dt className="text-muted-foreground">Tipe</dt><dd className="max-w-40 truncate font-medium text-foreground">{selectedAsset.mimeType}</dd></div><div className="flex justify-between gap-4"><dt className="text-muted-foreground">Status</dt><dd className="font-medium text-emerald-700">{selectedAsset.lifecycle}</dd></div></dl>
              <form action={moveMediaAssetAction} className="mt-5 space-y-2 border-t border-border pt-4">
                <input type="hidden" name="assetId" value={selectedAsset.id} />
                <label className="text-xs font-semibold text-foreground" htmlFor="move-folder">Pindahkan ke</label>
                <AdminSelect id="move-folder" name="folderId" defaultValue={selectedAsset.folderId ?? ""}><option value="">Root media</option>{flatFolders.map((folder) => <option key={folder.id} value={folder.id}>{`${"  ".repeat(folder.depth)}${folder.name}`}</option>)}</AdminSelect>
                <AdminButton type="submit" className="w-full">Pindahkan file</AdminButton>
              </form>
              <div className="mt-3 grid grid-cols-2 gap-2"><Button type="button" variant="outline" className="h-9 rounded-md text-xs" onClick={copyUrl}><Clipboard size={14} /> Salin URL</Button><Button asChild className="h-9 rounded-md bg-dgb text-xs hover:bg-dgb-600"><a href={selectedAsset.url} target="_blank" rel="noreferrer">Buka <ArrowUpRight size={14} /></a></Button></div>
            </div>
          ) : currentFolder ? (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-fb-700">Detail folder</p>
              <span className="mt-4 grid size-12 place-items-center rounded-md bg-fb-50 text-fb-700"><FolderOpen size={21} /></span>
              <h3 className="mt-3 font-montserrat text-lg font-semibold text-dgb-900">{currentFolder.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{folderCount(currentFolder.id)} file di dalam struktur ini</p>
              <form action={renameMediaFolderAction} className="mt-5 space-y-2 border-t border-border pt-4"><input type="hidden" name="folderId" value={currentFolder.id} /><label className="text-xs font-semibold" htmlFor="rename-folder">Ubah nama folder</label><AdminInput id="rename-folder" name="name" defaultValue={currentFolder.name} required maxLength={80} /><AdminButton type="submit" variant="secondary" className="w-full">Simpan nama</AdminButton></form>
            </div>
          ) : (
            <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-fb-700">Informasi</p><span className="mt-4 grid size-12 place-items-center rounded-md bg-dgb-50 text-dgb"><FolderOpen size={21} /></span><h3 className="mt-3 font-montserrat text-base font-semibold text-dgb-900">Pilih file atau folder</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">Detail dan tindakan pengelolaan akan tersedia di panel ini.</p></div>
          )}
        </aside>
      </div>
    </div>
  );
}
