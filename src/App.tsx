import { useState } from "react";

const media = "/media/";

const buyers = [
  "gap", "hm", "zara", "pvh", "kohls", "jcpenney", "next", "mango",
  "american-eagle", "abercrombie", "tommy", "esprit", "lindex", "vf",
  "napapijri", "tom-tailor", "reitmans", "oshkosh", "levis", "calvin-klein",
  "lee", "carters", "dickies", "banana-republic", "muji", "vans", "s-oliver",
  "aeon", "timberland", "wrangler",
];

const products = [
  ["DENIM JEANS", "Hi-fashion denim with critical washes, laser finish and 3D whisker", "jeans.jpg"],
  ["BOTTOMS & CARGOS", "", "bottoms.jpg"],
  ["SHIRTS & DRESS PANTS", "", "shirts.jpg"],
  ["OUTERWEAR & JACKETS", "", "showroom.jpg"],
  ["SWEATERS", "", "sweaters.jpg"],
  ["DENIM FABRIC", "", "fabric.jpg"],
];

const steps = [
  { title: "Spinning", text: "Cotton becomes yarn in our own spinning mills at Mawna, with rotor spinning and yarn dyeing added since.", stat: "100 MT", unit: "YARN SPUN A DAY", image: "chain-spinning.jpg" },
  { title: "Weaving & dyeing", text: "Ha-Meem Denim runs rope and slasher dyeing with 220 Picanol looms. Ha-Meem Textiles weaves non-denim fabric beside it.", stat: "5.5M yd", unit: "DENIM A MONTH", image: "chain-fabric.jpg" },
  { title: "Cutting & sewing", text: "Automatic spreading and cutting, then 400 sewing lines across Ashulia, Tongi, Kaliganj, Savar and Mirzapur.", stat: "120M", unit: "GARMENTS A YEAR", image: "chain-sewing.jpg" },
  { title: "Washing & finishing", text: "Seven laundries: ozone, laser, PP spray, over-dye, dip-dye and 3D whisker, with dry process on every plant.", stat: "142M", unit: "PIECES A YEAR", image: "chain-wash.jpg" },
  { title: "Trims & packaging", text: "Labels, elastic, twill tape, buttons, zips and hangers made in-house, then export cartons and poly bags from our own plants.", stat: "3.5M", unit: "LABELS A MONTH", image: "chain-trims.jpg" },
  { title: "Shipping", text: "Our own transport fleet and clearing and forwarding offices at every Bangladeshi port move goods from factory gate to vessel.", stat: "EVERY", unit: "PORT, OWN C&F", image: "biz/label.jpg" },
];

const businesses = [
  ["400*", "PRODUCTION LINES", "Woven garments", "Bottoms, tops and outerwear sewn across 26 factories in six locations around Dhaka.", "biz/woven.jpg"],
  ["5.5M", "YARDS A MONTH", "Denim mill", "Ha-Meem Denim at Mawna: rope and slasher dyeing, 220 Picanol looms, on a 100-acre site.", "biz/denim.jpg"],
  ["100 MT", "YARN A DAY", "Spinning & textiles", "Ring and rotor yarn, woven non-denim fabric and, since 2025, yarn dyeing at Sreepur.", "biz/spinning.jpg"],
  ["142M", "PIECES A YEAR", "Washing & finishing", "Seven laundries with ozone, laser, PP spray, dip-dye and 3D finishing lines.", "biz/laundry.jpg"],
  ["400", "STOLL MACHINES", "Sweaters", "Computerised flat-knitting at Kashimpur and Ashulia, about 400,000 pieces a month.", "biz/sweater.jpg"],
  ["800", "SAMPLES A DAY", "Design & sampling", "In-house designers, CAD and a 500-machine sample room turn a brief into a counter sample.", "biz/design.jpg"],
  ["40", "EMBROIDERY MACHINES", "Embroidery, printing & trims", "Forty embroidery heads, screen and digital print, labels, elastic, belts and narrow fabric.", "biz/embroidery.jpg"],
  ["100%", "EXPORT-ORIENTED", "Packaging", "Export cartons, poly bags and printed paper trims so every order ships complete.", "biz/packaging.jpg"],
  ["2005", "SAMAKAL FOUNDED", "Beyond apparel", "A national daily, a 24-hour news channel, jute, tea, transport and port clearing.", "biz/gate.jpg"],
];

