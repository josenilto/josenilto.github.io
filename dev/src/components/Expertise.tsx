import { Card } from "@/components/ui/card";
import { Cloud, GitBranch, Shield, Server } from "lucide-react";

const Expertise = () => {
  const expertiseAreas = [
    {
      icon: Cloud,
      title: "Cloud & Infraestrutura",
      description:
        "Azure, AWS, GCP, OCI, IBM Cloud — on-premises e ambientes híbridos com foco em disponibilidade, escalabilidade e performance.",
      gradient: "from-blue-500/20 to-cyan-500/20",
    },
    {
      icon: GitBranch,
      title: "DevOps & IaC",
      description:
        "Automação com Terraform, Ansible, Vagrant e Puppet. Pipelines CI/CD com Jenkins, GitHub Actions, GitLab e Bitbucket.",
      gradient: "from-green-500/20 to-emerald-500/20",
    },
    {
      icon: Shield,
      title: "SRE & Observabilidade",
      description:
        "Monitoramento com Zabbix, Grafana, Prometheus, Telegraf, Elastic e New Relic. Análise de incidentes com práticas ITIL.",
      gradient: "from-yellow-500/20 to-orange-500/20",
    },
    {
      icon: Server,
      title: "Plataformas & Microsserviços",
      description:
        "Kubernetes, Docker, Nginx, Apache, JBoss, Tomcat, IIS. Bancos de dados: MySQL, PostgreSQL, MongoDB, SQL Server, Oracle.",
      gradient: "from-purple-500/20 to-pink-500/20",
    },
  ];

  return (
    <section id="expertise" className="py-24">
      <div className="container mx-auto px-6">
        <div className="space-y-12">
          <div className="text-center space-y-4 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-display font-bold">
              Áreas de <span className="text-primary">Expertise</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Competências técnicas que impulsionam transformação digital e excelência operacional
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {expertiseAreas.map((area, index) => (
              <Card
                key={area.title}
                className="p-6 card-glass border-glow hover:border-primary transition-all duration-500 group cursor-pointer animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={`mb-6 p-4 rounded-xl bg-gradient-to-br ${area.gradient} w-fit group-hover:scale-110 transition-transform duration-300`}
                >
                  <area.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-display font-bold mb-3 group-hover:text-primary transition-colors duration-300">
                  {area.title}
                </h3>
                <p className="text-muted-foreground text-sm">{area.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Expertise;
