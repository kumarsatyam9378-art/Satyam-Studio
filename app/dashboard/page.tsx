'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { getUserProjects, createProject, deleteProject, Project } from '@/lib/firebase/projects';
import { logout } from '@/lib/firebase/auth';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading]);

  useEffect(() => {
    if (user) {
      setFetching(true);
      getUserProjects(user.uid)
        .then((p) => setProjects(p))
        .catch(() => setProjects([]))
        .finally(() => setFetching(false));
    }
  }, [user]);

  const handleNew = async (type: 'video' | 'image') => {
    if (!user) return;
    const project = await createProject({
      name: `New ${type === 'video' ? 'Video' : 'Image'} Project`,
      type,
      data: {},
      userId: user.uid,
    });
    router.push(`/editor?id=${project.id}&type=${type}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    await deleteProject(id!);
    setProjects(projects.filter((p) => p.id !== id));
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // Sirf Firebase auth check ke time loading dikhao
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🎬</div>
          <div className="text-white text-xl font-semibold">Satyam Studio</div>
          <div className="text-gray-400 text-sm mt-2">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">🎬 Satyam Studio</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-white transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* New Project */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
          <div className="flex gap-4">
            <button
              onClick={() => handleNew('video')}
              className="flex-1 max-w-xs bg-blue-600 hover:bg-blue-700 rounded-xl p-6 text-left transition"
            >
              <div className="text-3xl mb-2">🎬</div>
              <div className="font-semibold text-lg">Video Editor</div>
              <div className="text-blue-200 text-sm">Multi-track timeline, effects, transitions</div>
            </button>
            <button
              onClick={() => handleNew('image')}
              className="flex-1 max-w-xs bg-purple-600 hover:bg-purple-700 rounded-xl p-6 text-left transition"
            >
              <div className="text-3xl mb-2">🖼️</div>
              <div className="font-semibold text-lg">Image Editor</div>
              <div className="text-purple-200 text-sm">Filters, layers, AI tools</div>
            </button>
          </div>
        </div>

        {/* Projects */}
        <div>
          <h2 className="text-xl font-semibold mb-4">My Projects ({projects.length})</h2>
          {fetching ? (
            <div className="text-center py-20 text-gray-500">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              No projects yet. Create your first one above!
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-600 transition group"
                >
                  <div
                    className="aspect-video bg-gray-800 flex items-center justify-center cursor-pointer"
                    onClick={() => router.push(`/editor?id=${project.id}&type=${project.type}`)}
                  >
                    {project.thumbnail ? (
                      <img src={project.thumbnail} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl">{project.type === 'video' ? '🎬' : '🖼️'}</span>
                    )}
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm truncate">{project.name}</div>
                      <div className="text-gray-500 text-xs capitalize">{project.type}</div>
                    </div>
                    <button
                      onClick={() => handleDelete(project.id!)}
                      className="text-gray-600 hover:text-red-400 transition opacity-0 group-hover:opacity-100 text-lg"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
