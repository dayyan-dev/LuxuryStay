import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = (process.env.REACT_APP_API_URL || "http://localhost:5001/api");

// ✅ Category enum ko readable title mein convert karo
const CATEGORY_LABELS = {
  booking:    "Reservations & Booking",
  payment:    "Payments & Pricing",
  room:       "Rooms & Amenities",
  restaurant: "Dining & Restaurant",
  general:    "General Information",
};

// ✅ Category display order
const CATEGORY_ORDER = ["general", "booking", "payment", "room", "restaurant"];

function AccordionGroup({ title, id, items }) {
  return (
    <div className="col-lg-10">
      <h2 className="text-6 fw-600 text-primary mb-3">{title}</h2>
      <div className="accordion" id={id}>
        {items.map((item, index) => {
          const headingId  = `${id}-heading-${index}`;
          const collapseId = `${id}-collapse-${index}`;
          return (
            <div className="accordion-item" key={item._id}>
              <h2 className="accordion-header" id={headingId}>
                <button
                  className={`accordion-button ${index === 0 ? "" : "collapsed"}`}
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#${collapseId}`}
                  aria-expanded={index === 0 ? "true" : "false"}
                  aria-controls={collapseId}
                >
                  {item.question}
                </button>
              </h2>
              <div
                id={collapseId}
                className={`accordion-collapse collapse ${index === 0 ? "show" : ""}`}
                aria-labelledby={headingId}
                data-bs-parent={`#${id}`}
              >
                <div className="accordion-body">{item.answer}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function FaqAccordion() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        // ✅ Active FAQs public route
        const res = await axios.get(`${BASE_URL}/faqs/active`);

        // ✅ Category ke hisaab se group karo
        const grouped = res.data.reduce((acc, faq) => {
          const cat = faq.category || "general";
          const existing = acc.find(g => g.category === cat);
          if (existing) {
            existing.items.push(faq);
          } else {
            acc.push({
              category: cat,
              title: CATEGORY_LABELS[cat] || cat,
              id: `accordion-${cat}`,
              items: [faq],
            });
          }
          return acc;
        }, []);

        // ✅ Defined order mein sort karo
        grouped.sort((a, b) => {
          const ai = CATEGORY_ORDER.indexOf(a.category);
          const bi = CATEGORY_ORDER.indexOf(b.category);
          return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
        });

        setGroups(grouped);
      } catch (err) {
        console.error("FAQ fetch error:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, []);

  if (loading) {
    return (
      <section className="section">
        <div className="text-center py-5">
          <div className="spinner-border text-primary"></div>
          <p className="mt-3 text-muted">Loading FAQs...</p>
        </div>
      </section>
    );
  }

  if (groups.length === 0) {
    return (
      <section className="section">
        <div className="text-center py-5">
          <i className="fa-solid fa-circle-question fa-3x text-muted mb-3"></i>
          <p className="text-muted">No FAQs available at the moment</p>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container">
        <div className="row justify-content-center g-5">
          {groups.map((group) => (
            <AccordionGroup key={group.id} {...group} />
          ))}
        </div>
      </div>
    </section>
  );
}