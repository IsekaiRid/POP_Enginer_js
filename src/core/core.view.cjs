const fs = require("fs");
const path = require("path");

/* =========================
   PATH HELPER
========================= */
function getProjectsRoot() {
  return path.join(process.cwd(), "projects");
}

/* =========================
   VIEW FUNCTIONS
========================= */

// ambil semua project
function listProjects() {
  const root = getProjectsRoot();

  if (!fs.existsSync(root)) {
    return [];
  }

  return fs
    .readdirSync(root, { withFileTypes: true })
    .filter(dir => dir.isDirectory())
    .map(dir => {
      const projectPath = path.join(root, dir.name);
      const configPath = path.join(projectPath, "project.json");

      let config = null;

      if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      }

      return {
        name: dir.name,
        path: projectPath,
        config
      };
    });
}

// load 1 project
function loadProject(name) {
  const projectPath = path.join(getProjectsRoot(), name);
  const configPath = path.join(projectPath, "project.json");

  if (!fs.existsSync(configPath)) {
    throw new Error("Project tidak ditemukan");
  }

  return JSON.parse(fs.readFileSync(configPath, "utf-8"));
}

/* =========================
   EXPORT
========================= */
module.exports = {
  listProjects,
  loadProject
};



