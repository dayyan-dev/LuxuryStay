import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getRooms, getSingleRoom } from "../../../../api/roomApi";
import {
  getUploadUrl,
  isRoomBookingBlocked,
  isRoomUnavailableForStay,
  getRoomStatusMeta,
} from "../../../../utils/userMedia";

const getImageUrl = (img) =>
  getUploadUrl(img, "https://via.placeholder.com/800x500?text=No+Image");

const getAmenityIcon = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("wifi") || n.includes("internet")) return "fa-wifi";
  if (n.includes("tv") || n.includes("television")) return "fa-tv";
  if (n.includes("pool") || n.includes("swimming")) return "fa-water-ladder";
  if (n.includes("gym") || n.includes("fitness")) return "fa-dumbbell";
  if (n.includes("spa") || n.includes("massage")) return "fa-spa";
  if (n.includes("parking") || n.includes("garage")) return "fa-square-parking";
  if (n.includes("breakfast") || n.includes("meal") || n.includes("dining"))
    return "fa-utensils";
  if (n.includes("bar") || n.includes("drink") || n.includes("minibar"))
    return "fa-martini-glass";
  if (n.includes("air") || n.includes("ac") || n.includes("conditioner"))
    return "fa-wind";
  if (n.includes("heat") || n.includes("heating")) return "fa-temperature-high";
  if (n.includes("bath") || n.includes("tub") || n.includes("jacuzzi"))
    return "fa-bath";
  if (n.includes("shower")) return "fa-shower";
  if (n.includes("safe") || n.includes("locker")) return "fa-lock";
  if (n.includes("laundry") || n.includes("washing")) return "fa-shirt";
  if (n.includes("balcony") || n.includes("terrace")) return "fa-archway";
  if (
    n.includes("view") ||
    n.includes("ocean") ||
    n.includes("sea") ||
    n.includes("mountain")
  )
    return "fa-binoculars";
  if (n.includes("kitchen") || n.includes("kitchenette"))
    return "fa-kitchen-set";
  if (n.includes("fridge") || n.includes("refrigerator"))
    return "fa-temperature-low";
  if (n.includes("coffee") || n.includes("tea") || n.includes("kettle"))
    return "fa-mug-hot";
  if (n.includes("phone") || n.includes("telephone")) return "fa-phone";
  if (n.includes("desk") || n.includes("work")) return "fa-briefcase";
  if (n.includes("iron") || n.includes("ironing")) return "fa-shirt";
  if (n.includes("hair") || n.includes("dryer")) return "fa-wind";
  if (n.includes("towel") || n.includes("linen")) return "fa-scroll";
  if (n.includes("24") || n.includes("reception") || n.includes("concierge"))
    return "fa-bell-concierge";
  if (n.includes("room service")) return "fa-bell-concierge";
  if (n.includes("pet")) return "fa-paw";
  if (n.includes("smoke") || n.includes("smoking")) return "fa-smoking";
  if (
    n.includes("disable") ||
    n.includes("accessible") ||
    n.includes("wheelchair")
  )
    return "fa-wheelchair";
  if (n.includes("child") || n.includes("kid") || n.includes("baby"))
    return "fa-baby";
  if (n.includes("garden") || n.includes("outdoor")) return "fa-tree";
  if (n.includes("security") || n.includes("cctv")) return "fa-shield-halved";
  if (n.includes("elevator") || n.includes("lift")) return "fa-elevator";
  return "fa-circle-check";
};

const getStatusLabel = (status) => getRoomStatusMeta(status);

const roomIsBlocked = (room) => isRoomUnavailableForStay(room);

const roomStatusInfo = (room) => {
  const dateBlocked =
    room?.dateConflict === true || room?.availableForDates === false;
  const hardBlocked = isRoomBookingBlocked(room?.status);
  if (dateBlocked && !hardBlocked) {
    return {
      ...getRoomStatusMeta("booked"),
      text: "Booked for your dates",
    };
  }
  return getStatusLabel(room?.status);
};

// ─── FLOOR LABEL ─────────────────────────────────────────────────────────────
const getFloorLabel = (floor) => {
  const map = {
    ground: { label: "Ground Floor", icon: "fa-building" },
    first: { label: "1st Floor", icon: "fa-building" },
    second: { label: "2nd Floor", icon: "fa-building" },
  };
  return map[floor?.toLowerCase()] || { label: floor, icon: "fa-building" };
};

