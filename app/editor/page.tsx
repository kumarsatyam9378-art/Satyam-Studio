'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { getProject, updateProject, Project } from '@/lib/firebase/projects';
import VideoEditorMain from '@/components/video-editor/VideoEditorMain';
import ImageEditorMain from '@/components/image-editor/ImageEditorMain';

function EditorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [project, setProject] = useState<Project | null>(null);

  const id = searchParams.get('id');
  const type = searchParams.get('type') as 'video' | 'image';

  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading]);

  useEffect(() => {
    if (id) {
      getProject(id).then(setProject);
    }
  }, [id]);

  const handleSave = async (data: any) => {
    if (!id) return;
    await updateProject(id, { data, updatedAt: new Date() });
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
        Loading editor...
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-950">
      {type === 'video' ? (
        <VideoEditorMain project={project} onSave={handleSave} />
      ) : (
        <ImageEditorMain project={project} onSave={handleSave} />
      )}
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">Loading...</div>}>
      <EditorContent />
    </Suspense>
  );
}
