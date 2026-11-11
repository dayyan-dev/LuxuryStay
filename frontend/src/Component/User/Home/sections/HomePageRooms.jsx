import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRooms } from "../../../../api/roomApi";
import Reveal from "../../effects/Reveal";
import TiltCard from "../../effects/TiltCard";
import {
  formatRoomTitle,
  getUploadUrl,
  getRoomStatusMeta,
  isRoomBookingBlocked,
} from "../../../../utils/userMedia";

const getImageUrl = (img) => getUploadUrl(img);

const getAmenityIcon = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("wifi") || n.includes("internet")) return "fa-wifi";
  if (n.includes("tv") || n.includes("television")) return "fa-tv";
  if (n.includes("pool") || n.includes("swimming")) return "fa-water-ladder";
  if (n.includes("gym") || n.includes("fitness")) return "fa-dumbbell";
  if (n.includes("spa") || n.includes("massage")) return "fa-spa";
  if (n.includes("breakfast") || n.includes("meal")) return "fa-utensils";
  if (n.includes("parking")) return "fa-square-parking";
  if (n.includes("air") || n.includes("ac")) return "fa-wind";
  if (n.includes("bath") || n.includes("tub")) return "fa-bath";
  if (n.includes("balcony") || n.includes("terrace")) return "fa-archway";
  return "fa-circle-check";
};

