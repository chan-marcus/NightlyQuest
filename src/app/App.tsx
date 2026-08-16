import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { supabase } from '/utils/supabase/client';

// Captured at module load time — before React mounts — so no timing issues.
// Hash (#add-child) is checked first because it can never be stripped by servers,
// CDNs, or mobile WebView sandboxes (unlike query params and storage).
const IS_ADD_CHILD =
  window.location.hash === '#add-child' ||
  new URLSearchParams(window.location.search).get('page') === 'add-child';

const ANALYTICS_TOKEN = 'nq-dash-7x4k9';
const IS_ANALYTICS_DIRECT =
  window.location.hash === `#${ANALYTICS_TOKEN}` ||
  new URLSearchParams(window.location.search).get('token') === ANALYTICS_TOKEN;

export default function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [moonOffset, setMoonOffset] = useState(0);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState<'trial' | 'adventurer' | 'legendary'>('trial');
  const [heroEmail, setHeroEmail] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(IS_ANALYTICS_DIRECT);
  const [showAddChild, setShowAddChild] = useState(IS_ADD_CHILD);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setIsScrolled(y > 30);
      setMoonOffset(y * 0.15);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.email) setHeroEmail(detail.email);
      setSelectedTier('legendary');
      setShowSignupModal(true);
    };
    window.addEventListener('nq:upgrade-legendary', handler);
    return () => window.removeEventListener('nq:upgrade-legendary', handler);
  }, []);

  useLayoutEffect(() => {
    const check = () => {
      setShowAddChild(
        window.location.hash === '#add-child' ||
        new URLSearchParams(window.location.search).get('page') === 'add-child'
      );
      setShowAnalytics(
        window.location.hash === `#${ANALYTICS_TOKEN}` ||
        new URLSearchParams(window.location.search).get('token') === ANALYTICS_TOKEN
      );
    };
    check();
    window.addEventListener('hashchange', check);
    return () => window.removeEventListener('hashchange', check);
  }, []);

  // Track visitor
  useEffect(() => {
    const trackVisitor = async () => {
      try {
        // Get or create visitor ID
        let visitorId = localStorage.getItem('nq_visitor_id');
        if (!visitorId) {
          visitorId = crypto.randomUUID();
          localStorage.setItem('nq_visitor_id', visitorId);
        }

        // Get last visit timestamp
        const lastVisit = localStorage.getItem('nq_last_visit');
        const now = new Date().toISOString();

        // Insert page view
        await supabase.from('page_views').insert({
          visitor_id: visitorId,
          visited_at: now,
          path: window.location.pathname,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent
        });

        // Update last visit
        localStorage.setItem('nq_last_visit', now);
      } catch (err) {
        console.error('Error tracking visitor:', err);
      }
    };

    trackVisitor();
  }, []);

  if (showAnalytics) {
    return <AnalyticsPage onClose={() => setShowAnalytics(false)} />;
  }

  if (showAddChild) {
    return <AddChildPage onClose={() => { history.pushState({}, '', window.location.pathname); setShowAddChild(false); }} />;
  }

  return (
    <div className="min-h-screen text-[var(--cream)] relative">
      <Sky />
      <Horizon />
      <Stars />
      <Moon offset={moonOffset} />
      <Grain />

      <Navbar isScrolled={isScrolled} />

      <HeroSection onStartFree={() => { setSelectedTier('trial'); setShowSignupModal(true); }} email={heroEmail} setEmail={setHeroEmail} />

      <div className="text-center text-[var(--gold)] opacity-40 text-lg tracking-[1em] py-3 relative" style={{ zIndex: 2 }}>
        · ✦ · ✦ · ✦ ·
      </div>

      <SocialProof />
      <EmailNativeSection />
      <HowItWorksSection />
      <DifferenceSection />

      <div className="text-center text-[var(--gold)] opacity-40 text-lg tracking-[1em] py-3 relative" style={{ zIndex: 2 }}>
        · ✦ · ✦ · ✦ ·
      </div>

      <PricingSection onSelectTier={(tier) => { setSelectedTier(tier); setShowSignupModal(true); }} />
      <FAQSection />
      <CloserSection onStartFree={() => { setSelectedTier('trial'); setShowSignupModal(true); }} />
      <Footer onAnalyticsClick={() => setShowAnalytics(true)} onAddChildClick={() => setShowAddChild(true)} />

      <SignupModal isOpen={showSignupModal} onClose={() => setShowSignupModal(false)} tier={selectedTier} initialEmail={heroEmail} />
    </div>
  );
}

// Background components
function Sky() {
  return (
    <div className="fixed inset-0 pointer-events-none" style={{
      zIndex: -3,
      background: `
        radial-gradient(ellipse 70% 50% at 78% 4%, rgba(245,196,94,.12), transparent 58%),
        radial-gradient(ellipse 90% 70% at 12% 102%, rgba(188,185,236,.14), transparent 55%),
        radial-gradient(ellipse 120% 90% at 50% 50%, rgba(42,52,112,.25), transparent 70%),
        linear-gradient(180deg, var(--night-1) 0%, var(--night-2) 50%, var(--night-3) 100%)
      `
    }} />
  );
}

function Horizon() {
  return (
    <div className="fixed left-0 right-0 bottom-0 h-[40vh] pointer-events-none" style={{
      zIndex: -3,
      background: 'radial-gradient(ellipse 90% 100% at 50% 130%, rgba(245,196,94,.10), rgba(188,185,236,.05) 40%, transparent 70%)'
    }} />
  );
}

function Stars() {
  const [stars, setStars] = useState<Array<{ size: number; left: number; top: number; dur: number; delay: number }>>([]);

  useEffect(() => {
    const count = window.innerWidth < 600 ? 70 : 140;
    const newStars = Array.from({ length: count }, () => ({
      size: Math.random() * 2.2 + 0.5,
      left: Math.random() * 100,
      top: Math.random() * 100,
      dur: Math.random() * 3 + 1.5,
      delay: Math.random() * 4
    }));
    setStars(newStars);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: -2 }}>
      {stars.map((star, i) => (
        <div
          key={i}
          className="absolute bg-white rounded-full"
          style={{
            width: star.size + 'px',
            height: star.size + 'px',
            left: star.left + '%',
            top: star.top + '%',
            animation: `twinkle ${star.dur}s ease-in-out infinite alternate`,
            animationDelay: star.delay + 's'
          }}
        />
      ))}
      <Fireflies />
      <ShootingStars />
    </div>
  );
}

function Fireflies() {
  const [fireflies, setFireflies] = useState<Array<{ left: number; top: number; dx: number; dy: number; dur: number; delay: number }>>([]);

  useEffect(() => {
    const newFireflies = Array.from({ length: 7 }, () => ({
      left: Math.random() * 100,
      top: 40 + Math.random() * 55,
      dx: Math.random() * 160 - 80,
      dy: Math.random() * -140 - 40,
      dur: Math.random() * 8 + 9,
      delay: Math.random() * 8
    }));
    setFireflies(newFireflies);
  }, []);

  return (
    <>
      {fireflies.map((fly, i) => (
        <div
          key={i}
          className="fixed w-1 h-1 rounded-full pointer-events-none bg-[var(--gold)]"
          style={{
            zIndex: -2,
            left: fly.left + 'vw',
            top: fly.top + 'vh',
            boxShadow: '0 0 8px 2px var(--amber-glow)',
            animation: `drift ${fly.dur}s ease-in-out infinite`,
            animationDelay: fly.delay + 's',
            // @ts-ignore
            '--dx': fly.dx + 'px',
            '--dy': fly.dy + 'px'
          }}
        />
      ))}
    </>
  );
}

function ShootingStars() {
  useEffect(() => {
    const shoot = () => {
      const sh = document.createElement('div');
      sh.className = 'fixed w-0.5 h-0.5 bg-white rounded-full opacity-0 pointer-events-none';
      sh.style.zIndex = '-2';
      sh.style.boxShadow = '0 0 0 1px rgba(255,255,255,.4)';
      sh.style.top = Math.random() * 40 + 'vh';
      sh.style.left = (40 + Math.random() * 55) + 'vw';

      const after = document.createElement('div');
      after.className = 'absolute top-1/2 right-0 w-[90px] h-px -translate-y-1/2';
      after.style.background = 'linear-gradient(90deg,#fff,transparent)';
      sh.appendChild(after);

      document.body.appendChild(sh);

      sh.animate([
        { opacity: 0, transform: 'translate(0,0)' },
        { opacity: 1, offset: 0.15 },
        { opacity: 0, transform: 'translate(-220px,150px)' }
      ], { duration: 1100, easing: 'ease-in' });

      setTimeout(() => sh.remove(), 1200);
      setTimeout(shoot, 4000 + Math.random() * 7000);
    };

    const timer = setTimeout(shoot, 2500);
    return () => clearTimeout(timer);
  }, []);

  return null;
}

function Moon({ offset }: { offset: number }) {
  return (
    <div
      className="fixed top-[5%] right-[7%] w-24 h-24 max-[900px]:w-16 max-[900px]:h-16 rounded-full will-change-transform opacity-60"
      style={{
        zIndex: -2,
        background: 'radial-gradient(circle at 35% 35%, #fff5dc, #f5e3b8 52%, #e6c97e)',
        boxShadow: '0 0 40px 12px rgba(245,196,94,.18), inset -11px -7px 20px rgba(180,150,90,.38)',
        transform: `translateY(${offset}px)`
      }}
    >
      <div className="absolute w-4 h-4 top-5 left-6 rounded-full max-[900px]:w-3 max-[900px]:h-3 max-[900px]:top-3 max-[900px]:left-4" style={{ background: 'rgba(190,160,100,.16)', boxShadow: '0 0 0 1px rgba(160,130,80,.09)' }} />
      <div className="absolute w-2.5 h-2.5 bottom-5 right-6 rounded-full max-[900px]:w-2 max-[900px]:h-2 max-[900px]:bottom-3.5 max-[900px]:right-4" style={{ background: 'rgba(190,160,100,.16)' }} />
    </div>
  );
}

function Grain() {
  return (
    <div
      className="fixed inset-0 pointer-events-none opacity-[0.045] mix-blend-overlay"
      style={{
        zIndex: 1,
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"
      }}
    />
  );
}

