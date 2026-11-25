import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSite } from '../../context/SiteContext';
import { supabase } from '../../lib/supabase';
import {
  MapPin,
  Phone,
  Mail,
  Star,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function Footer() {
  const { customization } = useSite();
  const logoUrl = customization?.logo_url;

  const [socialLinks, setSocialLinks] = useState({
    facebook: 'https://facebook.com/madanmehandi',
    instagram: 'https://instagram.com/madanmehandi',
    whatsapp: 'https://wa.me/917976705440?text=Hello%20MMU,%20I%20would%20like%20to%20chat%20about%20your%20products.',
    twitter: 'https://twitter.com/madanmehandi',
    linkedin: 'https://linkedin.com/company/madanmehandi',
  });

  useEffect(() => {
    supabase
      .from('settings')
      .select('value')
      .eq('key', 'business_info')
      .single()
      .then(({ data }) => {
        if (data?.value) {
          setSocialLinks((prev) => ({
            facebook: data.value.facebook || prev.facebook,
            instagram: data.value.instagram || prev.instagram,
            twitter: data.value.twitter || prev.twitter,
            linkedin: data.value.linkedin || prev.linkedin,
            whatsapp: data.value.whatsapp
              ? `https://wa.me/${String(data.value.whatsapp).replace(/\D/g, '')}?text=Hello%20MMU`
              : prev.whatsapp,
          }));
        }
      });
  }, []);

  return (
    <footer className="bg-earth-950 text-white border-t border-earth-900 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Brand & Factory Info */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="MMU Logo"
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-contain bg-white p-1 border-2 border-henna-500 shadow-sm flex-shrink-0"
                  onError={(e) => {
                    const el = e.target as HTMLImageElement;
                    el.style.display = 'none';
                    const next = el.nextElementSibling as HTMLElement | null;
                    if (next) next.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-henna-600 items-center justify-center font-display font-bold text-xl text-white shadow-xs flex-shrink-0 ${logoUrl ? 'hidden' : 'flex'}`}
              >
                M
              </div>
              <div>
                <span className="font-display font-bold text-base tracking-tight text-white block">
                  Madan Mehandi Udhyog
                </span>
                <span className="text-[10px] text-henna-300 uppercase tracking-widest font-semibold block -mt-0.5">
                  Sojat City, Rajasthan &bull; Est. 1990
                </span>
              </div>
            </div>

            <p className="text-earth-300 text-xs leading-relaxed max-w-sm">
              Worldwide wholesale supplier and contract manufacturer of authentic triple-sifted Sojat henna powder and 14 natural Ayurvedic botanical powders.
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-earth-300 pt-1">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-henna-400 flex-shrink-0" />
                Industrial Area, 3rd Phase, Sojat City, Rajasthan
              </span>
              <a
                href={socialLinks.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-henna-300 hover:text-white transition underline"
                title="Chat with Us on WhatsApp"
              >
                <Phone className="w-3.5 h-3.5 text-henna-400 flex-shrink-0" />
                +91 79767 05440 (WhatsApp Chat)
              </a>
            </div>

            {/* Social Media Icons (Excluding YouTube) */}
            <div className="pt-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-earth-400 mb-2">
                Connect With Us
              </p>
              <div className="flex items-center gap-2">
                {/* Instagram */}
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  title="Follow MMU on Instagram"
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-gradient-to-tr hover:from-amber-600 hover:via-pink-600 hover:to-purple-600 border border-white/10 flex items-center justify-center text-white transition-all duration-200 hover:scale-110 shadow-xs"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>

                {/* Facebook */}
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  title="Follow MMU on Facebook"
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-[#1877F2] border border-white/10 flex items-center justify-center text-white transition-all duration-200 hover:scale-110 shadow-xs"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.597 0 9 1.583 9 4.615V8z" />
                  </svg>
                </a>

                {/* WhatsApp */}
                <a
                  href={socialLinks.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="WhatsApp"
                  title="Direct WhatsApp Chat"
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-[#25D366] border border-white/10 flex items-center justify-center text-white transition-all duration-200 hover:scale-110 shadow-xs"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                </a>

                {/* Twitter / X */}
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Twitter X"
                  title="Follow MMU on X (Twitter)"
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-black border border-white/10 flex items-center justify-center text-white transition-all duration-200 hover:scale-110 shadow-xs"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>

                {/* LinkedIn */}
                <a
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                  title="Follow MMU on LinkedIn"
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-[#0A66C2] border border-white/10 flex items-center justify-center text-white transition-all duration-200 hover:scale-110 shadow-xs"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-4 grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-2.5 text-henna-300">
                Explore
              </h4>
              <ul className="space-y-1.5 text-xs text-earth-300">
                <li><Link to="/" className="hover:text-white transition">Home</Link></li>
                <li><Link to="/about" className="hover:text-white transition">About</Link></li>
                <li><Link to="/products" className="hover:text-white transition">Products (15 Powders)</Link></li>
                <li><Link to="/reviews" className="hover:text-white transition">Customer Reviews</Link></li>
                <li><Link to="/contact" className="hover:text-white transition">Contact & Directions</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-2.5 text-henna-300">
                B2B & Trade
              </h4>
              <ul className="space-y-1.5 text-xs text-earth-300">
                <li><Link to="/wholesale" className="hover:text-white transition">Wholesale Export</Link></li>
                <li><Link to="/manufacturing" className="hover:text-white transition">Private Label Brand</Link></li>
                <li><Link to="/enquiry" className="hover:text-white transition">Bulk Quote Enquiry</Link></li>
                <li><Link to="/cart" className="hover:text-white transition">Cart & Checkout</Link></li>
                <li><Link to="/login" className="hover:text-henna-300 text-henna-400 font-semibold transition">Staff / Admin Login</Link></li>
              </ul>
            </div>
          </div>

          {/* Google Review & Trust */}
          <div className="md:col-span-3 space-y-3">
            <a
              href="https://maps.google.com/?q=Sojat+City+Rajasthan"
              target="_blank"
              rel="noreferrer"
              className="block p-3 rounded-xl bg-white/5 border border-white/10 hover:border-henna-400/50 transition group"
            >
              <div className="flex items-center justify-between">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="font-bold text-white text-xs">4.9 / 5.0</span>
              </div>
              <span className="text-[11px] text-earth-300 group-hover:text-white transition flex items-center gap-1 mt-1 font-medium">
                Sojat's Premier Henna Rating <ExternalLink className="w-3 h-3" />
              </span>
            </a>

            <div className="flex flex-wrap gap-1.5 text-[11px] text-earth-300">
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-henna-400" /> 100% Pure
              </span>
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-henna-400" /> Triple-Sifted
              </span>
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-henna-400" /> Zero PPD
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="mt-8 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-earth-400 text-center sm:text-left">
          <p>
            &copy; {new Date().getFullYear()} <strong>Madan Mehandi Udhyog (MMU)</strong>. Sojat City, Pali, Rajasthan 306104.
          </p>
          <div className="flex items-center gap-3">
            <span>Uniform Price: ₹299 / 100 gm</span>
            <span>&bull;</span>
            <Link to="/contact" className="hover:text-white transition">Directions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}