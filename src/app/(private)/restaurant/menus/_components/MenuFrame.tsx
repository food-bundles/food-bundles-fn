"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { renderMenuHtml } from "@/lib/menu-designer/menuHtml";
import type { MenuContent, MenuTemplate } from "@/lib/menu-designer/types";

const PAGE_WIDTH = 794;

export interface MenuFrameHandle {
  /** The browser's print dialog (also "Save as PDF") */
  print: () => void;
  /** The menu page element inside the frame, for PDF export */
  page: () => HTMLElement | null;
}

/**
 * The finished menu, exactly as it prints: the shared HTML in a frame,
 * scaled down to fit the space it is given.
 */
export const MenuFrame = forwardRef<MenuFrameHandle, { content: MenuContent; template: MenuTemplate; className?: string; title?: string }>(
  function MenuFrame({ content, template, className, title }, ref) {
    const wrapRef = useRef<HTMLDivElement>(null);
    const frameRef = useRef<HTMLIFrameElement>(null);
    const [scale, setScale] = useState(1);
    const [height, setHeight] = useState(1123);
    const html = useMemo(() => renderMenuHtml(content, template), [content, template]);

    useImperativeHandle(ref, () => ({
      print: () => frameRef.current?.contentWindow?.print(),
      page: () => frameRef.current?.contentDocument?.querySelector(".page") ?? null,
    }));

    // Fit the A4-wide page to the available width
    useEffect(() => {
      const el = wrapRef.current;
      if (!el) return;
      const fit = () => setScale(Math.min(1, el.clientWidth / PAGE_WIDTH));
      fit();
      const observer = new ResizeObserver(fit);
      observer.observe(el);
      return () => observer.disconnect();
    }, []);

    // Grow the frame with the menu (no scrollbar inside)
    const measure = () => {
      const doc = frameRef.current?.contentDocument;
      if (doc?.body) setHeight(Math.max(1123, doc.body.scrollHeight));
    };

    return (
      <div ref={wrapRef} className={className} style={{ height: height * scale, overflow: "hidden" }}>
        <iframe
          ref={frameRef}
          title={title ?? "Menu preview"}
          srcDoc={html}
          onLoad={() => {
            measure();
            // Web fonts and photos arrive after load
            setTimeout(measure, 600);
            setTimeout(measure, 1800);
          }}
          style={{ width: PAGE_WIDTH, height, border: 0, transform: `scale(${scale})`, transformOrigin: "top left", display: "block" }}
        />
      </div>
    );
  },
);