// ─── MODAL STYLES ─────────────────────────────────────────────────────────────
const MODAL_STYLES = `
  .rm-backdrop {
    position: fixed; inset: 0; z-index: 1050;
    background: rgba(0,0,0,0.55);
    backdrop-filter: blur(8px);
    animation: rm-fade-in 0.3s ease forwards;
  }

  .rm-modal {
    position: fixed;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1055;
    width: min(1080px, 95vw);
    height: min(720px, 85vh);
    display: flex;
    flex-direction: column;
    background: #ffffff;
    border-radius: 16px;
    border: 1px solid var(--theme-border, #E2E8F0);
    box-shadow: 0 25px 60px rgba(0,0,0,0.18);
    overflow: hidden;
    animation: rm-slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    font-family: 'Jost', sans-serif;
  }

  .rm-modal-container {
    display: flex;
    flex: 1;
    overflow: hidden;
    height: calc(100% - 76px);
  }

  .rm-modal-sidebar {
    width: 45%;
    position: relative;
    overflow: hidden;
    background: var(--theme-bg-primary, #F8FAFC);
  }

  .rm-modal-sidebar img {
    width: 100%; height: 100%;
    object-fit: cover;
    transition: transform 4s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .rm-modal-sidebar img.rm-unavailable-img {
    filter: grayscale(30%) brightness(0.85);
  }
  .rm-modal:hover .rm-modal-sidebar img { transform: scale(1.04); }

  .rm-sidebar-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to bottom, rgba(0,0,0,0.0) 40%, rgba(0,0,0,0.65) 100%);
  }

  .rm-sidebar-details {
    position: absolute; bottom: 0; left: 0; right: 0;
    padding: 28px;
  }

  .rm-modal-inner {
    width: 55%;
    overflow-y: auto;
    background: #ffffff;
    padding: 32px;
    scrollbar-width: thin;
    scrollbar-color: var(--theme-primary-soft, rgba(27, 54, 93, 0.5)) transparent;
  }
  .rm-modal-inner::-webkit-scrollbar { width: 6px; }
  .rm-modal-inner::-webkit-scrollbar-track { background: transparent; }
  .rm-modal-inner::-webkit-scrollbar-thumb { background: var(--theme-primary-soft, rgba(27, 54, 93, 0.5)); border-radius: 10px; }
  .rm-modal-inner::-webkit-scrollbar-thumb:hover { background: var(--theme-primary-soft, rgba(27, 54, 93, 0.85)); }

  .rm-status-ribbon {
    position: absolute; top: 16px; left: 16px;
    padding: 5px 12px;
    font-size: 10px; font-weight: 600; letter-spacing: 1.5px;
    text-transform: uppercase; border-radius: 20px;
    display: inline-flex; align-items: center; gap: 7px; z-index: 5;
    backdrop-filter: blur(8px);
  }

  .rm-status-dot {
    width: 6px; height: 6px; border-radius: 50%;
    animation: rm-pulse 2s ease-in-out infinite;
  }

  .rm-tag {
    display: inline-block;
    font-size: 10px; font-weight: 600; letter-spacing: 2px;
    text-transform: uppercase; color: var(--theme-primary, #1B365D);
    border: 1px solid var(--theme-primary-soft, rgba(27, 54, 93, 0.40));
    padding: 4px 12px; border-radius: 20px; margin-bottom: 10px;
    background: var(--theme-primary-soft, rgba(27, 54, 93, 0.08));
  }

  .rm-title {
    font-family: 'Playfair Display', serif;
    font-size: 32px; font-weight: 600; color: #fff;
    line-height: 1.2; margin: 0 0 6px 0;
    text-shadow: 0 2px 8px rgba(0,0,0,0.3);
  }

  .rm-price-badge {
    display: flex; align-items: baseline; gap: 5px;
  }
  .rm-price-amount {
    font-size: 22px; font-weight: 700; color: var(--theme-primary, #1B365D); line-height: 1;
  }
  .rm-price-night {
    font-size: 11px; font-weight: 400; letter-spacing: 1px;
    text-transform: uppercase; color: rgba(255,255,255,0.7);
  }

  .rm-subtitle {
    font-size: 11px; font-weight: 600; letter-spacing: 2px;
    text-transform: uppercase; color: var(--theme-primary, #1B365D);
    margin-bottom: 20px; display: block;
  }

  .rm-unavailable-banner {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 14px 16px; border-radius: 8px; margin-bottom: 22px;
    border-left: 3px solid;
  }
  .rm-unavailable-banner-icon { font-size: 15px; margin-top: 1px; }
  .rm-unavailable-banner-title { font-weight: 600; font-size: 13px; margin-bottom: 3px; color: var(--theme-text-dark, #0F172A); }
  .rm-unavailable-banner-text { font-size: 12px; line-height: 1.5; color: #555; }

  .rm-features {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
    margin-bottom: 24px;
  }
  .rm-feature-item {
    background: var(--theme-surface-subtle, #F1F5F9); padding: 14px;
    display: flex; flex-direction: column; gap: 6px;
    border-radius: 10px; border: 1px solid var(--theme-border, #E2E8F0);
  }
  .rm-feature-icon {
    width: 30px; height: 30px; border-radius: 8px;
    background: var(--theme-primary-soft, rgba(27, 54, 93, 0.1)); display: flex; align-items: center; justify-content: center;
    color: var(--theme-primary, #1B365D); font-size: 13px;
  }
  .rm-feature-label { font-size: 10px; letter-spacing: 0.5px; text-transform: uppercase; color: #999; }
  .rm-feature-value { font-size: 13px; color: var(--theme-text-dark, #0F172A); font-weight: 600; }

  .rm-description {
    font-size: 14px; color: #666;
    line-height: 1.7; margin-bottom: 24px;
  }

  .rm-section-title {
    font-size: 10px; font-weight: 700; letter-spacing: 2.5px;
    text-transform: uppercase; color: var(--theme-primary, #1B365D);
    margin: 24px 0 14px 0; display: flex; align-items: center; gap: 12px;
  }
  .rm-section-title::after { content: ''; flex: 1; height: 1px; background: var(--theme-border, #E2E8F0); }

  .rm-gallery {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 8px;
  }
  .rm-gallery img {
    width: 100%; aspect-ratio: 4/3; object-fit: cover;
    border-radius: 8px; filter: brightness(0.9); transition: all 0.3s ease;
    border: 1px solid var(--theme-border, #E2E8F0);
  }
  .rm-gallery img:hover { filter: brightness(1); transform: scale(1.03); }

  .rm-amenities {
    display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;
  }
  .rm-amenity-item {
    display: flex; align-items: center; gap: 10px; padding: 10px 14px;
    background: var(--theme-surface-subtle, #F1F5F9); border: 1px solid var(--theme-border, #E2E8F0); border-radius: 8px;
    font-size: 13px; color: #444;
  }
  .rm-amenity-icon { color: var(--theme-primary, #1B365D); font-size: 12px; width: 16px; text-align: center; }

  .rm-rules {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
  }
  .rm-rule-item {
    background: var(--theme-surface-subtle, #F1F5F9); padding: 12px 14px; border-radius: 8px;
    border: 1px solid var(--theme-border, #E2E8F0);
  }
  .rm-rule-label { font-size: 9px; letter-spacing: 0.5px; text-transform: uppercase; color: var(--theme-primary, #1B365D); margin-bottom: 4px; font-weight: 600; }
  .rm-rule-value { font-size: 13px; color: var(--theme-text-dark, #0F172A); font-weight: 600; }

  .rm-footer {
    display: flex; justify-content: space-between; align-items: center;
    padding: 18px 32px; background: var(--theme-surface-subtle, #F1F5F9); height: 76px;
    border-top: 1px solid var(--theme-border, #E2E8F0); flex-shrink: 0;
  }
  .rm-footer-status { display: flex; align-items: center; gap: 8px; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; font-weight: 700; }
  .rm-footer-status-dot { width: 7px; height: 7px; border-radius: 50%; }
  .rm-footer-btns { display: flex; align-items: center; gap: 10px; }

  .rm-btn-close {
    font-size: 12px; font-weight: 500; letter-spacing: 0.5px;
    color: #888; background: transparent;
    border: 1px solid #ddd; padding: 9px 20px; border-radius: 50px;
    cursor: pointer; transition: all 0.2s;
  }
  .rm-btn-close:hover { color: #444; border-color: #aaa; }

  .rm-btn-book {
    font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
    color: #fff;
    background: var(--theme-primary-gradient, linear-gradient(135deg, var(--theme-primary, #1B365D), var(--theme-primary-hover, #122642)));
    border: none; padding: 10px 24px; border-radius: 50px;
    cursor: pointer; transition: all 0.2s; text-decoration: none; display: inline-block;
    box-shadow: 0 4px 15px var(--theme-primary-soft, rgba(27, 54, 93, 0.35));
  }
  .rm-btn-book:hover { transform: translateY(-1px); box-shadow: 0 6px 20px var(--theme-primary-soft, rgba(27, 54, 93, 0.5)); color: #fff; }

  .rm-btn-book-disabled {
    font-size: 11px; font-weight: 500; letter-spacing: 0.5px;
    padding: 9px 20px; border-radius: 50px; border: 1px solid;
    cursor: not-allowed; display: inline-flex; align-items: center; gap: 6px;
  }

  .rm-close-btn {
    position: absolute; top: 16px; right: 16px; z-index: 20;
    width: 34px; height: 34px; border-radius: 50%;
    background: rgba(255,255,255,0.9); border: 1px solid rgba(0,0,0,0.1);
    color: #333; font-size: 18px; display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.2s; backdrop-filter: blur(4px); line-height: 1;
    box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  }
  .rm-close-btn:hover { background: var(--theme-primary, #1B365D); color: #fff; border-color: var(--theme-primary, #1B365D); }

  @keyframes rm-fade-in { from { opacity: 0 } to { opacity: 1 } }
  @keyframes rm-slide-up {
    from { opacity: 0; transform: translate(-50%, -47%) scale(0.97) }
    to   { opacity: 1; transform: translate(-50%, -50%) scale(1) }
  }
  @keyframes rm-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

  @media (max-width: 868px) {
    .rm-modal { height: 90vh; width: 94vw; }
    .rm-modal-container { flex-direction: column; overflow-y: auto; height: calc(100% - 70px); }
    .rm-modal-sidebar { width: 100%; height: 240px; flex-shrink: 0; }
    .rm-modal-inner { width: 100%; padding: 24px; overflow-y: visible; }
    .rm-title { font-size: 26px; }
    .rm-features { grid-template-columns: 1fr; gap: 8px; }
    .rm-amenities { grid-template-columns: 1fr; }
    .rm-rules { grid-template-columns: 1fr; gap: 6px; }
    .rm-footer { padding: 14px 24px; height: auto; flex-direction: column; gap: 12px; align-items: flex-start; }
    .rm-footer-btns { width: 100%; justify-content: flex-end; }
  }

  /* ─── FILTER BAR ─── */
  .rooms-filter-bar {
    background: #fff;
    border: 1px solid var(--theme-border, #E2E8F0);
    border-radius: 14px;
    padding: 16px 20px;
    margin-bottom: 32px;
    box-shadow: 0 2px 12px var(--theme-primary-soft, rgba(27, 54, 93, 0.08));
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
  }

  .rooms-search-wrap {
    position: relative;
    flex: 1;
    min-width: 200px;
  }
  .rooms-search-wrap i {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--theme-primary, #1B365D);
    font-size: 13px;
  }
  .rooms-search-input {
    width: 100%;
    padding: 10px 14px 10px 36px;
    border: 1px solid var(--theme-border, #E2E8F0);
    border-radius: 50px;
    font-size: 13px;
    color: #333;
    background: var(--theme-surface-subtle, #F1F5F9);
    outline: none;
    transition: border 0.2s, box-shadow 0.2s;
  }
  .rooms-search-input:focus {
    border-color: var(--theme-primary, #1B365D);
    box-shadow: 0 0 0 3px var(--theme-primary-soft, rgba(27, 54, 93, 0.12));
    background: #fff;
  }
  .rooms-search-input::placeholder { color: #bbb; }

  .rooms-select-wrap {
    position: relative;
    min-width: 160px;
  }
  .rooms-select-wrap i {
    position: absolute;
    left: 13px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--theme-primary, #1B365D);
    font-size: 12px;
    pointer-events: none;
    z-index: 1;
  }
  .rooms-select {
    appearance: none;
    width: 100%;
    padding: 10px 32px 10px 34px;
    border: 1px solid var(--theme-border, #E2E8F0);
    border-radius: 50px;
    font-size: 13px;
    color: #333;
    background: var(--theme-surface-subtle, #F1F5F9);
    outline: none;
    cursor: pointer;
    transition: border 0.2s, box-shadow 0.2s;
  }
  .rooms-select:focus {
    border-color: var(--theme-primary, #1B365D);
    box-shadow: 0 0 0 3px var(--theme-primary-soft, rgba(27, 54, 93, 0.12));
    background: #fff;
  }
  .rooms-select-arrow {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #aaa;
    font-size: 10px;
    pointer-events: none;
  }

  .rooms-filter-count {
    font-size: 12px;
    color: #999;
    white-space: nowrap;
    padding: 0 4px;
  }
  .rooms-filter-count span {
    font-weight: 700;
    color: var(--theme-primary, #1B365D);
  }
`;

