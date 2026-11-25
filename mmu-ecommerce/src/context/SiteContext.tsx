import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface HeroSlide {
  id: string;
  name: string;
  slug: string;
  badge: string;
  subtitle: string;
  description: string;
  price: number;
  pack_size: string;
  image: string;
  tag: string;
  is_active: boolean;
}

export interface ProductionPhoto {
  url: string;
  title: string;
  description: string;
}

export interface SiteCustomization {
  logo_url: string;
  show_top_right_logo: boolean;
  hero_bg_image: string;
  hero_bg_video: string;
  hero_headline: string;
  hero_subheadline: string;
  advantage_image?: string;
  manufacturing_image?: string;
  about_video_url: string;
  about_handmade_video_url?: string;
  about_production_photos: ProductionPhoto[];
  custom_css: string;
  primary_color: string;
  secondary_color: string;
  announcement_text: string;
}

const defaultCustomization: SiteCustomization = {
  logo_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=300&q=80',
  show_top_right_logo: true,
  hero_bg_image: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1920&q=80',
  hero_bg_video: '',
  hero_headline: 'Pure Sojat Henna. Trusted Worldwide.',
  hero_subheadline: 'Grown in the mineral-rich, arid soil of Sojat City, Rajasthan — celebrated globally for the highest natural lawsonia dye content. We mill 100% pure, triple-cloth-sifted henna and 14 Ayurvedic botanical powders for global retail and wholesale.',
  advantage_image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
  manufacturing_image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80',
  about_video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  about_handmade_video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
  about_production_photos: [
    {
      url: 'https://images.unsplash.com/photo-1608248597359-556391d84a7e?auto=format&fit=crop&w=800&q=80',
      title: 'Fresh Henna Leaf Sorting',
      description: 'Hand-grading prime Lawsonia Inermis leaves in Sojat, Rajasthan.',
    },
    {
      url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
      title: 'Shade Drying Beds',
      description: 'Natural sun-curing protected from direct bleaching to maintain vibrant green pigment.',
    },
    {
      url: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80',
      title: 'Triple Silk-Cloth Filtration Mill',
      description: 'Mechanical sifting through micro-pore silk mesh ensuring 0.3mm nozzle flow.',
    },
    {
      url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80',
      title: 'Ayurvedic Blending & Milling',
      description: 'Nine herbal ingredients milled and homogenized in modern stainless steel machinery.',
    },
    {
      url: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&w=800&q=80',
      title: 'Quality Control & Lawsone Lab Testing',
      description: 'Standardized spectrophotometer batch testing guaranteeing 2.5%+ dye content.',
    },
    {
      url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
      title: 'Hermetic Vacuum Foil Packaging',
      description: 'Nitrogen-flushed multi-layer pouches preventing oxidation for global shipping.',
    },
  ],
  custom_css: '',
  primary_color: '#c06720',
  secondary_color: '#2c1810',
  announcement_text: 'Pure Sojat Henna directly from Rajasthan • Uniform pricing ₹299 per 100 gm',
};

