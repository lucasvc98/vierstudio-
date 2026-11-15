/**
 * Utilitário de Otimização e Compressão de Imagens no Navegador
 * Reduz banners pesados (2MB a 15MB) para resoluções ideais de e-mail (max 1200px)
 * gerando imagens nítidas (2x Retina) e leves (~80KB a 250KB).
 */
export function compressImageFile(file: File, maxWidth = 1200, quality = 0.85): Promise<{
  dataUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
}> {
  return new Promise((resolve, reject) => {
    // Se for SVG ou GIF animado, não passa por canvas para preservar animação/vetor
    if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        resolve({
          dataUrl,
          width: 800,
          height: 600,
          sizeBytes: file.size
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({
            dataUrl: e.target?.result as string,
            width: img.width,
            height: img.height,
            sizeBytes: file.size
          });
          return;
        }

        // Suavização de alta qualidade
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Se for PNG transparente pequeno, mantém PNG; caso contrário, converte para JPEG otimizado
        const isPng = file.type === 'image/png';
        const mime = isPng && file.size < 500 * 1024 ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(mime, quality);
        const sizeBytes = Math.round((dataUrl.length * 3) / 4);

        resolve({
          dataUrl,
          width,
          height,
          sizeBytes
        });
      };
      img.onerror = () => {
        // Fallback para leitura bruta se falhar canvas
        resolve({
          dataUrl: e.target?.result as string,
          width: 800,
          height: 600,
          sizeBytes: file.size
        });
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
