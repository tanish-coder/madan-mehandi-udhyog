import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSite, type HeroSlide, type ProductionPhoto } from '../../context/SiteContext';
import { uploadMedia } from '../../lib/r2';
import toast from 'react-hot-toast';
import {
  Palette,
  Sliders,
  Plus,
  Trash2,
  Edit2,
  Image as ImageIcon,
  Film,
  Eye,
  Save,
  UploadCloud,
  CheckCircle2,
  Code,
  Sparkles,
  RefreshCw,
  Play,
  Layers,
  X,
  Loader2,
  Check,
  Factory,
} from 'lucide-react';
import Spinner from '../../components/ui/Spinner';

const isYouTubeUrl = (url: string) =>
  Boolean(url && (url.includes('youtube.com') || url.includes('youtu.be')));

const getYouTubeEmbedUrl = (url: string) => {
  if (!url) return '';
  if (url.includes('youtube-nocookie.com/embed/')) return url;
  if (url.includes('embed/')) return url;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  );
  return match
    ? `https://www.youtube-nocookie.com/embed/${match[1]}?autoplay=0&controls=1&rel=0`
    : url;
};

export default function AdminCustomizer() {
  const { customization, heroSlides, loading, updateCustomization, updateHeroSlides, refreshSiteSettings } = useSite();
  const [searchParams, setSearchParams] = useSearchParams();

  const getInitialTab = (): 'slider' | 'about_media' | 'backgrounds' | 'css' => {
    const tab = searchParams.get('tab')?.toLowerCase();
    if (tab === 'about_media' || tab === 'videos' || tab === 'video' || tab === 'about') return 'about_media';
    if (tab === 'backgrounds' || tab === 'bg' || tab === 'logo') return 'backgrounds';
    if (tab === 'css') return 'css';
    return 'slider';
  };

  const [activeTab, setActiveTab] = useState<'slider' | 'about_media' | 'backgrounds' | 'css'>(getInitialTab);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Sync tab state with URL query parameter changes
  React.useEffect(() => {
    const tab = searchParams.get('tab')?.toLowerCase();
    if (tab === 'about_media' || tab === 'videos' || tab === 'video' || tab === 'about') {
      setActiveTab('about_media');
    } else if (tab === 'backgrounds' || tab === 'bg' || tab === 'logo') {
      setActiveTab('backgrounds');
    } else if (tab === 'css') {
      setActiveTab('css');
    } else if (tab === 'slider') {
      setActiveTab('slider');
    }
  }, [searchParams]);

  const switchTab = (tab: 'slider' | 'about_media' | 'backgrounds' | 'css') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Hero Slides Local State for editing
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);

  // Customization Form Local State
  const [brandingForm, setBrandingForm] = useState({
    logo_url: '',
    show_top_right_logo: true,
    hero_bg_image: '',
    hero_bg_video: '',
    hero_headline: '',
    hero_subheadline: '',
    advantage_image: '',
    manufacturing_image: '',
    about_video_url: '',
    about_handmade_video_url: '',
    custom_css: '',
    primary_color: '#c06720',
    announcement_text: '',
  });

  // About Production Photos State
  const [productionPhotos, setProductionPhotos] = useState<ProductionPhoto[]>([]);
  const [newPhoto, setNewPhoto] = useState<ProductionPhoto>({ url: '', title: '', description: '' });

  // Sync state when customization and heroSlides load
  React.useEffect(() => {
    if (customization) {
      setBrandingForm({
        logo_url: customization.logo_url || '',
        show_top_right_logo: customization.show_top_right_logo ?? true,
        hero_bg_image: customization.hero_bg_image || '',
        hero_bg_video: customization.hero_bg_video || '',
        hero_headline: customization.hero_headline || 'Pure Sojat Henna. Trusted Worldwide.',
        hero_subheadline: customization.hero_subheadline || '',
        advantage_image: customization.advantage_image || '',
        manufacturing_image: customization.manufacturing_image || '',
        about_video_url: customization.about_video_url || '',
        about_handmade_video_url: customization.about_handmade_video_url || '',
        custom_css: customization.custom_css || '',
        primary_color: customization.primary_color || '#c06720',
        announcement_text: customization.announcement_text || '',
      });
      setProductionPhotos(customization.about_production_photos || []);
    }
    if (heroSlides) {
      setSlides(heroSlides);
    }
  }, [customization, heroSlides]);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-gray-500">Loading website customization settings...</p>
      </div>
    );
  }

  // ── 1. SLIDE HANDLERS ──
  const handleOpenAddSlide = () => {
    setEditingSlide({
      id: `slide-${Date.now()}`,
      name: '',
      slug: '',
      badge: 'Flagship &bull; Triple-Sifted',
      subtitle: '',
      description: '',
      price: 299,
      pack_size: '100 gm',
      image: '',
      tag: '100% Pure Sojat',
      is_active: true,
    });
    setIsSlideModalOpen(true);
  };

  const handleEditSlide = (slide: HeroSlide) => {
    setEditingSlide({ ...slide });
    setIsSlideModalOpen(true);
  };

  const handleDeleteSlide = async (id: string) => {
    if (slides.length <= 4) {
      toast.error('Requirement notice: You must maintain a minimum of 4 slides for the home hero carousel.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this slide from the homepage hero?')) return;
    const updated = slides.filter((s) => s.id !== id);
    setSlides(updated);
    try {
      await updateHeroSlides(updated);
      toast.success('Slide removed successfully!');
    } catch (err: any) {
      toast.error('Failed to remove slide: ' + err.message);
    }
  };

  const handleSaveSlideModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlide?.name.trim() || !editingSlide.image.trim()) {
      toast.error('Product name and slide image URL are required.');
      return;
    }

    const autoSlug = editingSlide.slug.trim()
      ? editingSlide.slug.trim()
      : editingSlide.name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');

    const updatedSlide = {
      ...editingSlide,
      slug: autoSlug,
    };

    let newSlides: HeroSlide[];
    const exists = slides.some((s) => s.id === updatedSlide.id);
    if (exists) {
      newSlides = slides.map((s) => (s.id === updatedSlide.id ? updatedSlide : s));
    } else {
      newSlides = [...slides, updatedSlide];
    }

    setSlides(newSlides);
    setIsSlideModalOpen(false);

    try {
      await updateHeroSlides(newSlides);
      toast.success(exists ? 'Slide updated successfully!' : 'New slide added to hero carousel!');
    } catch (err: any) {
      toast.error('Failed to save slide: ' + err.message);
    }
  };

  // ── 2. BRANDING & BACKGROUND SAVE ──
  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateCustomization({
        ...brandingForm,
        about_production_photos: productionPhotos,
      });
      toast.success('Website backgrounds, logo, and styles saved to database!');
    } catch (err: any) {
      toast.error('Failed to save branding: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── 3. ABOUT PRODUCTION PHOTOS HANDLERS ──
  const handleAddProductionPhoto = () => {
    if (!newPhoto.url.trim() || !newPhoto.title.trim()) {
      toast.error('Photo URL and Title are required');
      return;
    }
    const updated = [...productionPhotos, newPhoto];
    setProductionPhotos(updated);
    setNewPhoto({ url: '', title: '', description: '' });
    toast.success('Production photo added! Remember to click "Save Changes".');
  };

  const handleRemoveProductionPhoto = (index: number) => {
    const updated = productionPhotos.filter((_, i) => i !== index);
    setProductionPhotos(updated);
    toast.success('Photo removed! Click "Save Changes" to commit.');
  };

  // ── 4. MEDIA UPLOAD HELPERS ──
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (url: string) => void,
    folder: 'products' | 'videos' | 'packaging' = 'products'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadMedia(file, folder);
      onSuccess(result.url);
      toast.success('File uploaded to storage bucket successfully!');
    } catch (err: any) {
      console.warn('Storage upload fallback:', err);
      const localUrl = URL.createObjectURL(file);
      onSuccess(localUrl);
      toast(
        'Video loaded for preview! Remember to paste a permanent public URL (YouTube or CDN link) for global access.',
        { icon: '🎬', duration: 6000 }
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-henna-50 border border-henna-100 text-xs font-bold text-henna-800 mb-2">
            <Palette className="w-3.5 h-3.5 text-henna-600" />
            <span>Site Builder & Customizer</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900">
            Website Theme, Media & CSS Manager
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl leading-relaxed">
            Customize backgrounds, hero slider slides, production photos & videos for the about page, logo placement, and write custom CSS that reflects live on your database.
          </p>
        </div>

        <button
          onClick={refreshSiteSettings}
          className="self-start sm:self-auto p-2.5 text-gray-500 hover:text-henna-700 hover:bg-henna-50 rounded-xl border border-gray-200 transition-colors inline-flex items-center gap-2 text-xs font-semibold"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reload Settings</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 p-1.5 bg-white border border-gray-100 rounded-2xl shadow-sm gap-2">
        <button
          type="button"
          onClick={() => switchTab('slider')}
          className={`py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'slider'
              ? 'bg-henna-600 text-white shadow-sm ring-2 ring-henna-200'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Hero Slider ({slides.length})</span>
        </button>

        <button
          type="button"
          onClick={() => switchTab('about_media')}
          className={`py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'about_media'
              ? 'bg-henna-600 text-white shadow-sm ring-2 ring-henna-200'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>About Videos &amp; Media</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-400 text-black font-extrabold uppercase">
            2 Videos
          </span>
        </button>

        <button
          type="button"
          onClick={() => switchTab('backgrounds')}
          className={`py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'backgrounds'
              ? 'bg-henna-600 text-white shadow-sm ring-2 ring-henna-200'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Backgrounds &amp; Logo</span>
        </button>

        <button
          type="button"
          onClick={() => switchTab('css')}
          className={`py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'css'
              ? 'bg-henna-600 text-white shadow-sm ring-2 ring-henna-200'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>Live Custom CSS</span>
        </button>
      </div>

      {/* ── TAB 1: HERO SLIDER MANAGER ── */}
      {activeTab === 'slider' && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold text-gray-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-henna-600" />
                <span>Homepage Hero Slides Manager</span>
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Automatic continuously-changing slider on the homepage hero. Currently {slides.length} active slides (Minimum 4 required).
              </p>
            </div>

            <button
              onClick={handleOpenAddSlide}
              className="btn-primary text-xs px-4 py-2.5 inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Slide</span>
            </button>
          </div>

          {/* Slides List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {slides.map((slide, idx) => (
              <div
                key={slide.id}
                className="rounded-2xl border border-gray-200 overflow-hidden bg-gray-50 flex flex-col justify-between group hover:shadow-md transition"
              >
                <div>
                  <div className="relative h-44 bg-gray-200 overflow-hidden">
                    <img
                      src={slide.image}
                      alt={slide.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-henna-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                      Slide #{idx + 1}
                    </span>
                    <span className="absolute bottom-3 right-3 px-2.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[11px] font-bold text-white">
                      ₹{slide.price}.00 / {slide.pack_size}
                    </span>
                  </div>

                  <div className="p-4 space-y-2">
                    <span className="text-[10px] font-bold text-henna-700 uppercase tracking-wider block">
                      {slide.badge.replace('&bull;', '•')}
                    </span>
                    <h3 className="font-display font-bold text-base text-gray-900 line-clamp-1">
                      {slide.name}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {slide.description}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-gray-200/60 flex items-center justify-between mt-2">
                  <span className="text-[11px] font-mono text-gray-400">/{slide.slug}</span>
                  <div className="flex items-center gap-1.5 pt-2">
                    <button
                      onClick={() => handleEditSlide(slide)}
                      className="p-1.5 rounded-lg text-gray-600 hover:text-henna-700 hover:bg-henna-50 transition"
                      title="Edit Slide"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSlide(slide.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                      title="Delete Slide"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 2: ABOUT PRODUCTION MEDIA (VIDEOS & PHOTOS) ── */}
      {activeTab === 'about_media' && (
        <form onSubmit={handleSaveBranding} className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-8">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-gray-100 pb-5">
            <div>
              <h2 className="font-display text-xl font-bold text-gray-900 flex items-center gap-2">
                <Film className="w-5 h-5 text-henna-600" />
                <span>About Page: Dual Video Showcase &amp; Factory Gallery</span>
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Manage two videos that display side-by-side on the About page. Paste a YouTube URL or public MP4/WebM link. Both videos can be played simultaneously by visitors.
              </p>
              <a
                href="/about"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-henna-600 hover:text-henna-700 font-semibold mt-2"
              >
                <Eye className="w-3.5 h-3.5" />
                Preview About Page
              </a>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn-primary text-xs px-5 py-2.5 inline-flex items-center gap-2 self-start flex-shrink-0"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Changes</span>
            </button>
          </div>

          {/* DUAL VIDEO MANAGERS */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Film className="w-5 h-5 text-henna-600" />
              <h3 className="font-display text-base font-bold text-gray-900">About Page Dual Video Showcase (Side-by-Side on Desktop)</h3>
            </div>
            <p className="text-xs text-gray-500 -mt-4">
              Both videos display in one row on desktop. Paste a YouTube URL for embedded playback, or a direct .mp4/.webm link for custom HTML5 player controls.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ─── Video 1: Factory Reel ─── */}
              <div className="p-5 rounded-2xl bg-henna-50 border border-henna-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-henna-600 text-white text-[10px] font-black flex items-center justify-center">1</span>
                    <span className="text-sm font-bold text-gray-900">MMU Factory &amp; Milling Reel</span>
                  </div>
                  {brandingForm.about_video_url && (
                    <button
                      type="button"
                      onClick={() => setBrandingForm({ ...brandingForm, about_video_url: '' })}
                      className="text-[11px] font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-red-50 border border-red-200 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear</span>
                    </button>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-gray-700 uppercase tracking-wider">Video URL — MP4 / WebM / YouTube</label>
                  <input
                    type="url"
                    value={brandingForm.about_video_url}
                    onChange={(e) => setBrandingForm({ ...brandingForm, about_video_url: e.target.value })}
                    placeholder="https://youtube.com/watch?v=... or https://cdn.../factory.mp4"
                    className="input font-mono text-xs"
                  />
                  {brandingForm.about_video_url && (
                    <p className="text-[10px] font-semibold text-henna-700">
                      {isYouTubeUrl(brandingForm.about_video_url) ? '✅ YouTube embed detected — will show iframe player' : '✅ Direct video URL — custom HTML5 player with controls'}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <label className="btn-secondary text-xs px-3 py-1.5 cursor-pointer inline-flex items-center gap-1.5 flex-shrink-0">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload Video File</span>
                    <input
                      type="file"
                      accept="video/mp4,video/webm"
                      onChange={(e) => handleFileUpload(e, (url) => setBrandingForm((prev) => ({ ...prev, about_video_url: url })), 'videos')}
                      className="hidden"
                    />
                  </label>
                  {uploading && <span className="text-xs text-henna-600 animate-pulse font-semibold">Uploading…</span>}
                </div>

                {/* Live Preview for Video 1 */}
                <div className="rounded-2xl overflow-hidden bg-black border border-gray-900 shadow-sm" style={{ aspectRatio: '16/9' }}>
                  {brandingForm.about_video_url ? (
                    isYouTubeUrl(brandingForm.about_video_url) ? (
                      <iframe
                        className="w-full h-full"
                        src={getYouTubeEmbedUrl(brandingForm.about_video_url)}
                        title="Factory Video Preview"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        key={brandingForm.about_video_url}
                        src={brandingForm.about_video_url}
                        controls
                        className="w-full h-full object-cover"
                      />
                    )
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-500">
                      <Film className="w-8 h-8 text-gray-400" />
                      <p className="text-xs font-semibold text-gray-400">No Factory Video — paste URL above</p>
                      <p className="text-[10px] text-gray-400">YouTube or direct .mp4 link</p>
                    </div>
                  )}
                </div>
              </div>

              {/* ─── Video 2: Handmade Process ─── */}
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center">2</span>
                    <span className="text-sm font-bold text-gray-900">Traditional Handmade Process</span>
                  </div>
                  {brandingForm.about_handmade_video_url && (
                    <button
                      type="button"
                      onClick={() => setBrandingForm({ ...brandingForm, about_handmade_video_url: '' })}
                      className="text-[11px] font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-red-50 border border-red-200 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear</span>
                    </button>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-gray-700 uppercase tracking-wider">Video URL — MP4 / WebM / YouTube</label>
                  <input
                    type="url"
                    value={brandingForm.about_handmade_video_url}
                    onChange={(e) => setBrandingForm({ ...brandingForm, about_handmade_video_url: e.target.value })}
                    placeholder="https://youtube.com/watch?v=... or https://cdn.../handmade.mp4"
                    className="input font-mono text-xs"
                  />
                  {brandingForm.about_handmade_video_url && (
                    <p className="text-[10px] font-semibold text-amber-700">
                      {isYouTubeUrl(brandingForm.about_handmade_video_url) ? '✅ YouTube embed detected — will show iframe player' : '✅ Direct video URL — custom HTML5 player with controls'}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <label className="btn-secondary text-xs px-3 py-1.5 cursor-pointer inline-flex items-center gap-1.5 flex-shrink-0">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload Video File</span>
                    <input
                      type="file"
                      accept="video/mp4,video/webm"
                      onChange={(e) => handleFileUpload(e, (url) => setBrandingForm((prev) => ({ ...prev, about_handmade_video_url: url })), 'videos')}
                      className="hidden"
                    />
                  </label>
                  {uploading && <span className="text-xs text-amber-600 animate-pulse font-semibold">Uploading…</span>}
                </div>

                {/* Live Preview for Video 2 */}
                <div className="rounded-2xl overflow-hidden bg-black border border-gray-900 shadow-sm" style={{ aspectRatio: '16/9' }}>
                  {brandingForm.about_handmade_video_url ? (
                    isYouTubeUrl(brandingForm.about_handmade_video_url) ? (
                      <iframe
                        className="w-full h-full"
                        src={getYouTubeEmbedUrl(brandingForm.about_handmade_video_url)}
                        title="Handmade Video Preview"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        key={brandingForm.about_handmade_video_url}
                        src={brandingForm.about_handmade_video_url}
                        controls
                        className="w-full h-full object-cover"
                      />
                    )
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-500">
                      <Sparkles className="w-8 h-8 text-gray-400" />
                      <p className="text-xs font-semibold text-gray-400">No Handmade Process Video — paste URL above</p>
                      <p className="text-[10px] text-gray-400">YouTube or direct .mp4 link</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Help note */}
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
              <p className="text-xs text-blue-800 font-semibold mb-1">💡 How to add your video:</p>
              <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                <li><strong>YouTube:</strong> Copy the YouTube video URL (e.g. https://www.youtube.com/watch?v=xxxxx) and paste above</li>
                <li><strong>Direct Video:</strong> Upload to Google Drive / Cloudinary / any CDN, copy the public .mp4 or .webm URL and paste above</li>
                <li>After pasting or uploading, click <strong>"Save Changes"</strong> to update the About page</li>
              </ul>
            </div>
          </div>

          {/* Production Photos Gallery */}
          <div className="space-y-4 border-t border-gray-100 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-bold text-gray-900 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-henna-600" />
                  <span>Production & Processing Tour Gallery ({productionPhotos.length} Photos)</span>
                </h3>
                <p className="text-xs text-gray-500">
                  Displayed on the About page to showcase your harvest, triple sifting, and factory quality standards.
                </p>
              </div>
            </div>

            {/* Existing Photos Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {productionPhotos.map((photo, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-2 relative group">
                  <div className="h-36 rounded-xl overflow-hidden bg-gray-200">
                    <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-gray-900">{photo.title}</h4>
                    <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{photo.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveProductionPhoto(index)}
                    className="absolute top-5 right-5 p-1.5 rounded-lg bg-black/60 text-white hover:bg-red-600 transition"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Photo Mini Form */}
            <div className="p-5 rounded-2xl bg-earth-50 border border-earth-100 space-y-3">
              <span className="font-bold text-xs text-gray-900 block">Add Production Photo</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Photo Title (e.g., Triple Sifting Mesh)"
                  value={newPhoto.title}
                  onChange={(e) => setNewPhoto({ ...newPhoto, title: e.target.value })}
                  className="input text-xs"
                />
                <input
                  type="text"
                  placeholder="Short Description"
                  value={newPhoto.description}
                  onChange={(e) => setNewPhoto({ ...newPhoto, description: e.target.value })}
                  className="input text-xs"
                />
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Image URL"
                    value={newPhoto.url}
                    onChange={(e) => setNewPhoto({ ...newPhoto, url: e.target.value })}
                    className="input text-xs flex-1 font-mono"
                  />
                  <label className="p-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 cursor-pointer flex items-center justify-center" title="Upload Image">
                    <UploadCloud className="w-4 h-4 text-henna-700" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleFileUpload(e, (url) => setNewPhoto((prev) => ({ ...prev, url })), 'products')
                      }
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleAddProductionPhoto}
                    className="btn-primary text-xs px-3.5"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ── TAB 3: BACKGROUNDS, LOGO & BRANDING ── */}
      {activeTab === 'backgrounds' && (
        <form onSubmit={handleSaveBranding} className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-8">
          <div className="flex items-center justify-between border-b border-gray-100 pb-5">
            <div>
              <h2 className="font-display text-xl font-bold text-gray-900 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-henna-600" />
                <span>Website Backgrounds &amp; Logo Settings</span>
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Configure your official company logo (shown top-right across all pages) and section background artwork.
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn-primary text-xs px-5 py-2.5 inline-flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Changes</span>
            </button>
          </div>

          {/* Logo & Top-Right Placement */}
          <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200 space-y-4">
            <h3 className="font-display font-bold text-base text-gray-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-henna-600" />
              <span>Official Company Logo (Top-Right Most on All Pages)</span>
            </h3>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-20 h-20 rounded-full border-2 border-henna-600 bg-white shadow-md overflow-hidden flex-shrink-0 flex items-center justify-center">
                {brandingForm.logo_url ? (
                  <img src={brandingForm.logo_url} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-display font-bold text-2xl text-henna-700">M</span>
                )}
              </div>

              <div className="flex-1 space-y-3 w-full">
                <div>
                  <label className="label">Logo Image URL</label>
                  <input
                    type="url"
                    value={brandingForm.logo_url}
                    onChange={(e) => setBrandingForm({ ...brandingForm, logo_url: e.target.value })}
                    placeholder="https://.../logo.png"
                    className="input font-mono text-xs"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <label className="btn-secondary text-xs px-3.5 py-2 cursor-pointer inline-flex items-center gap-1.5">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload Logo Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleFileUpload(e, (url) => setBrandingForm((prev) => ({ ...prev, logo_url: url })), 'packaging')
                      }
                      className="hidden"
                    />
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-800">
                    <input
                      type="checkbox"
                      checked={brandingForm.show_top_right_logo}
                      onChange={(e) => setBrandingForm({ ...brandingForm, show_top_right_logo: e.target.checked })}
                      className="w-4 h-4 text-henna-600 rounded border-gray-300"
                    />
                    <span>Display Logo Photo in Top-Right Most Header Across All Pages</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Section Background Settings */}
          <div className="space-y-4">
            <h3 className="font-display font-bold text-base text-gray-900">
              Hero Section Background Photo / Video
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="label">Hero Background Image URL</label>
                <input
                  type="url"
                  value={brandingForm.hero_bg_image}
                  onChange={(e) => setBrandingForm({ ...brandingForm, hero_bg_image: e.target.value })}
                  placeholder="https://.../sojat-desert-farms.jpg"
                  className="input font-mono text-xs"
                />
                <label className="btn-secondary text-xs px-3 py-1.5 cursor-pointer inline-flex items-center gap-1.5 mt-1">
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload Background</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleFileUpload(e, (url) => setBrandingForm((prev) => ({ ...prev, hero_bg_image: url })), 'products')
                    }
                    className="hidden"
                  />
                </label>
              </div>

              <div className="space-y-2">
                <label className="label">Hero Background Video URL (Optional Loop)</label>
                <input
                  type="url"
                  value={brandingForm.hero_bg_video}
                  onChange={(e) => setBrandingForm({ ...brandingForm, hero_bg_video: e.target.value })}
                  placeholder="https://.../hero-video.mp4"
                  className="input font-mono text-xs"
                />
                <span className="text-[11px] text-gray-400">If set, plays as a background ambient video.</span>
              </div>
            </div>
          </div>

          {/* Section Artwork: MMU Advantage & Contract Manufacturing */}
          <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200 space-y-6">
            <h3 className="font-display font-bold text-base text-gray-900 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-henna-600" />
              <span>Homepage Feature Sections Artwork</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* MMU Advantage Photo */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="label mb-0 font-bold text-gray-800">1. MMU Advantage Section Photo</label>
                  <span className="text-[10px] text-henna-700 font-semibold bg-henna-50 px-2 py-0.5 rounded-full">Right of Cards</span>
                </div>
                <p className="text-[11px] text-gray-500">
                  Featured on the homepage in the "The MMU Advantage" section alongside the feature cards.
                </p>

                {brandingForm.advantage_image && (
                  <div className="h-32 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                    <img src={brandingForm.advantage_image} alt="Advantage Preview" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={brandingForm.advantage_image}
                    onChange={(e) => setBrandingForm({ ...brandingForm, advantage_image: e.target.value })}
                    placeholder="https://.../sojat-advantage.jpg"
                    className="input font-mono text-xs flex-1"
                  />
                  <label className="btn-secondary text-xs px-3 py-2 cursor-pointer inline-flex items-center gap-1.5 flex-shrink-0">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleFileUpload(e, (url) => setBrandingForm((prev) => ({ ...prev, advantage_image: url })), 'products')
                      }
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Third-Party & Contract Manufacturing Photo */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="label mb-0 font-bold text-gray-800">2. Contract Manufacturing Section Photo</label>
                  <span className="text-[10px] text-henna-700 font-semibold bg-henna-50 px-2 py-0.5 rounded-full">Right of Text</span>
                </div>
                <p className="text-[11px] text-gray-500">
                  Featured in the "Start Your Own Natural Product Brand" spotlight on the homepage.
                </p>

                {brandingForm.manufacturing_image && (
                  <div className="h-32 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                    <img src={brandingForm.manufacturing_image} alt="Manufacturing Preview" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={brandingForm.manufacturing_image}
                    onChange={(e) => setBrandingForm({ ...brandingForm, manufacturing_image: e.target.value })}
                    placeholder="https://.../private-label-packaging.jpg"
                    className="input font-mono text-xs flex-1"
                  />
                  <label className="btn-secondary text-xs px-3 py-2 cursor-pointer inline-flex items-center gap-1.5 flex-shrink-0">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleFileUpload(e, (url) => setBrandingForm((prev) => ({ ...prev, manufacturing_image: url })), 'packaging')
                      }
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Headings & Announcement */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            <div>
              <label className="label">Homepage Main Headline</label>
              <input
                type="text"
                value={brandingForm.hero_headline}
                onChange={(e) => setBrandingForm({ ...brandingForm, hero_headline: e.target.value })}
                className="input text-xs"
              />
            </div>

            <div>
              <label className="label">Top Announcement Banner Text</label>
              <input
                type="text"
                value={brandingForm.announcement_text}
                onChange={(e) => setBrandingForm({ ...brandingForm, announcement_text: e.target.value })}
                className="input text-xs"
              />
            </div>
          </div>
        </form>
      )}

      {/* ── TAB 4: LIVE CUSTOM CSS EDITOR ── */}
      {activeTab === 'css' && (
        <form onSubmit={handleSaveBranding} className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-5">
            <div>
              <h2 className="font-display text-xl font-bold text-gray-900 flex items-center gap-2">
                <Code className="w-5 h-5 text-henna-600" />
                <span>Full Website Custom CSS Editor</span>
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Directly inject custom CSS rules across all website sections, custom font families, or background overlays.
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn-primary text-xs px-5 py-2.5 inline-flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save &amp; Apply CSS</span>
            </button>
          </div>

          <div>
            <label className="label">Custom CSS Code (Live Injected)</label>
            <textarea
              rows={14}
              value={brandingForm.custom_css}
              onChange={(e) => setBrandingForm({ ...brandingForm, custom_css: e.target.value })}
              placeholder={`/* Example Custom Styling */
.hero-headline {
  letter-spacing: -0.03em;
}
.custom-banner {
  filter: brightness(0.95);
}`}
              className="input font-mono text-xs bg-gray-900 text-green-400 p-4 rounded-2xl"
              spellCheck={false}
            />
            <span className="text-[11px] text-gray-400 mt-1 block">
              Changes are immediately persisted to the Supabase database and rendered across all customer and admin pages.
            </span>
          </div>
        </form>
      )}

      {/* ── SLIDE ADD / EDIT MODAL ── */}
      {isSlideModalOpen && editingSlide && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="font-display text-xl font-bold text-gray-900">
                {slides.some((s) => s.id === editingSlide.id) ? 'Edit Hero Slide' : 'Add New Hero Slide'}
              </h3>
              <button
                type="button"
                onClick={() => setIsSlideModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSlideModal} className="space-y-4">
              <div>
                <label className="label">Product Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={editingSlide.name}
                  onChange={(e) => setEditingSlide({ ...editingSlide, name: e.target.value })}
                  placeholder="e.g. 3 Filter Henna Powder"
                  className="input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Badge Pill</label>
                  <input
                    type="text"
                    value={editingSlide.badge}
                    onChange={(e) => setEditingSlide({ ...editingSlide, badge: e.target.value })}
                    placeholder="e.g. Flagship • Triple-Sifted"
                    className="input text-xs"
                  />
                </div>
                <div>
                  <label className="label">Subtitle</label>
                  <input
                    type="text"
                    value={editingSlide.subtitle}
                    onChange={(e) => setEditingSlide({ ...editingSlide, subtitle: e.target.value })}
                    placeholder="e.g. Silk-Cloth Filtered"
                    className="input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="label">Short Description</label>
                <textarea
                  rows={2}
                  value={editingSlide.description}
                  onChange={(e) => setEditingSlide({ ...editingSlide, description: e.target.value })}
                  placeholder="Summary for hero card display..."
                  className="input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Price (₹)</label>
                  <input
                    type="number"
                    value={editingSlide.price}
                    onChange={(e) => setEditingSlide({ ...editingSlide, price: Number(e.target.value) })}
                    className="input text-xs"
                  />
                </div>
                <div>
                  <label className="label">Pack Size</label>
                  <input
                    type="text"
                    value={editingSlide.pack_size}
                    onChange={(e) => setEditingSlide({ ...editingSlide, pack_size: e.target.value })}
                    placeholder="100 gm"
                    className="input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="label">Slide Photo URL <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    value={editingSlide.image}
                    onChange={(e) => setEditingSlide({ ...editingSlide, image: e.target.value })}
                    placeholder="https://.../henna.jpg"
                    className="input font-mono text-xs flex-1"
                  />
                  <label className="btn-secondary text-xs px-3 py-2 cursor-pointer inline-flex items-center gap-1">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleFileUpload(e, (url) => setEditingSlide((prev) => (prev ? { ...prev, image: url } : null)), 'products')
                      }
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {editingSlide.image && (
                <div className="h-32 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                  <img src={editingSlide.image} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSlideModalOpen(false)}
                  className="btn-secondary text-xs px-4 py-2"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs px-5 py-2">
                  Save Slide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
