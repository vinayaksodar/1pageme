import { useCallback, useEffect, useRef, useState } from "react";
import { ResumeData } from "@/types/resume";

const PAGE_MM_HEIGHT = 297;

export interface PageLayout {
  pageIndex: number;
  items: Set<string>;
  headers: Set<string>;
  continued: Set<string>;
}

/**
 * Convert millimeters to pixels using the browser's measurement when available.
 * Creates a 1mm element and uses its computed size. Falls back to 96 DPI conversion.
 */
function mmToPx(mm: number) {
  if (typeof document === "undefined") {
    // fallback: 96 DPI -> 96 px per inch, 25.4 mm per inch
    return (mm * 96) / 25.4;
  }

  // Create an element sized to 1mm and measure, then multiply.
  const el = document.createElement("div");
  el.style.width = "1mm";
  el.style.height = "1mm";
  el.style.position = "absolute";
  el.style.visibility = "hidden";
  el.style.top = "-9999px";
  document.body.appendChild(el);

  const rect = el.getBoundingClientRect();
  // Use height as the 1mm measurement (consistent regardless of writing direction)
  const pxPerMm = rect.height || 96 / 25.4;
  document.body.removeChild(el);

  return mm * pxPerMm;
}

export const useResumePagination = (
  resume: ResumeData | undefined,
  containerId: string = "measurement-container",
  pageMargin: number = 48,
): PageLayout[] => {
  const [pages, setPages] = useState<PageLayout[]>([]);
  const pendingRef = useRef(false);

  const calculatePages = useCallback(() => {
    if (!resume) return;

    const container = document.getElementById(
      containerId,
    ) as HTMLElement | null;
    if (!container) {
      console.warn("useResumePagination: Container not found", containerId);
      return;
    }

    const items = Array.from(
      container.querySelectorAll("[data-resume-item]"),
    ) as HTMLElement[];
    const headers = Array.from(
      container.querySelectorAll("[data-resume-section-header]"),
    ) as HTMLElement[];

    // Convert page mm -> px at runtime
    const getDims = (el: HTMLElement) => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        height: Math.ceil(rect.height),
        marginTop: Math.ceil(parseFloat(style.marginTop || "0") || 0),
        marginBottom: Math.ceil(parseFloat(style.marginBottom || "0") || 0),
      };
    };

    const pageHeightPx = mmToPx(PAGE_MM_HEIGHT);
    // contentHeight is the height available INSIDE the top and bottom margins
    const contentHeight = pageHeightPx - pageMargin * 2 - 20; // 20px safety buffer

    const itemMeasurements = new Map<
      string,
      { height: number; marginTop: number; marginBottom: number }
    >();
    items.forEach((el) => {
      const id = el.getAttribute("data-resume-item");
      if (id) itemMeasurements.set(id, getDims(el));
    });

    const headerMeasurements = new Map<
      string,
      { height: number; marginTop: number; marginBottom: number }
    >();
    headers.forEach((el) => {
      const id = el.getAttribute("data-resume-section-header");
      if (id) headerMeasurements.set(id, getDims(el));
    });

    // Dynamically measure section spacing
    let sectionSpacing = 32;
    const firstSectionEl = container.querySelector(
      ".group\\/section",
    ) as HTMLElement | null;
    if (firstSectionEl) {
      const style = window.getComputedStyle(firstSectionEl);
      sectionSpacing = parseFloat(style.marginBottom) || 32;
    }

    // Measure continued header height
    let continuedHeaderHeight = 32;
    const sampleHeader = headers[0];
    if (sampleHeader) {
      const d = getDims(sampleHeader);
      continuedHeaderHeight = d.height + d.marginTop + d.marginBottom;
    }

    // Measure main header height
    const mainHeaderEl = container.querySelector(
      "header",
    ) as HTMLElement | null;
    let mainHeaderTotal = 0;
    if (mainHeaderEl) {
      const d = getDims(mainHeaderEl);
      const headerWrapper = container.querySelector(
        ".group\\/header",
      ) as HTMLElement | null;
      if (headerWrapper) {
        const wd = getDims(headerWrapper);
        // Treat top margin as 0
        mainHeaderTotal = wd.height + wd.marginBottom;
      } else {
        mainHeaderTotal = d.height + d.marginBottom;
      }
    }

    // In modern template, the header is inside a CSS grid row and the visible
    // separation to the section rows comes from grid row-gap, not header margin.
    // Include that gap in page-0 header height so pagination matches render.
    if (resume.activeTemplateId === "modern") {
      const headerWrapper = container.querySelector(
        ".group\\/header",
      ) as HTMLElement | null;
      const gridParent = headerWrapper?.parentElement;
      if (gridParent) {
        const rowGap = parseFloat(
          window.getComputedStyle(gridParent).rowGap || "0",
        );
        if (!Number.isNaN(rowGap) && rowGap > 0) {
          mainHeaderTotal += rowGap;
        }
      }
    }

    const newPages: PageLayout[] = [];
    const getPage = (idx: number) => {
      while (newPages.length <= idx) {
        newPages.push({
          pageIndex: newPages.length,
          items: new Set(),
          headers: new Set(),
          continued: new Set(),
        });
      }
      return newPages[idx];
    };

    const layout = resume.layouts[resume.activeTemplateId];
    if (!layout) return;

    const processColumn = (sections: typeof layout.sections) => {
      let currentPageIndex = 0;
      let currentY = 0; // Relative to top margin boundary

      // Add main header height to the first page only
      if (mainHeaderTotal > 0) {
        currentY += mainHeaderTotal;
      }

      sections.forEach((config) => {
        const section = resume.content.sections.find((s) => s.id === config.id);
        if (!section || !config.isVisible || section.items.length === 0) return;

        const headerDims = headerMeasurements.get(section.id) ?? {
          height: 0,
          marginTop: 0,
          marginBottom: 0,
        };
        const headerTotal =
          headerDims.height + headerDims.marginTop + headerDims.marginBottom;

        let spacing = 0;
        // If we are not at the very top of a page
        if (currentY > 0) {
          // If we are on page 0 and just finished the main header, or on any page and finished a section
          if (
            currentY > mainHeaderTotal ||
            (currentPageIndex > 0 && currentY > 0)
          ) {
            spacing = sectionSpacing;
          }
        }

        // Peek first item to avoid orphan headers
        const firstItem = section.items[0];
        let firstItemTotal = 0;
        if (firstItem) {
          const dims = itemMeasurements.get(firstItem.id) ?? {
            height: 0,
            marginTop: 0,
            marginBottom: 0,
          };
          firstItemTotal = dims.height + dims.marginTop + dims.marginBottom;
        }

        // If header + first item doesn't fit, move to next page
        if (
          currentY > 0 &&
          currentY + spacing + headerTotal + firstItemTotal > contentHeight
        ) {
          currentPageIndex++;
          currentY = 0;
          spacing = 0;
        }

        currentY += spacing;
        getPage(currentPageIndex).headers.add(section.id);
        currentY += headerTotal;

        section.items.forEach((item, index) => {
          const dims = itemMeasurements.get(item.id) ?? {
            height: 0,
            marginTop: 0,
            marginBottom: 0,
          };
          const itemTotal = dims.height + dims.marginTop + dims.marginBottom;

          if (currentY + itemTotal > contentHeight) {
            const isFirstItem = index === 0;
            const headerOnThisPage =
              getPage(currentPageIndex).headers.has(section.id) &&
              !getPage(currentPageIndex).continued.has(section.id);

            if (!(isFirstItem && headerOnThisPage)) {
              currentPageIndex++;
              currentY = 0;
              getPage(currentPageIndex).continued.add(section.id);
              currentY += continuedHeaderHeight;
            }
          }

          // If at the top of a page, ignore top margin to keep it flush
          const effectiveItemHeight =
            currentY === 0 ? dims.height + dims.marginBottom : itemTotal;

          getPage(currentPageIndex).items.add(item.id);
          currentY += effectiveItemHeight;
        });
      });
    };

    const isDualColumn = resume.activeTemplateId === "modern";

    if (isDualColumn) {
      const column1Sections = layout.sections.filter(
        (s) => s.column === 1 || !s.column,
      );
      const column2Sections = layout.sections.filter((s) => s.column === 2);
      processColumn(column1Sections);
      processColumn(column2Sections);
    } else {
      processColumn(layout.sections);
    }

    setPages((prev) => {
      if (prev.length !== newPages.length) return newPages;
      const same = prev.every((p, i) => {
        const np = newPages[i];
        if (p.items.size !== np.items.size) return false;
        if (p.headers.size !== np.headers.size) return false;
        if (p.continued.size !== np.continued.size) return false;
        for (const id of p.items) if (!np.items.has(id)) return false;
        for (const id of p.headers) if (!np.headers.has(id)) return false;
        for (const id of p.continued) if (!np.continued.has(id)) return false;
        return true;
      });
      return same ? prev : newPages;
    });
  }, [resume, containerId, pageMargin]);

  useEffect(() => {
    if (!resume) {
      setPages([]);
      return;
    }

    const runCalc = () => {
      if (pendingRef.current) return;
      pendingRef.current = true;
      setTimeout(() => {
        pendingRef.current = false;
        calculatePages();
      }, 100);
    };

    runCalc();

    const container = document.getElementById(containerId);
    if (!container) return;

    const ro = new ResizeObserver(() => runCalc());
    ro.observe(container);

    const mo = new MutationObserver(() => runCalc());
    mo.observe(container, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    window.addEventListener("resize", runCalc);

    return () => {
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener("resize", runCalc);
    };
  }, [calculatePages, containerId, resume]);

  return pages;
};
