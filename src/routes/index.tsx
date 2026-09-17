import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight, ArrowRight, ChevronRight, CircleUserRound, Clock3,
  Dumbbell, Instagram, MapPin, Menu, Minus, PackageCheck, Plus, Search,
  ShieldCheck, ShoppingBag, Sparkles, Star, Trash2, Truck, X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import facadeAsset from "@/assets/loja-monst-sa.png.asset.json";
import mascotRetroAsset from "@/assets/mascote-retro.png.asset.json";
import mascotEnergyAsset from "@/assets/mascote-energia.png.asset.json";
import campaignAsset from "@/assets/campanha-kit.png.asset.json";
import productsImage from "@/assets/monst-products.jpg";
import kitImage from "@/assets/monst-kit.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MONST.SA | Energia para gente real" },
      { name: "description", content: "Suplementos, kits e atitude para transformar sua rotina. Entre no universo MONST.SA." },
      { property: "og:title", content: "MONST.SA | Energia para gente real" },
      { property: "og:description", content: "Suplementos, kits e atitude para transformar sua rotina." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MonstStore,
});

type Product = { id: number; name: string; category: string; price: number; oldPrice?: number; flavor: string; shape: "tub" | "jar" | "pouch"; tone?: string };
type CartItem = Product & { quantity: number };

const products: Product[] = [
  { id: 1, name: "Whey Protein Monst", category: "Whey Protein", price: 149.9, oldPrice: 179.9, flavor: "Chocolate", shape: "tub" },
  { id: 2, name: "Creatina Monst 300g", category: "Creatina", price: 89.9, flavor: "100% Pura", shape: "jar", tone: "light" },
  { id: 3, name: "Pré-Treino Explosive", category: "Pré-Treino", price: 109.9, oldPrice: 129.9, flavor: "Tangerina", shape: "jar" },
  { id: 4, name: "Whey Monst Cookies", category: "Whey Protein", price: 159.9, flavor: "Cookies & Cream", shape: "tub", tone: "orange" },
  { id: 5, name: "Pasta Monst Crunch", category: "Nutrição", price: 42.9, flavor: "Amendoim", shape: "jar", tone: "light" },
  { id: 6, name: "Kit Monst Performance", category: "Kits", price: 299.9, oldPrice: 349.9, flavor: "Rotina completa", shape: "pouch" },
];

const categories: Array<[string, string, string]> = [
  ["01", "Whey Protein", "Proteína para grandes conquistas."],
  ["02", "Creatina", "Força real, todos os dias."],
  ["03", "Pré-Treino", "Energia antes do primeiro rep."],
  ["04", "Hipercalórico", "Mais calorias. Mais construção."],
  ["05", "Vitaminas", "Base forte para a rotina."],
  ["06", "Acessórios", "Tudo que acompanha o corre."],
];

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function BrandMark({ compact = false }: { compact?: boolean }) {
  return <span className="brand-mark" aria-label="MONST.SA"><span className="brand-eye"><i /></span><b>MONST<span>.SA</span></b>{!compact && <small>SUPLEMENTOS ALIMENTARES</small>}</span>;
}

function ProductVisual({ product }: { product: Product }) {
  return (
    <div className={`pack pack-${product.shape} pack-${product.tone ?? "dark"}`} aria-hidden="true">
      <div className="pack-lid" />
      <div className="pack-label">
        <span className="mini-eye">●</span>
        <small>MONST.SA</small>
        <strong>{product.category === "Whey Protein" ? "MONST WHEY" : product.name.replace("Monst", "").replace("300g", "")}</strong>
        <em>{product.flavor}</em>
      </div>
    </div>
  );
}

