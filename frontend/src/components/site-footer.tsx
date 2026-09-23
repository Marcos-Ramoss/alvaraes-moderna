import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin, Youtube } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.35fr_0.8fr_0.8fr_1.25fr]">
        <div>
          <Link to="/" className="group inline-flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="Logo Alvarães Moderna" 
              className="size-12 rounded-xl object-contain bg-white p-1 shadow-sm transition-transform duration-300 group-hover:scale-105" 
            />
            <span className="flex flex-col">
              <span className="font-display text-2xl font-semibold">Alvarães <span className="italic text-accent">Moderna</span></span>
              <span className="text-xs text-primary-foreground/65">Alvarães perto de você.</span>
            </span>
          </Link>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-primary-foreground/75">
            Notícias, serviços, oportunidades e histórias que conectam pessoas e fortalecem nossa comunidade.
          </p>
          <div className="mt-5 flex gap-2">
            {[Facebook, Instagram, Youtube].map((Icon, index) => <a key={index} href="#" aria-label={index === 0 ? "Facebook" : index === 1 ? "Instagram" : "YouTube"} className="flex size-8 items-center justify-center rounded-full border border-primary-foreground/30 hover:bg-primary-foreground/10"><Icon className="size-4" /></a>)}
          </div>
        </div>

        <FooterColumn title="Links rápidos" links={[["Início", "/"], ["Notícias", "/noticias"], ["Comércios", "/comercios"], ["Agenda", "/agenda"], ["Cursos e oportunidades", "/cursos"], ["Boletim", "/boletim"], ["Sobre", "/sobre"]]} />
        <FooterColumn title="Para você" links={[["Anuncie no portal", "/anuncie"], ["Envie uma sugestão", "/contato"], ["Fale com a gente", "/contato"], ["Política de privacidade", "/privacidade"], ["Termos de uso", "/privacidade"]]} />

        <div>
          <h2 className="font-display text-lg">Newsletter</h2>
          <p className="mt-2 text-sm text-primary-foreground/70">Receba as principais noticias de Alvarães no seu e-mail.</p>
          <Link to="/boletim" className="mt-4 flex items-center justify-between rounded-full bg-background/95 px-4 py-2 text-xs text-foreground"><span>Seu melhor e-mail</span><span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">→</span></Link>
          <label className="mt-3 flex items-center gap-2 text-[10px] text-primary-foreground/65"><input type="checkbox" className="accent-accent" /> Aceito receber comunicações do Alvarães Moderna.</label>
          <p className="mt-5 flex items-center gap-2 text-xs text-primary-foreground/75"><MapPin className="size-4" /> Alvarães, AM</p>
          <p className="ml-6 text-[10px] text-primary-foreground/55">Gente, lugar e futuro em uma só cidade.</p>
        </div>
      </div>
      <div className="border-t border-primary-foreground/15 bg-background px-4 py-3 text-[10px] text-foreground/70"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-2 sm:flex-row"><span>© 2026 Alvarães Moderna. Todos os direitos reservados.</span><span>Feito com ♥ para nossa cidade.</span></div></div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: Array<[string, string]> }) {
  return <div><h2 className="font-display text-lg">{title}</h2><ul className="mt-3 space-y-2 text-sm text-primary-foreground/70">{links.map(([label, to]) => <li key={`${to}-${label}`}><Link to={to} className="hover:text-primary-foreground">{label}</Link></li>)}</ul></div>;
}
