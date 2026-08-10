"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Shield,
  Zap,
  Globe,
  Lock,
  ArrowRight,
  CheckCircle2,
  Fingerprint,
  Blocks,
  Brain,
  FileCheck,
  Upload,
  Search,
  Star,
  ChevronRight,
  Wallet,
  ExternalLink,
  Sparkles,
  TrendingUp,
  Users,
  FileText,
  Copy,
  Layers,
  Database,
  Server,
  Code2,
  ShoppingBag,
  Check,
  HelpCircle,
  Cpu,
  Image as ImageIcon,
  Music,
  Film,
  Palette,
} from "lucide-react";
import Link from "next/link";
import { MOCK_STATS, CONTENT_TYPES } from "./lib/store";

// ============================================
// LIGHT AMBIENT PARTICLE BACKGROUND
// ============================================
function LightParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 45; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.25 + 0.08,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(79, 70, 229, ${p.opacity})`;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[j].x - p.x;
          const dy = particles[j].y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(79, 70, 229, ${0.04 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      });

      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

// ============================================
// ANIMATED COUNTER
// ============================================
function AnimatedCounter({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 1800;
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          animate();
        }
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

// ============================================
// NAVBAR
// ============================================
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 15);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs"
          : "bg-white/80 backdrop-blur-sm border-b border-slate-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 no-underline group">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-xs shadow-indigo-500/20 group-hover:bg-indigo-700 transition-colors">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900 tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Proof<span className="text-indigo-600">Vault</span> <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase">AI</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-7">
          <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors no-underline">
            Features
          </a>
          <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors no-underline">
            How It Works
          </a>
          <a href="#technology" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors no-underline">
            Technology
          </a>
          <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors no-underline">
            Pricing
          </a>
          <Link href="/dashboard/verify" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors no-underline flex items-center gap-1">
            <Search className="w-3.5 h-3.5" />
            Verify
          </Link>
          <Link href="/dashboard/marketplace" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors no-underline flex items-center gap-1">
            <ShoppingBag className="w-3.5 h-3.5" />
            Marketplace
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/auth/login"
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 px-3 py-2 rounded-lg transition-colors no-underline hidden sm:inline-block"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="btn-primary text-xs py-2 px-3.5 no-underline shadow-xs"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Launch App</span>
          </Link>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden btn-icon w-9 h-9"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
          >
            <span className="text-base font-semibold">{mobileOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-200 bg-white shadow-lg overflow-hidden"
          >
            <div className="px-5 py-4 flex flex-col gap-2.5">
              <a
                href="#features"
                className="text-sm font-medium text-slate-700 hover:text-indigo-600 py-1.5 no-underline"
                onClick={() => setMobileOpen(false)}
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-sm font-medium text-slate-700 hover:text-indigo-600 py-1.5 no-underline"
                onClick={() => setMobileOpen(false)}
              >
                How It Works
              </a>
              <a
                href="#technology"
                className="text-sm font-medium text-slate-700 hover:text-indigo-600 py-1.5 no-underline"
                onClick={() => setMobileOpen(false)}
              >
                Technology
              </a>
              <a
                href="#pricing"
                className="text-sm font-medium text-slate-700 hover:text-indigo-600 py-1.5 no-underline"
                onClick={() => setMobileOpen(false)}
              >
                Pricing
              </a>
              <Link
                href="/dashboard/verify"
                className="text-sm font-medium text-slate-700 hover:text-indigo-600 py-1.5 no-underline"
                onClick={() => setMobileOpen(false)}
              >
                Verify Asset
              </Link>
              <Link
                href="/dashboard/marketplace"
                className="text-sm font-medium text-slate-700 hover:text-indigo-600 py-1.5 no-underline"
                onClick={() => setMobileOpen(false)}
              >
                Marketplace & Licensing
              </Link>
              <div className="pt-2 border-t border-slate-100 flex gap-2">
                <Link
                  href="/auth/login"
                  className="btn-secondary text-xs flex-1 text-center py-2 no-underline"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="btn-primary text-xs flex-1 text-center py-2 no-underline"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

// ============================================
// HERO SECTION
// ============================================
function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      {/* Subtle Ambient Light Gradients */}
      <div className="light-ambient-glow w-[500px] h-[500px] bg-indigo-200/40 top-[-80px] left-1/2 -translate-x-1/2" />
      <div className="light-ambient-glow w-[350px] h-[350px] bg-cyan-200/30 top-[20%] right-[-100px]" />
      <div className="light-ambient-glow w-[300px] h-[300px] bg-purple-200/30 bottom-0 left-[-100px]" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 light-grid-pattern opacity-60 pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Top Tagline Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/70 mb-6 shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span className="text-xs text-indigo-700 font-semibold tracking-wide">
            Enterprise IP Protection & Blockchain Proof
          </span>
          <span className="text-indigo-300">|</span>
          <span className="text-[11px] text-slate-600 font-medium">Polygon Amoy & Multi-Model AI</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 max-w-4xl mx-auto leading-[1.12]"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Protect Your Digital Work.
          <br />
          <span className="gradient-text">Prove It. Verify It. Own It.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto mb-9 leading-relaxed"
        >
          Generate multi-layer cryptographic AI fingerprints, pin to decentralized IPFS, and anchor permanent proof on Polygon in{" "}
          <strong className="text-slate-900 font-semibold">under 30 seconds</strong> for{" "}
          <strong className="text-slate-900 font-semibold">less than $0.01</strong>.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-14"
        >
          <Link
            href="/dashboard/upload"
            className="btn-primary text-sm sm:text-base px-6 py-3.5 rounded-xl no-underline w-full sm:w-auto shadow-md"
          >
            <Upload className="w-4 h-4" />
            <span>Protect Your Work</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/dashboard/verify"
            className="btn-secondary text-sm sm:text-base px-6 py-3.5 rounded-xl no-underline w-full sm:w-auto"
          >
            <Search className="w-4 h-4 text-slate-500" />
            <span>Verify Ownership</span>
          </Link>
        </motion.div>

        {/* Premium Visual Pipeline Flow */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-4xl mx-auto mb-16 p-4 sm:p-6 bg-white border border-slate-200 rounded-2xl shadow-md"
        >
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 text-left flex items-center justify-between">
            <span>Cryptographic Verification Pipeline</span>
            <span className="badge badge-green text-[10px]">Zero-Knowledge Ready</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-left">
            {/* Step 1 */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <span className="font-semibold text-slate-900 text-xs">Digital Asset</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Image, Audio, Code, Video, or Docs uploaded securely.
              </p>
              <div className="mt-2 text-[10px] font-mono text-slate-600 bg-white px-2 py-1 rounded border border-slate-200 truncate">
                RAW_FILE_STREAM
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100 relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <span className="font-semibold text-slate-900 text-xs">AI Fingerprint</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                SHA-256 + 2D-DCT pHash + Neural Vision Embeddings.
              </p>
              <div className="mt-2 text-[10px] font-mono text-indigo-700 bg-white px-2 py-1 rounded border border-indigo-200 truncate">
                0x7f83...9069
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-100 relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <span className="font-semibold text-slate-900 text-xs">Blockchain Proof</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Anchored to Polygon smart contracts + IPFS CID.
              </p>
              <div className="mt-2 text-[10px] font-mono text-purple-700 bg-white px-2 py-1 rounded border border-purple-200 truncate">
                Polygon Block #6830
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-3.5 rounded-xl bg-green-50/50 border border-green-100 relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-green-600 text-white flex items-center justify-center font-bold text-xs">
                  4
                </div>
                <span className="font-semibold text-slate-900 text-xs">Proof Certificate</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Immutable ownership evidence + optional Proof NFT.
              </p>
              <div className="mt-2 text-[10px] font-mono text-green-700 bg-white px-2 py-1 rounded border border-green-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> VERIFIED
              </div>
            </div>
          </div>
        </motion.div>

        {/* Live Metrics Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto"
        >
          {[
            { label: "Assets Protected", value: MOCK_STATS.assetsProtected, suffix: "+", icon: Shield },
            { label: "Verifications Completed", value: MOCK_STATS.totalVerifications, suffix: "+", icon: Search },
            { label: "Verified Creators", value: MOCK_STATS.totalCreators, suffix: "+", icon: Users },
            { label: "Gas Cost Reduced", value: 99, suffix: ".9%", icon: Zap },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-xs">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-xs text-slate-500 font-medium">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================
// TRUST & TECHNOLOGY SECTION
// ============================================
function TrustSection() {
  const technologies = [
    { name: "AI Fingerprinting", detail: "CLIP, CodeBERT, FAISS", icon: Brain, badge: "Neural" },
    { name: "Polygon PoS", detail: "Amoy Testnet & Mainnet", icon: Blocks, badge: "L2 Chain" },
    { name: "IPFS Storage", detail: "Decentralized Pinata Pins", icon: Globe, badge: "Storage" },
    { name: "FastAPI Backend", detail: "High-throughput Vector API", icon: Server, badge: "Core" },
    { name: "Next.js 16", detail: "Modern App Router + React 19", icon: Code2, badge: "Frontend" },
    { name: "MongoDB Atlas", detail: "Metadata & Account Audits", icon: Database, badge: "Database" },
    { name: "Zero Knowledge", detail: "Proof Without Content Reveal", icon: Lock, badge: "Security" },
    { name: "ERC-721 Proofs", detail: "Composable Ownership NFTs", icon: Sparkles, badge: "Standard" },
  ];

  return (
    <section id="technology" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50/70 border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="badge badge-blue mb-3">Enterprise Stack</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Engineered with Battle-Tested Technology
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Combining decentralized ledger immutability with multimodal AI computer vision and semantic embeddings.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {technologies.map((tech) => (
            <div
              key={tech.name}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <tech.icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  {tech.badge}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">{tech.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{tech.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// WORKFLOW (HOW IT WORKS) SECTION
// ============================================
function WorkflowSection() {
  const steps = [
    {
      number: "01",
      icon: Upload,
      title: "Upload Your Content",
      desc: "Drag & drop high-resolution images, music, video masters, documents, or source code repositories.",
    },
    {
      number: "02",
      icon: Brain,
      title: "Multimodal AI Fingerprint",
      desc: "Computes native SHA-256 cryptographic hashes alongside 2D-DCT perceptual hash and AI neural embeddings.",
    },
    {
      number: "03",
      icon: Globe,
      title: "Decentralized IPFS Pinning",
      desc: "Content metadata and cryptographic fingerprints are pinned to Pinata's global decentralized network.",
    },
    {
      number: "04",
      icon: Blocks,
      title: "Polygon Smart Contract Anchoring",
      desc: "Ownership registration transaction is mined on Polygon with timestamped cryptographic commitment.",
    },
    {
      number: "05",
      icon: FileCheck,
      title: "Proof Certificate & NFT",
      desc: "Receive an immutable, downloadable certificate of ownership with optional ERC-721 token minting.",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="badge badge-purple mb-3">5-Step Process</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            From Asset to <span className="gradient-text">Immutable Proof</span>
          </h2>
          <p className="text-base text-slate-600 mt-2">
            Mathematical, tamper-proof proof of existence and creator attribution in 30 seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {steps.map((step, idx) => (
            <div
              key={step.number}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs relative flex flex-col justify-between hover:border-indigo-200 hover:shadow-sm transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// FEATURES SECTION
// ============================================
function FeaturesSection() {
  const features = [
    {
      icon: Brain,
      title: "AI Fingerprinting",
      desc: "Multi-model perceptual analysis using CLIP and 2D-DCT catches duplicate works even after cropping, resizing, and filters.",
      badge: "Perceptual AI",
    },
    {
      icon: Blocks,
      title: "Blockchain Ownership",
      desc: "Immutable timestamping and registry contracts on Polygon ensure mathematical proof that cannot be retroactively forged.",
      badge: "Polygon Amoy",
    },
    {
      icon: Search,
      title: "Similarity Detection",
      desc: "Real-time FAISS vector database search compares uploaded assets against thousands of indexed works in milliseconds.",
      badge: "Vector Search",
    },
    {
      icon: Sparkles,
      title: "NFT Proof of Ownership",
      desc: "Mint standardized ERC-721 tokens linked directly to your on-chain ownership hash and IPFS CID.",
      badge: "ERC-721",
    },
    {
      icon: Globe,
      title: "IPFS Storage",
      desc: "Decentralized, content-addressed storage through Pinata ensures your digital certificates remain accessible forever.",
      badge: "Decentralized",
    },
    {
      icon: ShoppingBag,
      title: "Smart Licensing",
      desc: "Set commercial or exclusive licensing terms directly on smart contracts and withdraw earnings securely.",
      badge: "Pull-Withdrawal",
    },
    {
      icon: Shield,
      title: "Instant Verification",
      desc: "Anyone, anywhere can verify proof of creation with zero fees by uploading a file or entering a SHA-256 hash.",
      badge: "Public Audit",
    },
    {
      icon: Lock,
      title: "Enterprise Auth & SIWE",
      desc: "Sign-In with Ethereum (SIWE) MetaMask wallet authentication backed by cryptographic challenge nonces and JWT.",
      badge: "EIP-4361",
    },
  ];

  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50/70 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="badge badge-blue mb-3">Platform Features</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Designed for Creators, Developers & Studios
          </h2>
          <p className="text-base text-slate-600 mt-2">
            Everything needed to assert digital ownership, catch plagiarism, and monetize original creative works.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors flex items-center justify-center">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <span className="badge badge-gray text-[10px]">{feature.badge}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// SUPPORTED CONTENT SECTION
// ============================================
function ContentSection() {
  const TYPE_ICONS: Record<string, typeof ImageIcon> = {
    image: ImageIcon,
    code: Code2,
    document: FileText,
    audio: Music,
    video: Film,
    design: Palette,
    ai: Brain,
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="badge badge-cyan mb-3">File Compatibility</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Protect Any Digital Medium
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {CONTENT_TYPES.map((type: { id: string; label: string; icon: string; count: number }) => {
            const IconComp = TYPE_ICONS[type.id] || FileText;
            return (
              <div
                key={type.id || type.label}
                className="bg-white border border-slate-200 rounded-xl p-5 text-center shadow-xs hover:border-indigo-300 hover:shadow-sm transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                  <IconComp className="w-5 h-5" />
                </div>
                <div className="font-bold text-slate-900 text-xs sm:text-sm">{type.label}</div>
                <div className="text-[11px] text-slate-500 mt-1">{type.count.toLocaleString()} registered</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ============================================
// COMPARISON SECTION
// ============================================
function ComparisonSection() {
  const comparisons = [
    { feature: "Registration Time", old: "3 to 6 months", new: "< 30 seconds" },
    { feature: "Cost per Asset", old: "$35 to $800+", new: "< $0.01 (Gas Optimized)" },
    { feature: "Jurisdiction & Scope", old: "Country-locked paperwork", new: "Global mathematical proof" },
    { feature: "Near-Duplicate Detection", old: "Manual copyright search", new: "Neural AI & Vector Indexing" },
    { feature: "Tamper Resistance", old: "Paper & centralized databases", new: "Immutable Polygon Ledger" },
    { feature: "Verification Speed", old: "Legal inquiry (weeks)", new: "Instant online search" },
    { feature: "Commercial Licensing", old: "Complex contract negotiations", new: "Automated smart contract pull-split" },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50/70 border-t border-slate-200/80">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="badge badge-amber mb-3">Comparison</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Traditional Registration vs. ProofVault AI
          </h2>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className="p-4 text-left text-xs font-semibold text-slate-600 uppercase">Feature</th>
                <th className="p-4 text-center text-xs font-semibold text-red-600 uppercase bg-red-50/30">Traditional Copyright</th>
                <th className="p-4 text-center text-xs font-semibold text-indigo-600 uppercase bg-indigo-50/40">ProofVault AI</th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((row) => (
                <tr key={row.feature} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="p-4 text-xs font-semibold text-slate-900">{row.feature}</td>
                  <td className="p-4 text-xs text-center text-slate-500">{row.old}</td>
                  <td className="p-4 text-xs text-center">
                    <span className="badge badge-green font-medium">{row.new}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

// ============================================
// PRICING SECTION
// ============================================
function PricingSection() {
  const plans = [
    {
      name: "Starter",
      price: "$0",
      period: "/month",
      desc: "Ideal for individual creators getting started",
      features: ["5 asset registrations / mo", "Unlimited verification checks", "100 MB IPFS storage", "Basic dashboard"],
      cta: "Get Started Free",
      highlighted: false,
    },
    {
      name: "Creator",
      price: "$9",
      period: "/month",
      desc: "For active artists, designers, and developers",
      features: ["50 registrations / mo", "Unlimited verifications", "5 GB IPFS storage", "10 NFT Proof mints / mo", "Priority support"],
      cta: "Start Creator Plan",
      highlighted: false,
    },
    {
      name: "Pro Studio",
      price: "$29",
      period: "/month",
      desc: "For studios, labels, and power creators",
      features: ["Unlimited registrations", "Unlimited verifications", "50 GB IPFS storage", "Unlimited NFT Proofs", "10K API calls", "Commercial marketplace"],
      cta: "Go Pro",
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "$199",
      period: "/month",
      desc: "For digital agencies and enterprise IP portfolios",
      features: ["Everything in Pro", "500 GB dedicated IPFS", "100K API calls", "Custom smart contracts", "SLA guarantee", "Dedicated account rep"],
      cta: "Contact Sales",
      highlighted: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="badge badge-green mb-3">Transparent Pricing</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Simple, Predictable Plans
          </h2>
          <p className="text-base text-slate-600 mt-2">
            Start free. Upgrade as your digital IP portfolio grows.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all ${
                plan.highlighted
                  ? "border-2 border-indigo-600 shadow-lg relative ring-4 ring-indigo-50"
                  : "border border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-sm"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="badge badge-blue px-3 py-1 font-bold text-[11px] shadow-xs">
                    Most Popular
                  </span>
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                <div className="mt-2 mb-3">
                  <span className="text-3xl font-extrabold text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {plan.price}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{plan.period}</span>
                </div>
                <p className="text-xs text-slate-600 mb-6">{plan.desc}</p>

                <div className="border-t border-slate-100 pt-5 mb-6 space-y-2.5">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2 text-xs text-slate-600">
                      <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href="/dashboard"
                className={`w-full py-2.5 text-center text-xs font-semibold rounded-lg no-underline transition-all ${
                  plan.highlighted
                    ? "btn-primary"
                    : "btn-secondary"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// CTA BANNER
// ============================================
function CTASection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50/70 border-t border-slate-200/80">
      <div className="max-w-4xl mx-auto text-center bg-white border border-slate-200 rounded-3xl p-8 sm:p-14 shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Ready to Protect Your Digital Work?
          </h2>
          <p className="text-base text-slate-600 max-w-xl mx-auto mb-8">
            Join thousands of creators securing their digital creativity on Polygon with multi-model AI verification.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link href="/dashboard/upload" className="btn-primary text-sm px-6 py-3 rounded-xl no-underline shadow-md">
              <Upload className="w-4 h-4" />
              <span>Register Your First Asset</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/dashboard/verify" className="btn-secondary text-sm px-6 py-3 rounded-xl no-underline">
              <Search className="w-4 h-4 text-slate-500" />
              <span>Verify Ownership</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// FOOTER
// ============================================
function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-8 mb-10">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Proof<span className="text-indigo-600">Vault</span> AI
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              Decentralized digital IP protection, perceptual AI similarity detection, and ownership certificate anchoring on Polygon.
            </p>
            <div className="flex items-center gap-2 mt-4 text-[11px] text-slate-500">
              <span>Network:</span>
              <span className="badge badge-purple text-[10px]">Polygon Amoy</span>
              <span className="badge badge-cyan text-[10px]">IPFS Pinata</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Platform</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><Link href="/dashboard/upload" className="hover:text-indigo-600 no-underline">Upload Asset</Link></li>
              <li><Link href="/dashboard/verify" className="hover:text-indigo-600 no-underline">Verify Ownership</Link></li>
              <li><Link href="/dashboard/assets" className="hover:text-indigo-600 no-underline">Asset Library</Link></li>
              <li><Link href="/dashboard/marketplace" className="hover:text-indigo-600 no-underline">IP Marketplace</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Resources</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><a href="#how-it-works" className="hover:text-indigo-600 no-underline">How It Works</a></li>
              <li><a href="#technology" className="hover:text-indigo-600 no-underline">Technology</a></li>
              <li><a href="#pricing" className="hover:text-indigo-600 no-underline">Pricing</a></li>
              <li><Link href="/dashboard/analytics" className="hover:text-indigo-600 no-underline">Analytics</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Account</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><Link href="/auth/login" className="hover:text-indigo-600 no-underline">Sign In</Link></li>
              <li><Link href="/auth/signup" className="hover:text-indigo-600 no-underline">Create Account</Link></li>
              <li><Link href="/dashboard/profile" className="hover:text-indigo-600 no-underline">Profile</Link></li>
              <li><Link href="/dashboard/settings" className="hover:text-indigo-600 no-underline">Settings</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} ProofVault AI. All rights reserved.</p>
          <p className="text-[11px] text-slate-400">
            Immutable Cryptographic Proofs • Non-Custodial • Powered by Polygon & AI
          </p>
        </div>
      </div>
    </footer>
  );
}

// ============================================
// MAIN LANDING PAGE
// ============================================
export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-white text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <LightParticleField />
      <Navbar />
      <HeroSection />
      <TrustSection />
      <WorkflowSection />
      <FeaturesSection />
      <ContentSection />
      <ComparisonSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </main>
  );
}
