import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../Context/AuthContext";
import ConfirmModal from "./ConfirmModal";
import FeedbackModal from "./FeedbackModal";
import { apiCall } from "./apiHelper";
import axios from "axios";

const BASE_URL = (process.env.REACT_APP_API_URL || "http://localhost:5001/api");

const PROFILE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Jost:wght@300;400;500;600;700&display=swap');

  .profile-page {
    min-height: 80vh;
    background: var(--theme-bg-primary, #F8FAFC);
    padding: 48px 0;
    font-family: 'Jost', sans-serif;
  }

  .profile-page-title {
    font-family: 'Playfair Display', serif;
    font-size: 42px;
    font-weight: 500;
    color: var(--theme-text-dark, #0F172A);
    margin-bottom: 4px;
  }

  .profile-page-title span {
    color: var(--theme-primary, #1B365D);
  }

  .profile-page-sub {
    font-size: 13px;
    color: #999;
    letter-spacing: 0.5px;
  }

  .profile-user-card {
    background: #fff;
    border-radius: 20px;
    border: 1px solid var(--theme-border, #E2E8F0);
    overflow: hidden;
    box-shadow: 0 4px 24px rgba(0,0,0,0.06);
  }

  .profile-card-header {
    background: linear-gradient(135deg, var(--theme-sidebar, #0F172A) 0%, var(--theme-primary, #1B365D) 100%);
    padding: 32px 24px 28px;
    text-align: center;
    position: relative;
  }

  .profile-avatar {
    width: 76px;
    height: 76px;
    background: var(--theme-primary-gradient, linear-gradient(135deg, var(--theme-primary, #1B365D), var(--theme-primary-hover, #122642)));
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30px;
    font-weight: 700;
    color: #fff;
    margin: 0 auto 14px;
    border: 3px solid var(--theme-primary-soft, rgba(27, 54, 93, 0.30));
    box-shadow: 0 4px 16px rgba(0,0,0,0.3);
  }

  .profile-card-name {
    font-size: 18px;
    font-weight: 700;
    color: #fff;
    margin-bottom: 4px;
  }

  .profile-card-email {
    font-size: 12px;
    color: rgba(255,255,255,0.5);
    margin-bottom: 14px;
  }

  .profile-member-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--theme-primary-soft, rgba(27, 54, 93, 0.15));
    border: 1px solid var(--theme-primary-soft, rgba(27, 54, 93, 0.35));
    color: var(--theme-primary, #1B365D);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    padding: 5px 14px;
    border-radius: 20px;
  }

  .profile-card-body {
    padding: 24px;
  }

  .profile-info-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    background: var(--theme-surface-subtle, #F1F5F9);
    border: 1px solid var(--theme-border, #E2E8F0);
    border-radius: 10px;
    margin-bottom: 10px;
  }

  .profile-info-icon {
    width: 34px;
    height: 34px;
    background: var(--theme-primary-soft, rgba(27, 54, 93, 0.1));
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--theme-primary, #1B365D);
    font-size: 13px;
    flex-shrink: 0;
  }

  .profile-info-label {
    font-size: 10px;
    color: #aaa;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
    margin-bottom: 2px;
  }

  .profile-info-value {
    font-size: 14px;
    color: var(--theme-text-dark, #0F172A);
    font-weight: 600;
  }

  .profile-edit-btn {
    width: 100%;
    background: var(--theme-primary-gradient, linear-gradient(135deg, var(--theme-primary, #1B365D), var(--theme-primary-hover, #122642))) !important;
    color: #fff !important;
    border: none !important;
    border-radius: 50px !important;
    padding: 11px !important;
    font-size: 13px !important;
    font-weight: 600 !important;
    letter-spacing: 0.5px;
    margin-top: 6px;
    transition: all 0.2s !important;
    box-shadow: 0 4px 14px var(--theme-primary-soft, rgba(27, 54, 93, 0.30));
  }

  .profile-edit-btn:hover {
    box-shadow: 0 6px 20px var(--theme-primary-soft, rgba(27, 54, 93, 0.45)) !important;
    transform: translateY(-1px);
  }

  .profile-form-input {
    width: 100%;
    padding: 10px 16px;
    border: 1px solid var(--theme-border, #E2E8F0);
    border-radius: 50px;
    font-size: 13px;
    color: var(--theme-text-dark, #0F172A);
    background: var(--theme-surface-subtle, #F1F5F9);
    outline: none;
    transition: border 0.2s, box-shadow 0.2s;
    font-family: 'Jost', sans-serif;
  }

  .profile-form-input:focus {
    border-color: var(--theme-primary, #1B365D);
    box-shadow: 0 0 0 3px var(--theme-primary-soft, rgba(27, 54, 93, 0.12));
    background: #fff;
  }

  .profile-form-input:disabled {
    background: var(--theme-bg-primary, #F8FAFC);
    color: #bbb;
    cursor: not-allowed;
  }

  .profile-form-label {
    font-size: 11px;
    font-weight: 600;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 6px;
    display: block;
  }

  .profile-save-btn {
    flex: 1;
    background: var(--theme-primary-gradient, linear-gradient(135deg, var(--theme-primary, #1B365D), var(--theme-primary-hover, #122642))) !important;
    color: #fff !important;
    border: none !important;
    border-radius: 50px !important;
    padding: 10px !important;
    font-size: 13px !important;
    font-weight: 600 !important;
    transition: all 0.2s !important;
  }

  .profile-cancel-btn {
    flex: 1;
    background: transparent !important;
    color: #888 !important;
    border: 1px solid #ddd !important;
    border-radius: 50px !important;
    padding: 10px !important;
    font-size: 13px !important;
    font-weight: 500 !important;
    transition: all 0.2s !important;
  }

  .profile-cancel-btn:hover {
    border-color: #aaa !important;
    color: #444 !important;
  }

  .profile-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-top: 20px;
  }

  .profile-stat-item {
    background: var(--theme-surface-subtle, #F1F5F9);
    border: 1px solid var(--theme-border, #E2E8F0);
    border-radius: 12px;
    padding: 14px 10px;
    text-align: center;
  }

  .profile-stat-num {
    font-size: 22px;
    font-weight: 700;
    line-height: 1;
    margin-bottom: 4px;
  }

  .profile-stat-label {
    font-size: 10px;
    color: #aaa;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
  }

  .profile-bookings-card {
    background: #fff;
    border-radius: 20px;
    border: 1px solid var(--theme-border, #E2E8F0);
    overflow: hidden;
    box-shadow: 0 4px 24px rgba(0,0,0,0.06);
  }

  .profile-bookings-header {
    padding: 24px 28px 0;
  }

  .profile-bookings-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--theme-text-dark, #0F172A);
    margin-bottom: 16px;
  }

  .profile-tabs {
    display: flex;
    gap: 6px;
    border-bottom: 1px solid var(--theme-border, #E2E8F0);
    padding-bottom: 0;
    margin-bottom: 0;
  }

  .profile-tab-btn {
    background: transparent;
    border: none;
    padding: 10px 18px;
    font-size: 13px;
    font-weight: 500;
    color: #999;
    cursor: pointer;
    position: relative;
    transition: color 0.2s;
    font-family: 'Jost', sans-serif;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
  }

  .profile-tab-btn:hover { color: var(--theme-primary, #1B365D); }

  .profile-tab-btn.active {
    color: var(--theme-primary, #1B365D);
    font-weight: 700;
    border-bottom-color: var(--theme-primary, #1B365D);
  }

  .profile-tab-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    background: var(--theme-border, #E2E8F0);
    color: var(--theme-primary, #1B365D);
    border-radius: 50%;
    font-size: 10px;
    font-weight: 700;
    margin-left: 5px;
  }

  .profile-tab-btn.active .profile-tab-count {
    background: var(--theme-primary-soft, rgba(27, 54, 93, 0.15));
  }

  .profile-bookings-body {
    padding: 20px 28px 28px;
    max-height: 580px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--theme-primary-soft, rgba(27, 54, 93, 0.5)) transparent;
  }

  .profile-bookings-body::-webkit-scrollbar { width: 6px; }
  .profile-bookings-body::-webkit-scrollbar-track { background: transparent; }
  .profile-bookings-body::-webkit-scrollbar-thumb { background: var(--theme-primary-soft, rgba(27, 54, 93, 0.5)); border-radius: 10px; }
  .profile-bookings-body::-webkit-scrollbar-thumb:hover { background: var(--theme-primary-soft, rgba(27, 54, 93, 0.85)); }

  .booking-card {
    border: 1px solid var(--theme-border, #E2E8F0);
    border-radius: 14px;
    overflow: hidden;
    background: #fff;
    margin-bottom: 14px;
    transition: box-shadow 0.2s;
  }

  .booking-card:hover {
    box-shadow: 0 4px 18px rgba(0,0,0,0.07);
  }

  .booking-card:last-child { margin-bottom: 0; }

  .booking-card-inner {
    display: flex;
  }

  .booking-img-wrap {
    width: 130px;
    min-height: 130px;
    flex-shrink: 0;
    overflow: hidden;
    position: relative;
  }

  .booking-img-wrap img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    min-height: 130px;
  }

  .booking-img-fallback {
    width: 100%;
    min-height: 130px;
    background: var(--theme-bg-primary, #F8FAFC);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .booking-details {
    padding: 14px 16px;
    flex: 1;
  }

  .booking-room-name {
    font-size: 15px;
    font-weight: 700;
    color: var(--theme-text-dark, #0F172A);
    margin-bottom: 2px;
  }

  .booking-id {
    font-size: 11px;
    color: #bbb;
    margin-bottom: 12px;
  }

  .booking-meta-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin-bottom: 10px;
  }

  .booking-meta-item {}
  .booking-meta-label {
    font-size: 10px;
    color: #bbb;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    font-weight: 600;
    margin-bottom: 2px;
  }
  .booking-meta-value {
    font-size: 12px;
    font-weight: 600;
    color: #333;
  }

  .booking-badges {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    align-items: center;
  }

  .booking-status-badge {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    padding: 4px 12px;
    border-radius: 20px;
  }

  .booking-pay-badge {
    font-size: 10px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 20px;
  }

  .booking-method-badge {
    font-size: 10px;
    font-weight: 500;
    padding: 4px 10px;
    border-radius: 20px;
    background: var(--theme-bg-primary, #F8FAFC);
    color: #888;
  }

  .booking-special-req {
    margin-top: 8px;
    padding: 8px 12px;
    background: var(--theme-surface-subtle, #F1F5F9);
    border: 1px solid var(--theme-border, #E2E8F0);
    border-radius: 8px;
    font-size: 12px;
    color: #888;
  }

  .profile-empty {
    text-align: center;
    padding: 48px 24px;
  }

  .profile-empty-icon {
    width: 64px;
    height: 64px;
    background: var(--theme-surface-subtle, #F1F5F9);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
    font-size: 24px;
    color: var(--theme-primary, #1B365D);
  }

  /* ── ORDER NOW BUTTON ── */
  .order-now-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: linear-gradient(135deg, var(--theme-sidebar, #0F172A) 0%, var(--theme-primary, #1B365D) 100%);
    color: var(--theme-primary, #1B365D) !important;
    border: 1px solid var(--theme-primary-soft, rgba(27, 54, 93, 0.35)) !important;
    border-radius: 50px !important;
    padding: 6px 16px !important;
    font-size: 11px !important;
    font-weight: 700 !important;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.22s !important;
    box-shadow: 0 3px 10px rgba(0,0,0,0.15);
  }

  .order-now-btn:hover {
    background: var(--theme-primary-gradient, linear-gradient(135deg, var(--theme-primary, #1B365D), var(--theme-primary-hover, #122642))) !important;
    color: #fff !important;
    border-color: transparent !important;
    box-shadow: 0 5px 16px var(--theme-primary-soft, rgba(27, 54, 93, 0.40)) !important;
    transform: translateY(-1px);
  }

  /* ── ORDER MODAL OVERLAY ── */
  .order-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15,10,6,0.72);
    backdrop-filter: blur(6px);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    animation: overlayFadeIn 0.2s ease;
  }

  @keyframes overlayFadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .order-modal {
    background: #fff;
    border-radius: 24px;
    width: 100%;
    max-width: 680px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 24px 80px rgba(0,0,0,0.35);
    animation: modalSlideUp 0.28s cubic-bezier(0.34,1.56,0.64,1);
  }

  @keyframes modalSlideUp {
    from { transform: translateY(40px) scale(0.97); opacity: 0; }
    to   { transform: translateY(0) scale(1);       opacity: 1; }
  }

  /* Modal Header */
  .order-modal-header {
    background: linear-gradient(135deg, var(--theme-sidebar, #0F172A) 0%, var(--theme-primary, #1B365D) 100%);
    padding: 22px 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
  }

  .order-modal-header-left h3 {
    font-family: 'Playfair Display', serif;
    font-size: 26px;
    font-weight: 500;
    color: #fff;
    margin: 0 0 2px;
  }

  .order-modal-header-left p {
    font-size: 12px;
    color: rgba(255,255,255,0.45);
    margin: 0;
  }

  .order-modal-close {
    width: 36px;
    height: 36px;
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255,255,255,0.6);
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
  }

  .order-modal-close:hover {
    background: var(--theme-primary-soft, rgba(27, 54, 93, 0.2));
    border-color: var(--theme-primary-soft, rgba(27, 54, 93, 0.40));
    color: var(--theme-primary, #1B365D);
  }

  /* Category Filter Chips */
  .order-category-bar {
    padding: 14px 28px;
    display: flex;
    gap: 8px;
    overflow-x: auto;
    flex-shrink: 0;
    border-bottom: 1px solid var(--theme-border, #E2E8F0);
    scrollbar-width: none;
  }
  .order-category-bar::-webkit-scrollbar { display: none; }

  .order-cat-chip {
    white-space: nowrap;
    padding: 6px 16px;
    border-radius: 50px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.4px;
    cursor: pointer;
    border: 1px solid var(--theme-border, #E2E8F0);
    background: var(--theme-surface-subtle, #F1F5F9);
    color: #888;
    transition: all 0.18s;
    font-family: 'Jost', sans-serif;
  }

  .order-cat-chip:hover {
    border-color: var(--theme-primary, #1B365D);
    color: var(--theme-primary, #1B365D);
  }

  .order-cat-chip.active {
    background: var(--theme-primary-gradient, linear-gradient(135deg, var(--theme-primary, #1B365D), var(--theme-primary-hover, #122642)));
    border-color: transparent;
    color: #fff;
    box-shadow: 0 3px 10px var(--theme-primary-soft, rgba(27, 54, 93, 0.30));
  }

  /* Menu Scroll Area */
  .order-menu-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 20px 28px;
    scrollbar-width: thin;
    scrollbar-color: var(--theme-primary-soft, rgba(27, 54, 93, 0.5)) transparent;
  }

  .order-menu-scroll::-webkit-scrollbar { width: 6px; }
  .order-menu-scroll::-webkit-scrollbar-track { background: transparent; }
  .order-menu-scroll::-webkit-scrollbar-thumb { background: var(--theme-primary-soft, rgba(27, 54, 93, 0.5)); border-radius: 10px; }
  .order-menu-scroll::-webkit-scrollbar-thumb:hover { background: var(--theme-primary-soft, rgba(27, 54, 93, 0.85)); }

  .order-section-title {
    font-size: 11px;
    font-weight: 700;
    color: var(--theme-primary, #1B365D);
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin: 0 0 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--theme-border, #E2E8F0);
  }

  /* Menu Item Row */
  .menu-item-row {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px 0;
    border-bottom: 1px solid var(--theme-border-subtle, #F1F5F9);
  }

  .menu-item-row:last-child { border-bottom: none; }

  .menu-item-img {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    object-fit: cover;
    flex-shrink: 0;
    background: var(--theme-bg-primary, #F8FAFC);
  }

  .menu-item-img-fallback {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    background: var(--theme-surface-subtle, #F1F5F9);
    border: 1px solid var(--theme-border, #E2E8F0);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
  }

  .menu-item-info {
    flex: 1;
    min-width: 0;
  }

  .menu-item-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--theme-text-dark, #0F172A);
    margin-bottom: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .menu-item-desc {
    font-size: 11px;
    color: #bbb;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .menu-item-price {
    font-size: 13px;
    font-weight: 700;
    color: var(--theme-primary, #1B365D);
  }

  /* Quantity controls */
  .menu-item-qty {
    display: flex;
    align-items: center;
    gap: 0;
    flex-shrink: 0;
  }

  .qty-btn {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 1px solid var(--theme-border, #E2E8F0);
    background: var(--theme-surface-subtle, #F1F5F9);
    color: #888;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.18s;
    line-height: 1;
    padding: 0;
    font-family: 'Jost', sans-serif;
  }

  .qty-btn:hover {
    background: var(--theme-primary, #1B365D);
    border-color: var(--theme-primary, #1B365D);
    color: #fff;
  }

  .qty-num {
    width: 32px;
    text-align: center;
    font-size: 14px;
    font-weight: 700;
    color: var(--theme-text-dark, #0F172A);
  }

  /* Notes input per item */
  .menu-item-notes {
    width: 100%;
    padding: 7px 14px;
    border: 1px solid var(--theme-border, #E2E8F0);
    border-radius: 50px;
    font-size: 12px;
    color: #555;
    background: var(--theme-surface-subtle, #F1F5F9);
    outline: none;
    font-family: 'Jost', sans-serif;
    margin-top: 6px;
    transition: border 0.2s, box-shadow 0.2s;
  }

  .menu-item-notes:focus {
    border-color: var(--theme-primary, #1B365D);
    box-shadow: 0 0 0 3px var(--theme-primary-soft, rgba(27, 54, 93, 0.1));
    background: #fff;
  }

  .menu-item-notes::placeholder { color: #ccc; }

  /* Modal Footer */
  .order-modal-footer {
    padding: 16px 28px;
    border-top: 1px solid var(--theme-border, #E2E8F0);
    background: var(--theme-surface-subtle, #F1F5F9);
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
    gap: 16px;
  }

  .order-total-label {
    font-size: 12px;
    color: #aaa;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
  }

  .order-total-amount {
    font-size: 22px;
    font-weight: 700;
    color: var(--theme-text-dark, #0F172A);
    line-height: 1;
  }

  .order-items-summary {
    font-size: 11px;
    color: #bbb;
    margin-top: 1px;
  }

  .order-place-btn {
    background: var(--theme-primary-gradient, linear-gradient(135deg, var(--theme-primary, #1B365D), var(--theme-primary-hover, #122642))) !important;
    color: #fff !important;
    border: none !important;
    border-radius: 50px !important;
    padding: 12px 30px !important;
    font-size: 13px !important;
    font-weight: 700 !important;
    letter-spacing: 0.5px;
    transition: all 0.2s !important;
    box-shadow: 0 4px 16px var(--theme-primary-soft, rgba(27, 54, 93, 0.35));
    white-space: nowrap;
  }

  .order-place-btn:hover {
    box-shadow: 0 6px 22px var(--theme-primary-soft, rgba(27, 54, 93, 0.5)) !important;
    transform: translateY(-1px);
  }

  .order-place-btn:disabled {
    opacity: 0.5 !important;
    cursor: not-allowed !important;
    transform: none !important;
  }

  .order-loading-wrap {
    text-align: center;
    padding: 48px 24px;
  }

  .order-empty-wrap {
    text-align: center;
    padding: 48px 24px;
    color: #bbb;
    font-size: 14px;
  }

  @media (max-width: 768px) {
    .booking-card-inner { flex-direction: column; }
    .booking-img-wrap { width: 100%; min-height: 160px; }
    .booking-meta-grid { grid-template-columns: repeat(2, 1fr); }
    .profile-stats { grid-template-columns: repeat(3, 1fr); }
    .profile-bookings-header { padding: 20px 18px 0; }
    .profile-bookings-body { padding: 16px 18px 20px; }
    .profile-tabs { overflow-x: auto; white-space: nowrap; scrollbar-width: none; }
    .profile-tabs::-webkit-scrollbar { display: none; }
    .order-modal { border-radius: 20px; }
    .order-modal-header { padding: 18px 20px; }
    .order-category-bar { padding: 12px 16px; }
    .order-menu-scroll { padding: 16px 20px; }
    .order-modal-footer { padding: 14px 20px; flex-direction: column; align-items: stretch; }
    .order-place-btn { text-align: center; }
  }

  @media (max-width: 480px) {
    .profile-stats { grid-template-columns: repeat(2, 1fr); }
    .profile-stat-item:last-child { grid-column: 1 / -1; }
  }
`;

const statusConfig = {
  pending: { color: "#f39c12", bg: "rgba(243,156,18,0.1)", label: "PENDING" },
  confirmed: { color: "#3498db", bg: "rgba(52,152,219,0.1)", label: "CONFIRMED" },
  checked_in: { color: "#8e44ad", bg: "rgba(142,68,173,0.1)", label: "CHECKED IN" },
  checked_out: { color: "#7f8c8d", bg: "rgba(127,140,141,0.1)", label: "CHECKED OUT" },
  completed: { color: "#27ae60", bg: "rgba(54,133,104,0.1)", label: "COMPLETED" },
  cancelled: { color: "#CC5B55", bg: "rgba(231,76,60,0.1)", label: "CANCELLED" },
};

const getImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith("http")) return img;
  if (img.startsWith("uploads/") || img.startsWith("Uploads/")) {
    const base = process.env.REACT_APP_SERVER_URL || "http://localhost:5001";
    return `${base}/${img.replace(/^uploads\//i, "Uploads/")}`;
  }
  return `${process.env.REACT_APP_SERVER_URL || "http://localhost:5001"}/Uploads/${img}`;
};

const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" });
};

/* ─────────────────────────────────────────────
   GUEST REQUEST MODAL COMPONENT
───────────────────────────────────────────── */
function GuestRequestModal({ booking, token, user, onClose, refreshAccessToken }) {
  const [activeTab, setActiveTab] = useState('maintenance');
  const [submitting, setSubmitting] = useState(false);
  const [popup, setPopup] = useState({ show: false, type: '', message: '' });
  const [myServices, setMyServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);

  const roomNumber = booking.roomId?.roomNumber || booking.roomId?.name || '';
  const roomId = booking.roomId?._id || booking.roomId;

  const showPopup = (type, message) => {
    setPopup({ show: true, type, message });
    setTimeout(() => setPopup({ show: false, type: '', message: '' }), 3500);
  };

  useEffect(() => {
    const fetchMyServices = async () => {
      try {
        const [maintRes, hkRes, svcRes] = await Promise.allSettled([
          apiCall(token, refreshAccessToken, (t) => axios.get(`${BASE_URL}/maintenance/my`, { headers: { Authorization: `Bearer ${t}` } })),
          apiCall(token, refreshAccessToken, (t) => axios.get(`${BASE_URL}/housekeeping/my`, { headers: { Authorization: `Bearer ${t}` } })),
          apiCall(token, refreshAccessToken, (t) => axios.get(`${BASE_URL}/services/my`, { headers: { Authorization: `Bearer ${t}` } })),
        ]);
        const toArr = (r) => r.status === 'fulfilled'
          ? (Array.isArray(r.value.data) ? r.value.data : Array.isArray(r.value.data?.data) ? r.value.data.data : [])
          : [];
        const combined = [
          ...toArr(maintRes).map(x => ({ ...x, _type: 'Maintenance' })),
          ...toArr(hkRes).map(x => ({ ...x, _type: 'Housekeeping' })),
          ...toArr(svcRes).map(x => ({ ...x, _type: 'Guest Service' })),
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setMyServices(combined);
      } catch { setMyServices([]); }
      finally { setLoadingServices(false); }
    };
    fetchMyServices();
  }, [token]);

  // Maintenance form
  const [maintForm, setMaintForm] = useState({ issueType: 'other', issue: '', priority: 'medium' });
  // Housekeeping form
  const [hkForm, setHkForm] = useState({ taskType: 'room_cleaning', notes: '' });
  // Guest Service form
  const [svcForm, setSvcForm] = useState({ serviceType: 'room_service', description: '' });

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleMaintSubmit = async () => {
    if (!maintForm.issue.trim()) { showPopup('error', 'Please describe the issue.'); return; }
    try {
      setSubmitting(true);
      await apiCall(token, refreshAccessToken, (t) =>
        axios.post(`${BASE_URL}/maintenance`, {
          roomId: roomId || undefined,
          roomNumber,
          issue: maintForm.issue,
          issueType: maintForm.issueType,
          priority: maintForm.priority,
          reportedBy: user?._id || user?.id,
        }, { headers: { Authorization: `Bearer ${t}` } })
      );
      showPopup('success', 'Maintenance request submitted! Our team will assist you shortly.');
      setMaintForm({ issueType: 'other', issue: '', priority: 'medium' });
    } catch (err) {
      showPopup('error', err.response?.data?.message || 'Failed to submit request.');
    } finally { setSubmitting(false); }
  };

  const handleHkSubmit = async () => {
    try {
      setSubmitting(true);
      await apiCall(token, refreshAccessToken, (t) =>
        axios.post(`${BASE_URL}/housekeeping`, {
          roomId: roomId || undefined,
          roomNumber,
          taskType: hkForm.taskType,
          notes: hkForm.notes,
          priority: 'medium',
          guestRequest: true,
          requestedBy: user?._id || user?.id,
        }, { headers: { Authorization: `Bearer ${t}` } })
      );
      showPopup('success', 'Housekeeping request submitted! Staff will arrive soon.');
      setHkForm({ taskType: 'room_cleaning', notes: '' });
    } catch (err) {
      showPopup('error', err.response?.data?.message || 'Failed to submit request.');
    } finally { setSubmitting(false); }
  };

  const handleSvcSubmit = async () => {
    try {
      setSubmitting(true);
      await apiCall(token, refreshAccessToken, (t) =>
        axios.post(`${BASE_URL}/services`, {
          serviceType: svcForm.serviceType,
          description: svcForm.description,
          roomNumber,
        }, { headers: { Authorization: `Bearer ${t}` } })
      );
      showPopup('success', 'Service request submitted! We\'ll take care of it.');
      setSvcForm({ serviceType: 'room_service', description: '' });
    } catch (err) {
      showPopup('error', err.response?.data?.message || 'Failed to submit request.');
    } finally { setSubmitting(false); }
  };

  const tabs = [
    { key: 'maintenance', label: 'Maintenance', icon: 'fa-solid fa-wrench', emoji: '🔧' },
    { key: 'housekeeping', label: 'Housekeeping', icon: 'fa-solid fa-broom', emoji: '🧹' },
    { key: 'service', label: 'Guest Service', icon: 'fa-solid fa-bell-concierge', emoji: '🛎️' },
    { key: 'myservices', label: 'My Services', icon: 'fa-solid fa-list-check', emoji: '📋' },
  ];

  return (
    <>
      {popup.show && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 99999,
          minWidth: 300, maxWidth: 380, background: '#fff', borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)', padding: '18px 22px',
          display: 'flex', alignItems: 'center', gap: 14,
          borderLeft: `4px solid ${popup.type === 'success' ? 'var(--theme-primary, #1B365D)' : '#CC5B55'}`
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
            background: popup.type === 'success' ? 'var(--theme-primary-gradient, linear-gradient(135deg, var(--theme-primary, #1B365D), var(--theme-primary-hover, #122642)))' : '#CC5B55',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 18, fontWeight: 700
          }}>{popup.type === 'success' ? '✓' : '✕'}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--theme-text-dark, #0F172A)', marginBottom: 2 }}>
              {popup.type === 'success' ? 'Request Sent!' : 'Error'}
            </div>
            <div style={{ fontSize: 13, color: '#6c757d' }}>{popup.message}</div>
          </div>
          <button onClick={() => setPopup({ show: false, type: '', message: '' })}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#adb5bd', fontSize: 18 }}>✕</button>
        </div>
      )}

      <div className="order-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="order-modal" style={{ maxWidth: 520 }}>

          {/* HEADER */}
          <div className="order-modal-header">
            <div className="order-modal-header-left">
              <h3><i className="fa-solid fa-bell-concierge me-2" style={{ color: 'var(--theme-primary, #1B365D)', fontSize: 20 }}></i>Request Service</h3>
              <p>Room {roomNumber} &nbsp;•&nbsp; Booking #{booking._id.slice(-6).toUpperCase()}</p>
            </div>
            <button className="order-modal-close" onClick={onClose}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          {/* TABS */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--theme-border, #E2E8F0)', background: '#fff', flexShrink: 0 }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
                flex: 1, border: 'none', background: 'transparent', padding: '13px 0',
                fontSize: 12, fontWeight: activeTab === t.key ? 700 : 500,
                color: activeTab === t.key ? 'var(--theme-primary, #1B365D)' : '#999',
                borderBottom: activeTab === t.key ? '2px solid var(--theme-primary, #1B365D)' : '2px solid transparent',
                cursor: 'pointer', fontFamily: "'Jost',sans-serif", transition: 'all 0.18s'
              }}>
                <span style={{ marginRight: 4 }}>{t.emoji}</span>{t.label}
              </button>
            ))}
          </div>

          {/* BODY */}
          <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>

            {/* Room info strip */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
              background: 'var(--theme-surface-subtle, #F1F5F9)', border: '1px solid var(--theme-border, #E2E8F0)', borderRadius: 10, marginBottom: 20
            }}>
              <i className="fa-solid fa-door-open" style={{ color: 'var(--theme-primary, #1B365D)' }}></i>
              <div>
                <div style={{ fontSize: 10, color: '#bbb', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>Your Room</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--theme-text-dark, #0F172A)' }}>Room {roomNumber}</div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: 'rgba(54,133,104,0.1)', color: '#27ae60', textTransform: 'uppercase' }}>Checked In</span>
              </div>
            </div>

            {/* ── MAINTENANCE TAB ── */}
            {activeTab === 'maintenance' && (
              <div>
                <p style={{ fontSize: 13, color: '#888', marginBottom: 18 }}>
                  Report any technical issue in your room — AC, plumbing, electrical, furniture, etc.
                </p>
                <div className="mb-3">
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>Issue Type</label>
                  <select className="profile-form-input" style={{ borderRadius: 10 }} value={maintForm.issueType}
                    onChange={e => setMaintForm({ ...maintForm, issueType: e.target.value })}>
                    <option value="ac">❄️ AC / Cooling</option>
                    <option value="plumbing">💧 Plumbing</option>
                    <option value="electrical">⚡ Electrical</option>
                    <option value="furniture">🪑 Furniture</option>
                    <option value="appliance">📺 Appliance</option>
                    <option value="internet">📶 Internet / WiFi</option>
                    <option value="other">🔧 Other</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>Priority</label>
                  <select className="profile-form-input" style={{ borderRadius: 10 }} value={maintForm.priority}
                    onChange={e => setMaintForm({ ...maintForm, priority: e.target.value })}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>Describe the Issue *</label>
                  <textarea className="profile-form-input" style={{ borderRadius: 10, resize: 'none' }} rows={3}
                    placeholder="e.g. AC is not cooling properly, water dripping from tap..."
                    value={maintForm.issue} onChange={e => setMaintForm({ ...maintForm, issue: e.target.value })} />
                </div>
                <button className="btn order-place-btn w-100" disabled={submitting} onClick={handleMaintSubmit}>
                  {submitting ? <><span className="spinner-border spinner-border-sm me-2"></span>Submitting...</> : <><i className="fa-solid fa-wrench me-2"></i>Submit Maintenance Request</>}
                </button>
              </div>
            )}

            {/* ── HOUSEKEEPING TAB ── */}
            {activeTab === 'housekeeping' && (
              <div>
                <p style={{ fontSize: 13, color: '#888', marginBottom: 18 }}>
                  Need your room cleaned or fresh linens? Submit a housekeeping request.
                </p>
                <div className="mb-3">
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>Service Type</label>
                  <select className="profile-form-input" style={{ borderRadius: 10 }} value={hkForm.taskType}
                    onChange={e => setHkForm({ ...hkForm, taskType: e.target.value })}>
                    <option value="room_cleaning">🧹 Room Cleaning</option>
                    <option value="deep_cleaning">✨ Deep Cleaning</option>
                    <option value="linen_change">🛏️ Linen Change</option>
                    <option value="bathroom_cleaning">🚿 Bathroom Cleaning</option>
                    <option value="minibar_refill">🥤 Mini Bar Refill</option>
                    <option value="guest_request">📋 Other Request</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>Additional Notes</label>
                  <textarea className="profile-form-input" style={{ borderRadius: 10, resize: 'none' }} rows={3}
                    placeholder="Any special instructions or preferences..."
                    value={hkForm.notes} onChange={e => setHkForm({ ...hkForm, notes: e.target.value })} />
                </div>
                <button className="btn order-place-btn w-100" disabled={submitting} onClick={handleHkSubmit}>
                  {submitting ? <><span className="spinner-border spinner-border-sm me-2"></span>Submitting...</> : <><i className="fa-solid fa-broom me-2"></i>Submit Housekeeping Request</>}
                </button>
              </div>
            )}

            {/* ── GUEST SERVICE TAB ── */}
            {activeTab === 'service' && (
              <div>
                <p style={{ fontSize: 13, color: '#888', marginBottom: 18 }}>
                  Need extra amenities, wake-up call, laundry or transport? We're here to help.
                </p>
                <div className="mb-3">
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>Service Type</label>
                  <select className="profile-form-input" style={{ borderRadius: 10 }} value={svcForm.serviceType}
                    onChange={e => setSvcForm({ ...svcForm, serviceType: e.target.value })}>
                    <option value="room_service">🍽️ Room Service</option>
                    <option value="laundry">👔 Laundry</option>
                    <option value="wake_up_call">⏰ Wake-Up Call</option>
                    <option value="transportation">🚗 Transportation</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>Details / Instructions</label>
                  <textarea className="profile-form-input" style={{ borderRadius: 10, resize: 'none' }} rows={3}
                    placeholder="e.g. Wake-up call at 6:00 AM, extra blanket needed, pickup to airport at 9 AM..."
                    value={svcForm.description} onChange={e => setSvcForm({ ...svcForm, description: e.target.value })} />
                </div>
                <button className="btn order-place-btn w-100" disabled={submitting} onClick={handleSvcSubmit}>
                  {submitting ? <><span className="spinner-border spinner-border-sm me-2"></span>Submitting...</> : <><i className="fa-solid fa-bell-concierge me-2"></i>Submit Service Request</>}
                </button>
              </div>
            )}

            {/* ── MY SERVICES TAB ── */}
            {activeTab === 'myservices' && (
              <div>
                {loadingServices ? (
                  <div style={{ textAlign: 'center', padding: '48px 0' }}>
                    <div className="spinner-border" style={{ color: 'var(--theme-primary, #1B365D)' }}></div>
                  </div>
                ) : myServices.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px 0', color: '#bbb' }}>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>🛎️</div>
                    <p style={{ fontSize: 14, margin: 0 }}>No service requests yet</p>
                  </div>
                ) : (
                  myServices.map((svc, idx) => {
                    const statusColors = {
                      pending:     { color: '#f39c12', bg: 'rgba(243,156,18,0.1)' },
                      in_progress: { color: '#3498db', bg: 'rgba(52,152,219,0.1)' },
                      completed:   { color: '#27ae60', bg: 'rgba(54,133,104,0.1)'  },
                      resolved:    { color: '#27ae60', bg: 'rgba(54,133,104,0.1)'  },
                      cancelled:   { color: '#CC5B55', bg: 'rgba(231,76,60,0.1)'  },
                    };
                    const rawStatus = (svc.status || svc.cleaningStatus || 'pending').toLowerCase();
                    const sc = statusColors[rawStatus] || statusColors.pending;
                    const typeIcons = { 'Maintenance': '🔧', 'Housekeeping': '🧹', 'Guest Service': '🛎️' };
                    const subType = (svc.issueType || svc.taskType || svc.serviceType || '').replace(/_/g, ' ');
                    const timeStr = svc.createdAt
                      ? new Date(svc.createdAt).toLocaleString('en-PK', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                      : '';
                    return (
                      <div key={svc._id || idx} style={{ border: '1px solid var(--theme-border, #E2E8F0)', borderRadius: 14, marginBottom: 12, overflow: 'hidden', background: '#fff' }}>
                        <div style={{ background: 'var(--theme-surface-subtle, #F1F5F9)', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--theme-border, #E2E8F0)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 18 }}>{typeIcons[svc._type] || '🛎️'}</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--theme-text-dark, #0F172A)' }}>{svc._type}</span>
                            {subType && (
                              <span style={{ fontSize: 11, color: '#888', background: 'var(--theme-border, #E2E8F0)', borderRadius: 20, padding: '1px 8px', textTransform: 'capitalize' }}>{subType}</span>
                            )}
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: sc.bg, color: sc.color, textTransform: 'uppercase' }}>
                            {rawStatus.replace('_', ' ')}
                          </span>
                        </div>
                        <div style={{ padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {(svc.issue || svc.notes || svc.description) && (
                            <p style={{ fontSize: 13, color: '#444', margin: 0 }}>{svc.issue || svc.notes || svc.description}</p>
                          )}
                          <div style={{ display: 'flex', gap: 16, fontSize: 11, color: '#aaa', marginTop: 4 }}>
                            {svc.priority && <span>⚡ <b style={{ color: svc.priority === 'high' ? '#CC5B55' : '#888' }}>{svc.priority}</b></span>}
                            {timeStr && <span>🕐 {timeStr}</span>}
                            {svc.roomNumber && <span>🚪 Room {svc.roomNumber}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   ORDER MODAL COMPONENT
───────────────────────────────────────────── */
function OrderModal({ booking, token, user, onClose, refreshAccessToken }) {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [cart, setCart] = useState({}); // { itemId: { qty } }
  const [orderNotes, setOrderNotes] = useState("");  // order-level notes
  const [placingOrder, setPlacingOrder] = useState(false);
  const [myOrders, setMyOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeModalTab, setActiveModalTab] = useState("menu"); // "menu" | "orders"
  const [popup, setPopup] = useState({ show: false, type: '', message: '' });
  const showPopup = (type, message) => {
    setPopup({ show: true, type, message });
    setTimeout(() => setPopup({ show: false, type: '', message: '' }), 3000);
  };

  // Fetch previous orders for this booking
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await apiCall(token, refreshAccessToken, (t) =>
          axios.get(`${BASE_URL}/restaurant/orders/user/${user._id}`, { headers: { Authorization: `Bearer ${t}` } })
        );
        const raw = res.data;
        const orders = Array.isArray(raw) ? raw
          : Array.isArray(raw?.data) ? raw.data
            : Array.isArray(raw?.orders) ? raw.orders
              : [];
        setMyOrders(orders);
      } catch {
        setMyOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, []);

  // Fetch restaurant menu on mount
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await apiCall(token, refreshAccessToken, (t) =>
          axios.get(`${BASE_URL}/restaurant/menu`, { headers: { Authorization: `Bearer ${t}` } })
        );
        // Handle various response shapes: plain array, {data:[]}, {menu:[]}, {items:[]}
        const raw = res.data;
        const items = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data) ? raw.data
            : Array.isArray(raw?.menu) ? raw.menu
              : Array.isArray(raw?.items) ? raw.items
                : [];
        setMenuItems(items);
        const cats = [...new Set(items.map(i => i.category).filter(Boolean))];
        setCategories(cats);
      } catch (err) {
        showPopup('error', 'Something Went Wrong');
      } finally {
        setLoadingMenu(false);
      }
    };
    fetchMenu();
  }, []);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const setQty = (itemId, delta) => {
    setCart(prev => {
      const current = prev[itemId]?.qty || 0;
      const newQty = Math.max(0, current + delta);
      if (newQty === 0) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [itemId]: { qty: newQty } };
    });
  };

  const cartItems = Object.entries(cart).filter(([, v]) => v.qty > 0);

  const totalAmount = cartItems.reduce((sum, [id, { qty }]) => {
    const item = menuItems.find(m => m._id === id);
    return sum + (item?.price || 0) * qty;
  }, 0);

  const totalQty = cartItems.reduce((sum, [, { qty }]) => sum + qty, 0);

  const filterItems = activeCategory === "all"
    ? menuItems
    : menuItems.filter(i => i.category === activeCategory);

  // Group filter items by category for display
  const grouped = filterItems.reduce((acc, item) => {
    const cat = item.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;
    try {
      setPlacingOrder(true);
      const orderPayload = {
        userId: user?._id || user?.id,
        guestName: user?.name,
        roomNumber: booking.roomId?.roomNumber || booking.roomId?.name || "",
        notes: orderNotes.trim() || undefined,
        totalAmount,
        items: cartItems.map(([id, { qty }]) => {
          const menuItem = menuItems.find(m => m._id === id);
          return {
            menuItemId: id,
            name: menuItem?.name || "",
            price: menuItem?.price || 0,
            quantity: qty,
          };
        }),
      };
      await apiCall(token, refreshAccessToken, (t) =>
        axios.post(`${BASE_URL}/restaurant/orders/`, orderPayload, { headers: { Authorization: `Bearer ${t}` } })
      );
      showPopup('success', 'Order placed successfully! 🍽️');
      // Refresh orders then switch to orders tab
      try {
        const r2 = await apiCall(token, refreshAccessToken, (t) =>
          axios.get(`${BASE_URL}/restaurant/orders/user/${user._id}`, { headers: { Authorization: `Bearer ${t}` } })
        );
        const raw2 = r2.data;
        const updated = Array.isArray(raw2) ? raw2
          : Array.isArray(raw2?.data) ? raw2.data
            : Array.isArray(raw2?.orders) ? raw2.orders
              : [];
        setMyOrders(updated);
      } catch { }
      setCart({});
      setOrderNotes("");
      setActiveModalTab("orders");
    } catch (err) {
      showPopup('error', err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
  };

  const categoryEmoji = (cat) => {
    const map = { breakfast: "🍳", lunch: "🥗", dinner: "🍽️", beverages: "☕", desserts: "🍮", snacks: "🥨" };
    return map[cat?.toLowerCase()] || "🍴";
  };

  return (
    <>
      {popup.show && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 99999,
          minWidth: 300, maxWidth: 380,
          background: '#fff', borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          padding: '18px 22px',
          display: 'flex', alignItems: 'center', gap: 14,
          borderLeft: `4px solid ${popup.type === 'success' ? 'var(--theme-primary, #1B365D)' : '#CC5B55'}`
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
            background: popup.type === 'success' ? 'var(--theme-primary-gradient, linear-gradient(135deg, var(--theme-primary, #1B365D), var(--theme-primary-hover, #122642)))' : '#CC5B55',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 18, fontWeight: 700
          }}>
            {popup.type === 'success' ? '✓' : '✕'}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--theme-text-dark, #0F172A)', marginBottom: 2 }}>
              {popup.type === 'success' ? 'Success' : 'Error'}
            </div>
            <div style={{ fontSize: 13, color: '#6c757d' }}>{popup.message}</div>
          </div>
          <button onClick={() => setPopup({ show: false, type: '', message: '' })}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#adb5bd', fontSize: 18 }}>
            ✕
          </button>
        </div>
      )}

      <div className="order-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="order-modal">

          {/* HEADER */}
          <div className="order-modal-header">
            <div className="order-modal-header-left">
              <h3>
                <i className="fa-solid fa-utensils me-2" style={{ color: "var(--theme-primary, #1B365D)", fontSize: "20px" }}></i>
                Restaurant Menu
              </h3>
              <p>
                Room: {booking.roomId?.name || `Room ${booking.roomId?.roomNumber || ""}`}
                &nbsp;•&nbsp;
                Booking #{booking._id.slice(-6).toUpperCase()}
              </p>
            </div>
            <button className="order-modal-close" onClick={onClose}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          {/* MODAL TABS */}
          <div style={{ display: "flex", borderBottom: "1px solid var(--theme-border, #E2E8F0)", background: "#fff", flexShrink: 0 }}>
            <button
              onClick={() => setActiveModalTab("menu")}
              style={{
                flex: 1, border: "none", background: "transparent", padding: "13px 0",
                fontSize: 13, fontWeight: activeModalTab === "menu" ? 700 : 500,
                color: activeModalTab === "menu" ? "var(--theme-primary, #1B365D)" : "#999",
                borderBottom: activeModalTab === "menu" ? "2px solid var(--theme-primary, #1B365D)" : "2px solid transparent",
                cursor: "pointer", fontFamily: "'Jost',sans-serif", transition: "all 0.18s"
              }}
            >
              <i className="fa-solid fa-utensils me-2" style={{ fontSize: 11 }}></i>Menu
            </button>
            <button
              onClick={() => setActiveModalTab("orders")}
              style={{
                flex: 1, border: "none", background: "transparent", padding: "13px 0",
                fontSize: 13, fontWeight: activeModalTab === "orders" ? 700 : 500,
                color: activeModalTab === "orders" ? "var(--theme-primary, #1B365D)" : "#999",
                borderBottom: activeModalTab === "orders" ? "2px solid var(--theme-primary, #1B365D)" : "2px solid transparent",
                cursor: "pointer", fontFamily: "'Jost',sans-serif", transition: "all 0.18s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6
              }}
            >
              <i className="fa-solid fa-receipt" style={{ fontSize: 11 }}></i>
              My Orders
              {myOrders.length > 0 && (
                <span style={{
                  background: activeModalTab === "orders" ? "var(--theme-primary-soft, rgba(27, 54, 93, 0.15))" : "var(--theme-border, #E2E8F0)",
                  color: "var(--theme-primary, #1B365D)", borderRadius: 20, fontSize: 10, fontWeight: 700,
                  padding: "1px 7px"
                }}>{myOrders.length}</span>
              )}
            </button>
          </div>

          {/* CATEGORY CHIPS */}
          {activeModalTab === "menu" &&
            !loadingMenu &&
            categories.length > 0 && (
              <div className="order-category-bar">
                <button
                  className={`order-cat-chip ${activeCategory === "all" ? "active" : ""}`}
                  onClick={() => setActiveCategory("all")}
                >
                  🍴 All Items
                </button>

                {categories.map(cat => (
                  <button
                    key={cat}
                    className={`order-cat-chip ${activeCategory === cat ? "active" : ""}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {categoryEmoji(cat)}{" "}
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            )}
          {/* ══ ORDERS TAB ══ */}
          {activeModalTab === "orders" && (
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px", scrollbarWidth: "thin" }}>
              {loadingOrders ? (
                <div style={{ textAlign: "center", padding: "48px 0" }}>
                  <div className="spinner-border" style={{ color: "var(--theme-primary, #1B365D)" }}></div>
                </div>
              ) : myOrders.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 0", color: "#bbb" }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>🧾</div>
                  <p style={{ fontSize: 14, margin: 0 }}>No orders placed yet for this stay</p>
                </div>
              ) : (
                [...myOrders].reverse().map((order, idx) => {
                  const osc = {
                    Pending: { color: "#f39c12", bg: "rgba(243,156,18,0.1)" },
                    Confirmed: { color: "#3498db", bg: "rgba(52,152,219,0.1)" },
                    Preparing: { color: "#8e44ad", bg: "rgba(142,68,173,0.1)" },
                    Ready: { color: "#27ae60", bg: "rgba(54,133,104,0.1)" },
                    Delivered: { color: "#7f8c8d", bg: "rgba(127,140,141,0.1)" },
                    Cancelled: { color: "#CC5B55", bg: "rgba(231,76,60,0.1)" },
                  };
                  const os = osc[order.status] || osc.Pending;
                  const orderTime = order.createdAt
                    ? new Date(order.createdAt).toLocaleString("en-PK", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
                    : "";
                  return (
                    <div key={order._id || idx} style={{
                      border: "1px solid var(--theme-border, #E2E8F0)", borderRadius: 14, marginBottom: 12,
                      overflow: "hidden", background: "#fff"
                    }}>
                      <div style={{
                        background: "var(--theme-surface-subtle, #F1F5F9)", padding: "10px 16px",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        borderBottom: "1px solid var(--theme-border, #E2E8F0)"
                      }}>
                        <div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--theme-text-dark, #0F172A)" }}>
                            Order #{(order._id || "").slice(-6).toUpperCase()}
                          </span>
                          {orderTime && (
                            <span style={{ fontSize: 11, color: "#bbb", marginLeft: 8 }}>{orderTime}</span>
                          )}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{
                            fontSize: 10, fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase",
                            padding: "3px 10px", borderRadius: 20, color: os.color, background: os.bg
                          }}>{order.status}</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#27ae60" }}>
                            Rs. {order.totalAmount?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div style={{ padding: "10px 16px" }}>
                        {(order.items || []).map((it, i) => (
                          <div key={i} style={{
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            padding: "6px 0", borderBottom: i < order.items.length - 1 ? "1px solid var(--theme-border-subtle, #F1F5F9)" : "none"
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{
                                width: 22, height: 22, background: "var(--theme-primary-soft, rgba(27, 54, 93, 0.12))",
                                borderRadius: 6, display: "inline-flex", alignItems: "center",
                                justifyContent: "center", fontSize: 10, fontWeight: 700, color: "var(--theme-primary, #1B365D)"
                              }}>{it.quantity}×</span>
                              <span style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>{it.name}</span>
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#888" }}>
                              Rs. {((it.price || 0) * (it.quantity || 1)).toLocaleString()}
                            </span>
                          </div>
                        ))}
                        {order.notes && (
                          <div style={{
                            marginTop: 8, padding: "6px 10px", background: "var(--theme-surface-subtle, #F1F5F9)",
                            border: "1px solid var(--theme-border, #E2E8F0)", borderRadius: 8, fontSize: 11, color: "#aaa"
                          }}>
                            <i className="fa-solid fa-note-sticky me-1" style={{ color: "var(--theme-primary, #1B365D)" }}></i>
                            {order.notes}
                          </div>
                        )}
                        {order.estimatedTime && order.status !== "Delivered" && order.status !== "Cancelled" && (
                          <div style={{ marginTop: 6, fontSize: 11, color: "#bbb" }}>
                            <i className="fa-solid fa-clock me-1" style={{ color: "var(--theme-primary, #1B365D)" }}></i>
                            Est. delivery: ~{order.estimatedTime} mins
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ══ MENU TAB ══ */}
          {activeModalTab === "menu" && <div className="order-menu-scroll">
            {loadingMenu ? (
              <div className="order-loading-wrap">
                <div className="spinner-border" style={{ color: "var(--theme-primary, #1B365D)" }}></div>
                <p className="mt-3" style={{ color: "#bbb", fontSize: "13px" }}>Loading menu...</p>
              </div>
            ) : filterItems.length === 0 ? (
              <div className="order-empty-wrap">
                <div style={{ fontSize: "36px", marginBottom: "12px" }}>🍽️</div>
                No menu items found
              </div>
            ) : (
              Object.entries(grouped).map(([cat, items]) => (
                <div key={cat} className="mb-3">
                  <div className="order-section-title">
                    {categoryEmoji(cat)} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </div>
                  {items.map(item => {
                    const itemCart = cart[item._id];
                    const qty = itemCart?.qty || 0;
                    const imgUrl = getImageUrl(item.image);

                    return (
                      <div key={item._id}>
                        <div className="menu-item-row">
                          {/* Image */}
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={item.name}
                              className="menu-item-img"
                              onError={(e) => { e.target.style.display = "none"; }}
                            />
                          ) : (
                            <div className="menu-item-img-fallback">
                              {categoryEmoji(item.category)}
                            </div>
                          )}

                          {/* Info */}
                          <div className="menu-item-info">
                            <div className="menu-item-name">{item.name}</div>
                            {item.description && (
                              <div className="menu-item-desc">{item.description}</div>
                            )}
                            <div className="menu-item-price">Rs. {item.price?.toLocaleString()}</div>
                          </div>

                          {/* Qty Controls */}
                          <div className="menu-item-qty">
                            <button className="qty-btn" onClick={() => setQty(item._id, -1)}>−</button>
                            <span className="qty-num">{qty}</span>
                            <button className="qty-btn" onClick={() => setQty(item._id, 1)}>+</button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>}

          {/* ORDER-LEVEL INFO BANNER + NOTES */}
          {activeModalTab === "menu" && (
            <div style={{ padding: "0 28px 0", borderTop: "1px solid var(--theme-border, #E2E8F0)", background: "var(--theme-surface-subtle, #F1F5F9)" }}>
              {/* Auto-filled info strip */}
              <div style={{ display: "flex", gap: "20px", padding: "12px 0 10px", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--theme-primary-soft, rgba(27, 54, 93, 0.12))", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--theme-primary, #1B365D)", fontSize: 11 }}>
                    <i className="fa-solid fa-user"></i>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.4px", fontWeight: 600 }}>Guest</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--theme-text-dark, #0F172A)" }}>{user?.name}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--theme-primary-soft, rgba(27, 54, 93, 0.12))", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--theme-primary, #1B365D)", fontSize: 11 }}>
                    <i className="fa-solid fa-door-open"></i>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.4px", fontWeight: 600 }}>Room</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--theme-text-dark, #0F172A)" }}>
                      {booking.roomId?.roomNumber || booking.roomId?.name || "—"}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--theme-primary-soft, rgba(27, 54, 93, 0.12))", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--theme-primary, #1B365D)", fontSize: 11 }}>
                    <i className="fa-solid fa-clock"></i>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.4px", fontWeight: 600 }}>Est. Time</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--theme-text-dark, #0F172A)" }}>~20 mins</div>
                  </div>
                </div>
              </div>
              {/* Order-level notes */}
              <div style={{ paddingBottom: "14px" }}>
                <input
                  type="text"
                  className="menu-item-notes"
                  style={{ borderRadius: "10px" }}
                  placeholder="Order notes (e.g. allergies, delivery instructions, no plastic...)"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* FOOTER */}
          {activeModalTab === "menu" && <div className="order-modal-footer">
            <div>
              <div className="order-total-label">Order Total</div>
              <div className="order-total-amount">Rs. {totalAmount.toLocaleString()}</div>
              {totalQty > 0 && (
                <div className="order-items-summary">
                  {totalQty} item{totalQty > 1 ? "s" : ""} selected
                </div>
              )}
            </div>
            <button
              className="btn order-place-btn"
              disabled={totalQty === 0 || placingOrder}
              onClick={handlePlaceOrder}
            >
              {placingOrder ? (
                <><span className="spinner-border spinner-border-sm me-2"></span>Placing...</>
              ) : (
                <><i className="fa-solid fa-check me-2"></i>Place Order</>
              )}
            </button>
          </div>}

        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   MAIN PROFILE PAGE
───────────────────────────────────────────── */
export default function ProfilePage() {
  const { user, token, login, refreshAccessToken } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [feedbackModalBooking, setFeedbackModalBooking] = useState(null);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showPassForm, setShowPassForm] = useState(false);
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [changingPass, setChangingPass] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [orderModalBooking, setOrderModalBooking] = useState(null);
  const [guestRequestBooking, setGuestRequestBooking] = useState(null);
  const [myRequests, setMyRequests] = useState([]);
  const [confirmModal, setConfirmModal] = useState({ show: false });
const [loadingRequests, setLoadingRequests] = useState(false);
  const [popup, setPopup] = useState({ show: false, type: '', message: '' });
  const showPopup = (type, message) => {
    setPopup({ show: true, type, message });
    setTimeout(() => setPopup({ show: false, type: '', message: '' }), 3000);
  };// booking for which modal is open

  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [loyaltyData, setLoyaltyData] = useState({ points: 0, tier: { name: 'Bronze', icon: '🥉', color: 'danger' } });
const [preferences, setPreferences] = useState({
    roomType: '', floorLevel: '', pillowType: '', dietaryNeeds: '',
    extraBlanket: false, quietRoom: false, notes: ''
  });
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  useEffect(() => {
    if (!user) { navigate("/user-login"); return; }
    setForm({ name: user.name || "", email: user.email || "", phone: user.phone || "" });
   // Loyalty points + preferences fetch karo
    const uid = user._id || user.id;
    if (uid) {
      apiCall(token, refreshAccessToken, (t) =>
        axios.get(`${BASE_URL}/guest-crm/${uid}/loyalty`, { headers: { Authorization: `Bearer ${t}` } })
      ).then(res => {
        if (res.data.success) setLoyaltyData(res.data);
      }).catch(() => {});

      apiCall(token, refreshAccessToken, (t) =>
        axios.get(`${BASE_URL}/guest-crm/${uid}`, { headers: { Authorization: `Bearer ${t}` } })
      ).then(res => {
        if (res.data.profile?.preferences) {
          setPreferences(prev => ({ ...prev, ...res.data.profile.preferences }));
        }
      }).catch(() => {});
    }
  }, [user]);
useEffect(() => {
    if (!user?._id && !user?.id) return;
    const fetchRequests = async () => {
      setLoadingRequests(true);
      try {
        const [maintRes, hkRes, svcRes] = await Promise.allSettled([
          apiCall(token, refreshAccessToken, (t) => axios.get(`${BASE_URL}/maintenance/my`, { headers: { Authorization: `Bearer ${t}` } })),
          apiCall(token, refreshAccessToken, (t) => axios.get(`${BASE_URL}/housekeeping/my`, { headers: { Authorization: `Bearer ${t}` } })),
          apiCall(token, refreshAccessToken, (t) => axios.get(`${BASE_URL}/services/my`, { headers: { Authorization: `Bearer ${t}` } })),
        ]);
        const maint = (maintRes.status === 'fulfilled' ? maintRes.value.data : [])
          .map(r => ({ ...r, _type: 'maintenance', _label: 'Maintenance', _icon: '🔧' }));
        const hk = (hkRes.status === 'fulfilled' ? hkRes.value.data : [])
          .map(r => ({ ...r, _type: 'housekeeping', _label: 'Housekeeping', _icon: '🧹' }));
        const svc = (svcRes.status === 'fulfilled' ? svcRes.value.data : [])
          .map(r => ({ ...r, _type: 'service', _label: 'Guest Service', _icon: '🛎️' }));
        const all = [...maint, ...hk, ...svc].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setMyRequests(all);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingRequests(false);
      }
    };
    fetchRequests();
  }, [user]);
  useEffect(() => {
    if (!user?._id && !user?.id) return;
    const fetchBookings = async () => {
      try {
        const userId = user._id || user.id;
        const res = await apiCall(token, refreshAccessToken, (t) =>
          axios.get(`${BASE_URL}/bookings/user/${userId}`, { headers: { Authorization: `Bearer ${t}` } })
        );
        setBookings(res.data);
      } catch (err) {
        showPopup('error', 'Booking is not loading');
      } finally {
        setLoadingBookings(false);
      }
    };
    fetchBookings();
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { showPopup('error', 'Name is required'); return; }
    try {
      setUpdating(true);
      const res = await apiCall(token, refreshAccessToken, (t) =>
        axios.put(`${BASE_URL}/auth/profile/update`, { name: form.name, phone: form.phone }, { headers: { Authorization: `Bearer ${t}` } })
      );
      login({ ...user, name: res.data.user.name, phone: res.data.user.phone }, token);
      showPopup('success', 'Profile updated successfully!');
      setEditMode(false);
    } catch (err) {
      showPopup('error', err.response?.data?.message || 'Failed to Update Profile, Try Again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      showPopup('error', 'New passwords do not match'); return;
    }
    if (passForm.newPassword.length < 6) {
      showPopup('error', 'Password must be at least 6 characters'); return;
    }
    try {
      setChangingPass(true);
      await apiCall(token, refreshAccessToken, (t) =>
        axios.put(`${BASE_URL}/auth/profile/change-password`,
          { currentPassword: passForm.currentPassword, newPassword: passForm.newPassword },
          { headers: { Authorization: `Bearer ${t}` } }
        )
      );
      showPopup('success', 'Password changed successfully!');
      setShowPassForm(false);
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showPopup('error', err.response?.data?.message || 'Failed to change password');
    } finally { setChangingPass(false); }
  };
const handleSavePreferences = async () => {
    setSavingPrefs(true);
    try {
      const uid = user._id || user.id;
      await apiCall(token, refreshAccessToken, (t) =>
        axios.put(`${BASE_URL}/guest-crm/${uid}`, { preferences }, { headers: { Authorization: `Bearer ${t}` } })
      );
      showPopup('success', 'Preferences saved successfully!');
      setShowPrefs(false);
    } catch {
      showPopup('error', 'Failed to save preferences.');
    } finally {
      setSavingPrefs(false);
    }
  };
  const handleCancelBooking = (bookingId) => {
    setConfirmModal({
      show: true,
      title: 'Cancel Booking?',
      message: 'Are you sure you want to cancel this booking? This action cannot be undone.',
      confirmText: 'Yes, Cancel Booking',
      danger: true,
      onConfirm: async () => {
        setConfirmModal({ show: false });
        try {
          await apiCall(token, refreshAccessToken, (t) =>
            axios.put(`${BASE_URL}/bookings/${bookingId}/cancel`, {}, { headers: { Authorization: `Bearer ${t}` } })
          );
          showPopup('success', 'Booking cancelled successfully');
          setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, bookingStatus: 'cancelled' } : b));
        } catch (err) {
          showPopup('error', err.response?.data?.message || 'Failed to cancel booking');
        }
      },
    });
  };

  const tabs = [
    { key: "all", label: "All", filter: () => true },
    { key: "upcoming", label: "Upcoming", filter: (b) => ["pending", "confirmed"].includes(b.bookingStatus) },
    { key: "active", label: "Active", filter: (b) => b.bookingStatus === "checked_in" },
    { key: "past", label: "Past", filter: (b) => ["checked_out", "completed", "cancelled"].includes(b.bookingStatus) },
    { key: "requests", label: "My Requests", filter: () => false },
  ];

  const filterBookings = bookings.filter(
    tabs.find(t => t.key === activeTab)?.filter || (() => true)
  );

  if (!user) return null;

  return (

    <>
      <style>{PROFILE_STYLES}</style>

      {/* POPUP NOTIFICATION */}
      {popup.show && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 99999,
          minWidth: 300, maxWidth: 380,
          background: '#fff', borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          padding: '18px 22px',
          display: 'flex', alignItems: 'center', gap: 14,
          animation: 'slideIn 0.3s ease',
          borderLeft: `4px solid ${popup.type === 'success' ? 'var(--theme-primary, #1B365D)' : '#CC5B55'}`
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
            background: popup.type === 'success' ? 'var(--theme-primary-gradient, linear-gradient(135deg, var(--theme-primary, #1B365D), var(--theme-primary-hover, #122642)))' : '#CC5B55',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 18, fontWeight: 700
          }}>
            {popup.type === 'success' ? '✓' : '✕'}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--theme-text-dark, #0F172A)', marginBottom: 2 }}>
              {popup.type === 'success' ? 'Success' : 'Error'}
            </div>
            <div style={{ fontSize: 13, color: '#6c757d' }}>{popup.message}</div>
          </div>
          <button onClick={() => setPopup({ show: false, type: '', message: '' })}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#adb5bd', fontSize: 18 }}>
            ✕
          </button>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
      `}</style>
      <div className="profile-page">

        {/* ORDER MODAL */}
        {orderModalBooking && (
          <OrderModal
            booking={orderModalBooking}
            token={token}
            user={user}
            refreshAccessToken={refreshAccessToken}
            onClose={() => setOrderModalBooking(null)}
          />
        )}

        {/* CONFIRM MODAL */}
        <ConfirmModal
          show={confirmModal.show}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={confirmModal.confirmText}
          danger={confirmModal.danger}
          onConfirm={confirmModal.onConfirm}
          onClose={() => setConfirmModal({ show: false })}
        />

        {/* FEEDBACK MODAL */}
        {feedbackModalBooking && (
          <FeedbackModal
            booking={feedbackModalBooking}
            showPopup={showPopup}
            onClose={() => setFeedbackModalBooking(null)}
            onSubmitted={(bookingId) => {
              setBookings((prev) =>
                prev.map((b) => (b._id === bookingId ? { ...b, feedbackGiven: true } : b))
              );
            }}
          />
        )}

        {/* GUEST REQUEST MODAL */}
        {guestRequestBooking && (
          <GuestRequestModal
            booking={guestRequestBooking}
            token={token}
            user={user}
            refreshAccessToken={refreshAccessToken}
            onClose={() => setGuestRequestBooking(null)}
          />
        )}

        <div className="container">

          {/* TITLE */}
          <div className="text-center mb-5">
            <h2 className="profile-page-title">My <span>Profile</span></h2>
            <p className="profile-page-sub">Manage your details and view your bookings</p>
          </div>

          <div className="row g-4">

            {/* ===== LEFT ===== */}
            <div className="col-lg-4">
              <div className="profile-user-card">

                <div className="profile-card-header">
                  <div className="profile-avatar">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="profile-card-name">{user.name}</div>
                  <div className="profile-card-email">{user.email}</div>
                  <div className="profile-member-badge">
                    <i className="fa-solid fa-crown" style={{ fontSize: "10px" }}></i>
                    Guest Member
                  </div>
                </div>

                <div className="profile-card-body">

                  {!editMode ? (
                    <>
                      <div className="profile-info-item">
                        <div className="profile-info-icon"><i className="fa-solid fa-user"></i></div>
                        <div>
                          <div className="profile-info-label">Full Name</div>
                          <div className="profile-info-value">{user.name}</div>
                        </div>
                      </div>
                      <div className="profile-info-item">
                        <div className="profile-info-icon"><i className="fa-solid fa-envelope"></i></div>
                        <div>
                          <div className="profile-info-label">Email</div>
                          <div className="profile-info-value">{user.email}</div>
                        </div>
                      </div>
                      <div className="profile-info-item">
                        <div className="profile-info-icon"><i className="fa-solid fa-phone"></i></div>
                        <div>
                          <div className="profile-info-label">Phone</div>
                          <div className="profile-info-value">{user.phone || "Not added"}</div>
                        </div>
                      </div>
                      <button className="btn profile-edit-btn mt-2" onClick={() => setEditMode(true)}>
                        <i className="fa-solid fa-pen me-2"></i> Edit Profile
                      </button>
                      <button className="btn profile-edit-btn mt-2" style={{ background: 'linear-gradient(135deg, var(--theme-sidebar, #0F172A) 0%, var(--theme-primary, #1B365D) 100%)' }} onClick={() => setShowPassForm(!showPassForm)}>
                        <i className="fa-solid fa-lock me-2"></i> Change Password
                      </button>
                      {showPassForm && (
                        <form onSubmit={handleChangePassword} className="mt-3">
                          <div className="mb-2">
                            <label className="profile-form-label">Current Password</label>
                            <input type="password" className="profile-form-input" placeholder="Current password"
                              value={passForm.currentPassword} onChange={e => setPassForm({ ...passForm, currentPassword: e.target.value })} required />
                          </div>
                          <div className="mb-2">
                            <label className="profile-form-label">New Password</label>
                            <input type="password" className="profile-form-input" placeholder="New password (min 6 chars)"
                              value={passForm.newPassword} onChange={e => setPassForm({ ...passForm, newPassword: e.target.value })} required />
                          </div>
                          <div className="mb-3">
                            <label className="profile-form-label">Confirm New Password</label>
                            <input type="password" className="profile-form-input" placeholder="Confirm new password"
                              value={passForm.confirmPassword} onChange={e => setPassForm({ ...passForm, confirmPassword: e.target.value })} required />
                          </div>
                          <div className="d-flex gap-2">
                            <button type="submit" className="btn profile-save-btn" disabled={changingPass}>
                              {changingPass ? <span className="spinner-border spinner-border-sm me-1"></span> : <i className="fa-solid fa-check me-1"></i>}
                              Save
                            </button>
                            <button type="button" className="btn profile-cancel-btn" onClick={() => { setShowPassForm(false); setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); }}>
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}
                    </>
                  ) : (
                    <form onSubmit={handleUpdate}>
                      <div className="mb-3">
                        <label className="profile-form-label">Full Name *</label>
                        <input
                          type="text"
                          className="profile-form-input"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="profile-form-label">Email</label>
                        <input
                          type="email"
                          className="profile-form-input"
                          value={form.email}
                          disabled
                        />
                        <small style={{ fontSize: "11px", color: "#bbb", paddingLeft: "14px" }}>
                          Email Can't Changed
                        </small>
                      </div>
                      <div className="mb-4">
                        <label className="profile-form-label">Phone</label>
                        <input
                          type="tel"
                          className="profile-form-input"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          placeholder="03XXXXXXXXX"
                        />
                      </div>
                      <div className="d-flex gap-2">
                        <button type="submit" className="btn profile-save-btn" disabled={updating}>
                          {updating
                            ? <span className="spinner-border spinner-border-sm me-1"></span>
                            : <i className="fa-solid fa-check me-1"></i>
                          }
                          Save
                        </button>
                        <button
                          type="button"
                          className="btn profile-cancel-btn"
                          onClick={() => {
                            setEditMode(false);
                            setForm({ name: user.name || "", email: user.email || "", phone: user.phone || "" });
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
{/* LOYALTY POINTS */}
                  <div style={{
                    marginTop: 16, padding: '14px 16px',
                    background: 'linear-gradient(135deg, var(--theme-sidebar, #0F172A) 0%, var(--theme-primary, #1B365D) 100%)',
                    borderRadius: 14, textAlign: 'center',
                    border: '1px solid var(--theme-primary-soft, rgba(27, 54, 93, 0.2))'
                  }}>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                      Loyalty Points
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--theme-primary, #1B365D)', lineHeight: 1 }}>
                      {loyaltyData.points || 0}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                      {(loyaltyData.points || 0) > 0
                        ? `≈ PKR ${((loyaltyData.points || 0) * 10).toLocaleString()} eemable value`
                        : 'Earn points after completed paid stays'}
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '3px 12px',
                        borderRadius: 20, background: 'var(--theme-primary-soft, rgba(27, 54, 93, 0.15))',
                        color: 'var(--theme-primary, #1B365D)', border: '1px solid var(--theme-primary-soft, rgba(27, 54, 93, 0.30))'
                      }}>
                        {loyaltyData.tier?.icon} {loyaltyData.tier?.name} Member
                      </span>
                    </div>
                  </div>
                  {/* PREFERENCES */}
                  <div style={{ marginTop: 12 }}>
                    <button
                      onClick={() => setShowPrefs(!showPrefs)}
                      style={{
                        width: '100%', padding: '10px', borderRadius: 50,
                        border: '1px solid var(--theme-primary-soft, rgba(27, 54, 93, 0.30))',
                        background: 'transparent', color: 'var(--theme-primary, #1B365D)',
                        fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                      }}
                    >
                      <span>⚙️</span> {showPrefs ? 'Hide' : 'My Preferences'}
                    </button>

                    {showPrefs && (
                      <div style={{ marginTop: 12, padding: '14px', background: 'var(--theme-surface-subtle, #F1F5F9)', borderRadius: 12, border: '1px solid var(--theme-border, #E2E8F0)' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--theme-primary, #1B365D)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
                          Room Preferences
                        </div>

                        {[
                          { label: 'Room Type', key: 'roomType', options: ['', 'single', 'double', 'suite', 'deluxe'] },
                          { label: 'Floor Level', key: 'floorLevel', options: ['', 'low', 'high', 'any'] },
                          { label: 'Pillow Type', key: 'pillowType', options: ['', 'soft', 'firm', 'any'] },
                          { label: 'Dietary Needs', key: 'dietaryNeeds', options: ['', 'none', 'vegetarian', 'halal', 'vegan'] },
                        ].map(f => (
                          <div key={f.key} style={{ marginBottom: 10 }}>
                            <label style={{ fontSize: 10, fontWeight: 600, color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 4 }}>
                              {f.label}
                            </label>
                            <select
                              className="profile-form-input"
                              style={{ borderRadius: 8, padding: '8px 12px' }}
                              value={preferences[f.key] || ''}
                              onChange={e => setPreferences(prev => ({ ...prev, [f.key]: e.target.value }))}
                            >
                              {f.options.map(o => <option key={o} value={o}>{o || 'Select...'}</option>)}
                            </select>
                          </div>
                        ))}

                        <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                          {[
                            { key: 'extraBlanket', label: '🛏️ Extra Blanket' },
                            { key: 'quietRoom', label: '🔇 Quiet Room' },
                          ].map(f => (
                            <label key={f.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#555', cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={preferences[f.key] || false}
                                onChange={e => setPreferences(prev => ({ ...prev, [f.key]: e.target.checked }))}
                              />
                              {f.label}
                            </label>
                          ))}
                        </div>

                        <div style={{ marginBottom: 12 }}>
                          <label style={{ fontSize: 10, fontWeight: 600, color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 4 }}>
                            Special Notes
                          </label>
                          <textarea
                            className="profile-form-input"
                            style={{ borderRadius: 8, resize: 'none' }}
                            rows={2}
                            placeholder="Any other preferences..."
                            value={preferences.notes || ''}
                            onChange={e => setPreferences(prev => ({ ...prev, notes: e.target.value }))}
                          />
                        </div>

                        <button
                          onClick={handleSavePreferences}
                          disabled={savingPrefs}
                          style={{
                            width: '100%', padding: '9px', borderRadius: 50,
                            border: 'none', background: 'var(--theme-primary-gradient, linear-gradient(135deg, var(--theme-primary, #1B365D), var(--theme-primary-hover, #122642)))',
                            color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer'
                          }}
                        >
                          {savingPrefs ? 'Saving...' : '✓ Save Preferences'}
                        </button>
                      </div>
                    )}
                  </div>
                  {/* STATS */}
                  <div className="profile-stats">
                    <div className="profile-stat-item">
                      <div className="profile-stat-num" style={{ color: "var(--theme-primary, #1B365D)" }}>{bookings.length}</div>
                      <div className="profile-stat-label">Total</div>
                    </div>
                    <div className="profile-stat-item">
                      <div className="profile-stat-num" style={{ color: "#27ae60" }}>
                        {bookings.filter(b => b.bookingStatus === "completed").length}
                      </div>
                      <div className="profile-stat-label">Done</div>
                    </div>
                    <div className="profile-stat-item">
                      <div className="profile-stat-num" style={{ color: "#f39c12" }}>
                        {bookings.filter(b => b.bookingStatus === "pending").length}
                      </div>
                      <div className="profile-stat-label">Pending</div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* ===== RIGHT ===== */}
            <div className="col-lg-8">
              <div className="profile-bookings-card">

                <div className="profile-bookings-header">
                  <div className="profile-bookings-title">
                    <i className="fa-solid fa-calendar-check me-2" style={{ color: "var(--theme-primary, #1B365D)" }}></i>
                    My Bookings
                  </div>

                  <div className="profile-tabs">
                    {tabs.map((tab) => {
                      const count = bookings.filter(tab.filter).length;
                      return (
                        <button
                          key={tab.key}
                          className={`profile-tab-btn ${activeTab === tab.key ? "active" : ""}`}
                          onClick={() => setActiveTab(tab.key)}
                        >
                          {tab.label}
                          {count > 0 && (
                            <span className="profile-tab-count">{count}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="profile-bookings-body">

                 {activeTab === "requests" ? (
                    loadingRequests ? (
                      <div className="profile-empty">
                        <div className="spinner-border" style={{ color: "var(--theme-primary, #1B365D)" }}></div>
                      </div>
                    ) : myRequests.length === 0 ? (
                      <div className="profile-empty">
                        <div className="profile-empty-icon">🛎️</div>
                        <p style={{ color: "#bbb", fontSize: "14px", margin: 0 }}>No requests submitted yet</p>
                      </div>
                    ) : (
                      myRequests.map((req, i) => {
                        const statusColors = {
                          pending:     { color: '#f39c12', bg: 'rgba(243,156,18,0.1)' },
                          in_progress: { color: '#3498db', bg: 'rgba(52,152,219,0.1)' },
                          resolved:    { color: '#27ae60', bg: 'rgba(54,133,104,0.1)' },
                          completed:   { color: '#27ae60', bg: 'rgba(54,133,104,0.1)' },
                          cancelled:   { color: '#CC5B55', bg: 'rgba(231,76,60,0.1)' },
                        };
                        const st = statusColors[req.status || req.cleaningStatus] || statusColors.pending;
                        const statusLabel = (req.status || req.cleaningStatus || 'pending').replace('_', ' ');
                        const dateStr = req.createdAt ? new Date(req.createdAt).toLocaleString('en-PK', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
                        const title = req._type === 'maintenance'
                          ? (req.issueType || 'other').replace('_', ' ')
                          : req._type === 'housekeeping'
                            ? (req.taskType || 'room_cleaning').replace('_', ' ')
                            : (req.serviceType || 'service').replace('_', ' ');
                        const desc = req.issue || req.notes || req.description || '';
                        return (
                          <div key={req._id || i} className="booking-card" style={{ marginBottom: 12 }}>
                            <div style={{ padding: '14px 16px' }}>
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--theme-text-dark, #0F172A)' }}>
                                    {req._icon} {req._label}
                                    <span style={{ fontSize: 12, fontWeight: 500, color: '#aaa', marginLeft: 8, textTransform: 'capitalize' }}>{title}</span>
                                  </div>
                                  <div style={{ fontSize: 11, color: '#bbb', marginTop: 2 }}>{dateStr}</div>
                                </div>
                                <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase', color: st.color, background: st.bg }}>
                                  {statusLabel}
                                </span>
                              </div>
                              {desc && (
                                <div style={{ fontSize: 12, color: '#777', padding: '8px 12px', background: 'var(--theme-surface-subtle, #F1F5F9)', borderRadius: 8, border: '1px solid var(--theme-border, #E2E8F0)' }}>
                                  {desc}
                                </div>
                              )}
                              {req.roomNumber && (
                                <div style={{ fontSize: 11, color: '#bbb', marginTop: 6 }}>
                                  <i className="fa-solid fa-door-open me-1" style={{ color: 'var(--theme-primary, #1B365D)' }}></i>
                                  Room {req.roomNumber}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )
                  ) : loadingBookings ? (
                    <div className="profile-empty">
                      <div className="spinner-border" style={{ color: "var(--theme-primary, #1B365D)" }}></div>
                      <p className="mt-3" style={{ color: "#bbb", fontSize: "13px" }}>Loading bookings...</p>
                    </div>

              ) : filterBookings.length === 0 ? (

                    <div className="profile-empty">
                      <div className="profile-empty-icon">
                        <i className="fa-solid fa-calendar-xmark"></i>
                      </div>
                      <p style={{ color: "#bbb", fontSize: "14px", margin: 0 }}>
                        No bookings in this category
                      </p>
                    </div>

                  ) : (

                    filterBookings.map((booking) => {
                      const st = statusConfig[booking.bookingStatus] || statusConfig.pending;
                      const roomImg = getImageUrl(booking.roomId?.images?.[0]);
                      const isCheckedIn = booking.bookingStatus === "checked_in";

                      return (
                        <div key={booking._id} className="booking-card">
                          <div className="booking-card-inner">

                            <div className="booking-img-wrap">
                              {roomImg ? (
                                <img src={roomImg} alt="room" />
                              ) : (
                                <div className="booking-img-fallback">
                                  <i className="fa-solid fa-bed fa-2x" style={{ color: "var(--theme-primary, #1B365D)", opacity: 0.4 }}></i>
                                </div>
                              )}
                            </div>

                            <div className="booking-details">

                              <div className="d-flex justify-content-between align-items-start mb-1">
                                <div>
                                  <div className="booking-room-name">
                                    {booking.roomId?.name || `Room ${booking.roomId?.roomNumber || ""}`}
                                  </div>
                                  <div className="booking-id">
                                    #{booking._id.slice(-6).toUpperCase()}
                                    {booking.roomId?.type && ` • ${booking.roomId.type.charAt(0).toUpperCase() + booking.roomId.type.slice(1)}`}
                                  </div>
                                </div>
                                <span
                                  className="booking-status-badge"
                                  style={{ color: st.color, background: st.bg }}
                                >
                                  {st.label}
                                </span>
                              </div>

                              <div className="booking-meta-grid">
                                <div className="booking-meta-item">
                                  <div className="booking-meta-label">Check-in</div>
                                  <div className="booking-meta-value" style={{ color: "#27ae60" }}>
                                    {formatDate(booking.checkInDate)}
                                  </div>
                                </div>
                                <div className="booking-meta-item">
                                  <div className="booking-meta-label">Check-out</div>
                                  <div className="booking-meta-value" style={{ color: "#CC5B55" }}>
                                    {formatDate(booking.checkOutDate)}
                                  </div>
                                </div>
                                <div className="booking-meta-item">
                                  <div className="booking-meta-label">Guests</div>
                                  <div className="booking-meta-value">{booking.guests}</div>
                                </div>
                                <div className="booking-meta-item">
                                  <div className="booking-meta-label">Total</div>
                                  <div className="booking-meta-value" style={{ color: "#27ae60" }}>
                                    Rs. {booking.totalAmount?.toLocaleString()}
                                  </div>
                                </div>
                              </div>

                              {booking.specialRequests && (
                                <div className="booking-special-req">
                                  <i className="fa-solid fa-note-sticky me-1" style={{ color: "var(--theme-primary, #1B365D)" }}></i>
                                  {booking.specialRequests}
                                </div>
                              )}

                              <div className="booking-badges mt-2">
                                <span
                                  className="booking-pay-badge"
                                  style={{
                                    color: booking.paymentStatus === "paid" ? "#27ae60" : "#f39c12",
                                    background: booking.paymentStatus === "paid" ? "rgba(54,133,104,0.1)" : "rgba(243,156,18,0.1)",
                                  }}
                                >
                                  <i className={`fa-solid ${booking.paymentStatus === "paid" ? "fa-circle-check" : "fa-clock"} me-1`}></i>
                                  {booking.paymentStatus === "paid" ? "Paid" : "Payment Pending"}
                                </span>
                                <span className="booking-method-badge">
                                  <i className="fa-solid fa-money-bill me-1"></i>
                                  {booking.paymentMethod?.toUpperCase()}
                                </span>
{/* ── SELF CHECK-IN (only on/after check-in date) ── */}
                                {['confirmed', 'pending'].includes(booking.bookingStatus) && (() => {
                                  const today = new Date();
                                  today.setHours(0, 0, 0, 0);
                                  const cin = new Date(booking.checkInDate);
                                  cin.setHours(0, 0, 0, 0);
                                  const canSelfCheckIn = cin <= today;
                                  const cinLabel = cin.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });
                                  if (!canSelfCheckIn) {
                                    return (
                                      <span
                                        className="booking-method-badge"
                                        title={`Self check-in opens on ${cinLabel}`}
                                        style={{ opacity: 0.85 }}
                                      >
                                        <i className="fa-solid fa-calendar-day me-1"></i>
                                        Check-in from {cinLabel}
                                      </span>
                                    );
                                  }
                                  return (
                                  <button
                                    className="btn order-now-btn"
                                    style={{ background: 'linear-gradient(135deg, #1a3a2a, #1e5a3e)' }}
                                    onClick={() => {
                                      setConfirmModal({
                                        show: true,
                                        title: 'Confirm Check-in',
                                        message: 'Are you ready to check in now? This will mark your stay as active.',
                                        confirmText: 'Yes, Check-in Now',
                                        danger: false,
                                        onConfirm: async () => {
                                          setConfirmModal({ show: false });
                                          try {
                                            await apiCall(token, refreshAccessToken, (t) =>
                                              axios.post(`${BASE_URL}/bookings/qr-checkin`, { bookingId: booking._id }, { headers: { Authorization: `Bearer ${t}` } })
                                            );
                                            showPopup('success', 'Check-in successful! Welcome to the hotel 🏨');
                                            setBookings(prev => prev.map(b =>
                                              b._id === booking._id ? { ...b, bookingStatus: 'checked_in' } : b
                                            ));
                                          } catch (err) {
                                            showPopup('error', err.response?.data?.message || 'Check-in failed');
                                          }
                                        },
                                      });
                                    }}
                                  >
                                    <i className="fa-solid fa-door-open" style={{ fontSize: '10px' }}></i>
                                    Check-in Now
                                  </button>
                                  );
                                })()}
                                {/* ── ORDER NOW BUTTON (only for checked_in) ── */}
                                {isCheckedIn && (
                                  <button
                                    className="btn order-now-btn"
                                    onClick={() => setOrderModalBooking(booking)}
                                  >
                                    <i className="fa-solid fa-utensils" style={{ fontSize: "10px" }}></i>
                                    Order Now
                                  </button>
                                )}

                                {/* ── REQUEST SERVICE BUTTON (only for checked_in) ── */}
                                {isCheckedIn && (
                                  <button
                                    className="btn order-now-btn"
                                    style={{ background: 'linear-gradient(135deg, #1a2a1a, #1e3a1e)' }}
                                    onClick={() => setGuestRequestBooking(booking)}
                                  >
                                    <i className="fa-solid fa-bell-concierge" style={{ fontSize: "10px" }}></i>
                                    Request Service
                                  </button>
                                )}

                                {/* ── DOWNLOAD INVOICE BUTTON (only for paid bookings) ── */}
                                {booking.paymentStatus === 'paid' && (
                                  <button
                                    className="btn order-now-btn"
                                    style={{ background: 'linear-gradient(135deg, #2a2a4a, #3a3a6b)' }}
                                    onClick={async () => {
                                      try {
                                        const response = await apiCall(token, refreshAccessToken, (t) =>
                                          axios.get(`${BASE_URL}/bookings/${booking._id}/invoice`, {
                                            headers: { Authorization: `Bearer ${t}` },
                                            responseType: 'blob',
                                          })
                                        );
                                        const url = window.URL.createObjectURL(new Blob([response.data]));
                                        const link = document.createElement('a');
                                        link.href = url;
                                        link.setAttribute('download', `Invoice-${booking._id.slice(-8).toUpperCase()}.pdf`);
                                        document.body.appendChild(link);
                                        link.click();
                                        link.remove();
                                        window.URL.revokeObjectURL(url);
                                      } catch (err) {
                                        showPopup('error', 'Failed to download invoice');
                                      }
                                    }}
                                  >
                                    <i className="fa-solid fa-file-invoice" style={{ fontSize: '10px' }}></i>
                                    Download Invoice
                                  </button>
                                )}

                                {/* ── EMAIL INVOICE BUTTON (PDF attachment, once per guest) ── */}
                                {booking.paymentStatus === 'paid' && (
                                  <button
                                    className="btn"
                                    style={{
                                      background: 'linear-gradient(135deg, #3a6ea5, #2a4d7a)',
                                      color: '#fff', border: 'none',
                                    }}
                                    onClick={async () => {
                                      try {
                                        const response = await apiCall(token, refreshAccessToken, (t) =>
                                          axios.post(`${BASE_URL}/bookings/${booking._id}/invoice/email`, {}, {
                                            headers: { Authorization: `Bearer ${t}` },
                                          })
                                        );
                                        showPopup('success', response.data?.message || 'Invoice emailed to you.');
                                      } catch (err) {
                                        showPopup('error', err.response?.data?.message || 'Failed to email invoice');
                                      }
                                    }}
                                  >
                                    <i className="fa-solid fa-envelope" style={{ fontSize: '10px' }}></i>
                                    Email Invoice
                                  </button>
                                )}

                                {/* ── LEAVE FEEDBACK BUTTON (only checked-out/completed, not already reviewed) ── */}
                                {["checked_out", "completed"].includes(booking.bookingStatus) && !booking.feedbackGiven && (
                                  <button
                                    className="btn"
                                    style={{
                                      background: "var(--theme-primary-gradient, linear-gradient(135deg, var(--theme-primary, #1B365D), var(--theme-primary-hover, #122642)))",
                                      color: "#fff", border: "none",
                                    }}
                                    onClick={() => setFeedbackModalBooking(booking)}
                                  >
                                    <i className="fa-solid fa-star" style={{ fontSize: '10px' }}></i>
                                    Leave Feedback
                                  </button>
                                )}

                                {/* ── CANCEL BUTTON (only pending/confirmed) ── */}
                                {['pending', 'confirmed'].includes(booking.bookingStatus) && (
                                  <button
                                    className="btn order-now-btn"
                                    style={{ background: 'linear-gradient(135deg, #4a1a1a, #6b2020)' }}
                                    onClick={() => handleCancelBooking(booking._id)}
                                  >
                                    <i className="fa-solid fa-xmark" style={{ fontSize: "10px" }}></i>
                                    Cancel Booking
                                  </button>
                                )}
                              </div>

                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}