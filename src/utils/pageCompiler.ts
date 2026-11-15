import { PageDocument, PageSection, PageContainer, PageElement } from '../types/page';

export function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function compilePageHtml(doc: PageDocument, isPreview = false): string {
  const { seo, tracking, globalSettings, sections } = doc;
  const pageTitle = escapeHtml(seo.metaTitle || doc.name || 'Landing Page — vierstudio');
  const pageDesc = escapeHtml(seo.metaDescription || '');
  const ogTitle = escapeHtml(seo.ogTitle || seo.metaTitle || doc.name);
  const ogDesc = escapeHtml(seo.ogDescription || seo.metaDescription || '');
  const ogImage = seo.ogImage ? escapeHtml(seo.ogImage) : '';
  const canonical = seo.canonicalUrl ? `<link rel="canonical" href="${escapeHtml(seo.canonicalUrl)}" />` : '';
  const robots = seo.noIndex ? '<meta name="robots" content="noindex, nofollow" />' : '<meta name="robots" content="index, follow" />';
  const favicon = seo.favicon ? `<link rel="icon" href="${escapeHtml(seo.favicon)}" />` : '<link rel="icon" href="/logo.png" />';

  // Head Scripts & Pixels
  let metaPixelScript = '';
  if (tracking.metaPixelId) {
    metaPixelScript = `
      <!-- Meta Pixel Code -->
      <script>
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${tracking.metaPixelId}');
        fbq('track', 'PageView');
        ${(tracking.metaPixelEvents || [])
          .filter(evt => evt !== 'PageView')
          .map(evt => `fbq('track', '${evt}');`)
          .join('\n')}
      </script>
      <noscript><img height="1" width="1" style="display:none"
      src="https://www.facebook.com/tr?id=${tracking.metaPixelId}&ev=PageView&noscript=1"
      /></noscript>
      <!-- End Meta Pixel Code -->
    `;
  }

  let gtmHead = '';
  let gtmBody = '';
  if (tracking.gtmId) {
    gtmHead = `
      <!-- Google Tag Manager -->
      <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${tracking.gtmId}');</script>
      <!-- End Google Tag Manager -->
    `;
    gtmBody = `
      <!-- Google Tag Manager (noscript) -->
      <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${tracking.gtmId}"
      height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
      <!-- End Google Tag Manager (noscript) -->
    `;
  }

  let ga4Script = '';
  if (tracking.ga4Id) {
    ga4Script = `
      <!-- Google tag (gtag.js) -->
      <script async src="https://www.googletagmanager.com/gtag/js?id=${tracking.ga4Id}"></script>
      <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${tracking.ga4Id}');
      </script>
    `;
  }

  let tiktokScript = '';
  if (tracking.tiktokPixelId) {
    tiktokScript = `
      <!-- TikTok Pixel Code -->
      <script>
      !function (w, d, t) {
        w.TiktokAnalyticsObject=t;var tt=w[t]=w[t]||[];tt.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],tt.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<tt.methods.length;i++)tt.setAndDefer(tt,tt.methods[i]);tt.instance=function(t){for(var e=tt._i[t]||[],n=0;n<tt.methods.length;n++)tt.setAndDefer(e,tt.methods[n]);return e},tt.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";tt._i=tt._i||{},tt._i[e]=[],tt._i[e]._u=i,s=d.createElement("script");s.type="text/javascript",s.async=!0,s.src=i+"?sdkid="+e+"&lib="+t;var o=d.getElementsByTagName("script")[0];o.parentNode.insertBefore(s,o)};
        tt.load('${tracking.tiktokPixelId}');
        tt.page();
      }(window, document, 'ttq');
      </script>
      <!-- End TikTok Pixel Code -->
    `;
  }

  // Render sections
  const sectionsHtml = sections.map(sec => renderSection(sec, globalSettings, doc.id, doc.slug)).join('\n');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${pageTitle}</title>
  <meta name="description" content="${pageDesc}" />
  ${robots}
  ${canonical}
  ${favicon}

  <!-- Open Graph / Redes Sociais -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${ogTitle}" />
  <meta property="og:description" content="${ogDesc}" />
  ${ogImage ? `<meta property="og:image" content="${ogImage}" />` : ''}

  <!-- Google Fonts Inter -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Montserrat:wght@400;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap" rel="stylesheet" />

  <!-- Core Styles -->
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { -webkit-text-size-adjust: 100%; scroll-behavior: smooth; }
    body {
      font-family: ${globalSettings.fontFamily || 'Inter, sans-serif'};
      color: ${globalSettings.textColor || '#0f172a'};
      background-color: ${globalSettings.backgroundColor || '#ffffff'};
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      overflow-x: hidden;
    }
    img { max-width: 100%; height: auto; display: block; }
    a { text-decoration: none; color: inherit; }
    button { cursor: pointer; border: none; background: none; font-family: inherit; }

    /* Layout Containers */
    .vier-container {
      width: 100%;
      max-width: ${globalSettings.maxWidth || 1140}px;
      margin-left: auto;
      margin-right: auto;
      padding-left: ${globalSettings.containerPadding || 24}px;
      padding-right: ${globalSettings.containerPadding || 24}px;
    }
    .vier-full-width {
      width: 100%;
      padding-left: 0 !important;
      padding-right: 0 !important;
      max-width: 100% !important;
    }

    /* Grid Layouts */
    .vier-grid-1-col { display: flex; flex-direction: column; width: 100%; }
    .vier-grid-2-col-equal { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 32px; align-items: center; }
    .vier-grid-2-col-30-70 { display: grid; grid-template-columns: 3fr 7fr; gap: 32px; align-items: center; }
    .vier-grid-2-col-70-30 { display: grid; grid-template-columns: 7fr 3fr; gap: 32px; align-items: center; }
    .vier-grid-3-col { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 28px; }
    .vier-grid-4-col { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 24px; }
    .vier-flex { display: flex; flex-wrap: wrap; gap: 24px; }

    /* Responsividade */
    @media (max-width: 768px) {
      .vier-grid-2-col-equal,
      .vier-grid-2-col-30-70,
      .vier-grid-2-col-70-30,
      .vier-grid-3-col,
      .vier-grid-4-col {
        grid-template-columns: 1fr !important;
        gap: 24px !important;
      }
      .vier-container {
        padding-left: 16px !important;
        padding-right: 16px !important;
      }
      .vier-hide-mobile { display: none !important; }
    }
    @media (min-width: 769px) {
      .vier-hide-desktop { display: none !important; }
    }

    /* Form Styles */
    .vier-input-field {
      width: 100%;
      padding: 14px 16px;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      font-size: 15px;
      font-family: inherit;
      color: #0f172a;
      background-color: #f8fafc;
      transition: all 0.2s ease;
      outline: none;
    }
    .vier-input-field:focus {
      border-color: ${globalSettings.primaryColor || '#6366f1'};
      background-color: #ffffff;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
    }
    .vier-btn-submit {
      width: 100%;
      padding: 16px 24px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 700;
      color: #ffffff;
      background-color: ${globalSettings.primaryColor || '#6366f1'};
      transition: all 0.2s ease;
      box-shadow: 0 10px 20px -5px rgba(99, 102, 241, 0.4);
    }
    .vier-btn-submit:hover {
      opacity: 0.95;
      transform: translateY(-1px);
    }

    /* FAQ Accordion */
    details.vier-faq-item {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      margin-bottom: 12px;
      background: #ffffff;
      overflow: hidden;
      transition: all 0.2s;
    }
    details.vier-faq-item[open] {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    summary.vier-faq-summary {
      padding: 16px 20px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      list-style: none;
      user-select: none;
    }
    summary.vier-faq-summary::-webkit-details-marker { display: none; }
    .vier-faq-content {
      padding: 0 20px 16px 20px;
      color: #475569;
      line-height: 1.6;
    }

    /* Floating WhatsApp Button */
    .vier-wa-floating {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999;
      display: flex;
      align-items: center;
      gap: 10px;
      background-color: #25D366;
      color: #ffffff;
      padding: 14px 22px;
      border-radius: 9999px;
      font-weight: 700;
      font-size: 15px;
      box-shadow: 0 10px 25px -5px rgba(37, 211, 102, 0.5);
      transition: transform 0.2s ease;
    }
    .vier-wa-floating:hover {
      transform: scale(1.04);
    }

    ${tracking.customCss || ''}
  </style>

  ${metaPixelScript}
  ${gtmHead}
  ${ga4Script}
  ${tiktokScript}
  ${tracking.customHeadScripts || ''}
</head>
<body>
  ${gtmBody}
  ${tracking.customBodyStartScripts || ''}

  <!-- Page Sections Container -->
  <main id="vier-page-root">
    ${sectionsHtml}
  </main>

  <!-- Interactive Form & Countdown Handler -->
  <script>
    // Form submission handler
    document.querySelectorAll('form.vier-active-form').forEach(function(form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        var submitBtn = form.querySelector('button[type="submit"]');
        var originalText = submitBtn ? submitBtn.innerText : '';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerText = 'Processando...';
        }

        var formData = new FormData(form);
        var data = {};
        formData.forEach(function(value, key) { data[key] = value; });

        var pageId = form.getAttribute('data-page-id') || '${doc.id}';
        var pageSlug = form.getAttribute('data-page-slug') || '${doc.slug}';
        var formId = form.getAttribute('data-form-id') || 'form-main';
        var redirectUrl = form.getAttribute('data-redirect-url');

        fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pageId: pageId,
            pageSlug: pageSlug,
            formId: formId,
            data: data,
            lgpdAccepted: true
          })
        })
        .then(function(res) { return res.json(); })
        .then(function(result) {
          if (submitBtn) {
            submitBtn.innerText = '✓ Sucesso!';
            submitBtn.style.backgroundColor = '#10b981';
          }
          if (typeof fbq === 'function') {
            fbq('track', 'Lead');
          }
          if (redirectUrl && redirectUrl !== '#') {
            setTimeout(function() { window.location.href = redirectUrl; }, 1000);
          } else {
            var msg = document.createElement('div');
            msg.style.cssText = 'margin-top: 16px; padding: 12px; background: #d1fae5; color: #065f46; border-radius: 8px; font-weight: 600; text-align: center;';
            msg.innerText = 'Obrigado! Seus dados foram recebidos com sucesso.';
            form.appendChild(msg);
          }
        })
        .catch(function(err) {
          console.error('Erro ao enviar formulário:', err);
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = originalText;
          }
          alert('Ocorreu um erro ao enviar. Por favor, tente novamente.');
        });
      });
    });

    // Phone Masking (Brazilian (XX) XXXXX-XXXX)
    document.querySelectorAll('input[type="tel"]').forEach(function(input) {
      input.addEventListener('input', function(e) {
        var v = e.target.value.replace(/\D/g, '').slice(0, 11);
        if (v.length > 10) {
          e.target.value = '(' + v.slice(0, 2) + ') ' + v.slice(2, 7) + '-' + v.slice(7);
        } else if (v.length > 6) {
          e.target.value = '(' + v.slice(0, 2) + ') ' + v.slice(2, 6) + '-' + v.slice(6);
        } else if (v.length > 2) {
          e.target.value = '(' + v.slice(0, 2) + ') ' + v.slice(2);
        } else if (v.length > 0) {
          e.target.value = '(' + v;
        }
      });
    });

    // Countdown Timer Handler
    document.querySelectorAll('.vier-countdown-box').forEach(function(box) {
      var targetHours = parseInt(box.getAttribute('data-hours') || '24', 10);
      var endTime = new Date().getTime() + (targetHours * 60 * 60 * 1000);

      function update() {
        var now = new Date().getTime();
        var distance = endTime - now;
        if (distance < 0) distance = 0;

        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        var hEl = box.querySelector('.h-val');
        var mEl = box.querySelector('.m-val');
        var sEl = box.querySelector('.s-val');
        if (hEl) hEl.innerText = hours < 10 ? '0' + hours : hours;
        if (mEl) mEl.innerText = minutes < 10 ? '0' + minutes : minutes;
        if (sEl) sEl.innerText = seconds < 10 ? '0' + seconds : seconds;
      }
      setInterval(update, 1000);
      update();
    });
  </script>

  ${tracking.customBodyEndScripts || ''}
