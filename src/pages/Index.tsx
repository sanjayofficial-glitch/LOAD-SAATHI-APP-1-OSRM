import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Truck, ArrowRight, Route, Handshake, EyeOff, CircuitBoard, Search, Map, Package, ChevronRight, LayoutDashboard, Brain, MessageSquare, Shield, Star, Activity, UserCheck, Menu, X, MapPin, TrendingUp, DollarSign, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import OfflineBanner from '@/components/OfflineBanner';
import ThemeToggle from '@/components/ThemeToggle';
import IndexSkeleton from '@/components/IndexSkeleton';
import { useTheme } from '@/theme/theme';
import LogoMark from '@/components/LogoMark';
import SeoMeta from '@/components/SeoMeta';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { socialLinks } from '@/data/socialLinks';

const tabs = [
  { id: 'shipper', label: 'Shipper OS' },
  { id: 'transporter', label: 'Transporter OS' },
  { id: 'command', label: 'AI Command Center' },
] as const;

const Index = () => {
  const [ready, setReady] = useState(false);
  const [activeTab, setActiveTab] = useState('shipper');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };
  const globeRef = useRef<HTMLDivElement>(null);
  const globeInited = useRef(false);
  const { isDark } = useTheme();

  const globeMatRef = useRef<any>(null);
  const innerMatRef = useRef<any>(null);
  const pointsMatRef = useRef<any>(null);
  const arcMatsRef = useRef<any[]>([]);
  const ambientRef = useRef<any>(null);
  const globeObserverRef = useRef<IntersectionObserver | null>(null);
  const cleanupFnsRef = useRef<(() => void)[]>([]);

  useEffect(() => {
    setReady(true);
  }, []);

  // Fade-in sections on scroll
  useEffect(() => {
    if (!ready) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll('.fade-section').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    const container = globeRef.current;
    if (!container || globeInited.current) return;
    globeInited.current = true;

    /* eslint-disable @typescript-eslint/no-explicit-any */
    let scene: any, camera: any, renderer: any, group: any;
    let animationId: number;
    let mouseX = 0, mouseY = 0;
    const geometries: any[] = [];
    const meshes: any[] = [];

    const init = async () => {
      try {
        const THREE = await new Promise<any>((resolve) => {
          if ((window as any).THREE) {
            resolve((window as any).THREE);
            return;
          }
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
          script.integrity = 'sha256-BZoSyD7WzSm13Yl6VvN0VYmRv2DqS0X3aJl8Q3K0t3Y=';
          script.crossOrigin = 'anonymous';
          script.onload = () => resolve((window as any).THREE);
          script.onerror = () => {
            console.warn('[LoadSaathi] Three.js CDN unavailable — globe disabled');
            resolve(null);
          };
          document.head.appendChild(script);
        });

        if (!THREE) return;
        // Component may have unmounted while the CDN script was loading
        if (!container.isConnected) return;

        const width = container.clientWidth || 800;
        const height = container.clientHeight || 500;

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        container.appendChild(renderer.domElement);

        group = new THREE.Group();
        scene.add(group);

        const isLightMode = !isDark;

        const globeGeo = new THREE.SphereGeometry(2, 64, 64);
        const globeMat = new THREE.MeshPhongMaterial({
          color: isLightMode ? 0x4B8FD4 : 0x2E6FB5,
          wireframe: true,
          transparent: true,
          opacity: isLightMode ? 0.25 : 0.15,
        });
        globeMatRef.current = globeMat;
        const globeMesh = new THREE.Mesh(globeGeo, globeMat);
        geometries.push(globeGeo);
        meshes.push(globeMesh);
        group.add(globeMesh);

        const innerGeo = new THREE.SphereGeometry(1.95, 64, 64);
        const innerMat = new THREE.MeshPhongMaterial({
          color: isLightMode ? 0xCCE4F7 : 0x0D2340,
          transparent: true,
          opacity: isLightMode ? 0.25 : 0.4,
        });
        innerMatRef.current = innerMat;
        const innerMesh = new THREE.Mesh(innerGeo, innerMat);
        geometries.push(innerGeo);
        meshes.push(innerMesh);
        group.add(innerMesh);

        const pointsCount = 500;
        const positions = new Float32Array(pointsCount * 3);
        for (let i = 0; i < pointsCount; i++) {
          const phi = Math.acos(-1 + (2 * i) / pointsCount);
          const theta = Math.sqrt(pointsCount * Math.PI) * phi;
          positions[i * 3] = 2 * Math.cos(theta) * Math.sin(phi);
          positions[i * 3 + 1] = 2 * Math.sin(theta) * Math.sin(phi);
          positions[i * 3 + 2] = 2 * Math.cos(phi);
        }
        const pointsGeo = new THREE.BufferGeometry();
        pointsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const pointsMat = new THREE.PointsMaterial({
          color: isLightMode ? 0xE8620C : 0xFF6B00,
          size: 0.03,
          transparent: true,
          opacity: isLightMode ? 0.5 : 0.8
        });
        pointsMatRef.current = pointsMat;
        const pointsMesh = new THREE.Points(pointsGeo, pointsMat);
        geometries.push(pointsGeo);
        meshes.push(pointsMesh);
        group.add(pointsMesh);

        for (let i = 0; i < 15; i++) {
          const si = Math.floor(Math.random() * pointsCount) * 3;
          const ei = Math.floor(Math.random() * pointsCount) * 3;
          const start = new THREE.Vector3(positions[si], positions[si + 1], positions[si + 2]);
          const end = new THREE.Vector3(positions[ei], positions[ei + 1], positions[ei + 2]);
          const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5).setLength(2.5);
          const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
          const arcGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(50));
          const arcMat = new THREE.LineBasicMaterial({
            color: isLightMode ? 0xE8620C : 0xFF6B00,
            transparent: true,
            opacity: isLightMode ? 0.2 : 0.3
          });
          arcMatsRef.current.push(arcMat);
          geometries.push(arcGeo);
          group.add(new THREE.Line(arcGeo, arcMat));
        }

        const light1 = new THREE.PointLight(0xffffff, 1);
        light1.position.set(5, 5, 5);
        scene.add(light1);
        const ambient = new THREE.AmbientLight(isLightMode ? 0x888888 : 0x404040);
        ambientRef.current = ambient;
        scene.add(ambient);

        camera.position.z = 6;

        const handleMouseMove = (e: MouseEvent) => {
          mouseX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
          mouseY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
        };
        window.addEventListener('mousemove', handleMouseMove);
        cleanupFnsRef.current.push(() => window.removeEventListener('mousemove', handleMouseMove));

        let isGlobeVisible = true;
        globeObserverRef.current = new IntersectionObserver(
          (entries) => {
            const entry = entries[0];
            if (entry) {
              isGlobeVisible = entry.isIntersecting;
            }
          },
          { threshold: 0.1 }
        );
        if (container) globeObserverRef.current.observe(container);

        const animate = () => {
          animationId = requestAnimationFrame(animate);
          if (isGlobeVisible) {
            group.rotation.y += 0.003;
            group.rotation.y += mouseX * 0.008;
            group.rotation.x += mouseY * 0.005;
            renderer.render(scene, camera);
          }
        };
        animate();

        const resize = () => {
          const w = container.clientWidth;
          const h = container.clientHeight;
          if (w > 0 && h > 0) {
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
          }
        };
        window.addEventListener('resize', resize);
        cleanupFnsRef.current.push(() => window.removeEventListener('resize', resize));
      } catch (e) {
        console.error('Globe init failed:', e);
      }
    };

    // Defer the heavy Three.js CDN download + WebGL init until the browser is
    // idle so it never competes with first paint / LCP on the landing page.
    const scheduleGlobeInit = () => {
      if ('requestIdleCallback' in window) {
        return window.requestIdleCallback(() => { init(); }, { timeout: 2500 });
      }
      return setTimeout(() => { init(); }, 500);
    };
    const globeIdleHandle = scheduleGlobeInit();

    return () => {
      if (typeof globeIdleHandle === 'number') {
        if ('cancelIdleCallback' in window) {
          window.cancelIdleCallback(globeIdleHandle);
        } else {
          clearTimeout(globeIdleHandle);
        }
      }
      if (animationId) cancelAnimationFrame(animationId);
      if (globeObserverRef.current) globeObserverRef.current.disconnect();
      cleanupFnsRef.current.forEach(fn => fn());
      cleanupFnsRef.current = [];
      geometries.forEach((g) => { try { g.dispose(); } catch {} });
      if (scene) {
        scene.traverse((child: any) => {
          if (child.isMesh) {
            child.geometry?.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach((m: any) => m.dispose());
            } else {
              child.material?.dispose();
            }
          }
        });
      }
      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      }
    };
    /* eslint-enable @typescript-eslint/no-explicit-any */
  }, [ready]);

  useEffect(() => {
    if (!globeMatRef.current || !innerMatRef.current || !pointsMatRef.current || !ambientRef.current) return;
    const lightMode = !isDark;
    globeMatRef.current.color.setHex(lightMode ? 0x4B8FD4 : 0x2E6FB5);
    globeMatRef.current.opacity = lightMode ? 0.25 : 0.15;
    innerMatRef.current.color.setHex(lightMode ? 0xCCE4F7 : 0x0D2340);
    innerMatRef.current.opacity = lightMode ? 0.25 : 0.4;
    pointsMatRef.current.color.setHex(lightMode ? 0xE8620C : 0xFF6B00);
    pointsMatRef.current.opacity = lightMode ? 0.5 : 0.8;
    arcMatsRef.current.forEach((mat: any) => {
      mat.color.setHex(lightMode ? 0xE8620C : 0xFF6B00);
      mat.opacity = lightMode ? 0.2 : 0.3;
    });
    ambientRef.current.color.setHex(lightMode ? 0x888888 : 0x404040);
  }, [isDark]);

  if (!ready) {
    return <IndexSkeleton />;
  }

  return (
    <>
    <SeoMeta
      title="Shared Freight Marketplace | PTL/LTL East India"
      description="LoadSaathi connects shippers and truckers for PTL and LTL shared freight across East India. Save up to 40% on freight costs on the Rourkela–Ranchi–Burdwan corridor. Book part loads online."
      canonical="/"
      keywords="PTL freight Rourkela, LTL transport East India, shared truck Ranchi Burdwan, part load Jharkhand Odisha, freight marketplace India, truck booking Rourkela"
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is LoadSaathi and how does it work?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "LoadSaathi is an AI-powered shared freight marketplace connecting shippers and truckers for PTL and LTL loads across East India. Shippers post their loads, AI matches them with the best available trucks based on route, capacity, price, and reliability — and both sides track the shipment in real time with GPS."
            }
          },
          {
            "@type": "Question",
            "name": "How much does it cost to use LoadSaathi?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "LoadSaathi is free to join for both shippers and truckers. We charge a small transaction fee of 2–5% per completed shipment, which varies by role, volume, and credit score. There are no subscriptions, no hidden fees, and no minimum commitments."
            }
          },
          {
            "@type": "Question",
            "name": "Which cities and routes does LoadSaathi cover?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "LoadSaathi currently operates across East India with the Rourkela–Ranchi–Burdwan corridor as our primary route. We also cover Bhubaneswar, Kolkata, Jamshedpur, and 50+ cities across Odisha, Jharkhand, and West Bengal with 25+ active freight corridors."
            }
          },
          {
            "@type": "Question",
            "name": "How does the credit score system work?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Every user on LoadSaathi has a digital freight credit score ranging from 300 to 900. The score is based on completion rate, on-time performance, bidirectional reviews, and tenure on the platform. Higher scores unlock better loads and preferential matching."
            }
          },
          {
            "@type": "Question",
            "name": "Is my payment secure on LoadSaathi?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. LoadSaathi uses an escrow-backed payment system. Funds are held securely and released in milestones as delivery progresses. Digital settlements mean faster, transparent payouts compared to traditional 30–60 day credit cycles."
            }
          },
          {
            "@type": "Question",
            "name": "Who can use LoadSaathi — shippers or truckers?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Both. Shippers (MSMEs, manufacturers, traders) can post loads and find truck space. Truckers (independent operators, fleet owners) can browse available loads, fill empty capacity, and earn on return trips."
            }
          }
        ]
      }}
    />
    <div className="min-h-screen bg-background dark:bg-[#050816] text-foreground antialiased overflow-x-hidden">
      <OfflineBanner />

      <nav className="fixed top-0 w-full z-50 bg-background/70 dark:bg-[#050816]/70 backdrop-blur-xl border-b border-border dark:border-white/10 h-20">
        <div className="flex justify-between items-center w-full px-6 sm:px-12 max-w-[1440px] mx-auto h-full">
          <Link to="/" className="flex items-center gap-2">
            <LogoMark size="h-10 w-10" />
            <span className="text-lg sm:text-xl font-bold text-orange-600 dark:text-orange-400">LoadSaathi</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to="/features" className="nav-link text-muted-foreground hover:text-foreground dark:hover:text-orange-400">Features</Link>
            <Link to="/fare-calculator" className="nav-link text-muted-foreground hover:text-foreground dark:hover:text-orange-400">Fare Calculator</Link>
            <Link to="/how-it-works" className="nav-link text-muted-foreground hover:text-foreground dark:hover:text-orange-400">How It Works</Link>
            <Link to="/pricing" className="nav-link text-muted-foreground hover:text-foreground dark:hover:text-orange-400">Pricing</Link>
            <Link to="/about" className="nav-link text-muted-foreground hover:text-foreground dark:hover:text-orange-400">About</Link>
            <Link to="/faq" className="nav-link text-muted-foreground hover:text-foreground dark:hover:text-orange-400">FAQ</Link>
            <Link to="/contact" className="nav-link text-muted-foreground hover:text-foreground dark:hover:text-orange-400">Contact</Link>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <ThemeToggle />
            <Link to="/login" className="hidden sm:inline-block text-sm font-semibold text-muted-foreground hover:text-foreground dark:hover:text-orange-400 transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="hidden sm:inline-block">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold tracking-wider uppercase px-5 py-2 h-auto shadow-lg">
                Get Started
              </Button>
            </Link>
            <button
              type="button"
              className="md:hidden p-2 text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <div className="absolute right-0 top-0 h-full w-72 max-w-[80vw] bg-background dark:bg-[#050816] border-l border-border shadow-2xl animate-slide-in-right">
              <div className="flex justify-between items-center px-6 h-20 border-b border-border">
                <span className="text-lg font-bold text-orange-600 dark:text-orange-400">Menu</span>
                <button
                  type="button"
                  className="p-2 text-muted-foreground hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex flex-col gap-1 p-6">
                <Link to="/features" onClick={() => setMobileMenuOpen(false)} className="py-3 text-sm font-semibold text-muted-foreground hover:text-foreground dark:hover:text-orange-400 border-b border-border/50 transition-colors">Features</Link>
                <Link to="/fare-calculator" onClick={() => setMobileMenuOpen(false)} className="py-3 text-sm font-semibold text-muted-foreground hover:text-foreground dark:hover:text-orange-400 border-b border-border/50 transition-colors">Fare Calculator</Link>
                <Link to="/how-it-works" onClick={() => setMobileMenuOpen(false)} className="py-3 text-sm font-semibold text-muted-foreground hover:text-foreground dark:hover:text-orange-400 border-b border-border/50 transition-colors">How It Works</Link>
                <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} className="py-3 text-sm font-semibold text-muted-foreground hover:text-foreground dark:hover:text-orange-400 border-b border-border/50 transition-colors">Pricing</Link>
                <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="py-3 text-sm font-semibold text-muted-foreground hover:text-foreground dark:hover:text-orange-400 border-b border-border/50 transition-colors">About</Link>
                <Link to="/faq" onClick={() => setMobileMenuOpen(false)} className="py-3 text-sm font-semibold text-muted-foreground hover:text-foreground dark:hover:text-orange-400 border-b border-border/50 transition-colors">FAQ</Link>
                <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="py-3 text-sm font-semibold text-muted-foreground hover:text-foreground dark:hover:text-orange-400 border-b border-border/50 transition-colors">Contact</Link>
              </div>
              <div className="px-6 pt-4 space-y-3">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center py-3 text-sm font-semibold text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors">
                  Sign In
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center py-3 text-sm font-bold tracking-wider uppercase bg-orange-600 hover:bg-orange-700 text-white rounded-lg shadow-lg transition-colors">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="pt-20">
        {/* HERO */}
        <section className="relative min-h-[800px] lg:min-h-[921px] flex items-center overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-50" />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 -left-32 w-[600px] h-[600px] rounded-full opacity-[0.12] dark:opacity-[0.15]"
              style={{ background: 'radial-gradient(circle, #f97316 0%, transparent 70%)', filter: 'blur(60px)' }} />
            <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] rounded-full opacity-[0.10] dark:opacity-[0.15]"
              style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)', filter: 'blur(60px)' }} />
          </div>
          <div className="max-w-[1440px] mx-auto px-6 sm:px-12 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10 py-20">
            <div className="flex flex-col justify-center space-y-8">
              <div className="inline-flex items-center gap-2 w-fit">
                <span className="text-xs font-semibold tracking-widest uppercase bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-3 py-1.5 rounded-full border border-orange-200 dark:border-orange-700/30">
                  AI-Powered Shared Freight Network
                </span>
              </div>
              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black leading-[1.1] tracking-tight">
                Move freight smarter.<br />
                Fill every truck.<br />
                <span className="text-gradient-orange-blue">Build India&apos;s freight OS.</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-xl leading-relaxed">
                LoadSaathi is India's AI-powered shared freight marketplace transforming unused truck capacity into economic opportunity — matching shippers with truckers for PTL/LTL loads using AI matching, GPS tracking, and digital credit scores to eliminate empty return trips and reduce costs by up to 40%.
              </p>
              <div className="flex items-center gap-4 pt-4">
                <Button asChild className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold tracking-wider uppercase px-8 py-6 h-auto rounded-lg shadow-[0_0_20px_rgba(249,115,22,0.4)] group">
                  <Link to="/register">
                    Deploy Intelligence
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="text-sm font-bold tracking-wider uppercase px-8 py-6 h-auto rounded-lg border-border text-foreground">
                  <button type="button" onClick={() => scrollToSection('vision')}>
                    View Vision
                  </button>
                </Button>
              </div>
            </div>
            <div className="relative animate-float h-full min-h-[500px] flex items-center justify-center">
              <div className="glass-panel w-full h-[600px] rounded-xl p-6 flex flex-col shadow-2xl">
                <div className="flex justify-between items-center border-b border-border pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse-ring" />
                    <span className="text-xs text-muted-foreground dark:text-gray-300 uppercase tracking-widest">Live Network Stream</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-xs bg-blue-900/50 dark:bg-blue-900/30 text-blue-300 px-2 py-1 rounded border border-blue-700/50">SYS.ON</span>
                    <span className="text-xs bg-orange-900/50 dark:bg-orange-900/30 text-orange-300 px-2 py-1 rounded border border-orange-700/50">AI.SYNC</span>
                  </div>
                </div>
                <div className="flex-grow relative bg-card/50 rounded border border-border overflow-hidden">
                  <svg className="absolute inset-0 opacity-40" viewBox="0 0 500 500" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <path d="M200,50 L250,10 L300,50 L320,120 L400,200 L380,300 L250,480 L180,400 L120,350 L100,250 L80,150 Z" fill="none" stroke="#233143" strokeWidth="2" />
                    {[100, 200, 300, 400].map(y => <line key={`h${y}`} x1="0" y1={y} x2="500" y2={y} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />)}
                    {[100, 200, 300, 400].map(x => <line key={`v${x}`} x1={x} y1="0" x2={x} y2="500" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />)}
                    <path className="route-line" d="M150,200 Q200,150 280,220" fill="none" stroke="#f97316" strokeWidth="2" />
                    <path className="route-line" d="M280,220 Q320,300 250,400" fill="none" stroke="#3b82f6" strokeWidth="2" />
                    <path className="route-line" d="M120,300 Q180,280 220,180" fill="none" stroke="#f97316" strokeWidth="2" style={{ animationDuration: '40s' }} />
                    <circle cx="150" cy="200" fill="#f97316" r="4" />
                    <circle cx="280" cy="220" fill="#fff" r="4" />
                    <circle cx="250" cy="400" fill="#3b82f6" r="4" />
                    <circle cx="120" cy="300" fill="#f97316" r="4" />
                    <circle cx="220" cy="180" fill="#fff" r="4" />
                  </svg>                    <div className="absolute top-8 left-8 glass-card p-3 rounded-lg shadow-lg">
                    <div className="text-xs text-muted-foreground dark:text-gray-300 uppercase mb-1">AI Match Score</div>
                    <div className="text-xl font-bold text-orange-600 dark:text-orange-400">98.2%</div>
                  </div>
                  <div className="absolute bottom-12 right-8 glass-card p-3 rounded-lg shadow-lg">
                    <div className="text-xs text-muted-foreground dark:text-gray-300 uppercase mb-1">Capacity Filled</div>
                    <div className="text-xl font-bold text-blue-400">+34%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PROOF BAR */}
        <section className="fade-section border-y border-border dark:border-white/5 bg-muted/50 dark:bg-[#010f1f]/80 backdrop-blur-sm">
          <div className="max-w-[1440px] mx-auto px-6 sm:px-12 py-8 flex flex-col md:flex-row justify-center items-center gap-x-16 gap-y-8">
            {[
              { value: '40%', label: 'Empty Kilometers Today' },
              { value: '₹1.5L Cr', label: 'Annual Economic Loss' },
              { value: '0%', label: 'Tolerance for Inefficiency' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl sm:text-5xl font-black text-orange-600 dark:text-orange-400 tracking-tight">{stat.value}</div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-2">{stat.label}</div>
              </div>
            ))}
            <p className="w-full text-center text-[10px] text-muted-foreground/60 mt-2">Sources: Ministry of Road Transport &amp; Highways 2025, IBEF Logistics Report 2026</p>
          </div>
        </section>

        {/* BENTO GRID */}
        <section className="fade-section py-24 relative">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-[0.08] dark:opacity-[0.12] pointer-events-none"
            style={{ background: 'radial-gradient(circle, #f97316 0%, transparent 70%)', filter: 'blur(60px)' }} />
          <div className="max-w-[1440px] mx-auto px-6 sm:px-12 relative z-10">
            <div className="mb-16">
              <h2 className="text-3xl sm:text-4xl font-black mb-4 text-foreground dark:text-white">The Utilization Crisis</h2>
              <p className="text-lg text-muted-foreground max-w-2xl">India doesn&apos;t have a truck shortage. India has a utilization problem. Legacy systems create friction, leaving capacity stranded.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: Route, title: 'Empty Return Trips', desc: 'Trucks frequently return empty after a delivery, burning fuel and wasting economic potential due to lack of network visibility.', badge: 'CRITICAL INEFFICIENCY', badgeClass: 'text-red-500 dark:bg-red-900/20 dark:border-red-800/30 bg-red-100 border-red-200', colSpan: 'md:col-span-2', iconColor: 'text-orange-600 dark:text-orange-400' },
                { icon: Handshake, title: 'Broker Dependency', desc: 'Opaque pricing and multiple intermediaries erode margins for both shippers and transporters.', badge: null, iconColor: 'text-blue-500' },
                { icon: EyeOff, title: 'Zero Visibility', desc: 'Lack of real-time tracking leads to supply chain anxiety and manual intervention.', badge: null, iconColor: 'text-muted-foreground' },
                { icon: CircuitBoard, title: 'Fragmented Data Silos', desc: 'Disconnected systems prevent systemic optimization and intelligent capacity planning.', badge: null, iconColor: 'text-orange-500', colSpan: 'md:col-span-2' },
              ].map((card, i) => (
                <div key={i} className={`glass-card p-8 rounded-xl min-h-[260px] flex flex-col ${card.colSpan || ''} hover:border-orange-500/30 transition-all duration-300 group`}>
                  <card.icon className={`${card.iconColor} text-3xl mb-4 group-hover:scale-110 transition-transform duration-300 shrink-0`} />
                  <h3 className="text-lg font-bold text-foreground mb-2">{card.title}</h3>
                  <p className="text-sm text-muted-foreground flex-grow">{card.desc}</p>
                  {card.badge && (
                    <div className="mt-auto pt-6 border-t border-border">
                      <span className={`text-xs font-semibold ${card.badgeClass} px-2 py-1 rounded border`}>{card.badge}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHAT IS LOADSAATHI */}
        <section className="fade-section py-24 relative">
          <div className="max-w-[1440px] mx-auto px-6 sm:px-12 relative z-10">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-black mb-6 text-foreground dark:text-white">What is LoadSaathi?</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                LoadSaathi is India's AI-powered shared freight marketplace that connects shippers and truckers for Partial Truckload (PTL) and Less Than Truckload (LTL) loads across East India. Built for MSMEs in Tier 2 and 3 cities, LoadSaathi eliminates empty return trips, reduces freight costs by up to 40%, and brings digital trust to an industry that has operated on phone calls and brokers for decades.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'PTL & LTL Freight', desc: 'Share truck capacity across multiple shippers. Pay only for the space you use — no more paying for a full truck when your load is 3 tons.', icon: Package },
                { title: 'AI-Matched Logistics', desc: 'Our neural matching engine finds the perfect truck for your route, cargo, and timeline in seconds — not days of calling brokers.', icon: Brain },
                { title: 'East India Focused', desc: 'Starting with the Rourkela–Ranchi–Burdwan corridor, we are building the freight network for Odisha, Jharkhand, West Bengal, and beyond.', icon: Map },
              ].map((item, i) => (
                <div key={i} className="glass-card p-8 rounded-xl border border-border hover:border-orange-500/30 transition-all duration-300 group text-center">
                  <div className="bg-orange-100 dark:bg-orange-900/20 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <item.icon className="h-7 w-7 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="fade-section py-24 relative">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full opacity-[0.06] dark:opacity-[0.10] pointer-events-none"
            style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)", filter: "blur(60px)" }} />
          <div className="max-w-[1440px] mx-auto px-6 sm:px-12 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-black mb-4 text-foreground dark:text-white">How LoadSaathi Works</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Two sides, one platform. Whether you're shipping goods or hauling loads, the process is simple.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="glass-card p-8 rounded-xl border border-blue-500/20">
                <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <Package className="h-5 w-5 text-blue-400" /> For Shippers
                </h3>
                <div className="space-y-6">
                  {[
                    { step: "01", title: "Post Your Shipment", desc: "Enter load details — origin, destination, weight, timeline. AI suggests optimal pricing instantly." },
                    { step: "02", title: "Get AI-Matched", desc: "Our engine finds the best truckers for your route. Review profiles, credit scores, and past ratings." },
                    { step: "03", title: "Track in Real-Time", desc: "GPS tracking from pickup to delivery. No more 'kahan pahuncha?' calls." },
                    { step: "04", title: "Rate & Review", desc: "Build your shipper reputation. Leave reviews that help the next trucker choose wisely." },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <span className="text-2xl font-black text-blue-400 dark:text-blue-500 shrink-0">{item.step}</span>
                      <div>
                        <h4 className="font-bold text-foreground">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link to="/solutions/shippers" className="inline-flex items-center gap-1 text-sm font-semibold text-orange-500 hover:text-orange-400 mt-6">
                  Learn More <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="glass-card p-8 rounded-xl border border-orange-500/20">
                <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <Truck className="h-5 w-5 text-orange-400" /> For Truckers
                </h3>
                <div className="space-y-6">
                  {[
                    { step: "01", title: "Register Your Fleet", desc: "Set up your profile, vehicle details, and service areas. Your digital identity in freight." },
                    { step: "02", title: "Find Loads Instantly", desc: "Browse available shipments matched to your route. AI recommends the best paying loads." },
                    { step: "03", title: "Haul with Confidence", desc: "Share live location. Get paid faster. Build your credit score with every completed trip." },
                    { step: "04", title: "Grow Your Business", desc: "Higher credit scores unlock better loads. Direct relationships replace broker dependency." },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <span className="text-2xl font-black text-orange-400 dark:text-orange-500 shrink-0">{item.step}</span>
                      <div>
                        <h4 className="font-bold text-foreground">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link to="/solutions/truckers" className="inline-flex items-center gap-1 text-sm font-semibold text-orange-500 hover:text-orange-400 mt-6">
                  Learn More <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="text-center">
              <Link to="/how-it-works">
                <Button variant="outline" className="text-sm font-bold tracking-wider uppercase px-8 py-4 h-auto rounded-lg border-border hover:border-orange-400 text-foreground">
                  See Full Walkthrough <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* WHY SHIP / WHY DRIVE */}
        <section className="fade-section py-24 bg-muted/30 dark:bg-[#010f1f] border-y border-border dark:border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-[0.08] dark:opacity-[0.12] pointer-events-none"
            style={{ background: 'radial-gradient(circle, #f97316 0%, transparent 70%)', filter: 'blur(60px)' }} />
          <div className="max-w-[1440px] mx-auto px-6 sm:px-12 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-black mb-4 text-foreground dark:text-white">Why LoadSaathi?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Whether you are shipping goods or hauling loads, LoadSaathi solves the problems that have plagued East India's freight industry for decades.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass-card p-8 rounded-xl border border-blue-500/20">
                <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <Package className="h-5 w-5 text-blue-400" /> Why Ship on LoadSaathi?
                </h3>
                <div className="space-y-4">
                  {[
                    { title: 'Up to 40% Cost Reduction', desc: 'AI-optimized pricing and shared truck capacity mean you pay less per ton — PTL and LTL rates that brokers cannot match.' },
                    { title: 'No More Broker Dependency', desc: 'Direct access to verified truckers. Transparent pricing. No hidden commissions eating into your margins.' },
                    { title: 'Real-Time Visibility', desc: 'GPS tracking from pickup to delivery. Share live ETAs with your customers. No more "where is my shipment?" calls.' },
                    { title: 'Trusted Truckers', desc: 'Every trucker has a credit score (300-900), verified profile, and bidirectional reviews. Choose with confidence.' },
                    { title: 'Flexible PTL/LTL', desc: 'Ship 1 kg or 10 tons. Share truck space with other shippers. Pay only for what you use.' },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-900/20 border border-blue-700/30 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-blue-400">{i + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground text-sm">{item.title}</h4>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link to="/solutions/shippers" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-500 hover:text-blue-400 mt-6">
                  Start Shipping <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="glass-card p-8 rounded-xl border border-orange-500/20">
                <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <Truck className="h-5 w-5 text-orange-400" /> Why Drive on LoadSaathi?
                </h3>
                <div className="space-y-4">
                  {[
                    { title: 'Zero Empty Return Trips', desc: 'AI finds return loads for every route. Fill your truck both ways and earn on every kilometer — not just half the journey.' },
                    { title: 'Higher Earnings', desc: 'Direct shipper access means no broker commissions. AI price prediction helps you bid competitively and win more loads.' },
                    { title: 'Build Your Digital Reputation', desc: 'Credit score, reviews, completion rate — your track record follows you. Higher scores unlock premium, higher-paying loads.' },
                    { title: 'Instant Payments', desc: 'Escrow-backed digital settlements. No more chasing payments for weeks. Get paid as soon as delivery is confirmed.' },
                    { title: 'Smart Route Optimization', desc: 'AI suggests the best routes, loads, and pricing for your vehicle type and location. Maximize fleet utilization effortlessly.' },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-orange-900/20 border border-orange-700/30 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-orange-400">{i + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground text-sm">{item.title}</h4>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link to="/solutions/truckers" className="inline-flex items-center gap-1 text-sm font-semibold text-orange-500 hover:text-orange-400 mt-6">
                  Start Driving <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* PLATFORM TABS */}
        <section className="fade-section py-24 bg-muted/30 dark:bg-[#010f1f] border-y border-border dark:border-white/5 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-[0.08] dark:opacity-[0.12] pointer-events-none"
            style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)', filter: 'blur(60px)' }} />
          <div className="max-w-[1440px] mx-auto px-6 sm:px-12 relative z-10">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-black mb-4 text-foreground dark:text-white">The Freight Operating System</h2>
              <p className="text-lg text-muted-foreground">A unified architecture serving every node in the logistics network, powered by advanced matching algorithms.</p>
            </div>
            <div className="flex justify-center mb-12">
              <div className="glass-panel p-1 rounded-lg inline-flex gap-1">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all ${
                      activeTab === tab.id
                        ? 'bg-card/80 dark:bg-white/10 text-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-card/50 dark:hover:bg-white/5'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative w-full aspect-[16/9] max-h-[700px]">
              {/* Shipper OS */}
              <div role="tabpanel" className={`tab-content ${activeTab === 'shipper' ? 'active' : ''} absolute inset-0 glass-card rounded-xl border-blue-500/20 overflow-hidden shadow-2xl flex-col`}
                style={{ display: activeTab === 'shipper' ? 'flex' : 'none' }}
                inert={activeTab !== 'shipper'}
              >
                <div className="h-12 border-b border-blue-500/20 bg-card/80 flex items-center px-5 gap-3">
                  <Package className="h-4 w-4 text-blue-400" />
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Shipper OS</span>
                  <div className="flex-grow" />
                  <span className="text-[10px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded border border-border/50">v2.4.1</span>
                </div>
                <div className="flex-grow p-5 lg:p-6 bg-background/50 dark:bg-[#050816]/50 overflow-y-auto">
                  <p className="text-sm text-muted-foreground mb-5 max-w-2xl">Empower your supply chain with AI-driven tools to post, track, and optimize every shipment across East India's industrial corridors.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { icon: Package, title: 'AI-Powered Shipment Posting', desc: 'Enter load details — origin, destination, weight, timeline. AI suggests optimal pricing based on market data.', accent: 'Smart Pricing', accentClass: 'text-blue-400 bg-blue-900/20 border-blue-700/30' },
                      { icon: Search, title: 'Intelligent Truck Matching', desc: 'Find available trucks matched to your route and cargo type. View credit scores, ratings, and past performance.', accent: '98% Match Accuracy', accentClass: 'text-emerald-400 bg-emerald-900/20 border-emerald-700/30' },
                      { icon: MapPin, title: 'Real-Time GPS Tracking', desc: 'Live tracking from pickup to delivery with ETA updates. No more "kahan pahuncha?" coordination calls.', accent: 'Live', accentClass: 'text-blue-400 bg-blue-900/20 border-blue-700/30' },
                      { icon: Shield, title: 'Shipper Credit Score (300–900)', desc: 'Build your shipper reputation with every transaction. Higher scores attract premium truckers instantly.', accent: 'Score: 720', accentClass: 'text-orange-400 bg-orange-900/20 border-orange-700/30' },
                      { icon: BarChart3, title: 'Shipment Analytics & Insights', desc: 'Track costs, transit times, and carrier performance. Data-driven decisions to optimize your logistics.', accent: '+34% Efficiency', accentClass: 'text-emerald-400 bg-emerald-900/20 border-emerald-700/30' },
                      { icon: MessageSquare, title: 'Direct Shipper–Trucker Chat', desc: 'Communicate directly with truckers. Share documents, negotiate rates, and build relationships — no middlemen.', accent: 'Instant', accentClass: 'text-blue-400 bg-blue-900/20 border-blue-700/30' },
                    ].map((feat, i) => {
                      const Icon = feat.icon;
                      return (
                        <div key={i} className="glass-card p-4 rounded-lg border border-border hover:border-blue-500/30 transition-all duration-300 group min-h-[180px] flex flex-col">
                          <div className="bg-blue-900/10 dark:bg-blue-900/10 w-9 h-9 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shrink-0">
                            <Icon className="h-4 w-4 text-blue-400" />
                          </div>
                          <h4 className="text-sm font-bold text-foreground mb-1.5">{feat.title}</h4>
                          <p className="text-xs text-muted-foreground leading-relaxed flex-grow">{feat.desc}</p>
                          <span className={`mt-auto inline-block text-[10px] font-semibold ${feat.accentClass} px-2 py-0.5 rounded border w-fit`}>{feat.accent}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Transporter OS */}
              <div role="tabpanel" className={`tab-content ${activeTab === 'transporter' ? 'active' : ''} absolute inset-0 glass-card rounded-xl border-orange-500/20 overflow-hidden shadow-2xl flex-col`}
                style={{ display: activeTab === 'transporter' ? 'flex' : 'none' }}
                inert={activeTab !== 'transporter'}
              >
                <div className="h-12 border-b border-orange-500/20 bg-card/80 flex items-center px-5 gap-3">
                  <Truck className="h-4 w-4 text-orange-400" />
                  <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">Transporter OS</span>
                  <div className="flex-grow" />
                  <span className="text-[10px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded border border-border/50">v2.4.1</span>
                </div>
                <div className="flex-grow p-5 lg:p-6 bg-background/50 dark:bg-[#050816]/50 overflow-y-auto">
                  <p className="text-sm text-muted-foreground mb-5 max-w-2xl">Maximize your fleet's earning potential. Discover high-value loads, optimize routes, and build a digital reputation that commands premium rates.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { icon: Truck, title: 'Load Discovery Dashboard', desc: 'Browse available shipments matched to your route and vehicle type. AI prioritizes the highest-paying loads first.', accent: '12 Loads Found', accentClass: 'text-orange-400 bg-orange-900/20 border-orange-700/30' },
                      { icon: Route, title: 'Smart Route Optimization', desc: 'AI suggests return loads to eliminate empty trips. Maximize every kilometer on the Rourkela–Ranchi–Burdwan corridor.', accent: '0% Empty Target', accentClass: 'text-emerald-400 bg-emerald-900/20 border-emerald-700/30' },
                      { icon: MapPin, title: 'Live Location Sharing', desc: 'Share your trip location with shippers automatically. Build trust through complete transparency on every delivery.', accent: 'Sharing', accentClass: 'text-orange-400 bg-orange-900/20 border-orange-700/30' },
                      { icon: TrendingUp, title: 'Transporter Credit Score', desc: '300–900 credit score based on completion rate, reviews, and tenure. Higher scores unlock premium, higher-paying loads.', accent: 'Score: 810', accentClass: 'text-emerald-400 bg-emerald-900/20 border-emerald-700/30' },
                      { icon: DollarSign, title: 'Earnings & Payments Dashboard', desc: 'Track trip earnings, incentives, and payment history in real time. Digital settlements mean faster, transparent payouts.', accent: '₹45K This Week', accentClass: 'text-orange-400 bg-orange-900/20 border-orange-700/30' },
                      { icon: Star, title: 'Reputation & Bidirectional Reviews', desc: 'Build your profile with ratings from every trip. Higher ratings mean preferential access to top-paying loads.', accent: '4.8 ★ Rating', accentClass: 'text-yellow-400 bg-yellow-900/20 border-yellow-700/30' },
                    ].map((feat, i) => {
                      const Icon = feat.icon;
                      return (
                        <div key={i} className="glass-card p-4 rounded-lg border border-border hover:border-orange-500/30 transition-all duration-300 group min-h-[180px] flex flex-col">
                          <div className="bg-orange-900/10 dark:bg-orange-900/10 w-9 h-9 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shrink-0">
                            <Icon className="h-4 w-4 text-orange-400" />
                          </div>
                          <h4 className="text-sm font-bold text-foreground mb-1.5">{feat.title}</h4>
                          <p className="text-xs text-muted-foreground leading-relaxed flex-grow">{feat.desc}</p>
                          <span className={`mt-auto inline-block text-[10px] font-semibold ${feat.accentClass} px-2 py-0.5 rounded border w-fit`}>{feat.accent}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* AI Command Center */}
              <div role="tabpanel" className={`tab-content ${activeTab === 'command' ? 'active' : ''} absolute inset-0 glass-card rounded-xl border-orange-500/20 overflow-hidden shadow-[0_0_30px_rgba(249,115,22,0.1)] flex-col`}
                style={{ display: activeTab === 'command' ? 'flex' : 'none' }}
                inert={activeTab !== 'command'}
              >
                <div className="h-12 border-b border-orange-500/20 bg-orange-900/10 flex items-center px-5 gap-3">
                  <Brain className="h-4 w-4 text-orange-400" />
                  <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">AI Command Center</span>
                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse-ring" />
                  <div className="flex-grow" />
                  <span className="text-[10px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded border border-border/50">NEURAL CORE v3.1</span>
                </div>
                <div className="flex-grow p-5 lg:p-6 bg-background/50 dark:bg-[#050816]/50 overflow-y-auto">
                  <p className="text-sm text-muted-foreground mb-5 max-w-2xl">The intelligence layer powering the entire LoadSaathi network. Real-time algorithms optimize every match, predict every price, and secure every transaction.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { icon: Brain, title: 'Smart Load–Truck Matching', desc: 'Proprietary neural algorithm pairs every shipment with the optimal truck based on route, capacity, timing, and price preferences.', accent: '99.2% Accuracy', accentClass: 'text-orange-400 bg-orange-900/20 border-orange-700/30' },
                      { icon: TrendingUp, title: 'Dynamic Price Prediction', desc: 'Real-time pricing engine analyzes market demand, fuel costs, and seasonal patterns to suggest fair, competitive rates instantly.', accent: 'Market +5.2%', accentClass: 'text-emerald-400 bg-emerald-900/20 border-emerald-700/30' },
                      { icon: Activity, title: 'Network Demand Forecasting', desc: 'Predict capacity shortages 7 days in advance. AI identifies high-demand corridors and alerts transporters to position their fleet.', accent: 'Demand: High', accentClass: 'text-orange-400 bg-orange-900/20 border-orange-700/30' },
                      { icon: Shield, title: 'Fraud Detection & Trust Layer', desc: 'Automated verification flags suspicious activity across the network. Digital trail on every transaction ensures accountability.', accent: '0 Fraud Incidents', accentClass: 'text-emerald-400 bg-emerald-900/20 border-emerald-700/30' },
                      { icon: BarChart3, title: 'Fleet Utilization Analytics', desc: 'Aggregate network-wide analytics — fill rates, empty kilometers, route efficiency. Benchmark your fleet against corridor averages.', accent: '87% Utilization', accentClass: 'text-blue-400 bg-blue-900/20 border-blue-700/30' },
                      { icon: Map, title: 'Corridor Intelligence', desc: 'Real-time insights on East India\'s primary freight corridors. Traffic patterns, weather conditions, and route disruptions.', accent: '3 Corridors Live', accentClass: 'text-orange-400 bg-orange-900/20 border-orange-700/30' },
                    ].map((feat, i) => {
                      const Icon = feat.icon;
                      return (
                        <div key={i} className="glass-card p-4 rounded-lg border border-border hover:border-orange-500/30 transition-all duration-300 group min-h-[180px] flex flex-col">
                          <div className="bg-orange-900/10 dark:bg-orange-900/10 w-9 h-9 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shrink-0">
                            <Icon className="h-4 w-4 text-orange-400" />
                          </div>
                          <h4 className="text-sm font-bold text-foreground mb-1.5">{feat.title}</h4>
                          <p className="text-xs text-muted-foreground leading-relaxed flex-grow">{feat.desc}</p>
                          <span className={`mt-auto inline-block text-[10px] font-semibold ${feat.accentClass} px-2 py-0.5 rounded border w-fit`}>{feat.accent}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TRUSTED ACROSS EAST INDIA */}
        <section className="fade-section py-24 relative">
          <div className="max-w-[1440px] mx-auto px-6 sm:px-12 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-black mb-4 text-foreground dark:text-white">Trusted Across East India</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">From Rourkela's steel plants to Kolkata's ports, LoadSaathi is building the freight network for India's fastest-growing industrial corridor.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {[
                { city: 'Rourkela', state: 'Odisha', desc: 'Steel City hub — primary origin for industrial and manufacturing freight.', routes: '12 corridors' },
                { city: 'Ranchi', state: 'Jharkhand', desc: 'Mineral belt — mining, heavy machinery, and construction materials.', routes: '8 corridors' },
                { city: 'Kolkata', state: 'West Bengal', desc: 'Port city — container, FMCG, and distribution freight to eastern India.', routes: '10 corridors' },
                { city: 'Bhubaneswar', state: 'Odisha', desc: 'Capital corridor — IT, pharma, and commercial freight.', routes: '6 corridors' },
              ].map((city, i) => (
                <Link key={i} to={`/location/${city.city.toLowerCase()}`} className="glass-card p-6 rounded-xl border border-border hover:border-orange-500/30 transition-all duration-300 group">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="h-4 w-4 text-orange-500" />
                    <h3 className="font-bold text-foreground group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">{city.city}</h3>
                    <span className="text-xs text-muted-foreground">{city.state}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{city.desc}</p>
                  <span className="text-xs font-semibold text-orange-500">{city.routes} →</span>
                </Link>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-center">
              {[
                { value: '500+', label: 'Verified Truckers' },
                { value: '25+', label: 'Active Corridors' },
                { value: '50+', label: 'Cities Connected' },
                { value: '10K+', label: 'Loads Completed' },
              ].map((stat, i) => (
                <div key={i}>
                  <div className="text-3xl font-black text-orange-600 dark:text-orange-400">{stat.value}</div>
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* VISION SECTION */}
        <section id="vision" className="fade-section min-h-[716px] flex items-center justify-center relative bg-muted/30 dark:bg-[#010f1f] border-y border-border dark:border-white/5 py-24 overflow-hidden">
          <div className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDEwZjFmIiAvPgo8cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiAvPgo8L3N2Zz4=")`,
            }} />
          <div ref={globeRef} id="globe-container" className="absolute inset-0 z-0" />
          <div className="max-w-4xl mx-auto px-6 sm:px-12 text-center relative z-10 pointer-events-none">
            <h2 className="text-5xl sm:text-7xl lg:text-8xl font-black text-foreground dark:text-white tracking-tighter leading-none mb-6">
              Building the<br />operating system<br />for freight.
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              A future where every load finds its perfect space instantly, transparently, and efficiently.
            </p>
            <div className="mt-12 pointer-events-auto">
              <Link to="/register">
                <Button className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold tracking-wider uppercase px-8 py-4 h-auto rounded-lg shadow-[0_0_20px_rgba(249,115,22,0.4)]">
                  Join the Network <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* APP PREVIEW */}
        <section className="fade-section py-24 relative">
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full opacity-[0.08] dark:opacity-[0.12] pointer-events-none"
            style={{ background: "radial-gradient(circle, #f97316 0%, transparent 70%)", filter: "blur(60px)" }} />
          <div className="max-w-[1440px] mx-auto px-6 sm:px-12 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-black mb-4 text-foreground dark:text-white">See LoadSaathi in Action</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Explore the screens that power India's intelligent freight network.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "Dashboard", desc: "Real-time stats, earnings, and activity at a glance.", icon: LayoutDashboard, link: "/screens/dashboard" },
                { title: "AI Matching", desc: "Smart load-to-truck matching with confidence scores.", icon: Brain, link: "/screens/matching" },
                { title: "Chat", desc: "Direct communication between shippers and truckers.", icon: MessageSquare, link: "/screens/chat" },
                { title: "Credit Score", desc: "Digital reputation system for trust and transparency.", icon: Shield, link: "/screens/credit-score" },
                { title: "Reviews", desc: "Bidirectional ratings that build accountability.", icon: Star, link: "/screens/reviews" },
                { title: "Admin Center", desc: "Command and control for platform operators.", icon: Activity, link: "/screens/admin" },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <Link key={i} to={item.link} className="glass-card p-6 rounded-xl border border-border hover:border-orange-500/30 transition-all duration-300 group">
                    <div className="bg-orange-100 dark:bg-orange-900/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                    <div className="flex items-center gap-1 text-xs font-semibold text-orange-500 mt-4">
                      Preview <ArrowRight className="h-3 w-3" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* SAFETY & TRUST */}
        <section className="fade-section py-24 bg-muted/30 dark:bg-[#010f1f] border-y border-border dark:border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full opacity-[0.06] dark:opacity-[0.10] pointer-events-none"
            style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)", filter: "blur(60px)" }} />
          <div className="max-w-[1440px] mx-auto px-6 sm:px-12 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-black mb-4 text-foreground dark:text-white">Built on Trust</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Every transaction is backed by a digital reputation system that rewards reliability.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {[
                { icon: Shield, title: "Credit Score (300-900)", desc: "Every user has a digital freight credit score based on completion rate, reliability, reviews, and tenure." },
                { icon: Star, title: "Bidirectional Reviews", desc: "Both shippers and truckers rate each other after every completed trip. Transparency builds accountability." },
                { icon: UserCheck, title: "Verified Profiles", desc: "Phone-verified accounts and detailed fleet documentation ensure you know who you're dealing with." },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="glass-card p-8 rounded-xl border border-border hover:border-blue-500/30 transition-all duration-300">
                    <Icon className="text-blue-500 text-3xl mb-4" />
                    <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                );
              })}
            </div>
            <div className="text-center">
              <Link to="/safety-trust">
                <Button variant="outline" className="text-sm font-bold tracking-wider uppercase px-8 py-4 h-auto rounded-lg border-border hover:border-blue-400 text-foreground">
                  Learn About Safety & Trust <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="fade-section py-24 relative">
          <div className="max-w-[1440px] mx-auto px-6 sm:px-12 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-black mb-4 text-foreground dark:text-white">Frequently Asked Questions</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Answers to the most common questions from shippers and truckers.</p>
            </div>
            <div className="max-w-3xl mx-auto space-y-4">
              {[
                { q: 'What is LoadSaathi and how does it work?', a: 'LoadSaathi is an AI-powered shared freight marketplace connecting shippers and truckers for PTL (Partial Truckload) and LTL (Less Than Truckload) loads across East India. Shippers post their loads, AI matches them with the best available trucks based on route, capacity, price, and reliability — and both sides track the shipment in real time with GPS.' },
                { q: 'How much does it cost to use LoadSaathi?', a: 'LoadSaathi is free to join for both shippers and truckers. We charge a small transaction fee of 2–5% per completed shipment, which varies by role, volume, and credit score. There are no subscriptions, no hidden fees, and no minimum commitments.' },
                { q: 'Which cities and routes does LoadSaathi cover?', a: 'LoadSaathi currently operates across East India with the Rourkela–Ranchi–Burdwan corridor as our primary route. We also cover Bhubaneswar, Kolkata, Jamshedpur, and 50+ cities across Odisha, Jharkhand, and West Bengal with 25+ active freight corridors.' },
                { q: 'How does the credit score system work?', a: 'Every user on LoadSaathi has a digital freight credit score ranging from 300 to 900. The score is based on completion rate, on-time performance, bidirectional reviews, and tenure on the platform. Higher scores unlock better loads and preferential matching for truckers, and attract premium truckers for shippers.' },
                { q: 'Is my payment secure on LoadSaathi?', a: 'Yes. LoadSaathi uses an escrow-backed payment system. Funds are held securely and released in milestones as delivery progresses. Disputes are resolved through our built-in resolution system, and digital settlements mean faster, transparent payouts compared to traditional 30–60 day credit cycles.' },
                { q: 'Who can use LoadSaathi — shippers or truckers?', a: 'Both. Shippers (MSMEs, manufacturers, traders) can post loads and find truck space. Truckers (independent operators, fleet owners) can browse available loads, fill empty capacity, and earn on return trips. The platform is designed to eliminate empty kilometers for truckers and reduce freight costs for shippers.' },
              ].map((item, i) => (
                <details key={i} className="glass-card rounded-xl border border-border group" open={i === 0}>
                  <summary className="p-6 cursor-pointer font-bold text-foreground hover:text-orange-600 dark:hover:text-orange-400 transition-colors list-none flex items-center justify-between">
                    {item.q}
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-open:rotate-90 transition-transform shrink-0 ml-4" />
                  </summary>
                  <div className="px-6 pb-6 text-sm text-muted-foreground leading-relaxed">{item.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="fade-section py-32 relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-900/5 to-transparent dark:bg-[radial-gradient(ellipse_at_center,_rgba(249,115,22,0.12),transparent_70%)]" />
          <div className="max-w-xl w-full mx-auto px-6 sm:px-12 relative z-10">
            <div className="glass-card p-10 sm:p-14 rounded-2xl border border-orange-500/20 shadow-[0_0_50px_rgba(249,115,22,0.1)] text-center">
              <div className="bg-orange-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Truck className="h-8 w-8 text-orange-400" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-4">Ready to Transform Your Freight?</h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-8">Join India&apos;s intelligent freight network. Sign up as a shipper or trucker and start optimizing today.</p>
              <div className="space-y-4">
                <Link to="/register?type=shipper" className="block">
                  <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold tracking-wider uppercase px-6 py-4 h-auto rounded-lg shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                    <Package className="mr-2 h-5 w-5" /> I Want to Ship Goods
                  </Button>
                </Link>
                <Link to="/register?type=trucker" className="block">
                  <Button variant="outline" className="w-full text-sm font-bold tracking-wider uppercase px-6 py-4 h-auto rounded-lg border-border text-foreground hover:bg-accent">
                    <Truck className="mr-2 h-5 w-5" /> I Have Truck Space
                  </Button>
                </Link>
                <p className="text-xs text-muted-foreground pt-4">
                  Already have an account? <Link to="/login" className="text-orange-400 hover:text-orange-300 underline underline-offset-2">Sign in</Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted dark:bg-[#0B1220] border-t border-border dark:border-white/5 w-full py-16">
        <div className="flex flex-col sm:grid sm:grid-cols-2 md:grid-cols-5 gap-8 px-6 sm:px-12 max-w-[1440px] mx-auto">
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <LogoMark size="h-10 w-10" />
              <span className="text-xl font-bold text-orange-600 dark:text-orange-400">LoadSaathi</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Precision Freight Intelligence — matching every load to its perfect space using AI.</p>
            <Link to="/register">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold tracking-wider uppercase px-4 py-2 h-auto rounded-lg">
                Join Now <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Platform</span>
            <Link to="/features" className="text-sm text-muted-foreground hover:text-foreground dark:hover:text-orange-400 transition-all">Features</Link>
            <Link to="/how-it-works" className="text-sm text-muted-foreground hover:text-foreground dark:hover:text-orange-400 transition-all">How It Works</Link>
            <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground dark:hover:text-orange-400 transition-all">Pricing</Link>
            <Link to="/safety-trust" className="text-sm text-muted-foreground hover:text-foreground dark:hover:text-orange-400 transition-all">Safety & Trust</Link>
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Solutions</span>
            <Link to="/solutions/shippers" className="text-sm text-muted-foreground hover:text-foreground dark:hover:text-orange-400 transition-all">For Shippers</Link>
            <Link to="/solutions/truckers" className="text-sm text-muted-foreground hover:text-foreground dark:hover:text-orange-400 transition-all">For Truckers</Link>
            <Link to="/fare-calculator" className="text-sm text-muted-foreground hover:text-foreground dark:hover:text-orange-400 transition-all">Fare Calculator</Link>
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Company</span>
            <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground dark:hover:text-orange-400 transition-all">About</Link>
            <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground dark:hover:text-orange-400 transition-all">Blog</Link>
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground dark:hover:text-orange-400 transition-all">Contact</Link>
            <Link to="/faq" className="text-sm text-muted-foreground hover:text-foreground dark:hover:text-orange-400 transition-all">FAQ</Link>
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Legal</span>
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground dark:hover:text-orange-400 transition-all">Privacy</Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground dark:hover:text-orange-400 transition-all">Terms</Link>
          </div>
        </div>
        <div className="border-t border-border dark:border-white/5 mt-12 pt-8">
          <TooltipProvider>
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            {socialLinks.map((social) => (
              <Tooltip key={social.name}>
                <TooltipTrigger asChild>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className={`w-9 h-9 rounded-full bg-muted dark:bg-white/5 flex items-center justify-center ${social.color} hover:bg-muted-foreground/10 dark:hover:bg-white/10 transition-all`}
                  >
                    {social.icon}
                  </a>
                </TooltipTrigger>
                <TooltipContent>{social.name}</TooltipContent>
              </Tooltip>
            ))}
          </div>
          </TooltipProvider>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} LoadSaathi. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
};

export default Index;