const defaultSlides: HeroSlide[] = [
  {
    id: 'slide-1',
    name: '3 Filter Henna Powder',
    slug: '3-filter-henna-powder',
    badge: 'Flagship &bull; Triple-Sifted',
    subtitle: 'Silk-Cloth Filtered for Bridal Cones',
    description: 'Micro-fine cloth filtered specifically for bridal cone paste artists and chemical-free hair dyeing. Zero nozzle clogs, intense dye release within 4–6 hours.',
    price: 299,
    pack_size: '100 gm',
    image: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1200&q=80',
    tag: 'Zero PPD & Ammonia',
    is_active: true,
  },
  {
    id: 'slide-2',
    name: 'Organic Henna Powder',
    slug: 'organic-henna-powder',
    badge: '100% Certified Organic',
    subtitle: 'Pure Lawsonia Inermis Harvest',
    description: 'Grown naturally in Sojat’s mineral-rich soil without synthetic chemical pesticides. Maximum natural lawsone content for deep scalp cooling and rich mahogany stains.',
    price: 299,
    pack_size: '100 gm',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
    tag: 'Lab Verified Purity',
    is_active: true,
  },
  {
    id: 'slide-3',
    name: 'Indigo Powder',
    slug: 'indigo-powder',
    badge: 'Pure Botanical Hair Dye',
    subtitle: 'Organic Indigofera Tinctoria',
    description: 'Pure shade-dried indigo leaf powder. Used in combination with Sojat henna for natural rich brown to jet-black hair tones without chemical bleach or peroxide.',
    price: 299,
    pack_size: '100 gm',
    image: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&w=1200&q=80',
    tag: 'Rich Natural Black Stain',
    is_active: true,
  },
  {
    id: 'slide-4',
    name: 'Herbal Henna Powder',
    slug: 'herbal-henna-powder',
    badge: '9 Ayurvedic Botanicals',
    subtitle: 'Amla, Brahmi, Bhringraj & Shikakai Blend',
    description: 'Infused with nine precious therapeutic herbs for comprehensive hair conditioning, root strengthening, and anti-dandruff scalp wellness direct from Sojat mills.',
    price: 299,
    pack_size: '100 gm',
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=1200&q=80',
    tag: 'Ayurvedic Scalp Nutrition',
    is_active: true,
  },
  {
    id: 'slide-5',
    name: 'Moringa & Neem Botanical Powders',
    slug: 'moringa-powder',
    badge: 'Pure Herbal Therapy',
    subtitle: 'Fresh Shade-Dried Leaf Powders',
    description: 'Nutrient-dense Rajasthani botanical powders packed with vitamins, antioxidants, and natural therapeutic properties for skin glow packs and scalp health.',
    price: 299,
    pack_size: '100 gm',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=1200&q=80',
    tag: '100% Farm Traceable',
    is_active: true,
  },
];

interface SiteContextType {
  customization: SiteCustomization;
  heroSlides: HeroSlide[];
  loading: boolean;
  updateCustomization: (newConfig: Partial<SiteCustomization>) => Promise<void>;
  updateHeroSlides: (newSlides: HeroSlide[]) => Promise<void>;
  refreshSiteSettings: () => Promise<void>;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customization, setCustomization] = useState<SiteCustomization>(defaultCustomization);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(defaultSlides);
  const [loading, setLoading] = useState(true);

  const fetchSiteSettings = async () => {
    try {
      const { data, error } = await supabase.from('settings').select('*');
      if (error) throw error;

      if (data) {
        data.forEach((row: any) => {
          if (row.key === 'site_customization' && row.value) {
            setCustomization((prev) => ({ ...prev, ...row.value }));
          }
          if (row.key === 'hero_slides' && Array.isArray(row.value) && row.value.length > 0) {
            setHeroSlides(row.value);
          }
        });
      }
    } catch (err) {
      console.error('Failed to load site customization settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSiteSettings();
  }, []);

  // Inject or update custom CSS into document head
  useEffect(() => {
    let styleTag = document.getElementById('mmu-custom-css') as HTMLStyleElement | null;
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'mmu-custom-css';
      document.head.appendChild(styleTag);
    }
    styleTag.textContent = customization.custom_css || '';
  }, [customization.custom_css]);

  const updateCustomization = async (newConfig: Partial<SiteCustomization>) => {
    const updated = { ...customization, ...newConfig };
    setCustomization(updated);

    const { error } = await supabase.from('settings').upsert(
      {
        key: 'site_customization',
        value: updated,
        updated_at: new Date().toISOString(),
      } as any,
      { onConflict: 'key' }
    );

    if (error) throw error;
  };

  const updateHeroSlides = async (newSlides: HeroSlide[]) => {
    setHeroSlides(newSlides);

    const { error } = await supabase.from('settings').upsert(
      {
        key: 'hero_slides',
        value: newSlides,
        updated_at: new Date().toISOString(),
      } as any,
      { onConflict: 'key' }
    );

    if (error) throw error;
  };

  return (
    <SiteContext.Provider
      value={{
        customization,
        heroSlides,
        loading,
        updateCustomization,
        updateHeroSlides,
        refreshSiteSettings: fetchSiteSettings,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
};

export const useSite = () => {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error('useSite must be used within a SiteProvider');
  }
  return context;
};