function MonstStore() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const navigation: Array<[string, string]> = [["Início","inicio"],["Produtos","produtos"],["Categorias","categorias"],["Kits","kits"],["Sobre a MONST","sobre"],["Contato","contato"]];

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible")), { threshold: 0.14 });
    document.querySelectorAll(".reveal").forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const filtered = useMemo(() => products.filter((product) => {
    const matchesSearch = `${product.name} ${product.category} ${product.flavor}`.toLowerCase().includes(query.toLowerCase());
    return matchesSearch && (category === "Todos" || product.category === category);
  }), [query, category]);

  const addToCart = (product: Product) => {
    setCart((current) => current.some((item) => item.id === product.id)
      ? current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      : [...current, { ...product, quantity: 1 }]);
    toast.success("Entrou no seu kit!", { description: product.name });
  };
  const updateQuantity = (id: number, delta: number) => setCart((current) => current.map((item) => item.id === id ? { ...item, quantity: item.quantity + delta } : item).filter((item) => item.quantity > 0));
  const scrollTo = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); setMenuOpen(false); };

  return (
    <main className="overflow-hidden bg-background text-foreground">
      <header className="site-header">
        <a href="#inicio" className="shrink-0"><BrandMark compact /></a>
        <nav className="desktop-nav" aria-label="Navegação principal">
          {navigation.map(([label,id]) => <button key={id} onClick={() => scrollTo(id)}>{label}</button>)}
        </nav>
        <div className="header-actions">
          <Button className="desktop-only" variant="ghost" size="icon" aria-label="Pesquisar" onClick={() => setSearchOpen(true)}><Search /></Button>
          <Button className="desktop-only" variant="ghost" size="icon" aria-label="Minha conta" onClick={() => toast("Área de conta demonstrativa")}><CircleUserRound /></Button>
          <Button variant="ghost" size="icon" className="cart-button" aria-label={`Carrinho com ${count} itens`} onClick={() => setCartOpen(true)}><ShoppingBag />{count > 0 && <span>{count}</span>}</Button>
          <Button className="desktop-buy" variant="hero" onClick={() => scrollTo("produtos")}>Comprar agora</Button>
          <Button className="mobile-menu" variant="ghost" size="icon" aria-label="Abrir menu" onClick={() => setMenuOpen(true)}><Menu /></Button>
        </div>
      </header>

      <div className={`mobile-panel ${menuOpen ? "open" : ""}`} aria-hidden={!menuOpen}>
        <Button variant="ghost" size="icon" aria-label="Fechar menu" onClick={() => setMenuOpen(false)}><X /></Button>
        <BrandMark />
        {navigation.map(([label,id], i) => <button key={id} style={{ transitionDelay: `${i * 50}ms` }} onClick={() => scrollTo(id)}>{label}<ArrowRight /></button>)}
      </div>

      {searchOpen && <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Buscar produtos">
        <Button variant="ghost" size="icon" aria-label="Fechar busca" onClick={() => { setSearchOpen(false); setQuery(""); }}><X /></Button>
        <span>BUSCA MONST</span><input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="O que move seu treino?" />
        <div>{query ? filtered.slice(0, 4).map((p) => <button key={p.id} onClick={() => { setSearchOpen(false); scrollTo("produtos"); }}>{p.name}<ChevronRight /></button>) : <p>Experimente “creatina” ou “whey”.</p>}{query && filtered.length === 0 && <p>Nada por aqui. Tente outro termo.</p>}</div>
      </div>}

      <section id="inicio" className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">SUPLEMENTOS PARA GENTE REAL <Sparkles /></span>
          <h1>SEU TREINO.<br />SUA ENERGIA.<br /><em>SEU MONST.</em></h1>
          <p>Força, sabor e atitude para quem transforma rotina em resultado — sem perder a diversão.</p>
          <div className="hero-buttons"><Button variant="hero" size="hero" onClick={() => scrollTo("produtos")}>Explorar produtos <ArrowDownRight /></Button><Button variant="inverse" size="hero" onClick={() => scrollTo("sobre")}>Conheça a MONST</Button></div>
          <div className="hero-proof"><b>4,9 <Star /></b><span>UMA TROPA INTEIRA<br />TREINANDO COM A GENTE</span></div>
        </div>
        <div className="hero-art" aria-label="Mascote MONST.SA em destaque">
          <span className="hero-outline">VEM PRO<br />TIME</span>
          <img src={mascotRetroAsset.url} alt="Mascote laranja da MONST.SA em cenário retrô" width="311" height="414" />
          <div className="sticker sticker-one">100%<br /><b>MONST</b></div>
          <div className="sticker sticker-two">ENERGIA<br />SEM DESCULPA</div>
        </div>
      </section>

      <div className="impact-strip" aria-label="Energia, foco, performance, resultado, MONST.SA"><div>{Array.from({ length: 2 }).map((_, i) => <span key={i}>ENERGIA <i>✦</i> FOCO <i>✦</i> PERFORMANCE <i>✦</i> RESULTADO <i>✦</i> MONST.SA <i>✦</i> </span>)}</div></div>

      <section id="categorias" className="categories-section section-shell reveal">
        <div className="section-kicker"><span>01 / ESCOLHA SEU COMBUSTÍVEL</span><p>Do primeiro scoop ao último rep.</p></div>
        <div className="category-layout">
          <div className="category-title"><h2>QUAL É O<br /><em>SEU MONST?</em></h2><img src={productsImage} alt="Linha de suplementos MONST.SA" width="1536" height="1536" loading="lazy" /></div>
          <div className="category-list">{categories.map(([n, name, text]) => <button key={name} onClick={() => { setCategory(name === "Hipercalórico" || name === "Vitaminas" || name === "Acessórios" ? "Todos" : name); scrollTo("produtos"); }}><small>{n}</small><strong>{name}</strong><span>{text}</span><ArrowDownRight /></button>)}</div>
        </div>
      </section>

      <section id="produtos" className="products-section section-shell">
        <div className="product-heading reveal"><div><span className="eyebrow dark">SELEÇÃO DA TROPA</span><h2>OS QUERIDINHOS<br /><em>DO MONST</em></h2></div><p>Fórmulas diretas, sabores marcantes e embalagens que chegam com atitude.</p></div>
        <div className="filter-row" aria-label="Filtros de produtos">{["Todos", "Whey Protein", "Creatina", "Pré-Treino", "Kits"].map((item) => <Button key={item} variant={category === item ? "default" : "ghost"} onClick={() => setCategory(item)}>{item}</Button>)}</div>
        {filtered.length > 0 ? <div className="product-grid">{filtered.map((product, index) => <article key={product.id} className={`product-card reveal product-${index % 3}`}>
          <div className="product-visual"><span className="product-tag">{product.oldPrice ? "OFERTA" : "NOVO"}</span><ProductVisual product={product} /></div>
          <div className="product-info"><small>{product.category} · {product.flavor}</small><h3>{product.name}</h3><div className="rating"><span>★★★★★</span> 4,9</div><div className="price">{product.oldPrice && <s>{money.format(product.oldPrice)}</s>}<strong>{money.format(product.price)}</strong><small>ou 3x sem juros</small></div><Button variant="hero" onClick={() => addToCart(product)}>Comprar <ShoppingBag /></Button></div>
        </article>)}</div> : <div className="empty-state"><Search /><h3>NENHUM MONST ENCONTRADO</h3><p>Tente outro filtro para continuar.</p><Button onClick={() => { setCategory("Todos"); setQuery(""); }}>Ver todos</Button></div>}
      </section>

      <section className="benefits-bar section-shell reveal">
        {[[Truck,"ENVIO RÁPIDO","Do estoque para o seu treino."],[PackageCheck,"ESCOLHA CURADA","Só o que faz sentido na rotina."],[Dumbbell,"ATENDIMENTO MONST","Gente de verdade do outro lado."],[ShieldCheck,"COMPRA SEGURA","Sua experiência protegida."]].map(([Icon,title,text]) => { const BenefitIcon = Icon as typeof Truck; return <div key={String(title)}><BenefitIcon /><strong>{String(title)}</strong><span>{String(text)}</span></div>; })}
      </section>

      <section id="kits" className="kit-section">
        <div className="kit-image reveal"><img src={kitImage} alt="Kit completo MONST.SA com whey, creatina, pré-treino e acessórios" width="1536" height="1280" loading="lazy" /><span className="kit-stamp">KIT<br />TOP</span></div>
        <div className="kit-copy reveal"><span className="eyebrow">ROTINA COMPLETA / 04 ITENS</span><h2>KIT<br /><em>MONST</em></h2><p>Monte sua rotina. Potencialize seu treino. Um combo pensado para acompanhar cada fase do seu corre.</p><ul><li>Whey Protein 900g</li><li>Creatina 300g</li><li>Pré-Treino 300g</li><li>Coqueteleira MONST</li></ul><div><strong>R$ 299,90</strong><s>R$ 349,90</s></div><Button variant="ink" size="hero" onClick={() => { const kit = products.find((product) => product.category === "Kits"); if (kit) addToCart(kit); }}>Quero meu kit <ArrowRight /></Button></div>
      </section>

      <section id="sobre" className="about-section section-shell">
        <div className="about-copy reveal"><span className="section-number">02 / DNA MONST</span><h2>MAIS QUE<br />SUPLEMENTO.<br /><em>É MONST.</em></h2><p>A gente acredita em energia que aproxima, produto que acompanha e uma marca que fala a língua de quem treina. MONST.SA é força com sorriso no rosto — e presença em cada conquista.</p><div className="about-manifesto">SEM POSE.<br />SEM DESCULPA.<br /><b>SÓ EVOLUÇÃO.</b></div></div>
        <div className="about-visual reveal"><img src={campaignAsset.url} alt="Mascote MONST.SA segurando bandeira de campanha" width="509" height="595" loading="lazy" /><span>BRASILEIRA.<br />DIVERTIDA.<br />FORTE.</span></div>
      </section>

      <section className="store-section" id="contato">
        <div className="store-photo reveal"><img src={facadeAsset.url} alt="Fachada preta e laranja da loja física MONST.SA com mascote gigante" width="506" height="606" loading="lazy" /><span>VEM DE<br />PERTO</span></div>
        <div className="store-copy reveal"><span className="eyebrow dark">MONST.SA NO MUNDO REAL</span><h2>VEM CONHECER<br /><em>A MONST</em></h2><p>Uma loja com a mesma energia que você vê por aqui: atendimento próximo, seleção forte e o mascote te esperando na porta.</p><div className="store-details"><div><MapPin /><span><b>LOCALIZAÇÃO</b>Consulte nosso Instagram para o endereço atualizado.</span></div><div><Clock3 /><span><b>HORÁRIOS</b>Informações disponíveis nos canais oficiais.</span></div></div><Button variant="hero" onClick={() => toast("Contato demonstrativo", { description: "Os canais oficiais serão adicionados na versão final." })}>Falar com a equipe <ArrowRight /></Button><small>Informações demonstrativas — confirme nos canais oficiais.</small></div>
      </section>

      <section className="social-section section-shell">
        <div className="social-heading reveal"><h2>@MONST.SA</h2><span>ACOMPANHA O CORRE <Instagram /></span></div>
        <div className="social-grid reveal">
          <figure className="social-a"><img src={mascotEnergyAsset.url} alt="Mascote MONST.SA em campanha de energia" width="340" height="606" loading="lazy" /><figcaption>ENERGIA LÁ EM CIMA <ArrowDownRight /></figcaption></figure>
          <figure className="social-b"><img src={productsImage} alt="Produtos MONST.SA em composição laranja" width="1536" height="1536" loading="lazy" /><figcaption>SUPLEMENTAÇÃO COM ATITUDE <ArrowDownRight /></figcaption></figure>
          <figure className="social-c"><img src={mascotRetroAsset.url} alt="Mascote MONST.SA em cenário retrô brasileiro" width="311" height="414" loading="lazy" /><figcaption>O MONST TÁ ON <ArrowDownRight /></figcaption></figure>
          <figure className="social-d"><img src={facadeAsset.url} alt="Loja física MONST.SA" width="506" height="606" loading="lazy" /><figcaption>NOSSO PONTO DE ENCONTRO <ArrowDownRight /></figcaption></figure>
        </div>
      </section>

      <section className="testimonials-section section-shell reveal">
        <div><span className="section-number">03 / A TROPA FALA</span><h2>QUEM É MONST,<br /><em>RECONHECE.</em></h2><p>Depoimentos ilustrativos para esta experiência demonstrativa.</p></div>
        <div className="quotes">{[
          ["“Produtos chegaram rápido e o atendimento foi excelente. Já virou parte da rotina.”","CLIENTE MONST / DEMONSTRAÇÃO"],
          ["“Finalmente uma loja que tem energia de verdade e ajuda a montar o combo sem enrolação.”","ATLETA AMADOR / DEMONSTRAÇÃO"],
          ["“A identidade é incrível — e o cuidado com a seleção dos produtos também.”","CLIENTE LOCAL / DEMONSTRAÇÃO"],
        ].map(([quote, who], i) => <blockquote key={who}><span>0{i+1}</span><p>{quote}</p><cite>{who}</cite></blockquote>)}</div>
      </section>

      <section className="faq-section section-shell reveal">
        <div><span className="eyebrow dark">DÚVIDA? CHAMA O MONST.</span><h2>PERGUNTAS<br /><em>FREQUENTES</em></h2></div>
        <Accordion type="single" collapsible className="faq-list">
          {[["Quais formas de pagamento vocês aceitam?","Na demonstração, simulamos Pix e cartões. As condições oficiais serão informadas no fechamento do pedido."],["Vocês entregam em outras cidades?","Simulamos entregas nacionais. Prazos e cobertura reais dependerão do CEP informado."],["Quais marcas de suplementos vocês trabalham?","A curadoria reúne produtos selecionados para diferentes objetivos. Este conceito apresenta uma linha MONST demonstrativa."],["Posso retirar na loja?","A retirada poderá ser disponibilizada conforme estoque e horário da unidade."],["Como acompanhar meu pedido?","Após a compra, o acompanhamento seria enviado pelos canais cadastrados."]].map(([q,a], i) => <AccordionItem key={q} value={`faq-${i}`}><AccordionTrigger><span>0{i+1}</span>{q}</AccordionTrigger><AccordionContent>{a}</AccordionContent></AccordionItem>)}
        </Accordion>
      </section>

      <section className="final-cta reveal">
        <div className="final-words"><span>BORA?</span><h2>PRONTO PRA<br />VIRAR <em>MONST?</em></h2><Button variant="hero" size="hero" onClick={() => scrollTo("produtos")}>Explorar produtos <ArrowRight /></Button></div>
        <img src={mascotRetroAsset.url} alt="Mascote MONST.SA convidando para conhecer os produtos" width="311" height="414" loading="lazy" />
        <b className="giant-word">MONST</b>
      </section>

      <footer className="footer-section"><div className="footer-top"><BrandMark /><p>Suplementos alimentares<br />para gente real.</p><a href="#inicio">VOLTAR AO TOPO ↑</a></div><div className="footer-links"><div><b>EXPLORE</b><a href="#produtos">Produtos</a><a href="#categorias">Categorias</a><a href="#kits">Kits</a></div><div><b>A MONST</b><a href="#sobre">Sobre</a><a href="#contato">Contato</a><button onClick={() => toast("Política de privacidade demonstrativa")}>Política de Privacidade</button></div><div><b>SOCIAL</b><button onClick={() => toast("Instagram demonstrativo")}>Instagram</button><button onClick={() => toast("WhatsApp demonstrativo")}>WhatsApp</button><button onClick={() => toast("TikTok demonstrativo")}>TikTok</button></div></div><div className="footer-bottom"><span>© 2026 MONST.SA — PROJETO DEMONSTRATIVO</span><span>ENERGIA PARA GENTE REAL.</span></div></footer>

      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent className="cart-drawer">
          <SheetHeader><SheetTitle>SEU KIT <em>MONST</em></SheetTitle><SheetDescription>{count} {count === 1 ? "item escolhido" : "itens escolhidos"}</SheetDescription></SheetHeader>
          <div className="cart-items">{cart.length === 0 ? <div className="cart-empty"><ShoppingBag /><h3>SEU KIT ESTÁ VAZIO</h3><p>Escolha seus favoritos e bora treinar.</p><Button variant="hero" onClick={() => { setCartOpen(false); scrollTo("produtos"); }}>Explorar produtos</Button></div> : cart.map((item) => <div className="cart-item" key={item.id}><ProductVisual product={item} /><div><small>{item.category}</small><strong>{item.name}</strong><b>{money.format(item.price)}</b><div className="qty"><Button variant="ghost" size="icon" aria-label="Diminuir" onClick={() => updateQuantity(item.id, -1)}><Minus /></Button><span>{item.quantity}</span><Button variant="ghost" size="icon" aria-label="Aumentar" onClick={() => updateQuantity(item.id, 1)}><Plus /></Button></div></div><Button variant="ghost" size="icon" aria-label="Remover" onClick={() => setCart((current) => current.filter((p) => p.id !== item.id))}><Trash2 /></Button></div>)}</div>
          {cart.length > 0 && <div className="cart-summary"><div><span>Subtotal</span><strong>{money.format(subtotal)}</strong></div><small>Frete calculado na próxima etapa.</small><Button variant="hero" size="hero" onClick={() => toast.success("Compra demonstrativa finalizada!", { description: "Nenhuma cobrança foi realizada." })}>Finalizar compra <ArrowRight /></Button></div>}
        </SheetContent>
      </Sheet>
    </main>
  );
}