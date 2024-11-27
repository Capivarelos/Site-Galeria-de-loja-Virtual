window.tailwind = window.tailwind || {};
window.tailwind.config = {
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
      },
    }
  }
};


var UnLazy = (function (P) {
    "use strict";
  
    // Placeholder base64 para GIF vazio
    const PLACEHOLDER_GIF = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
  
    // Checagem de ambiente e recursos disponíveis
    const isServer = typeof window === "undefined";
    const supportsLazyLoading = !isServer && "loading" in HTMLImageElement.prototype;
    const isBot = !isServer && (!("onscroll" in window) || /(gle|ing|ro)bot|crawl|spider/i.test(navigator.userAgent));
  
    /**
     * Retorna elementos com base no seletor fornecido.
     * @param {string|Element|NodeList} target - Seletor ou elemento alvo.
     * @param {Document|Element} root - Raiz para busca.
     * @returns {Element[]}
     */
    function getElements(target, root = document) {
      if (typeof target === "string") return [...root.querySelectorAll(target)];
      if (target instanceof Element) return [target];
      return [...target];
    }
  
    /**
     * Calcula a proporção de uma imagem.
     * @param {number} ratio - Proporção desejada.
     * @param {number} maxSize - Tamanho máximo.
     * @returns {{ width: number, height: number }}
     */
    function calculateAspectRatio(ratio, maxSize) {
      let width, height;
      if (ratio >= 1) {
        width = maxSize;
        height = Math.round(maxSize / ratio);
      } else {
        width = Math.round(maxSize * ratio);
        height = maxSize;
      }
      return { width, height };
    }
  
    /**
     * Função debounce genérica.
     * @param {Function} func - Função para debouncing.
     * @param {number} delay - Tempo de atraso.
     * @returns {Function}
     */
    function debounce(func, delay) {
      let timeout;
      return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          func(...args);
        }, delay);
      };
    }
  
    // Funções adicionais de processamento (Lt, wt, rt, etc.) são deixadas como estão
    // devido à sua complexidade, mas podem ser extraídas para módulos menores.
  
    /**
     * Aplica carregamento lazy às imagens.
     * @param {string} selector - Seletor para imagens.
     * @param {Object} options - Opções de configuração.
     */
    function lazyLoad(selector = 'img[loading="lazy"]', options = {}) {
      const {
        hash = true,
        hashType = "blurhash",
        placeholderSize = 32,
        updateSizesOnResize = false,
        onImageLoad
      } = options;
  
      const observers = new Set();
  
      for (const img of getElements(selector)) {
        const resizeHandler = observeImage(img, { updateOnResize: updateSizesOnResize });
        if (resizeHandler && updateSizesOnResize) observers.add(resizeHandler);
  
        if (hash) {
          const placeholder = generatePlaceholder({ image: img, hash, hashType, size: placeholderSize });
          if (placeholder) img.src = placeholder;
        }
  
        if (!img.dataset.src && !img.dataset.srcset) {
          console.error("[unlazy] Missing `data-src` or `data-srcset` attribute", img);
          continue;
        }
  
        if (isBot || !supportsLazyLoading) {
          loadImage(img);
          continue;
        }
  
        if (!img.src) img.src = PLACEHOLDER_GIF;
        if (img.complete && img.naturalWidth > 0) {
          finalizeImageLoad(img, onImageLoad);
          continue;
        }
  
        const loadHandler = () => finalizeImageLoad(img, onImageLoad);
        img.addEventListener("load", loadHandler, { once: true });
        observers.add(() => img.removeEventListener("load", loadHandler));
      }
  
      return () => {
        for (const unobserve of observers) unobserve();
        observers.clear();
      };
    }
  
    /**
     * Observa alterações no tamanho da imagem.
     * @param {Element} img - Imagem alvo.
     * @param {Object} options - Opções.
     */
    function observeImage(img, options) {
      if (img.dataset.sizes !== "auto") return;
  
      const width = calculateWidth(img);
      if (width) img.sizes = `${width}px`;
  
      const parent = img.parentElement;
      if (parent && parent.tagName.toLowerCase() === "picture") {
        [...parent.querySelectorAll("source")].forEach(source => observeImage(source, { skipChildren: true }));
      }
  
      if (options.updateOnResize) {
        if (!resizeObserverMap.has(img)) {
          const resizeHandler = debounce(() => observeImage(img), 500);
          const observer = new ResizeObserver(resizeHandler);
          resizeObserverMap.set(img, observer);
          observer.observe(img);
        }
        return () => {
          const observer = resizeObserverMap.get(img);
          if (observer) {
            observer.disconnect();
            resizeObserverMap.delete(img);
          }
        };
      }
    }
  
    // Exporta métodos principais
    const api = Object.freeze({
      autoSizes: observeImage,
      lazyLoad,
      loadImage: finalizeImageLoad
    });
  
    return api;
  })({});
  