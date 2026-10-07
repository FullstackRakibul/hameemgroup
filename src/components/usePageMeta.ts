import { useEffect } from "react";

const SITE = "Ha-Meem Group";

/** Sets document.title ("Woven garments | Ha-Meem Group") and the meta
    description for the current page. Pass full: true to use the title as is. */
export default function usePageMeta(title: string, description: string, full = false) {
  useEffect(() => {
    document.title = full ? title : `${title} | ${SITE}`;
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = description;
  }, [title, description, full]);
}
