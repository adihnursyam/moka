import "dotenv/config";
import { createClient } from "@libsql/client/node";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

async function main(){const url=process.env.TURSO_DATABASE_URL,authToken=process.env.TURSO_AUTH_TOKEN;if(!url||!authToken)throw new Error("Turso env belum lengkap");const host=new URL(url).host;const confirm=process.argv[process.argv.indexOf("--confirm-host")+1];if(confirm!==host)throw new Error(`Target harus dikonfirmasi dengan --confirm-host ${host}`);const client=createClient({url,authToken});try{await migrate(drizzle(client),{migrationsFolder:"drizzle"});const tables=await client.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name");console.log(JSON.stringify({target:host,migrated:true,tables:tables.rows.map(r=>r.name)},null,2))}finally{client.close()}}
main().catch(error=>{console.error(error instanceof Error?error.message:"Migration gagal");process.exitCode=1});
