import { Card } from "@/components/ui/card";

const About = () => {
  const highlights = [
    {
      title: "Experiência & Formação",
      description:
        "Mais de 13 anos em TI com certificações SFPC®, DEPC®, LGPDF™ e duas graduações: Sistemas da Informação (UNESA) e Ciência da Computação (UVA).",
    },
    {
      title: "Especialização Técnica",
      description:
        "SRE/DevOps especializado em infraestrutura, virtualização de servidores e arquitetura de soluções em nuvem (Azure, AWS, GCP, OCI, IBM).",
    },
    {
      title: "Stack de Ferramentas",
      description:
        "Terraform, Ansible, Kubernetes, Docker, Jenkins, GitHub Actions, Zabbix, Grafana, Prometheus, Elastic e muito mais.",
    },
    {
      title: "Comunidade & Conteúdo",
      description:
        "Criador de tutoriais técnicos no GitHub, com repositórios sobre Zabbix, Grafana, Prometheus, Nginx, Kubernetes e diversas outras tecnologias.",
    },
  ];

  return (
    <section id="about" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto space-y-12 animate-fade-in-up">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-display font-bold">
              Sobre <span className="text-primary">Mim</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              SRE/DevOps focado em transformação digital através de infraestrutura como código,
              automação e arquiteturas cloud-native.
            </p>
          </div>

          <div className="relative p-8 rounded-2xl border border-primary/20 bg-card/50 backdrop-blur-sm">
            <div className="absolute -top-4 left-8">
              <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold">
                Filosofia
              </div>
            </div>
            <blockquote className="text-2xl md:text-3xl font-display italic text-center pt-4">
              "Infraestrutura resiliente não é um destino — é uma prática contínua."
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
                <p className="text-muted-foreground">{highlight.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
