import { lazy, Suspense, useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  Leaf, TrendingUp, Cloud, AlertCircle, MessageSquare,
  ShieldCheck, ArrowRight, Sparkles, Globe, Zap,
  BarChart2, ChevronDown,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import Tilt from 'react-parallax-tilt';

// Lazy-load 3D components to avoid blocking initial render
const AgriGlobe = lazy(() => import('../components/three/AgriGlobe'));
const ParticleField = lazy(() => import('../components/three/ParticleField'));
const FloatingCrystal = lazy(() => import('../components/three/FloatingCrystal'));

// Animated counter hook
function useCounter(target, duration = 2000, startWhen = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!startWhen) return;
    let start = null;
    const isNumber = !isNaN(parseFloat(target));
    const numericTarget = parseFloat(target);
    const suffix = isNumber ? target.replace(String(numericTarget), '') : '';
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setCount(Math.floor(eased * numericTarget));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, startWhen]);
  return count;
}

// Animated stat card
function StatCard({ value, label, index }) {
  const [inView, setInView] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold: 0.5 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const numericPart = value.replace(/[^0-9.]/g, '');
  const prefix = value.match(/^[^0-9]*/)?.[0] || '';
  const suffix = value.match(/[^0-9]*$/)?.[0] || '';
  const count = useCounter(numericPart, 2000, inView);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: index * 0.12, ease: 'easeOut' }}
      className="relative glass-green rounded-2xl p-5 text-center overflow-hidden group hover:scale-105 transition-transform duration-300"
    >
      {/* Shimmer line */}
      <div className="data-stream-line absolute bottom-0 left-0 right-0 h-0.5" />
      <div className="text-3xl font-black text-shimmer mb-1">
        {prefix}{inView ? count : 0}{suffix}
      </div>
      <div className="text-sm text-green-200 font-medium">{label}</div>
    </motion.div>
  );
}

// Feature card with 3D tilt
function FeatureCard({ feature, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: 'easeOut' }}
    >
      <Tilt
        tiltMaxAngleX={12}
        tiltMaxAngleY={12}
        scale={1.03}
        transitionSpeed={600}
        glareEnable
        glareMaxOpacity={0.08}
        glareColor="#22c55e"
        glarePosition="all"
        className="h-full"
      >
        <div className="relative h-full glass rounded-2xl p-6 border border-white/10 hover:border-green-400/40 transition-all duration-300 group overflow-hidden">
          {/* Background gradient glow */}
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${feature.bgGlow} rounded-2xl`} />

          <div className={`relative w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <feature.icon className="w-7 h-7 text-white" />
          </div>
          <h3 className="relative text-xl font-bold text-white mb-3 group-hover:text-green-300 transition-colors duration-300">
            {feature.title}
          </h3>
          <p className="relative text-white/60 leading-relaxed text-sm">
            {feature.description}
          </p>

          {/* Bottom accent line */}
          <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
        </div>
      </Tilt>
    </motion.div>
  );
}