export default function HomePageRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("all");

  useEffect(() => {
    let isMounted = true;
    // Showcase one property's inventory mix: prefer rooms that have hotelId linked
    getRooms()
      .then((data) => {
        if (!isMounted) return;
        const list = Array.isArray(data) ? data : data.rooms || [];
        const withHotel = list.filter((r) => r.hotelId);
        setRooms(withHotel.length ? withHotel : list);
      })
      .catch((err) => {
        console.warn("Rooms fetch notice:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const roomTypes = [
    { key: "all", label: "All Suites" },
    { key: "single", label: "Deluxe Single" },
    { key: "double", label: "Executive Double" },
    { key: "suite", label: "Royal Suites" },
  ];

  // Prefer available rooms, then diversify across hotels for the homepage grid
  const filterRooms = (() => {
    const typed =
      selectedFilter === "all"
        ? rooms
        : rooms.filter(
            (r) => (r.type || "").toLowerCase() === selectedFilter.toLowerCase()
          );
    const sorted = [...typed].sort((a, b) => {
      const aOk = a.status === "available" || !a.status ? 0 : 1;
      const bOk = b.status === "available" || !b.status ? 0 : 1;
      return aOk - bOk;
    });
    const seenHotels = new Set();
    const diversified = [];
    for (const room of sorted) {
      const hid =
        room.hotelId && typeof room.hotelId === "object"
          ? String(room.hotelId._id)
          : String(room.hotelId || "");
      if (hid && seenHotels.has(hid) && diversified.length >= 3) continue;
      if (hid) seenHotels.add(hid);
      diversified.push(room);
      if (diversified.length >= 6) break;
    }
    return diversified.length ? diversified : sorted.slice(0, 6);
  })();

  return (
    <section
      className="py-5 ls-print-surface"
      style={{
        borderTop: "1px solid var(--color-border, #E8E2D9)",
        borderBottom: "1px solid var(--color-border, #E8E2D9)",
      }}
    >
      <div className="container py-4">
        {/* Section Header */}
        <Reveal className="text-center mb-5">
          <span className="ls-section-tag">Unrivaled Comfort & Elegance</span>
          <h2 className="ls-section-title">Featu Rooms & Suites</h2>
          <p className="ls-section-subtitle">
            Thoughtfully curated private sanctuaries appointed with imported
            linens, marble baths, and panoramic city or mountain vistas.
          </p>

          {/* Filter Pills */}
          <div className="d-flex flex-wrap justify-content-center gap-2 mt-4">
            {roomTypes.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedFilter(tab.key)}
                className="btn btn-sm"
                style={{
                  borderRadius: "var(--radius-pill, 50px)",
                  padding: "0.5rem 1.4rem",
                  fontSize: "0.84rem",
                  fontWeight: 600,
                  transition: "all 0.2s ease",
                  border:
                    selectedFilter === tab.key
                      ? "1px solid var(--theme-primary, #1B365D)"
                      : "1px solid var(--color-border, #E8E2D9)",
                  background:
                    selectedFilter === tab.key
                      ? "var(--theme-primary, #1B365D)"
                      : "#FFFFFF",
                  color:
                    selectedFilter === tab.key
                      ? "#FFFFFF"
                      : "var(--color-text-secondary, #77766F)",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Loading State */}
        {loading ? (
          <div className="row g-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="col-12 col-md-6 col-lg-4">
                <div
                  className="ls-card p-0"
                  style={{ height: 420, opacity: 0.7 }}
                >
                  <div
                    style={{
                      height: 220,
                      background: "#EBE6DD",
                      animation: "pulse 1.5s infinite",
                    }}
                  />
                  <div className="p-4">
                    <div
                      style={{
                        height: 20,
                        background: "#EBE6DD",
                        width: "60%",
                        marginBottom: 12,
                      }}
                    />
                    <div
                      style={{
                        height: 14,
                        background: "#EBE6DD",
                        width: "90%",
                        marginBottom: 8,
                      }}
                    />
                    <div
                      style={{
                        height: 14,
                        background: "#EBE6DD",
                        width: "40%",
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filterRooms.length === 0 ? (
          <div className="text-center py-5">
            <i
              className="fa-solid fa-bed fa-3x mb-3"
              style={{ color: "var(--color-border, #E8E2D9)" }}
            ></i>
            <h5 style={{ color: "var(--color-text-primary)" }}>
              No suites found in this category
            </h5>
            <p
              className="text-muted small"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Please view all suites to explore our complete collection.
            </p>
            <button
              onClick={() => setSelectedFilter("all")}
              className="ls-btn-outline mt-2"
            >
              View All Suites
            </button>
          </div>
        ) : (
          /* Room Cards Grid */
          <div className="row g-4 ls-depth-scene">
            {filterRooms.map((room, index) => {
              const mainImage =
                room.images && room.images.length > 0
                  ? getImageUrl(room.images[0])
                  : "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80";

              const blocked = isRoomBookingBlocked(room.status);
              const statusMeta = getRoomStatusMeta(room.status);
              const isAvailable = !blocked && (room.status === "available" || !room.status);

              return (
                <Reveal
                  key={room._id}
                  className="col-12 col-md-6 col-lg-4"
                  delay={Math.min(index * 0.08, 0.32)}
                >
                  <TiltCard maxTilt={5} glare={false}>
                  <div
                    className="ls-card d-flex flex-column h-100 position-relative"
                    style={{
                      borderRadius: "var(--radius-md, 10px)",
                      overflow: "hidden",
                    }}
                  >
                    {/* Room Image Container */}
                    <div
                      style={{
                        height: 230,
                        position: "relative",
                        overflow: "hidden",
                        backgroundColor: "var(--theme-surface-subtle, #F1F5F9)",
                      }}
                    >
                      <img
                        src={mainImage}
                        alt={room.title || room.roomNumber}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transition: "transform 0.4s ease",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.transform = "scale(1.05)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.transform = "scale(1.0)")
                        }
                      />

                      {/* Status / Category Badge */}
                      <span
                        className="position-absolute top-0 start-0 m-3 px-3 py-1 rounded-pill"
                        style={{
                          fontSize: "0.74rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          background: isAvailable
                            ? "rgba(50, 122, 88, 0.9)"
                            : statusMeta
                              ? statusMeta.color
                              : "rgba(204, 91, 85, 0.9)",
                          color: "#FFFFFF",
                          backdropFilter: "blur(4px)",
                        }}
                      >
                        {isAvailable ? "Available" : (statusMeta?.text || "Unavailable")}
                      </span>

                      {/* Capacity Pill */}
                      <span
                        className="position-absolute bottom-0 end-0 m-3 px-2 py-1 rounded"
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          background: "rgba(23, 26, 23, 0.8)",
                          color: "#FFFFFF",
                          backdropFilter: "blur(4px)",
                        }}
                      >
                        <i className="fa-solid fa-user me-1 text-gold" style={{ color: 'var(--theme-primary, #1B365D)' }}></i>
                        {room.capacity || 2} Guests
                      </span>
                    </div>

                    {/* Room Body */}
                    <div className="p-4 d-flex flex-column flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <span
                          style={{
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            color: "var(--theme-primary, #1B365D)",
                          }}
                        >
                          Room #{room.roomNumber} • {room.type}
                        </span>
                      </div>

                      <h4
                        style={{
                          fontFamily: "var(--font-heading)",
                          fontSize: "1.28rem",
                          fontWeight: 600,
                          color: "var(--color-text-primary, #292722)",
                          marginBottom: "0.5rem",
                        }}
                      >
                        {formatRoomTitle(room)}
                      </h4>

                      {room.hotelId && typeof room.hotelId === "object" && room.hotelId.name && (
                        <p
                          style={{
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            color: "var(--theme-primary, #1B365D)",
                            marginBottom: "0.45rem",
                          }}
                        >
                          <i className="fa-solid fa-hotel me-1"></i>
                          {room.hotelId.name}
                          {room.hotelId.city ? ` · ${room.hotelId.city}` : ""}
                        </p>
                      )}

                      <p
                        style={{
                          fontSize: "0.88rem",
                          color: "var(--color-text-secondary, #77766F)",
                          lineHeight: 1.55,
                          marginBottom: "1rem",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {room.description ||
                          "A refined sanctuary with plush bedding, marble vanity, high-speed Wi-Fi, and personalized concierge."}
                      </p>

                      {/* Amenities Pills */}
                      <div className="d-flex flex-wrap gap-2 mb-4 mt-auto">
                        {(room.amenities || ["WiFi", "AC", "TV", "Room Service"])
                          .slice(0, 4)
                          .map((am, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 rounded"
                              style={{
                                fontSize: "0.76rem",
                                background: "var(--color-background, #F7F5F0)",
                                border:
                                  "1px solid var(--color-border, #E8E2D9)",
                                color: "var(--color-text-primary, #292722)",
                              }}
                            >
                              <i
                                className={`fa-solid ${getAmenityIcon(
                                  am
                                )} me-1`}
                                style={{
                                  color: "var(--theme-primary, #1B365D)",
                                  fontSize: "0.72rem",
                                }}
                              ></i>
                              {am}
                            </span>
                          ))}
                      </div>

                      {/* Card Footer: Price & Actions */}
                      <div
                        className="pt-3 border-top d-flex align-items-center justify-content-between"
                        style={{ borderColor: "var(--color-border, #E8E2D9)" }}
                      >
                        <div>
                          <span
                            style={{
                              fontSize: "0.72rem",
                              textTransform: "uppercase",
                              color: "var(--color-text-secondary)",
                              display: "block",
                            }}
                          >
                            Starting From
                          </span>
                          <span
                            style={{
                              fontFamily: "var(--font-heading)",
                              fontSize: "1.22rem",
                              fontWeight: 700,
                              color: "var(--theme-primary, #1B365D)",
                            }}
                          >
                            PKR {Number(room.price).toLocaleString()}
                          </span>
                          <span
                            style={{
                              fontSize: "0.74rem",
                              color: "var(--color-text-secondary)",
                            }}
                          >
                            {" "}
                            / night
                          </span>
                        </div>

                        <div className="d-flex align-items-center gap-2">
                          <Link
                            to={`/roomsdetails/${room._id}`}
                            className="btn btn-sm btn-outline-dark"
                            style={{
                              fontSize: "0.78rem",
                              padding: "0.45rem 0.85rem",
                              borderRadius: "var(--radius-sm, 4px)",
                            }}
                          >
                            Details
                          </Link>

                          {blocked ? (
                            <span
                              className="ls-btn-primary"
                              style={{
                                fontSize: "0.78rem",
                                padding: "0.45rem 1rem",
                                borderRadius: "var(--radius-sm, 4px)",
                                opacity: 0.55,
                                cursor: "not-allowed",
                              }}
                            >
                              Unavailable
                            </span>
                          ) : (
                            <Link
                              to={`/booking/${room._id}`}
                              className="ls-btn-primary"
                              style={{
                                fontSize: "0.78rem",
                                padding: "0.45rem 1rem",
                                borderRadius: "var(--radius-sm, 4px)",
                              }}
                            >
                              Book Now
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  </TiltCard>
                </Reveal>
              );
            })}
          </div>
        )}

        {/* View All Suites CTA */}
        <div className="text-center mt-5">
          <Link to="/room" className="text-decoration-none">
            <button
              className="ls-btn-outline"
              style={{
                padding: "0.75rem 2.2rem",
                fontSize: "0.86rem",
                borderRadius: "var(--radius-sm, 4px)",
              }}
            >
              <i className="fa-solid fa-list-ul me-2"></i>
              View All Rooms & Suites
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