// Navigation
function Navbar({ isScrolled }: { isScrolled: boolean }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <div
        className="sticky top-0 transition-all duration-[400ms]"
        style={{
          zIndex: 50,
          background: isScrolled ? 'rgba(8,12,30,.72)' : 'transparent',
          backdropFilter: isScrolled ? 'blur(14px)' : 'none',
          borderBottom: isScrolled ? '1px solid rgba(245,196,94,.12)' : '1px solid transparent',
          transitionTimingFunction: 'var(--ease)'
        }}
      >
        <nav className={`flex justify-between items-center max-w-[1120px] mx-auto transition-all duration-[400ms]`} style={{
          padding: isScrolled ? '14px 28px' : '22px 28px',
          transitionTimingFunction: 'var(--ease)'
        }}>
          <a href="#start" className="flex items-center gap-2.5 no-underline text-[var(--cream)] transition-colors duration-200 hover:text-[var(--gold)] cursor-pointer" style={{ fontFamily: 'var(--display)', fontWeight: 600, fontSize: '1.4rem', letterSpacing: '0.3px' }}>
            <span className="text-[var(--gold)] text-[1.05rem]" style={{ animation: 'sparkle 3s ease-in-out infinite' }}>✦</span>
            NightlyQuest
          </a>

          {/* Desktop Navigation */}
          <div className="flex items-center gap-[30px] text-[0.94rem] font-medium max-[900px]:hidden">
            <a href="#how" className="no-underline text-[var(--cream-dim)] transition-colors duration-200 relative group hover:text-[var(--gold)]">
              <span>How It Works</span>
              <span className="absolute left-0 -bottom-1.5 w-0 h-[1.5px] bg-[var(--gold)] transition-[width] duration-[250ms] group-hover:w-full" style={{ transitionTimingFunction: 'var(--ease)' }} />
            </a>
            <a href="#pricing" className="no-underline text-[var(--cream-dim)] transition-colors duration-200 relative group hover:text-[var(--gold)]">
              <span>Pricing</span>
              <span className="absolute left-0 -bottom-1.5 w-0 h-[1.5px] bg-[var(--gold)] transition-[width] duration-[250ms] group-hover:w-full" style={{ transitionTimingFunction: 'var(--ease)' }} />
            </a>
            <a href="#faq" className="no-underline text-[var(--cream-dim)] transition-colors duration-200 relative group hover:text-[var(--gold)]">
              <span>FAQ</span>
              <span className="absolute left-0 -bottom-1.5 w-0 h-[1.5px] bg-[var(--gold)] transition-[width] duration-[250ms] group-hover:w-full" style={{ transitionTimingFunction: 'var(--ease)' }} />
            </a>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="hidden max-[900px]:flex flex-col gap-1.5 w-10 h-10 items-center justify-center text-[var(--cream)] transition-colors hover:text-[var(--gold)]"
            aria-label="Toggle menu"
          >
            <span className={`w-6 h-0.5 bg-current transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`w-6 h-0.5 bg-current transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`w-6 h-0.5 bg-current transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 transition-all duration-300 hidden max-[900px]:block ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ zIndex: 45 }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0"
          style={{ background: 'rgba(6,10,28,.95)', backdropFilter: 'blur(10px)' }}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Menu Content */}
        <div className="relative h-full flex flex-col items-center justify-center gap-8 px-8">
          <a
            href="#how"
            onClick={() => setMobileMenuOpen(false)}
            className="text-2xl font-medium text-[var(--cream)] no-underline transition-colors hover:text-[var(--gold)]"
            style={{ fontFamily: 'var(--display)' }}
          >
            How It Works
          </a>
          <a
            href="#pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="text-2xl font-medium text-[var(--cream)] no-underline transition-colors hover:text-[var(--gold)]"
            style={{ fontFamily: 'var(--display)' }}
          >
            Pricing
          </a>
          <a
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="text-2xl font-medium text-[var(--cream)] no-underline transition-colors hover:text-[var(--gold)]"
            style={{ fontFamily: 'var(--display)' }}
          >
            FAQ
          </a>
        </div>
      </div>
    </>
  );
}

// Hero Section
function HeroSection({ onStartFree, email, setEmail }: { onStartFree: () => void; email: string; setEmail: (email: string) => void }) {

  return (
    <section className="text-center px-7 py-24 pb-20 max-w-[1200px] mx-auto relative" style={{ zIndex: 2 }} id="start">
      <span
        className="inline-flex items-center gap-2 uppercase text-[var(--gold)] font-semibold mb-7 border border-[rgba(245,196,94,.3)] px-5 py-2 rounded-full whitespace-nowrap"
        style={{ background: 'rgba(245,196,94,.06)', animation: 'rise 0.9s 0.1s both', fontSize: 'clamp(0.5rem,1.4vw,0.78rem)', letterSpacing: 'clamp(0.1em,0.22em,0.22em)' }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]" style={{ boxShadow: '0 0 8px var(--gold)', animation: 'pulse 2s ease-in-out infinite' }} />
        Choose-your-own-adventure, by email
      </span>

      <h1
        className="font-medium leading-[1.15] tracking-tight mb-8 px-4"
        style={{ fontFamily: 'var(--display)', fontSize: 'clamp(2rem,5.5vw,5.5rem)', animation: 'rise 0.9s 0.26s both' }}
      >
        <span className="inline-block max-[640px]:block">Your child becomes the</span>{' '}
        <em className="italic bg-gradient-to-br from-[var(--gold-lt)] via-[var(--gold)] to-[var(--gold-deep)] bg-clip-text text-transparent inline-block max-[640px]:block">hero of their own story</em>
      </h1>

      <p
        className="mx-auto mb-5 text-[var(--cream-dim)] leading-relaxed px-4"
        style={{ fontSize: 'clamp(0.95rem,2.2vw,1.5rem)', animation: 'rise 0.9s 0.4s both' }}
      >
        A choose-your-own-adventure that grows night after night.<br />
        Their choices shape the tale, turning each night into an adventure uniquely theirs.
      </p>

      <p className="text-[var(--cream)] mx-auto mb-12 font-medium px-4 whitespace-nowrap" style={{ fontSize: 'clamp(0.65rem,3vw,1.25rem)', animation: 'rise 0.9s 0.5s both' }}>
        No app, no login. Just open your inbox at night.
      </p>

      <div className="flex gap-4 justify-center max-w-[580px] mx-auto max-[520px]:flex-col" style={{ animation: 'rise 0.9s 0.6s both' }}>
        <input
          id="email-signup"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          className="flex-1 px-6 py-4 rounded-full border text-[var(--cream)] text-lg outline-none transition-all max-[520px]:text-base"
          style={{
            background: 'rgba(255,255,255,.08)',
            borderColor: 'rgba(245,196,94,.3)',
            fontFamily: 'var(--body)',
            scrollMarginTop: '100px'
          }}
        />
        <button
          onClick={onStartFree}
          className="relative inline-flex items-center justify-center gap-3 font-bold text-lg text-[var(--night-1)] px-10 py-4 rounded-full border-none cursor-pointer whitespace-nowrap overflow-hidden transition-all duration-[250ms] hover:-translate-y-[3px] hover:scale-[1.02] group max-[520px]:w-full"
          style={{
            fontFamily: 'var(--body)',
            background: 'linear-gradient(135deg,var(--gold-lt),var(--gold-deep))',
            boxShadow: '0 14px 40px var(--amber-glow)',
            transitionTimingFunction: 'var(--ease)'
          }}
        >
          <span className="absolute top-0 -left-[120%] w-[60%] h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -skew-x-12 transition-[left] duration-[600ms] group-hover:left-[130%]" style={{ transitionTimingFunction: 'var(--ease)' }} />
          Start Free
          <span className="transition-transform duration-[250ms] group-hover:translate-x-1.5" style={{ transitionTimingFunction: 'var(--ease)' }}>→</span>
        </button>
      </div>

      <p className="mt-4.5 text-[0.9rem] text-[var(--cream-dim)]" style={{ animation: 'rise 0.9s 0.72s both' }}>
        7-day free trial · No credit card required
      </p>

      <EmailHeroCard />
    </section>
  );
}

function EmailHeroCard() {
  const [replyText, setReplyText] = useState('');
  const [showCaret, setShowCaret] = useState(true);
  const [isSent, setIsSent] = useState(false);
  const [showSentMsg, setShowSentMsg] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setReplyText("B - follow the dragon!");
      setShowCaret(false);
      setIsSent(true);
      setShowSentMsg(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runAnimation();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const runAnimation = async () => {
    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
    const reply = "B - follow the dragon!";

    while (true) {
      // Reset
      setReplyText('');
      setShowCaret(true);
      setShowSentMsg(false);
      setIsSent(false);
      await sleep(1600);

      // Type
      for (let i = 0; i < reply.length; i++) {
        setReplyText(reply.substring(0, i + 1));
        await sleep(50 + Math.random() * 55);
      }
      await sleep(550);

      // Send
      setShowCaret(false);
      setIsSent(true);
      setShowSentMsg(true);
      await sleep(3000);
    }
  };

  return (
    <div
      ref={cardRef}
      className="mt-16 max-w-[620px] mx-auto text-left relative rounded-xl overflow-hidden"
      style={{
        background: 'linear-gradient(165deg, rgba(255,253,247,.09), rgba(255,255,255,.02))',
        border: '1px solid rgba(245,196,94,.22)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 40px 90px rgba(0,0,0,.5)',
        animation: 'rise 1.1s 0.92s both'
      }}
    >
      {/* Email Window Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.08]" style={{ background: 'rgba(0,0,0,.15)' }}>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff6058]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28ca42]" />
        </div>
        <div className="flex-1 text-center text-[var(--cream-dim)] whitespace-nowrap" style={{ fontSize: 'clamp(0.6rem,1.2vw,0.75rem)' }}>Chapter 14 · Allie's Quest</div>
        <div className="w-12" />
      </div>

      {/* Email Header - Compact */}
      <div className="px-6 py-4 border-b border-white/[0.06]">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full grid place-items-center text-base text-[var(--night-1)] font-bold" style={{
            background: 'linear-gradient(135deg,var(--gold-lt),var(--gold-deep))',
            boxShadow: '0 4px 12px var(--amber-glow)'
          }}>
            NQ
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-sm text-[var(--cream)]">NightlyQuest</div>
              <div className="text-xs text-[var(--cream-dim)]">7:30 PM</div>
            </div>
            <div className="text-xs text-[var(--cream-dim)]">to me</div>
          </div>
        </div>
      </div>

      {/* Email Body - Compact */}
      <div className="px-6 py-5 max-[520px]:px-5 max-[520px]:py-4">
        <div className="relative max-h-[180px] overflow-hidden mb-5" style={{
          maskImage: 'linear-gradient(180deg,#000 50%,rgba(0,0,0,.3) 80%,transparent)',
          WebkitMaskImage: 'linear-gradient(180deg,#000 50%,rgba(0,0,0,.3) 80%,transparent)'
        }}>
          <div className="text-base leading-[1.65] text-[var(--cream)]" style={{ fontFamily: 'var(--display)' }}>
            <p className="mb-3 first-letter:text-[2.5em] first-letter:leading-[0.8] first-letter:float-left first-letter:mr-2.5 first-letter:mt-1 first-letter:text-[var(--gold)] first-letter:font-semibold">
              The trail climbed higher than Allie had ever dared, past frost-silvered pines and a waterfall frozen mid-fall, like glass. By the time she reached the ledge, her breath came out in little clouds.
            </p>
            <p className="mb-3">And there it was. The mouth of the cave, glowing a soft amber from somewhere deep inside.</p>
            <p className="mb-3">The little dragon she'd rescued weeks ago swooped down and settled on her shoulder, wings folding neat as a closed book. The dragon was bigger now. Warmer, too.</p>
            <p className="italic text-[var(--lavender)] mb-3">"I've been waiting for you," the dragon whispered, her voice like crackling embers.</p>
            <p className="mb-3">Allie scratched the ridge above the dragon's eye, the way she liked. "You found it, didn't you? The thing we've been searching for."</p>
          </div>
        </div>

        <div className="mb-5 pb-4 border-b border-white/[0.08]">
          <div className="leading-[1.5] text-[var(--cream)]" style={{ fontFamily: 'var(--display)', fontSize: 'clamp(0.8rem,1.6vw,1rem)' }}>
            <p className="mb-2 font-semibold">What should Allie do?</p>
            <div className="mb-3 space-y-1.5">
              <p className="whitespace-nowrap" style={{ fontSize: 'clamp(0.6rem,2.5vw,1rem)' }}>
                <b className="text-[var(--gold)] font-bold">A</b> - Step inside the glowing cave
              </p>
              <p className="whitespace-nowrap" style={{ fontSize: 'clamp(0.6rem,2.5vw,1rem)' }}>
                <b className="text-[var(--gold)] font-bold">B</b> - Follow the dragon into the dark
              </p>
            </div>
            <p className="text-[var(--cream-dim)]" style={{ fontSize: 'clamp(0.7rem,1.4vw,0.875rem)' }}>
              Reply <b className="text-[var(--cream)] font-semibold">A</b> or <b className="text-[var(--cream)] font-semibold">B</b> to continue.
            </p>
          </div>
        </div>

        <div className="rounded-lg overflow-hidden" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(245,196,94,.25)' }}>
          <div className="flex items-center gap-2 px-4 py-2 border-b border-white/[0.08] text-xs text-[var(--cream-dim)]" style={{ background: 'rgba(0,0,0,.1)' }}>
            <span className="text-[var(--gold)] text-base">↩</span>
            <span>Reply</span>
          </div>
          <div className="px-4 py-3 min-h-[50px] flex items-start text-sm leading-[1.5] text-[var(--cream)]">
            <span>{replyText}</span>
            {showCaret && <span className="inline-block w-0.5 h-4 bg-[var(--gold)] ml-px align-middle" style={{ animation: 'blink 1s step-end infinite' }} />}
          </div>
          <div className="flex items-center justify-end px-3 py-2.5 border-t border-white/[0.08]" style={{ background: 'rgba(0,0,0,.15)' }}>
            <button
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border-none font-bold text-xs cursor-pointer transition-all duration-[120ms] ${isSent ? 'bg-[rgba(245,196,94,.16)] text-[var(--gold)] shadow-none cursor-default' : 'text-[var(--night-1)]'}`}
              style={{
                fontFamily: 'var(--body)',
                background: isSent ? 'rgba(245,196,94,.16)' : 'linear-gradient(135deg,var(--gold-lt),var(--gold-deep))',
                boxShadow: isSent ? 'none' : '0 4px 12px var(--amber-glow)',
                transitionTimingFunction: 'var(--ease)'
              }}
            >
              {isSent ? 'Sent' : 'Send'} <span className="text-xs">{isSent ? '✓' : '➤'}</span>
            </button>
          </div>
        </div>
        <div className={`mt-3 text-center italic min-h-[16px] transition-opacity duration-[450ms] ${showSentMsg ? 'opacity-100' : 'opacity-0'}`} style={{
          fontFamily: 'var(--display)',
          transitionTimingFunction: 'var(--ease)'
        }}>
          <span className="inline-grid place-items-center w-4 h-4 rounded-full bg-[var(--gold)] text-[var(--night-1)] text-[10px] font-bold mr-1.5 align-middle">✓</span>
          <span className="whitespace-nowrap" style={{ fontSize: 'clamp(0.65rem,1.2vw,0.75rem)' }}>Sent! Allie's next chapter arrives tomorrow 🌙</span>
        </div>
      </div>
    </div>
  );
}

// Social Proof Section
function SocialProof() {
  return (
    <section className="py-[94px] px-7 max-w-[1120px] mx-auto">
      <div className="grid grid-cols-3 gap-[22px] max-[900px]:grid-cols-1">
        <RevealCard>
          <div className="text-[var(--gold)] text-[0.95rem] tracking-[0.18em] mb-4">★★★★★</div>
          <p className="text-[1.1rem] leading-[1.55] italic text-[var(--cream)]" style={{ fontFamily: 'var(--display)' }}>
            "My daughter asks every night if her next NightlyQuest chapter has arrived."
          </p>
        </RevealCard>
        <RevealCard>
          <div className="text-[var(--gold)] text-[0.95rem] tracking-[0.18em] mb-4">★★★★★</div>
          <p className="text-[1.1rem] leading-[1.55] italic text-[var(--cream)]" style={{ fontFamily: 'var(--display)' }}>
            "The coolest part is that the story remembers things from months ago."
          </p>
        </RevealCard>
        <RevealCard>
          <div className="text-[var(--gold)] text-[0.95rem] tracking-[0.18em] mb-4">★★★★★</div>
          <p className="text-[1.1rem] leading-[1.55] italic text-[var(--cream)]" style={{ fontFamily: 'var(--display)' }}>
            "It became our favorite bedtime ritual."
          </p>
        </RevealCard>
      </div>
    </section>
  );
}

function RevealCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`rounded-[18px] px-[30px] py-8 transition-all duration-[350ms] relative overflow-hidden hover:-translate-y-1.5 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[30px]'}`}
      style={{
        background: 'linear-gradient(165deg, rgba(255,255,255,.055), rgba(255,255,255,.012))',
        border: '1px solid rgba(255,255,255,.08)',
        transitionTimingFunction: 'var(--ease)'
      }}
    >
      <div className="absolute -top-2.5 right-4.5 text-[5rem] leading-none text-[var(--gold)] opacity-[0.12]" style={{ fontFamily: 'var(--display)' }}>"</div>
      {children}
    </div>
  );
}

// Email Native Section
function EmailNativeSection() {
  return (
    <section className="py-24 px-7 max-w-[1200px] mx-auto">
      <div className="grid grid-cols-2 gap-16 items-center max-[900px]:grid-cols-1 max-[900px]:gap-12">
        <RevealDiv>
          <span className="block text-sm tracking-[0.24em] uppercase text-[var(--lavender)] font-semibold mb-6">No app required</span>
          <h2 className="mb-6 font-medium leading-[1.15] tracking-tight" style={{ fontFamily: 'var(--display)', fontSize: 'clamp(2.25rem,4.5vw,3.5rem)' }}>
            It all happens<br />
            <em className="italic bg-gradient-to-br from-[var(--gold-lt)] via-[var(--gold)] to-[var(--gold-deep)] bg-clip-text text-transparent">in your inbox</em>
          </h2>
          <p className="text-[var(--cream-dim)] leading-relaxed mb-10" style={{ fontSize: 'clamp(1rem,2vw,1.25rem)' }}>
            <span className="inline max-[680px]:block">No app to download.</span>{' '}
            <span className="inline max-[680px]:block">No account to log into.</span> No glowing tablet in their hands at bedtime. Just open your email and the next chapter's waiting.
          </p>
          <div className="flex flex-col gap-6">
            <div className="flex gap-5">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl grid place-items-center text-2xl" style={{ background: 'rgba(245,196,94,.12)', border: '1px solid rgba(245,196,94,.25)' }}>📥</div>
              <div>
                <h4 className="font-semibold mb-2 text-sm sm:text-base" style={{ fontFamily: 'var(--display)' }}>Lives where you already are</h4>
                <p className="text-base text-[var(--cream-dim)] leading-relaxed">Every chapter arrives in the inbox you check daily. Nothing new to install, update, or remember.</p>
              </div>
            </div>
            <div className="flex gap-5">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl grid place-items-center text-2xl" style={{ background: 'rgba(245,196,94,.12)', border: '1px solid rgba(245,196,94,.25)' }}>↩️</div>
              <div>
                <h4 className="font-semibold mb-2 text-sm sm:text-base" style={{ fontFamily: 'var(--display)' }}>Reply to choose the path</h4>
                <p className="text-base text-[var(--cream-dim)] leading-relaxed">Your child decides what happens next. You just hit reply and type A or B, the most natural interaction there is.</p>
              </div>
            </div>
            <div className="flex gap-5">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl grid place-items-center text-2xl" style={{ background: 'rgba(245,196,94,.12)', border: '1px solid rgba(245,196,94,.25)' }}>💤</div>
              <div>
                <h4 className="font-semibold mb-2 text-sm sm:text-base" style={{ fontFamily: 'var(--display)' }}>Read it your way</h4>
                <p className="text-base text-[var(--cream-dim)] leading-relaxed">Read it aloud from your phone, or print the chapter and put the screen away entirely.</p>
              </div>
            </div>
            <div className="flex gap-5">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl grid place-items-center text-2xl" style={{ background: 'rgba(245,196,94,.12)', border: '1px solid rgba(245,196,94,.25)' }}>📱</div>
              <div>
                <h4 className="font-semibold mb-2 text-sm sm:text-base" style={{ fontFamily: 'var(--display)' }}>Works on everything</h4>
                <p className="text-base text-[var(--cream-dim)] leading-relaxed">Any phone, tablet, or computer. No app store, no downloads, no compatibility headaches.</p>
              </div>
            </div>
          </div>
        </RevealDiv>
        <InboxMockup />
      </div>
    </section>
  );
}

