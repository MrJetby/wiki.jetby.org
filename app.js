let pageTree = null;
let pages = [];
let currentSlug = "";

const pageList = document.getElementById("page-list");
const contentEl = document.getElementById("content");
const titleEl = document.getElementById("page-title");
const searchEl = document.getElementById("search");
const breadcrumbsEl = document.getElementById("breadcrumbs");
const docNavEl = document.getElementById("doc-nav");
const sidebarToggleEl = document.querySelector(".sidebar-toggle");
const sidebarOverlayEl = document.getElementById("sidebar-overlay");
const imageLightboxEl = document.getElementById("image-lightbox");
const imageLightboxImageEl = document.getElementById("image-lightbox-image");
const brandEl = document.getElementById("brand-link");

const BASE_PATH = (() => {
  const base = document.querySelector("base");
  const href = base ? base.getAttribute("href") || "/" : "/";
  return href.endsWith("/") ? href : `${href}/`;
})();

function normalizeTitle(path) {
  const parts = path.replace(/\.md$/i, "").split("/");
  const name = parts.pop();
  if (name.toLowerCase() === "readme") {
    return parts.length
      ? parts[parts.length - 1].replace(/[-_]/g, " ")
      : "Главная";
  }
  return name.replace(/[-_]/g, " ");
}

function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

function slugToPath(slug) {
  const base = BASE_PATH.endsWith("/") ? BASE_PATH.slice(0, -1) : BASE_PATH;
  return slug ? `${base}/${slug}` : `${base}/`;
}

function pathToSlug(pathname) {
  let value = decodeURIComponent(pathname);
  if (BASE_PATH !== "/" && value.startsWith(BASE_PATH)) {
    value = value.slice(BASE_PATH.length);
  } else {
    value = value.replace(/^\/+/, "");
  }
  value = value.replace(/\/+$/, "").replace(/\.md$/i, "");
  return value;
}

function parsePageMetadata(content) {
  const result = {
    icon: null,
    name: null,
    priority: 0,
    hasContent: false,
    body: content.trim(),
  };
  const body = content.trim();
  let metadataEndIndex = -1;

  if (body.startsWith("---")) {
    metadataEndIndex = body.indexOf("---", 3);
    if (metadataEndIndex > 3) {
      const metadataBlock = body.slice(3, metadataEndIndex).trim();
      metadataBlock.split(/\r?\n/).forEach((line) => {
        const match = line.match(/^([^:]+):\s*(.*)$/);
        if (match) {
          const key = match[1].trim().toLowerCase();
          const value = match[2].trim();
          if (key === "icon") {
            result.icon = value;
          }
          if (key === "name") {
            result.name = value;
          }
          if (key === "priority") {
            const parsedPriority = Number.parseInt(value, 10);
            result.priority = Number.isFinite(parsedPriority)
              ? parsedPriority
              : 0;
          }
        }
      });
      result.body = body.slice(metadataEndIndex + 3).trim();
    }
  }

  result.hasContent = result.body.length > 0;
  return result;
}

function buildTree(files) {
  const root = {
    type: "folder",
    name: "root",
    title: null,
    children: [],
    page: null,
  };

  files.forEach((file) => {
    const parts = file.split("/");
    let node = root;
    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1;
      if (isFile) {
        if (part.toLowerCase() === "readme.md") {
          const dirPath = parts.slice(0, -1).join("/");
          node.page = {
            type: "page",
            slug: dirPath,
            file,
            title: null,
            icon: null,
            hasContent: true,
          };
        } else {
          const slug = file.replace(/\.md$/i, "");
          node.children.push({
            type: "page",
            name: part,
            slug,
            file,
            title: null,
          });
        }
      } else {
        let child = node.children.find(
          (item) => item.type === "folder" && item.name === part,
        );
        if (!child) {
          child = {
            type: "folder",
            name: part,
            title: null,
            children: [],
            page: null,
          };
          node.children.push(child);
        }
        node = child;
      }
    });
  });

  return root;
}

function collectMarkdownNodes(node, list = []) {
  if (node.type === "page") {
    list.push(node);
    return list;
  }

  if (node.type === "folder") {
    if (node.page) {
      list.push(node.page);
    }
    node.children.forEach((child) => collectMarkdownNodes(child, list));
  }

  return list;
}

