'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Project } from '@/lib/firebase/projects';
import { uploadFile } from '@/lib/firebase/storage';
import { useAuth } from '@/lib/hooks/useAuth';

interface Track {
  id: string;
  type: 'video' | 'audio' | 'text' | 'image';
  src?: string;
  startTime: number;
  duration: number;
  name: string;
  volume?: number;
  opacity?: number;
  filter?: string;
}

interface VideoEditorProps {
  project: Project;
  onSave: (data: any) => Promise<void>;
}

export default function VideoEditorMain({ project, onSave }: VideoEditorProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [tracks, setTracks] = useState<Track[]>(project.data?.tracks || []);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<'filters' | 'text' | 'audio' | 'transitions' | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selected = tracks.find((t) => t.id === selectedTrack);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const url = await uploadFile(file, user.uid, setUploadProgress);
    const isVideo = file.type.startsWith('video/');
    const newTrack: Track = {
      id: Date.now().toString(),
      type: isVideo ? 'video' : 'audio',
      src: url,
      startTime: 0,
      duration: 10,
      name: file.name,
      volume: 1,
      opacity: 1,
    };
    setTracks((prev) => [...prev, newTrack]);
    setUploadProgress(0);
  };

  const addTextTrack = () => {
    const t: Track = {
      id: Date.now().toString(),
      type: 'text',
      startTime: 0,
      duration: 5,
      name: 'New Text',
    };
    setTracks((prev) => [...prev, t]);
    setSelectedTrack(t.id);
  };

  const updateTrack = (id: string, updates: Partial<Track>) => {
    setTracks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteTrack = (id: string) => {
    setTracks((prev) => prev.filter((t) => t.id !== id));
    if (selectedTrack === id) setSelectedTrack(null);
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave({ tracks });
    setSaving(false);
  };

  const FILTERS = ['None', 'Grayscale', 'Sepia', 'Vivid', 'Cool', 'Warm', 'Vintage', 'Cinematic'];

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white">
      {/* Top Bar */}
      <div className="h-12 bg-gray-900 border-b border-gray-800 flex items-center px-4 gap-3">
        <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-white text-sm">
          ← Dashboard
        </button>
        <span className="text-gray-600">|</span>
        <span className="font-semibold">{project.name}</span>
        <div className="flex-1" />
        {uploadProgress > 0 && (
          <div className="flex items-center gap-2 text-sm text-blue-400">
            Uploading {Math.round(uploadProgress)}%
          </div>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Toolbar */}
        <div className="w-14 bg-gray-900 border-r border-gray-800 flex flex-col items-center py-4 gap-3">
          {[
            { icon: '📹', label: 'Upload', action: () => fileInputRef.current?.click() },
            { icon: '✏️', label: 'Text', action: addTextTrack },
            { icon: '🎨', label: 'Filters', action: () => setActivePanel(activePanel === 'filters' ? null : 'filters') },
            { icon: '🎵', label: 'Audio', action: () => setActivePanel(activePanel === 'audio' ? null : 'audio') },
            { icon: '✨', label: 'Transitions', action: () => setActivePanel(activePanel === 'transitions' ? null : 'transitions') },
          ].map((tool) => (
            <button
              key={tool.label}
              onClick={tool.action}
              title={tool.label}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-800 text-xl transition"
            >
              {tool.icon}
            </button>
          ))}
          <input ref={fileInputRef} type="file" accept="video/*,audio/*" onChange={handleUpload} className="hidden" />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Preview */}
          <div className="flex-1 bg-black flex items-center justify-center relative">
            {tracks.filter((t) => t.type === 'video').length === 0 ? (
              <div className="text-center text-gray-600">
                <div className="text-6xl mb-4">🎬</div>
                <p className="text-lg">Upload a video to start editing</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg text-sm"
                >
                  Upload Video
                </button>
              </div>
            ) : (
              <video
                ref={videoRef}
                src={tracks.find((t) => t.type === 'video')?.src}
                className="max-h-full max-w-full"
                onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
              />
            )}

            {/* Text overlays preview */}
            {tracks.filter((t) => t.type === 'text').map((t) => (
              <div
                key={t.id}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-2xl font-bold pointer-events-none"
                style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}
              >
                {t.name}
              </div>
            ))}
          </div>

          {/* Playback Controls */}
          <div className="h-12 bg-gray-900 border-t border-b border-gray-800 flex items-center justify-center gap-4">
            <button onClick={() => setCurrentTime(0)} className="text-gray-400 hover:text-white text-xl">⏮</button>
            <button
              onClick={() => {
                if (videoRef.current) {
                  isPlaying ? videoRef.current.pause() : videoRef.current.play();
                  setIsPlaying(!isPlaying);
                }
              }}
              className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-lg"
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button className="text-gray-400 hover:text-white text-xl">⏭</button>
            <span className="text-gray-400 text-sm ml-4">{currentTime.toFixed(1)}s</span>
          </div>

          {/* Timeline */}
          <div className="h-48 bg-gray-900 overflow-y-auto">
            <div className="p-2 space-y-1">
              {tracks.length === 0 ? (
                <div className="text-center text-gray-600 py-8 text-sm">No tracks yet</div>
              ) : (
                tracks.map((track) => (
                  <div
                    key={track.id}
                    onClick={() => setSelectedTrack(track.id)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition ${
                      selectedTrack === track.id ? 'bg-blue-900 border border-blue-500' : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    <span className="text-lg">
                      {track.type === 'video' ? '🎬' : track.type === 'audio' ? '🎵' : track.type === 'text' ? '✏️' : '🖼️'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">{track.name}</div>
                      <div className="text-xs text-gray-500 capitalize">{track.type} • {track.duration}s</div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteTrack(track.id); }}
                      className="text-gray-600 hover:text-red-400 transition"
                    >
                      🗑️
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        {(activePanel || selected) && (
          <div className="w-72 bg-gray-900 border-l border-gray-800 p-4 overflow-y-auto">
            {selected && (
              <div className="mb-4">
                <h3 className="font-semibold mb-3 text-sm text-gray-300">Track Properties</h3>
                {selected.type === 'text' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Text Content</label>
                      <input
                        value={selected.name}
                        onChange={(e) => updateTrack(selected.id, { name: e.target.value })}
                        className="w-full bg-gray-800 text-white rounded px-3 py-2 text-sm border border-gray-700"
                      />
                    </div>
                  </div>
                )}
                {(selected.type === 'video' || selected.type === 'audio') && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Volume: {Math.round((selected.volume || 1) * 100)}%</label>
                      <input
                        type="range" min="0" max="1" step="0.1"
                        value={selected.volume || 1}
                        onChange={(e) => updateTrack(selected.id, { volume: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Duration: {selected.duration}s</label>
                      <input
                        type="range" min="1" max="60"
                        value={selected.duration}
                        onChange={(e) => updateTrack(selected.id, { duration: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {activePanel === 'filters' && (
              <div>
                <h3 className="font-semibold mb-3 text-sm text-gray-300">Video Filters</h3>
                <div className="grid grid-cols-2 gap-2">
                  {FILTERS.map((f) => (
                    <button
                      key={f}
                      onClick={() => selected && updateTrack(selected.id, { filter: f })}
                      className={`py-2 px-3 rounded-lg text-sm transition ${
                        selected?.filter === f ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activePanel === 'transitions' && (
              <div>
                <h3 className="font-semibold mb-3 text-sm text-gray-300">Transitions</h3>
                <div className="grid grid-cols-2 gap-2">
                  {['Fade', 'Slide', 'Zoom', 'Wipe', 'Dissolve', 'Flash', 'Blur', 'Spin'].map((t) => (
                    <button key={t} className="py-2 px-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm">
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