// ─── MODAL COMPONENT ─────────────────────────────────────────────────────────
const RoomModal = ({ room, onClose, bookingQuery = "" }) => {
  if (!room) return null;
  const unavailable = roomIsBlocked(room);
  const statusInfo = roomStatusInfo(room);
  const dateBlocked =
    (room.dateConflict === true || room.availableForDates === false) &&
    !isRoomBookingBlocked(room.status);
  const hotelName =
    room.hotelId && typeof room.hotelId === "object" ? room.hotelId.name : null;

  return (
    <>
      <style>{MODAL_STYLES}</style>
      <div className="rm-backdrop" onClick={onClose} />
      <div className="rm-modal" role="dialog" aria-modal="true">
        <button className="rm-close-btn" onClick={onClose} aria-label="Close">
          ×
        </button>

        <div className="rm-modal-container">
          {/* LEFT SIDEBAR */}
          <div className="rm-modal-sidebar">
            <img
              src={getImageUrl(room.images?.[0])}
              alt={room.title}
              className={unavailable ? "rm-unavailable-img" : ""}
            />
            <div className="rm-sidebar-overlay" />

            {unavailable && statusInfo && (
              <div
                className="rm-status-ribbon"
                style={{
                  background: statusInfo.bg,
                  border: `1px solid ${statusInfo.border}`,
                  color: statusInfo.color,
                }}
              >
                <div
                  className="rm-status-dot"
                  style={{ background: statusInfo.color }}
                />
                {statusInfo.text}
              </div>
            )}

            <div className="rm-sidebar-details">
              <div className="rm-tag">
                {room.type
                  ? room.type.toUpperCase() + " ROOM"
                  : room.tag || "ROOM"}
              </div>
              <h2 className="rm-title">Room {room.roomNumber}</h2>
              <div className="rm-price-badge">
                <span className="rm-price-amount">Rs {room.price}</span>
                <span className="rm-price-night">/ night</span>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="rm-modal-inner">
            {room.subtitle && (
              <span className="rm-subtitle">{room.subtitle}</span>
            )}

            {unavailable && statusInfo && (
              <div
                className="rm-unavailable-banner"
                style={{
                  borderLeftColor: statusInfo.color,
                  background: statusInfo.bg,
                }}
              >
                <div
                  className="rm-unavailable-banner-icon"
                  style={{ color: statusInfo.color }}
                >
                  <i className="fa-solid fa-circle-exclamation"></i>
                </div>
                <div>
                  <div className="rm-unavailable-banner-title">
                    {dateBlocked ? "Reserved for Selected Dates" : "Space Temporarily Locked"}
                  </div>
                  <div className="rm-unavailable-banner-text">
                    {dateBlocked ? (
                      <>
                        Another guest already holds this room for your stay
                        dates. Pick different dates or another room
                        {hotelName ? ` at ${hotelName}` : ""}.
                      </>
                    ) : (
                      <>
                        This room is currently marked as{" "}
                        <strong>{statusInfo.text}</strong>. Reservations will open
                        shortly.
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
            {hotelName && (
              <p className="text-muted small mb-3">
                <i className="fa-solid fa-hotel me-1" style={{ color: "var(--theme-primary, #1B365D)" }}></i>
                {hotelName}
                {room.hotelId?.city ? ` · ${room.hotelId.city}` : ""}
              </p>
            )}

          <div className="rm-features">
  {room.roomNumber && (
    <div className="rm-feature-item">
      <div className="rm-feature-icon"><i className="fa-solid fa-door-open"></i></div>
      <div>
        <div className="rm-feature-label">Room No</div>
        <div className="rm-feature-value">Room {room.roomNumber}</div>
      </div>
    </div>
  )}
  {room.type && (
    <div className="rm-feature-item">
      <div className="rm-feature-icon"><i className="fa-solid fa-bed"></i></div>
      <div>
        <div className="rm-feature-label">Room Type</div>
        <div className="rm-feature-value" style={{textTransform:'capitalize'}}>{room.type} Room</div>
      </div>
    </div>
  )}
  {room.floor && (
    <div className="rm-feature-item">
      <div className="rm-feature-icon"><i className="fa-solid fa-building"></i></div>
      <div>
        <div className="rm-feature-label">Floor</div>
        <div className="rm-feature-value" style={{textTransform:'capitalize'}}>{room.floor} Floor</div>
      </div>
    </div>
  )}
  {room.capacity && (
    <div className="rm-feature-item">
      <div className="rm-feature-icon"><i className="fa-solid fa-users"></i></div>
      <div>
        <div className="rm-feature-label">Capacity</div>
        <div className="rm-feature-value">{room.capacity} Guests</div>
      </div>
    </div>
  )}
  {room.price && (
    <div className="rm-feature-item">
      <div className="rm-feature-icon"><i className="fa-solid fa-tag"></i></div>
      <div>
        <div className="rm-feature-label">Price</div>
        <div className="rm-feature-value">Rs {room.price?.toLocaleString()}/night</div>
      </div>
    </div>
  )}
  {room.status && (
    <div className="rm-feature-item">
      <div className="rm-feature-icon"><i className="fa-solid fa-circle-check"></i></div>
      <div>
        <div className="rm-feature-label">Status</div>
        <div className="rm-feature-value" style={{
          textTransform:'capitalize',
          color: room.status === 'available' ? '#27ae60' : '#CC5B55'
        }}>{room.status}</div>
      </div>
    </div>
  )}
</div>

            {room.description && (
              <p className="rm-description">{room.description}</p>
            )}

            {room.amenities?.length > 0 && (
              <>
                <div className="rm-section-title">Included Amenities</div>
                <div className="rm-amenities">
                  {room.amenities.map((item, i) => (
                    <div key={i} className="rm-amenity-item">
                      <i
                        className={`fa-solid ${getAmenityIcon(item)} rm-amenity-icon`}
                      ></i>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* <div className="rm-section-title">Policies & Timeline</div>
            <div className="rm-rules">
              <div className="rm-rule-item">
                <div className="rm-rule-label">Check-in</div>
                <div className="rm-rule-value">
                  {room.checkIn || "14:00 PM"}
                </div>
              </div>
              <div className="rm-rule-item">
                <div className="rm-rule-label">Check-out</div>
                <div className="rm-rule-value">
                  {room.checkOut || "12:00 PM"}
                </div>
              </div>
              <div className="rm-rule-item">
                <div className="rm-rule-label">Pets</div>
                <div className="rm-rule-value">
                  {room.pets || "Not Allowed"}
                </div>
              </div>
            </div> */}

            {room.images?.length > 1 && (
              <>
                <div className="rm-section-title">Interior Gallery</div>
                <div className="rm-gallery">
                  {room.images.slice(1).map((img, i) => (
                    <img
                      key={i}
                      src={getImageUrl(img)}
                      alt={`${room.title} view ${i + 2}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="rm-footer">
          <div className="rm-footer-status">
            <div
              className="rm-footer-status-dot"
              style={{
                background: unavailable
                  ? statusInfo?.color || "#CC5B55"
                  : "#27ae60",
              }}
            />
            <span
              style={{
                color: unavailable ? statusInfo?.color || "#CC5B55" : "#27ae60",
              }}
            >
              {unavailable
                ? statusInfo?.text || "Unavailable"
                : "Ready to Reserve"}
            </span>
          </div>
          <div className="rm-footer-btns">
            <button className="rm-btn-close" onClick={onClose}>
              Close
            </button>
            {unavailable ? (
              <span
                className="rm-btn-book-disabled"
                style={{
                  color: statusInfo?.color || "#CC5B55",
                  borderColor: statusInfo?.border || "rgba(231,76,60,0.3)",
                  background: statusInfo?.bg || "rgba(231,76,60,0.05)",
                }}
              >
                <i
                  className="fa-solid fa-lock"
                  style={{ fontSize: "10px" }}
                ></i>{" "}
                {statusInfo?.text || "Unavailable"}
              </span>
            ) : (
              <Link to={`/booking/${room._id}${bookingQuery || ""}`} className="rm-btn-book">
                Book Suite →
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const RoomsList = () => {
  const [searchParams] = useSearchParams();
  const guestsNeeded = Number(searchParams.get("guests")) || 0;
  const typeParam = (searchParams.get("type") || "").toLowerCase();
  const hotelId = searchParams.get("hotelId") || "";
  const city = searchParams.get("city") || "";
  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const bookingSuffix = (() => {
    const q = new URLSearchParams();
    ["checkIn", "checkOut", "guests", "rooms", "promo"].forEach((key) => {
      const v = searchParams.get(key);
      if (v) q.set(key, v);
    });
    const s = q.toString();
    return s ? `?${s}` : "";
  })();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(typeParam || "all");
  const [priceRange, setPriceRange] = useState("all");

  useEffect(() => {
    fetchRooms();
  }, [hotelId, city, checkIn, checkOut, guestsNeeded]);

  useEffect(() => {
    if (typeParam) setCategory(typeParam);
  }, [typeParam]);

  const filterRooms = rooms.filter((room) => {
    const text = search.toLowerCase();
    const hotelLabel =
      room.hotelId && typeof room.hotelId === "object"
        ? `${room.hotelId.name || ""} ${room.hotelId.city || ""}`
        : "";
    const matchSearch =
      room.title?.toLowerCase().includes(text) ||
      room.description?.toLowerCase().includes(text) ||
      room.type?.toLowerCase().includes(text) ||
      room.roomNumber?.toLowerCase().includes(text) ||
      hotelLabel.toLowerCase().includes(text);
    const matchCategory =
      category === "all" || room.type?.toLowerCase() === category.toLowerCase()
      || (category === "suite" && String(room.type || "").toLowerCase().includes("suite"));
    let matchPrice = true;
    if (priceRange === "low")  matchPrice = room.price <= 5000;
    if (priceRange === "mid")  matchPrice = room.price > 5000 && room.price <= 10000;
    if (priceRange === "high") matchPrice = room.price > 10000;
    const matchCapacity =
      !guestsNeeded || Number(room.capacity || 0) >= guestsNeeded;
    return matchSearch && matchCategory && matchPrice && matchCapacity;
  });

  const fetchRooms = async () => {
    try {
      setPageLoading(true);
      const data = await getRooms({
        hotelId: hotelId || undefined,
        city: city || undefined,
        checkIn: checkIn || undefined,
        checkOut: checkOut || undefined,
        guests: guestsNeeded || undefined,
      });
      setRooms(Array.isArray(data) ? data : data.rooms || []);
    } catch (error) {
      console.log("Rooms fetch error:", error);
    } finally {
      setPageLoading(false);
    }
  };

  const handleDetailsClick = async (e, roomId) => {
    e.preventDefault();
    setLoading(roomId);
    try {
      const data = await getSingleRoom(roomId, {
        checkIn: checkIn || undefined,
        checkOut: checkOut || undefined,
      });
      const room = data.room || data;
      // Prefer list annotation if single-room API has no date fields yet
      const listed = rooms.find((r) => String(r._id) === String(roomId));
      setSelectedRoom(
        listed
          ? {
              ...room,
              availableForDates: listed.availableForDates,
              dateConflict: listed.dateConflict,
              hotelId: room.hotelId || listed.hotelId,
            }
          : room
      );
    } catch (error) {
      console.log("Room fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => setSelectedRoom(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = selectedRoom ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedRoom]);

  if (pageLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary"></div>
        <p className="mt-3 text-muted">Loading Rooms...</p>
      </div>
    );
  }

  if (!pageLoading && !rooms.length) {
    return (
      <div className="text-center py-5">
        <p className="text-muted">No rooms available at the moment.</p>
      </div>
    );
  }

  return (
    <>
      <style>{MODAL_STYLES}</style>

      <section className="section">
        <div className="container">
          {/* ===== FILTER BAR ===== */}
          <div className="rooms-filter-bar">
            {/* SEARCH */}
            <div className="rooms-search-wrap">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input
                type="text"
                className="rooms-search-input"
                placeholder="Search rooms by name or type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* CATEGORY */}
            <div className="rooms-select-wrap">
              <i className="fa-solid fa-layer-group"></i>
              <select
                className="rooms-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="single">Single</option>
                <option value="double">Double</option>
                <option value="deluxe">Deluxe</option>
                <option value="suite">Suite</option>
              </select>
              <i className="fa-solid fa-chevron-down rooms-select-arrow"></i>
            </div>

            {/* PRICE */}
            <div className="rooms-select-wrap">
              <i className="fa-solid fa-tag"></i>
              <select
                className="rooms-select"
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
              >
               <option value="all">All Prices</option>
<option value="low">Up to Rs 5,000</option>
<option value="mid">Rs 5,001 – 10,000</option>
<option value="high">Above Rs 10,000</option>
              </select>
              <i className="fa-solid fa-chevron-down rooms-select-arrow"></i>
            </div>

            {/* COUNT */}
            <div className="rooms-filter-count">
              <span>{filterRooms.length}</span> room
              {filterRooms.length !== 1 ? "s" : ""} found
              {hotelId ? " · this property" : ""}
              {checkIn && checkOut ? " · dates applied" : ""}
            </div>
          </div>

          {/* ===== ROOM CARDS ===== */}
          <div className="room-items-wrap">
            {filterRooms.map((room, index) => {
              const isEven = index % 2 === 0;
              const isLoadingThis = loading === room._id;
              const unavailable = roomIsBlocked(room);
              const statusInfo = roomStatusInfo(room);
              const floorInfo = getFloorLabel(room.floor);
              const hotelName =
                room.hotelId && typeof room.hotelId === "object"
                  ? room.hotelId.name
                  : null;

              return (
                <div
                  key={room._id}
                  className="room-item bg-white rounded-5 mb-5"
                >
                  <div className="row g-0">
                    {/* IMAGE */}
                    <div className={`col-lg-6 ${isEven ? "" : "order-lg-2"}`}>
                      <div
                        className="room-item-img rounded-5 position-relative"
                        style={{ cursor: "pointer" }}
                      >
                        <a
                          href="#"
                          onClick={(e) => handleDetailsClick(e, room._id)}
                        >
                          <img
                            className="img-fluid d-block w-100"
                            src={getImageUrl(room.images?.[0])}
                            alt={room.title}
                            style={
                              unavailable
                                ? { filter: "grayscale(40%) brightness(0.85)" }
                                : {}
                            }
                          />
                        </a>

                        {/* ✅ FLOOR BADGE */}
                        {room.floor && (
                          <div
                            className="position-absolute bottom-0 start-0 ms-4 mb-4 px-3 py-1 rounded-pill d-flex align-items-center gap-2"
                            style={{
                              background: "rgba(255,255,255,0.92)",
                              backdropFilter: "blur(6px)",
                              fontSize: "11px",
                              fontWeight: 600,
                              color: "var(--theme-text-dark, #0F172A)",
                              border: "1px solid rgba(255,255,255,0.6)",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            }}
                          >
                            <i
                              className={`fa-solid ${floorInfo.icon}`}
                              style={{ color: "var(--theme-primary, #1B365D)", fontSize: "10px" }}
                            ></i>
                            {floorInfo.label}
                          </div>
                        )}

                        {/* STATUS / TAG BADGE */}
                        {!unavailable && room.tag && (
                          <div className="position-absolute top-0 start-0 ms-4 mt-4 px-3 py-1 text-3 fw-500 text-bg-primary rounded-pill">
                            {room.tag}
                          </div>
                        )}
                        {unavailable && statusInfo && (
                          <div
                            className="position-absolute top-0 start-0 ms-4 mt-4 px-3 py-1 rounded-pill d-flex align-items-center gap-2"
                            style={{
                              background: statusInfo.bg,
                              border: `1px solid ${statusInfo.border}`,
                              color: statusInfo.color,
                              backdropFilter: "blur(4px)",
                              fontSize: "11px",
                              fontWeight: 500,
                            }}
                          >
                            <i
                              className="fa-solid fa-circle-exclamation"
                              style={{ fontSize: "10px" }}
                            ></i>
                            {statusInfo.text}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* CONTENT */}
                    <div className="col-lg-6 align-content-center">
                      <div className="p-4 m-2">
                       <div className="d-flex align-items-center gap-2 mb-2">
  <span className="d-inline-flex align-items-center gap-1 text-2 fw-500 rounded-pill border border-dark border-opacity-10 px-3 py-1">
    <i className="fa-solid fa-door-open text-primary" style={{ fontSize: 11 }}></i>
    Room {room.roomNumber}
  </span>
  {room.type && (
    <span style={{
      color: 'var(--theme-primary, #1B365D)', fontSize: 10, fontWeight: 700,
      letterSpacing: 1.5, padding: '3px 12px', borderRadius: 20,
      textTransform: 'uppercase', border: '1px solid var(--theme-primary-soft, rgba(27, 54, 93, 0.40))'
    }}>
      {room.type} Room
    </span>
  )}
</div>
                        {hotelName && (
                          <p className="text-2 mb-2" style={{ color: "var(--theme-primary, #1B365D)", fontWeight: 600 }}>
                            <i className="fa-solid fa-hotel me-1"></i>
                            {hotelName}
                            {room.hotelId?.city ? ` · ${room.hotelId.city}` : ""}
                          </p>
                        )}
                        <p className="text-3 text-body-secondary">
                          {room.description}
                        </p>

                        <div className="row g-2 text-3 text-body-secondary mb-3">
                          {room.bedType && (
                            <div className="col-6 col-xl-4 d-flex align-items-center">
                              <span className="text-primary text-5 me-2">
                                <i className="fa-solid fa-bed"></i>
                              </span>
                              {room.bedType}
                            </div>
                          )}
                          {room.persons && (
                            <div className="col-6 col-xl-4 d-flex align-items-center">
                              <span className="text-primary text-5 me-2">
                                <i className="fa-solid fa-users"></i>
                              </span>
                              {room.persons}
                            </div>
                          )}
                          {room.area && (
                            <div className="col-6 col-xl-4 d-flex align-items-center">
                              <span className="text-primary text-5 me-2">
                                <i className="fa-solid fa-expand"></i>
                              </span>
                              {room.area}
                            </div>
                          )}

                          {/* ✅ FLOOR IN CARD */}
                          {room.floor && (
                            <div className="col-6 col-xl-4 d-flex align-items-center">
                              <span className="text-primary text-5 me-2">
                                <i className="fa-solid fa-building"></i>
                              </span>
                              {getFloorLabel(room.floor).label}
                            </div>
                          )}

                          {room.amenities?.slice(0, 2).map((item, i) => (
                            <div
                              key={i}
                              className="col-6 col-xl-4 d-flex align-items-center"
                            >
                              <span className="text-primary text-5 me-2">
                                <i
                                  className={`fa-solid ${getAmenityIcon(item)}`}
                                ></i>
                              </span>
                              {item}
                            </div>
                          ))}
                        </div>

                        <hr className="opacity-1" />

                        <div className="d-flex align-items-center justify-content-between w-100">
                          <div className="text-7 fw-600 d-flex align-items-center gap-1">
                            Rs {room.price}
                            <span className="text-3 fw-500 text-body-tertiary text-uppercase">
                              / Per Night
                            </span>
                          </div>
                          <button
                            className="btn btn-new btn-primary rounded-pill"
                            onClick={(e) => handleDetailsClick(e, room._id)}
                            disabled={!!loading}
                          >
                            <span className="btn-text">
                              <span>
                                {isLoadingThis ? "Loading..." : "Details"}
                              </span>
                            </span>
                            <span className="btn-icon">
                              <i
                                className={`fa-solid ${isLoadingThis ? "fa-spinner fa-spin" : "fa-arrow-right"}`}
                              ></i>
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {selectedRoom && (
        <RoomModal
          room={selectedRoom}
          onClose={closeModal}
          bookingQuery={bookingSuffix}
        />
      )}
    </>
  );
};

export default RoomsList;