const awards = [
  ["2023", "National Export Trophy", "Government of Bangladesh · Refat Garments, FY2020-21", "flags/bd.svg"],
  ["2022", "National Export Trophy", "Government of Bangladesh · Refat Garments", "flags/bd.svg"],
  ["2011", "Technical Design Certification", "Kohl's", "buyers/kohls.png"],
  ["2010", "Strategic Quality Assurance, Annual Winner", "Kohl's", "buyers/kohls.png"],
  ["2009", "Technical Performance Award", "JCPenney", "buyers/jcpenney.png"],
];

function Label({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}

function Brand({ dark = false }: { dark?: boolean }) {
  return (
    <a className={`brand ${dark ? "brand-dark" : ""}`} href="#top" aria-label="Ha-Meem Group">
      <img src={`${media}brand/${dark ? "mark.png" : "mark-white.png"}`} alt="" />
      <span><b>HA-MEEM</b><small>GROUP</small></span>
    </a>
  );
}

export default function App() {
  const [product, setProduct] = useState(0);
  const [step, setStep] = useState(1);

  return (
    <main>
      <section id="top" className="hero">
        <img className="hero-image" src={`${media}cine/looms.jpg`} alt="Long rows of looms weaving indigo denim" />
        <div className="hero-shade" />
        <header className="site-header wrap">
          <Brand />
          <nav>
            <a href="#company">COMPANY⌄</a><a href="#businesses">BUSINESSES⌄</a>
            <a href="#products">PRODUCTS⌄</a><a href="#sustainability">SUSTAINABILITY</a>
            <a href="#news">NEWS</a><a href="#people">CAREERS</a>
          </nav>
          <button className="menu" aria-label="Open menu">MENU</button>
        </header>
        <div className="hero-title wrap"><h1>From fibre to finish.<br />Made in Bangladesh.</h1></div>
        <p className="hero-caption wrap">Denim weaving — Mawna, Gazipur</p>
        <div className="hero-controls"><button>←</button><button>Ⅱ</button><button>→</button></div>
        <img className="hero-seal" src={`${media}brand/mark-white.png`} alt="" />
      </section>

      <div className="raised">
        <section id="company" className="company">
          <div className="intro wrap">
            <Label>FOUNDED IN 1984</Label>
            <h2>Ha-Meem Group is one of Bangladesh&apos;s largest vertically<br className="desktop" />
              integrated apparel manufacturers. From our own yarn and denim<br className="desktop" />
              to sewing, washing, trims and shipping, we make bottoms,<br className="desktop" />
              tops, denim and sweaters for the world&apos;s leading retailers.</h2>
          </div>
          <div className="world wrap">
            <div className="world-copy">
              <Label>WHERE WE ARE</Label>
              <h2>From Bangladesh<br />to the world.</h2>
              <p>Every factory sits within an hour of Dhaka, with sourcing offices in Hong Kong and Shanghai. Around ninety-five percent of what we make ships to the United States, the rest to Europe, Japan and India.</p>
            </div>
            <img src={`${media}world-solid.svg`} alt="" />
            <div className="world-foot">
              <p>Head office in Dhaka. 26 factories, mills and laundries around Gazipur, Ashulia and Tangail. A tea estate in Moulvibazar.</p>
              <div className="legend"><span>● BANGLADESH</span><span>● SOURCING OFFICES</span><span>● EXPORT MARKETS</span></div>
            </div>
          </div>
          <div className="buyers wrap">
            <div className="buyers-title"><Label>OUR BUYERS</Label><h2>Retailers and brands<br />we manufacture for.<sup>*</sup></h2></div>
            <div className="buyer-grid">
              {buyers.map((name) => <div key={name}><img src={`${media}buyers/${name}.png`} alt={name.replaceAll("-", " ")} /></div>)}
            </div>
          </div>
        </section>

        <section id="products" className="products">
          <div className="product-image"><img src={`${media}products/${products[product][2]}`} alt={products[product][0]} /></div>
          <div className="product-copy">
            <Label>WHAT WE MAKE</Label>
            <h2>Bottoms, tops,<br />denim and sweaters.</h2>
            <p>Seventy percent bottoms, thirty percent tops, half of it denim, sized from infant to adult.</p>
            <div className="product-list">
              {products.map((item, i) => (
                <button className={product === i ? "active" : ""} key={item[0]} onClick={() => setProduct(i)}>
                  <b>{item[0]}</b>{product === i && item[1] && <span>{item[1]}</span>}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section id="chain" className="chain">
          <div className="chain-head wrap">
            <div><Label>VERTICAL INTEGRATION</Label><h2>Six steps, all ours.</h2></div>
            <p>From yarn to the vessel, every step happens inside the group. Ahead of the line, 250 merchandisers and a 500-machine sample room turn a brief into a counter sample within days.</p>
          </div>
          <div className="steps">
            {steps.map((item, i) => (
              <button key={item.title} className={`step ${step === i ? "open" : ""}`} onClick={() => setStep(i)} onMouseEnter={() => setStep(i)}
                style={{ backgroundImage: step === i ? `linear-gradient(90deg,rgba(17,20,24,.94),rgba(17,20,24,.76)),url("${media}${item.image}")` : undefined }}>
                <span className="step-num">0{i + 1}</span>
                {step === i ? <span className="step-body"><em>STEP {String(i + 1).padStart(2, "0")} OF 6</em><strong>{item.title}</strong><span>{item.text}</span><b>{item.stat} <small>{item.unit}</small></b></span>
                  : <strong className="vertical">{item.title}</strong>}
              </button>
            ))}
          </div>
        </section>

        <section id="businesses" className="businesses wrap">
          <div className="business-head">
            <Label>WHAT WE DO</Label>
            <h2>One group, from yarn<br />to shipped carton.</h2>
            <p>Every unit upstream of a sewing line exists to make that line faster and more reliable. Around the apparel chain sit media, jute, tea and logistics.</p>
          </div>
          <div className="business-grid">
            {businesses.map((b) => <a href="#contact" key={b[2]} className="business-card">
              <img src={`${media}${b[4]}`} alt="" />
              <span className="business-overlay" />
              <span className="business-stat"><b>{b[0]}</b><small>{b[1]}</small></span>
              <span className="business-text"><strong>{b[2]}</strong><small>{b[3]}</small></span>
            </a>)}
          </div>
          <p className="tile-note">Tiles open the group&apos;s own pages for each unit.</p>
        </section>

        <section id="recognition" className="recognition">
          <div className="wrap">
            <div className="split-head"><div><Label>RECOGNITION</Label><h2>Judged by the people<br />who buy from us.</h2></div>
              <p>Two national export trophies in a row, and quality and technical awards from the retailers whose audits we pass every season.</p></div>
            <div className="awards">{awards.map((a) => <div className="award" key={a[0]}>
              <b>{a[0]}</b><img src={`${media}${a[3]}`} alt="" /><strong>{a[1]}</strong><small>{a[2]}</small>
            </div>)}</div>
            <div className="certs"><Label>CERTIFIED<sup>*</sup></Label><div><span><b>GOTS</b> Global Organic Textile Standard</span><span><b>OCS</b> Organic Content Standard</span><span><b>GRS</b> Global Recycled Standard</span><span><b>RCS</b> Recycled Claim Standard</span><span><b>OEKO-TEX</b> Standard 100</span></div></div>
          </div>
        </section>

        <section id="sustainability" className="sustainability">
          <img src={`${media}sustain-campus.jpg`} alt="Ha-Meem Textiles at Mawna" />
          <div className="sustain-shade" />
          <div className="sustain-inner">
            <Label>SUSTAINABILITY</Label><h2>Cleaner water.<br />Cleaner power.<br /><span>Measured.</span></h2>
            <p>Our mills treat effluent biologically, recover process chemicals and put solar on factory roofs, working toward net-zero by 2050.</p>
            <div className="metrics"><div><b>0<small> MW</small></b><span>Rooftop solar installed<br />across factories</span></div><div><b>0%</b><span>Of process water recycled</span></div><div><b>0<small> m³ / hour</small></b><span>Biological effluent treatment<br />with MBR membrane, Mawna</span></div><div><b>0–80%</b><span>Caustic soda recovered and<br />reused in fabric processing</span></div></div>
          </div>
        </section>

        <section id="people" className="people">
          <div className="people-copy"><Label>PEOPLE</Label><h2>More than<br />50,000 people.<sup>*</sup></h2>
            <p>Most joined as machine operators. The group founded three schools for their children, funds scholarships, and runs a higher-education pathway with the Asian University for Women called Dreams Beyond the Factory Floor.</p>
            <a className="outline-button" href="#contact">WORK WITH US</a>
          </div>
          <img src={`${media}people-knit.jpg`} alt="A knitting technician programming a Stoll machine" />
        </section>

        <section id="news" className="news">
          <div className="news-head wrap"><div><Label>NEWSROOM</Label><h2>Latest from the group.</h2></div><Label>LINKS OPEN THE ORIGINAL REPORT</Label></div>
          <div className="news-grid">
            <a><img src={`${media}news-yarn.jpg`} alt="" /><span>TEXTILES · 1 SEP 2025</span><strong>Ha-Meem opens a new yarn-dyeing plant at Sreepur, Gazipur</strong></a>
            <a><img src={`${media}biz/textiles.jpg`} alt="" /><span>SUSTAINABILITY · 2 FEB 2025</span><strong>A 4.4 MWp rooftop plant takes group solar capacity to 12.2 MWp</strong></a>
            <a><img src={`${media}chain-sewing.jpg`} alt="" /><span>RECOGNITION · NOV 2023</span><strong>Refat Garments receives the Bangabandhu Sheikh Mujib Export Trophy for FY2020-21</strong></a>
          </div>
        </section>

        <section id="careers" className="careers">
          <img src={`${media}cine/fabric.jpg`} alt="" /><div className="career-shade" />
          <div className="career-copy"><Label>WORK WITH US</Label><h2>Sourcing from<br />Bangladesh?</h2><p>One partner from yarn to vessel. Tell us what you make<br />and we will tell you where it fits.</p>
            <div><a className="white-button" href="mailto:sales@hameemdenim.com">TALK TO SALES</a><a className="dark-button" href="mailto:career@hameemgroup.com">CAREERS</a></div>
          </div>
        </section>

        <Footer />
      </div>
    </main>
  );
}

function Footer() {
  const columns = [
    ["GROUP", "About Ha-Meem", "How we make it", "Recognition & awards", "Sustainability", "People & community", "Newsroom", "Careers", "Contact"],
    ["BUSINESSES", "Woven apparel", "Denim fabric", "Textiles & spinning", "Sweaters", "Washing & finishing", "Trims & packaging", "Design & sampling", "Media · jute · tea"],
    ["FOR BUYERS", "Fabric library", "360° virtual tour", "Certifications", "Request swatch cards", "Book a factory visit", "Company profile"],
    ["GROUP COMPANIES", "Ha-Meem Group (official)", "Ha-Meem Denim", "Ha-Meem Textiles", "360° tour platform", "Samakal", "Channel 24"],
    ["FOLLOW", "YouTube", "LinkedIn", "Facebook"],
  ];
  return <footer id="contact"><div className="footer-main wrap">
    <div className="address"><Brand dark /><p>387 (South), Tejgaon Industrial Area<br />Dhaka-1208, Bangladesh</p><p>+880 2 8170592 · +880 2 8170593</p><b>SOURCING ENQUIRIES</b><a>sales@hameemdenim.com</a><b>CAREERS</b><a>career@hameemgroup.com</a></div>
    {columns.map(c => <div className="footer-column" key={c[0]}><b>{c[0]}</b>{c.slice(1).map(x => <a key={x}>{x}</a>)}</div>)}
  </div><div className="footer-base"><div className="wrap"><span>© 2026 Ha-Meem Group. Concept homepage — not the official site.</span><span>Privacy notice　　Terms of use　　Supplier code of conduct</span><span><b>*</b> Figure from public sources, pending confirmation by Ha-Meem Group.</span></div></div></footer>;
}
