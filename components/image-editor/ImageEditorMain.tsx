'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Project } from '@/lib/firebase/projects';
import { uploadFile } from '@/lib/firebase/storage';
import { useAuth } from '@/lib/hooks/useAuth';

interface ImageEditorProps {
  project: Project;
  onSave: (data: any) => Promise<void>;
}

interface Adjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  hue: number;
  opacity: number;
}

const FILTERS = [
  { name: 'Original', css: 'none' },
  { name: 'Grayscale', css: 'grayscale(100%)' },
  { name: 'Sepia', css: 'sepia(100%)' },
  { name: 'Vivid', css: 'saturate(200%) contrast(110%)' },
  { name: 'Cool', css: 'hue-rotate(180deg) saturate(120%)' },
  { name: 'Warm', css: 'sepia(40%) saturate(150%)' },
  { name: 'Vintage', css: 'sepia(60%) contrast(90%) brightness(90%)' },
  { name: 'Cinematic', css: 'contrast(120%) saturate(80%) brightness(95%)' },
  { name: 'Noir', css: 'grayscale(100%) contrast(130%)' },
  { name: 'Fade', css: 'opacity(80%) brightness(110%) saturate(80%)' },
  { name: 'Neon', css: 'saturate(300%) contrast(120%)' },
  { name: 'Dreamy', css: 'brightness(110%) saturate(120%) blur(0.5px)' },
];

export default function ImageEditorMain({ project, onSave }: ImageEditorProps) {
  const { user } = useAuth();
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageSrc, setImageSrc] = useState<string>(project.data?.imageSrc || '');
  const [activeFilter, setActiveFilter] = useState(project.data?.filter || 'none');
  const [activePanel, setActivePanel] = useState<'adjust' | 'filters' | 'crop' | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [adj, setAdj] = useState<Adjustments>(project.data?.adjustments || {
    brightness: 100, contrast: 100, saturation: 100, blur: 0, hue: 0, opacity: 100,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filterStyle = {
    filter: [
      activeFilter !== 'none' ? activeFilter : '',
      `brightness(${adj.brightness}%)`,
      `contrast(${adj.contrast}%)`,
      `saturate(${adj.saturation}%)`,
      adj.blur > 0 ? `blur(${adj.blur}px)` : '',
      `hue-rotate(${adj.hue}deg)`,
      `opacity(${adj.opacity}%)`,
    ].filter(Boolean).join(' '),
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const url = await uploadFile(file, user.uid);
    setImageSrc(url);
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave({ imageSrc, filter: activeFilter, adjustments: adj });
    setSaving(false);
  };

  const handleDownload = () => {
    if (!imageSrc) return;
    const a = document.createElement('a');
    a.href = imageSrc;
    a.download = 'hyperedit-export.jpg';
    a.click();
  };

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
        <button onClick={handleDownload} disabled={!imageSrc} className="text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-lg border border-gray-700 disabled:opacity-30">
          ⬇ Export
        </button>
        <button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50">
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Toolbar */}
        <div className="w-14 bg-gray-900 border-r border-gray-800 flex flex-col items-center py-4 gap-3">
          {[
            { icon: '🖼️', label: 'Upload', action: () => fileInputRef.current?.click() },
            { icon: '🎨', label: 'Filters', action: () => setActivePanel(activePanel === 'filters' ? null : 'filters') },
            { icon: '⚙️', label: 'Adjust', action: () => setActivePanel(activePanel === 'adjust' ? null : 'adjust') },
            { icon: '✂️', label: 'Crop', action: () => setActivePanel(activePanel === 'crop' ? null : 'crop') },
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
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </div>

        {/* Canvas / Preview */}
        <div className="flex-1 bg-[#111] flex items-center justify-center overflow-hidden">
          {uploading ? (
            <div className="text-gray-400">Uploading...</div>
          ) : imageSrc ? (
            <img
              src={imageSrc}
              alt="Editing"
              style={{ ...filterStyle, maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
            />
          ) : (
            <div className="text-center text-gray-600">
              <div className="text-6xl mb-4">🖼️</div>
              <p className="text-lg">Upload an image to start editing</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg text-sm"
              >
                Upload Image
              </button>
            </div>
          )}
        </div>

        {/* Right Panel */}
        {activePanel && (
          <div className="w-72 bg-gray-900 border-l border-gray-800 p-4 overflow-y-auto">
            {activePanel === 'filters' && (
              <div>
                <h3 className="font-semibold mb-3 text-sm text-gray-300">Filters</h3>
                <div className="grid grid-cols-2 gap-2">
                  {FILTERS.map((f) => (
                    <button
                      key={f.name}
                      onClick={() => setActiveFilter(f.css)}
                      className={`py-2 px-3 rounded-lg text-sm transition ${
                        activeFilter === f.css ? 'bg-purple-600' : 'bg-gray-800 hover:bg-gray-700'
                      }`}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activePanel === 'adjust' && (
              <div>
                <h3 className="font-semibold mb-3 text-sm text-gray-300">Adjustments</h3>
                <div className="space-y-4">
                  {([
                    { key: 'brightness', label: 'Brightness', min: 0, max: 200 },
                    { key: 'contrast', label: 'Contrast', min: 0, max: 200 },
                    { key: 'saturation', label: 'Saturation', min: 0, max: 200 },
                    { key: 'blur', label: 'Blur', min: 0, max: 10 },
                    { key: 'hue', label: 'Hue Rotate', min: 0, max: 360 },
                    { key: 'opacity', label: 'Opacity', min: 0, max: 100 },
                  ] as const).map(({ key, label, min, max }) => (
                    <div key={key}>
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>{label}</span>
                        <span>{adj[key]}</span>
                      </div>
                      <input
                        type="range" min={min} max={max}
                        value={adj[key]}
                        onChange={(e) => setAdj((prev) => ({ ...prev, [key]: parseInt(e.target.value) }))}
                        className="w-full accent-purple-500"
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => setAdj({ brightness: 100, contrast: 100, saturation: 100, blur: 0, hue: 0, opacity: 100 })}
                    className="w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm"
                  >
                    Reset All
                  </button>
                </div>
              </div>
            )}

            {activePanel === 'crop' && (
              <div>
                <h3 className="font-semibold mb-3 text-sm text-gray-300">Crop Presets</h3>
                <div className="space-y-2">
                  {['1:1 Square', '16:9 Widescreen', '9:16 Portrait', '4:3 Standard', '3:2 Photo', 'Free'].map((ratio) => (
                    <button key={ratio} className="w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-left px-3">
                      {ratio}
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
