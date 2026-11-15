import { PageTemplateModel, PageDocument } from '../types/page';
import { createNewSection, createNewContainer, createNewPageElement } from '../utils/pageDefaults';

// 0. Template: VINKO LOG — Parceira de quem move o Brasil
export const createVinkoCaptureDoc = (): PageDocument => {
  // 1. Header Navbar Section
  const headerSec = createNewSection('Cabeçalho & Navegação', false);
  headerSec.style.backgroundColor = '#0b1612';
  headerSec.style.paddingTop = 16;
  headerSec.style.paddingBottom = 16;
  headerSec.style.borderBottomWidth = 1;
  headerSec.style.borderColor = 'rgba(255,255,255,0.08)';

  const navEmbed = createNewPageElement('html-embed');
  navEmbed.content.html = `
    <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
      <div style="display: flex; align-items: center; gap: 10px;">
        <div style="width: 32px; height: 32px; background: #70c300; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 20px; color: #0b1612;">K</div>
        <span style="font-weight: 900; font-size: 20px; color: #ffffff; letter-spacing: 0.5px;">VINKO <span style="font-size: 11px; font-weight: 700; color: #70c300; border: 1px solid #70c300; padding: 1px 4px; border-radius: 4px; margin-left: 2px;">LOG</span></span>
      </div>
      <div style="display: flex; align-items: center; gap: 24px; font-size: 14px; font-weight: 600; color: #cbd5e1;">
        <a href="#inicio" style="color: #70c300; border-bottom: 2px solid #70c300; padding-bottom: 4px;">Início</a>
        <a href="#passo-a-passo" style="color: #cbd5e1;">Passo a passo</a>
        <a href="#sobre" style="color: #cbd5e1;">Sobre a Vinko</a>
        <a href="#app" style="color: #cbd5e1;">Nosso App</a>
      </div>
      <div>
        <a href="#cadastro" style="display: inline-flex; align-items: center; gap: 8px; background: #073e2e; color: #ffffff; font-weight: 700; font-size: 13px; padding: 10px 18px; border-radius: 9999px; border: 1px solid #70c300; transition: all 0.2s;">
          <span>Seja um motorista parceiro</span>
          <span style="background: #70c300; color: #073e2e; border-radius: 9999px; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; font-size: 11px;">↗</span>
        </a>
      </div>
    </div>
  `;
  headerSec.containers[0].elements = [navEmbed];

  // 2. Hero Section with Form and Background
  const heroSec = createNewSection('Hero Principal & Formulário', false);
  heroSec.style.backgroundColor = '#0b1612';
  heroSec.style.backgroundImage = '/images/vinko/vinko-hero-screenshot.jpg';
  heroSec.style.backgroundSize = 'cover';
  heroSec.style.backgroundPosition = 'center right';
  heroSec.style.paddingTop = 64;
  heroSec.style.paddingBottom = 80;

  const heroCont = createNewContainer('2-col-equal');

  // Left: Form Card with glassmorphism
  const vinkoForm = createNewPageElement('form');
  vinkoForm.content.titleHtml = 'Vinko. Parceira de quem move o <span style="color: #70c300;">Brasil</span>.';
  vinkoForm.content.subtitle = 'Constância de carga, pagamento rápido e respeito em cada viagem';
  vinkoForm.content.buttonText = '➔ Faça seu cadastro e siga na melhor rota';
  vinkoForm.content.buttonBg = '#073e2e';
  vinkoForm.content.buttonTextColor = '#ffffff';
  vinkoForm.content.buttonBorder = '1px solid #70c300';
  vinkoForm.content.redirectUrl = '/obrigado';
  vinkoForm.content.fields = [
    { id: 'f-nome', name: 'nome', label: '', placeholder: 'Nome completo', type: 'text', required: true },
    { id: 'f-tel', name: 'telefone', label: '', placeholder: 'Telefone/Whatsapp', type: 'tel', halfWidth: true, required: true },
    { 
      id: 'f-uf', 
      name: 'estado', 
      label: '', 
      placeholder: 'Estado', 
      type: 'select', 
      halfWidth: true, 
      options: ['SP', 'MG', 'RJ', 'ES', 'PR', 'SC', 'RS', 'GO', 'MT', 'MS', 'BA', 'DF', 'Outro'],
      required: true 
    },
    { 
      id: 'f-tipo', 
      name: 'tipo_motorista', 
      label: '', 
      type: 'radio-group', 
      options: ['Sou TAC', 'Sou CNPJ'] 
    }
  ];
  vinkoForm.style.backgroundColor = 'rgba(4, 38, 28, 0.88)';
  vinkoForm.style.borderColor = 'rgba(112, 195, 0, 0.35)';
  vinkoForm.style.borderWidth = 1;
  vinkoForm.style.borderRadius = 20;
  vinkoForm.style.color = '#ffffff';
  vinkoForm.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.7)';

  // Right column spacer
  const rightSpacer = createNewPageElement('spacer');
  rightSpacer.content.height = 360;

  heroCont.elements = [vinkoForm, rightSpacer];
  heroSec.containers = [heroCont];

  // 3. Metrics Bar
  const statsSec = createNewSection('Estatísticas & Métricas', false);
  statsSec.style.backgroundColor = '#f8fafc';
  statsSec.style.paddingTop = 24;
  statsSec.style.paddingBottom = 48;

  const statsEmbed = createNewPageElement('html-embed');
  statsEmbed.content.html = `
    <div style="background: #ffffff; border-radius: 20px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; padding: 24px 32px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; text-align: center; margin-top: -50px; position: relative; z-index: 10;">
      <div style="border-right: 1px solid #f1f5f9; padding-right: 16px;">
        <div style="font-size: 32px; font-weight: 900; color: #073e2e; line-height: 1.1;">+1.400</div>
        <div style="font-size: 13px; font-weight: 600; color: #64748b; margin-top: 4px;">Viagens realizadas</div>
      </div>
      <div style="border-right: 1px solid #f1f5f9; padding-right: 16px;">
        <div style="font-size: 32px; font-weight: 900; color: #073e2e; line-height: 1.1;">+3.000</div>
        <div style="font-size: 13px; font-weight: 600; color: #64748b; margin-top: 4px;">Toneladas transportadas</div>
      </div>
      <div>
        <div style="font-size: 32px; font-weight: 900; color: #073e2e; line-height: 1.1;">+2.000</div>
        <div style="font-size: 13px; font-weight: 600; color: #64748b; margin-top: 4px;">Em frete pago</div>
      </div>
    </div>
  `;
  statsSec.containers[0].elements = [statsEmbed];

  // 4. Section: Na Vinko é simples (Inbound / Outbound)
  const sobreSec = createNewSection('Sobre a Vinko & Operações', false);
  sobreSec.style.backgroundColor = '#ffffff';
  sobreSec.style.paddingTop = 64;
  sobreSec.style.paddingBottom = 72;

  const sobreCont = createNewContainer('2-col-equal');
  
  // Left col: Text
  const sobreH = createNewPageElement('heading');
  sobreH.content.titleHtml = 'Na Vinko é simples: confiança construída na prática, <span style="color: #073e2e;">viagem após viagem.</span>';
  sobreH.content.text = 'Na Vinko é simples: confiança construída na prática, viagem após viagem.';
  sobreH.content.tag = 'h2';
  sobreH.style.fontSize = 32;
  sobreH.style.textAlign = 'left';
  sobreH.style.lineHeight = 1.25;

  const sobreP = createNewPageElement('paragraph');
  sobreP.content.text = 'A Vinko nasceu para ser diferente: uma transportadora digital que garante previsibilidade, respeito e remuneração justa.';
  sobreP.style.fontSize = 16;
  sobreP.style.color = '#475569';
  sobreP.style.textAlign = 'left';

  // Right col: Image collage
  const sobreImg = createNewPageElement('image');
  sobreImg.content.url = '/images/vinko/vinko-sobre-screenshot.jpg';
  sobreImg.content.alt = 'Frota de caminhões verdes e motoristas parceiros Vinko';

  sobreCont.elements = [sobreH, sobreP, sobreImg];

  // Sub-block: Quer rodar com a Vinko? Inbound & Outbound
  const cardsCont = createNewContainer('2-col-equal');
  const cardInbound = createNewPageElement('html-embed');
  cardInbound.content.html = `
    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.04); transition: transform 0.2s;">
      <div style="width: 32px; height: 32px; background: #70c300; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 16px; color: #073e2e; margin-bottom: 12px;">↗</div>
      <h4 style="font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">Inbound</h4>
      <p style="font-size: 13px; color: #64748b; margin: 0;">Minério, carvão, sucata</p>
    </div>
  `;

  const cardOutbound = createNewPageElement('html-embed');
  cardOutbound.content.html = `
    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.04); transition: transform 0.2s;">
      <div style="width: 32px; height: 32px; background: #70c300; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 16px; color: #073e2e; margin-bottom: 12px;">↘</div>
      <h4 style="font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">Outbound</h4>
      <p style="font-size: 13px; color: #64748b; margin: 0;">Produtos e soluções em aço</p>
    </div>
  `;
  cardsCont.elements = [cardInbound, cardOutbound];

  sobreSec.containers = [sobreCont, cardsCont];

  // 5. Section: 4 passos simples na sua jornada
  const passosSec = createNewSection('4 Passos Simples na Sua Jornada', false);
  passosSec.style.backgroundColor = '#073e2e';
  passosSec.style.paddingTop = 72;
  passosSec.style.paddingBottom = 80;

  const passosTitle = createNewPageElement('heading');
  passosTitle.content.titleHtml = '4 passos simples na <span style="color: #70c300;">sua jornada</span>.';
  passosTitle.content.text = '4 passos simples na sua jornada.';
  passosTitle.content.tag = 'h2';
  passosTitle.style.fontSize = 34;
  passosTitle.style.color = '#ffffff';
  passosTitle.style.textAlign = 'center';

  const passosSub = createNewPageElement('paragraph');
  passosSub.content.text = 'Veja como é fácil começar com a Vinko:';
  passosSub.style.color = '#a7f3d0';
  passosSub.style.textAlign = 'center';
  passosSub.style.marginBottom = 36;

  const passosCards = createNewPageElement('html-embed');
  passosCards.content.html = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 20px;">
      <div style="background: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 10px 20px -5px rgba(0,0,0,0.2);">
        <div style="height: 180px; position: relative; background: #0b1612; overflow: hidden;">
          <img src="/images/vinko/vinko-passos-screenshot.jpg" style="width: 100%; height: 100%; object-fit: cover; object-position: 10% center;" />
          <div style="position: absolute; top: 12px; left: 12px; width: 28px; height: 28px; background: #70c300; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: 900; color: #073e2e; font-size: 14px;">1</div>
        </div>
        <div style="padding: 16px; font-weight: 700; font-size: 13px; color: #073e2e; line-height: 1.4; text-align: center;">
          Cadastro digital: rápido, sem burocracia
        </div>
      </div>
      <div style="background: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 10px 20px -5px rgba(0,0,0,0.2);">
        <div style="height: 180px; position: relative; background: #0b1612; overflow: hidden;">
          <img src="/images/vinko/vinko-passos-screenshot.jpg" style="width: 100%; height: 100%; object-fit: cover; object-position: 36% center;" />
          <div style="position: absolute; top: 12px; left: 12px; width: 28px; height: 28px; background: #70c300; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: 900; color: #073e2e; font-size: 14px;">2</div>
        </div>
        <div style="padding: 16px; font-weight: 700; font-size: 13px; color: #073e2e; line-height: 1.4; text-align: center;">
          Viagem confirmada: oferta segura, benefícios garantidos
        </div>
      </div>
      <div style="background: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 10px 20px -5px rgba(0,0,0,0.2);">
        <div style="height: 180px; position: relative; background: #0b1612; overflow: hidden;">
          <img src="/images/vinko/vinko-passos-screenshot.jpg" style="width: 100%; height: 100%; object-fit: cover; object-position: 63% center;" />
          <div style="position: absolute; top: 12px; left: 12px; width: 28px; height: 28px; background: #70c300; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: 900; color: #073e2e; font-size: 14px;">3</div>
        </div>
        <div style="padding: 16px; font-weight: 700; font-size: 13px; color: #073e2e; line-height: 1.4; text-align: center;">
          Comunicação direta: suporte pelo WhatsApp
        </div>
      </div>
      <div style="background: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 10px 20px -5px rgba(0,0,0,0.2);">
        <div style="height: 180px; position: relative; background: #0b1612; overflow: hidden;">
          <img src="/images/vinko/vinko-passos-screenshot.jpg" style="width: 100%; height: 100%; object-fit: cover; object-position: 90% center;" />
          <div style="position: absolute; top: 12px; left: 12px; width: 28px; height: 28px; background: #70c300; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: 900; color: #073e2e; font-size: 14px;">4</div>
        </div>
        <div style="padding: 16px; font-weight: 700; font-size: 13px; color: #073e2e; line-height: 1.4; text-align: center;">
          Pagamento rápido: dinheiro certo, sem demora
        </div>
      </div>
    </div>
  `;
  passosSec.containers[0].elements = [passosTitle, passosSub, passosCards];

  // 6. Section: Rodar pesado merece uma parceira leve e transparente
  const depoSec = createNewSection('Depoimentos & Chamada de Impacto', false);
  depoSec.style.backgroundColor = '#072e22';
  depoSec.style.backgroundImage = '/images/vinko/vinko-depoimentos-screenshot.jpg';
  depoSec.style.backgroundSize = 'cover';
  depoSec.style.backgroundPosition = 'center';
  depoSec.style.backgroundOverlay = 'rgba(7, 46, 34, 0.85)';
  depoSec.style.paddingTop = 88;
  depoSec.style.paddingBottom = 88;

  const depoTitle = createNewPageElement('heading');
  depoTitle.content.titleHtml = 'Rodar pesado merece uma parceira <span style="color: #70c300;">leve e transparente</span>';
  depoTitle.content.text = 'Rodar pesado merece uma parceira leve e transparente';
  depoTitle.content.tag = 'h2';
  depoTitle.style.fontSize = 36;
  depoTitle.style.color = '#ffffff';
  depoTitle.style.textAlign = 'center';

  const depoPills = createNewPageElement('html-embed');
  depoPills.content.html = `
    <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 14px; margin: 28px 0 36px 0;">
      <div style="background: rgba(4, 38, 28, 0.75); border: 1px solid rgba(112, 195, 0, 0.5); backdrop-filter: blur(8px); padding: 10px 20px; border-radius: 9999px; color: #ffffff; font-size: 13px; font-weight: 600;">
        "Com a Vinko, tenho previsibilidade."
      </div>
      <div style="background: rgba(4, 38, 28, 0.75); border: 1px solid rgba(112, 195, 0, 0.5); backdrop-filter: blur(8px); padding: 10px 20px; border-radius: 9999px; color: #ffffff; font-size: 13px; font-weight: 600;">
        "Pagamento certo, sem atraso."
      </div>
      <div style="background: rgba(4, 38, 28, 0.75); border: 1px solid rgba(112, 195, 0, 0.5); backdrop-filter: blur(8px); padding: 10px 20px; border-radius: 9999px; color: #ffffff; font-size: 13px; font-weight: 600;">
        "Respeito que faz diferença na estrada."
      </div>
    </div>
    <div style="text-align: center;">
      <a href="#cadastro" style="display: inline-flex; align-items: center; gap: 8px; background: #70c300; color: #073e2e; font-weight: 800; font-size: 14px; padding: 14px 28px; border-radius: 9999px; box-shadow: 0 10px 25px -5px rgba(112, 195, 0, 0.5); transition: transform 0.2s;">
        <span>Conheça o Programa de Relacionamento Vinko</span>
        <span>↗</span>
      </a>
    </div>
  `;
  depoSec.containers[0].elements = [depoTitle, depoPills];

  // 7. Section: Programa de Relacionamento Vinko
  const progSec = createNewSection('Programa de Relacionamento Vinko', false);
  progSec.style.backgroundColor = '#ffffff';
  progSec.style.paddingTop = 72;
  progSec.style.paddingBottom = 72;

  const progCont = createNewContainer('2-col-equal');
  
  // Left: Driver image
  const progImg = createNewPageElement('image');
  progImg.content.url = '/images/vinko/vinko-relacionamento-screenshot.jpg';
  progImg.content.alt = 'Motorista parceiro Vinko';
  progImg.style.borderRadius = 20;

  // Right: Content
  const progTitle = createNewPageElement('heading');
  progTitle.content.text = 'Programa de Relacionamento Vinko:';
  progTitle.content.tag = 'h2';
  progTitle.style.fontSize = 32;
  progTitle.style.color = '#0f172a';
  progTitle.style.textAlign = 'left';

  const progSub = createNewPageElement('paragraph');
  progSub.content.text = 'Confiança que gera vínculo, valorização em cada quilômetro rodado';
  progSub.style.fontSize = 17;
  progSub.style.fontStyle = 'italic';
  progSub.style.color = '#073e2e';
  progSub.style.fontWeight = 600;
  progSub.style.textAlign = 'left';

  const progText = createNewPageElement('paragraph');
  progText.content.text = 'Da constância de carga, passando pela remuneração justa e o respeito contínuo, até a sua autonomia para decidir, benefícios reais para quem vive a estrada.';
  progText.style.fontSize = 15;
  progText.style.color = '#64748b';
  progText.style.textAlign = 'left';

  const progBtn = createNewPageElement('button');
  progBtn.content.text = 'Participe! ↗';
  progBtn.content.url = '#cadastro';
  progBtn.style.backgroundColor = 'transparent';
  progBtn.style.color = '#073e2e';
  progBtn.style.fontWeight = 800;
  progBtn.style.fontSize = 16;
  progBtn.style.textAlign = 'left';
  progBtn.style.paddingLeft = 0;

  progCont.elements = [progImg, progTitle, progSub, progText, progBtn];
  progSec.containers = [progCont];

  // 8. Section: Rodapé Oficial
  const footSec = createNewSection('Rodapé Oficial Vinko', false);
  footSec.style.backgroundColor = '#04261c';
  footSec.style.paddingTop = 40;
  footSec.style.paddingBottom = 40;

  const footEmbed = createNewPageElement('html-embed');
  footEmbed.content.html = `
    <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; color: #a7f3d0; font-size: 13px;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <div style="width: 26px; height: 26px; background: #70c300; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 16px; color: #04261c;">K</div>
        <span style="font-weight: 900; font-size: 16px; color: #ffffff;">VINKO LOG</span>
      </div>
      <div>
        © 2026 Vinko Logística Digital. Todos os direitos reservados.
      </div>
      <div>
        <a href="#" style="color: #70c300; margin-right: 16px;">Termos de Uso</a>
        <a href="#" style="color: #70c300;">Política de Privacidade</a>
      </div>
    </div>
  `;
  footSec.containers[0].elements = [footEmbed];

  return {
    id: 'page-vinko-log-captura',
    name: 'Vinko Log — Parceira de quem move o Brasil',
    slug: 'vinko-log',
    category: 'lead-capture',
    status: 'published',
    folder: 'Páginas de Captura',
    publishedUrl: '/p/vinko-log',
    publishedAt: new Date().toISOString(),
    thumbnailData: '/images/vinko/vinko-hero-screenshot.jpg',
    seo: {
      metaTitle: 'Vinko Log — Parceira de quem move o Brasil',
      metaDescription: 'Constância de carga, pagamento rápido e respeito em cada viagem. Seja um motorista parceiro Vinko.',
      ogTitle: 'Vinko Log — Parceira de quem move o Brasil',
      ogDescription: 'Constância de carga, pagamento rápido e respeito em cada viagem.',
      ogImage: '/images/vinko/vinko-hero-screenshot.jpg'
    },
    tracking: {
      metaPixelEvents: ['PageView', 'Lead']
    },
    globalSettings: {
      primaryColor: '#70c300',
      secondaryColor: '#073e2e',
      fontFamily: 'Inter, sans-serif',
      textColor: '#0f172a',
      backgroundColor: '#ffffff',
      maxWidth: 1140,
      containerPadding: 24
    },
    sections: [headerSec, heroSec, statsSec, sobreSec, passosSec, depoSec, progSec, footSec],
    version: 1,
    viewsCount: 1420,
    conversionsCount: 384,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};


// Template: AM OUTLET — Black November 2026 - Grupo VIP
export const createAmOutletCaptureDoc = (): PageDocument => {
  const heroSec = createNewSection('AM Outlet — Black November VIP', false);
  heroSec.style.backgroundColor = '#0a0908';
  heroSec.style.paddingTop = 40;
  heroSec.style.paddingBottom = 40;

  const heroCont = createNewContainer('2-col-equal');
  heroCont.style.gap = 40;

  // ===== LEFT COLUMN (column: 1) =====

  // 1. Header Brand (Logo AM Outlet + Gold Divider + BLACK NOVEMBER 2026)
  const brandHeader = createNewPageElement('html-embed');
  brandHeader.column = 1;
  brandHeader.content.html = `
    <div style="display: inline-flex; align-items: center; gap: 16px; margin-bottom: 20px; width: fit-content;">
      <div style="display: flex; align-items: center;">
        <img src="/images/am-outlet/logo-am-outlet.png" alt="AM OUTLET" style="height: 48px; width: auto; max-width: 140px; object-fit: contain; display: block;" />
      </div>
      <div style="width: 28px; height: 2px; background-color: #d4a359; border-radius: 1px;"></div>
      <div style="color: #d4a359; font-size: 0.82rem; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; white-space: nowrap;">
        BLACK NOVEMBER 2026
      </div>
    </div>
  `;

  // 2. Main Heading
  const mainHeading = createNewPageElement('heading');
  mainHeading.column = 1;
  mainHeading.content.titleHtml = 'A Black começa<br />antes para quem<br />está no <span class="gold-gradient">grupo VIP.</span>';
  mainHeading.content.text = 'A Black começa antes para quem está no grupo VIP.';
  mainHeading.content.tag = 'h1';
  mainHeading.style.fontSize = 44;
  mainHeading.style.fontWeight = 800;
  mainHeading.style.color = '#ffffff';
  mainHeading.style.lineHeight = 1.12;
  mainHeading.style.textAlign = 'left';
  mainHeading.style.marginBottom = 16;

  // 3. Subheading
  const subHeading = createNewPageElement('paragraph');
  subHeading.column = 1;
  subHeading.content.text = 'Receba as condições de cada etapa, avisos importantes e acesso antecipado diretamente no WhatsApp.';
  subHeading.style.fontSize = 17;
  subHeading.style.color = '#aba296';
  subHeading.style.lineHeight = 1.55;
  subHeading.style.textAlign = 'left';
  subHeading.style.marginBottom = 20;

  // 4. Feature Pills
  const pillsEl = createNewPageElement('html-embed');
  pillsEl.column = 1;
  pillsEl.content.html = `
    <div class="pills-group" style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 24px;">
      <span class="pill-chip" style="display: inline-flex; align-items: center; padding: 8px 18px; border-radius: 9999px; background: rgba(24, 21, 17, 0.75); border: 1px solid rgba(212, 163, 89, 0.22); color: #dfd7cc; font-size: 0.85rem; font-weight: 500;">
        Acesso antecipado
      </span>
      <span class="pill-chip" style="display: inline-flex; align-items: center; padding: 8px 18px; border-radius: 9999px; background: rgba(24, 21, 17, 0.75); border: 1px solid rgba(212, 163, 89, 0.22); color: #dfd7cc; font-size: 0.85rem; font-weight: 500;">
        Avisos de descontos
      </span>
      <span class="pill-chip" style="display: inline-flex; align-items: center; padding: 8px 18px; border-radius: 9999px; background: rgba(24, 21, 17, 0.75); border: 1px solid rgba(212, 163, 89, 0.22); color: #dfd7cc; font-size: 0.85rem; font-weight: 500;">
        Estoque limitado
      </span>
    </div>
  `;

  // 5. Capture Form Card
  const formCard = createNewPageElement('form');
  formCard.column = 1;
  formCard.content.fields = [
    {
      id: 'f-firstname',
      name: 'firstName',
      label: 'SEU PRIMEIRO NOME',
      placeholder: 'Digite seu nome',
      type: 'text',
      halfWidth: true,
      required: true
    },
    {
      id: 'f-whatsapp',
      name: 'whatsapp',
      label: 'SEU WHATSAPP',
      placeholder: '(11) 99999-9999',
      type: 'tel',
      halfWidth: true,
      required: true
    }
  ];
  formCard.content.buttonText = 'ENTRAR NO GRUPO VIP';
  formCard.content.buttonBg = 'linear-gradient(180deg, #dfb76c 0%, #caa052 50%, #b88d3f 100%)';
  formCard.content.buttonTextColor = '#11100e';
  formCard.content.buttonBorder = 'none';
  formCard.content.redirectUrl = 'https://chat.whatsapp.com/BChkwfHx5ylKJs0PlaMGFp';
  formCard.content.disclaimer = 'Ao continuar, você será direcionado ao grupo oficial da AM Outlet. Os dados não são armazenados nesta página.';
  formCard.style.backgroundColor = 'rgba(16, 15, 13, 0.86)';
  formCard.style.borderColor = 'rgba(212, 163, 89, 0.32)';
  formCard.style.borderWidth = 1;
  formCard.style.borderRadius = 18;
  formCard.style.paddingTop = 26;
  formCard.style.paddingBottom = 22;
  formCard.style.paddingLeft = 26;
  formCard.style.paddingRight = 26;
  formCard.style.color = '#ffffff';
  formCard.style.boxShadow = '0 16px 40px -10px rgba(0, 0, 0, 0.8), 0 0 20px -5px rgba(212, 163, 89, 0.08)';

  // ===== RIGHT COLUMN (column: 2) =====

  // Model Visual Showcase with Floating Exclusive Badge
  const visualShowcase = createNewPageElement('html-embed');
  visualShowcase.column = 2;
  visualShowcase.content.html = `
    <div style="position: relative; width: 100%; height: 100%; min-height: 580px; display: flex; align-items: center; justify-content: flex-end; border-radius: 20px; overflow: hidden;">
      <div style="position: relative; width: 100%; height: 100%; min-height: 580px; overflow: hidden; border-radius: 20px;">
        <img 
          src="/images/am-outlet/model-desktop.jpg" 
          alt="AM Outlet Modelo Masculino" 
          style="width: 100%; height: 100%; object-fit: cover; object-position: right center; display: block; border-radius: 20px;" 
        />
        <div style="position: absolute; top: 0; left: 0; bottom: 0; width: 28%; background: linear-gradient(90deg, #0a0908 0%, rgba(10, 9, 8, 0) 100%); pointer-events: none;"></div>
      </div>

      <!-- Floating Exclusive Badge -->
      <div style="position: absolute; bottom: 24px; right: 16px; max-width: 440px; width: 90%; background: rgba(14, 13, 11, 0.92); border: 1px solid rgba(212, 163, 89, 0.32); border-radius: 14px; padding: 14px 20px; backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); box-shadow: 0 12px 32px rgba(0, 0, 0, 0.75), 0 0 15px -3px rgba(212, 163, 89, 0.1); display: flex; align-items: center; gap: 16px; z-index: 20;">
        <div style="width: 3px; height: 38px; background: linear-gradient(180deg, #fae4a3 0%, #d4a359 100%); border-radius: 2px; flex-shrink: 0;"></div>
        <div>
          <h4 style="font-size: 0.82rem; font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase; color: #ffffff; margin-bottom: 2px; line-height: 1.25;">
            EXCLUSIVIDADE TAMBÉM ESTÁ EM CHEGAR PRIMEIRO.
          </h4>
          <p style="font-size: 0.78rem; color: #b0a79a; margin: 0; line-height: 1.3;">
            Entre no grupo e acompanhe toda a Black November.
          </p>
        </div>
      </div>
    </div>
  `;

  heroCont.elements = [brandHeader, mainHeading, subHeading, pillsEl, formCard, visualShowcase];
  heroSec.containers = [heroCont];

  const customLuxuryCss = `
    /* Luxury High-Fashion Minimalist Aesthetics */
    .gold-gradient {
      background: linear-gradient(135deg, #fae4a3 0%, #e2b467 45%, #ca9641 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      display: inline-block;
      font-weight: 800;
    }
    .pill-chip {
      transition: all 0.28s ease;
    }
    .pill-chip:hover {
      border-color: rgba(212, 163, 89, 0.45) !important;
      background: rgba(36, 30, 23, 0.85) !important;
      color: #f7f1e6 !important;
      transform: translateY(-1px);
    }
    .vier-input-field {
      background-color: rgba(22, 21, 18, 0.95) !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      color: #ffffff !important;
      border-radius: 10px !important;
      height: 48px !important;
    }
    .vier-input-field:focus {
      border-color: #d4a359 !important;
      background-color: rgba(28, 25, 22, 0.98) !important;
      box-shadow: 0 0 0 3px rgba(212, 163, 89, 0.18) !important;
    }
    .vier-btn-submit {
      height: 52px !important;
      background: linear-gradient(180deg, #dfb76c 0%, #caa052 50%, #b88d3f 100%) !important;
      border: none !important;
      border-radius: 11px !important;
      color: #11100e !important;
      font-size: 0.92rem !important;
      font-weight: 800 !important;
      letter-spacing: 0.07em !important;
      text-transform: uppercase !important;
      cursor: pointer !important;
      box-shadow: 0 8px 24px -4px rgba(212, 163, 89, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.35) !important;
      transition: all 0.28s ease !important;
    }
    .vier-btn-submit:hover {
      background: linear-gradient(180deg, #e8c47d 0%, #d4aa5d 50%, #c49948 100%) !important;
      transform: translateY(-2px);
      box-shadow: 0 12px 28px -4px rgba(212, 163, 89, 0.52), inset 0 1px 0 rgba(255, 255, 255, 0.45) !important;
    }
    @media (max-width: 768px) {
      body {
        background-image: url('/images/am-outlet/model-mobile.jpg');
        background-repeat: no-repeat;
        background-position: top center;
        background-size: cover;
      }
    }
  `;

  return {
    id: 'page-am-outlet-blackfriday',
    name: 'AM OUTLET | Black November 2026 - Grupo VIP',
    slug: 'am-blackfriday',
    category: 'lead-capture',
    status: 'published',
    folder: 'Páginas de Captura',
    publishedUrl: '/p/am-blackfriday',
    publishedAt: new Date().toISOString(),
    thumbnailData: '/images/am-outlet/model-desktop.jpg',
    seo: {
      metaTitle: 'AM OUTLET | Black November 2026 - Grupo VIP',
      metaDescription: 'A Black começa antes para quem está no grupo VIP da AM Outlet. Receba condições exclusivas e acesso antecipado diretamente no WhatsApp.',
      ogTitle: 'AM OUTLET | Black November 2026 - Grupo VIP',
      ogDescription: 'A Black começa antes para quem está no grupo VIP da AM Outlet. Receba condições exclusivas e acesso antecipado.',
      ogImage: '/images/am-outlet/model-desktop.jpg'
    },
    tracking: {
      metaPixelId: '1105544535590795',
      metaPixelEvents: ['PageView', 'Lead'],
      customCss: customLuxuryCss
    },
    globalSettings: {
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      primaryColor: '#d4a359',
      secondaryColor: '#161512',
      backgroundColor: '#0a0908',
      textColor: '#ffffff',
      maxWidth: 1280,
      containerPadding: 32
    },
    sections: [heroSec],
    version: 1,
    viewsCount: 3120,
    conversionsCount: 654,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

// 1. Template: Captura de Leads (E-book / Isca Digital)
const createLeadCaptureDoc = (): PageDocument => {
  const heroSec = createNewSection('Hero & Formulário', false);
  heroSec.style.backgroundColor = '#f8fafc';
  heroSec.style.paddingTop = 72;
  heroSec.style.paddingBottom = 72;

  // Split in 2 columns: Text/Benefits on left, Form on right
  const twoColCont = createNewContainer('2-col-equal');
  
  // Left col: Badge, Heading, Paragraph, Trust
  const h = createNewPageElement('heading');
  h.content.text = 'O Guia Definitivo Para Escalar Vendas com E-mails e Páginas de Alta Conversão';
  h.style.fontSize = 36;
  h.style.textAlign = 'left';

  const p = createNewPageElement('paragraph');
  p.content.text = 'Descubra os 7 frameworks práticos validados em mais de 10.000 campanhas para atrair clientes prontos para comprar, sem desperdiçar orçamento com tráfego.';
  p.style.fontSize = 17;
  p.style.textAlign = 'left';

  const badges = createNewPageElement('trust-badges');

  // Right col: Form
  const form = createNewPageElement('form');
  form.content.title = 'Baixe o Guia Gratuito em PDF';
  form.content.subtitle = 'Insira seus dados para receber o link direto no WhatsApp e e-mail:';
  form.content.buttonText = 'Quero Acesso Imediato ao Guia →';

  twoColCont.elements = [h, p, badges, form];
  heroSec.containers = [twoColCont];

  // Benefits Section
  const benSec = createNewSection('O Que Você Vai Aprender', false);
  benSec.style.backgroundColor = '#ffffff';
  benSec.style.paddingTop = 64;
  benSec.style.paddingBottom = 64;

  const benTitle = createNewPageElement('heading');
  benTitle.content.text = 'O Que Está Incluído no Material';
  benTitle.content.tag = 'h2';
  benTitle.style.fontSize = 28;
  benTitle.style.textAlign = 'center';

  const benCont = createNewContainer('3-col');
  const card1 = createNewPageElement('testimonial');
  card1.content.quote = 'Framework 1: Como estruturar títulos que geram até 68% de taxa de abertura e cliques instantâneos.';
  card1.content.author = 'Capítulo 01';
  card1.content.role = 'Copywriting Estratégico';

  const card2 = createNewPageElement('testimonial');
  card2.content.quote = 'Framework 2: A anatomia visual exata de um botão CTA que induz à ação imediata no celular.';
  card2.content.author = 'Capítulo 02';
  card2.content.role = 'Design Responsivo';

  const card3 = createNewPageElement('testimonial');
  card3.content.quote = 'Framework 3: Sequência de nutrição automática em 5 e-mails para transformar curiosos em compradores fiéis.';
  card3.content.author = 'Capítulo 03';
  card3.content.role = 'Automação & Vendas';

  benSec.containers[0].elements = [benTitle];
  benCont.elements = [card1, card2, card3];
  benSec.containers.push(benCont);

  return {
    id: 'tpl-page-lead-01',
    name: 'Página de Captura — Guia & E-book Premium',
    slug: 'guia-alta-conversao',
    category: 'lead-capture',
    status: 'published',
    folder: 'Páginas de Captura',
    publishedUrl: '/p/guia-alta-conversao',
    publishedAt: '2026-11-01T10:00:00Z',
    thumbnailData: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
    seo: {
      metaTitle: 'Baixe Grátis: Guia de Alta Conversão | vierstudio',
      metaDescription: 'Acesse o guia completo com 7 frameworks comprovados de e-mail e páginas.',
      ogTitle: 'Baixe Grátis: Guia de Alta Conversão',
      ogDescription: 'Acesse o guia completo com 7 frameworks comprovados de e-mail e páginas.'
    },
    tracking: {
      metaPixelEvents: ['PageView', 'Lead']
    },
    globalSettings: {
      primaryColor: '#6366f1',
      secondaryColor: '#ec4899',
      fontFamily: 'Inter, sans-serif',
      textColor: '#0f172a',
      backgroundColor: '#ffffff',
      maxWidth: 1140,
      containerPadding: 24
    },
    sections: [heroSec, benSec],
    version: 1,
    viewsCount: 3420,
    conversionsCount: 954,
    createdAt: '2026-11-01T10:00:00Z',
    updatedAt: '2026-11-05T14:30:00Z'
  };
};

// 2. Template: Página de Vendas (Infoproduto / Software SaaS)
const createSalesDoc = (): PageDocument => {
  const heroSec = createNewSection('Destaque da Oferta', false);
  heroSec.style.backgroundColor = '#0b0f19';
  heroSec.style.paddingTop = 80;
  heroSec.style.paddingBottom = 80;

  const timer = createNewPageElement('countdown');
  timer.style.backgroundColor = '#1e293b';
  timer.style.borderColor = '#334155';
  timer.style.color = '#ffffff';

  const heading = createNewPageElement('heading');
  heading.content.text = 'Multiplique Suas Vendas Criando Páginas e E-mails que Convertem em Minutos';
  heading.style.color = '#ffffff';
  heading.style.fontSize = 42;

  const para = createNewPageElement('paragraph');
  para.content.text = 'Uma plataforma visual tudo-em-um. Crie, personalize e publique páginas rápidas e campanhas de e-mail sem precisar tocar em uma única linha de código.';
  para.style.color = '#94a3b8';
  para.style.fontSize = 20;

  const video = createNewPageElement('video');
  const btn = createNewPageElement('button');
  btn.content.text = 'Quero Começar Agora com 50% de Desconto →';
  btn.style.backgroundColor = '#6366f1';
  btn.style.fontSize = 18;

  heroSec.containers[0].elements = [timer, heading, para, video, btn];

  // Pricing & FAQ Section
  const offerSec = createNewSection('Preço e Garantia', false);
  offerSec.style.backgroundColor = '#f8fafc';
  
  const pricing = createNewPageElement('pricing-table');
  const faq = createNewPageElement('accordion');
  const wa = createNewPageElement('whatsapp-button');
  
  offerSec.containers[0].elements = [pricing, faq, wa];

  return {
    id: 'tpl-page-sales-01',
    name: 'Página de Vendas — Oferta Direta & SaaS Pro',
    slug: 'oferta-especial-pro',
    category: 'sales',
    status: 'published',
    folder: 'Páginas de Vendas',
    publishedUrl: '/p/oferta-especial-pro',
    publishedAt: '2026-11-02T12:00:00Z',
    thumbnailData: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=80',
    seo: {
      metaTitle: 'Condição Especial de Lançamento | vierstudio Pro',
      metaDescription: 'Adquira sua licença com condição exclusiva de Black Week.',
      ogTitle: 'Condição Especial de Lançamento | vierstudio Pro'
    },
    tracking: {
      metaPixelEvents: ['PageView', 'InitiateCheckout']
    },
    globalSettings: {
      primaryColor: '#6366f1',
      secondaryColor: '#22c55e',
      fontFamily: 'Inter, sans-serif',
      textColor: '#0f172a',
      backgroundColor: '#ffffff',
      maxWidth: 1140,
      containerPadding: 24
    },
    sections: [heroSec, offerSec],
    version: 1,
    viewsCount: 5120,
    conversionsCount: 488,
    createdAt: '2026-11-02T12:00:00Z',
    updatedAt: '2026-11-06T19:00:00Z'
  };
};

// 3. Template: Inscrição em Webinar / Masterclass
const createWebinarDoc = (): PageDocument => {
  const heroSec = createNewSection('Inscrição do Evento', false);
  heroSec.style.backgroundColor = '#18181b';
  heroSec.style.paddingTop = 72;
  heroSec.style.paddingBottom = 72;

  const h = createNewPageElement('heading');
  h.content.text = 'Masterclass Ao Vivo: Os Segredos das Páginas que Faturam 7 Dígitos';
  h.style.color = '#ffffff';

  const p = createNewPageElement('paragraph');
  p.content.text = 'Quinta-feira, 20h00 • 100% Online e Gratuito. Aprenda ao vivo como desenhar estruturas de conversão que geram receita recorrente.';
  p.style.color = '#a1a1aa';

  const form = createNewPageElement('form');
  form.content.title = 'Reserve Seu Lugar na Transmissão Exclusiva';
  form.content.subtitle = 'As vagas na sala do Zoom são estritamente limitadas.';
  form.content.buttonText = 'Confirmar Minha Vaga Gratuita';

  heroSec.containers[0].elements = [h, p, form];

  return {
    id: 'tpl-page-webinar-01',
    name: 'Inscrição para Webinar & Masterclass Ao Vivo',
    slug: 'masterclass-ao-vivo',
    category: 'webinar',
    status: 'published',
    folder: 'Lançamentos 2026',
    publishedUrl: '/p/masterclass-ao-vivo',
    publishedAt: '2026-11-03T09:00:00Z',
    thumbnailData: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80',
    seo: {
      metaTitle: 'Masterclass Ao Vivo | Inscrições Abertas',
      metaDescription: 'Participe da aula ao vivo online sobre páginas de alta performance.'
    },
    tracking: {
      metaPixelEvents: ['PageView', 'CompleteRegistration']
    },
    globalSettings: {
      primaryColor: '#8b5cf6',
      secondaryColor: '#ec4899',
      fontFamily: 'Inter, sans-serif',
      textColor: '#ffffff',
      backgroundColor: '#18181b',
      maxWidth: 1080,
      containerPadding: 24
    },
    sections: [heroSec],
    version: 1,
    viewsCount: 1980,
    conversionsCount: 840,
    createdAt: '2026-11-03T09:00:00Z',
    updatedAt: '2026-11-05T18:00:00Z'
  };
};

// 4. Template: Página de Obrigado (Thank You Page)
const createThankYouDoc = (): PageDocument => {
  const heroSec = createNewSection('Confirmação e Próximos Passos', false);
  heroSec.style.backgroundColor = '#ffffff';
  heroSec.style.paddingTop = 80;
  heroSec.style.paddingBottom = 80;

  const h = createNewPageElement('heading');
  h.content.text = '🎉 Inscrição Confirmada com Sucesso!';
  h.style.fontSize = 38;
  h.style.color = '#059669';

  const p = createNewPageElement('paragraph');
  p.content.text = 'Falta apenas mais 1 passo importante: entre no nosso Grupo VIP silencioso no WhatsApp para receber o link direto de acesso e materiais complementares.';
  p.style.fontSize = 19;

  const wa = createNewPageElement('whatsapp-button');
  wa.content.text = 'Entrar no Grupo VIP do WhatsApp Agora';
  wa.content.phone = '5511999999999';
  wa.content.defaultMessage = 'Quero acessar o grupo VIP da Masterclass!';
  wa.style.fontSize = 18;
  wa.style.paddingTop = 18;
  wa.style.paddingBottom = 18;

  const badges = createNewPageElement('trust-badges');

  heroSec.containers[0].elements = [h, p, wa, badges];

  return {
    id: 'tpl-page-thankyou-01',
    name: 'Página de Obrigado — Grupo VIP WhatsApp',
    slug: 'obrigado-inscricao',
    category: 'thank-you',
    status: 'published',
    folder: 'Lançamentos 2026',
    publishedUrl: '/p/obrigado-inscricao',
    publishedAt: '2026-11-03T09:30:00Z',
    thumbnailData: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80',
    seo: {
      metaTitle: 'Inscrição Confirmada! | Próximos Passos',
      metaDescription: 'Entre no grupo do WhatsApp para acompanhar o evento.'
    },
    tracking: {
      metaPixelEvents: ['PageView', 'CompleteRegistration']
    },
    globalSettings: {
      primaryColor: '#059669',
      secondaryColor: '#25D366',
      fontFamily: 'Inter, sans-serif',
      textColor: '#0f172a',
      backgroundColor: '#ffffff',
      maxWidth: 960,
      containerPadding: 24
    },
    sections: [heroSec],
    version: 1,
    viewsCount: 840,
    conversionsCount: 620,
    createdAt: '2026-11-03T09:30:00Z',
    updatedAt: '2026-11-05T18:15:00Z'
  };
};

export const INITIAL_PAGE_TEMPLATES: PageTemplateModel[] = [
  {
    id: 'tpl-page-am-outlet-blackfriday',
    name: 'AM OUTLET | Black November 2026 - Grupo VIP',
    category: 'lead-capture',
    categoryLabel: 'Captura de Leads',
    description: 'Página oficial de alta conversão para o Grupo VIP Black November da AM Outlet com design de luxo, integração com WhatsApp e Meta Pixel.',
    thumbnailUrl: '/images/am-outlet/model-desktop.jpg',
    badge: 'LUXO & ALTA CONVERSÃO',
    document: createAmOutletCaptureDoc(),
    isFeatured: true
  },
  {
    id: 'tpl-page-vinko-log',
    name: 'Vinko Log — Parceira de quem move o Brasil',
    category: 'lead-capture',
    categoryLabel: 'Captura de Leads',
    description: 'Página de alta conversão para cadastro de motoristas parceiros com formulário dinâmico, estatísticas, jornada em 4 passos e programa de relacionamento.',
    thumbnailUrl: '/images/vinko/vinko-hero-screenshot.jpg',
    badge: 'DESTAQUE OFICIAL',
    document: createVinkoCaptureDoc(),
    isFeatured: true
  },
  {
    id: 'tpl-page-lead-01',
    name: 'Captura de Leads — Guia & E-book Estratégico',
    category: 'lead-capture',
    categoryLabel: 'Captura de Leads',
    description: 'Layout clássico com formulário em destaque, prova social e lista de benefícios com alta taxa de conversão.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
    badge: 'ALTA CONVERSÃO',
    document: createLeadCaptureDoc(),
    isFeatured: true
  },
  {
    id: 'tpl-page-sales-01',
    name: 'Página de Vendas — Infoproduto, Curso ou SaaS',
    category: 'sales',
    categoryLabel: 'Página de Vendas',
    description: 'Página completa com contagem regressiva, vídeo em destaque, tabela de preços, FAQ accordion e botão de WhatsApp.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=80',
    badge: 'MAIS VENDIDO',
    document: createSalesDoc(),
    isFeatured: true
  },
  {
    id: 'tpl-page-webinar-01',
    name: 'Inscrição para Webinar & Masterclass Ao Vivo',
    category: 'webinar',
    categoryLabel: 'Webinar & Aulas',
    description: 'Design escuro e elegante focado em urgência e credibilidade para eventos online e aulas magnéticas.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80',
    badge: 'EVENTOS',
    document: createWebinarDoc(),
    isFeatured: false
  },
  {
    id: 'tpl-page-thankyou-01',
    name: 'Página de Obrigado — Confirmação e Grupo VIP',
    category: 'thank-you',
    categoryLabel: 'Página de Obrigado',
    description: 'Encaminhe os leads cadastrados diretamente para seu grupo de WhatsApp ou canal de avisos.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80',
    badge: 'PÓS-CONVERSÃO',
    document: createThankYouDoc(),
    isFeatured: false
  }
];
