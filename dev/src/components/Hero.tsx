import { Linkedin, Github, Youtube, Rss, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroProfile from "@/assets/hero-profile.jpg";

const Hero = () => {
  const socialLinks = [
    {
      icon: Linkedin,
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/josenilto",
      color: "hover:text-[#0077b5]",
    },
    {
      icon: Github,
      label: "GitHub",
      href: "https://github.com/josenilto",
      color: "hover:text-foreground",
    },
    {
      icon: Youtube,
      label: "YouTube",
      href: "https://www.youtube.com/channel/UCk8gmswVN_4zDvo5eIfzQ4Q",
      color: "hover:text-[#ff0000]",
    },
    {
      icon: Instagram,
      label: "Instagram",
      href: "https://www.instagram.com/josenilto",
      color: "hover:text-[#e4405f]",
    },
    {
      icon: Rss,
      label: "Podcast",
      href: "#",
      color: "hover:text-[#1db954]",
    },
  ];

  return (
    <section id="home" className="min-h-screen flex items-center pt-20">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in-up">
            <div className="space-y-2">
              <p className="text-primary text-sm font-semibold tracking-wider uppercase">
                SRE / DevOps Specialist
              </p>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight">
                <span className="text-foreground">Josenilto</span>
                <br />
                <span className="text-glow text-primary">Luis da Silva</span>
              </h1>
            </div>

            <p className="text-xl text-muted-foreground max-w-xl">
              Mais de <strong>13 anos</strong> transformando ambientes de cloud em plataformas seguras,
              escaláveis e automatizadas.
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
                  <a
                    href={social.href}
                    target={social.href !== "#" ? "_blank" : undefined}
                    rel={social.href !== "#" ? "noopener noreferrer" : undefined}
                  >
                    <social.icon className="mr-2 h-5 w-5" />
                    {social.label}
                  </a>
                </Button>
              ))}
            </div>

            <div className="pt-4">
              <a
                href="#about"
                className="inline-flex flex-col items-center text-muted-foreground hover:text-primary transition-colors duration-300"
              >
                <span className="text-sm mb-2">Saiba mais</span>
                <svg
                  className="w-6 h-6 animate-bounce"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </a>
            </div>
          </div>

          <div className="relative animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="relative rounded-3xl overflow-hidden border-2 border-border hover:border-primary transition-all duration-500 animate-glow-pulse">
              <img
                src={heroProfile}
                alt="Foto de perfil de Josenilto Luis da Silva"
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
