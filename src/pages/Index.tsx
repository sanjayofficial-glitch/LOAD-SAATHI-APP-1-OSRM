import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import OfflineBanner from '@/components/OfflineBanner';
import ThemeToggle from '@/components/ThemeToggle';
import IndexSkeleton from '@/components/IndexSkeleton';
import { useTheme } from '@/theme/theme';
import LogoMark from '@/components/LogoMark';
import SeoMeta from '@/components/SeoMeta';
import HeroSection from '@/components/home/HeroSection';
import ProofBar from '@/components/home/ProofBar';
import BentoGrid from '@/components/home/BentoGrid';
import WhatIsLoadSaathi from '@/components/home/WhatIsLoadSaathi';
import HowItWorksSection from '@/components/home/HowItWorksSection';
import WhyLoadSaathi from '@/components/home/WhyLoadSaathi';
import PlatformTabs from '@/components/home/PlatformTabs';
import TrustedAcrossEastIndia from '@/components/home/TrustedAcrossEastIndia';
import VisionSection from '@/components/home/VisionSection';
import AppPreview from '@/components/home/AppPreview';
import SafetyTrust from '@/components/home/SafetyTrust';
import FaqSection from '@/components/home/FaqSection';
import CtaSection from '@/components/home/CtaSection';

const Index = () => {
  const [ready, setReady] = useState(false);
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
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu h-6 w-6"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            </button>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-xl md:hidden flex flex-col items-center justify-center gap-8">
          <button
            type="button"
            className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x h-8 w-8"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
          <Link to="/features" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-foreground hover:text-orange-500">Features</Link>
          <Link to="/fare-calculator" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-foreground hover:text-orange-500">Fare Calculator</Link>
          <Link to="/how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-foreground hover:text-orange-500">How It Works</Link>
          <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-foreground hover:text-orange-500">Pricing</Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-foreground hover:text-orange-500">About</Link>
          <Link to="/faq" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-foreground hover:text-orange-500">FAQ</Link>
          <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-foreground hover:text-orange-500">Contact</Link>
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="text-sm font-bold tracking-wider uppercase px-8 py-3 h-auto rounded-lg">Sign In</Button>
            </Link>
            <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
              <Button className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold tracking-wider uppercase px-8 py-3 h-auto rounded-lg shadow-lg">Get Started</Button>
            </Link>
          </div>
        </div>
      )}

      <main>
        <HeroSection />
        <ProofBar />
        <BentoGrid />
        <WhatIsLoadSaathi />
        <HowItWorksSection />
        <WhyLoadSaathi />
        <PlatformTabs />
        <TrustedAcrossEastIndia />
        <VisionSection globeRef={globeRef} />
        <AppPreview />
        <SafetyTrust />
        <FaqSection />
        <CtaSection />
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