function collectNavigablePages(node, list = []) {
  if (node.type === "page") {
    if (node.file.toLowerCase().endsWith("readme.md")) {
      if (node.hasContent) {
        list.push(node);
      }
    } else {
      list.push(node);
    }
    return list;
  }

  if (node.type === "folder") {
    if (node.page && node.page.hasContent) {
      list.push(node.page);
    }
    node.children.forEach((child) => collectNavigablePages(child, list));
  }

  return list;
}

function applyMetadata(node, metadata) {
  if (metadata.icon !== null) {
    node.icon = metadata.icon;
  }
  if (metadata.name) {
    node.title = metadata.name;
  } else if (!node.title) {
    node.title = normalizeTitle(node.file);
  }
  if (typeof metadata.priority === "number") {
    node.priority = metadata.priority;
  }
  node.hasContent = metadata.hasContent;
}

function compareNodes(a, b) {
  const aPriority = Number.isFinite(a.priority) ? a.priority : 0;
  const bPriority = Number.isFinite(b.priority) ? b.priority : 0;

  if (aPriority !== bPriority) {
    return bPriority - aPriority;
  }

  const aTitle = String(getNodeTitle(a)).toLowerCase();
  const bTitle = String(getNodeTitle(b)).toLowerCase();
  if (aTitle !== bTitle) {
    return aTitle.localeCompare(bTitle);
  }

  const aKey = a.file || a.name || "";
  const bKey = b.file || b.name || "";
  return String(aKey).localeCompare(String(bKey));
}

function sortTree(node) {
  if (!node || node.type !== "folder") {
    return node;
  }

  node.children.forEach(sortTree);
  node.children.sort(compareNodes);
  return node;
}

function getNodeTitle(node) {
  if (node.type === "page") {
    return node.title || normalizeTitle(node.file);
  }
  return node.page?.title || node.title || normalizeTitle(node.name || "");
}

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );
}

function renderIconMarkup(icon, alt) {
  if (!icon) {
    return '<span class="category-bullet"></span>';
  }

  const trimmed = String(icon).trim();
  if (!trimmed) {
    return '<span class="category-bullet"></span>';
  }

  if (trimmed.startsWith("<svg") && trimmed.includes("</svg>")) {
    return `<span class="category-icon category-icon-svg" aria-hidden="true">${trimmed}</span>`;
  }

  if (
    /^https?:\/\//i.test(trimmed) ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("./") ||
    trimmed.startsWith("../")
  ) {
    return `<img class="category-icon" src="${escapeHtml(trimmed)}" alt="${escapeHtml(alt)} icon" />`;
  }

  return `<span class="category-icon category-icon-text" aria-hidden="true">${escapeHtml(trimmed)}</span>`;
}

function nodeMatches(node, filter) {
  const term = filter.trim().toLowerCase();
  if (!term) return true;

  const value = getNodeTitle(node).toLowerCase();
  if (node.type === "page") {
    return value.includes(term);
  }

  if (value.includes(term)) {
    return true;
  }

  return node.children.some((child) => nodeMatches(child, filter));
}

function filterTree(node, filter) {
  if (!filter.trim()) return node;

  const result = { ...node, children: [] };

  if (node.type === "page") {
    return nodeMatches(node, filter) ? node : null;
  }

  if (getNodeTitle(node).toLowerCase().includes(filter.trim().toLowerCase())) {
    result.page = node.page;
  }

  result.children = node.children
    .map((child) => filterTree(child, filter))
    .filter(Boolean);

  return result.page || result.children.length ? result : null;
}

function hasActiveChild(node, activeSlug) {
  if (node.type === "page") return node.slug === activeSlug;
  if (node.page && node.page.slug === activeSlug) return true;
  return node.children.some((child) => hasActiveChild(child, activeSlug));
}

async function loadPageTree() {
  const response = await fetch("pages-index.json");
  const files = await response.json();
  pageTree = buildTree(files);
  await loadPageMetadata();
  sortTree(pageTree);
  pages = collectNavigablePages(pageTree);
  currentSlug = pages[0]?.slug ?? "";
}

