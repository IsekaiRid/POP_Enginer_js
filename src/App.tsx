import React from "react";
import { motion, AnimatePresence } from "framer-motion";

type Project = {
  name: string;
};

declare global {
  interface Window {
    engine: {
      deleteProject(name: string): unknown;
      createProject: (data: {
        name: string;
        version: string;
        description: string;
      }) => Promise<{ name: string }>;
      listProjects: () => Promise<Project[]>;
      launchProject: (folderPath: string) => Promise<{
        ok: boolean;
        bundle?: any;      // AST hasil kompilasi
        error?: string;
      }>;
      openGameWindow(bundle: any): void;
    };
  }
}

export default function App() {

  const [activeProject, setActiveProject] = React.useState<string | null>(null);
  const [showModal, setShowModal] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [formData, setFormData] = React.useState({
    name: "",
    version: "1.0.0",
    description: ""
  });

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateProject = async () => {
    if (!formData.name.trim()) {
      alert("Nama proyek wajib diisi!");
      return;
    }

    try {
      const { name } = await window.engine.createProject(formData);

      setProjects(prev => [...prev, { name }]);
      setActiveProject(name);

      setFormData({
        name: "",
        version: "1.0.0",
        description: ""
      });

      setShowModal(false);
    } catch (err: any) {
      alert(err.message || "Gagal membuat project");
    }
  };

  const handleDeleteProject = async (name: string) => {
    if (!confirm(`Hapus project "${name}"?`)) return;

    await window.engine.deleteProject(name);

    setProjects(prev => prev.filter(p => p.name !== name));

    if (activeProject === name) {
      setActiveProject(null);
    }
  };

  // async function handleLaunch() {
  //   if (!activeProject) {
  //     alert('Pilih project dulu!');
  //     return;
  //   }
  //   const res = await window.engine.launchProject(activeProject);
  //   window.engine.openGameWindow(res.bundle);
  //   if (res.ok) {
  //     console.log('AST siap:', res.bundle);
  //   } else {
  //     alert(`Gagal launch:\n${res.error}`);
  //   }
  // }

  async function handleLaunch() {
    if (!activeProject) {
      alert("Pilih project dulu!");
      return;
    }

    const res = await window.engine.launchProject(activeProject);

    if (res.ok) {
      window.engine.openGameWindow({
        bundle: res.bundle,
        projectName: activeProject
      });
    } else {
      alert(`Gagal launch:\n${res.error}`);
    }
  }


  const handleOpenEditor = () => {
    if (!activeProject) {
      alert("Pilih project dulu!");
      return;
    }

    alert(`Membuka ${activeProject} di editor...`);
  };



  React.useEffect(() => {
    window.engine.listProjects().then(setProjects);
  }, []);


  return (
    <div className="w-full h-screen flex bg-white" style={{ fontFamily: '"Segoe UI", sans-serif' }}>

      {/* SIDEBAR */}
      <div
        className="flex flex-col"
        style={{
          width: "320px",
          background: "white",
          boxShadow: "0 4px 20px rgba(255, 182, 193, .15)"
        }}
      >

        {/* HEADER SIDEBAR */}
        <div
          className="flex items-center px-6 border-b"
          style={{ height: "56px", borderColor: "#ffe8f0" }}
        >
          <h2 className="text-xl font-semibold text-gray-800">Proyek Saya</h2>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">

          {/* SEARCH BAR */}
          <div className="px-6 py-4">
            <input
              type="text"
              placeholder="Cari proyek..."
              className="w-full px-3 py-2 rounded-lg border-2 border-gray-300 text-sm focus:outline-none focus:border-pink-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* PROJECT LIST */}
          <div className="flex-1 px-6 pb-4 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
            {filteredProjects.map((project) => (
              <div
                key={project.name}
                className={`px-3 py-3 mb-3 rounded-lg cursor-pointer transition-all duration-250 flex justify-between items-center ${activeProject === project.name ? "text-white" : ""
                  }`}
                style={{
                  background: activeProject === project.name ? "#ffb6c1" : "#fef7f9",
                  border: activeProject === project.name ? "none" : "2px solid #ffe8f0"
                }}
                onClick={() => setActiveProject(project.name)}
              >
                <div className=" w-full justify-between items-center flex">
                  <span className="font-medium">{project.name}</span>
                  <svg onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteProject(project.name);
                  }} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                    <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
                  </svg>
                </div>
              </div>
            ))}
          </div>

          {/* BUTTON CREATE PROJECT */}
          <div className="p-6 border-t" style={{ borderColor: "#ffe8f0" }}>
            <button
              className="w-full py-3 rounded-lg text-white font-medium transition-colors hover:opacity-90"
              style={{ background: "#ffb6c1" }}
              onClick={() => setShowModal(true)}
            >
              + Buat Proyek Baru
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div
        className="flex-1 flex flex-col"
        style={{
          background: "white",
          boxShadow: "0 4px 20px rgba(255, 182, 193, .15)"
        }}
      >

        {/* HEADER WORKSPACE */}
        <div
          className="flex items-center justify-between px-6 border-b"
          style={{ height: "56px", borderColor: "#ffe8f0" }}
        >
          <h2 className="text-2xl font-semibold" style={{ color: "#ffb6c1" }}>
            Workspace {activeProject ? `– ${activeProject}` : ""}
          </h2>
        </div>

        {/* CONTENT */}
        <div className="flex-1 p-6 overflow-y-auto">

          {/* FILE SECTION */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">📁 File</h3>
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}>
              <div className="border-2 border-gray-300 p-4 rounded-lg text-center cursor-pointer transition-all hover:border-pink-400">
                📂<br />game
              </div>
              <div className="border-2 border-gray-300 p-4 rounded-lg text-center cursor-pointer transition-all hover:border-pink-400">
                📂<br />assets
              </div>
            </div>
          </div>

          {/* TOOLS SECTION */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">🛠️ Tools</h3>
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}>
              <div
                className="border-2 border-gray-300 p-4 rounded-lg text-center cursor-pointer transition-all hover:border-pink-400"
                onClick={handleOpenEditor}
              >
                ✓<br />Code Script
              </div>
            </div>
          </div>

          {/* DEPLOY SECTION */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">🌍 Deploy</h3>
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}>
              <div className="border-2 border-gray-300 p-4 rounded-lg text-center cursor-pointer transition-all hover:border-pink-400">
                💻<br />Desktop Build
              </div>
            </div>
          </div>

          {/* LAUNCH BUTTON */}
          <button
            className="w-full py-4 rounded-xl text-white text-lg font-medium transition-colors hover:opacity-90"
            style={{ background: "#ffb6c1" }}
            onClick={handleLaunch}
          >
            🚀 Jalankan Proyek
          </button>
        </div>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 modal-backdrop"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowModal(false);
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* Konten modal */}
            <motion.div
              className="bg-white rounded-2xl p-8 w-11/12 max-w-md modal-content"
              style={{ boxShadow: "0 20px 60px rgba(255, 182, 193, .4)" }}
              initial={{ y: 40, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {/* Header */}
              <motion.div
                className="flex items-center justify-between mb-6"
                initial={{ y: -15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.05 }}
              >
                <h3 className="text-2xl font-bold" style={{ color: "#ffb6c1" }}>
                  ✨ Buat Proyek Baru
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none transition-colors"
                >
                  ×
                </button>
              </motion.div>

              {/* Form fields */}
              <motion.form
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCreateProject();
                }}
              >
                {/* Nama Proyek */}
                <motion.label
                  className="block mb-4"
                  initial={{ x: -15, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Proyek *
                  </span>
                  <input
                    type="text"
                    placeholder="Contoh: MyAwesomeVN"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-400 transition-colors"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </motion.label>

                {/* Versi */}
                <motion.label
                  className="block mb-4"
                  initial={{ x: -15, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.25 }}
                >
                  <span className="block text-sm font-medium text-gray-700 mb-2">
                    Versi
                  </span>
                  <input
                    type="text"
                    placeholder="1.0.0"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-400 transition-colors"
                    value={formData.version}
                    onChange={(e) =>
                      setFormData({ ...formData, version: e.target.value })
                    }
                  />
                </motion.label>

                {/* Deskripsi */}
                <motion.label
                  className="block mb-6"
                  initial={{ x: -15, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <span className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi
                  </span>
                  <textarea
                    rows={4}
                    placeholder="Ceritakan tentang proyek visual novel Anda..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-400 transition-colors resize-none"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </motion.label>

                {/* Tombol aksi */}
                <motion.div
                  className="flex gap-3 justify-end"
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.35 }}
                >
                  <button
                    type="button"
                    className="px-6 py-3 rounded-xl text-sm font-medium cursor-pointer transition-all hover:bg-gray-200"
                    style={{ background: "#f5f5f5", color: "#666" }}
                    onClick={() => setShowModal(false)}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl text-white text-sm font-medium cursor-pointer transition-all hover:shadow-lg"
                    style={{ background: "#ffb6c1" }}
                  >
                    🚀 Buat Proyek
                  </button>
                </motion.div>
              </motion.form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`
        *::-webkit-scrollbar { width: 7px; }
        *::-webkit-scrollbar-thumb { background: #ffb6c1; border-radius: 5px; }
      `}</style>
    </div>
  );
}
