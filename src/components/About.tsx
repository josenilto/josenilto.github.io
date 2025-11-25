import { Card } from "@/components/ui/card";

const About = () => {
  const highlights = [
    {
      title: "Experience & Credentials",
      description: "Over 10 years in technology with multiple certifications and a degree in Computer Science",
    },
    {
      title: "Technical Specialization",
      description: "Platform Engineer specialized in cloud architectures and digital transformation",
    },
    {
      title: "Tools Stack",
      description: "Azure, Terraform, Kubernetes, Docker, CI/CD with GitHub Actions and DevOps tools",
    },
    {
      title: "Community & Content",
      description: "Active speaker, mentor and technical content creator in the tech community",
    },
  ];

  return (
    <section id="about" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto space-y-12 animate-fade-in-up">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-display font-bold">
              About <span className="text-primary">Me</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Platform Engineer specialized in Cloud and DevOps, focused on digital transformation through innovative solutions.
            </p>
          </div>

          <div className="relative p-8 rounded-2xl border border-primary/20 bg-card/50 backdrop-blur-sm">
            <div className="absolute -top-4 left-8">
              <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold">
                Quote
              </div>
            </div>
            <blockquote className="text-2xl md:text-3xl font-display italic text-center pt-4">
              "Technology is a bridge, not a barrier, and I build bridges every day."
            </blockquote>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {highlights.map((highlight, index) => (
              <Card
                key={highlight.title}
                className="p-6 card-glass border-glow hover:border-primary transition-all duration-300 group cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <h3 className="text-xl font-display font-bold mb-3 group-hover:text-primary transition-colors duration-300">
                  {highlight.title}
                </h3>
                <p className="text-muted-foreground">
                  {highlight.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
