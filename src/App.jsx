import { useState, useEffect, useRef, useCallback } from "react";

/* ─────────────────────────────────────────
   GLOBAL STYLES (injected once)
───────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; }

    html { scroll-behavior: smooth; }

    body {
      margin: 0;
      padding: 0;
      background: #0a0a0a;
      font-family: 'DM Sans', sans-serif;
      cursor: none;
    }

    /* ── Custom Cursor ── */
    #custom-cursor {
      position: fixed;
      width: 10px;
      height: 10px;
      background: #c9a84c;
      border-radius: 50%;
      pointer-events: none;
      z-index: 99999;
      transform: translate(-50%, -50%);
      transition: transform 0.1s ease, width 0.2s ease, height 0.2s ease, background 0.2s ease;
      mix-blend-mode: difference;
      display: none; /* Hidden by default, shown via JS on non-touch */
    }
    @media (pointer: fine) {
      #custom-cursor { display: block; }
      body { cursor: none; }
    }

    #custom-cursor.cursor-grow {
      width: 28px;
      height: 28px;
      background: rgba(201,168,76,0.4);
    }

    /* ── Scrollbar ── */
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: #0a0a0a; }
    ::-webkit-scrollbar-thumb { background: #c9a84c44; border-radius: 2px; }
    ::-webkit-scrollbar-thumb:hover { background: #c9a84c88; }
    @media (max-width: 768px) {
      ::-webkit-scrollbar { width: 0px; }
    }

    /* ── Font Helpers ── */
    .font-cormorant { font-family: 'Cormorant Garamond', serif; }
    .font-dm { font-family: 'DM Sans', sans-serif; }

    /* ── Keyframe Animations ── */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(40px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px) scale(1); opacity: 0.6; }
      50%       { transform: translateY(-20px) scale(1.1); opacity: 1; }
    }
    @keyframes bounce-light {
      0%, 100% { transform: translateY(0); }
      50%       { transform: translateY(8px); }
    }
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes lineDraw {
      from { transform: scaleX(0); }
      to   { transform: scaleX(1); }
    }
    @keyframes pulse-gold {
      0%, 100% { box-shadow: 0 0 0 0 rgba(201,168,76,0); }
      50%       { box-shadow: 0 0 20px 4px rgba(201,168,76,0.18); }
    }
    @keyframes rotate-slow {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    @keyframes loading-fade-out {
      0%   { opacity: 1; pointer-events: all; }
      80%  { opacity: 1; }
      100% { opacity: 0; pointer-events: none; }
    }

    .animate-fadeUp   { animation: fadeUp 0.9s ease forwards; }
    .animate-fadeIn   { animation: fadeIn 0.9s ease forwards; }
    .animate-float    { animation: float ease-in-out infinite; }
    .animate-bounce-light { animation: bounce-light 1.6s ease-in-out infinite; }
    .animate-pulse-gold   { animation: pulse-gold 2.5s ease-in-out infinite; }
    .animate-shimmer  {
      background: linear-gradient(90deg, #c9a84c 0%, #f5e9c0 40%, #c9a84c 60%, #a07c2e 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: shimmer 4s linear infinite;
    }

    /* ── In-view reveal ── */
    .reveal {
      opacity: 0;
      transform: translateY(36px);
      transition: opacity 0.5s cubic-bezier(.4,0,.2,1), transform 0.5s cubic-bezier(.4,0,.2,1);
    }
    .reveal.in-view {
      opacity: 1;
      transform: translateY(0);
      transition: opacity 0.9s cubic-bezier(.4,0,.2,1), transform 0.9s cubic-bezier(.4,0,.2,1);
    }

    /* ── Loading Screen ── */
    .loading-screen {
      position: fixed; inset: 0;
      background: #0a0a0a;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 1rem;
    }
    .loading-screen.fade-out {
      animation: loading-fade-out 0.8s ease forwards;
    }

    /* ── Gold line decoration ── */
    .gold-line {
      height: 1px;
      background: linear-gradient(90deg, transparent, #c9a84c, transparent);
      transform-origin: left;
      animation: lineDraw 1.2s ease forwards;
    }

    /* ── Floating Particles ── */
    .particle {
      position: absolute;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: #c9a84c;
      pointer-events: none;
    }

    /* ── Timeline ── */
    .timeline-line {
      position: absolute;
      left: 50%;
      top: 0; bottom: 0;
      width: 1px;
      background: linear-gradient(to bottom, transparent, #c9a84c55, transparent);
      transform: translateX(-50%);
    }

    /* ── PDF Export / Print Styles ── */
    @media print {
      @page {
        margin: 0;
        size: auto;
      }
      
      /* Force body and root visibility */
      body, html, #root, main {
        display: block !important;
        background-color: #000 !important;
        color: #f5f0eb !important;
        opacity: 1 !important;
        visibility: visible !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      /* Hide non-printable items */
      #pdf-button, #custom-cursor, .grain-overlay, .loading-screen, section:not(.printable-section), .particle {
        display: none !important;
      }

      /* Re-ensure selected sections are shown */
      #hero-section, #roadmap-section, #dinner-section, #dresscode-section, #thankyou-section {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        page-break-after: always !important;
        min-height: 100vh !important;
        position: relative !important;
        background-color: #000 !important;
      }

      .reveal {
        opacity: 1 !important;
        transform: none !important;
        transition: none !important;
      }

      /* Special fix for Hero Image Parallax */
      #hero-section img {
        transform: none !important;
      }
      
      .py-28, .py-40, .py-36 { padding-top: 4rem !important; padding-bottom: 4rem !important; }
    }
    @media (max-width: 768px) {
      .timeline-line {
        left: 20px;
        transform: none;
      }
    }
    /* ── Grain Overlay ── */
    .grain-overlay {
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      z-index: 9998;
      pointer-events: none;
      opacity: 0.04;
      background-image: url("https://grainy-gradients.vercel.app/noise.svg");
      mix-blend-mode: overlay;
    }

    @media (max-width: 768px) {
      .font-cormorant-mobile-sm { font-size: 2.8rem !important; }
      .font-dm-mobile-xs { font-size: 0.6rem !important; }
    }

    /* ── Luxury Image Effects ── */
    .luxury-img-wrapper {
      position: relative;
      overflow: hidden;
      border-radius: 2px;
      background: #000;
      box-shadow: 0 10px 30px -15px rgba(0,0,0,0.5);
      transition: all 0.6s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .luxury-img-wrapper::after {
      content: "";
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.4) 100%);
      pointer-events: none;
      z-index: 2;
      transition: opacity 0.6s ease;
    }

    .luxury-img-wrapper:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 40px -20px rgba(201,168,76,0.15);
    }

    .gallery-img-core {
      filter: grayscale(0.4) sepia(0.2) brightness(0.7) contrast(1.1);
      transition: all 0.8s cubic-bezier(0.22, 1, 0.36, 1);
      transform: scale(1.02);
    }

    .luxury-img-wrapper:hover .gallery-img-core {
      filter: grayscale(0) sepia(0) brightness(0.95) contrast(1);
      transform: scale(1.1);
    }

    /* Elegant Caption */
    .luxury-caption {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      padding: 3rem 1.5rem 1.5rem;
      background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%);
      opacity: 0;
      transform: translateY(10px);
      transition: all 0.6s cubic-bezier(0.22, 1, 0.36, 1);
      z-index: 3;
    }

    .luxury-img-wrapper:hover .luxury-caption {
      opacity: 1;
      transform: translateY(0);
    }

    /* Gold Inner Border on Hover */
    .luxury-border {
      position: absolute;
      inset: 15px;
      border: 1px solid rgba(201,168,76,0);
      pointer-events: none;
      z-index: 4;
      transition: all 0.6s ease;
    }

    .luxury-img-wrapper:hover .luxury-border {
      border-color: rgba(201,168,76,0.3);
      inset: 20px;
    }
  `}</style>
);

/* ─────────────────────────────────────────
   CUSTOM HOOK: useInView
───────────────────────────────────────── */
function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Bidirectional: NOT disconnected — toggles on every enter/leave
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView];
}

/* ─────────────────────────────────────────
   CUSTOM CURSOR
───────────────────────────────────────── */
function CustomCursor() {
  const cursorRef = useRef(null);

  useEffect(() => {
    const el = cursorRef.current;
    if (!el) return;
    const move = (e) => {
      el.style.left = e.clientX + "px";
      el.style.top = e.clientY + "px";
    };
    const grow = () => el.classList.add("cursor-grow");
    const shrink = () => el.classList.remove("cursor-grow");

    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (!isTouchDevice) {
      window.addEventListener("mousemove", move);
      document.querySelectorAll("a, button, img, [data-hover]").forEach((el2) => {
        el2.addEventListener("mouseenter", grow);
        el2.addEventListener("mouseleave", shrink);
      });
    }

    return () => {
      window.removeEventListener("mousemove", move);
    };
  }, []);

  return <div id="custom-cursor" ref={cursorRef} />;
}

/* ─────────────────────────────────────────
   DOWNLOAD BUTTON
───────────────────────────────────────── */
function ExportButton() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <button
      id="pdf-button"
      onClick={handlePrint}
      style={{
        position: "fixed",
        bottom: scrolled ? "30px" : "-100px",
        right: "30px",
        zIndex: 1000,
        background: "rgba(201,168,76,0.9)",
        color: "#0a0a0a",
        border: "none",
        padding: "12px 24px",
        borderRadius: "2px",
        fontSize: "0.75rem",
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        fontWeight: 600,
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        cursor: "pointer",
        transition: "all 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px) scale(1.05)";
        e.currentTarget.style.background = "#f5f0eb";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        e.currentTarget.style.background = "rgba(201,168,76,0.9)";
      }}
    >
      <span style={{ fontSize: "1.2rem" }}>⬇</span> Export PDF
    </button>
  );
}

/* ─────────────────────────────────────────
   LOADING SCREEN
───────────────────────────────────────── */
function LoadingScreen({ onDone }) {
  const [fadeOut, setFadeOut] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t1 = setTimeout(() => setFadeOut(true), 2200);
    const t2 = setTimeout(() => {
      setVisible(false);
      onDone?.();
    }, 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  if (!visible) return null;

  return (
    <div className={`loading-screen ${fadeOut ? "fade-out" : ""}`}>
      <div style={{ textAlign: "center" }}>
        <p
          className="font-cormorant"
          style={{
            fontSize: "clamp(4rem, 12vw, 8rem)",
            fontStyle: "italic",
            fontWeight: 300,
            color: "#f5f0eb",
            margin: 0,
            letterSpacing: "0.08em",
            animation: "fadeIn 1.4s ease forwards",
            opacity: 0,
          }}
        >
          Happy Birthdayy Sayangg
        </p>
        <div
          className="gold-line"
          style={{
            width: "100%",
            marginTop: "0.5rem",
            animationDelay: "0.8s",
            opacity: 0,
            animation: "fadeIn 0.6s 0.9s ease forwards, lineDraw 1s 0.9s ease forwards",
          }}
        />
        <p
          className="font-dm"
          style={{
            color: "#c9a84c",
            fontSize: "0.7rem",
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            marginTop: "1rem",
            animation: "fadeIn 1s 1.4s ease forwards",
            opacity: 0,
          }}
        >
          28 · 03 · 2026
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   FLOATING PARTICLES
───────────────────────────────────────── */
function FloatingParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: `${Math.random() * 3 + 2}px`,
    duration: `${Math.random() * 4 + 4}s`,
    delay: `${Math.random() * 4}s`,
    opacity: Math.random() * 0.5 + 0.2,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle animate-float"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   SECTION 1: HERO
───────────────────────────────────────── */
function HeroSection() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section id="hero-section" className="printable-section relative min-h-screen flex items-end overflow-hidden">
      {/* Background Photo */}
      <div 
        className="absolute inset-0 z-0 scale-110"
        style={{ transform: `translateY(${scrollY * 0.3}px)` }}
      >
        {/* GANTI FOTO: foto Clara sendiri */}
        <img
          src="https://picsum.photos/seed/portrait/800/1000"
          alt="Clara"
          className="w-full h-full object-cover object-top"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/30" />
      </div>

      {/* Floating Particles */}
      <FloatingParticles />

      {/* Content */}
      <div className="relative z-10 w-full px-6 md:px-20 pb-16 md:pb-28">
        {/* Tag date */}
        <p
          className="font-dm text-xs tracking-[0.45em] uppercase mb-5 animate-fadeUp"
          style={{
            color: "#c9a84c",
            animationDelay: "0.2s",
            opacity: 0,
            animationFillMode: "forwards",
          }}
        >
          28 Maret 2006 &mdash; 28 Maret 2026
        </p>

        {/* Name */}
        <h1
          className="font-cormorant animate-fadeUp"
          style={{
            fontStyle: "italic",
            fontWeight: 300,
            fontSize: "clamp(3rem, 9vw, 7.5rem)",
            lineHeight: 1.0,
            color: "#f5f0eb",
            margin: "0 0 1rem",
            animationDelay: "0.5s",
            opacity: 0,
            animationFillMode: "forwards",
          }}
        >
          Clara Elisa
          <br />
          <span className="animate-shimmer">Arshanti</span>
        </h1>

        {/* Divider */}
        <div
          className="animate-fadeUp"
          style={{
            animationDelay: "0.85s",
            opacity: 0,
            animationFillMode: "forwards",
          }}
        >
          <div
            className="gold-line"
            style={{ width: "80px", marginBottom: "1.2rem" }}
          />
        </div>

        {/* Subtitle */}
        <p
          className="font-dm animate-fadeUp"
          style={{
            fontSize: "0.72rem",
            letterSpacing: "0.42em",
            textTransform: "uppercase",
            color: "#f5f0ebaa",
            animationDelay: "1.1s",
            opacity: 0,
            animationFillMode: "forwards",
          }}
        >
          Happy 20th Birthday
        </p>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 right-8 z-10 flex flex-col items-center gap-2 animate-bounce-light"
        style={{ color: "#c9a84c88" }}
      >
        <span
          className="font-dm"
          style={{ fontSize: "0.6rem", letterSpacing: "0.3em", textTransform: "uppercase" }}
        >
          scroll
        </span>
        <div style={{ width: "1px", height: "40px", background: "linear-gradient(to bottom, #c9a84c88, transparent)" }} />
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   SECTION 2: BIRTHDAY MESSAGE
───────────────────────────────────────── */
function MessageSection() {
  const [ref, inView] = useInView(0.15);

  return (
    <section
      style={{ background: "#0f0f0f" }}
      className="py-24 md:py-40 px-6 md:px-20 lg:px-40"
    >
      <div ref={ref} className={`reveal ${inView ? "in-view" : ""}`}>
        {/* Pre-title */}
        <p
          className="font-dm text-center"
          style={{
            fontSize: "0.65rem",
            letterSpacing: "0.45em",
            textTransform: "uppercase",
            color: "#c9a84c",
            marginBottom: "1.5rem",
          }}
        >
          buat pacarkuuuu, Clara 🤍
        </p>

        {/* Gold line centered */}
        <div className="flex justify-center mb-12">
          <div className="gold-line" style={{ width: "60px" }} />
        </div>

        {/* Message text */}
        <p
          className="font-cormorant text-center mx-auto"
          style={{
            fontWeight: 300,
            fontSize: "clamp(1.3rem, 2.8vw, 1.9rem)",
            lineHeight: 1.85,
            color: "#f5f0ebcc",
            maxWidth: "780px",
            transitionDelay: "0.2s",
          }}
        >
          {/* Selamat ulang tahun, Clara. Hari ini kamu resmi menginjakkan kaki di
          usia 20 &mdash; sebuah angka yang terasa besar, tapi aku tahu kamu lebih
          dari siap. Semoga di usia barumu ini kamu selalu sehat, selalu cantik,
          dan selalu bahagia seperti senyummu yang nggak pernah gagal bikin
          hari-hariku lebih hangat. Dua puluh tahun dunia mengenalmu, dan aku
          merasa sangat beruntung bisa jadi salah satu yang ada di sisimu. */}
          Selamat ulang tahun sayanggg, Hari ini kamuu duaa resmii menginjak 
        dii 20 tahunn!!! yeyyy &mdash; sebuah angka yang besar, tapi aku tauu
        kamuu lebihh siap lagii. Semoga di umur yang bertambah ini kamu selalu sehat,
        dalam penyertaan Tuhan, selalu sabarr, tambah dewasa, jadii anak yang akan
        banggain orangtua muu, dan selalu bahagiaa yaa. Dua puluh tahunn dunia udah kenal kamu,
        dan aku ngerasa beruntung bisa ketemu sama pacarkuu inii.
        </p>

        {/* Bottom ornament */}
        <div className="flex justify-center mt-14">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#c9a84c44" }}>
            <div className="gold-line" style={{ width: "40px" }} />
            <span style={{ fontSize: "1rem" }}>✦</span>
            <div className="gold-line" style={{ width: "40px" }} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   GALLERY REVEAL ITEM
───────────────────────────────────────── */
function GalleryItem({ src, alt, className, delay = 0, comment }) {
  const [ref, inView] = useInView(0.1);

  return (
    <div
      ref={ref}
      className={`reveal ${inView ? "in-view" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="luxury-img-wrapper group" data-hover>
        {/* The Image with filter */}
        <img
          src={src}
          alt={alt}
          className="gallery-img-core w-full h-full object-cover"
          style={{ display: "block", aspectRatio: "4/5" }}
        />

        {/* Decorative Gold Border */}
        <div className="luxury-border" />

        {/* Caption */}
        {comment && (
          <div className="luxury-caption text-center">
            <p className="font-dm text-[9px] tracking-[0.4em] uppercase text-[#c9a84c] mb-1">
              Dear Clara
            </p>
            <p className="font-cormorant italic text-lg text-[#f5f0eb] leading-tight">
              &quot;{comment}&quot;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   SECTION 3: GALLERY
───────────────────────────────────────── */
function GallerySection() {
  const [titleRef, titleInView] = useInView(0.2);

  return (
    <section style={{ background: "#0a0a0a" }} className="py-28 md:py-36 px-6 md:px-16">
      {/* Title */}
      <div
        ref={titleRef}
        className={`reveal ${titleInView ? "in-view" : ""} text-center mb-16`}
      >
        <p
          className="font-dm"
          style={{
            fontSize: "0.65rem",
            letterSpacing: "0.45em",
            textTransform: "uppercase",
            color: "#c9a84c",
            marginBottom: "0.8rem",
          }}
        >
          Memories
        </p>
        <h2
          className="font-cormorant"
          style={{
            fontStyle: "italic",
            fontWeight: 300,
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            color: "#f5f0eb",
            margin: 0,
          }}
        >
          Our Moments
        </h2>
      </div>

      {/* Dynamic Editorial Grid */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3 md:gap-5 max-w-6xl mx-auto">
        {/* Photo 1: Featured Large */}
        <GalleryItem
          src="/img/6.jpeg"
          alt="Memory 1"
          className="md:col-span-4 md:row-span-2"
          delay={0}
          comment="Foto berdua 1"
        />
        
        {/* Photo 2: Small Top Right */}
        <GalleryItem
          src="/img/2.jpeg"
          alt="Memory 2"
          className="md:col-span-2"
          delay={150}
          comment="Foto berdua 2"
        />

        {/* Photo 3: Small Bottom Right */}
        <GalleryItem
          src="/img/5.jpeg"
          alt="Memory 3"
          className="md:col-span-2"
          delay={300}
          comment="Foto berdua 3"
        />

        {/* Photo 4: Medium Bottom Left */}
        <GalleryItem
          src="/img/8.jpeg"
          alt="Memory 4"
          className="md:col-span-3"
          delay={450}
          comment="Foto berdua 4"
        />

        {/* Photo 5: Medium Bottom Right */}
        <GalleryItem
          src="/img/7.jpeg"
          alt="Memory 5"
          className="md:col-span-3"
          delay={600}
          comment="Foto berdua 5"
        />
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   SECTION 4: ROADMAP / TIMELINE
───────────────────────────────────────── */
const TIMELINE_ITEMS = [
  {
    emoji: "🏠",
    title: "Rumah Alvin",
    desc: "OTW darii rumaah",
    time: null,
  },
  {
    emoji: "🏡",
    title: "Menjemput di Rumah Clara",
    desc: "jemputt pacarr",
    time: null,
  },
  {
    emoji: "🍽️",
    title: "Tune In Coffee Semarang",
    desc: "Makan malam spesial buatt hari yang spesial",
    time: "20.00 WIB",
  },
  {
    emoji: "📷",
    title: "Photobox",
    desc: "HEHHEHEH pastii nyaa tidakk lupaa kita fotoo dluu",
    time: null,
  },
  {
    emoji: "🌙",
    title: "Pulang",
    desc: "saaatnyaa storyy telling",
    time: null,
  },
];

function TimelineItem({ item, index, isLeft }) {
  const [ref, inView] = useInView(0.15);
  const isEven = index % 2 === 0;

  return (
    <div
      ref={ref}
      className={`reveal ${inView ? "in-view" : ""}`}
      style={{
        transitionDelay: `${index * 120}ms`,
        display: "flex",
        justifyContent: isEven ? "flex-end" : "flex-start",
        paddingRight: isEven ? "calc(50% + 28px)" : "0",
        paddingLeft: isEven ? "0" : "calc(50% + 28px)",
        marginBottom: "3rem",
      }}
    >
      {/* Mobile layout: always left */}
      <div
        className="hidden md:block"
        style={{ width: "100%", maxWidth: "380px" }}
      >
        <div
          className="group"
          style={{
            background: "#111",
            border: "1px solid rgba(201,168,76,0.15)",
            borderRadius: "2px",
            padding: "1.4rem 1.8rem",
            transition: "border-color 0.4s, box-shadow 0.4s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(201,168,76,0.5)";
            e.currentTarget.style.boxShadow = "0 0 24px rgba(201,168,76,0.07)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(201,168,76,0.15)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.7rem", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "1.4rem" }}>{item.emoji}</span>
            <h3
              className="font-cormorant"
              style={{
                fontWeight: 500,
                fontSize: "1.25rem",
                color: "#f5f0eb",
                margin: 0,
              }}
            >
              {item.title}
            </h3>
            {item.time && (
              <span
                className="font-dm"
                style={{
                  fontSize: "0.6rem",
                  letterSpacing: "0.2em",
                  color: "#c9a84c",
                  background: "rgba(201,168,76,0.1)",
                  padding: "2px 8px",
                  borderRadius: "2px",
                  marginLeft: "auto",
                  whiteSpace: "nowrap",
                }}
              >
                {item.time}
              </span>
            )}
          </div>
          <p
            className="font-dm"
            style={{ fontSize: "0.82rem", color: "#f5f0eb88", margin: 0, lineHeight: 1.6 }}
          >
            {item.desc}
          </p>
        </div>
      </div>
    </div>
  );
}

function TimelineItemMobile({ item, index }) {
  const [ref, inView] = useInView(0.15);

  return (
    <div
      ref={ref}
      className={`reveal ${inView ? "in-view" : ""} md:hidden`}
      style={{
        transitionDelay: `${index * 130}ms`,
        display: "flex",
        gap: "1rem",
        marginBottom: "1.8rem",
        paddingLeft: "36px",
        position: "relative",
      }}
    >
      {/* Dot */}
      <div
        style={{
          position: "absolute",
          left: "12px",
          top: "14px",
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          background: "#c9a84c",
          border: "2px solid #0a0a0a",
          zIndex: 1,
        }}
      />
      <div
        style={{
          background: "#111",
          border: "1px solid rgba(201,168,76,0.15)",
          borderRadius: "2px",
          padding: "1rem 1.2rem",
          flex: 1,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.4rem" }}>
          <span style={{ fontSize: "1.2rem" }}>{item.emoji}</span>
          <h3
            className="font-cormorant"
            style={{ fontWeight: 500, fontSize: "1.1rem", color: "#f5f0eb", margin: 0, flex: 1 }}
          >
            {item.title}
          </h3>
        </div>
        {item.time && (
          <p
            className="font-dm"
            style={{ fontSize: "0.6rem", letterSpacing: "0.2em", color: "#c9a84c", marginBottom: "0.4rem" }}
          >
            {item.time}
          </p>
        )}
        <p
          className="font-dm"
          style={{ fontSize: "0.8rem", color: "#f5f0eb88", margin: 0, lineHeight: 1.6 }}
        >
          {item.desc}
        </p>
      </div>
    </div>
  );
}

function RoadmapSection() {
  const [titleRef, titleInView] = useInView(0.2);

  return (
    <section id="roadmap-section" className="printable-section relative py-28 md:py-36 px-6" style={{ background: "#0a0a0a" }}>
      {/* Title */}
      <div
        ref={titleRef}
        className={`reveal ${titleInView ? "in-view" : ""} text-center mb-20`}
      >
        <p
          className="font-dm"
          style={{
            fontSize: "0.65rem",
            letterSpacing: "0.45em",
            textTransform: "uppercase",
            color: "#c9a84c",
            marginBottom: "0.8rem",
          }}
        >
          The Plan
        </p>
        <h2
          className="font-cormorant"
          style={{
            fontStyle: "italic",
            fontWeight: 300,
            fontSize: "clamp(2.5rem, 6vw, 4rem)",
            color: "#f5f0eb",
            margin: 0,
          }}
        >
          Agenda Malem Nanti
        </h2>
      </div>

      {/* Desktop timeline */}
      <div className="hidden md:block relative max-w-5xl mx-auto">
        <div className="timeline-line" />
        {/* Dot for each item */}
        {TIMELINE_ITEMS.map((item, i) => (
          <div key={i} style={{ position: "relative" }}>
            {/* Center dot */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "1.5rem",
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: "#c9a84c",
                border: "3px solid #0a0a0a",
                transform: "translateX(-50%)",
                zIndex: 2,
              }}
            />
            <TimelineItem item={item} index={i} />
          </div>
        ))}
      </div>

      {/* Mobile timeline */}
      <div
        className="md:hidden max-w-sm mx-auto"
        style={{ position: "relative", paddingLeft: "10px" }}
      >
        <div 
          style={{ 
            position: "absolute", 
            left: "17px", 
            top: 0, 
            bottom: 0, 
            width: "1px", 
            background: "linear-gradient(to bottom, transparent, #c9a84c66, transparent)" 
          }} 
        />
        {TIMELINE_ITEMS.map((item, i) => (
          <TimelineItemMobile key={i} item={item} index={i} />
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   SECTION 5: DINNER
───────────────────────────────────────── */
function DinnerSection() {
  const [ref, inView] = useInView(0.2);

  return (
    <section
      id="dinner-section"
      className="printable-section py-28 md:py-36 px-6"
      style={{ background: "#0f0f0f" }}
    >
      <div
        ref={ref}
        className={`reveal ${inView ? "in-view" : ""} text-center max-w-xl mx-auto`}
      >
        <p
          className="font-dm"
          style={{
            fontSize: "0.65rem",
            letterSpacing: "0.45em",
            textTransform: "uppercase",
            color: "#c9a84c",
            marginBottom: "0.8rem",
          }}
        >
          Tonight&apos;s Destination
        </p>
        <h2
          className="font-cormorant"
          style={{
            fontStyle: "italic",
            fontWeight: 300,
            fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
            color: "#f5f0eb",
            marginBottom: "3rem",
          }}
        >
          For Dinner ✨
        </h2>

        {/* Card */}
        <div
          className="animate-pulse-gold"
          style={{
            background: "#1a1a1a",
            border: "1px solid rgba(201,168,76,0.2)",
            borderRadius: "4px",
            padding: "2.5rem 2rem",
            transition: "border-color 0.5s, box-shadow 0.5s",
            cursor: "default",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(201,168,76,0.6)";
            e.currentTarget.style.boxShadow = "0 0 30px rgba(201,168,76,0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(201,168,76,0.2)";
            e.currentTarget.style.boxShadow = "";
          }}
          data-hover
        >
          {/* Restaurant name */}
          <h3
            className="font-cormorant"
            style={{
              fontSize: "2rem",
              fontWeight: 400,
              color: "#f5f0eb",
              margin: "0 0 1.5rem",
            }}
          >
            Tune In
          </h3>

          <div className="gold-line" style={{ width: "50px", margin: "0 auto 1.5rem" }} />

          {/* Details */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              alignItems: "center",
            }}
          >
            {[
              { icon: "📍", label: "Tune In Coffee, Semarang" },
              { icon: "🕖", label: "20.00 WIB — jangan telat!" },
              { icon: "🌆", label: "Openn kado" },
            ].map((d, i) => (
              <div
                key={i}
                className="font-dm"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.8rem",
                  fontSize: "0.85rem",
                  color: "#f5f0ebaa",
                  textAlign: "center"
                }}
              >
                <span style={{ fontSize: "1.1rem" }}>{d.icon}</span>
                <span style={{ lineHeight: 1.4 }}>{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   DRESSCODE IMAGE COMPONENT
───────────────────────────────────────── */
function DresscodeImage({ src, alt, className }) {
  return (
    <div className={`luxury-img-wrapper group ${className}`} data-hover>
      <img
        src={src}
        alt={alt}
        className="gallery-img-core w-full h-full object-cover"
        style={{ display: "block" }}
      />
      <div className="luxury-border" />
      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700" />
    </div>
  );
}

/* ─────────────────────────────────────────
   SECTION 6: DRESSCODE
───────────────────────────────────────── */
function DresscodeSection() {
  const [ref, inView] = useInView(0.15);

  return (
    <section id="dresscode-section" className="printable-section py-28 md:py-40 px-6 md:px-16 overflow-hidden" style={{ background: "#0a0a0a" }}>
      <div
        ref={ref}
        className={`reveal ${inView ? "in-view" : ""}`}
      >
        {/* Title block */}
        <div className="text-center mb-20">
          <p
            className="font-dm"
            style={{
              fontSize: "0.65rem",
              letterSpacing: "0.45em",
              textTransform: "uppercase",
              color: "#c9a84c",
              marginBottom: "0.8rem",
            }}
          >
            What To Wear
          </p>
          <h2
            className="font-cormorant"
            style={{
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: "clamp(2.5rem, 6vw, 4.2rem)",
              color: "#f5f0eb",
              margin: "0 0 0.5rem",
            }}
          >
            Dress The Night
          </h2>
          <p
            className="font-cormorant italic text-xl text-[#c9a84c]"
          >
            &ldquo;Casual Earth Tone&rdquo;
          </p>
        </div>

        {/* Layout Container */}
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
          {/* Dual Image Composition (Modern Asymmetrical) */}
          <div className="w-full lg:w-[55%] relative flex items-center justify-center">
            {/* Background Shape / Glow (Subtle) */}
            <div className="absolute -z-10 w-[120%] h-[120%] opacity-20 bg-[radial-gradient(circle,rgba(201,168,76,0.1)_0%,transparent_70%)] pointer-events-none" />

            {/* Photo 1: Main (dresscode.jpeg) */}
            <div className="relative z-10 w-[70%] sm:w-[55%] shadow-2xl transform hover:-rotate-1 transition-transform duration-700">
               <DresscodeImage 
                  src="/img/dresscode.jpeg" 
                  alt="Dresscode Reference 1"
                  className="aspect-[3/4]"
               />
            </div>

            {/* Photo 2: Overlapping (dc.jpeg) */}
            <div className="absolute -bottom-10 -right-2 sm:-right-8 z-20 w-[60%] sm:w-[45%] shadow-2xl transform hover:rotate-1 transition-transform duration-700">
               <DresscodeImage 
                  src="/img/dc.jpeg" 
                  alt="Dresscode Reference 2"
                  className="aspect-[4/5] border-[6px] border-[#0a0a0a]"
               />
            </div>
          </div>

          {/* Text Content */}
          <div className="w-full lg:w-[45%] flex flex-col gap-8 text-center lg:text-left">
            <div>
              <div className="gold-line mx-auto lg:mx-0" style={{ width: "60px", marginBottom: "2rem" }} />
              <p
                className="font-cormorant"
                style={{
                  fontWeight: 300,
                  fontSize: "clamp(1.25rem, 2.2vw, 1.7rem)",
                  lineHeight: 1.8,
                  color: "#f5f0ebcc",
                }}
              >
                Malem ini kita pake baju santai aja yaa! Flannel, kaos putih, sama celana jeans &mdash; biar senadaa sama akuu.
              </p>
            </div>

            {/* Palette */}
            <div className="flex flex-wrap gap-5 justify-center lg:justify-start mt-4">
              {[
                { color: "#A67B5B", label: "Cokelat Muda" },
                { color: "#4B3621", label: "Cokelat Tua" },
                { color: "#F5F5DC", label: "Krem/Beige" },
                { color: "#333333", label: "Abu-abu" },
                { color: "#4a76a8", label: "Biru Denim" },
              ].map((chip) => (
                <div key={chip.label} className="flex flex-col items-center gap-3">
                  <div
                    style={{
                      width: "35px",
                      height: "35px",
                      borderRadius: "50%",
                      background: chip.color,
                      border: "1px solid rgba(201,168,76,0.3)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.4)"
                    }}
                  />
                  <span className="font-dm text-[9px] tracking-[0.2em] text-[#f5f0eb66] uppercase">
                    {chip.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   SECTION 7: THANK YOU
───────────────────────────────────────── */
function ThankYouSection() {
  const [ref, inView] = useInView(0.1);

  return (
    <section
      id="thankyou-section"
      className="printable-section flex flex-col items-center justify-center py-28 px-6 md:px-20 text-center relative overflow-hidden"
      style={{ background: "#050505", minHeight: "100vh" }}
    >
      {/* Subtle background glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        ref={ref}
        className={`reveal ${inView ? "in-view" : ""} relative z-10 max-w-3xl`}
        style={{ transitionDuration: "1.4s" }}
      >
        {/* Pre-label */}
        <p
          className="font-dm"
          style={{
            fontSize: "0.62rem",
            letterSpacing: "0.5em",
            textTransform: "uppercase",
            color: "#c9a84c",
            marginBottom: "0.8rem",
          }}
        >
          buatt pacarkuu 🤍
        </p>

        {/* Gold line */}
        <div className="flex justify-center mb-10">
          <div className="gold-line" style={{ width: "80px" }} />
        </div>

        {/* Main title */}
        <h2
          className="font-cormorant"
          style={{
            fontStyle: "italic",
            fontWeight: 300,
            fontSize: "clamp(3rem, 8vw, 6.5rem)",
            color: "#f5f0eb",
            margin: "0 0 2.5rem",
            lineHeight: 1.1,
          }}
        >
          Thank You,{" "}
          <span className="animate-shimmer">Clara</span>
        </h2>

        {/* Message */}
        <p
          className="font-cormorant"
          style={{
            fontWeight: 300,
            fontSize: "clamp(1.15rem, 2.4vw, 1.65rem)",
            lineHeight: 1.95,
            color: "#f5f0ebbb",
            marginBottom: "3.5rem",
          }}
        >
          Makasiii sudaa ada buat akuu, Terima kasih sudah mau berbagi waktu, canda, tawa, ceritaa. &mdash;
        kamu alasan akuu bisa tumbuh, bisa jadi lebih baik, bisa jadi lebih hebat.
        Selamat ulang tahun, sayang. Dari pacarmuu.
        </p>

        {/* Signature */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.8rem" }}>
          <div className="gold-line" style={{ width: "60px" }} />
          <p
            className="font-cormorant"
            style={{
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: "1.3rem",
              color: "#c9a84c",
              margin: 0,
              letterSpacing: "0.04em",
            }}
          >
            &mdash; Alvin Deo Ardiansyah
          </p>
        </div>

        {/* Footer note */}
        <p
          className="font-dm"
          style={{
            marginTop: "4rem",
            fontSize: "0.6rem",
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: "#f5f0eb33",
          }}
        >
          28 · 03 · 2026 &nbsp;✦&nbsp; Semarang
        </p>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   MAIN APP
───────────────────────────────────────── */
export default function App() {
  const [loaded, setLoaded] = useState(false);

  const handleLoadingDone = useCallback(() => {
    setLoaded(true);
  }, []);

  return (
    <>
      <GlobalStyles />
      <div className="grain-overlay" />
      <CustomCursor />
      <ExportButton />

      <LoadingScreen onDone={handleLoadingDone} />

      <main
        style={{
          background: "#0a0a0a",
          color: "#f5f0eb",
          overflowX: "hidden",
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.6s ease",
        }}
      >
        <HeroSection />
        <MessageSection />
        <GallerySection />
        <RoadmapSection />
        <DinnerSection />
        <DresscodeSection />
        <ThankYouSection />
      </main>
    </>
  );
}