</body>
</html>`;
}

function renderSection(
  section: PageSection, 
  globalSettings: any, 
  pageId: string, 
  pageSlug: string
): string {
  const { style, fullWidth, containers, name } = section;
  const bgStyle = style.backgroundColor ? `background-color: ${style.backgroundColor};` : '';
  const bgImg = style.backgroundImage ? `background-image: url('${style.backgroundImage}'); background-size: ${style.backgroundSize || 'cover'}; background-position: ${style.backgroundPosition || 'center'};` : '';
  const pt = style.paddingTop ? `padding-top: ${style.paddingTop}px;` : 'padding-top: 64px;';
  const pb = style.paddingBottom ? `padding-bottom: ${style.paddingBottom}px;` : 'padding-bottom: 64px;';
  const borderTop = style.borderTopWidth ? `border-top: ${style.borderTopWidth}px solid ${style.borderColor || '#e2e8f0'};` : '';
  const borderBottom = style.borderBottomWidth ? `border-bottom: ${style.borderBottomWidth}px solid ${style.borderColor || '#e2e8f0'};` : '';

  const containerClass = fullWidth ? 'vier-full-width' : 'vier-container';
  const containersHtml = containers.map(cont => renderContainer(cont, globalSettings, pageId, pageSlug)).join('\n');

  return `
    <section id="${section.id}" class="vier-section" style="position: relative; ${bgStyle} ${bgImg} ${pt} ${pb} ${borderTop} ${borderBottom}">
      ${style.backgroundOverlay ? `<div style="position: absolute; inset: 0; background-color: ${style.backgroundOverlay}; pointer-events: none;"></div>` : ''}
      <div class="${containerClass}" style="position: relative; z-index: 1;">
        ${containersHtml}
      </div>
    </section>
  `;
}

function renderContainer(container: PageContainer, globalSettings: any, pageId: string, pageSlug: string): string {
  const { layout, style, elements } = container;
  const gridClass = `vier-grid-${layout}`;
  const gap = style.gap ? `gap: ${style.gap}px;` : '';
  const pt = style.paddingTop ? `padding-top: ${style.paddingTop}px;` : '';
  const pb = style.paddingBottom ? `padding-bottom: ${style.paddingBottom}px;` : '';
  const bg = style.backgroundColor ? `background-color: ${style.backgroundColor};` : '';
  const radius = style.borderRadius ? `border-radius: ${style.borderRadius}px;` : '';

  const hasColumnAssignments = elements.some(el => el.column !== undefined && el.column > 1);

  let elementsHtml = '';
  if (hasColumnAssignments) {
    const colCount = layout === '3-col' ? 3 : (layout === '4-col' ? 4 : 2);
    const cols: string[] = [];
    for (let c = 1; c <= colCount; c++) {
      const colEls = elements.filter(el => (el.column || 1) === c);
      cols.push(`
        <div class="vier-col-stack vier-col-${c}" style="display: flex; flex-direction: column; width: 100%;">
          ${colEls.map(el => renderElement(el, globalSettings, pageId, pageSlug)).join('\n')}
        </div>
      `);
    }
    elementsHtml = cols.join('\n');
  } else {
    elementsHtml = elements.map(el => renderElement(el, globalSettings, pageId, pageSlug)).join('\n');
  }

  return `
    <div id="${container.id}" class="${gridClass}" style="${gap} ${pt} ${pb} ${bg} ${radius}">
      ${elementsHtml}
    </div>
  `;
}

function renderElement(element: PageElement, globalSettings: any, pageId: string, pageSlug: string): string {
  const { type, content, style, advanced } = element;
  
  // Visibility classes
  let visClass = '';
  if (advanced?.deviceVisibility === 'desktop-only') visClass = 'vier-hide-mobile';
  if (advanced?.deviceVisibility === 'mobile-only') visClass = 'vier-hide-desktop';

  // Base element styling
  const color = style.color ? `color: ${style.color};` : '';
  const fontSize = style.fontSize ? `font-size: ${style.fontSize}px;` : '';
  const fontWeight = style.fontWeight ? `font-weight: ${style.fontWeight};` : '';
  const textAlign = style.textAlign ? `text-align: ${style.textAlign};` : '';
  const lineHeight = style.lineHeight ? `line-height: ${style.lineHeight};` : '';
  const mb = style.marginBottom !== undefined ? `margin-bottom: ${style.marginBottom}px;` : '';
  const mt = style.marginTop !== undefined ? `margin-top: ${style.marginTop}px;` : '';
  const bg = style.backgroundColor ? `background-color: ${style.backgroundColor};` : '';
  const pt = style.paddingTop ? `padding-top: ${style.paddingTop}px;` : '';
  const pb = style.paddingBottom ? `padding-bottom: ${style.paddingBottom}px;` : '';
  const pl = style.paddingLeft ? `padding-left: ${style.paddingLeft}px;` : '';
  const pr = style.paddingRight ? `padding-right: ${style.paddingRight}px;` : '';
  const radius = style.borderRadius ? `border-radius: ${style.borderRadius}px;` : '';
  const border = style.borderWidth ? `border: ${style.borderWidth}px ${style.borderStyle || 'solid'} ${style.borderColor || '#e2e8f0'};` : '';
  const shadow = style.boxShadow ? `box-shadow: ${style.boxShadow};` : '';

  const inlineCss = `${color} ${fontSize} ${fontWeight} ${textAlign} ${lineHeight} ${mb} ${mt} ${bg} ${pt} ${pb} ${pl} ${pr} ${radius} ${border} ${shadow}`;

  switch (type) {
    case 'heading': {
      const tag = content.tag || 'h1';
      const textToRender = content.titleHtml || escapeHtml(content.text);
      return `<${tag} id="${element.id}" class="${visClass}" style="${inlineCss}">${textToRender}</${tag}>`;
    }

    case 'paragraph': {
      const textToRender = content.textHtml || content.text;
      return `<p id="${element.id}" class="${visClass}" style="${inlineCss}">${textToRender}</p>`;
    }

    case 'button': {
      return `
        <div class="${visClass}" style="${textAlign ? `text-align: ${style.textAlign};` : ''} ${mb}">
          <a href="${content.url || '#'}" target="${content.target || '_self'}" id="${element.id}" style="display: inline-block; ${inlineCss}">
            ${content.text}
            ${content.subtext ? `<div style="font-size: 11px; font-weight: normal; opacity: 0.8; margin-top: 2px;">${content.subtext}</div>` : ''}
          </a>
        </div>
      `;
    }

    case 'whatsapp-button': {
      const phone = content.phone ? content.phone.replace(/\D/g, '') : '';
      const msg = encodeURIComponent(content.defaultMessage || 'Olá!');
      const waUrl = `https://wa.me/${phone}?text=${msg}`;
      const isFloating = content.isFloating;

      if (isFloating) {
        return `
          <a href="${waUrl}" target="_blank" class="vier-wa-floating">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
            <span>${content.text || 'WhatsApp'}</span>
          </a>
        `;
      }

      return `
        <div class="${visClass}" style="${textAlign ? `text-align: ${style.textAlign};` : ''} ${mb}">
          <a href="${waUrl}" target="_blank" style="display: inline-flex; align-items: center; justify-content: center; gap: 8px; ${inlineCss}">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
            <span>${content.text}</span>
          </a>
        </div>
      `;
    }

    case 'image': {
      const imgWidth = style.width ? `width: ${style.width};` : 'width: 100%;';
      const imgMaxWidth = style.maxWidth ? `max-width: ${style.maxWidth}px;` : '';
      const alignWrap = style.textAlign === 'center' ? 'display: flex; justify-content: center;' : (style.textAlign === 'right' ? 'display: flex; justify-content: flex-end;' : '');
      return `
        <div class="${visClass}" style="${alignWrap} ${mb}">
          <img src="${content.url || ''}" alt="${escapeHtml(content.alt || '')}" id="${element.id}" style="${inlineCss} ${imgWidth} ${imgMaxWidth}" />
        </div>
      `;
    }

    case 'video': {
      let embedSrc = content.url;
      if (content.provider === 'youtube') {
        const id = content.embedId || 'dQw4w9WgXcQ';
        embedSrc = `https://www.youtube.com/embed/${id}`;
      }
      return `
        <div class="${visClass}" style="${mb}">
          <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; ${radius} ${shadow}">
            <iframe src="${embedSrc}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top:0; left: 0; width: 100%; height: 100%;"></iframe>
          </div>
        </div>
      `;
    }

    case 'form': {
      const fields = content.fields || [];
      const formTitle = content.titleHtml || (content.title ? escapeHtml(content.title) : '');
      const btnBg = content.buttonBg || style.backgroundColor || '#073e2e';
      const btnColor = content.buttonTextColor || '#ffffff';
      const btnBorder = content.buttonBorder || 'none';

      return `
        <div class="${visClass}" style="${inlineCss} ${mb}">
          ${formTitle ? `<h3 style="font-size: 24px; font-weight: 800; margin-bottom: 8px; line-height: 1.25; color: ${style.color || '#0f172a'};">${formTitle}</h3>` : ''}
          ${content.subtitle ? `<p style="font-size: 14px; opacity: 0.85; margin-bottom: 20px; line-height: 1.5; color: ${style.color || '#64748b'};">${content.subtitle}</p>` : ''}
          <form class="vier-active-form" data-page-id="${pageId}" data-page-slug="${pageSlug}" data-form-id="${element.id}" data-redirect-url="${content.redirectUrl || ''}">
            <div style="display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 18px;">
              ${fields.map((f: any) => {
                const widthStyle = f.halfWidth ? 'flex: 1 1 calc(50% - 6px); min-width: 140px;' : 'width: 100%;';
                
                if (f.type === 'select') {
                  const options = f.options || ['SP', 'MG', 'RJ', 'ES', 'PR', 'SC', 'RS', 'GO', 'MT', 'MS', 'BA', 'Outro'];
                  return `
                    <div style="${widthStyle}">
                      ${f.label ? `<label style="display: block; font-size: 12px; font-weight: 600; margin-bottom: 4px; opacity: 0.9;">${f.label}</label>` : ''}
                      <select name="${f.name || 'field'}" class="vier-input-field" ${f.required ? 'required' : ''} style="cursor: pointer;">
                        <option value="">${f.placeholder || 'Selecione...'}</option>
                        ${options.map((opt: string) => `<option value="${opt}">${opt}</option>`).join('')}
                      </select>
                    </div>
                  `;
                }

                if (f.type === 'radio-group') {
                  const options = f.options || ['Opção 1', 'Opção 2'];
                  return `
                    <div style="width: 100%; margin-top: 4px; margin-bottom: 4px;">
                      <div style="display: flex; align-items: center; gap: 18px; font-size: 13px; font-weight: 600;">
                        ${options.map((opt: string, idx: number) => `
                          <label style="display: inline-flex; align-items: center; gap: 6px; cursor: pointer; color: ${style.color || '#0f172a'};">
                            <input type="radio" name="${f.name || 'radio'}" value="${opt}" ${idx === 0 ? 'checked' : ''} style="accent-color: #70c300; width: 16px; height: 16px;" />
                            <span>${opt}</span>
                          </label>
                        `).join('')}
                      </div>
                    </div>
                  `;
                }

                return `
                  <div style="${widthStyle}">
                    ${f.label ? `<label style="display: block; font-size: 12px; font-weight: 600; margin-bottom: 4px; opacity: 0.9;">${f.label}</label>` : ''}
                    <input type="${f.type || 'text'}" name="${f.name || 'field'}" placeholder="${f.placeholder || ''}" class="vier-input-field" ${f.required ? 'required' : ''} />
                  </div>
                `;
              }).join('')}
              ${content.lgpdText ? `
                <div style="width: 100%; display: flex; align-items: flex-start; gap: 8px; font-size: 11px; opacity: 0.8; margin-top: 4px;">
                  <input type="checkbox" required style="margin-top: 2px; accent-color: #70c300;" />
                  <span>${content.lgpdText}</span>
                </div>
              ` : ''}
            </div>
            <button type="submit" class="vier-btn-submit" style="background-color: ${btnBg} !important; color: ${btnColor} !important; border: ${btnBorder} !important; font-weight: 700;">
              ${content.buttonText || 'Enviar Dados'}
            </button>
          </form>
        </div>
      `;
    }

    case 'countdown': {
      return `
        <div class="vier-countdown-box ${visClass}" data-hours="${content.targetHours || 24}" style="${inlineCss}">
          ${content.label ? `<div style="font-size: 14px; font-weight: 700; margin-bottom: 12px;">${content.label}</div>` : ''}
          <div style="display: flex; justify-content: center; gap: 16px;">
            <div style="text-align: center;">
              <span class="h-val" style="display: block; font-size: 32px; font-weight: 900; line-height: 1;">23</span>
              <span style="font-size: 11px; text-transform: uppercase; opacity: 0.7;">Horas</span>
            </div>
            <span style="font-size: 28px; font-weight: bold; align-self: center;">:</span>
            <div style="text-align: center;">
              <span class="m-val" style="display: block; font-size: 32px; font-weight: 900; line-height: 1;">59</span>
              <span style="font-size: 11px; text-transform: uppercase; opacity: 0.7;">Min</span>
            </div>
            <span style="font-size: 28px; font-weight: bold; align-self: center;">:</span>
            <div style="text-align: center;">
              <span class="s-val" style="display: block; font-size: 32px; font-weight: 900; line-height: 1;">59</span>
              <span style="font-size: 11px; text-transform: uppercase; opacity: 0.7;">Seg</span>
            </div>
          </div>
        </div>
      `;
    }

    case 'pricing-table': {
      const features = content.features || [];
      const accent = style.borderColor || globalSettings?.primaryColor || '#6366f1';
      const cardColor = style.color || '#0f172a';
      const btnBg = content.buttonBg || accent;
      const btnTextColor = content.buttonTextColor || '#ffffff';
      return `
        <div class="${visClass}" style="${inlineCss} ${mb}">
          ${content.badge ? `<span style="display: inline-block; background-color: ${accent}; color: #ffffff; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 9999px; margin-bottom: 16px; letter-spacing: 0.5px;">${content.badge}</span>` : ''}
          <h3 style="font-size: 24px; font-weight: 800; color: ${cardColor}; margin-bottom: 6px;">${content.planName}</h3>
          <p style="font-size: 14px; color: ${cardColor}; opacity: 0.72; margin-bottom: 20px;">${content.description || ''}</p>
          ${content.originalPrice ? `<div style="font-size: 14px; color: ${cardColor}; opacity: 0.55; text-decoration: line-through;">De ${content.originalPrice}</div>` : ''}
          <div style="font-size: 38px; font-weight: 900; color: ${cardColor}; line-height: 1.1; margin-bottom: 4px;">${content.price}</div>
          ${content.installments ? `<div style="font-size: 13px; color: ${cardColor}; opacity: 0.75; margin-bottom: 24px;">${content.installments}</div>` : ''}
          <ul style="list-style: none; text-align: left; margin-bottom: 28px; display: flex; flex-direction: column; gap: 10px;">
            ${features.map((feat: string) => `
              <li style="display: flex; align-items: center; gap: 8px; font-size: 14px; color: ${cardColor}; opacity: 0.9;">
                <span style="color: ${accent}; font-weight: bold;">✓</span>
                <span>${feat}</span>
              </li>
            `).join('')}
          </ul>
          <a href="${content.checkoutUrl || '#'}" style="display: block; width: 100%; padding: 16px; background-color: ${btnBg}; color: ${btnTextColor}; font-weight: 700; border-radius: 12px; font-size: 16px; box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.25);">
            ${content.buttonText || 'Garantir Vaga'}
          </a>
        </div>
      `;
    }

    case 'accordion': {
      const items = content.items || [];
      const accent = globalSettings?.primaryColor || '#6366f1';
      const txtColor = style.color || '#0f172a';
      return `
        <div class="${visClass}" style="${inlineCss} ${mb}">
          ${content.title ? `<h3 style="font-size: 24px; font-weight: 800; text-align: center; margin-bottom: 24px; color: ${txtColor};">${content.title}</h3>` : ''}
          <div>
            ${items.map((item: any) => `
              <details class="vier-faq-item">
                <summary class="vier-faq-summary" style="color: #0f172a;">
                  <span>${item.question}</span>
                  <span style="font-size: 20px; font-weight: bold; color: ${accent};">+</span>
                </summary>
                <div class="vier-faq-content">${item.answer}</div>
              </details>
            `).join('')}
          </div>
        </div>
      `;
    }

    case 'testimonial': {
      const cardColor = style.color || '#334155';
      return `
        <div class="${visClass}" style="${inlineCss} ${mb}">
          ${content.rating ? `<div style="color: #f59e0b; margin-bottom: 12px; font-size: 18px;">${'★'.repeat(content.rating)}</div>` : ''}
          <p style="font-style: italic; font-size: 15px; color: ${cardColor}; opacity: 0.92; line-height: 1.6; margin-bottom: 20px;">${content.quote}</p>
          <div style="display: flex; align-items: center; gap: 12px;">
            ${content.avatar ? `<img src="${content.avatar}" alt="" style="width: 44px; height: 44px; border-radius: 9999px; object-fit: cover;" />` : ''}
            <div>
              <div style="font-weight: 700; font-size: 14px; color: ${cardColor};">${content.author}</div>
              <div style="font-size: 12px; color: ${cardColor}; opacity: 0.65;">${content.role || ''}</div>
            </div>
          </div>
        </div>
      `;
    }

    case 'trust-badges': {
      const items = content.items || [];
      const txtColor = style.color || globalSettings?.textColor || '#0f172a';
      return `
        <div class="${visClass}" style="display: flex; flex-wrap: wrap; justify-content: center; gap: 24px; ${inlineCss} ${mb}">
          ${items.map((b: any) => `
            <div style="display: flex; align-items: center; gap: 8px; text-align: left;">
              <span style="font-size: 20px;">🛡️</span>
              <div>
                <div style="font-weight: 700; font-size: 13px; color: ${txtColor};">${b.title}</div>
                <div style="font-size: 11px; color: ${txtColor}; opacity: 0.72;">${b.desc || ''}</div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    case 'spacer': {
      return `<div class="${visClass}" style="height: ${content.height || 32}px; width: 100%;"></div>`;
    }

    case 'divider': {
      return `<hr class="${visClass}" style="border: none; border-top: ${content.thickness || 1}px ${content.lineStyle || 'solid'} ${style.borderColor || '#e2e8f0'}; ${mt} ${mb}" />`;
    }

    case 'html-embed': {
      return `<div class="${visClass}" style="${inlineCss} ${mb}">${content.html || ''}</div>`;
    }

    default:
      return `<div class="${visClass}" style="${inlineCss}">${content.text || ''}</div>`;
  }
}