// Scroll indicator
function ScrollIndicator() {
  return (
    <motion.div
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-green-400/60"
      animate={{ y: [0, 8, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <span className="text-xs font-medium tracking-widest uppercase">Scroll</span>
      <ChevronDown className="w-5 h-5" />
    </motion.div>
  );
}

// Floating badge (replaces old floating cards)
function FloatingBadge({ children, className = '', animate }) {
  return (
    <motion.div
      className={`absolute glass-green rounded-2xl px-4 py-3 shadow-2xl border border-green-400/30 ${className}`}
      animate={animate}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}

// Step card for "How It Works"
function StepCard({ step, title, description, icon: Icon, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: index * 0.15, ease: 'easeOut' }}
      className="relative group"
    >
      {/* Connector line (not last) */}
      {index < 2 && (
        <div className="hidden md:block absolute top-10 left-full w-full h-px bg-gradient-to-r from-green-500/50 to-transparent -translate-y-1/2 z-0" />
      )}

      <div className="relative glass-green rounded-2xl p-8 border border-green-500/20 hover:border-green-400/50 transition-all duration-400 hover:shadow-lg hover:shadow-green-900/30 text-center overflow-hidden">
        {/* Step number ring */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-500 to-green-700 animate-glow-pulse" />
          <div className="absolute inset-1 rounded-full bg-gray-900 flex items-center justify-center">
            <span className="text-2xl font-black text-shimmer">{step}</span>
          </div>
        </div>

        <Icon className="w-6 h-6 text-green-400 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-white/60 text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

export const LandingPage = () => {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.4], [0, -80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  const features = [
    {
      icon: Leaf,
      title: 'Crop Management',
      description: 'Track and manage your crops with ease. Monitor growth stages, harvest schedules, and yield predictions in real-time.',
      color: 'from-emerald-500 to-green-600',
      bgGlow: 'from-emerald-500/10 to-transparent',
    },
    {
      icon: TrendingUp,
      title: 'Price Analytics',
      description: 'Real-time market prices and AI-powered trend analysis to help you make informed selling decisions.',
      color: 'from-blue-500 to-cyan-600',
      bgGlow: 'from-blue-500/10 to-transparent',
    },
    {
      icon: Cloud,
      title: 'Weather Forecasts',
      description: 'Hyper-local weather predictions tailored specifically for agricultural planning and crop protection.',
      color: 'from-sky-500 to-blue-600',
      bgGlow: 'from-sky-500/10 to-transparent',
    },
    {
      icon: AlertCircle,
      title: 'Disease Detection',
      description: 'AI-powered plant disease detection with 98% accuracy. Upload a photo and get instant diagnosis.',
      color: 'from-rose-500 to-red-600',
      bgGlow: 'from-rose-500/10 to-transparent',
    },
    {
      icon: MessageSquare,
      title: 'AI Assistant',
      description: 'Get instant expert answers to any farming question from our intelligent agricultural chatbot.',
      color: 'from-violet-500 to-purple-600',
      bgGlow: 'from-violet-500/10 to-transparent',
    },
    {
      icon: ShieldCheck,
      title: 'Secure Trading',
      description: 'Safe, transparent, and verified marketplace connecting farmers directly with trusted buyers.',
      color: 'from-amber-500 to-orange-600',
      bgGlow: 'from-amber-500/10 to-transparent',
    },
  ];

  const stats = [
    { value: '10K+', label: 'Active Farmers' },
    { value: '5K+',  label: 'Verified Buyers' },
    { value: '50K+', label: 'Crops Traded' },
    { value: '₹100M+', label: 'Revenue Generated' },
  ];

  const steps = [
    { step: '01', title: 'Create Account', description: 'Sign up as a farmer or buyer in under 2 minutes with full verification.', icon: Leaf },
    { step: '02', title: 'List Your Crops', description: 'Upload crops with photos, pricing, and availability. Reach thousands of buyers instantly.', icon: Globe },
    { step: '03', title: 'Start Trading', description: 'Connect with buyers, track shipments, receive payments securely and grow.', icon: BarChart2 },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden">

      {/* ── Navigation ──────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="fixed top-0 w-full glass-dark z-50 border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 rounded-xl animate-glow-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
              </div>
              <span className="text-xl font-black text-shimmer">AgriSmart</span>
            </div>

            {/* Nav links */}
            <div className="hidden md:flex items-center gap-6 text-sm text-white/60">
              {['Features', 'How It Works', 'Pricing'].map((item) => (
                <button key={item} className="hover:text-green-400 transition-colors duration-200">
                  {item}
                </button>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 border-0">
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white border-0 shadow-lg shadow-green-900/40 font-semibold">
                  Get Started <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* ── Hero Section ────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden hero-gradient">
        {/* Particle Field Background */}
        <div className="particle-overlay">
          <Suspense fallback={null}>
            <ParticleField style={{ width: '100%', height: '100vh' }} />
          </Suspense>
        </div>

        {/* Radial glow overlays */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-lime-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left — Text content */}
            <motion.div style={{ y: heroY, opacity: heroOpacity }}>
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 glass-green rounded-full px-4 py-2 mb-8 border border-green-500/30"
              >
                <Sparkles className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-300 font-medium">AI-Powered Agriculture Platform</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-5xl lg:text-7xl font-black leading-tight mb-6"
              >
                Smart{' '}
                <span className="text-shimmer">Agriculture</span>
                <br />
                <span className="text-white">Powered by</span>
                <br />
                <span className="text-shimmer">AI</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="text-lg text-white/60 mb-10 leading-relaxed max-w-lg"
              >
                Revolutionize your farming with AI-driven insights, real-time market data,
                disease detection, and seamless crop management. Join thousands of farmers
                growing smarter every day.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-wrap gap-4 mb-14"
              >
                <Link to="/signup">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white border-0 shadow-2xl shadow-green-900/50 font-bold text-base px-8 py-6 rounded-2xl neon-green"
                  >
                    Start Free Trial <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 font-semibold text-base px-8 py-6 rounded-2xl backdrop-blur-sm"
                >
                  <Zap className="w-5 h-5 mr-2 text-green-400" />
                  Watch Demo
                </Button>
              </motion.div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {stats.map((stat, index) => (
                  <StatCard key={stat.label} {...stat} index={index} />
                ))}
              </div>
            </motion.div>

            {/* Right — 3D Globe */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 60 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: 'easeOut' }}
              className="relative globe-container hidden lg:block"
            >
              {/* Main globe */}
              <div className="relative w-full h-[540px] rounded-3xl overflow-hidden">
                <Suspense fallback={
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="three-loader-orb" style={{ width: 80, height: 80 }} />
                  </div>
                }>
                  <AgriGlobe style={{ width: '100%', height: '100%' }} />
                </Suspense>

                {/* Gradient edge fade */}
                <div className="absolute inset-0 bg-gradient-to-r from-gray-950/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-950/60 pointer-events-none" />
              </div>

              {/* Floating badge: Price Alert */}
              <FloatingBadge
                className="-left-6 top-24 min-w-[160px]"
                animate={{ y: [0, -10, 0] }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <div className="text-xs text-green-300/70">Price Alert</div>
                    <div className="font-bold text-green-400 text-sm">+15% Wheat</div>
                  </div>
                </div>
              </FloatingBadge>

              {/* Floating badge: Weather */}
              <FloatingBadge
                className="-right-6 bottom-24 min-w-[150px]"
                animate={{ y: [0, 10, 0] }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-sky-500/20 rounded-xl flex items-center justify-center">
                    <Cloud className="w-5 h-5 text-sky-400" />
                  </div>
                  <div>
                    <div className="text-xs text-white/50">Weather</div>
                    <div className="font-bold text-white text-sm">28°C Sunny</div>
                  </div>
                </div>
              </FloatingBadge>

              {/* Floating badge: AI Status */}
              <FloatingBadge
                className="right-12 top-12 min-w-[140px]"
                animate={{ y: [0, -6, 0] }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs text-white/70 font-medium">AI Active</span>
                </div>
              </FloatingBadge>
            </motion.div>
          </div>
        </div>

        <ScrollIndicator />
      </section>

      {/* ── Features Section ─────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-transparent to-green-500/40" />

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 glass-green rounded-full px-4 py-2 mb-6 border border-green-500/30"
            >
              <Sparkles className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-300">Powerful Features</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl lg:text-5xl font-black text-white mb-5"
            >
              Everything You Need to{' '}
              <span className="text-shimmer">Grow</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl text-white/50 max-w-2xl mx-auto"
            >
              A complete ecosystem for modern agriculture — from seed to sale.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={feature.title} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Dark gradient + crystal glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-green-950/20 to-gray-950" />

        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left — 3D Crystal */}
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative h-[400px] lg:h-[500px] order-2 lg:order-1"
            >
              <div className="absolute inset-0 rounded-3xl overflow-hidden widget-3d">
                <Suspense fallback={<div className="three-loader"><div className="three-loader-orb" /></div>}>
                  <FloatingCrystal style={{ width: '100%', height: '100%' }} />
                </Suspense>
              </div>
              {/* Decorative rings */}
              <div className="absolute inset-0 rounded-3xl border border-green-500/20 animate-glow-pulse pointer-events-none" />
            </motion.div>

            {/* Right — Steps */}
            <div className="order-1 lg:order-2 space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 glass-green rounded-full px-4 py-2 mb-4 border border-green-500/30"
              >
                <Zap className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-300">Simple Process</span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-4xl lg:text-5xl font-black text-white mb-4"
              >
                How{' '}
                <span className="text-shimmer">AgriSmart</span>
                <br />Works
              </motion.h2>

              {steps.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 + 0.2 }}
                  className="flex gap-5 glass-green rounded-2xl p-5 border border-green-500/20 hover:border-green-400/40 transition-all duration-300 group"
                >
                  <div className="relative flex-shrink-0 w-14 h-14">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl group-hover:animate-glow-pulse" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-black text-white">{step.step}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-green-300 transition-colors">{step.title}</h3>
                    <p className="text-white/55 text-sm leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Section ──────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-950 via-gray-950 to-green-950" />
        {/* Decorative glow blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-lime-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="glass-dark rounded-3xl p-12 border border-green-500/20 neon-green"
          >
            <div className="inline-flex items-center gap-2 glass-green rounded-full px-4 py-2 mb-8 border border-green-500/30">
              <Sparkles className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-300">Join 10,000+ Farmers</span>
            </div>

            <h2 className="text-4xl lg:text-6xl font-black text-white mb-6">
              Ready to Transform
              <br />
              <span className="text-shimmer">Your Farming?</span>
            </h2>

            <p className="text-xl text-white/50 mb-10 max-w-2xl mx-auto">
              Join thousands of farmers already using AgriSmart to grow smarter,
              detect diseases early, and sell at the best prices.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/signup">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white border-0 shadow-2xl shadow-green-900/50 font-bold text-lg px-10 py-7 rounded-2xl"
                >
                  Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 font-semibold text-lg px-10 py-7 rounded-2xl"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="bg-gray-950 border-t border-white/5 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="relative w-9 h-9">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-700 rounded-xl" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Leaf className="w-5 h-5 text-white" />
                  </div>
                </div>
                <span className="text-lg font-black text-shimmer">AgriSmart</span>
              </div>
              <p className="text-white/40 text-sm leading-relaxed">
                Empowering farmers with AI technology for a sustainable and profitable future.
              </p>
            </div>

            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Security', 'Roadmap'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Cookie Policy', 'Licenses'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-bold text-white mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <button className="text-white/40 hover:text-green-400 transition-colors text-sm">
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/30 text-sm">© 2025 AgriSmart. All rights reserved.</p>
            <div className="flex items-center gap-2 text-white/30 text-sm">
              <span>Built with</span>
              <Leaf className="w-4 h-4 text-green-500" />
              <span>for farmers everywhere</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
