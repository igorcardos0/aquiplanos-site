// 1. Permite importar arquivos CSS, CSS Modules e SCSS/SASS
declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}

declare module "*.scss" {
  const classes: { [key: string]: string };
  export default classes;
}

// 2. Define o tipo para os arquivos de imagem para importações no código TSX
declare module "*.png" {
  const value: string;
  export default value;
}

declare module "*.jpg" {
  const value: string;
  export default value;
}

declare module "*.jpeg" {
  const value: string;
  export default value;
}

declare module "*.svg" {
  const value: string;
  export default value;
}

// 3. Extensão da interface global Window (Meta Pixel + Google Analytics)
export {}; // Garante que este arquivo seja tratado como um módulo

declare global {
  interface Window {
    // Meta Pixel (Facebook)
    fbq: (...args: any[]) => void;

    // Google Analytics (GA4 / GTM)
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}
