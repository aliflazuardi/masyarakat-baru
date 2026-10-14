// Postbuild: Next's static export writes generated OG images without a file
// extension (out/**/opengraph-image). Static hosts like GitHub Pages pick the
// Content-Type from the extension, so rename them to .png and update references.
import { readdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.argv[2] ?? "out";

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else yield p;
  }
}

let renamed = 0;
let rewritten = 0;
for await (const file of walk(root)) {
  if (file.endsWith("/opengraph-image")) {
    await rename(file, `${file}.png`);
    renamed++;
  } else if (file.endsWith(".html") || file.endsWith(".txt")) {
    const text = await readFile(file, "utf8");
    const next = text.replace(/opengraph-image(?=[?"\\])/g, "opengraph-image.png");
    if (next !== text) {
      await writeFile(file, next);
      rewritten++;
    }
  }
}
console.log(`OG images: renamed ${renamed}, updated references in ${rewritten} files`);