async function loadPageMetadata() {
  const markdownNodes = collectMarkdownNodes(pageTree);
  await Promise.all(
    markdownNodes.map(async (node) => {
      try {
        const response = await fetch(`pages/${node.file}`);
        const content = await response.text();
        const metadata = parsePageMetadata(content);
        applyMetadata(node, metadata);
      } catch (error) {
        applyMetadata(node, {
          icon: null,
          name: null,
          hasContent: true,
          body: "",
        });
      }
    }),
  );
}

function renderTree(node, filter = "") {
  if (!node) return "";
  const isFolder = node.type === "folder";
  if (!isFolder) {
    const title = getNodeTitle(node);
    return `
      <a class="page-link${node.slug === currentSlug ? " active" : ""}" href="${slugToPath(node.slug)}" data-slug="${node.slug}">
        <span>${escapeHtml(title)}</span>
        <span class="page-meta">md</span>
      </a>
    `;
  }

  const visibleChildren = node.children
    .map((child) => renderTree(child, filter))
    .filter(Boolean)
    .join("");

  if (node.name === "root") {
    return visibleChildren;
  }

  const expanded = filter.trim()
    ? "open"
    : hasActiveChild(node, currentSlug)
      ? "open"
      : "";

  const iconHtml = renderIconMarkup(node.page?.icon, getNodeTitle(node));
  const summaryClass = node.page?.hasContent
    ? "category-summary category-summary-page"
    : "category-summary";
  const summarySlug = node.page?.hasContent
    ? `data-slug="${node.page.slug}"`
    : "";

  return `
    <details class="category-group" ${expanded}>
      <summary class="${summaryClass}" ${summarySlug}>
        <span class="summary-title">
          ${iconHtml}
          <span>${escapeHtml(getNodeTitle(node))}</span>
        </span>
      </summary>
      <div class="subpage-list">
        ${visibleChildren}
      </div>
    </details>
  `;
}

