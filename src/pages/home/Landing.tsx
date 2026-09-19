import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

const SLIDES = [
  "/hero/hero1.webp",
  "/hero/hero2.jfif",
  "/hero/hero3.jfif",
  "/hero/hero4.avif",
  "/hero/hero5.jfif",
  "/hero/hero6.jpg",
];

const FEATURES = [
  {
    icon: "👨‍⚕️",
    title: "Expert specialists",
    desc: "Board-certified doctors from top institutions, dedicated to your recovery.",
  },
  {
    icon: "🔬",
    title: "Advanced diagnostics",
    desc: "AI-assisted imaging and rapid lab results for precise, early detection.",
  },
  {
    icon: "❤️",
    title: "Compassionate care",
    desc: "A patient-first approach that treats you as a person, not just a condition.",
  },
  {
    icon: "🕐",
    title: "24/7 availability",
    desc: "Emergency, ICU, and urgent care services available around the clock.",
  },
];

const SERVICES = [
  {
    icon: "🫀",
    title: "Cardiology",
    desc: "Advanced heart care including diagnostics, interventional procedures, and cardiac rehabilitation.",
  },
  {
    icon: "🧠",
    title: "Neurology",
    desc: "Expert diagnosis and treatment for conditions affecting the brain, spine, and nervous system.",
  },
  {
    icon: "🫁",
    title: "Pulmonology",
    desc: "Comprehensive respiratory care, from pulmonology to advanced lung diagnostics.",
  },
  {
    icon: "🧸",
    title: "Pediatrics",
    desc: "Gentle, specialized care for infants, children, and adolescents in a welcoming environment.",
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Top nav */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="flex items-center justify-between px-4 sm:px-10 py-4 sm:py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#173A5E] font-bold text-white shadow-xs">
              <span className="text-base font-black">H</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-widest text-[#173A5E]">
              HMS
            </h1>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700">
            <a href="#home" className="hover:text-blue-600 transition-colors">Home</a>
            <a href="#about" className="hover:text-blue-600 transition-colors">About Us</a>
            <a href="#service" className="hover:text-blue-600 transition-colors">Service</a>
            <a href="#contact" className="hover:text-blue-600 transition-colors">Contact</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="rounded-full bg-[#173A5E] px-4 sm:px-6 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-[#20507f] transition-all"
            >
              Staff Portal
            </button>

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-5 w-5" />
              ) : (
                <Bars3Icon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 shadow-lg animate-fadeIn">
            <div className="flex flex-col space-y-3 text-sm font-medium text-gray-800">
              <a
                href="#home"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-blue-600"
              >
                Home
              </a>
              <a
                href="#about"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-blue-600"
              >
                About Us
              </a>
              <a
                href="#service"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-blue-600"
              >
                Services
              </a>
              <a
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-blue-600"
              >
                Contact
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section id="home" className="relative overflow-hidden px-4 sm:px-10 py-16 sm:py-24 min-h-[560px] lg:h-[600px] flex items-center">
        {/* Slideshow background images — crossfade between slides */}
        {SLIDES.map((src, i) => (
          <div
            key={src}
            className="absolute inset-0 bg-cover bg-no-repeat transition-opacity duration-1000"
            style={{
              backgroundImage: `url(${src})`,
              backgroundPosition: "center 20%",
              opacity: i === currentSlide ? 1 : 0,
            }}
          />
        ))}

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-[#173A5E]/40" />

        {/* Slide indicator dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-2 rounded-full transition-all ${
                i === currentSlide ? "w-6 bg-white" : "w-2 bg-white/40"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-xl text-left">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
            YOUR HEALTH,
            <br />
            <span className="text-blue-300">OUR PRIORITY.</span>
          </h2>
          <p className="mt-4 sm:mt-5 text-blue-100 text-sm sm:text-base leading-relaxed">
            World-class specialists, cutting-edge technology, and compassionate
            care — all under one roof. Your health is our priority.
          </p>
          <div className="mt-6 sm:mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/get-started")}
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#173A5E] shadow-md hover:bg-blue-50 transition-all active:scale-95"
            >
              Get Started
            </button>
            <button
              onClick={() => navigate("/login")}
              className="rounded-full bg-blue-600/90 backdrop-blur-xs px-6 py-3 text-sm font-semibold text-white border border-blue-400/30 hover:bg-blue-600 transition-all active:scale-95"
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Stats card (Desktop & Tablet) */}
        <div className="hidden md:block relative z-10 lg:absolute lg:right-10 lg:top-1/2 lg:-translate-y-1/2 max-w-xs rounded-2xl bg-white/95 backdrop-blur-md p-6 shadow-xl border border-white/40">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Our Impact</p>
          <div className="space-y-3">
            {[
              ["Patients served", "120+"],
              ["Specialists", "80+"],
              ["Success rate", "98.9%"],
              ["Years of care", "40+"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between items-center text-sm border-b border-gray-100 pb-1.5 last:border-0 last:pb-0">
                <span className="text-gray-500 text-xs">{label}</span>
                <span className="font-bold text-[#173A5E]">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section
        id="about"
        className="px-4 sm:px-10 py-14 sm:py-20 bg-blue-50/70 text-center"
      >
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Why Choose Us
          </h3>
          <p className="mt-2 text-gray-500 max-w-xl mx-auto text-sm sm:text-base">
            Experience healthcare designed around you — advanced, accessible, and
            always compassionate.
          </p>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl bg-white p-6 shadow-xs border border-gray-100 text-left transition-all hover:shadow-md"
              >
                <div className="text-2xl">{f.icon}</div>
                <h4 className="mt-3 font-bold text-gray-900 text-sm">
                  {f.title}
                </h4>
                <p className="mt-1 text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="service" className="px-4 sm:px-10 py-14 sm:py-20 max-w-6xl mx-auto">
        <p className="text-xs font-semibold text-blue-600 mb-1 tracking-wider uppercase">
          Our Services
        </p>
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 max-w-lg">
          Comprehensive care <span className="text-blue-600">for</span> every
          stage of life
        </h3>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SERVICES.map((s) => (
            <div key={s.title} className="rounded-2xl bg-blue-50/60 border border-blue-100/80 p-6 flex flex-col justify-between hover:bg-blue-50 transition-colors">
              <div>
                <div className="text-2xl">{s.icon}</div>
                <h4 className="mt-3 font-bold text-gray-900 text-sm">
                  {s.title}
                </h4>
                <p className="mt-1 text-xs text-gray-600 leading-relaxed">{s.desc}</p>
              </div>
              <button className="mt-4 text-xs font-semibold text-blue-600 hover:text-blue-700 text-left">
                Learn more →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        id="contact"
        className="bg-[#173A5E] px-4 sm:px-10 py-12 text-center text-white"
      >
        <div className="max-w-4xl mx-auto">
          <h4 className="text-xl font-serif font-bold tracking-widest text-white">HMS</h4>
          <p className="mt-3 text-blue-100 text-sm max-w-md mx-auto leading-relaxed">
            Exceptional healthcare rooted in science, delivered with compassion.
            Your well-being is our life's work.
          </p>
          <div className="mt-8 pt-6 border-t border-blue-800 text-xs text-blue-300">
            © 2026 Lumina Health Medical Center. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
