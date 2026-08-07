"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  Box,
  Sparkles,
  TrendingUp,
  Users,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { MOCK_STATS, CONTENT_TYPES } from "./lib/store";

// ============================================
// PARTICLE BACKGROUND
// ============================================
function ParticleField() {
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

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
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
        ctx.fillStyle = `rgba(59, 130, 246, ${p.opacity})`;
        ctx.fill();

        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[j].x - p.x;
          const dy = particles[j].y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.06 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
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
          const duration = 2000;
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
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
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
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[rgba(6,6,14,0.85)] backdrop-blur-xl border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white font-[family-name:var(--font-sans)]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Proof<span className="gradient-text">Vault</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {["Features", "How It Works", "Pricing", "Docs"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-sm text-[var(--text-secondary)] hover:text-white transition-colors no-underline"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-xs text-slate-300 hover:text-white font-medium px-3 py-1.5 rounded-lg hover:bg-white/5 transition no-underline">
            Sign In
          </Link>
          <Link href="/auth/signup" className="text-xs text-cyan-400 border border-cyan-500/30 hover:border-cyan-500 hover:bg-cyan-500/10 font-medium px-3 py-1.5 rounded-lg transition no-underline">
            Sign Up
          </Link>
          <Link href="/dashboard" className="btn-primary text-xs no-underline">
            <Wallet className="w-3.5 h-3.5" />
            Launch App
          </Link>
          <button
            className="md:hidden btn-icon"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span className="text-lg">{mobileOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/5 bg-[rgba(6,6,14,0.95)] backdrop-blur-xl"
          >
            <div className="px-6 py-4 flex flex-col gap-3">
              {["Features", "How It Works", "Pricing", "Docs"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                  className="text-sm text-[var(--text-secondary)] hover:text-white py-2 no-underline"
                  onClick={() => setMobileOpen(false)}
                >
                  {item}
                </a>
              ))}
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
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 0.3], [0, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.3]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Gradient Orbs */}
      <div className="hero-gradient-orb w-[600px] h-[600px] bg-blue-600 top-[-200px] left-[-200px]" style={{ position: "absolute" }} />
      <div className="hero-gradient-orb w-[500px] h-[500px] bg-purple-600 bottom-[-150px] right-[-150px]" style={{ position: "absolute" }} />
      <div className="hero-gradient-orb w-[300px] h-[300px] bg-cyan-500 top-[30%] right-[20%]" style={{ position: "absolute" }} />

      {/* Grid Pattern */}
      <div className="absolute inset-0 grid-pattern opacity-50" />

      <motion.div style={{ y, opacity }} className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(59,130,246,0.1)] border border-[rgba(59,130,246,0.2)] mb-8"
        >
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-blue-400 font-medium">Powered by AI & Polygon Blockchain</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Protecting Digital
          <br />
          <span className="gradient-text">Creativity</span> Through
          <br />
          <span className="gradient-text-accent">AI & Blockchain</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Prove ownership of any digital asset in{" "}
          <span className="text-white font-semibold">under 30 seconds</span> for{" "}
          <span className="text-white font-semibold">less than $0.01</span>.
          AI fingerprinting meets immutable blockchain proof.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link href="/dashboard/upload" className="btn-primary text-base px-8 py-4 no-underline">
            <Upload className="w-5 h-5" />
            Register Your Work
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/dashboard/verify" className="btn-secondary text-base px-8 py-4 no-underline">
            <Search className="w-5 h-5" />
            Verify Ownership
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto"
        >
          {[
            { label: "Assets Protected", value: MOCK_STATS.assetsProtected, suffix: "+" },
            { label: "Verifications", value: MOCK_STATS.totalVerifications, suffix: "+" },
            { label: "Creators", value: MOCK_STATS.totalCreators, suffix: "+" },
            { label: "Gas Saved", value: 99, suffix: ".9%" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold gradient-text mb-1">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-xs sm:text-sm text-[var(--text-muted)]">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1.5"
        >
          <div className="w-1.5 h-2.5 rounded-full bg-white/40" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ============================================
// WORKFLOW SECTION (How It Works)
// ============================================
function WorkflowSection() {
  const steps = [
    {
      icon: Upload,
      title: "Upload Your Content",
      desc: "Drag & drop any digital file — images, videos, code, music, documents, designs, or AI-generated content.",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Brain,
      title: "AI Analysis",
      desc: "Our AI engine generates multi-layer fingerprints: SHA-256 hash, perceptual hash, and semantic embeddings.",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Fingerprint,
      title: "Fingerprint Generation",
      desc: "6 independent verification channels created — making the proof resilient to crops, compression, and modifications.",
      color: "from-cyan-500 to-cyan-600",
    },
    {
      icon: Blocks,
      title: "Blockchain Anchoring",
      desc: "Hash anchored on Polygon with commit-reveal protection. Merkle batching reduces gas cost by 99.9%.",
      color: "from-green-500 to-green-600",
    },
    {
      icon: FileCheck,
      title: "Certificate & NFT",
      desc: "Receive an immutable ownership certificate. Optionally mint a composable Proof-of-Ownership NFT.",
      color: "from-amber-500 to-amber-600",
    },
  ];

  return (
    <section id="how-it-works" className="relative py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="badge badge-blue mb-4 inline-flex">How It Works</span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            From Upload to <span className="gradient-text">Immutable Proof</span>
          </h2>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
            Five steps to permanent, AI-verified ownership — in under 30 seconds.
          </p>
        </motion.div>

        <div className="relative max-w-5xl mx-auto">
          {/* Connecting vertical line */}
          <div className="absolute left-7 lg:left-1/2 top-8 bottom-8 w-0.5 -translate-x-1/2 bg-gradient-to-b from-blue-500/30 via-purple-500/30 to-amber-500/30" />

          <div className="space-y-8 lg:space-y-12 relative z-10">
            {steps.map((step, i) => {
              const isEven = i % 2 === 0;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col lg:flex-row items-center"
                >
                  {/* Left Column / Card position for even steps */}
                  <div className={`w-full lg:w-1/2 pl-16 lg:pl-0 ${isEven ? "lg:pr-12 lg:text-right lg:order-0" : "lg:pl-12 lg:order-2"}`}>
                    <div className="glass-card p-6 text-left">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="badge badge-blue text-[10px]">Step {i + 1}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{step.desc}</p>
                    </div>
                  </div>

                  {/* Center Icon */}
                  <div className="absolute left-0 lg:static lg:w-auto flex items-center justify-center shrink-0 lg:order-1">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg border-4 border-[var(--bg-primary)]`}>
                      <step.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Spacer for alternating layout */}
                  <div className={`hidden lg:block lg:w-1/2 ${isEven ? "lg:order-2" : "lg:order-0"}`} />
                </motion.div>
              );
            })}
          </div>
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
      title: "AI-Powered Detection",
      desc: "CLIP, CodeBERT, Whisper — multi-model AI catches exact copies AND near-duplicates, even after modifications.",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Blocks,
      title: "Blockchain Anchoring",
      desc: "Polygon PoS for speed ($0.001/tx), Ethereum L1 for finality. Merkle batching for 99.9% gas reduction.",
      gradient: "from-purple-500 to-blue-500",
    },
    {
      icon: Lock,
      title: "ZK-Proof Privacy",
      desc: "Prove ownership without revealing content. Zero-knowledge proofs keep your creative work private.",
      gradient: "from-pink-500 to-purple-500",
    },
    {
      icon: Zap,
      title: "< 30 Second Proof",
      desc: "Upload to blockchain confirmation in under 30 seconds. No forms, no waiting, no bureaucracy.",
      gradient: "from-amber-500 to-orange-500",
    },
    {
      icon: Globe,
      title: "Global Verification",
      desc: "Anyone, anywhere can verify ownership instantly. No borders, no intermediaries, no fees.",
      gradient: "from-green-500 to-cyan-500",
    },
    {
      icon: Shield,
      title: "Tamper-Proof",
      desc: "Commit-reveal anti-front-running. Multi-hash verification. Immutable blockchain records.",
      gradient: "from-red-500 to-pink-500",
    },
  ];

  return (
    <section id="features" className="relative py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="badge badge-purple mb-4 inline-flex">Features</span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Built for the <span className="gradient-text-accent">Creator Economy</span>
          </h2>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
            Every feature designed to protect creators and verify authenticity at scale.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass-card p-7 group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{feature.desc}</p>
            </motion.div>
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
  return (
    <section className="relative py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="badge badge-cyan mb-4 inline-flex">Supported Content</span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Protect <span className="gradient-text-cyan">Any Digital Asset</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {CONTENT_TYPES.map((type: { id: string; label: string; icon: string; count: number }, i: number) => (
            <motion.div
              key={type.id || i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.05, y: -4 }}
              className="glass-card p-6 text-center cursor-default"
            >
              <div className="text-3xl mb-3">{type.icon}</div>
              <div className="font-semibold text-white text-sm mb-1">{type.label}</div>
              <div className="text-xs text-[var(--text-muted)]">{type.count.toLocaleString()} registered</div>
            </motion.div>
          ))}
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
    { feature: "Registration Time", old: "3-6 months", new: "< 30 seconds" },
    { feature: "Cost per Filing", old: "$35 - $800+", new: "< $0.01" },
    { feature: "Geographic Scope", old: "Country-locked", new: "Global" },
    { feature: "Near-Duplicate Detection", old: "None", new: "AI-powered" },
    { feature: "Proof Tampering", old: "Possible", new: "Impossible" },
    { feature: "Privacy", old: "Public filing", new: "ZK-proof private" },
    { feature: "Automation", old: "Manual forms", new: "Fully automated" },
    { feature: "Verification", old: "Legal process", new: "Instant online" },
  ];

  return (
    <section className="relative py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="badge badge-amber mb-4 inline-flex">Why ProofVault</span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Traditional vs <span className="gradient-text">ProofVault AI</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card overflow-hidden"
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left p-4 text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">Feature</th>
                <th className="text-center p-4 text-sm font-semibold text-red-400 uppercase tracking-wider">Traditional</th>
                <th className="text-center p-4 text-sm font-semibold text-green-400 uppercase tracking-wider">ProofVault AI</th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((row, i) => (
                <tr key={row.feature} className="border-b border-white/3 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 text-sm font-medium text-white">{row.feature}</td>
                  <td className="p-4 text-sm text-center text-[var(--text-muted)]">{row.old}</td>
                  <td className="p-4 text-sm text-center">
                    <span className="badge badge-green">{row.new}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
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
      name: "Free",
      price: "$0",
      period: "/month",
      desc: "Perfect for individuals getting started",
      features: ["5 registrations/month", "10 verifications/month", "100 MB storage", "Basic dashboard"],
      cta: "Get Started",
      highlighted: false,
    },
    {
      name: "Creator",
      price: "$9",
      period: "/month",
      desc: "For active creators protecting their work",
      features: ["50 registrations/month", "100 verifications/month", "5 GB storage", "10 NFT mints/month", "1K API calls", "Priority support"],
      cta: "Start Creating",
      highlighted: false,
    },
    {
      name: "Pro",
      price: "$29",
      period: "/month",
      desc: "For professionals and studios",
      features: ["Unlimited registrations", "Unlimited verifications", "50 GB storage", "Unlimited NFTs", "10K API calls", "Advanced analytics", "Bulk upload", "Custom branding"],
      cta: "Go Pro",
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "$199",
      period: "/month",
      desc: "For organizations at scale",
      features: ["Everything in Pro", "500 GB storage", "100K API calls", "Team management", "Dedicated support", "Custom contracts", "SLA guarantee", "White-label option"],
      cta: "Contact Sales",
      highlighted: false,
    },
  ];

  return (
    <section id="pricing" className="relative py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="badge badge-green mb-4 inline-flex">Pricing</span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Simple, <span className="gradient-text">Transparent</span> Pricing
          </h2>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
            Start free. Scale as you grow. No hidden fees.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`glass-card p-7 flex flex-col ${
                plan.highlighted
                  ? "border-blue-500/40 shadow-[0_0_40px_rgba(59,130,246,0.15)] relative"
                  : ""
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="badge badge-blue px-4 py-1">Most Popular</span>
                </div>
              )}
              <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
              <div className="mb-2">
                <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                <span className="text-sm text-[var(--text-muted)]">{plan.period}</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] mb-6">{plan.desc}</p>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                    <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <button className={plan.highlighted ? "btn-primary w-full" : "btn-secondary w-full"}>
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// TECH STACK SECTION
// ============================================
function TechStackSection() {
  const stack = [
    { category: "Frontend", items: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Framer Motion"] },
    { category: "Backend", items: ["FastAPI", "Python", "Celery", "WebSocket"] },
    { category: "Blockchain", items: ["Polygon PoS", "Solidity", "Hardhat", "ethers.js"] },
    { category: "AI/ML", items: ["CLIP", "CodeBERT", "Whisper", "FAISS", "Sentence-BERT"] },
    { category: "Storage", items: ["IPFS", "Filecoin", "MongoDB", "Redis", "Milvus"] },
    { category: "Security", items: ["ZK-Proofs", "AES-256", "SIWE", "Commit-Reveal"] },
  ];

  return (
    <section className="relative py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="badge badge-purple mb-4 inline-flex">Technology</span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Enterprise-Grade <span className="gradient-text-accent">Tech Stack</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stack.map((group, i) => (
            <motion.div
              key={group.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass-card p-6"
            >
              <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4">{group.category}</h3>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span key={item} className="px-3 py-1.5 bg-white/[0.04] border border-white/[0.06] rounded-lg text-sm text-[var(--text-secondary)]">
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// CTA SECTION
// ============================================
function CTASection() {
  return (
    <section className="relative py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-12 sm:p-16 text-center relative overflow-hidden"
        >
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10" />

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Ready to Protect Your{" "}
              <span className="gradient-text">Creative Work?</span>
            </h2>
            <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-xl mx-auto">
              Join thousands of creators who trust ProofVault AI to secure their digital assets on the blockchain.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard" className="btn-primary text-base px-8 py-4 no-underline">
                <Wallet className="w-5 h-5" />
                Launch App
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#how-it-works" className="btn-secondary text-base px-8 py-4 no-underline">
                Learn More
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================
// FOOTER
// ============================================
function Footer() {
  const links = {
    Product: ["Features", "Pricing", "API Docs", "Changelog"],
    Resources: ["Documentation", "Blog", "Tutorials", "FAQ"],
    Company: ["About", "Careers", "Contact", "Press"],
    Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
  };

  return (
    <footer className="border-t border-white/5 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Proof<span className="gradient-text">Vault</span>
              </span>
            </div>
            <p className="text-sm text-[var(--text-secondary)] max-w-xs leading-relaxed">
              Protecting digital creativity through AI & blockchain. Immutable ownership proof for the creator economy.
            </p>
          </div>
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-white mb-4">{category}</h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-[var(--text-muted)] hover:text-white transition-colors no-underline">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[var(--text-muted)]">
            © {new Date().getFullYear()} ProofVault AI. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-[var(--text-muted)]">
            <span className="text-xs">Built on</span>
            <span className="badge badge-purple text-xs">Polygon</span>
            <span className="badge badge-blue text-xs">IPFS</span>
          </div>
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
    <main className="relative min-h-screen bg-[var(--bg-primary)]">
      <ParticleField />
      <Navbar />
      <HeroSection />
      <WorkflowSection />
      <FeaturesSection />
      <ContentSection />
      <ComparisonSection />
      <PricingSection />
      <TechStackSection />
      <CTASection />
      <Footer />
    </main>
  );
}