const markdownParser = window
  .markdownit({
    html: true,
    linkify: true,
    typographer: true,
    highlight: function (str, lang) {
      if (lang && window.hljs?.getLanguage(lang)) {
        try {
          const highlighted = window.hljs.highlight(str, {
            language: lang,
          }).value;
          return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`;
        } catch (error) {
          // fall through to plain escape below
        }
      }
      if (window.hljs) {
        try {
          const auto = window.hljs.highlightAuto(str);
          const autoClass = auto.language ? ` language-${auto.language}` : "";
          return `<pre><code class="hljs${autoClass}">${auto.value}</code></pre>`;
        } catch (error) {
          // fall through
        }
      }
      const escaped = escapeHtml(str);
      const languageClass = lang ? ` class="language-${lang}"` : "";
      return `<pre><code${languageClass}>${escaped}</code></pre>`;
    },
  })
  .use(window.markdownitTaskLists, { enabled: true, label: true });

function transformMarkdown(markdown) {
  let result = String(markdown || "");

  result = result.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");

  result = result.replace(
    /\{%\s*hint\s+style="([^"]+)"\s*%\}([\s\S]*?)\{%\s*endhint\s*%\}/g,
    (_match, style, content) => {
      const innerHtml = markdownParser.render(transformMarkdown(content));
      return `<div class="callout callout-${style}">${innerHtml}</div>`;
    },
  );

  result = result.replace(
    /\{%\s*tabs\s*%\}([\s\S]*?)\{%\s*endtabs\s*%\}/g,
    (_match, content) => {
      const panes = [
        ...content.matchAll(
          /\{%\s*tab\s+title="([^"]+)"\s*%\}([\s\S]*?)\{%\s*endtab\s*%\}/g,
        ),
      ];
      if (!panes.length) return "";

      const triggers = panes
        .map(
          (pane, index) =>
            `<button class="tab-trigger${index === 0 ? " active" : ""}" type="button" data-tab="${index}">${escapeHtml(pane[1])}</button>`,
        )
        .join("");

      const panels = panes
        .map(
          (pane, index) =>
            `<div class="tab-panel${index === 0 ? " active" : ""}">${markdownParser.render(transformMarkdown(pane[2]))}</div>`,
        )
        .join("");

      return `<div class="tabs"><div class="tabs-nav">${triggers}</div><div class="tabs-panels">${panels}</div></div>`;
    },
  );

  return result;
}
function addHeadingIds(html) {
  return html.replace(
    /<h([1-4])(\s[^>]*)?>([\s\S]*?)<\/h\1>/g,
    (match, level, attrs, inner) => {
      if (attrs && /\bid=/.test(attrs)) return match;
      const text = inner.replace(/<[^>]+>/g, "");
      const id = slugify(text);
      const safeAttrs = attrs || "";
      return `<h${level}${safeAttrs} id="${id}">${inner}</h${level}>`;
    },
  );
}

function enhanceHtml(html) {
  let result = html;

  result = addHeadingIds(result);

  result = result.replace(/<pre><code([^>]*)>/g, (_match, attrs) => {
    const languageMatch = /\blanguage-([^\s"]+)/.exec(attrs || "");
    const language = languageMatch ? escapeHtml(languageMatch[1]) : "text";
    return `<div class="code-block"><div class="code-block-header"><span class="code-block-language">${language}</span><button class="code-copy-btn" type="button">Copy</button></div><pre><code${attrs}>`;
  });

  result = result.replace(/<\/code><\/pre>/g, "</code></pre></div>");

  result = result.replace(/<img\b([^>]*)>/g, (_match, attrs) => {
    const classMatch = /class="([^"]*)"/.exec(attrs || "");
    const updatedAttrs = classMatch
      ? attrs.replace(classMatch[0], `class="${classMatch[1]} content-image"`)
      : `${attrs} class="content-image"`;
    return `<img${updatedAttrs} loading="lazy" />`;
  });

  result = result.replace(
    /<table>/g,
    '<div class="table-wrapper"><table class="content-table">',
  );
  result = result.replace(/<\/table>/g, "</table></div>");

  return result;
}

function renderMarkdownContent(markdown) {
  const transformed = transformMarkdown(markdown);
  return enhanceHtml(markdownParser.render(transformed));
}

function renderMarkdown(markdown) {
  return renderMarkdownContent(markdown);
}

function getTitle(markdown) {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? match[1] : "Untitled";
}

function setActiveLink(slug) {
  document.querySelectorAll(".page-link").forEach((link) => {
    link.classList.toggle("active", link.dataset.slug === slug);
  });

  document.querySelectorAll(".category-summary-page").forEach((summary) => {
    summary.classList.toggle("active", summary.dataset.slug === slug);
  });
}

function isInternalHref(href) {
  if (!href) return false;
  if (/^[a-z][a-z0-9+.-]*:/i.test(href)) return false;
  if (href.startsWith("//")) return false;
  return true;
}

function resolveInternalHref(page, href) {
  const hashIndex = href.indexOf("#");
  const pathPart = hashIndex === -1 ? href : href.slice(0, hashIndex);
  const anchor = hashIndex === -1 ? "" : href.slice(hashIndex + 1);

  if (!pathPart) {
    return { slug: page.slug, anchor };
  }

  const dir = page.file.includes("/")
    ? page.file.slice(0, page.file.lastIndexOf("/") + 1)
    : "";
  const base = new URL(`https://internal.local/${dir}`);
  const resolved = new URL(pathPart, base);
  let resolvedPath = decodeURIComponent(resolved.pathname).replace(/^\/+/, "");
  resolvedPath = resolvedPath.replace(/\.md$/i, "");
  resolvedPath = resolvedPath
    .replace(/(^|\/)README$/i, "$1")
    .replace(/\/$/, "");

  return { slug: resolvedPath, anchor };
}

function resolveImageSrc(page, src) {
  if (!src || isInternalHref(src) === false) return src;
  if (src.startsWith("/")) return src;

  const dir = page.file.includes("/")
    ? page.file.slice(0, page.file.lastIndexOf("/") + 1)
    : "";
  const base = new URL(`https://internal.local/pages/${dir}`);
  const resolved = new URL(src, base);
  return decodeURIComponent(resolved.pathname);
}

function enhanceContentImages(page) {
  contentEl.querySelectorAll("img[src]").forEach((image) => {
    const src = image.getAttribute("src");
    image.setAttribute("src", resolveImageSrc(page, src));
  });
}

function enhanceInternalLinks(page) {
  contentEl.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href");

    if (!isInternalHref(href)) {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
      return;
    }

    if (href.startsWith("#")) {
      const anchor = href.slice(1);
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const target = document.getElementById(anchor);
        if (target)
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState({}, "", `${slugToPath(page.slug)}#${anchor}`);
      });
      return;
    }

    const { slug, anchor } = resolveInternalHref(page, href);
    link.setAttribute(
      "href",
      `${slugToPath(slug)}${anchor ? `#${anchor}` : ""}`,
    );
    link.addEventListener("click", (event) => {
      event.preventDefault();
      navigate(slug, anchor);
    });
  });
}

