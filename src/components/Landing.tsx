import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSmoothScroll } from "@/context/SmoothScrollContext";
import {
  ChevronRight,
  Activity,
  Shield,
  LineChart,
  Clock,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
} from "lucide-react";

const Landing = () => {
  const { lenis } = useSmoothScroll();
  const testimonialsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lenis && testimonialsRef.current) {
      const handleWheel = (e: WheelEvent) => {
        if (testimonialsRef.current?.contains(e.target as Node)) {
          e.preventDefault();
          testimonialsRef.current.scrollLeft += e.deltaY;
        }
      };

      testimonialsRef.current.addEventListener('wheel', handleWheel);
      return () => {
        testimonialsRef.current?.removeEventListener('wheel', handleWheel);
      };
    }
  }, [lenis]);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-2">
            <LineChart className="h-6 w-6 text-primary" />
            <span className="font-semibold text-xl">RecoverTrack</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-16">
        <section className="relative h-[90vh] flex items-center">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1631815589968-fdb09a223b1e')] bg-cover bg-center">
            <div className="absolute inset-0 bg-gradient-to-r from-background/95 to-background/50" />
          </div>
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                Your Journey to Recovery Starts Here
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl">
                Track your progress, connect with healthcare providers, and take control of your recovery journey.
              </p>
              <Link to="/signup">
                <Button size="lg" className="text-lg px-8">
                  Start Your Recovery <ArrowRight className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-24 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-12">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <Activity className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Track Progress</h3>
                <p className="text-muted-foreground">Log your daily metrics and monitor your recovery journey with detailed insights.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <LineChart className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Visualize Data</h3>
                <p className="text-muted-foreground">See your progress through interactive charts and comprehensive analytics.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Stay Connected</h3>
                <p className="text-muted-foreground">Keep your healthcare providers updated with your recovery progress.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-16">What Our Users Say</h2>
            <div 
              ref={testimonialsRef}
              className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory"
              style={{ scrollBehavior: 'smooth' }}
            >
              {[
                { name: 'Parth', text: 'RecoverTrack has been instrumental in my recovery journey. The ability to track my progress daily has kept me motivated.' },
                { name: 'Krishna', text: 'The interface is intuitive and the progress tracking features are exactly what I needed for my rehabilitation.' },
                { name: 'Ayush T', text: 'Being able to share my progress with my healthcare providers has made communication so much easier.' },
                { name: 'Bind Singh', text: 'The detailed analytics and progress tracking have helped me stay focused on my recovery goals.' }
              ].map((testimonial, i) => (
                <div
                  key={i}
                  className="min-w-[300px] md:min-w-[400px] p-6 rounded-xl bg-card shadow-lg snap-center"
                >
                  <p className="text-lg mb-4">{testimonial.text}</p>
                  <p className="font-semibold">{testimonial.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Expert Care at Your Fingertips</h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Our platform connects you with experienced healthcare providers who guide you through your recovery journey.
                  With RecoverTrack, you're never alone in your path to wellness.
                </p>
                <Link to="/signup">
                  <Button size="lg">Get Started</Button>
                </Link>
              </div>
              <div className="relative h-[400px]">
                <img
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d"
                  alt="Healthcare professional"
                  className="rounded-xl object-cover w-full h-full"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">We Care for Our Patients</h2>
            <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
              Our commitment to patient care goes beyond just tracking recovery. We provide a comprehensive support system
              to ensure you achieve the best possible outcomes in your recovery journey.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6">
                <Clock className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
                <p className="text-muted-foreground">Always here when you need us</p>
              </div>
              <div className="p-6">
                <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Secure Platform</h3>
                <p className="text-muted-foreground">Your data is safe with us</p>
              </div>
              <div className="p-6">
                <Activity className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Progress Tracking</h3>
                <p className="text-muted-foreground">Monitor your recovery journey</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-muted py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-4">About RecoverTrack</h3>
              <p className="text-muted-foreground">
                Empowering patients with tools to track and improve their recovery journey.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-muted-foreground hover:text-primary">About Us</Link></li>
                <li><Link to="/features" className="text-muted-foreground hover:text-primary">Features</Link></li>
                <li><Link to="/contact" className="text-muted-foreground hover:text-primary">Contact</Link></li>
                <li><Link to="/privacy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" /> +91 9354287664
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" /> +91 9811118455
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" /> recovertrack@email.com
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" /> New Delhi, India
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Follow Us</h3>
              <div className="flex gap-4">
                <a href="#" className="text-muted-foreground hover:text-primary">Twitter</a>
                <a href="#" className="text-muted-foreground hover:text-primary">LinkedIn</a>
                <a href="#" className="text-muted-foreground hover:text-primary">Facebook</a>
              </div>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} RecoverTrack. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
