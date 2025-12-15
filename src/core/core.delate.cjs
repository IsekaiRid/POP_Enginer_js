const fs = require("fs");
const path = require("path");

/* =========================
   PATH HELPER
========================= */
function getProjectsRoot() {
  return path.join(process.cwd(), "projects");
}

function getProjectPath(name) {
  if (!name || name.includes("..") || name.includes("/")) {
    throw new Error("Nama project tidak valid");
  }

  return path.join(getProjectsRoot(), name);
}

/* =========================
   DELETE CORE
========================= */
function deleteProject(name) {
  const projectPath = getProjectPath(name);

  if (!fs.existsSync(projectPath)) {
    throw new Error("Project tidak ditemukan");
  }

  fs.rmSync(projectPath, {
    recursive: true,
    force: true
  });

  return {
    name,
    deleted: true
  };
}

/* =========================
   EXPORT
========================= */
module.exports = {
  deleteProject
};