function renderBreadcrumbs(page) {
  const segments = page.file.split("/").filter(Boolean);
  const folders = segments.slice(0, -1);
  const items = [
    { label: "Docs", slug: pages.find((p) => p.slug === "") ? "" : null },
  ];

  let acc = "";
  folders.forEach((segment) => {
    acc = acc ? `${acc}/${segment}` : segment;
    const folderPage = pages.find((p) => p.slug === acc);
    items.push({
      label: normalizeTitle(segment),
      slug: folderPage ? acc : null,
    });
  });

  items.push({ label: page.title || normalizeTitle(page.file), slug: null });

  breadcrumbsEl.innerHTML = items
    .map((item, index) => {
      const isLast = index === items.length - 1;
      if (isLast || item.slug === null) {
        return isLast
          ? `<span class="breadcrumb-current">${escapeHtml(item.label)}</span>`
          : `<span class="breadcrumb-link" style="opacity:0.6">${escapeHtml(item.label)}</span>`;
      }
      return `<a class="breadcrumb-link" href="${slugToPath(item.slug)}" data-slug="${item.slug}">${escapeHtml(item.label)}</a>`;
    })
    .join('<span class="breadcrumb-separator">/</span>');

  breadcrumbsEl.querySelectorAll("a.breadcrumb-link").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      navigate(link.dataset.slug, "");
    });
  });
}

function renderDocNavigation(page) {
  const index = pages.findIndex((entry) => entry.slug === page.slug);
  const previousPage = index > 0 ? pages[index - 1] : null;
  const nextPage =
    index >= 0 && index < pages.length - 1 ? pages[index + 1] : null;

  docNavEl.innerHTML = `
    <a class="doc-nav-link${previousPage ? "" : " disabled"}" href="${previousPage ? slugToPath(previousPage.slug) : "#"}" data-slug="${previousPage ? previousPage.slug : ""}" data-direction="prev">
      <span class="doc-nav-label">← Previous</span>
      <span class="doc-nav-title">${previousPage ? escapeHtml(previousPage.title) : "Start"}</span>
    </a>
    <a class="doc-nav-link${nextPage ? "" : " disabled"}" href="${nextPage ? slugToPath(nextPage.slug) : "#"}" data-slug="${nextPage ? nextPage.slug : ""}" data-direction="next">
      <span class="doc-nav-label">Next →</span>
      <span class="doc-nav-title">${nextPage ? escapeHtml(nextPage.title) : "End"}</span>
    </a>
  `;

  docNavEl.querySelectorAll(".doc-nav-link:not(.disabled)").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const slug = link.dataset.slug;
      if (slug) navigate(slug, "");
    });
  });
}