function InboxMockup() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`rounded-[20px] overflow-hidden transition-all duration-[900ms] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[30px]'}`}
      style={{
        background: 'linear-gradient(165deg, rgba(255,255,255,.07), rgba(255,255,255,.02))',
        border: '1px solid rgba(255,255,255,.1)',
        boxShadow: '0 34px 80px rgba(0,0,0,.45)',
        transitionTimingFunction: 'var(--ease)'
      }}
    >
      <div className="flex items-center gap-2 px-5 py-4 border-b border-white/[0.08]" style={{ background: 'rgba(255,255,255,.03)' }}>
        <span className="w-2.5 h-2.5 rounded-full bg-[#ff6058]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#28ca42]" />
        <span className="ml-2.5 text-[0.82rem] text-[var(--cream-dim)] tracking-[0.04em]">Inbox</span>
      </div>
      <div className="flex gap-3.5 px-5 py-4.5 border-b border-white/[0.06] items-start transition-all duration-[250ms]" style={{ background: 'rgba(245,196,94,.07)' }}>
        <div className="flex-shrink-0 w-[38px] h-[38px] rounded-full grid place-items-center text-base text-[var(--night-1)] font-bold" style={{ background: 'linear-gradient(135deg,var(--gold-lt),var(--gold-deep))' }}>✦</div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between gap-2.5 mb-0.5">
            <span className="text-[0.92rem] font-semibold text-[var(--cream)]">NightlyQuest</span>
            <span className="text-[0.78rem] text-[var(--cream-dim)] flex-shrink-0">7:30 PM</span>
          </div>
          <div className="text-[0.9rem] text-[var(--cream)] font-semibold whitespace-nowrap overflow-hidden text-ellipsis">🐉 Chapter 14 · Allie's Quest is here</div>
          <div className="text-[0.82rem] text-[var(--cream-dim)] opacity-75 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">The trail climbed higher than Allie had ever dared…</div>
        </div>
        <span className="w-2 h-2 rounded-full bg-[var(--gold)] flex-shrink-0 mt-1.5" style={{ boxShadow: '0 0 8px var(--gold)' }} />
      </div>
      <div className="flex gap-3.5 px-5 py-4.5 border-b border-white/[0.06] items-start transition-all duration-[250ms] opacity-50">
        <div className="flex-shrink-0 w-[38px] h-[38px] rounded-full grid place-items-center text-base text-[var(--cream-dim)] font-bold" style={{ background: 'rgba(255,255,255,.12)' }}>✦</div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between gap-2.5 mb-0.5">
            <span className="text-[0.92rem] font-semibold text-[var(--cream)]">NightlyQuest</span>
            <span className="text-[0.78rem] text-[var(--cream-dim)] flex-shrink-0">Yesterday</span>
          </div>
          <div className="text-[0.9rem] text-[var(--cream-dim)] whitespace-nowrap overflow-hidden text-ellipsis">Chapter 13 · The Frozen Waterfall</div>
          <div className="text-[0.82rem] text-[var(--cream-dim)] opacity-75 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">You chose to follow the dragon. So that's exactly what happened…</div>
        </div>
      </div>
      <div className="flex gap-3.5 px-5 py-4.5 items-start transition-all duration-[250ms] opacity-50">
        <div className="flex-shrink-0 w-[38px] h-[38px] rounded-full grid place-items-center text-base text-[var(--cream-dim)] font-bold" style={{ background: 'rgba(255,255,255,.12)' }}>✦</div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between gap-2.5 mb-0.5">
            <span className="text-[0.92rem] font-semibold text-[var(--cream)]">NightlyQuest</span>
            <span className="text-[0.78rem] text-[var(--cream-dim)] flex-shrink-0">Tuesday</span>
          </div>
          <div className="text-[0.9rem] text-[var(--cream-dim)] whitespace-nowrap overflow-hidden text-ellipsis">Chapter 12 · A Friend in the Woods</div>
          <div className="text-[0.82rem] text-[var(--cream-dim)] opacity-75 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">The little fox couldn't see, but somehow, it knew Allie was kind…</div>
        </div>
      </div>
    </div>
  );
}

function RevealDiv({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-[900ms] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[30px]'}`}
      style={{ transitionTimingFunction: 'var(--ease)' }}
    >
      {children}
    </div>
  );
}

// How It Works Section
function HowItWorksSection() {
  return (
    <section className="py-24 px-7 max-w-[1200px] mx-auto relative" style={{ zIndex: 2 }} id="how">
      <div className="text-center max-w-[800px] mx-auto mb-16">
        <RevealDiv>
          <span className="block text-sm tracking-[0.24em] uppercase text-[var(--lavender)] font-semibold mb-6">How it works</span>
          <h2 className="font-medium leading-[1.15] tracking-tight px-4" style={{ fontFamily: 'var(--display)', fontSize: 'clamp(1.8rem,5.5vw,3.5rem)' }}>
            <span className="inline max-[700px]:block">Four steps to an adventure</span>{' '}
            <span className="inline max-[700px]:block">that's <em className="italic bg-gradient-to-br from-[var(--gold-lt)] via-[var(--gold)] to-[var(--gold-deep)] bg-clip-text text-transparent">theirs alone</em></span>
          </h2>
        </RevealDiv>
      </div>
      <div className="grid grid-cols-4 gap-6 max-[900px]:grid-cols-2 max-[520px]:grid-cols-1">
        <StepCard num="01" title="Create their hero" description="Tell us a few things about your child: their favorite things, the adventures they dream about, and their comprehension level." />
        <StepCard num="02" title="The next chapter arrives" titleBreak="next" description="Every evening, the next chapter of your child's ongoing quest lands in your inbox, picking up right where last night ended." />
        <StepCard num="03" title="Make a choice" description="At the end of each chapter, your child chooses what happens next. Reply A or B, and tomorrow's story continues." />
        <StepCard
          num="04"
          title="Watch their world grow"
          titleBreak="their"
          description="The story remembers:"
          items={['Friends they meet', 'Lessons they learn', 'Places they explore', 'Creatures they rescue', 'Choices they make']}
        />
      </div>
    </section>
  );
}

function StepCard({ num, title, titleBreak, description, items }: { num: string; title: string; titleBreak?: string; description: string; items?: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`rounded-2xl px-7 py-10 transition-all duration-[350ms] hover:-translate-y-[7px] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[30px]'}`}
      style={{
        background: 'linear-gradient(165deg, rgba(255,255,255,.06), rgba(255,255,255,.015))',
        border: '1px solid rgba(255,255,255,.08)',
        transitionTimingFunction: 'var(--ease)'
      }}
    >
      <div className="italic text-5xl text-[var(--gold)] opacity-50 leading-none mb-4" style={{ fontFamily: 'var(--display)' }}>{num}</div>
      <h3 className="font-semibold mb-3" style={{ fontFamily: 'var(--display)', fontSize: 'clamp(0.9rem,3.5vw,1.5rem)' }}>
        {titleBreak ? (
          <>
            <span className="inline max-[580px]:block">{title.split(titleBreak)[0] + titleBreak}</span>{' '}
            <span className="inline max-[580px]:block">{title.split(titleBreak)[1]}</span>
          </>
        ) : title}
      </h3>
      <p className="text-base text-[var(--cream-dim)] leading-relaxed">{description}</p>
      {items && (
        <ul className="list-none mt-4">
          {items.map((item, i) => (
            <li key={i} className="text-base text-[var(--cream)] py-2 pl-7 relative before:content-['✓'] before:absolute before:left-0 before:text-[var(--gold)]">
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Difference Section
function DifferenceSection() {
  return (
    <section className="py-24 px-7 max-w-[1200px] mx-auto">
      <div className="text-center max-w-[800px] mx-auto mb-16">
        <RevealDiv>
          <span className="block text-sm tracking-[0.24em] uppercase text-[var(--lavender)] font-semibold mb-6">Why NightlyQuest is different</span>
          <h2 className="font-medium leading-[1.15] tracking-tight" style={{ fontFamily: 'var(--display)', fontSize: 'clamp(1.8rem,4vw,3rem)' }}>
            <span className="inline-block max-[700px]:block">Other apps forget by morning.</span>{' '}
            <span className="inline-block max-[700px]:block">NightlyQuest <em className="italic bg-gradient-to-br from-[var(--gold-lt)] via-[var(--gold)] to-[var(--gold-deep)] bg-clip-text text-transparent">never forgets a chapter.</em></span>
          </h2>
        </RevealDiv>
      </div>
      <div className="grid grid-cols-[1.05fr_1fr] gap-16 items-center max-[900px]:grid-cols-1 max-[900px]:gap-12">
        <RevealDiv>
          <p className="text-[var(--cream-dim)] text-base sm:text-xl mb-6 leading-relaxed">
            Most story apps spit out generic, forgettable stories with no real connection to your child. Nothing more than story generators.
          </p>
          <div className="flex items-center gap-4 my-8">
            <span className="text-xs tracking-[0.14em] uppercase font-bold px-4 py-2 rounded-full flex-shrink-0 bg-white/[0.06] border border-white/[0.15] text-[var(--cream-dim)]">Them</span>
            <span className="text-[var(--cream-dim)] text-base">Forgettable story every night</span>
          </div>
          <div className="flex items-center gap-4 my-8">
            <span className="text-xs tracking-[0.14em] uppercase font-bold px-4 py-2 rounded-full flex-shrink-0 text-[var(--gold)]" style={{ background: 'rgba(245,196,94,.15)', border: '1px solid rgba(245,196,94,.4)' }}>Us</span>
            <span className="text-[var(--cream)] text-base">One continuous saga that remembers everything</span>
          </div>
          <p className="text-[var(--cream-dim)] text-base sm:text-xl leading-relaxed">
            NightlyQuest writes an <strong className="text-[var(--cream)] font-semibold">evolving quest</strong> starring your child. Every choice carries forward. The friend they make in Chapter 3 returns in Chapter 67. The dragon they rescue still remembers their name. <span className="text-[var(--lavender)] italic" style={{ fontFamily: 'var(--display)' }}>It isn't a story generator. It's their quest, growing for years.</span>
          </p>
        </RevealDiv>
        <JournalCard />
      </div>
    </section>
  );
}

function JournalCard() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`rounded-[20px] px-[34px] py-8 relative transition-all duration-[900ms] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[30px]'}`}
      style={{
        background: 'linear-gradient(165deg, rgba(255,253,247,.07), rgba(255,255,255,.02))',
        border: '1px solid rgba(245,196,94,.22)',
        boxShadow: '0 30px 70px rgba(0,0,0,.4)',
        transitionTimingFunction: 'var(--ease)'
      }}
    >
      <div className="absolute -top-[18px] left-[30px] w-10 h-10 rounded-full grid place-items-center text-[1.1rem]" style={{
        background: 'linear-gradient(135deg,var(--gold-lt),var(--gold-deep))',
        boxShadow: '0 8px 22px var(--amber-glow)'
      }}>📖</div>
      <div className="text-[0.78rem] tracking-[0.14em] uppercase text-[var(--gold)] font-semibold mb-5 flex items-center gap-2.5">
        Allie's quest · Chapter 14
        <span className="flex-1 h-px bg-gradient-to-r from-[rgba(245,196,94,.4)] to-transparent" />
      </div>
      <div className="flex gap-3.5 py-3 border-b border-white/[0.07] text-[1.02rem] leading-[1.45] text-[var(--cream)]" style={{ fontFamily: 'var(--display)' }}>
        <span className="flex-shrink-0 text-[1.15rem] leading-[1.3]">🐉</span>
        <div>Rescued a baby dragon, now her loyal companion <span className="text-[var(--lavender)] italic text-[0.86rem]">· Chapter 6</span></div>
      </div>
      <div className="flex gap-3.5 py-3 border-b border-white/[0.07] text-[1.02rem] leading-[1.45] text-[var(--cream)]" style={{ fontFamily: 'var(--display)' }}>
        <span className="flex-shrink-0 text-[1.15rem] leading-[1.3]">🦊</span>
        <div>Befriended a blind fox in the Whispering Woods <span className="text-[var(--lavender)] italic text-[0.86rem]">· Chapter 9</span></div>
      </div>
      <div className="flex gap-3.5 py-3 border-b border-white/[0.07] text-[1.02rem] leading-[1.45] text-[var(--cream)]" style={{ fontFamily: 'var(--display)' }}>
        <span className="flex-shrink-0 text-[1.15rem] leading-[1.3]">🗝️</span>
        <div>Kept the golden key when everyone said to leave it <span className="text-[var(--lavender)] italic text-[0.86rem]">· Chapter 11</span></div>
      </div>
      <div className="flex gap-3.5 py-3 text-[1.02rem] leading-[1.45] text-[var(--cream)]" style={{ fontFamily: 'var(--display)' }}>
        <span className="flex-shrink-0 text-[1.15rem] leading-[1.3]">🌟</span>
        <div>Becoming the kind of hero who chooses kindness over power</div>
      </div>
      <div className="mt-4.5 pt-4 border-t border-dashed border-[rgba(245,196,94,.3)] italic text-[var(--gold)] text-base flex gap-2.5 items-baseline" style={{ fontFamily: 'var(--display)' }}>
        <span className="flex-shrink-0">↪</span>
        <span>Tonight, the dragon leads her to the mountain she's never dared to climb…</span>
      </div>
    </div>
  );
}

// Discovery Section
function DiscoverySection() {
  return (
    <section className="py-24 px-7 max-w-[1200px] mx-auto">
      <RevealDiv>
        <div className="rounded-[26px] px-[50px] py-[50px] text-center relative overflow-hidden max-[900px]:px-9 max-[900px]:py-9" style={{
          background: 'linear-gradient(165deg, rgba(42,52,112,.42), rgba(13,21,56,.42))',
          border: '1px solid rgba(188,185,236,.22)'
        }}>
          <div className="absolute -top-[60px] -right-10 w-[200px] h-[200px] rounded-full" style={{
            background: 'radial-gradient(circle,rgba(245,196,94,.12),transparent 70%)'
          }} />
          <span className="block text-[0.76rem] tracking-[0.24em] uppercase text-[var(--lavender)] font-semibold mb-4 relative">Personality discovery</span>
          <h2 className="mb-4.5 relative font-medium leading-[1.12] tracking-[-0.4px]" style={{ fontFamily: 'var(--display)', fontSize: 'clamp(2rem,4vw,3rem)' }}>
            The story <em className="italic bg-gradient-to-br from-[var(--gold-lt)] via-[var(--gold)] to-[var(--gold-deep)] bg-clip-text text-transparent">learns from your child</em>
          </h2>
          <p className="text-[var(--cream-dim)] text-[1.08rem] max-w-[570px] mx-auto mb-9 relative">
            Along the way, they'll answer thoughtful questions that shape future adventures, and over time, the story adapts to their imagination, interests, and personality.
          </p>
          <div className="flex flex-col gap-3.5 max-w-[560px] mx-auto relative">
            <div className="rounded-[14px] px-[26px] py-5 italic text-[1.1rem] text-[var(--cream)] text-left flex items-center gap-3.5 transition-all duration-[300ms] hover:translate-x-1.5" style={{
              fontFamily: 'var(--display)',
              background: 'rgba(6,10,28,.55)',
              border: '1px solid rgba(188,185,236,.25)',
              transitionTimingFunction: 'var(--ease)'
            }}>
              <span className="text-[var(--gold)] text-[1.8rem] flex-shrink-0 leading-none translate-y-2" style={{ fontFamily: 'var(--display)' }}>"</span>
              What would you do if your friend was scared?
            </div>
            <div className="rounded-[14px] px-[26px] py-5 italic text-[1.1rem] text-[var(--cream)] text-left flex items-center gap-3.5 transition-all duration-[300ms] hover:translate-x-1.5" style={{
              fontFamily: 'var(--display)',
              background: 'rgba(6,10,28,.55)',
              border: '1px solid rgba(188,185,236,.25)',
              transitionTimingFunction: 'var(--ease)'
            }}>
              <span className="text-[var(--gold)] text-[1.8rem] flex-shrink-0 leading-none translate-y-2" style={{ fontFamily: 'var(--display)' }}>"</span>
              Would you rather explore somewhere new or master a skill?
            </div>
            <div className="rounded-[14px] px-[26px] py-5 italic text-[1.1rem] text-[var(--cream)] text-left flex items-center gap-3.5 transition-all duration-[300ms] hover:translate-x-1.5" style={{
              fontFamily: 'var(--display)',
              background: 'rgba(6,10,28,.55)',
              border: '1px solid rgba(188,185,236,.25)',
              transitionTimingFunction: 'var(--ease)'
            }}>
              <span className="text-[var(--gold)] text-[1.8rem] flex-shrink-0 leading-none translate-y-2" style={{ fontFamily: 'var(--display)' }}>"</span>
              What are you proud of today?
            </div>
          </div>
        </div>
      </RevealDiv>
    </section>
  );
}

// Keepsake Section
function KeepsakeSection() {
  return (
    <section className="py-24 px-7 max-w-[1200px] mx-auto">
      <div className="grid grid-cols-2 gap-[50px] items-center max-[900px]:grid-cols-1 max-[900px]:gap-[34px]">
        <RevealDiv>
          <span className="block text-[0.76rem] tracking-[0.24em] uppercase text-[var(--lavender)] font-semibold mb-4">The keepsake</span>
          <h2 className="mb-[26px] font-medium leading-[1.12] tracking-[-0.4px]" style={{ fontFamily: 'var(--display)', fontSize: 'clamp(2rem,4vw,3rem)' }}>
            A memory you<br />
            can <em className="italic bg-gradient-to-br from-[var(--gold-lt)] via-[var(--gold)] to-[var(--gold-deep)] bg-clip-text text-transparent">hold onto</em>
          </h2>
          <ul className="list-none">
            <li className="text-[1.28rem] text-[var(--cream)] py-4 border-b border-white/[0.08] flex gap-4 items-baseline" style={{ fontFamily: 'var(--display)' }}>
              <span className="text-[var(--gold)] italic flex-shrink-0 w-32">One month</span>
              becomes a story.
            </li>
            <li className="text-[1.28rem] text-[var(--cream)] py-4 border-b border-white/[0.08] flex gap-4 items-baseline" style={{ fontFamily: 'var(--display)' }}>
              <span className="text-[var(--gold)] italic flex-shrink-0 w-32">Six months</span>
              becomes a world.
            </li>
            <li className="text-[1.28rem] text-[var(--cream)] py-4 border-b border-white/[0.08] flex gap-4 items-baseline" style={{ fontFamily: 'var(--display)' }}>
              <span className="text-[var(--gold)] italic flex-shrink-0 w-32">One year</span>
              becomes a bookshelf memory.
            </li>
          </ul>
        </RevealDiv>
        <KeepBox />
      </div>
    </section>
  );
}

function KeepBox() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`rounded-[20px] px-9 py-9 transition-all duration-[900ms] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[30px]'}`}
      style={{
        background: 'linear-gradient(165deg, rgba(255,255,255,.065), rgba(255,255,255,.015))',
        border: '1px solid rgba(245,196,94,.22)',
        boxShadow: '0 24px 60px rgba(0,0,0,.3)',
        transitionTimingFunction: 'var(--ease)'
      }}
    >
      <h3 className="font-semibold text-[1.3rem] mb-5" style={{ fontFamily: 'var(--display)' }}>
        At the end of every completed adventure, receive:
      </h3>
      <ul className="list-none">
        <li className="text-base py-2.5 pl-[30px] relative text-[var(--cream)] before:content-['✓'] before:absolute before:left-0 before:text-[var(--gold)] before:font-bold">
          Print-ready PDF
        </li>
        <li className="text-base py-2.5 pl-[30px] relative text-[var(--cream)] before:content-['✓'] before:absolute before:left-0 before:text-[var(--gold)] before:font-bold">
          Adventure timeline
        </li>
        <li className="text-base py-2.5 pl-[30px] relative text-[var(--cream)] before:content-['✓'] before:absolute before:left-0 before:text-[var(--gold)] before:font-bold">
          A portrait of the hero they've become
        </li>
        <li className="text-base py-2.5 pl-[30px] relative text-[var(--cream)] before:content-['✓'] before:absolute before:left-0 before:text-[var(--gold)] before:font-bold">
          Every major choice preserved
        </li>
      </ul>
      <p className="mt-5 pt-4.5 border-t border-white/[0.08] text-[0.92rem] text-[var(--lavender)] italic" style={{ fontFamily: 'var(--display)' }}>
        Premium members receive printed hardcover editions delivered to their home.
      </p>
    </div>
  );
}

