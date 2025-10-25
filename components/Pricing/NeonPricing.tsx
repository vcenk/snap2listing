"use client";
import Link from "next/link";

export default function NeonPricing() {
  const plans = [
    {
      key: "free",
      title: "TRY FREE",
      subtitle: "FREE",
      price: 0,
      gradient: "linear-gradient(135deg,#8ea6ff 0%,#89e3e0 100%)", // blue → aqua
      details: ["AI titles, descriptions, tags", "15 images / month", "Manual export"],
      cta: { label: "Try Free", href: "/signup" },
    },
    {
      key: "starter",
      title: "START AUTOMATING",
      subtitle: "STARTER",
      price: 19,
      gradient: "linear-gradient(135deg,#ff5f6d 0%,#ffc371 100%)", // coral → peach
      details: ["AI text + Etsy SEO", "100 images / 2 videos (15s)", "1-click publish to Etsy"],
      cta: { label: "Start Automating", href: "/signup" },
    },
    {
      key: "pro",
      title: "GO PRO",
      subtitle: "PRO",
      price: 39,
      gradient: "linear-gradient(135deg,#6366f1 0%,#3b82f6 100%)", // indigo → blue
      details: ["AI text + real-time SEO scoring", "250 images / 5 videos (15s)", "Bulk draft + scheduling"],
      cta: { label: "Go Pro", href: "/signup" },
    },
    {
      key: "business",
      title: "SCALE YOUR SHOP",
      subtitle: "BUSINESS",
      price: 79,
      gradient: "linear-gradient(135deg,#16a34a 0%,#06b6d4 100%)", // green → teal
      details: ["Brand voice memory + analytics", "600 images / 15 videos (30s)", "Multi-shop & bulk publish"],
      cta: { label: "Scale Your Shop", href: "/contact" },
    },
  ];

  return (
    <section id="pricing" className="pricing-root">
      <div className="wrap">
        <div className="pricing-grid">
          {plans.map((p) => (
            <article key={p.key} className="card" style={{ background: p.gradient }}>
              <h6 className="type">
                {p.title} <span className="sub">{p.subtitle}</span>
              </h6>

              <div className="price-wrapper">
                <span className="dollar-sign">$</span>
                <span className="price-amount">{p.price}</span>
              </div>

              <h5 className="plan">PLAN</h5>

              <ul className="details">
                {p.details.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>

              <Link href={p.cta.href} className="buy-button" aria-label={p.cta.label}>
                <h3 className="btn">{p.cta.label}</h3>
              </Link>
            </article>
          ))}
        </div>
      </div>

      <style jsx>{`
        /* Section (full width, self-centered) */
        .pricing-root {
          padding: 64px 16px 96px;
          background: transparent;
        }
        .wrap {
          max-width: 1280px;
          margin: 0 auto;
        }

        /* Responsive grid that FITS */
        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 28px;
          align-items: stretch;
        }

        /* Card (equal heights) */
        .card {
          min-height: 460px; /* equal height */
          position: relative;
          border-radius: 22px;
          padding: 26px 26px 96px; /* leave room for CTA strip */
          color: #0b0b0d;
          overflow: hidden;
          box-shadow: 0 22px 45px rgba(10, 10, 20, 0.18);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          backdrop-filter: saturate(115%);
        }
        .card:hover {
          transform: translateY(-4px);
          box-shadow: 0 28px 60px rgba(10, 10, 20, 0.24);
        }

        /* Header line */
        .type {
          margin: 2px 0 6px;
          letter-spacing: 0.02em;
          font-weight: 800;
          color: #0b3bff;
          text-transform: uppercase;
          font-size: 0.95rem;
        }
        .type .sub {
          margin-left: 8px;
          color: rgba(0, 0, 0, 0.5);
          font-size: 0.7rem;
          font-weight: 700;
        }

        /* Price */
        .price-wrapper {
          display: flex;
          align-items: flex-start;
          position: relative;
          margin: 8px 0 12px;
          line-height: 0.9;
        }
        .dollar-sign {
          font-size: clamp(1.5rem, 3vw, 2rem);
          font-weight: 800;
          margin-right: 4px;
          margin-top: 8px;
          color: #0b0b0d;
        }
        .price-amount {
          font-size: clamp(3rem, 6.2vw, 5rem);
          font-weight: 800;
          color: #0b0b0d;
        }
        .price-wrapper::before {
          content: "";
          position: absolute;
          right: -40%;
          bottom: -10%;
          color: rgba(255, 255, 255, 0.12);
          font-size: clamp(4rem, 10vw, 8rem);
          font-weight: 800;
          z-index: 0;
        }
        .card:nth-child(1) .price-wrapper::before {
          content: "$0";
        }
        .card:nth-child(2) .price-wrapper::before {
          content: "$19";
        }
        .card:nth-child(3) .price-wrapper::before {
          content: "$39";
        }
        .card:nth-child(4) .price-wrapper::before {
          content: "$79";
        }

        /* Plan divider line */
        .plan {
          font-size: 0.95rem;
          font-weight: 800;
          position: relative;
          margin-bottom: 8px;
        }
        .plan::before,
        .plan::after {
          position: absolute;
          content: "";
          width: 34px;
          height: 2px;
          background: rgba(0, 0, 0, 0.9);
          bottom: 45%;
          transition: transform 0.2s ease;
        }
        .plan::before {
          right: 100%;
          transform: translate(-8px, 0);
        }
        .plan::after {
          left: 100%;
          transform: translate(8px, 0);
        }
        .card:hover .plan::before {
          transform: translate(-16px, 0);
        }
        .card:hover .plan::after {
          transform: translate(16px, 0);
        }

        /* Details */
        .details {
          list-style: none;
          padding: 0;
          margin: 12px 0 0 0;
        }
        .details li {
          margin: 10px 0;
          font-weight: 700;
          text-transform: none;
        }

        /* CTA strip (fixed height; doesn't change card height) */
        .buy-button {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 68px;
          background: #ffffff;
          border-radius: 0 0 22px 22px;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: filter 0.25s ease;
        }
        .buy-button:hover {
          filter: brightness(0.95);
        }
        .btn {
          color: #0b0b0d;
          margin: 0;
          font-size: 1.05rem;
          font-weight: 800;
          text-transform: uppercase;
        }

        /* Small screens */
        @media (max-width: 600px) {
          .card {
            min-height: 420px;
          }
        }
      `}</style>
    </section>
  );
}
