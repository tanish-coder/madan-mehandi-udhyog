import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import {
  Sparkles,
  ShieldCheck,
  Award,
  Globe,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Leaf,
  Layers,
  Heart,
  Sun,
  Flame,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Film,
  Factory,
} from 'lucide-react';

export default function About() {
  const { customization } = useSite();

  // Video 1 (Factory & Milling Reel) States
  const [isPlaying1, setIsPlaying1] = useState(false);
  const [isMuted1, setIsMuted1] = useState(false);
  const videoRef1 = useRef<HTMLVideoElement | null>(null);

  // Video 2 (Handmade Process) States
  const [isPlaying2, setIsPlaying2] = useState(false);
  const [isMuted2, setIsMuted2] = useState(false);
  const videoRef2 = useRef<HTMLVideoElement | null>(null);

  const factoryVideoUrl =
    customization?.about_video_url ||
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

  const handmadeVideoUrl =
    customization?.about_handmade_video_url ||
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4';

  const isYouTubeUrl = (url: string) =>
    url.includes('youtube.com') || url.includes('youtu.be');

  const isYouTube1 = isYouTubeUrl(factoryVideoUrl);
  const isYouTube2 = isYouTubeUrl(handmadeVideoUrl);

  const getYouTubeEmbedUrl = (url: string) => {
    if (url.includes('youtube-nocookie.com/embed/')) return url;
    if (url.includes('embed/')) return url;
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
    );
    return match
      ? `https://www.youtube-nocookie.com/embed/${match[1]}?autoplay=0&controls=1&rel=0`
      : url;
  };

  // Video 1 Handlers
  const togglePlay1 = () => {
    if (!videoRef1.current) return;
    if (isPlaying1) {
      videoRef1.current.pause();
      setIsPlaying1(false);
    } else {
      videoRef1.current.play();
      setIsPlaying1(true);
    }
  };

  const toggleMute1 = () => {
    if (!videoRef1.current) return;
    videoRef1.current.muted = !isMuted1;
    setIsMuted1(!isMuted1);
  };

  const toggleFullscreen1 = () => {
    if (videoRef1.current?.requestFullscreen) {
      videoRef1.current.requestFullscreen();
    }
  };

  // Video 2 Handlers
  const togglePlay2 = () => {
    if (!videoRef2.current) return;
    if (isPlaying2) {
      videoRef2.current.pause();
      setIsPlaying2(false);
    } else {
      videoRef2.current.play();
      setIsPlaying2(true);
    }
  };

  const toggleMute2 = () => {
    if (!videoRef2.current) return;
    videoRef2.current.muted = !isMuted2;
    setIsMuted2(!isMuted2);
  };

  const toggleFullscreen2 = () => {
    if (videoRef2.current?.requestFullscreen) {
      videoRef2.current.requestFullscreen();
    }
  };

  const areBothPlaying = isPlaying1 && isPlaying2;

  // Toggle Both Videos Simultaneously
  const toggleBothVideos = () => {
    if (areBothPlaying) {
      if (videoRef1.current) {
        videoRef1.current.pause();
        setIsPlaying1(false);
      }
      if (videoRef2.current) {
        videoRef2.current.pause();
        setIsPlaying2(false);
      }
    } else {
      if (videoRef1.current && !isYouTube1) {
        videoRef1.current.play().catch(() => {});
        setIsPlaying1(true);
      }
      if (videoRef2.current && !isYouTube2) {
        videoRef2.current.play().catch(() => {});
        setIsPlaying2(true);
      }
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 py-12">
      {/* 1. Page Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-henna-950 via-earth-900 to-henna-900 rounded-3xl p-8 sm:p-14 lg:p-20 text-white shadow-xl relative overflow-hidden text-center max-w-5xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-xs border border-white/15 text-xs font-semibold text-henna-200">
            <Sparkles className="w-3.5 h-3.5 text-henna-400" />
            <span>The Authentic Heritage of Rajasthan</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
            The World Capital of Mehndi. <br />
            <span className="text-gradient from-henna-400 to-amber-300">
              The Legacy of Sojat.
            </span>
          </h1>

          <p className="text-earth-200 text-sm sm:text-base leading-relaxed max-w-3xl mx-auto">
            Situated on the fringes of the Thar Desert in Rajasthan, Sojat City is globally recognized as the supreme center for henna cultivation. <strong>Madan Mehandi Udhyog (MMU)</strong> brings this ancient botanic gift to international wholesale and retail standards.
          </p>
        </div>
      </section>

      {/* 2. WORKING FACTORY & HANDMADE PROCESS DUAL VIDEO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-10 lg:p-12 space-y-8">

          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-henna-700">
                <Film className="w-4 h-4 text-henna-600" />
                <span>Video Showcase</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                Inside MMU Sojat: Factory &amp; Artisan Heritage
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Watch our genuine Rajasthani henna cultivation, precision triple-cloth sifting, and traditional handmade artisan process.
              </p>
            </div>

            {/* Play Both Simultaneously Button */}
            {!isYouTube1 && !isYouTube2 && (
              <button
                onClick={toggleBothVideos}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-200 shadow-sm self-start sm:self-auto ${
                  areBothPlaying
                    ? 'bg-gray-800 text-white hover:bg-gray-700'
                    : 'bg-henna-600 text-white hover:bg-henna-500 hover:scale-105'
                }`}
              >
                {areBothPlaying ? (
                  <><Pause className="w-4 h-4" /> Pause Both</>
                ) : (
                  <><Play className="w-4 h-4 fill-current" /> Play Both Simultaneously</>
                )}
              </button>
            )}
          </div>

          {/* DUAL VIDEO GRID — Side by Side on Desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

            {/* VIDEO 1 — MMU Factory & Milling Reel */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-henna-50 border border-henna-200 text-xs font-bold text-henna-700">
                  <Factory className="w-3.5 h-3.5" /> Facility 01
                </span>
                <h3 className="font-bold text-gray-900 text-sm">MMU Factory &amp; Milling Reel</h3>
              </div>

              <div className="relative rounded-2xl overflow-hidden bg-black shadow-lg border border-gray-200 group" style={{aspectRatio:'16/9'}}>
                {isYouTube1 ? (
                  <iframe
                    className="w-full h-full"
                    src={getYouTubeEmbedUrl(factoryVideoUrl)}
                    title="MMU Production Factory Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <>
                    <video
                      ref={videoRef1}
                      className="w-full h-full object-cover"
                      src={factoryVideoUrl}
                      poster="https://images.unsplash.com/photo-1608248597359-556391d84a7e?auto=format&fit=crop&w=900&q=80"
                      playsInline
                      onPlay={() => setIsPlaying1(true)}
                      onPause={() => setIsPlaying1(false)}
                      onEnded={() => setIsPlaying1(false)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20 pointer-events-none" />
                    {!isPlaying1 && (
                      <button
                        onClick={togglePlay1}
                        className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-henna-600/90 text-white flex items-center justify-center shadow-2xl hover:bg-henna-500 hover:scale-110 transition-all duration-300 z-10"
                        aria-label="Play video"
                      >
                        <Play className="w-6 h-6 ml-1 fill-current" />
                      </button>
                    )}
                    <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between text-white text-xs bg-black/60 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10">
                      <div className="flex items-center gap-2">
                        <button onClick={togglePlay1} className="p-1 hover:text-henna-400 transition" aria-label={isPlaying1 ? 'Pause' : 'Play'}>
                          {isPlaying1 ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                        </button>
                        <button onClick={toggleMute1} className="p-1 hover:text-henna-400 transition" aria-label={isMuted1 ? 'Unmute' : 'Mute'}>
                          {isMuted1 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </button>
                        <span className="font-semibold text-[10px] text-earth-200 hidden sm:inline">Mill Reel • HD</span>
                      </div>
                      <button onClick={toggleFullscreen1} className="p-1 hover:text-henna-400 transition" aria-label="Fullscreen">
                        <Maximize className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Henna cultivation, sun drying &amp; precision triple-cloth sifting at our Sojat processing unit.
              </p>
            </div>

            {/* VIDEO 2 — Traditional Handmade Process */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold text-amber-700">
                  <Heart className="w-3.5 h-3.5" /> Artisan Heritage
                </span>
                <h3 className="font-bold text-gray-900 text-sm">Traditional Handmade Process</h3>
              </div>

              <div className="relative rounded-2xl overflow-hidden bg-black shadow-lg border border-gray-200 group" style={{aspectRatio:'16/9'}}>
                {isYouTube2 ? (
                  <iframe
                    className="w-full h-full"
                    src={getYouTubeEmbedUrl(handmadeVideoUrl)}
                    title="MMU Handmade Process Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <>
                    <video
                      ref={videoRef2}
                      className="w-full h-full object-cover"
                      src={handmadeVideoUrl}
                      poster="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=900&q=80"
                      playsInline
                      onPlay={() => setIsPlaying2(true)}
                      onPause={() => setIsPlaying2(false)}
                      onEnded={() => setIsPlaying2(false)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20 pointer-events-none" />
                    {!isPlaying2 && (
                      <button
                        onClick={togglePlay2}
                        className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-amber-600/90 text-white flex items-center justify-center shadow-2xl hover:bg-amber-500 hover:scale-110 transition-all duration-300 z-10"
                        aria-label="Play handmade process video"
                      >
                        <Play className="w-6 h-6 ml-1 fill-current" />
                      </button>
                    )}
                    <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between text-white text-xs bg-black/60 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10">
                      <div className="flex items-center gap-2">
                        <button onClick={togglePlay2} className="p-1 hover:text-amber-400 transition" aria-label={isPlaying2 ? 'Pause' : 'Play'}>
                          {isPlaying2 ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                        </button>
                        <button onClick={toggleMute2} className="p-1 hover:text-amber-400 transition" aria-label={isMuted2 ? 'Unmute' : 'Mute'}>
                          {isMuted2 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </button>
                        <span className="font-semibold text-[10px] text-earth-200 hidden sm:inline">Handmade • HD</span>
                      </div>
                      <button onClick={toggleFullscreen2} className="p-1 hover:text-amber-400 transition" aria-label="Fullscreen">
                        <Maximize className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Our skilled artisans hand-grind, blend &amp; pack pure Sojat henna using generations-old traditional techniques.
              </p>
            </div>
          </div>

          {/* Video Highlights / Chapters */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-earth-50 border border-earth-100 space-y-1">
              <span className="text-xs font-bold text-henna-700 block">Chapter 01</span>
              <h4 className="font-bold text-gray-900 text-xs">Arid Farm Harvest</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Handpicking prime mature Lawsonia leaves during optimal morning sun in Pali district.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-earth-50 border border-earth-100 space-y-1">
              <span className="text-xs font-bold text-henna-700 block">Chapter 02</span>
              <h4 className="font-bold text-gray-900 text-xs">Shade Curing</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Retaining the natural green lawsone dye enzyme by avoiding scorching direct sunlight.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-earth-50 border border-earth-100 space-y-1">
              <span className="text-xs font-bold text-henna-700 block">Chapter 03</span>
              <h4 className="font-bold text-gray-900 text-xs">Triple Silk Sifting</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Three-stage silk cloth filtration removes 100% of leaf veins, fiber and impurities.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-earth-50 border border-earth-100 space-y-1">
              <span className="text-xs font-bold text-henna-700 block">Chapter 04</span>
              <h4 className="font-bold text-gray-900 text-xs">Vacuum Pouching</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Hermetically sealed foil packaging prevents oxidation for worldwide export.
              </p>
            </div>
          </div>

          {/* Dynamic Real Production & Factory Showcase Gallery */}
          {customization?.about_production_photos && customization.about_production_photos.length > 0 && (
            <div className="pt-8 border-t border-gray-100 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-henna-700">
                    Live Production Tour
                  </span>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-gray-900">
                    Authentic Factory Floor & Milling Facilities
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Live snapshots of our Sojat processing units, grading tables, and stainless steel micro-sifting setups.
                  </p>
                </div>
                <span className="text-xs text-gray-600 font-medium bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200 self-start sm:self-auto">
                  {customization.about_production_photos.length} Verified Facilities
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {customization.about_production_photos.map((photo, idx) => (
                  <div
                    key={idx}
                    className="group bg-white rounded-2xl overflow-hidden border border-gray-200/80 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col"
                  >
                    <div className="relative h-48 overflow-hidden bg-earth-950">
                      <img
                        src={photo.url}
                        alt={photo.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider border border-white/20">
                        Facility 0{idx + 1}
                      </span>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm group-hover:text-henna-700 transition">
                          {photo.title}
                        </h4>
                        <p className="text-xs text-gray-600 leading-relaxed mt-1">
                          {photo.description}
                        </p>
                      </div>
                      <div className="pt-2 flex items-center gap-1.5 text-[11px] font-semibold text-henna-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-henna-600" />
                        <span>Sojat Industrial Area Phase 3</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. Terroir & Climate Story */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-henna-700">
              The Science Behind The Soil
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
              Why Henna from Sojat is Unmatched Anywhere on Earth
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              The <em>Lawsonia Inermis</em> shrub is native to semi-arid tropical zones, but only in Sojat City does the confluence of alkaline soil chemistry, intense dry heat exceeding 45°C in summer, and low monsoon rainfall create the ideal stress conditions under which the plant produces maximum <strong>lawsone pigment molecules</strong>.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">
              While ordinary henna from other regions yields 1.0% to 1.5% dye content, pure Sojat henna consistently tests at <strong>2.5% to 3.2% lawsone</strong>. This creates the intense mahogany and deep burgundy stain cherished by bridal mehandi artists and natural hair colorists worldwide.
            </p>

            <div className="pt-2 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-earth-50 border border-earth-100">
                <span className="font-display text-2xl font-bold text-henna-800 block">3.0%+</span>
                <span className="text-xs text-gray-600">Natural Lawsone Pigment</span>
              </div>
              <div className="p-4 rounded-xl bg-earth-50 border border-earth-100">
                <span className="font-display text-2xl font-bold text-henna-800 block">3 Filters</span>
                <span className="text-xs text-gray-600">Micro-Cloth Sifting</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
            <h3 className="font-display text-xl font-bold text-gray-900">
              The MMU Triple-Sifting Benchmark
            </h3>
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-henna-100 text-henna-700 font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Selective Hand Harvest</h4>
                  <p className="text-gray-500 text-xs mt-0.5">
                    Only mature, fully pigmented leaves are handpicked during the prime harvest cycle, leaving tough woody stems behind.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-henna-100 text-henna-700 font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Shade Drying & Fine Milling</h4>
                  <p className="text-gray-500 text-xs mt-0.5">
                    Leaves are dried away from direct bleach sunlight to preserve enzymes and pulverized into a velvety soft flour consistency.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-henna-100 text-henna-700 font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Triple Silk-Cloth Filtration</h4>
                  <p className="text-gray-500 text-xs mt-0.5">
                    The powder passes through three successive layers of micro-pore silk mesh to ensure zero sediment, lumps, or grit remain.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
              <span className="font-bold block mb-0.5">Bridal Artist Approved:</span>
              Guaranteed clog-free flow for 0.3mm cellophane cone nozzles.
            </div>
          </div>
        </div>
      </section>

      {/* 4. Facilities & Address */}
      <section className="bg-earth-50 py-16 sm:py-24 border-y border-earth-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="text-xs font-bold uppercase tracking-wider text-henna-700">
            Registered Industrial Mill
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900">
            Industrial Area, 3rd Phase, Sojat City, Rajasthan
          </h2>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Our state-of-the-art processing facility operates under rigorous cleanliness and moisture-controlled conditions in Sojat’s dedicated industrial hub.
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Link to="/products" className="btn-primary text-xs px-6 py-3">
              Explore Our 15 Products
            </Link>
            <Link to="/contact" className="btn-secondary text-xs px-6 py-3">
              Contact Factory Office
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