// Pricing Section
function PricingSection({ onSelectTier }: { onSelectTier: (tier: 'trial' | 'adventurer' | 'legendary') => void }) {
  return (
    <section className="py-24 px-7 max-w-[1200px] mx-auto" id="pricing">
      <div className="text-center max-w-[800px] mx-auto mb-16">
        <RevealDiv>
          <span className="block text-sm tracking-[0.24em] uppercase text-[var(--lavender)] font-semibold mb-6">Pricing</span>
          <h2 className="mb-6 font-medium leading-[1.15] tracking-tight" style={{ fontFamily: 'var(--display)', fontSize: 'clamp(2.25rem,4.5vw,3.5rem)' }}>
            <span className="inline-block max-[580px]:block">Your first</span>{' '}
            <span className="inline-block max-[580px]:block"><em className="italic bg-gradient-to-br from-[var(--gold-lt)] via-[var(--gold)] to-[var(--gold-deep)] bg-clip-text text-transparent">7 nights are free</em></span>
          </h2>
          <p className="text-[var(--cream-dim)] mt-6 leading-relaxed px-4" style={{ fontSize: 'clamp(0.9rem,2.5vw,1.25rem)' }}>
            <span className="inline max-[720px]:block">A full week of nightly chapters, on us.</span>{' '}
            <span className="inline max-[720px]:block">No credit card, no commitment.</span>
          </p>
        </RevealDiv>
      </div>
      <div className="grid grid-cols-3 gap-6 items-stretch max-[900px]:grid-cols-1 max-[900px]:max-w-[430px] max-[900px]:mx-auto">
        <TierCard
          name="Free Trial"
          price="Free"
          period=" 7 nights"
          trial="No credit card, no catch"
          items={['A new chapter every night', 'Your child as the hero', 'Choose-your-own-adventure', 'A quest that remembers']}
          cta="Start Free Trial"
          onSelect={() => onSelectTier('trial')}
        />
        <TierCard
          name="Adventurer"
          price="$9"
          period="/month"
          trial="The full nightly quest"
          items={['~30 personalized chapters every month', 'Grows richer over months and years', 'New arcs and new worlds, unlimited', 'Print-ready PDF keepsakes']}
          cta="Go Adventure"
          featured
          onSelect={() => onSelectTier('adventurer')}
        />
        <TierCard
          name="Legendary"
          price="$19"
          period="/month"
          plus="Everything in Adventurer, plus:"
          items={['Collectibles & Visual Keepsakes', 'Personalized cover art of their hero', 'Multi-children (each kid their own saga)', 'A free hardcover keepsake after a year']}
          cta="Become Legendary"
          onSelect={() => onSelectTier('legendary')}
        />
      </div>
    </section>
  );
}

function TierCard({ name, price, period, trial, plus, items, cta, featured, onSelect }: {
  name: string;
  price: string;
  period: string;
  trial?: string;
  plus?: string;
  items: string[];
  cta: string;
  featured?: boolean;
  onSelect?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`rounded-[20px] px-[30px] py-[38px] flex flex-col relative transition-all duration-[350ms] ${featured ? 'scale-[1.03] max-[900px]:scale-100' : ''} hover:-translate-y-[7px] ${featured ? 'hover:scale-[1.03]' : ''} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[30px]'}`}
      style={{
        background: featured ? 'linear-gradient(165deg, rgba(245,196,94,.13), rgba(245,196,94,.03))' : 'linear-gradient(165deg, rgba(255,255,255,.055), rgba(255,255,255,.015))',
        border: featured ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,.08)',
        boxShadow: featured ? '0 24px 65px var(--amber-glow)' : 'none',
        transitionTimingFunction: 'var(--ease)'
      }}
    >
      {featured && (
        <div className="absolute -top-[13px] left-1/2 -translate-x-1/2 text-[0.72rem] font-bold tracking-[0.1em] uppercase px-4.5 py-1.5 rounded-full whitespace-nowrap text-[var(--night-1)]" style={{
          background: 'linear-gradient(135deg,var(--gold-lt),var(--gold-deep))',
          boxShadow: '0 6px 18px var(--amber-glow)'
        }}>
          Most Popular
        </div>
      )}
      <div className="font-semibold text-[1.5rem] mb-2" style={{ fontFamily: 'var(--display)' }}>{name}</div>
      <div className="text-[2.7rem] font-medium leading-none mb-1.5" style={{ fontFamily: 'var(--display)' }}>
        {price}
        <span className="text-base text-[var(--cream-dim)]" style={{ fontFamily: 'var(--body)' }}>{period}</span>
      </div>
      {trial && <p className="text-[0.85rem] text-[var(--gold)] font-semibold mb-5.5">{trial}</p>}
      {plus && <p className="text-[0.85rem] text-[var(--lavender)] italic pl-0 mb-2" style={{ fontFamily: 'var(--display)' }}>{plus}</p>}
      <ul className="list-none mb-[30px] flex-1">
        {items.map((item, i) => (
          <li key={i} className="py-2.5 pl-7 relative text-[var(--cream)] before:content-['✓'] before:absolute before:left-0 before:text-[var(--gold)] before:font-bold whitespace-nowrap" style={{ fontSize: 'clamp(0.75rem,1.6vw,0.95rem)' }}>
            {item.includes('every night') ? (
              <>
                A new chapter <b className="font-bold">every night</b>
              </>
            ) : item}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onSelect}
        className={`relative w-full text-center font-semibold px-[15px] py-[15px] rounded-full border transition-all duration-[250ms] overflow-hidden cursor-pointer ${featured ? 'text-[var(--night-1)] hover:brightness-[1.07]' : 'text-[var(--cream)] hover:bg-[rgba(245,196,94,.12)]'}`}
        style={{
          background: featured ? 'linear-gradient(135deg,var(--gold-lt),var(--gold-deep))' : 'transparent',
          borderColor: featured ? 'var(--gold)' : 'rgba(245,196,94,.4)'
        }}
      >
        {cta}
      </button>
    </div>
  );
}

