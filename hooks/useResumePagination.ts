import { useCallback, useEffect, useRef, useState } from "react";
import { ResumeData } from "@/types/resume";

const PAGE_MM_HEIGHT = 297;

export interface PageLayout {
  pageIndex: number;
  items: Set<string>;
  headers: Set<string>;
  continued: Set<string>;
}

function mmToPx(mm: number) {
  if (typeof document === "undefined") return mm * 3.78; // Fallback approx
  const el = document.createElement("div");
  el.style.width = `${mm}mm`;
  el.style.height = "1mm";
  el.style.position = "absolute";
  el.style.visibility = "hidden";
  el.style.top = "-9999px";
  document.body.appendChild(el);
  const px = el.getBoundingClientRect().width;
  document.body.removeChild(el);
  return px || (mm * 96) / 25.4; // 96 DPI fallback
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

    console.log(
      `useResumePagination: Found ${items.length} items and ${headers.length} headers in ${containerId}`,
    );
    console.log(
      `useResumePagination: Container offsetHeight: ${container.offsetHeight}`,
    );

    if (
      items.length === 0 &&
      resume.content.sections.some((s) => s.items.length > 0)
    ) {
      console.warn(
        "useResumePagination: No items found in DOM even though resume has data!",
      );
      console.log(
        "Container innerHTML snippet:",
        container.innerHTML.substring(0, 500),
      );
    }

    // Convert page mm -> px at runtime
    const getDims = (el: HTMLElement) => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      // Use ceil to be conservative about space
      return {
        height: Math.ceil(rect.height),
        marginTop: Math.ceil(parseFloat(style.marginTop || "0") || 0),
        marginBottom: Math.ceil(parseFloat(style.marginBottom || "0") || 0),
      };
    };

    const contentHeight = mmToPx(PAGE_MM_HEIGHT) - pageMargin * 2 - 10; // 10px safety buffer

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

    let continuedHeaderHeight = 30;
    const sampleHeader = headers[0];
    if (sampleHeader) {
      continuedHeaderHeight = sampleHeader.getBoundingClientRect().height;
    }

    const mainHeaderEl = container.querySelector(
      "header",
    ) as HTMLElement | null;
    let initialY = 0;
    if (mainHeaderEl) {
      const d = getDims(mainHeaderEl);
      initialY = d.height + d.marginTop + d.marginBottom;
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
      let currentY = initialY;

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

        const SECTION_SPACING = 32;
        let spacing = 0;
        if (currentY !== initialY && currentY !== 0) {
          spacing = SECTION_SPACING;
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

        // If header + first item (with spacing) doesn't fit, move to next page
        // But only if we're not already at the top of a page
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
            // Don't break if it's the first item and we JUST started this section on this page
            // (e.g., if the item itself is huge, breaking won't help)
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

          getPage(currentPageIndex).items.add(item.id);
          currentY += itemTotal;
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