function attachContentInteractions() {
  contentEl.querySelectorAll(".code-copy-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      const code = button.closest(".code-block").querySelector("code");
      if (!code) return;
      const text = code.textContent;
      try {
        await navigator.clipboard.writeText(text);
        button.textContent = "Copied";
        button.classList.add("copied");
        window.setTimeout(() => {
          button.textContent = "Copy";
          button.classList.remove("copied");
        }, 1400);
      } catch (error) {
        button.textContent = "Error";
      }
    });
  });

  contentEl.querySelectorAll(".tabs").forEach((tabsRoot) => {
    const triggers = tabsRoot.querySelectorAll(".tab-trigger");
    const panels = tabsRoot.querySelectorAll(".tab-panel");

    triggers.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const index = Number(trigger.dataset.tab);
        triggers.forEach((item) => item.classList.remove("active"));
        panels.forEach((panel) => panel.classList.remove("active"));
        trigger.classList.add("active");
        panels[index]?.classList.add("active");
      });
    });
  });

  contentEl.querySelectorAll("img.content-image").forEach((image) => {
    image.addEventListener("click", () => {
      imageLightboxImageEl.src = image.src;
      imageLightboxImageEl.alt = image.alt || "";
      imageLightboxEl.classList.add("active");
      document.body.classList.add("lightbox-open");
    });
  });
}

function toggleSidebar(force) {
  const shouldOpen =
    typeof force === "boolean"
      ? force
      : !document.body.classList.contains("sidebar-open");
  document.body.classList.toggle("sidebar-open", shouldOpen);
  sidebarOverlayEl.classList.toggle("active", shouldOpen);
  if (sidebarToggleEl) {
    sidebarToggleEl.setAttribute("aria-expanded", String(shouldOpen));
  }
}

function findPageBySlug(slug) {
  return pages.find((page) => page.slug === slug) || pages[0];
}

function renderPageList(filter = "") {
  const tree = filter.trim() ? filterTree(pageTree, filter) : pageTree;
  pageList.innerHTML = tree
    ? renderTree(tree, filter)
    : '<p class="no-results">Ничего не найдено.</p>';

  pageList.querySelectorAll(".page-link").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      navigate(link.dataset.slug, "");
    });
  });

  pageList.querySelectorAll(".category-summary-page").forEach((summary) => {
    summary.addEventListener("click", () => {
      const slug = summary.dataset.slug;
      if (!slug && slug !== "") return;
      navigate(slug, "");
    });
  });
}

async function loadPage(slug, anchor = "") {
  const page = findPageBySlug(slug);
  if (!page) return;
  currentSlug = page.slug;
  const response = await fetch(`pages/${page.file}`);
  const markdown = await response.text();
  const metadata = parsePageMetadata(markdown);

  titleEl.textContent = metadata.name || getTitle(markdown);
  contentEl.innerHTML = renderMarkdown(metadata.body || markdown);
  enhanceInternalLinks(page);
  enhanceContentImages(page);
  renderBreadcrumbs(page);
  renderDocNavigation(page);
  setActiveLink(page.slug);
  attachContentInteractions();
  renderPageList(searchEl.value);

  requestAnimationFrame(() => {
    if (anchor) {
      const target = document.getElementById(anchor);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    window.scrollTo(0, 0);
  });
}

function navigate(slug, anchor = "", push = true) {
  const url = `${slugToPath(slug)}${anchor ? `#${anchor}` : ""}`;
  if (push) {
    history.pushState({ slug, anchor }, "", url);
  } else {
    history.replaceState({ slug, anchor }, "", url);
  }
  loadPage(slug, anchor);
}

async function init() {
  await loadPageTree();
  renderPageList();

  sidebarToggleEl?.addEventListener("click", () => toggleSidebar());
  sidebarOverlayEl?.addEventListener("click", () => toggleSidebar(false));
  brandEl?.addEventListener("click", () => navigate("", ""));
  imageLightboxEl?.addEventListener("click", () => {
    imageLightboxEl.classList.remove("active");
    document.body.classList.remove("lightbox-open");
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      toggleSidebar(false);
      imageLightboxEl?.classList.remove("active");
      document.body.classList.remove("lightbox-open");
    }
  });

  window.addEventListener("popstate", () => {
    const slug = pathToSlug(window.location.pathname);
    const anchor = window.location.hash.replace("#", "");
    loadPage(slug, anchor);
  });

  const initialSlug =
    pathToSlug(window.location.pathname) || pages[0]?.slug || "";
  const initialAnchor = window.location.hash.replace("#", "");
  navigate(initialSlug, initialAnchor, false);

  searchEl.addEventListener("input", (event) => {
    renderPageList(event.target.value);
  });
}

init();