// FAQ Section
function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    { q: "Do I need a credit card to start?", a: "Nope. Start your 7-day free trial with just an email. Full nightly access, no card, no commitment. Subscribe only if your child wants to keep going." },
    { q: "How long are the stories?", a: "Each chapter takes roughly 5–10 minutes to read aloud." },
    { q: "Do I need an app?", a: "No. Everything happens through email." },
    { q: "What if we miss a night?", a: "The adventure waits. We'll send gentle reminders until you're ready to continue." },
    { q: "Can I have multiple children?", a: "Yes, the Legendary tier allows for up to 3 children." },
    { q: "What if we don't like where the story went?", a: "Just reply \"reroll\" and we'll write a fresh chapter to replace it, as many times as it takes. Only the chapter you keep becomes part of their saga." },
    { q: "What ages is it for?", a: "Designed for ages 0–12, from Baby & Toddler all the way up to Big Kids. Every story is tailored to your child's comprehension level." }
  ];

  return (
    <section className="py-24 px-7 max-w-[1200px] mx-auto" id="faq">
      <div className="text-center max-w-[800px] mx-auto mb-16">
        <RevealDiv>
          <span className="block text-sm tracking-[0.24em] uppercase text-[var(--lavender)] font-semibold mb-6">Questions</span>
          <h2 className="font-medium leading-[1.15] tracking-tight" style={{ fontFamily: 'var(--display)', fontSize: 'clamp(2.25rem,4.5vw,3.5rem)' }}>
            Everything you might <em className="italic bg-gradient-to-br from-[var(--gold-lt)] via-[var(--gold)] to-[var(--gold-deep)] bg-clip-text text-transparent">wonder</em>
          </h2>
        </RevealDiv>
      </div>
      <div className="max-w-[800px] mx-auto">
        <RevealDiv>
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-white/[0.1]">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full text-left bg-transparent border-none text-[var(--cream)] text-2xl font-medium px-0 pr-14 py-7 cursor-pointer relative transition-colors duration-200 hover:text-[var(--gold)]"
                style={{ fontFamily: 'var(--display)' }}
              >
                {faq.q}
                <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-[var(--gold)] text-3xl transition-transform duration-[350ms] ${openIndex === i ? 'rotate-[135deg]' : ''}`} style={{ transitionTimingFunction: 'var(--ease)' }}>+</span>
              </button>
              <div
                className="overflow-hidden transition-all duration-[400ms] text-[var(--cream-dim)] text-lg leading-relaxed"
                style={{
                  maxHeight: openIndex === i ? '250px' : '0',
                  paddingBottom: openIndex === i ? '28px' : '0',
                  transitionTimingFunction: 'var(--ease)'
                }}
              >
                {faq.a}
              </div>
            </div>
          ))}
        </RevealDiv>
      </div>
    </section>
  );
}

// Closer Section
function CloserSection({ onStartFree }: { onStartFree: () => void }) {
  return (
    <section className="text-center px-7 py-32 relative">
      <RevealDiv>
        <h2 className="max-w-[900px] mx-auto mb-8 font-medium leading-[1.15] tracking-tight px-4" style={{ fontFamily: 'var(--display)', fontSize: 'clamp(1.5rem,7vw,4.25rem)' }}>
          <span className="inline max-[680px]:block">Every child deserves a story</span>{' '}
          <span className="inline max-[680px]:block">where they're <em className="italic bg-gradient-to-br from-[var(--gold-lt)] via-[var(--gold)] to-[var(--gold-deep)] bg-clip-text text-transparent">the hero.</em></span>
        </h2>
      </RevealDiv>
      <RevealDiv>
        <p className="text-[var(--cream-dim)] mb-12 leading-relaxed" style={{ fontSize: 'clamp(1rem,2vw,1.25rem)' }}>
          <span className="inline max-[700px]:block">Join families building adventures</span>{' '}
          <span className="inline max-[700px]:block">that they'll remember for years.</span>
        </p>
      </RevealDiv>
      <RevealDiv>
        <div className="flex gap-4 justify-center max-w-[580px] mx-auto mb-6 max-[520px]:flex-col">
          <button
            onClick={onStartFree}
            className="relative inline-flex items-center justify-center gap-3 font-bold text-lg text-[var(--night-1)] px-10 py-4 rounded-full border-none cursor-pointer whitespace-nowrap overflow-hidden transition-all duration-[250ms] hover:-translate-y-[3px] hover:scale-[1.02] group"
            style={{
              fontFamily: 'var(--body)',
              background: 'linear-gradient(135deg,var(--gold-lt),var(--gold-deep))',
              boxShadow: '0 14px 40px var(--amber-glow)',
              transitionTimingFunction: 'var(--ease)'
            }}
          >
            <span className="absolute top-0 -left-[120%] w-[60%] h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -skew-x-12 transition-[left] duration-[600ms] group-hover:left-[130%]" style={{ transitionTimingFunction: 'var(--ease)' }} />
            Start Free Trial
            <span className="transition-transform duration-[250ms] group-hover:translate-x-1.5" style={{ transitionTimingFunction: 'var(--ease)' }}>→</span>
          </button>
        </div>
      </RevealDiv>
      <RevealDiv>
        <p className="italic text-[var(--gold)] mt-4 whitespace-nowrap" style={{ fontFamily: 'var(--display)', fontSize: 'clamp(1.2rem,2.2vw,1.5rem)' }}>
          The adventure begins tonight.
        </p>
      </RevealDiv>
    </section>
  );
}

// Footer
function Footer({ onAnalyticsClick, onAddChildClick }: { onAnalyticsClick: () => void; onAddChildClick: () => void }) {
  return (
    <footer className="border-t border-white/[0.08] py-16 text-center text-[var(--cream-dim)] text-base relative" style={{ zIndex: 2 }}>
      <div className="flex items-center justify-center gap-3 text-[var(--cream)] text-2xl mb-5" style={{ fontFamily: 'var(--display)', fontWeight: 600 }}>
        <span className="text-[var(--gold)] text-xl" style={{ animation: 'sparkle 3s ease-in-out infinite' }}>✦</span>
        NightlyQuest
      </div>
      <p style={{ fontSize: 'clamp(0.95rem,1.8vw,1.125rem)' }}>
        <span className="inline max-[650px]:block">Personalized bedtime adventures,</span>{' '}
        <span className="inline max-[650px]:block">delivered nightly.</span>
      </p>
      <p className="italic text-[var(--gold)] mt-3" style={{ fontFamily: 'var(--display)', fontSize: 'clamp(1rem,2vw,1.25rem)' }}>
        <span className="block">The magic is the mailbox.</span>
        <span className="block">The story is theirs, growing every night.</span>
      </p>
      <p className="text-sm text-[var(--cream-dim)] mt-8">
        © 2026 NightlyQuest. All rights reserved.
      </p>
      <div className="mt-4 flex items-center justify-center gap-6">
        <button
          onClick={onAddChildClick}
          className="text-xs text-[var(--gold)] opacity-60 hover:opacity-100 transition-opacity cursor-pointer bg-transparent border-none"
        >
          👑 Legendary: Add Another Child
        </button>
      </div>
    </footer>
  );
}

// Signup Modal
function SignupModal({ isOpen, onClose, tier = 'trial', initialEmail = '' }: { isOpen: boolean; onClose: () => void; tier?: 'trial' | 'adventurer' | 'legendary'; initialEmail?: string }) {
  const [email, setEmail] = useState(initialEmail);
  const [interests, setInterests] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState('');
  const [adventureType, setAdventureType] = useState<string[]>([]);
  const [customAdventure, setCustomAdventure] = useState('');
  const [readingLevel, setReadingLevel] = useState('');
  const [childName, setChildName] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('19:30');
  const [timezone, setTimezone] = useState('America/New_York');
  const [referralSource, setReferralSource] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showDuplicateEmail, setShowDuplicateEmail] = useState(false);

  const suggestedInterests = ['Dragons', 'Space', 'Animals', 'Magic', 'Ocean', 'Dinosaurs', 'Robots', 'Princesses', 'Knights', 'Science'];
  const suggestedAdventures = ['Fantasy', 'Sci-Fi', 'Mystery', 'Adventure', 'Magical Realism'];
  const readingLevels = [
    { value: '0-2', label: '0–2', sub: 'Baby & Toddler' },
    { value: '3-5', label: '3–5', sub: 'Little Listener' },
    { value: '6-8', label: '6–8', sub: 'Young Adventurer' },
    { value: '9-12', label: '9–12', sub: 'Big Kid' }
  ];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Initialize email from hero section if provided
      if (initialEmail) {
        setEmail(initialEmail);
      }
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialEmail]);

  const toggleInterest = (interest: string) => {
    setInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const addCustomInterest = () => {
    if (customInterest.trim() && !interests.includes(customInterest.trim())) {
      setInterests(prev => [...prev, customInterest.trim()]);
      setCustomInterest('');
    }
  };

  const toggleAdventureType = (type: string) => {
    setAdventureType(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const addCustomAdventure = () => {
    if (customAdventure.trim() && !adventureType.includes(customAdventure.trim())) {
      setAdventureType(prev => [...prev, customAdventure.trim()]);
      setCustomAdventure('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Get browser timezone
      const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // Map reading level to required format
      const mappedReadingLevel = readingLevel || '6-8';

      // Prepare request body
      const requestBody: Record<string, any> = {
        parent_email: email,
        child_name: childName,
        reading_level: mappedReadingLevel,
        timezone: browserTimezone,
        delivery_time: deliveryTime
      };

      // Add optional fields if they exist
      if (pronouns) {
        requestBody.pronouns = pronouns;
      }
      if (interests && interests.length > 0) {
        requestBody.interests = interests.join(', ');
      }
      if (adventureType && adventureType.length > 0) {
        requestBody.adventure_type = adventureType.join(', ');
      }
      if (referralSource) {
        requestBody.referral_source = referralSource;
      }

      const response = await fetch('https://hodngazgjsokcyrtbxkm.supabase.co/functions/v1/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'sb_publishable_sOYcevE0Ox5Fd4euBvBJgQ_V6ZzWetP'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (data.ok) {
        // Handle different tier flows
        if (tier === 'trial') {
          setSubmitSuccess(true);
          setShowConfirmation(true);
        } else if (tier === 'adventurer') {
          // Redirect to Stripe checkout for Adventurer plan
          const encodedEmail = encodeURIComponent(email);
          const baseUrl = 'https://buy.stripe.com/aFadR8eqndUH4vS1Qt5sA00';
          const separator = baseUrl.includes('?') ? '&' : '?';
          window.location.href = `${baseUrl}${separator}prefilled_email=${encodedEmail}`;
        } else if (tier === 'legendary') {
          // Redirect to Stripe checkout for Legendary plan
          const encodedEmail = encodeURIComponent(email);
          const baseUrl = 'https://buy.stripe.com/bJe8wOaa72bZ2nKcv75sA01';
          const separator = baseUrl.includes('?') ? '&' : '?';
          window.location.href = `${baseUrl}${separator}prefilled_email=${encodedEmail}`;
        }
      } else {
        const errMsg: string = data.error || '';
        const isDuplicate = /already exists|duplicate|already registered|email.*exist|exist.*email/i.test(errMsg) || response.status === 409 || response.status === 422;
        if (isDuplicate) {
          setShowDuplicateEmail(true);
        } else {
          setSubmitError(errMsg || 'There was an error submitting your information. Please try again.');
        }
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitError('There was an error submitting your information. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">

      {/* Duplicate email popup */}
      {showDuplicateEmail && (
        <div className="absolute inset-0 z-[110] flex items-center justify-center p-4" style={{ background: 'rgba(6,10,28,.85)', backdropFilter: 'blur(8px)' }}>
          <div className="relative w-full max-w-sm rounded-2xl p-8 text-center" style={{
            background: 'linear-gradient(165deg, rgba(255,253,247,.13), rgba(255,255,255,.05))',
            border: '1px solid rgba(245,196,94,.4)',
            boxShadow: '0 40px 80px rgba(0,0,0,.7)'
          }}>
            <div className="w-16 h-16 mx-auto mb-5 rounded-full grid place-items-center text-3xl" style={{ background: 'rgba(245,196,94,.15)', border: '1px solid rgba(245,196,94,.4)' }}>
              👑
            </div>
            <h3 className="text-2xl font-semibold text-[var(--cream)] mb-3" style={{ fontFamily: 'var(--display)' }}>
              Multiple Children?
            </h3>
            <p className="text-[var(--cream-dim)] text-sm leading-relaxed mb-7">
              Adding a second child requires an active <strong className="text-[var(--gold)]">Legendary plan</strong> — upgrade to continue.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setShowDuplicateEmail(false);
                  onClose();
                  // Re-open as legendary tier — caller handles this via onClose, so we dispatch a custom event
                  window.dispatchEvent(new CustomEvent('nq:upgrade-legendary', { detail: { email } }));
                }}
                className="w-full font-bold text-base text-[var(--night-1)] px-6 py-3 rounded-xl border-none cursor-pointer relative overflow-hidden group"
                style={{ background: 'linear-gradient(135deg,var(--gold-lt),var(--gold-deep))', boxShadow: '0 8px 24px var(--amber-glow)' }}
              >
                <span className="absolute top-0 -left-[120%] w-[60%] h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -skew-x-12 transition-[left] duration-[600ms] group-hover:left-[130%]" />
                Upgrade to Legendary →
              </button>
              <button
                onClick={() => setShowDuplicateEmail(false)}
                className="w-full text-[var(--cream-dim)] text-sm hover:text-[var(--cream)] transition-colors py-1"
              >
                Go back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      <div
        className="absolute inset-0 animate-[fadeIn_0.3s_ease-out]"
        style={{
          background: 'rgba(6,10,28,.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          willChange: 'opacity'
        }}
        onClick={() => {
          onClose();
          if (showConfirmation) {
            setShowConfirmation(false);
            setSubmitSuccess(false);
            setEmail('');
            setInterests([]);
            setAdventureType([]);
            setReadingLevel('');
            setChildName('');
            setPronouns('');
          }
        }}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-xl p-6 animate-[modalSlideUp_0.4s_ease-out]"
        style={{
          background: 'linear-gradient(165deg, rgba(255,253,247,.12), rgba(255,255,255,.04))',
          border: '1px solid rgba(245,196,94,.3)',
          boxShadow: '0 40px 100px rgba(0,0,0,.7)',
          willChange: 'transform, opacity'
        }}
      >
        {/* Close Button */}
        <button
          onClick={() => {
            onClose();
            if (showConfirmation) {
              setShowConfirmation(false);
              setSubmitSuccess(false);
              setEmail('');
              setInterests([]);
              setAdventureType([]);
              setReadingLevel('');
              setChildName('');
              setPronouns('');
            }
          }}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full text-[var(--cream-dim)] hover:text-[var(--cream)] hover:bg-white/[0.1] transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Confirmation Screen for Free Trial */}
        {showConfirmation ? (
          <div className="text-center py-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full grid place-items-center text-4xl" style={{
              background: 'linear-gradient(135deg,var(--gold-lt),var(--gold-deep))',
              boxShadow: '0 14px 40px var(--amber-glow)'
            }}>
              ✓
            </div>
            <h2 className="text-3xl font-semibold text-[var(--cream)] mb-4" style={{ fontFamily: 'var(--display)' }}>
              Welcome to NightlyQuest!
            </h2>
            <p className="text-xl text-[var(--gold)] mb-6 italic" style={{ fontFamily: 'var(--display)' }}>
              You're all set. Your child's first chapter arrives tonight.
            </p>
            <div className="text-left max-w-md mx-auto mb-8 space-y-4">
              <div className="flex gap-4 items-start">
                <span className="text-2xl flex-shrink-0">📧</span>
                <div>
                  <h3 className="font-semibold text-[var(--cream)] mb-1">Check your inbox at {(() => {
                    const [hours, minutes] = deliveryTime.split(':');
                    const hour = parseInt(hours);
                    const period = hour >= 12 ? 'PM' : 'AM';
                    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                    return `${displayHour}:${minutes} ${period}`;
                  })()}</h3>
                  <p className="text-[var(--cream-dim)] text-sm">
                    {childName ? `${childName}'s` : 'Your child\'s'} first chapter will arrive tonight
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <span className="text-2xl flex-shrink-0">🌙</span>
                <div>
                  <h3 className="font-semibold text-[var(--cream)] mb-1">7 nights of adventure</h3>
                  <p className="text-[var(--cream-dim)] text-sm">
                    A new chapter every evening for the next week
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <span className="text-2xl flex-shrink-0">↩️</span>
                <div>
                  <h3 className="font-semibold text-[var(--cream)] mb-1">Reply to choose the path</h3>
                  <p className="text-[var(--cream-dim)] text-sm">
                    At the end of each chapter, just reply A or B
                  </p>
                </div>
              </div>
            </div>

            {/* Spam warning */}
            <div className="max-w-md mx-auto mb-8 rounded-xl px-5 py-4 border border-[rgba(245,196,94,.5)]" style={{ background: 'rgba(245,196,94,.08)' }}>
              <p className="text-[var(--gold)] font-bold text-sm mb-2">⚠️ Important — do this now!</p>
              <ul className="space-y-1.5 text-sm text-[var(--cream-dim)]">
                <li className="flex gap-2"><span className="text-[var(--gold)] flex-shrink-0">1.</span><span>Check your <strong className="text-[var(--cream)]">spam / junk folder</strong> for the first email and mark it <strong className="text-[var(--cream)]">Not Spam</strong></span></li>
                <li className="flex gap-2"><span className="text-[var(--gold)] flex-shrink-0">2.</span><span>Add <strong className="text-[var(--cream)] font-mono">stories@nightlyquest.com</strong> to your contacts so chapters never get lost</span></li>
              </ul>
            </div>
            <button
              onClick={() => {
                onClose();
                setShowConfirmation(false);
                setSubmitSuccess(false);
                setEmail('');
                setInterests([]);
                setAdventureType([]);
                setReadingLevel('');
                setChildName('');
                setPronouns('');
              }}
              className="relative inline-flex items-center justify-center gap-2 font-semibold text-base text-[var(--night-1)] px-8 py-2.5 rounded-lg border-none cursor-pointer overflow-hidden transition-all duration-[250ms] hover:-translate-y-0.5 group"
              style={{
                fontFamily: 'var(--body)',
                background: 'linear-gradient(135deg,var(--gold-lt),var(--gold-deep))',
                boxShadow: '0 8px 24px var(--amber-glow)'
              }}
            >
              <span className="absolute top-0 -left-[120%] w-[60%] h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -skew-x-12 transition-[left] duration-[600ms] group-hover:left-[130%]" />
              Got it! See you tonight!
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-[var(--cream)] mb-1" style={{ fontFamily: 'var(--display)' }}>
                {tier === 'trial' ? 'Start Your Free Trial' : tier === 'adventurer' ? 'Go Adventure - $9/month' : 'Become Legendary - $19/month'}
              </h2>
              <p className="text-sm text-[var(--cream-dim)]">Tell us about your child to create their perfect story</p>
            </div>

            {submitError && (
              <div className="mb-4 p-3 rounded-md bg-red-900/20 border border-red-500/30 text-red-400 text-center text-sm">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email field for all tiers */}
          <div>
            <label className="block text-[var(--cream)] text-xs font-semibold mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full px-3 py-2 rounded-md border border-[rgba(245,196,94,.3)] text-[var(--cream)] text-sm outline-none transition-all focus:border-[var(--gold)]"
              style={{
                background: 'rgba(255,255,255,.06)',
                fontFamily: 'var(--body)'
              }}
            />
          </div>

          {/* Divider */}
          <div className="border-t border-white/[0.1] my-3" />
          {/* Interests */}
          <div>
            <label className="block text-[var(--cream)] text-xs font-semibold mb-1.5">
              Interests, favorite animals, or hobbies
              <span className="text-[var(--cream-dim)] font-normal text-xs ml-1.5">(the more info, the better the story)</span>
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {/* Show suggested interests */}
              {suggestedInterests.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`px-2 py-1 rounded-md border text-xs transition-all ${
                    interests.includes(interest)
                      ? 'border-[var(--gold)] bg-[rgba(245,196,94,.15)] text-[var(--gold)]'
                      : 'border-[rgba(245,196,94,.3)] bg-[rgba(255,255,255,.04)] text-[var(--cream-dim)] hover:border-[var(--gold)]'
                  }`}
                >
                  {interest}
                </button>
              ))}
              {/* Show custom interests */}
              {interests.filter(i => !suggestedInterests.includes(i)).map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className="px-2 py-1 rounded-md border border-[var(--gold)] bg-[rgba(245,196,94,.15)] text-[var(--gold)] text-xs transition-all hover:bg-[rgba(245,196,94,.25)]"
                >
                  {interest}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customInterest}
                onChange={(e) => setCustomInterest(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomInterest())}
                placeholder="Or type their own..."
                className="flex-1 px-3 py-1.5 rounded-md border border-[rgba(245,196,94,.3)] text-[var(--cream)] text-xs outline-none focus:border-[var(--gold)]"
                style={{ background: 'rgba(255,255,255,.06)' }}
              />
              <button
                type="button"
                onClick={addCustomInterest}
                className="px-3 py-1.5 rounded-md bg-[rgba(245,196,94,.15)] text-[var(--gold)] border border-[var(--gold)] text-xs font-semibold hover:bg-[rgba(245,196,94,.25)] transition-all"
              >
                Add
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/[0.1] my-3" />

          {/* Adventure Type */}
          <div>
            <label className="block text-[var(--cream)] text-xs font-semibold mb-1.5">
              Adventure type
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {/* Show suggested adventure types */}
              {suggestedAdventures.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleAdventureType(type)}
                  className={`px-2 py-1 rounded-md border text-xs transition-all ${
                    adventureType.includes(type)
                      ? 'border-[var(--gold)] bg-[rgba(245,196,94,.15)] text-[var(--gold)]'
                      : 'border-[rgba(245,196,94,.3)] bg-[rgba(255,255,255,.04)] text-[var(--cream-dim)] hover:border-[var(--gold)]'
                  }`}
                >
                  {type}
                </button>
              ))}
              {/* Show custom adventure types */}
              {adventureType.filter(t => !suggestedAdventures.includes(t)).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleAdventureType(type)}
                  className="px-4 py-2 rounded-lg border border-[var(--gold)] bg-[rgba(245,196,94,.15)] text-[var(--gold)] text-sm transition-all hover:bg-[rgba(245,196,94,.25)]"
                >
                  {type}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customAdventure}
                onChange={(e) => setCustomAdventure(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomAdventure())}
                placeholder="Or describe their own adventure style..."
                className="flex-1 px-3 py-1.5 rounded-md border border-[rgba(245,196,94,.3)] text-[var(--cream)] text-xs outline-none focus:border-[var(--gold)]"
                style={{ background: 'rgba(255,255,255,.06)' }}
              />
              <button
                type="button"
                onClick={addCustomAdventure}
                className="px-3 py-1.5 rounded-md bg-[rgba(245,196,94,.15)] text-[var(--gold)] border border-[var(--gold)] text-xs font-semibold hover:bg-[rgba(245,196,94,.25)] transition-all"
              >
                Add
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/[0.1] my-3" />

          {/* Reading Level */}
          <div>
            <label className="block text-[var(--cream)] text-xs font-semibold mb-1.5">
              Child's Age (Comprehension Level)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {readingLevels.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setReadingLevel(level.value)}
                  className={`flex flex-col items-center justify-center gap-0.5 py-3 px-2 rounded-lg border transition-all ${
                    readingLevel === level.value
                      ? 'border-[var(--gold)] bg-[rgba(245,196,94,.15)]'
                      : 'border-[rgba(245,196,94,.3)] bg-[rgba(255,255,255,.04)] hover:border-[rgba(245,196,94,.6)] hover:bg-[rgba(255,255,255,.07)]'
                  }`}
                >
                  <span className={`text-lg font-bold leading-none ${readingLevel === level.value ? 'text-[var(--gold)]' : 'text-[var(--cream)]'}`} style={{ fontFamily: 'var(--display)' }}>
                    {level.label}
                  </span>
                  <span className={`text-[0.68rem] tracking-wide ${readingLevel === level.value ? 'text-[var(--gold-lt)]' : 'text-[var(--cream-dim)]'}`}>
                    {level.sub}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/[0.1] my-3" />

          {/* Delivery Time */}
          <div>
            <label className="block text-[var(--cream)] text-xs font-semibold mb-1.5">
              What time should the chapter arrive in your inbox?
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="time"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                className="px-3 py-2 rounded-md border border-[rgba(245,196,94,.3)] text-[var(--cream)] text-sm outline-none focus:border-[var(--gold)]"
                style={{ background: 'rgba(255,255,255,.06)' }}
              />
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="px-3 py-2 rounded-md border border-[rgba(245,196,94,.3)] text-[var(--cream)] text-sm outline-none focus:border-[var(--gold)]"
                style={{ background: 'rgba(255,255,255,.06)' }}
              >
                <optgroup label="US Timezones">
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="America/Anchorage">Alaska Time (AKT)</option>
                  <option value="Pacific/Honolulu">Hawaii Time (HST)</option>
                </optgroup>
                <optgroup label="Canada">
                  <option value="America/Toronto">Toronto (ET)</option>
                  <option value="America/Vancouver">Vancouver (PT)</option>
                  <option value="America/Edmonton">Edmonton (MT)</option>
                  <option value="America/Halifax">Halifax (AT)</option>
                  <option value="America/St_Johns">Newfoundland (NT)</option>
                </optgroup>
                <optgroup label="Europe">
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Europe/Paris">Paris (CET)</option>
                  <option value="Europe/Berlin">Berlin (CET)</option>
                  <option value="Europe/Rome">Rome (CET)</option>
                  <option value="Europe/Madrid">Madrid (CET)</option>
                  <option value="Europe/Amsterdam">Amsterdam (CET)</option>
                  <option value="Europe/Brussels">Brussels (CET)</option>
                  <option value="Europe/Stockholm">Stockholm (CET)</option>
                  <option value="Europe/Athens">Athens (EET)</option>
                  <option value="Europe/Moscow">Moscow (MSK)</option>
                </optgroup>
                <optgroup label="Asia">
                  <option value="Asia/Dubai">Dubai (GST)</option>
                  <option value="Asia/Kolkata">India (IST)</option>
                  <option value="Asia/Singapore">Singapore (SGT)</option>
                  <option value="Asia/Hong_Kong">Hong Kong (HKT)</option>
                  <option value="Asia/Shanghai">Shanghai (CST)</option>
                  <option value="Asia/Tokyo">Tokyo (JST)</option>
                  <option value="Asia/Seoul">Seoul (KST)</option>
                  <option value="Asia/Bangkok">Bangkok (ICT)</option>
                  <option value="Asia/Jakarta">Jakarta (WIB)</option>
                </optgroup>
                <optgroup label="Australia & Pacific">
                  <option value="Australia/Sydney">Sydney (AEDT)</option>
                  <option value="Australia/Melbourne">Melbourne (AEDT)</option>
                  <option value="Australia/Perth">Perth (AWST)</option>
                  <option value="Australia/Brisbane">Brisbane (AEST)</option>
                  <option value="Pacific/Auckland">Auckland (NZDT)</option>
                </optgroup>
                <optgroup label="Other">
                  <option value="America/Mexico_City">Mexico City (CST)</option>
                  <option value="America/Sao_Paulo">São Paulo (BRT)</option>
                  <option value="America/Buenos_Aires">Buenos Aires (ART)</option>
                  <option value="Africa/Cairo">Cairo (EET)</option>
                  <option value="Africa/Johannesburg">Johannesburg (SAST)</option>
                </optgroup>
              </select>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/[0.1] my-3" />

          {/* Child's Name */}
          <div>
            <label className="block text-[var(--cream)] text-xs font-semibold mb-1.5">
              Child's Name (or a character name)
            </label>
            <input
              type="text"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              placeholder="e.g., Allie"
              className="w-full px-3 py-2 rounded-md border border-[rgba(245,196,94,.3)] text-[var(--cream)] text-sm outline-none transition-all focus:border-[var(--gold)]"
              style={{
                background: 'rgba(255,255,255,.06)',
                fontFamily: 'var(--body)'
              }}
            />
          </div>

          {/* Pronouns */}
          <div>
            <label className="block text-[var(--cream)] text-xs font-semibold mb-1.5">
              Pronouns
            </label>
            <div className="flex gap-2">
              {['she/her', 'he/him', 'they/them'].map((pronoun) => (
                <button
                  key={pronoun}
                  type="button"
                  onClick={() => setPronouns(pronoun)}
                  className={`px-3 py-1.5 rounded-md border text-sm transition-all ${
                    pronouns === pronoun
                      ? 'border-[var(--gold)] bg-[rgba(245,196,94,.15)] text-[var(--gold)]'
                      : 'border-[rgba(245,196,94,.3)] bg-[rgba(255,255,255,.04)] text-[var(--cream-dim)]'
                  }`}
                >
                  {pronoun}
                </button>
              ))}
            </div>
          </div>

          {/* Where did you find us */}
          <div>
            <label className="block text-[var(--cream)] text-xs font-semibold mb-1.5">
              Where did you find us?
            </label>
            <select
              value={referralSource}
              onChange={(e) => setReferralSource(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-[rgba(245,196,94,.3)] text-[var(--cream)] text-sm outline-none focus:border-[var(--gold)]"
              style={{ background: 'rgba(255,255,255,.06)' }}
            >
              <option value="">Select an option…</option>
              <option value="Instagram">Instagram</option>
              <option value="TikTok">TikTok</option>
              <option value="Facebook">Facebook</option>
              <option value="Twitter / X">Twitter / X</option>
              <option value="Pinterest">Pinterest</option>
              <option value="YouTube">YouTube</option>
              <option value="Google Search">Google Search</option>
              <option value="Friend or Family">Friend or Family</option>
              <option value="Parenting Blog / Newsletter">Parenting Blog / Newsletter</option>
              <option value="Podcast">Podcast</option>
              <option value="Reddit">Reddit</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Disclaimer */}
          <div className="flex items-center justify-center gap-1.5 text-[0.65rem] text-[var(--cream-dim)] italic pt-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>We collect as little as possible about your child</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || submitSuccess}
            className="w-full relative inline-flex items-center justify-center gap-2 font-semibold text-base text-[var(--night-1)] px-6 py-2.5 rounded-lg border-none cursor-pointer overflow-hidden transition-all duration-[250ms] hover:-translate-y-0.5 group disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              fontFamily: 'var(--body)',
              background: 'linear-gradient(135deg,var(--gold-lt),var(--gold-deep))',
              boxShadow: '0 8px 24px var(--amber-glow)'
            }}
          >
            <span className="absolute top-0 -left-[120%] w-[60%] h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -skew-x-12 transition-[left] duration-[600ms] group-hover:left-[130%]" />
            {isSubmitting ? 'Submitting...' : tier === 'trial' ? 'Start Free Trial' : tier === 'adventurer' ? 'Continue to Checkout ($9/mo)' : 'Continue to Checkout ($19/mo)'}
            {!isSubmitting && <span className="transition-transform duration-[250ms] group-hover:translate-x-1.5">→</span>}
          </button>
        </form>
        </>
        )}
      </div>
    </div>
  );
}

