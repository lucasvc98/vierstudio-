import { EmailDocument, EmailRow, EmailColumn, EmailBlock } from '../types/email';

export function compileEmailHtml(doc: EmailDocument): string {
  const { globalSettings } = doc;
  const containerWidth = globalSettings.containerWidth || 600;
  const bodyBg = globalSettings.bodyBgColor || '#f4f5f8';
  const contentBg = globalSettings.contentBgColor || '#ffffff';
  const defaultFont = globalSettings.defaultFontFamily || 'Arial, Helvetica, sans-serif';
  const defaultText = globalSettings.defaultTextColor || '#333333';
  const defaultHeading = globalSettings.defaultHeadingColor || '#111827';
  const defaultLink = globalSettings.defaultLinkColor || '#6366f1';

  // Build Preheader hack with whitespace filler
  const preheaderText = doc.preheader ? doc.preheader.trim() : '';
  const preheaderPadding = preheaderText 
    ? '&#847; &zwnj; &nbsp; &#8199; &#65279; '.repeat(40)
    : '';

  // Render Rows
  const rowsHtml = doc.rows.map(row => renderRow(row, containerWidth, globalSettings)).join('\n');

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="pt-BR">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${escapeHtml(doc.subject || doc.name || 'vierstudio Email')}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    /* Global Resets */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; max-width: 100%; height: auto; }
    body { margin: 0; padding: 0; width: 100% !important; min-width: 100%; background-color: ${bodyBg}; font-family: ${defaultFont}; }
    a { color: ${defaultLink}; text-decoration: none; }
    
    /* Responsive Queries */
    @media only screen and (max-width: ${containerWidth + 20}px) {
      .email-container {
        width: 100% !important;
        max-width: 100% !important;
      }
      .responsive-column {
        display: block !important;
        width: 100% !important;
        max-width: 100% !important;
        direction: ltr !important;
        box-sizing: border-box !important;
      }
      .mobile-padding {
        padding-left: 16px !important;
        padding-right: 16px !important;
      }
      .mobile-center {
        text-align: center !important;
      }
      .mobile-hide {
        display: none !important;
      }
      .mobile-full-btn {
        display: block !important;
        width: 100% !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${bodyBg}; font-family: ${defaultFont}; color: ${defaultText}; -webkit-font-smoothing: antialiased;">
  <!-- PREHEADER TRICK -->
  ${preheaderText ? `
  <div style="display: none; max-height: 0px; overflow: hidden; mso-hide: all; font-size: 1px; line-height: 1px; max-width: 0px; opacity: 0;">
    ${escapeHtml(preheaderText)}
    ${preheaderPadding}
  </div>` : ''}

  <!-- OUTER BACKGROUND WRAPPER -->
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${bodyBg};">
    <tr>
      <td align="center" style="padding: 24px 12px;">
        <!--[if (gte mso 9)|(IE)]>
        <table align="center" border="0" cellspacing="0" cellpadding="0" width="${containerWidth}">
        <tr>
        <td align="center" valign="top" width="${containerWidth}">
        <![endif]-->
        
        <!-- MAIN CONTAINER -->
        <table role="presentation" class="email-container" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: ${containerWidth}px; background-color: ${contentBg}; border-radius: ${globalSettings.containerRadius || 8}px; overflow: hidden; border: ${globalSettings.containerBorderWidth || 0}px solid ${globalSettings.containerBorderColor || '#e2e8f0'}; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          ${rowsHtml}
        </table>
        
        <!--[if (gte mso 9)|(IE)]>
        </td>
        </tr>
        </table>
        <![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function renderRow(row: EmailRow, containerWidth: number, globalSettings: any): string {
  const rowBg = row.style.backgroundColor || 'transparent';
  const rowBgImage = row.style.backgroundImage 
    ? `background-image: url('${row.style.backgroundImage}'); background-size: ${row.style.backgroundSize || 'cover'}; background-position: ${row.style.backgroundPosition || 'center'}; background-repeat: ${row.style.backgroundRepeat || 'no-repeat'};`
    : '';
  const padTop = row.style.paddingTop ?? 16;
  const padBottom = row.style.paddingBottom ?? 16;
  const padLeft = row.style.paddingLeft ?? 24;
  const padRight = row.style.paddingRight ?? 24;

  const totalCols = row.columns.length || 1;
  const availableWidth = containerWidth - (padLeft + padRight);

  // Column cells
  const columnsHtml = row.columns.map((col, index) => {
    const colPercentage = col.widthPercentage || (100 / totalCols);
    const colWidth = Math.floor((availableWidth * colPercentage) / 100);
    const colBg = col.style.backgroundColor || 'transparent';
    const cPadTop = col.style.paddingTop ?? 0;
    const cPadBottom = col.style.paddingBottom ?? 0;
    const cPadLeft = col.style.paddingLeft ?? (totalCols > 1 && index > 0 ? 8 : 0);
    const cPadRight = col.style.paddingRight ?? (totalCols > 1 && index < totalCols - 1 ? 8 : 0);
    const vAlign = col.style.verticalAlign || 'top';

    const blocksHtml = col.blocks.map(b => renderBlock(b, globalSettings)).join('\n');

    return `
      <!--[if (gte mso 9)|(IE)]>
      <td width="${colWidth}" valign="${vAlign}" style="width: ${colWidth}px; padding: ${cPadTop}px ${cPadRight}px ${cPadBottom}px ${cPadLeft}px; background-color: ${colBg};">
      <![endif]-->
      <div class="responsive-column" style="display: inline-block; vertical-align: ${vAlign}; width: 100%; max-width: ${colPercentage}%; text-align: left; box-sizing: border-box;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${colBg};">
          <tr>
            <td style="padding: ${cPadTop}px ${cPadRight}px ${cPadBottom}px ${cPadLeft}px;" valign="${vAlign}">
              ${blocksHtml || '&nbsp;'}
            </td>
          </tr>
        </table>
      </div>
      <!--[if (gte mso 9)|(IE)]>
      </td>
      <![endif]-->
    `;
  }).join('\n');

  return `
    <!-- ROW: ${row.id} -->
    <tr>
      <td style="background-color: ${rowBg}; ${rowBgImage} padding: ${padTop}px ${padRight}px ${padBottom}px ${padLeft}px;" class="mobile-padding">
        <!--[if (gte mso 9)|(IE)]>
        <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%">
        <tr>
        <![endif]-->
        ${columnsHtml}
        <!--[if (gte mso 9)|(IE)]>
        </tr>
        </table>
        <![endif]-->
      </td>
    </tr>
  `;
}

function renderBlock(block: EmailBlock, globalSettings: any): string {
  const { type, content, style } = block;
  const defaultFont = style.fontFamily || globalSettings.defaultFontFamily || 'Arial, Helvetica, sans-serif';

  switch (type) {
    case 'heading': {
      const text = (content.text || 'Título').replace(/\n/g, '<br />');
      const level = content.level || 'h2';
      const size = style.fontSize || (level === 'h1' ? 28 : level === 'h2' ? 22 : 18);
      const weight = style.fontWeight || 700;
      const color = style.color || globalSettings.defaultHeadingColor || '#111827';
      const align = style.textAlign || 'left';
      const mTop = style.marginTop ?? 4;
      const mBottom = style.marginBottom ?? 12;
      const lHeight = style.lineHeight ? `${style.lineHeight}` : '1.3';
      const letterSpacing = style.letterSpacing !== undefined ? `letter-spacing: ${style.letterSpacing}px;` : '';
      const textTransform = style.textTransform ? `text-transform: ${style.textTransform};` : '';

      return `
        <div style="font-family: ${defaultFont}; font-size: ${size}px; font-weight: ${weight}; color: ${color}; text-align: ${align}; margin-top: ${mTop}px; margin-bottom: ${mBottom}px; line-height: ${lHeight}; ${letterSpacing} ${textTransform} mso-line-height-rule: exactly;">
          ${text}
        </div>
      `;
    }

    case 'text': {
      const htmlContent = content.html || content.text || 'Insira seu texto aqui...';
      const size = style.fontSize || 15;
      const weight = style.fontWeight || 'normal';
      const color = style.color || globalSettings.defaultTextColor || '#4b5563';
      const align = style.textAlign || 'left';
      const lHeight = style.lineHeight ? `${style.lineHeight}` : '1.6';
      const mTop = style.marginTop ?? 4;
      const mBottom = style.marginBottom ?? 12;
      const letterSpacing = style.letterSpacing !== undefined ? `letter-spacing: ${style.letterSpacing}px;` : '';
      const textTransform = style.textTransform ? `text-transform: ${style.textTransform};` : '';

      return `
        <div style="font-family: ${defaultFont}; font-size: ${size}px; font-weight: ${weight}; color: ${color}; text-align: ${align}; line-height: ${lHeight}; ${letterSpacing} ${textTransform} margin-top: ${mTop}px; margin-bottom: ${mBottom}px; mso-line-height-rule: exactly;">
          ${htmlContent}
        </div>
      `;
    }

    case 'button': {
      const text = content.text || 'Clique Aqui';
      const url = content.url || '#';
      const bgColor = style.backgroundColor || globalSettings.defaultButtonBg || '#6366f1';
      const textColor = style.color || globalSettings.defaultButtonTextColor || '#ffffff';
      const radius = style.borderRadius ?? (globalSettings.defaultButtonRadius || 6);
      const align = style.textAlign || 'center';
      const fontSize = style.fontSize || 15;
      const fontWeight = style.fontWeight || 600;
      const padY = style.paddingTop ?? 12;
      const padX = style.paddingLeft ?? 24;
      const isFull = content.fullWidth || false;
      const border = style.borderWidth ? `${style.borderWidth}px ${style.borderStyle || 'solid'} ${style.borderColor || bgColor}` : 'none';
      const letterSpacing = style.letterSpacing !== undefined ? `letter-spacing: ${style.letterSpacing}px;` : '';
      const textTransform = style.textTransform ? `text-transform: ${style.textTransform};` : '';

      return `
        <div style="text-align: ${align}; margin-top: ${style.marginTop ?? 8}px; margin-bottom: ${style.marginBottom ?? 8}px;">
          <!--[if mso]>
          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${url}" style="height:${padY * 2 + 20}px;v-text-anchor:middle;width:${isFull ? '100%' : '220px'};" arcsize="${Math.round((radius / 30) * 100)}%" stroke="f" fillcolor="${bgColor}">
            <w:anchorlock/>
            <center style="color:${textColor};font-family:${defaultFont};font-size:${fontSize}px;font-weight:${fontWeight};${letterSpacing}${textTransform}">
              ${escapeHtml(text)}
            </center>
          </v:roundrect>
          <![endif]-->
          <a href="${url}" target="_blank" style="background-color: ${bgColor}; border: ${border}; border-radius: ${radius}px; color: ${textColor}; display: ${isFull ? 'block' : 'inline-block'}; font-family: ${defaultFont}; font-size: ${fontSize}px; font-weight: ${fontWeight}; ${letterSpacing} ${textTransform} line-height: 100%; text-align: center; text-decoration: none; padding: ${padY}px ${padX}px; mso-hide: all; box-sizing: border-box;">
            ${escapeHtml(text)}
          </a>
        </div>
      `;
    }

    case 'image': {
      const src = content.url || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80';
      const alt = content.alt || 'Imagem do e-mail';
      const link = content.link || '';
      const width = content.width || '100%';
      const align = style.textAlign || 'center';
      const radius = style.borderRadius ?? 6;
      const mTop = style.marginTop ?? 6;
      const mBottom = style.marginBottom ?? 12;

      const imgTag = `<img src="${src}" alt="${escapeHtml(alt)}" width="${width === '100%' ? '100%' : width}" style="display: block; width: ${width}; max-width: 100%; height: auto; border: 0; border-radius: ${radius}px; margin: 0 ${align === 'center' ? 'auto' : align === 'right' ? '0 0 auto' : '0'};" />`;

      return `
        <div style="text-align: ${align}; margin-top: ${mTop}px; margin-bottom: ${mBottom}px;">
          ${link ? `<a href="${link}" target="_blank" style="text-decoration: none; border: 0;">${imgTag}</a>` : imgTag}
        </div>
      `;
    }

    case 'logo': {
      const src = content.url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=240&auto=format&fit=crop&q=80';
      const alt = content.alt || 'Logotipo';
      const link = content.link || '#';
      const width = content.width || 140;
      const align = style.textAlign || 'left';

      return `
        <div style="text-align: ${align}; margin-top: ${style.marginTop ?? 4}px; margin-bottom: ${style.marginBottom ?? 8}px;">
          <a href="${link}" target="_blank" style="text-decoration: none;">
            <img src="${src}" alt="${escapeHtml(alt)}" width="${width}" style="display: inline-block; max-width: 100%; height: auto; border: 0;" />
          </a>
        </div>
      `;
    }

    case 'divider': {
      const bColor = style.borderColor || '#e2e8f0';
      const bWidth = style.borderWidth || 1;
      const bStyle = style.borderStyle || 'solid';
      const mTop = style.marginTop ?? 12;
      const mBottom = style.marginBottom ?? 12;

      return `
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: ${mTop}px; margin-bottom: ${mBottom}px;">
          <tr>
            <td style="border-top: ${bWidth}px ${bStyle} ${bColor}; font-size: 1px; line-height: 1px;">&nbsp;</td>
          </tr>
        </table>
      `;
    }

    case 'spacer': {
      const height = style.height || 24;
      return `
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td height="${height}" style="height: ${height}px; line-height: ${height}px; font-size: 1px;">&nbsp;</td>
          </tr>
        </table>
      `;
    }

    case 'social': {
      const items = content.items || [
        { platform: 'instagram', url: 'https://instagram.com' },
        { platform: 'facebook', url: 'https://facebook.com' },
        { platform: 'linkedin', url: 'https://linkedin.com' },
        { platform: 'whatsapp', url: 'https://whatsapp.com' }
      ];
      const align = style.textAlign || 'center';

      const iconsMap: Record<string, string> = {
        instagram: 'https://cdn-icons-png.flaticon.com/512/2111/2111463.png',
        facebook: 'https://cdn-icons-png.flaticon.com/512/733/733547.png',
        linkedin: 'https://cdn-icons-png.flaticon.com/512/3536/3536505.png',
        twitter: 'https://cdn-icons-png.flaticon.com/512/5969/5969020.png',
        youtube: 'https://cdn-icons-png.flaticon.com/512/1384/1384060.png',
        whatsapp: 'https://cdn-icons-png.flaticon.com/512/733/733585.png',
      };

      const iconsHtml = items.map((item: any) => `
        <td style="padding: 0 8px;">
          <a href="${item.url}" target="_blank" style="text-decoration: none;">
            <img src="${iconsMap[item.platform] || iconsMap['instagram']}" alt="${item.platform}" width="24" height="24" style="display: block; border: 0;" />
          </a>
        </td>
      `).join('');

      return `
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="${align}" style="margin: ${style.marginTop ?? 12}px ${align === 'center' ? 'auto' : '0'} ${style.marginBottom ?? 12}px;">
          <tr>
            ${iconsHtml}
          </tr>
        </table>
      `;
    }

    case 'coupon': {
      const code = content.code || '{{cupom}}';
      const discount = content.discount || '20% OFF';
      const description = content.description || 'Utilize no checkout para desconto exclusivo';
      const bgColor = style.backgroundColor || '#f5f3ff';
      const borderColor = style.borderColor || '#8b5cf6';

      return `
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${bgColor}; border: 2px dashed ${borderColor}; border-radius: 8px; margin: 16px 0;">
          <tr>
            <td style="padding: 20px; text-align: center;">
              <div style="font-family: ${defaultFont}; font-size: 13px; font-weight: 700; color: #7c3aed; text-transform: uppercase; letter-spacing: 1px;">${discount}</div>
              <div style="font-family: ${defaultFont}; font-size: 24px; font-weight: 800; color: #1e1b4b; margin: 8px 0; letter-spacing: 2px; font-family: monospace;">${code}</div>
              <div style="font-family: ${defaultFont}; font-size: 13px; color: #6b7280;">${escapeHtml(description)}</div>
            </td>
          </tr>
        </table>
      `;
    }

    case 'product': {
      const img = content.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80';
      const title = content.title || 'Fone de Ouvido Premium Wireless';
      const oldPrice = content.oldPrice || 'R$ 499,00';
      const price = content.price || 'R$ 299,00';
      const btnText = content.buttonText || 'Comprar Agora';
      const btnUrl = content.buttonUrl || '#';

      return `
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin: 12px 0;">
          <tr>
            <td align="center" style="padding: 16px 16px 0 16px;">
              <img src="${img}" alt="${escapeHtml(title)}" width="100%" style="display: block; border-radius: 6px; max-width: 100%; height: auto; border: 0;" />
            </td>
          </tr>
          <tr>
            <td style="padding: 16px; text-align: center;">
              <div style="font-family: ${defaultFont}; font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 6px;">${escapeHtml(title)}</div>
              <div style="margin-bottom: 12px;">
                ${oldPrice ? `<span style="font-family: ${defaultFont}; font-size: 13px; color: #9ca3af; text-decoration: line-through; margin-right: 6px;">${escapeHtml(oldPrice)}</span>` : ''}
                <span style="font-family: ${defaultFont}; font-size: 20px; font-weight: 800; color: #4f46e5;">${escapeHtml(price)}</span>
              </div>
              <a href="${btnUrl}" target="_blank" style="display: inline-block; background-color: #4f46e5; color: #ffffff; font-family: ${defaultFont}; font-size: 14px; font-weight: 600; text-decoration: none; padding: 10px 20px; border-radius: 6px;">
                ${escapeHtml(btnText)}
              </a>
            </td>
          </tr>
        </table>
      `;
    }

    case 'nav': {
      const links = content.links || [
        { label: 'Novidades', url: '#' },
        { label: 'Ofertas', url: '#' },
        { label: 'Blog', url: '#' },
        { label: 'Suporte', url: '#' }
      ];
      const align = style.textAlign || 'center';

      const navItemsHtml = links.map((l: any) => `
        <td style="padding: 0 10px;">
          <a href="${l.url}" target="_blank" style="font-family: ${defaultFont}; font-size: 13px; font-weight: 600; color: #4b5563; text-decoration: none;">
            ${escapeHtml(l.label)}
          </a>
        </td>
      `).join('');

      return `
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="${align}" style="margin: 8px ${align === 'center' ? 'auto' : '0'};">
          <tr>
            ${navItemsHtml}
          </tr>
        </table>
      `;
    }

    case 'hero': {
      const bannerImg = content.imageUrl || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop&q=80';
      const title = content.title || 'Lançamento Exclusivo';
      const subtitle = content.subtitle || 'Descubra as novas soluções pensadas para potencializar seus resultados.';
      const ctaText = content.ctaText || 'Explorar Coleção';
      const ctaUrl = content.ctaUrl || '#';

      return `
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #1e1b4b; border-radius: 8px; overflow: hidden; margin: 8px 0;">
          <tr>
            <td align="center">
              <img src="${bannerImg}" alt="Banner" width="100%" style="display: block; width: 100%; max-width: 100%; height: auto; border: 0;" />
            </td>
          </tr>
          <tr>
            <td style="padding: 28px 24px; text-align: center;">
              <h1 style="font-family: ${defaultFont}; font-size: 26px; font-weight: 800; color: #ffffff; margin: 0 0 10px 0;">${escapeHtml(title)}</h1>
              <p style="font-family: ${defaultFont}; font-size: 15px; color: #c7d2fe; margin: 0 0 20px 0; line-height: 1.5;">${escapeHtml(subtitle)}</p>
              <a href="${ctaUrl}" target="_blank" style="display: inline-block; background-color: #6366f1; color: #ffffff; font-family: ${defaultFont}; font-size: 15px; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 6px;">
                ${escapeHtml(ctaText)}
              </a>
            </td>
          </tr>
        </table>
      `;
    }

    case 'footer': {
      const company = content.companyName || 'vierstudio Inc.';
      const address = content.address || 'Av. Paulista, 1000 - São Paulo, SP - Brasil';
      const unsubscribeUrl = content.unsubscribeUrl || '{{unsubscribe_link}}';

      return `
        <div style="font-family: ${defaultFont}; font-size: 12px; color: #9ca3af; text-align: center; line-height: 1.6; margin-top: 16px; margin-bottom: 8px;">
          <p style="margin: 0 0 4px 0;">© ${new Date().getFullYear()} ${escapeHtml(company)}. Todos os direitos reservados.</p>
          <p style="margin: 0 0 8px 0;">${escapeHtml(address)}</p>
          <p style="margin: 0;">
            Você está recebendo este e-mail porque se cadastrou em nossa plataforma. <br />
            <a href="${unsubscribeUrl}" target="_blank" style="color: #6366f1; text-decoration: underline;">Cancelar inscrição</a> | 
            <a href="#" target="_blank" style="color: #6366f1; text-decoration: underline;">Termos de Privacidade</a>
          </p>
        </div>
      `;
    }

    case 'signature': {
      const name = content.name || 'Lucas Silveira';
      const role = content.role || 'Diretor de Marketing & Produto';
      const company = content.company || 'vierstudio SaaS';
      const phone = content.phone || '+55 (11) 99999-9999';
      const avatar = content.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

      return `
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-top: 16px; margin-bottom: 12px;">
          <tr>
            <td valign="middle" style="padding-right: 14px;">
              <img src="${avatar}" alt="${escapeHtml(name)}" width="56" height="56" style="display: block; border-radius: 50%; border: 0;" />
            </td>
            <td valign="middle" style="border-left: 2px solid #e2e8f0; padding-left: 14px;">
              <div style="font-family: ${defaultFont}; font-size: 15px; font-weight: 700; color: #111827;">${escapeHtml(name)}</div>
              <div style="font-family: ${defaultFont}; font-size: 13px; color: #6366f1; font-weight: 600;">${escapeHtml(role)} · ${escapeHtml(company)}</div>
              <div style="font-family: ${defaultFont}; font-size: 12px; color: #6b7280; margin-top: 2px;">${escapeHtml(phone)}</div>
            </td>
          </tr>
        </table>
      `;
    }

    case 'video': {
      const thumb = content.thumbnailUrl || 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&auto=format&fit=crop&q=80';
      const link = content.videoUrl || 'https://youtube.com';
      const title = content.title || 'Assistir ao vídeo explicativo';

      return `
        <div style="text-align: center; margin: 12px 0;">
          <a href="${link}" target="_blank" style="display: inline-block; position: relative; text-decoration: none;">
            <img src="${thumb}" alt="${escapeHtml(title)}" width="100%" style="display: block; border-radius: 8px; border: 0;" />
            <div style="margin-top: 6px; font-family: ${defaultFont}; font-size: 13px; font-weight: 600; color: #4f46e5;">▶ ${escapeHtml(title)}</div>
          </a>
        </div>
      `;
    }

    case 'html': {
      return content.html || content.code || '<!-- Bloco HTML Personalizado -->';
    }

    default:
      return `<div style="padding: 8px; font-family: ${defaultFont}; font-size: 14px; color: #666;">Bloco ${type}</div>`;
  }
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
