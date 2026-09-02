import "dotenv/config";
import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

type Report = { mode: "dry-run"; generatedAt: string; sourceHash: string; files: Record<string, { bytes: number; arrays: number; urls: number }>; publicAssets: { total: number; images: number; videos: number; pdfs: number }; blockers: string[]; notes: string[] };
const args = process.argv.slice(2);
const wantsApply = args.includes("--apply");
const dryRun = args.includes("--dry-run") || !wantsApply;
const reportIndex = args.indexOf("--report");
const reportPath = reportIndex >= 0 ? args[reportIndex + 1] : ".tmp/cms-import-2025.json";
if (wantsApply) throw new Error("Import apply belum diotorisasi. Jalankan --dry-run; apply hanya dibuka setelah backup, mapping sponsor, dan persetujuan target eksplisit.");
if (!dryRun || !reportPath) throw new Error("Gunakan --dry-run --report <path>");

async function walk(dir: string): Promise<string[]> {const output:string[]=[];for(const entry of await readdir(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);if(entry.isDirectory())output.push(...await walk(full));else output.push(full)}return output}
async function main(){const sourceFiles = ["src/lib/data.ts", "src/lib/finalist.ts", "src/lib/news.ts", "src/lib/organogram.ts"];const hash = createHash("sha256");const files: Report["files"] = {};for (const filename of sourceFiles) {const text = await readFile(filename, "utf8"); hash.update(filename).update(text);files[filename] = { bytes: Buffer.byteLength(text), arrays: (text.match(/\[[\s\S]*?\]/g) ?? []).length, urls: (text.match(/https?:\/\//g) ?? []).length };}const assets = await walk("public");const extensions = assets.map(f=>path.extname(f).toLowerCase());for (const asset of assets) {const info=await stat(asset);hash.update(asset).update(String(info.size))}const report: Report = { mode: "dry-run", generatedAt: new Date().toISOString(), sourceHash: hash.digest("hex"), files, publicAssets: { total: assets.length, images: extensions.filter(e=>[".avif",".gif",".jpeg",".jpg",".png",".svg",".webp"].includes(e)).length, videos: extensions.filter(e=>[".mp4",".webm",".mov"].includes(e)).length, pdfs: extensions.filter(e=>e===".pdf").length }, blockers: ["Mapping sponsor 2025 ke tier utama/pendukung/pendamping/pelengkap belum disetujui operator.", "Backup Git hardcoded dan snapshot Turso target belum dibuat/diverifikasi.", "Visual parity dan target environment belum disetujui operator."], notes: ["Tidak ada database write pada mode dry-run.", "Public runtime tetap memakai sumber hardcoded sampai cutover berizin.", "Source hash mendeteksi perubahan inventaris sebelum import sebenarnya."] };await mkdir(path.dirname(reportPath),{recursive:true});await writeFile(reportPath,JSON.stringify(report,null,2)+"\n","utf8");console.log(JSON.stringify({ report: reportPath, sourceHash: report.sourceHash, publicAssets: report.publicAssets, blockers: report.blockers.length },null,2));}
main().catch((error)=>{console.error(error);process.exitCode=1});
