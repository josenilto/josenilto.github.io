import { Linkedin, Github, Youtube, Music2, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroProfile from "@/assets/hero-profile.jpg";

const Hero = () => {
  const socialLinks = [
    { icon: Linkedin, label: "LinkedIn", href: "#", color: "hover:text-[#0077b5]" },
    { icon: Github, label: "GitHub", href: "#", color: "hover:text-foreground" },
    { icon: Youtube, label: "YouTube", href: "#", color: "hover:text-[#ff0000]" },
    { icon: Music2, label: "Podcast", href: "#", color: "hover:text-[#1db954]" },
    { icon: Instagram, label: "Instagram", href: "#", color: "hover:text-[#e4405f]" },
  ];

  return (
    <section id="home" className="min-h-screen flex items-center pt-20">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in-up">
            <div className="space-y-2">
              <p className="text-primary text-sm font-semibold tracking-wider uppercase">
                Cloud & DevOps Specialist
              </p>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight">
                <span className="text-foreground">Your Name</span>
                <br />
                <span className="text-glow text-primary">Goes Here</span>
              </h1>
            </div>
            
            <p className="text-xl text-muted-foreground max-w-xl">
              Transforming the complexities of cloud environments into secure and scalable platforms.
            </p>

            <div className="flex flex-wrap gap-4">
              {socialLinks.map((social) => (
                <Button
                  key={social.label}
                  variant="outline"
                  size="lg"
                  className={`border-border hover:border-primary transition-all duration-300 ${social.color} group`}
                  asChild
                >
                  <a href={social.href} target="_blank" rel="noopener noreferrer">
                    <social.icon className="mr-2 h-5 w-5" />
                    {social.label}
                  </a>
                </Button>
              ))}
            </div>

            <div className="pt-4">
              <a href="#about" className="inline-flex flex-col items-center text-muted-foreground hover:text-primary transition-colors duration-300">
                <span className="text-sm mb-2">Learn more</span>
                <svg className="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </a>
            </div>
          </div>

          <div className="relative animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="relative rounded-3xl overflow-hidden border-2 border-border hover:border-primary transition-all duration-500 animate-glow-pulse">
              <img
                src={heroProfile}
                alt="Professional profile"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
