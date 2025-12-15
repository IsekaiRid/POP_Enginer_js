const fs = require("fs");
const path = require("path");

/* =========================
   FS UTIL (PRIVATE)
========================= */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyFolderRecursive(src, dest) {
  ensureDir(dest);

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyFolderRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/* =========================
   PROJECT CORE
========================= */
function generateProjectConfig({ name, version, description }) {
  return {
    name,
    version,
    description,
    engine: "POP Engine",
    createdAt: new Date().toISOString()
  };
}

function createProject({ name, version = "1.0.0", description = "" }) {
  if (!name || !name.trim()) {
    throw new Error("Nama project wajib diisi");
  }

  const root = process.cwd();
  const projectsRoot = path.join(root, "projects");
  const projectPath = path.join(projectsRoot, name);
  const examplePath = path.join(root, "src/example");

  if (fs.existsSync(projectPath)) {
    throw new Error("Project sudah ada");
  }

  ensureDir(projectsRoot);
  copyFolderRecursive(examplePath, projectPath);

  // 🔽 Opsi B: merge project.json
  const pjPath = path.join(projectPath, "project.json");
  const defaultCfg = generateProjectConfig({ name, version, description });

  let finalCfg = defaultCfg;
  if (fs.existsSync(pjPath)) {
    const userCfg = JSON.parse(fs.readFileSync(pjPath, "utf8"));
    finalCfg = { ...userCfg, ...defaultCfg }; // user punya prioritas
  }

  fs.writeFileSync(pjPath, JSON.stringify(finalCfg, null, 2));

  return {
    name,
    path: projectPath,
    config: finalCfg
  };
}

/* =========================
   MODULE EXPORT (PUBLIC API)
========================= */
module.exports = {
  createProject
};
