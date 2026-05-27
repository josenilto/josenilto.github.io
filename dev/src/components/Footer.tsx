const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="py-12 border-t border-border">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-glow-subtle flex items-center justify-center">
              <span className="text-sm font-display font-bold">JLS</span>
            </div>
            <span className="font-display font-bold">Josenilto L Silva</span>
          </div>

          <p className="text-muted-foreground text-sm text-center">
            © {currentYear} Josenilto Luis da Silva. Todos os direitos reservados.
          </p>

          <div className="flex gap-4">
            <a
              href="https://github.com/josenilto"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors duration-300"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/josenilto"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors duration-300"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
