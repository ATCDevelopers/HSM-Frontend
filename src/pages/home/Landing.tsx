import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000); // change image every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Top nav */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 sm:px-10 py-5 bg-white shadow-sm">
        <h1 className="text-2xl font-serif tracking-widest text-[#173A5E]">
          HMS
        </h1>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700">
          <a href="#home">Home</a>
          <a href="#about">About Us</a>
          <a href="#service">Service</a>
          <a href="#contact">Contact</a>
        </nav>
        <button
          onClick={() => navigate("/login")}
          className="rounded-full bg-[#173A5E] px-5 py-2 text-sm font-semibold text-white hover:bg-[#20507f]"
        >
          Login
        </button>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 sm:px-10 py-16 sm:py-24 h-[560px] flex items-center">
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

        {/* Overlay — lighter now so the photo is actually visible */}
        <div className="absolute inset-0 bg-[#173A5E]/40" />

        {/* rest of the section (dots, text, stats card) stays exactly the same */}
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

        {/* Content sits above the image + overlay */}
        <div className="relative z-10 max-w-xl">
          <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
            YOUR HEALTH,
            <br />
            <span className="text-blue-300">OUR PRIORITY.</span>
          </h2>
          <p className="mt-5 text-blue-100 text-sm sm:text-base">
            World-class specialists, cutting-edge technology, and compassionate
            care — all under one roof. Your health is our priority.
          </p>
          <button
            onClick={() => navigate("/get-started")}
            className="mt-7 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#173A5E] hover:bg-blue-50"
          >
            Get Started
          </button>
        </div>

        {/* Stats card */}
        <div className="relative z-10 mt-10 lg:absolute lg:right-10 lg:top-1/2 lg:-translate-y-1/2 lg:mt-0 max-w-xs rounded-2xl bg-white/95 p-6 shadow-xl">
          <p className="text-sm font-semibold text-gray-500 mb-3">Our impact</p>
          <div className="space-y-3">
            {[
              ["Patients served", "120+"],
              ["Specialists", "80+"],
              ["Success rate", "98.9%"],
              ["Years of care", "40+"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-gray-500">{label}</span>
                <span className="font-bold text-[#173A5E]">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section
        id="about"
        className="px-6 sm:px-10 py-16 bg-blue-50 text-center"
      >
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Why Choose Us
        </h3>
        <p className="mt-2 text-gray-500 max-w-xl mx-auto text-sm sm:text-base">
          Experience healthcare designed around you — advanced, accessible, and
          always compassionate.
        </p>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl bg-white p-6 shadow-sm text-left"
            >
              <div className="text-2xl">{f.icon}</div>
              <h4 className="mt-3 font-bold text-gray-900 text-sm">
                {f.title}
              </h4>
              <p className="mt-1 text-xs text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section id="service" className="px-6 sm:px-10 py-16">
        <p className="text-xs font-semibold text-blue-600 mb-1">
          -- Our Services
        </p>
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 max-w-lg">
          Comprehensive care <span className="text-blue-600">for</span> every
          stage of life
        </h3>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SERVICES.map((s) => (
            <div key={s.title} className="rounded-2xl bg-blue-50 p-6">
              <div className="text-2xl">{s.icon}</div>
              <h4 className="mt-3 font-bold text-gray-900 text-sm">
                {s.title}
              </h4>
              <p className="mt-1 text-xs text-gray-500">{s.desc}</p>
              <button className="mt-3 text-xs font-semibold text-blue-600">
                learn more →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        id="contact"
        className="bg-[#173A5E] px-6 sm:px-10 py-14 text-center"
      >
        <h4 className="text-xl font-serif tracking-widest text-white">HMS</h4>
        <p className="mt-3 text-blue-100 text-sm max-w-md mx-auto">
          Exceptional healthcare rooted in science, delivered with compassion.
          Your well-being is our life's work.
        </p>
        <p className="mt-8 text-xs text-blue-300">
          © 2026 Lumina Health Medical Center. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
