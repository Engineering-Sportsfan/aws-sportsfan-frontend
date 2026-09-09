"use client";

import React, { useState, useEffect } from "react";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TermsModal({ isOpen, onClose }: TermsModalProps) {
  const [activeTab, setActiveTab] = useState<"terms" | "privacy" | "security">("terms");

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className="relative z-10 w-full max-w-2xl bg-[#1a1a1d] border border-white/10 rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] flex flex-col max-h-[88vh] overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#161618]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-white font-semibold text-lg sm:text-xl">Terms &amp; Policies</h2>
              <span className="bg-orange-500/20 text-orange-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Beta
              </span>
            </div>
            <p className="text-gray-400 text-xs mt-0.5">SportsFan360 Beta Program</p>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-[#141416] px-4 pt-2 gap-2 text-xs sm:text-sm overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("terms")}
            className={`pb-2.5 px-3 font-medium transition whitespace-nowrap border-b-2 cursor-pointer ${
              activeTab === "terms"
                ? "border-orange-500 text-white"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            Terms &amp; Conditions
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("privacy")}
            className={`pb-2.5 px-3 font-medium transition whitespace-nowrap border-b-2 cursor-pointer ${
              activeTab === "privacy"
                ? "border-orange-500 text-white"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            Privacy Policy
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("security")}
            className={`pb-2.5 px-3 font-medium transition whitespace-nowrap border-b-2 cursor-pointer ${
              activeTab === "security"
                ? "border-orange-500 text-white"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            Security Policy
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 text-gray-300 text-xs sm:text-sm leading-relaxed space-y-4">
          {activeTab === "terms" && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs">
                <strong>Notice:</strong> SportsFan360 is currently in active beta. Features, rules, and data structures may evolve, reset, or change at any time.
              </div>

              <div>
                <h3 className="text-white font-semibold text-sm mb-1">1. Beta Program Notice</h3>
                <p className="text-gray-400">
                  SportsFan360 (&ldquo;the App&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) is currently in active development and beta testing. Features, functionality, and data structures may change, be added, or be removed without prior notice. The App is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; during this beta period, without warranties of any kind, express or implied.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold text-sm mb-1">2. Acceptance of Terms</h3>
                <p className="text-gray-400">
                  By creating an account or using SportsFan360, you agree to these Terms &amp; Conditions, our Privacy Policy, and our Security Policy. If you do not agree, please do not use the App.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold text-sm mb-1">3. Eligibility</h3>
                <p className="text-gray-400">
                  You must be at least 13 years old to use SportsFan360. If you are using the App on behalf of an organization, you confirm you have authority to bind that organization to these terms.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold text-sm mb-1">4. Beta Limitations</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-400">
                  <li><strong>No uptime guarantee:</strong> Features (ROAR rooms, predictions, debates, watch-along, notifications) may be interrupted, reset, or discontinued during beta.</li>
                  <li><strong>Data may be reset:</strong> Points, badges, reputation, chat history, or profile data may be wiped during beta updates without notice.</li>
                  <li><strong>No liability for beta bugs:</strong> We are not liable for loss of data, points, or content due to beta instability.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-semibold text-sm mb-1">5. User Accounts</h3>
                <p className="text-gray-400">
                  You are responsible for maintaining the confidentiality of your account credentials. You may not impersonate another person, team, athlete, or entity. We reserve the right to suspend or terminate accounts that violate these terms, engage in abuse, harassment, spam, or manipulate points/leaderboards/predictions.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold text-sm mb-1">6. User-Generated Content (Posts, Predictions, Debates, Chat)</h3>
                <p className="text-gray-400 mb-1">
                  You retain ownership of content you post, but grant SportsFan360 a worldwide, royalty-free license to display, distribute, and use that content within the App (including in aggregated/anonymized form for analytics).
                </p>
                <p className="text-gray-400">
                  You agree not to post content that is defamatory, hateful, harassing, sexually explicit, illegal, or infringes third-party IP (including unauthorized use of team logos, player likenesses, or copyrighted broadcast content). We may moderate, remove, or restrict content/accounts at our discretion.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold text-sm mb-1">7. Sports Data &amp; Third-Party Content</h3>
                <p className="text-gray-400">
                  Match scores, player stats, schedules, and related sports data may be sourced from third-party providers and are provided for informational purposes only. We do not guarantee accuracy, completeness, or real-time correctness. Team and league trademarks belong to their respective owners; SportsFan360 claims no ownership over them.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold text-sm mb-1">8. Predictions, Points, Badges &amp; Rewards</h3>
                <p className="text-gray-400">
                  Points, badges, ranks, and reputation scores are for entertainment purposes only. They hold no monetary value and are not redeemable for cash or prizes unless explicitly stated otherwise in a specific promotion. We reserve the right to adjust, reset, or recalculate points/badges at any time.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold text-sm mb-1">9. Prohibited Conduct</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-400">
                  <li>Use bots, scripts, or automation to manipulate predictions, debates, or leaderboards.</li>
                  <li>Attempt to reverse-engineer, scrape, or exploit the App.</li>
                  <li>Upload malware or attempt unauthorized access to other accounts or systems.</li>
                  <li>Use the App for gambling or betting where prohibited by local law.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-semibold text-sm mb-1">10. Termination &amp; Disclaimers</h3>
                <p className="text-gray-400 mb-2">
                  We may suspend or terminate your access at any time, with or without cause, particularly during beta, without liability.
                </p>
                <p className="text-gray-400 text-xs uppercase tracking-wide">
                  THE APP IS PROVIDED &ldquo;AS IS&rdquo; WITHOUT WARRANTY OF ANY KIND. TO THE MAXIMUM EXTENT PERMITTED BY LAW, SPORTSFAN360 SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES.
                </p>
              </div>

              <div className="pt-2 text-gray-400 text-xs">
                Questions? Contact us at: <a href="mailto:support@sportsfan360.com" className="text-orange-400 underline">support@sportsfan360.com</a>
              </div>
            </div>
          )}

          {activeTab === "privacy" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-white font-semibold text-sm mb-1">What We Collect</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-400">
                  <li><strong>Account info:</strong> Name, username, email address, profile avatar.</li>
                  <li><strong>Usage data:</strong> Posts, predictions, debates, room activity, reactions, and interactions.</li>
                  <li><strong>Device/technical data:</strong> IP address, device type, app version (used for debugging beta issues).</li>
                  <li><strong>Optional preferences:</strong> Favorite teams, sports, and athletes.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-semibold text-sm mb-1">How We Use It</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-400">
                  <li>To operate core features (rooms, predictions, watch-alongs, notifications, leaderboards).</li>
                  <li>To debug and continuously improve the App during the beta program.</li>
                  <li>To personalize your feed, recommendations, and sports content.</li>
                  <li><strong>We do not sell your personal data to third parties.</strong></li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-semibold text-sm mb-1">Data Sharing</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-400">
                  <li>Third-party sports data providers (for scores and stats) — no personal data is shared with them.</li>
                  <li>Cloud infrastructure providers (e.g., AWS) for hosting — data is processed under strict cloud security agreements.</li>
                  <li>Compliance with legal obligations where required by law.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-semibold text-sm mb-1">Data Retention &amp; Beta Resets</h3>
                <p className="text-gray-400">
                  Because this is a beta environment, data (including profile info, points, and activity history) may be periodically reset, pruned, or migrated as the App evolves.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold text-sm mb-1">Your Rights &amp; Children&apos;s Privacy</h3>
                <p className="text-gray-400 mb-2">
                  You can request access, correction, or deletion of your data at any time by contacting <a href="mailto:support@sportsfan360.com" className="text-orange-400 underline">support@sportsfan360.com</a>.
                </p>
                <p className="text-gray-400 text-xs">
                  SportsFan360 is not intended for children under 13. We do not knowingly collect personal information from children under 13.
                </p>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-white font-semibold text-sm mb-1">Our Security Practices</h3>
                <p className="text-gray-400">
                  We use industry-standard practices, including encrypted transit via HTTPS/TLS, credential hashing, and strict role-based access controls to safeguard your account.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-xs">
                <strong>Beta Security Notice:</strong> As an actively developed beta product, security measures and configurations are continuously being hardened. Please do not upload sensitive personal, confidential, or financial information.
              </div>

              <div>
                <h3 className="text-white font-semibold text-sm mb-1">Password &amp; Credential Protection</h3>
                <p className="text-gray-400">
                  User passwords and session credentials are never stored in plaintext and are securely hashed using modern cryptographic algorithms.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold text-sm mb-1">Responsible Disclosure</h3>
                <p className="text-gray-400">
                  If you discover a security vulnerability or bug, we appreciate responsible disclosure. Please report it directly to:{" "}
                  <a href="mailto:security@sportsfan360.com" className="text-orange-400 underline">
                    security@sportsfan360.com
                  </a>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/10 bg-[#161618] flex items-center justify-between">
          <span className="text-gray-500 text-[11px]">Last updated: March 2026</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