// Analytics Page
function AnalyticsPage({ onClose }: { onClose: () => void }) {
  const [isAuthenticated, setIsAuthenticated] = useState(IS_ANALYTICS_DIRECT);
  const [password, setPassword] = useState('');
  const [tableData, setTableData] = useState({
    pageViews: [] as any[],
    children: [] as any[],
    parents: [] as any[],
    chapters: [] as any[],
    choices: [] as any[],
    sagas: [] as any[]
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('subscribers');
  const [rawSubTab, setRawSubTab] = useState('children');

  useEffect(() => { if (IS_ANALYTICS_DIRECT) loadData(); }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'lucky123') {
      setIsAuthenticated(true);
      loadData();
    } else {
      setError('Incorrect password');
      setPassword('');
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Fetch actual data from each table
      const [
        pageViewsResult,
        childrenResult,
        parentsResult,
        chaptersResult,
        choicesResult,
        sagasResult
      ] = await Promise.all([
        supabase.from('page_views').select('*').order('visited_at', { ascending: false }).limit(100),
        supabase.from('children').select('*').order('created_at', { ascending: false }),
        supabase.from('parents').select('*').order('created_at', { ascending: false }),
        supabase.from('chapters').select('*').order('created_at', { ascending: false }),
        supabase.from('choices').select('*').order('created_at', { ascending: false }),
        supabase.from('sagas').select('*').order('created_at', { ascending: false })
      ]);

      // Check for errors first
      const errors = [];
      if (pageViewsResult.error) errors.push(`Page views: ${pageViewsResult.error.message}`);
      if (childrenResult.error) errors.push(`Children: ${childrenResult.error.message}`);
      if (parentsResult.error) errors.push(`Parents: ${parentsResult.error.message}`);
      if (chaptersResult.error) errors.push(`Chapters: ${chaptersResult.error.message}`);
      if (choicesResult.error) errors.push(`Choices: ${choicesResult.error.message}`);
      if (sagasResult.error) errors.push(`Sagas: ${sagasResult.error.message}`);

      if (errors.length > 0) {
        console.error('Query errors:', errors);
        setError(errors.join(' | '));
      }

      // Log results for debugging
      console.log('Query results:', {
        pageViews: pageViewsResult.data?.length || 0,
        children: childrenResult.data?.length || 0,
        parents: parentsResult.data?.length || 0,
        chapters: chaptersResult.data?.length || 0,
        choices: choicesResult.data?.length || 0,
        sagas: sagasResult.data?.length || 0
      });

      setTableData({
        pageViews: pageViewsResult.data || [],
        children: childrenResult.data || [],
        parents: parentsResult.data || [],
        chapters: chaptersResult.data || [],
        choices: choicesResult.data || [],
        sagas: sagasResult.data || []
      });

    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data: ' + String(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(180deg, var(--night-1) 0%, var(--night-2) 50%, var(--night-3) 100%)' }}>
        <div className="w-full max-w-md rounded-2xl p-8" style={{
          background: 'linear-gradient(165deg, rgba(255,253,247,.12), rgba(255,255,255,.04))',
          border: '1px solid rgba(245,196,94,.3)',
          boxShadow: '0 40px 100px rgba(0,0,0,.7)'
        }}>
          <h2 className="text-3xl font-semibold text-[var(--cream)] mb-6 text-center" style={{ fontFamily: 'var(--display)' }}>
            Analytics Login
          </h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[var(--cream)] text-xs font-semibold mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 rounded-lg border border-[rgba(245,196,94,.3)] text-[var(--cream)] text-base outline-none"
                style={{ background: 'rgba(255,255,255,.06)' }}
                autoFocus
              />
            </div>
            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}
            <button
              type="submit"
              className="w-full font-bold text-lg text-[var(--night-1)] px-8 py-3 rounded-full border-none cursor-pointer"
              style={{
                background: 'linear-gradient(135deg,var(--gold-lt),var(--gold-deep))',
                boxShadow: '0 14px 40px var(--amber-glow)'
              }}
            >
              Login
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full text-[var(--cream-dim)] text-sm hover:text-[var(--cream)] transition-colors"
            >
              Back to Home
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8" style={{ background: 'linear-gradient(180deg, var(--night-1) 0%, var(--night-2) 50%, var(--night-3) 100%)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-semibold text-[var(--cream)]" style={{ fontFamily: 'var(--display)' }}>
            Analytics Dashboard
          </h1>
          <div className="flex gap-4">
            <button
              onClick={loadData}
              className="px-6 py-2 rounded-lg bg-[rgba(245,196,94,.15)] text-[var(--gold)] border border-[var(--gold)] font-semibold hover:bg-[rgba(245,196,94,.25)] transition-all"
            >
              Refresh
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg border border-[rgba(245,196,94,.3)] text-[var(--cream-dim)] hover:text-[var(--cream)] hover:border-[var(--gold)] transition-all"
            >
              Back to Home
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="text-center text-[var(--cream-dim)] py-12">
            Loading analytics...
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-900/20 border border-red-500/30 text-red-400">
            {error}
          </div>
        )}

        {!isLoading && !error && (
          <>
            {/* Visitor Highlights */}
            <div className="mb-8 grid grid-cols-2 gap-6 max-[900px]:grid-cols-1">
              <div className="rounded-xl p-8 border border-[rgba(245,196,94,.3)]" style={{ background: 'linear-gradient(165deg, rgba(255,253,247,.07), rgba(255,255,255,.02))' }}>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full grid place-items-center text-3xl" style={{ background: 'rgba(245,196,94,.15)', border: '1px solid rgba(245,196,94,.4)' }}>
                    👥
                  </div>
                  <div>
                    <div className="text-5xl font-bold text-[var(--gold)]" style={{ fontFamily: 'var(--display)' }}>
                      {new Set(tableData.pageViews.map(pv => pv.visitor_id)).size.toLocaleString()}
                    </div>
                    <div className="text-lg text-[var(--cream-dim)] mt-1">Unique Visitors</div>
                  </div>
                </div>
              </div>
              <div className="rounded-xl p-8 border border-[rgba(245,196,94,.3)]" style={{ background: 'linear-gradient(165deg, rgba(255,253,247,.07), rgba(255,255,255,.02))' }}>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full grid place-items-center text-3xl" style={{ background: 'rgba(188,185,236,.15)', border: '1px solid rgba(188,185,236,.4)' }}>
                    📊
                  </div>
                  <div>
                    <div className="text-5xl font-bold text-[var(--lavender)]" style={{ fontFamily: 'var(--display)' }}>
                      {tableData.pageViews.length.toLocaleString()}
                    </div>
                    <div className="text-lg text-[var(--cream-dim)] mt-1">Total Page Views</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="mb-6 flex gap-2 flex-wrap">
              {[
                { key: 'subscribers', label: 'Subscribers', count: tableData.parents.length },
                { key: 'pageViews', label: 'Page Views', count: tableData.pageViews.length },
                { key: 'rawData', label: 'Raw Data', count: tableData.children.length + tableData.parents.length + tableData.chapters.length + tableData.choices.length + tableData.sagas.length }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    activeTab === tab.key
                      ? 'bg-[var(--gold)] text-[var(--night-1)]'
                      : 'bg-[rgba(245,196,94,.15)] text-[var(--gold)] border border-[var(--gold)] hover:bg-[rgba(245,196,94,.25)]'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            {/* Table Display */}
            <div className="rounded-xl border border-[rgba(245,196,94,.3)] overflow-hidden" style={{ background: 'linear-gradient(165deg, rgba(255,253,247,.07), rgba(255,255,255,.02))' }}>
              <div className="overflow-x-auto">

                {/* Subscribers — joined view */}
                {activeTab === 'subscribers' && (() => {
                  // Build lookup maps
                  const childrenByParent: Record<string, any[]> = {};
                  tableData.children.forEach(c => {
                    const pid = c.parent_id;
                    if (pid) { (childrenByParent[pid] = childrenByParent[pid] || []).push(c); }
                  });
                  const sagasByChild: Record<string, any> = {};
                  tableData.sagas.forEach(s => { if (s.child_id) sagasByChild[s.child_id] = s; });
                  const maxChapterBySaga: Record<string, number> = {};
                  tableData.chapters.forEach(ch => {
                    if (ch.saga_id) {
                      maxChapterBySaga[ch.saga_id] = Math.max(maxChapterBySaga[ch.saga_id] || 0, ch.chapter_number || 0);
                    }
                  });
                  const lastChoiceByChild: Record<string, any> = {};
                  tableData.choices.forEach(ch => {
                    if (ch.child_id) {
                      const prev = lastChoiceByChild[ch.child_id];
                      if (!prev || new Date(ch.created_at) > new Date(prev.created_at)) {
                        lastChoiceByChild[ch.child_id] = ch;
                      }
                    }
                  });

                  const rows = tableData.parents.flatMap(parent => {
                    const kids = childrenByParent[parent.id] || [];
                    if (kids.length === 0) return [{
                      parentId: parent.id,
                      email: parent.email,
                      deliveryTime: parent.delivery_time,
                      referralSource: parent.referral_source,
                      plan: parent.plan || parent.tier || parent.subscription_status,
                      joinedAt: parent.created_at,
                      childName: null, childPronouns: null, childLevel: null,
                      saga: null, currentChapter: null, lastResponse: null
                    }];
                    return kids.map(child => {
                      const saga = sagasByChild[child.id];
                      const currentChapter = saga ? (maxChapterBySaga[saga.id] || null) : null;
                      const lastChoice = lastChoiceByChild[child.id];
                      return {
                        parentId: parent.id,
                        email: parent.email,
                        deliveryTime: parent.delivery_time,
                        referralSource: parent.referral_source,
                        plan: parent.plan || parent.tier || parent.subscription_status || saga?.status,
                        joinedAt: parent.created_at,
                        childName: child.name,
                        childPronouns: child.pronouns,
                        childLevel: child.reading_level,
                        saga,
                        currentChapter,
                        lastResponse: lastChoice ? lastChoice.created_at : null
                      };
                    });
                  });

                  const planBadge = (plan: string | null | undefined) => {
                    if (!plan) return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white/[0.08] text-[var(--cream-dim)]">Trial</span>;
                    const isPaid = /paid|active|adventurer|legendary/i.test(plan);
                    return isPaid
                      ? <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[rgba(245,196,94,.15)] text-[var(--gold)] border border-[rgba(245,196,94,.4)]">{plan}</span>
                      : <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[rgba(188,185,236,.12)] text-[var(--lavender)] border border-[rgba(188,185,236,.3)]">{plan}</span>;
                  };

                  return (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/[0.1]">
                          <th className="text-left px-5 py-4 text-xs uppercase tracking-wider text-[var(--cream-dim)] font-semibold">Parent Email</th>
                          <th className="text-left px-5 py-4 text-xs uppercase tracking-wider text-[var(--cream-dim)] font-semibold">Child</th>
                          <th className="text-left px-5 py-4 text-xs uppercase tracking-wider text-[var(--cream-dim)] font-semibold">Level</th>
                          <th className="text-left px-5 py-4 text-xs uppercase tracking-wider text-[var(--cream-dim)] font-semibold">Delivery</th>
                          <th className="text-left px-5 py-4 text-xs uppercase tracking-wider text-[var(--cream-dim)] font-semibold">Found Us</th>
                          <th className="text-left px-5 py-4 text-xs uppercase tracking-wider text-[var(--cream-dim)] font-semibold">Plan</th>
                          <th className="text-left px-5 py-4 text-xs uppercase tracking-wider text-[var(--cream-dim)] font-semibold">Chapter</th>
                          <th className="text-left px-5 py-4 text-xs uppercase tracking-wider text-[var(--cream-dim)] font-semibold">Last Response</th>
                          <th className="text-left px-5 py-4 text-xs uppercase tracking-wider text-[var(--cream-dim)] font-semibold">Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.length === 0 ? (
                          <tr><td colSpan={9} className="px-6 py-12 text-center text-[var(--cream-dim)]">No subscribers yet</td></tr>
                        ) : (
                          rows.map((row, idx) => (
                            <tr key={`${row.parentId}-${row.childName}-${idx}`} className={`border-b border-white/[0.05] ${idx % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                              <td className="px-5 py-4 text-sm text-[var(--cream)]">{row.email}</td>
                              <td className="px-5 py-4 text-sm">
                                {row.childName
                                  ? <span className="font-semibold text-[var(--cream)]">{row.childName}{row.childPronouns ? <span className="ml-1.5 text-xs text-[var(--cream-dim)] font-normal">({row.childPronouns})</span> : null}</span>
                                  : <span className="text-[var(--cream-dim)]">—</span>}
                              </td>
                              <td className="px-5 py-4 text-sm text-[var(--cream-dim)]">{row.childLevel || '—'}</td>
                              <td className="px-5 py-4 text-sm text-[var(--cream-dim)] whitespace-nowrap">{row.deliveryTime || '—'}</td>
                              <td className="px-5 py-4 text-sm text-[var(--cream-dim)]">{row.referralSource || '—'}</td>
                              <td className="px-5 py-4 text-sm">{planBadge(row.plan)}</td>
                              <td className="px-5 py-4 text-sm">
                                {row.currentChapter != null
                                  ? <span className="font-semibold text-[var(--gold)]">#{row.currentChapter}</span>
                                  : <span className="text-[var(--cream-dim)]">—</span>}
                              </td>
                              <td className="px-5 py-4 text-sm text-[var(--cream-dim)] whitespace-nowrap">
                                {row.lastResponse ? new Date(row.lastResponse).toLocaleDateString() : '—'}
                              </td>
                              <td className="px-5 py-4 text-sm text-[var(--cream-dim)] whitespace-nowrap">
                                {row.joinedAt ? new Date(row.joinedAt).toLocaleDateString() : '—'}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  );
                })()}

                {/* Page Views Table */}
                {activeTab === 'pageViews' && (() => {
                  const visitorCounts = tableData.pageViews.reduce((acc, pv) => {
                    acc[pv.visitor_id] = (acc[pv.visitor_id] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>);
                  return (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/[0.1]">
                          <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-[var(--cream-dim)] font-semibold">Visitor ID</th>
                          <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-[var(--cream-dim)] font-semibold">Path</th>
                          <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-[var(--cream-dim)] font-semibold">Visited At</th>
                          <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-[var(--cream-dim)] font-semibold">Referrer</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tableData.pageViews.length === 0 ? (
                          <tr><td colSpan={4} className="px-6 py-12 text-center text-[var(--cream-dim)]">No page views yet</td></tr>
                        ) : (
                          tableData.pageViews.map((row, idx) => {
                            const isNew = visitorCounts[row.visitor_id] === 1;
                            return (
                              <tr key={row.id} className={`border-b border-white/[0.05] ${idx % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                                <td className="px-6 py-4 text-sm font-mono text-[var(--cream)]">
                                  <div className="flex items-center gap-2">
                                    <span>{row.visitor_id?.slice(0, 8)}…</span>
                                    {isNew && <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[rgba(245,196,94,.15)] text-[var(--gold)] border border-[var(--gold)]">New</span>}
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-[var(--cream)]">{row.path}</td>
                                <td className="px-6 py-4 text-sm text-[var(--cream-dim)]">{new Date(row.visited_at).toLocaleString()}</td>
                                <td className="px-6 py-4 text-sm text-[var(--cream-dim)] max-w-xs truncate">{row.referrer || 'Direct'}</td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  );
                })()}

                {/* Raw Data Tab */}
                {activeTab === 'rawData' && (
                  <div>
                    {/* Sub-nav */}
                    <div className="flex gap-1 px-4 pt-4 pb-2 border-b border-white/[0.08] flex-wrap">
                      {[
                        { key: 'children', label: 'Children', count: tableData.children.length },
                        { key: 'parents', label: 'Parents', count: tableData.parents.length },
                        { key: 'chapters', label: 'Chapters', count: tableData.chapters.length },
                        { key: 'choices', label: 'Choices', count: tableData.choices.length },
                        { key: 'sagas', label: 'Sagas', count: tableData.sagas.length },
                      ].map(sub => (
                        <button
                          key={sub.key}
                          onClick={() => setRawSubTab(sub.key)}
                          className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
                            rawSubTab === sub.key
                              ? 'bg-white/[0.15] text-[var(--cream)]'
                              : 'text-[var(--cream-dim)] hover:text-[var(--cream)] hover:bg-white/[0.07]'
                          }`}
                        >
                          {sub.label} ({sub.count})
                        </button>
                      ))}
                    </div>

                    {/* Children */}
                    {rawSubTab === 'children' && (
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/[0.1]">
                            <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-[var(--cream-dim)] font-semibold">Name</th>
                            <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-[var(--cream-dim)] font-semibold">Pronouns</th>
                            <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-[var(--cream-dim)] font-semibold">Reading Level</th>
                            <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-[var(--cream-dim)] font-semibold">Interests</th>
                            <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-[var(--cream-dim)] font-semibold">Created At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tableData.children.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-12 text-center text-[var(--cream-dim)]">No children yet</td></tr>
                          ) : tableData.children.map((row, idx) => (
                            <tr key={row.id} className={`border-b border-white/[0.05] ${idx % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                              <td className="px-6 py-4 text-sm text-[var(--cream)] font-semibold">{row.name}</td>
                              <td className="px-6 py-4 text-sm text-[var(--cream-dim)]">{row.pronouns || '-'}</td>
                              <td className="px-6 py-4 text-sm text-[var(--cream-dim)]">{row.reading_level || '-'}</td>
                              <td className="px-6 py-4 text-sm text-[var(--cream-dim)]">{Array.isArray(row.interests) ? row.interests.join(', ') : row.interests || '-'}</td>
                              <td className="px-6 py-4 text-sm text-[var(--cream-dim)]">{row.created_at ? new Date(row.created_at).toLocaleString() : '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {/* Parents */}
                    {rawSubTab === 'parents' && (
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/[0.1]">
                            <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-[var(--cream-dim)] font-semibold">Email</th>
                            <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-[var(--cream-dim)] font-semibold">Referral Source</th>
                            <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-[var(--cream-dim)] font-semibold">Created At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tableData.parents.length === 0 ? (
                            <tr><td colSpan={3} className="px-6 py-12 text-center text-[var(--cream-dim)]">No parents yet</td></tr>
                          ) : tableData.parents.map((row, idx) => (
                            <tr key={row.id} className={`border-b border-white/[0.05] ${idx % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                              <td className="px-6 py-4 text-sm text-[var(--cream)]">{row.email}</td>
                              <td className="px-6 py-4 text-sm text-[var(--cream-dim)]">{row.referral_source || '-'}</td>
                              <td className="px-6 py-4 text-sm text-[var(--cream-dim)]">{row.created_at ? new Date(row.created_at).toLocaleString() : '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {/* Chapters */}
                    {rawSubTab === 'chapters' && (
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/[0.1]">
                            <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-[var(--cream-dim)] font-semibold">Saga ID</th>
                            <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-[var(--cream-dim)] font-semibold">Chapter #</th>
                            <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-[var(--cream-dim)] font-semibold">Content</th>
                            <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-[var(--cream-dim)] font-semibold">Created At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tableData.chapters.length === 0 ? (
                            <tr><td colSpan={4} className="px-6 py-12 text-center text-[var(--cream-dim)]">No chapters yet</td></tr>
                          ) : tableData.chapters.map((row, idx) => (
                            <tr key={row.id} className={`border-b border-white/[0.05] ${idx % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                              <td className="px-6 py-4 text-sm font-mono text-[var(--cream-dim)]">{row.saga_id?.slice(0, 8)}…</td>
                              <td className="px-6 py-4 text-sm font-semibold text-[var(--gold)]">#{row.chapter_number}</td>
                              <td className="px-6 py-4 text-sm text-[var(--cream-dim)] max-w-md truncate">{row.content}</td>
                              <td className="px-6 py-4 text-sm text-[var(--cream-dim)]">{row.created_at ? new Date(row.created_at).toLocaleString() : '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {/* Choices */}
                    {rawSubTab === 'choices' && (
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/[0.1]">
                            <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-[var(--cream-dim)] font-semibold">Child ID</th>
                            <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-[var(--cream-dim)] font-semibold">Chapter ID</th>
                            <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-[var(--cream-dim)] font-semibold">Choice</th>
                            <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-[var(--cream-dim)] font-semibold">Created At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tableData.choices.length === 0 ? (
                            <tr><td colSpan={4} className="px-6 py-12 text-center text-[var(--cream-dim)]">No choices yet</td></tr>
                          ) : tableData.choices.map((row, idx) => (
                            <tr key={row.id} className={`border-b border-white/[0.05] ${idx % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                              <td className="px-6 py-4 text-sm font-mono text-[var(--cream-dim)]">{row.child_id?.slice(0, 8)}…</td>
                              <td className="px-6 py-4 text-sm font-mono text-[var(--cream-dim)]">{row.chapter_id?.slice(0, 8)}…</td>
                              <td className="px-6 py-4 text-sm text-[var(--cream)]">{row.choice_text}</td>
                              <td className="px-6 py-4 text-sm text-[var(--cream-dim)]">{row.created_at ? new Date(row.created_at).toLocaleString() : '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {/* Sagas */}
                    {rawSubTab === 'sagas' && (
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/[0.1]">
                            <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-[var(--cream-dim)] font-semibold">Child ID</th>
                            <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-[var(--cream-dim)] font-semibold">Title</th>
                            <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-[var(--cream-dim)] font-semibold">Status</th>
                            <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-[var(--cream-dim)] font-semibold">Created At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tableData.sagas.length === 0 ? (
                            <tr><td colSpan={4} className="px-6 py-12 text-center text-[var(--cream-dim)]">No sagas yet</td></tr>
                          ) : tableData.sagas.map((row, idx) => (
                            <tr key={row.id} className={`border-b border-white/[0.05] ${idx % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                              <td className="px-6 py-4 text-sm font-mono text-[var(--cream-dim)]">{row.child_id?.slice(0, 8)}…</td>
                              <td className="px-6 py-4 text-sm text-[var(--cream)] font-semibold">{row.title}</td>
                              <td className="px-6 py-4 text-sm">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  row.status === 'active' ? 'bg-[rgba(245,196,94,.15)] text-[var(--gold)]' : 'bg-white/[0.1] text-[var(--cream-dim)]'
                                }`}>{row.status}</span>
                              </td>
                              <td className="px-6 py-4 text-sm text-[var(--cream-dim)]">{row.created_at ? new Date(row.created_at).toLocaleString() : '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Add Child Page — accessible via #add-child
function AddChildPage({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<'verify' | 'form' | 'success'>('verify');
  const [email, setEmail] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const [childName, setChildName] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [readingLevel, setReadingLevel] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState('');
  const [adventureType, setAdventureType] = useState<string[]>([]);
  const [customAdventure, setCustomAdventure] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('19:30');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const suggestedInterests = ['Dragons', 'Space', 'Animals', 'Magic', 'Ocean', 'Dinosaurs', 'Robots', 'Princesses', 'Knights', 'Science'];
  const suggestedAdventures = ['Fantasy', 'Sci-Fi', 'Mystery', 'Adventure', 'Magical Realism'];
  const readingLevels = [
    { value: '0-2', label: '0–2', sub: 'Baby & Toddler' },
    { value: '3-5', label: '3–5', sub: 'Little Listener' },
    { value: '6-8', label: '6–8', sub: 'Young Adventurer' },
    { value: '9-12', label: '9–12', sub: 'Big Kid' },
  ];

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setVerifyError('');
    try {
      const { data, error } = await supabase
        .from('parents')
        .select('id, plan, subscription_status, tier')
        .eq('email', email.trim().toLowerCase())
        .single();

      if (error || !data) {
        setVerifyError("We couldn't find a NightlyQuest account with that email.");
        setIsVerifying(false);
        return;
      }

      const plan: string = (data.plan || data.subscription_status || data.tier || '').toLowerCase();
      const isLegendary = /legendary|active/i.test(plan);

      if (!isLegendary) {
        setVerifyError("This email isn't linked to an active Legendary plan. Please upgrade first.");
        setIsVerifying(false);
        return;
      }

      setStep('form');
    } catch {
      setVerifyError('Something went wrong. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const toggleInterest = (v: string) => setInterests(p => p.includes(v) ? p.filter(i => i !== v) : [...p, v]);
  const addCustomInterest = () => { if (customInterest.trim() && !interests.includes(customInterest.trim())) { setInterests(p => [...p, customInterest.trim()]); setCustomInterest(''); } };
  const toggleAdventure = (v: string) => setAdventureType(p => p.includes(v) ? p.filter(t => t !== v) : [...p, v]);
  const addCustomAdventure = () => { if (customAdventure.trim() && !adventureType.includes(customAdventure.trim())) { setAdventureType(p => [...p, customAdventure.trim()]); setCustomAdventure(''); } };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const body: Record<string, any> = {
        parent_email: email.trim().toLowerCase(),
        child_name: childName,
        reading_level: readingLevel || '6-8',
        timezone: browserTimezone,
        delivery_time: deliveryTime,
      };
      if (pronouns) body.pronouns = pronouns;
      if (interests.length > 0) body.interests = interests.join(', ');
      if (adventureType.length > 0) body.adventure_type = adventureType.join(', ');

      const response = await fetch('https://hodngazgjsokcyrtbxkm.supabase.co/functions/v1/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': 'sb_publishable_sOYcevE0Ox5Fd4euBvBJgQ_V6ZzWetP' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (data.ok) {
        setStep('success');
      } else {
        setSubmitError(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setSubmitError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cardStyle = {
    background: 'linear-gradient(165deg, rgba(255,253,247,.1), rgba(255,255,255,.04))',
    border: '1px solid rgba(245,196,94,.3)',
    boxShadow: '0 40px 100px rgba(0,0,0,.7)',
  };
  const inputCls = "w-full px-3 py-2 rounded-md border border-[rgba(245,196,94,.3)] text-[var(--cream)] text-sm outline-none focus:border-[var(--gold)]";
  const inputStyle = { background: 'rgba(255,255,255,.06)' };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(180deg, var(--night-1) 0%, var(--night-2) 50%, var(--night-3) 100%)' }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 60 }).map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white" style={{
            width: Math.random() * 2 + 1 + 'px', height: Math.random() * 2 + 1 + 'px',
            top: Math.random() * 100 + '%', left: Math.random() * 100 + '%',
            opacity: Math.random() * 0.6 + 0.1,
          }} />
        ))}
      </div>

      <div className="relative w-full max-w-lg">
        <button onClick={onClose} className="flex items-center gap-2 text-[var(--cream-dim)] hover:text-[var(--cream)] text-sm transition-colors mb-8">
          ← Back to NightlyQuest
        </button>

        <div className="rounded-2xl p-8" style={cardStyle}>
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full grid place-items-center text-2xl" style={{ background: 'rgba(245,196,94,.15)', border: '1px solid rgba(245,196,94,.4)' }}>
              👑
            </div>
            <h1 className="text-3xl font-semibold text-[var(--cream)] mb-1" style={{ fontFamily: 'var(--display)' }}>
              Add Another Child
            </h1>
            <p className="text-sm text-[var(--cream-dim)]">Legendary subscribers only</p>
          </div>

          {step === 'verify' && (
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-[var(--cream)] text-xs font-semibold mb-1.5">Your account email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required className={inputCls} style={inputStyle} autoFocus />
              </div>
              {verifyError && (
                <div className="rounded-lg px-4 py-3 text-sm text-red-300 border border-red-500/30" style={{ background: 'rgba(239,68,68,.08)' }}>
                  {verifyError}
                </div>
              )}
              <button type="submit" disabled={isVerifying || !email} className="w-full font-bold text-base text-[var(--night-1)] px-6 py-3 rounded-xl border-none cursor-pointer relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: 'linear-gradient(135deg,var(--gold-lt),var(--gold-deep))', boxShadow: '0 8px 24px var(--amber-glow)' }}>
                <span className="absolute top-0 -left-[120%] w-[60%] h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -skew-x-12 transition-[left] duration-[600ms] group-hover:left-[130%]" />
                {isVerifying ? 'Checking…' : 'Verify & Continue →'}
              </button>
              <p className="text-center text-xs text-[var(--cream-dim)]">
                Not a Legendary subscriber?{' '}
                <button type="button" onClick={() => { onClose(); window.dispatchEvent(new CustomEvent('nq:upgrade-legendary')); }} className="text-[var(--gold)] hover:underline">Upgrade here</button>
              </p>
            </form>
          )}

          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[var(--cream)] text-xs font-semibold mb-1.5">Child's Age (Comprehension Level)</label>
                <div className="grid grid-cols-2 gap-2">
                  {readingLevels.map(level => (
                    <button key={level.value} type="button" onClick={() => setReadingLevel(level.value)}
                      className={`flex flex-col items-center justify-center gap-0.5 py-3 px-2 rounded-lg border transition-all ${readingLevel === level.value ? 'border-[var(--gold)] bg-[rgba(245,196,94,.15)]' : 'border-[rgba(245,196,94,.3)] bg-[rgba(255,255,255,.04)] hover:border-[rgba(245,196,94,.6)]'}`}>
                      <span className={`text-lg font-bold leading-none ${readingLevel === level.value ? 'text-[var(--gold)]' : 'text-[var(--cream)]'}`} style={{ fontFamily: 'var(--display)' }}>{level.label}</span>
                      <span className={`text-[0.68rem] tracking-wide ${readingLevel === level.value ? 'text-[var(--gold-lt)]' : 'text-[var(--cream-dim)]'}`}>{level.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/[0.1]" />

              <div>
                <label className="block text-[var(--cream)] text-xs font-semibold mb-1.5">What does your child love?</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {suggestedInterests.map(i => (
                    <button key={i} type="button" onClick={() => toggleInterest(i)}
                      className={`px-3 py-1 rounded-full border text-xs transition-all ${interests.includes(i) ? 'border-[var(--gold)] bg-[rgba(245,196,94,.15)] text-[var(--gold)]' : 'border-[rgba(245,196,94,.3)] bg-[rgba(255,255,255,.04)] text-[var(--cream-dim)]'}`}>
                      {i}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={customInterest} onChange={e => setCustomInterest(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomInterest(); } }} placeholder="Add your own…" className={`${inputCls} flex-1`} style={inputStyle} />
                  <button type="button" onClick={addCustomInterest} className="px-3 py-2 rounded-md border border-[rgba(245,196,94,.3)] text-[var(--gold)] text-sm hover:bg-[rgba(245,196,94,.1)] transition-all">+</button>
                </div>
              </div>

              <div className="border-t border-white/[0.1]" />

              <div>
                <label className="block text-[var(--cream)] text-xs font-semibold mb-1.5">Adventure style</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {suggestedAdventures.map(a => (
                    <button key={a} type="button" onClick={() => toggleAdventure(a)}
                      className={`px-3 py-1 rounded-full border text-xs transition-all ${adventureType.includes(a) ? 'border-[var(--gold)] bg-[rgba(245,196,94,.15)] text-[var(--gold)]' : 'border-[rgba(245,196,94,.3)] bg-[rgba(255,255,255,.04)] text-[var(--cream-dim)]'}`}>
                      {a}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={customAdventure} onChange={e => setCustomAdventure(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomAdventure(); } }} placeholder="Add your own…" className={`${inputCls} flex-1`} style={inputStyle} />
                  <button type="button" onClick={addCustomAdventure} className="px-3 py-2 rounded-md border border-[rgba(245,196,94,.3)] text-[var(--gold)] text-sm hover:bg-[rgba(245,196,94,.1)] transition-all">+</button>
                </div>
              </div>

              <div className="border-t border-white/[0.1]" />

              <div>
                <label className="block text-[var(--cream)] text-xs font-semibold mb-1.5">What time should the chapter arrive?</label>
                <input type="time" value={deliveryTime} onChange={e => setDeliveryTime(e.target.value)} className={inputCls} style={inputStyle} />
              </div>

              <div className="border-t border-white/[0.1]" />

              <div>
                <label className="block text-[var(--cream)] text-xs font-semibold mb-1.5">Child's Name (or a character name)</label>
                <input type="text" value={childName} onChange={e => setChildName(e.target.value)} placeholder="e.g., Allie" className={inputCls} style={inputStyle} />
              </div>

              <div>
                <label className="block text-[var(--cream)] text-xs font-semibold mb-1.5">Pronouns</label>
                <div className="flex gap-2">
                  {['she/her', 'he/him', 'they/them'].map(p => (
                    <button key={p} type="button" onClick={() => setPronouns(p)}
                      className={`px-3 py-1.5 rounded-md border text-sm transition-all ${pronouns === p ? 'border-[var(--gold)] bg-[rgba(245,196,94,.15)] text-[var(--gold)]' : 'border-[rgba(245,196,94,.3)] bg-[rgba(255,255,255,.04)] text-[var(--cream-dim)]'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {submitError && (
                <div className="rounded-lg px-4 py-3 text-sm text-red-300 border border-red-500/30" style={{ background: 'rgba(239,68,68,.08)' }}>
                  {submitError}
                </div>
              )}

              <div className="flex items-center justify-center gap-1.5 text-[0.65rem] text-[var(--cream-dim)] italic pt-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                <span>We collect as little as possible about your child</span>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full font-bold text-base text-[var(--night-1)] px-6 py-3 rounded-xl border-none cursor-pointer relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: 'linear-gradient(135deg,var(--gold-lt),var(--gold-deep))', boxShadow: '0 8px 24px var(--amber-glow)' }}>
                <span className="absolute top-0 -left-[120%] w-[60%] h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -skew-x-12 transition-[left] duration-[600ms] group-hover:left-[130%]" />
                {isSubmitting ? 'Adding…' : 'Add Child to My Quest →'}
              </button>
            </form>
          )}

          {step === 'success' && (
            <div className="text-center py-4">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full grid place-items-center text-4xl" style={{ background: 'linear-gradient(135deg,var(--gold-lt),var(--gold-deep))', boxShadow: '0 14px 40px var(--amber-glow)' }}>
                ✓
              </div>
              <h2 className="text-3xl font-semibold text-[var(--cream)] mb-3" style={{ fontFamily: 'var(--display)' }}>
                Quest Added!
              </h2>
              <p className="text-[var(--gold)] italic mb-6" style={{ fontFamily: 'var(--display)' }}>
                {childName ? `${childName}'s` : "Your child's"} adventure begins tonight.
              </p>
              <div className="rounded-xl px-5 py-4 border border-[rgba(245,196,94,.5)] mb-8 text-left" style={{ background: 'rgba(245,196,94,.08)' }}>
                <p className="text-[var(--gold)] font-bold text-sm mb-2">⚠️ Important — do this now!</p>
                <ul className="space-y-1.5 text-sm text-[var(--cream-dim)]">
                  <li className="flex gap-2"><span className="text-[var(--gold)] flex-shrink-0">1.</span><span>Check your <strong className="text-[var(--cream)]">spam / junk folder</strong> and mark the first email <strong className="text-[var(--cream)]">Not Spam</strong></span></li>
                  <li className="flex gap-2"><span className="text-[var(--gold)] flex-shrink-0">2.</span><span>Add <strong className="text-[var(--cream)] font-mono">stories@nightlyquest.com</strong> to your contacts</span></li>
                </ul>
              </div>
              <button onClick={onClose} className="font-semibold text-base text-[var(--night-1)] px-8 py-3 rounded-xl relative overflow-hidden group" style={{ background: 'linear-gradient(135deg,var(--gold-lt),var(--gold-deep))', boxShadow: '0 8px 24px var(--amber-glow)' }}>
                <span className="absolute top-0 -left-[120%] w-[60%] h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -skew-x-12 transition-[left] duration-[600ms] group-hover:left-[130%]" />
                Back to NightlyQuest
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
