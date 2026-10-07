import { Link } from "react-router-dom";
import { EMAIL, HEAD_OFFICE, telHref } from "../data/facts";
import { footerColumns } from "../data/navigation";
import SmartLink from "./SmartLink";

function Brand() {
  return (
    <Link className="flex items-center gap-3 self-start text-(--red)" to="/" aria-label="Ha-Meem Group — home">
      <span className="brand-pill flex items-center h-12 px-1 rounded-lg backdrop-blur-sm shadow-[0_4px_15px_rgba(0,0,0,0.1)] border border-white/30 transition-all duration-300 hover:bg-white hover:-translate-y-px">
        <img src="/group-logo.png" alt="" className="h-10 rounded-sm w-auto object-contain" />
      </span>
    </Link>
  );
}

const phoneText = (phone: string) => phone.replaceAll("-", " ");

export default function SiteFooter() {
  return (
    <footer id="contact" className="bg-(--mist) text-(--mute)">
      <div className="wrap grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.6fr_repeat(5,1fr)] gap-10 pt-18 pb-16">
        <div className="flex flex-col gap-4 text-sm leading-relaxed lg:col-span-1 sm:col-span-2">
          <Brand />
          <p>
            {HEAD_OFFICE.lines[0]}
            <br />
            {HEAD_OFFICE.lines[1]}
          </p>
          <p>
            {HEAD_OFFICE.phones.map((phone, i) => (
              <span key={phone}>
                {i > 0 && " · "}
                <a href={telHref(phone)} className="hover:text-(--ink)! transition-colors duration-200">
                  {phoneText(phone)}
                </a>
              </span>
            ))}
          </p>
          <b className="text-(--ink) text-xs tracking-[0.08em]">SOURCING ENQUIRIES</b>
          <a className="text-(--red)! hover:underline underline-offset-4" href={`mailto:${EMAIL.sales}`}>
            {EMAIL.sales}
          </a>
          <b className="text-(--ink) text-xs tracking-[0.08em]">CAREERS</b>
          <a className="text-(--red)! hover:underline underline-offset-4" href={`mailto:${EMAIL.careers}`}>
            {EMAIL.careers}
          </a>
        </div>
        {footerColumns.map((c) => (
          <div key={c.heading} className="flex flex-col gap-4 text-sm">
            <b className="text-(--ink) text-xs tracking-widest mb-4">{c.heading}</b>
            {c.items.map((x) =>
              x.href ? (
                <SmartLink
                  key={x.label}
                  href={x.href}
                  className="self-start hover:text-(--ink)! aria-[current=page]:text-(--ink)! transition-colors duration-200"
                >
                  {x.label}
                </SmartLink>
              ) : (
                <span key={x.label}>{x.label}</span>
              ),
            )}
          </div>
        ))}
      </div>
      <div className="border-t border-(--hair)">
        <div className="wrap flex flex-col md:flex-row items-start md:items-center justify-between py-6 gap-3 text-xs">
          <span>© 2026 Ha-Meem Group. demo homepage</span>
          <span>Privacy notice　　Terms of use　　Supplier code of conduct</span>
          <span>
            <b className="text-(--red)">*</b>by Ha-Meem Group. [ IT Department ]
          </span>
        </div>
      </div>
    </footer>
  );
}
