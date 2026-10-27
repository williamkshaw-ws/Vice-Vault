/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from "react";
import { X, ShieldCheck, FileText } from "lucide-react";

export type LegalDocType = "privacy" | "terms";

export const LEGAL_EFFECTIVE_DATE = "October 27, 2026";
export const LEGAL_CONTACT_EMAIL = "support@golfballvault.app";

interface LegalPageProps {
  type: LegalDocType;
  /** "page" renders a full standalone page (used for /privacy and /terms URLs).
   *  "modal" renders an in-app overlay (used from the footer, incl. the iOS app). */
  variant?: "page" | "modal";
  onClose?: () => void;
  onSwitch?: (type: LegalDocType) => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="space-y-2">
    <h2 className="text-sm font-black text-white uppercase tracking-wider">{title}</h2>
    <div className="text-sm text-neutral-300 leading-relaxed space-y-2">{children}</div>
  </section>
);

const List: React.FC<{ items: React.ReactNode[] }> = ({ items }) => (
  <ul className="list-disc pl-5 space-y-1">
    {items.map((item, i) => (
      <li key={i}>{item}</li>
    ))}
  </ul>
);

const Mail = () => (
  <a href={`mailto:${LEGAL_CONTACT_EMAIL}`} className="text-accent hover:underline">
    {LEGAL_CONTACT_EMAIL}
  </a>
);

function PrivacyContent() {
  return (
    <>
      <p className="text-sm text-neutral-300 leading-relaxed">
        This Privacy Policy explains how Golf Ball Vault ("Golf Ball Vault", "we", "us") collects, uses, and
        protects your information when you use the Golf Ball Vault website at golfballvault.app and the Golf Ball
        Vault iOS app (together, the "Service").
      </p>

      <Section title="1. Information We Collect">
        <p><strong className="text-white">Account information</strong> you provide when you register:</p>
        <List
          items={[
            "Email address",
            "Username and display name",
            "Password (stored only in hashed form — we never store or see your plain-text password)",
            "Profile preferences such as avatar selection and accent color"
          ]}
        />
        <p><strong className="text-white">Content you create</strong> in the Service:</p>
        <List
          items={[
            "Your ball locker / collection (ball models, colors, quantities, notes, dates)",
            "Photos you upload of your golf balls, sleeves, or boxes",
            "Round tracker data (active rounds, round history, and stats you enter)",
            "Wishlist items",
            "Friends list and friend requests",
            "Settings such as bag sharing and leaderboard participation"
          ]}
        />
        <p>
          <strong className="text-white">Technical information:</strong> our servers process standard request
          data such as IP address and request timestamps for security, rate limiting, and abuse prevention.
        </p>
        <p>
          We do <strong className="text-white">not</strong> collect your precise location, contacts, health data,
          or advertising identifiers, and we do not use third-party analytics or advertising trackers.
        </p>
      </Section>

      <Section title="2. How We Use Your Information">
        <List
          items={[
            "To create and secure your account and let you sign in",
            "To store and sync your locker, wishlist, and rounds across your devices",
            "To provide social features you choose to use (friends, shared bags, leaderboard)",
            "To send account-related emails such as email verification and password resets",
            "To maintain, secure, and improve the Service and prevent abuse"
          ]}
        />
        <p>We do not sell your personal information, and we do not use it for advertising.</p>
      </Section>

      <Section title="3. What Other Users Can See">
        <List
          items={[
            "Your username, display name, and avatar may be visible to other users (for example when they send you a friend request).",
            "Friends you accept can view your ball locker and wishlist.",
            "If you enable bag sharing, anyone with your share link can view your locker.",
            "If you opt in to the leaderboard, your username, display name, avatar, and collection totals are shown publicly.",
            "Your email address is never shown to other users."
          ]}
        />
      </Section>

      <Section title="4. Service Providers">
        <p>We rely on trusted third parties to operate the Service. They process data only on our behalf:</p>
        <List
          items={[
            "Google Firebase (Authentication, Cloud Firestore, Cloud Storage) — account and data storage",
            "Render — application hosting",
            "Resend — delivery of transactional emails (verification and password reset)",
            "ImgBB — image hosting for photos you upload. Uploaded photos are stored at an unlisted URL; anyone with that URL may be able to view the image, so please avoid uploading images containing personal information.",
            "Google Fonts and DiceBear — fonts and default avatar graphics"
          ]}
        />
        <p>We may also disclose information if required by law or to protect the rights and safety of our users.</p>
      </Section>

      <Section title="5. Data Stored on Your Device">
        <p>
          The Service stores a copy of your data on your device (browser localStorage / IndexedDB, or app storage on
          iOS) so it loads quickly and works offline. This data is scoped to your account and is cleared when you
          sign out or delete the app. We do not use advertising cookies.
        </p>
      </Section>

      <Section title="6. Data Retention & Account Deletion">
        <p>
          We keep your information for as long as your account is active. You can permanently delete your account
          at any time from within the Service (Profile Settings → Delete Account). Deleting your account removes
          your profile, locker, wishlist, round history, and friends data from our systems and deletes your login
          credentials. Residual copies in backups are removed in the ordinary course of backup rotation.
        </p>
        <p>You can also request deletion or a copy of your data by emailing <Mail />.</p>
      </Section>

      <Section title="7. Security">
        <p>
          We use industry-standard safeguards including HTTPS encryption in transit, hashed passwords, access
          controls that limit each account to its own data, and rate limiting. No method of transmission or storage
          is 100% secure, but we work to protect your information.
        </p>
      </Section>

      <Section title="8. Your Rights">
        <p>
          Depending on where you live, you may have the right to access, correct, export, or delete your personal
          information, or to object to certain processing. Most of this can be done directly in the app; for
          anything else contact us at <Mail /> and we will respond within a reasonable time.
        </p>
      </Section>

      <Section title="9. Children's Privacy">
        <p>
          The Service is not directed to children under 13, and we do not knowingly collect personal information
          from children under 13. If you believe a child has provided us with information, contact us and we will
          delete it.
        </p>
      </Section>

      <Section title="10. Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. When we do, we will update the effective date above
          and, for material changes, notify you within the Service.
        </p>
      </Section>

      <Section title="11. Contact Us">
        <p>Questions about this policy or your data? Email <Mail />.</p>
      </Section>
    </>
  );
}

function TermsContent() {
  return (
    <>
      <p className="text-sm text-neutral-300 leading-relaxed">
        These Terms of Service ("Terms") govern your use of the Golf Ball Vault website at golfballvault.app and the
        Golf Ball Vault iOS app (together, the "Service"). By creating an account or using the Service, you agree to
        these Terms.
      </p>

      <Section title="1. The Service">
        <p>
          Golf Ball Vault is a personal collection tracker that lets you catalog golf balls you own, track rounds,
          maintain a wishlist, and optionally share your collection with friends.
        </p>
      </Section>

      <Section title="2. Not Affiliated With Any Brand">
        <p>
          Golf Ball Vault is an independent, fan-made application. It is not affiliated with, endorsed by, or
          sponsored by Vice Golf, Vice Sporting Goods GmbH, or any other golf manufacturer. All product names,
          logos, images, and trademarks are the property of their respective owners and are used for identification
          purposes only.
        </p>
      </Section>

      <Section title="3. Your Account">
        <List
          items={[
            "You must be at least 13 years old to create an account.",
            "You agree to provide accurate information and keep your login credentials secure.",
            "You are responsible for activity that occurs under your account.",
            "You may delete your account at any time from within the Service."
          ]}
        />
      </Section>

      <Section title="4. Your Content">
        <p>
          You keep ownership of the content you add to the Service (such as photos, notes, and collection data).
          You grant us a limited, non-exclusive license to host, store, display, and process that content solely to
          operate and provide the Service to you and to the people you choose to share it with.
        </p>
        <p>You are responsible for your content and confirm you have the right to upload it.</p>
      </Section>

      <Section title="5. Acceptable Use">
        <p>You agree not to:</p>
        <List
          items={[
            "Upload content that is unlawful, offensive, harassing, sexually explicit, or infringes anyone's rights",
            "Use usernames, display names, or avatars that impersonate others or are offensive",
            "Harass, spam, or abuse other users",
            "Attempt to access other users' accounts or data, or interfere with the Service's security",
            "Scrape, reverse engineer, or overload the Service, or use it for any unlawful purpose"
          ]}
        />
        <p>
          We may remove content or suspend or terminate accounts that violate these Terms. To report objectionable
          content or abusive users, email <Mail />; we review reports and act on them promptly.
        </p>
      </Section>

      <Section title="6. Catalog Information">
        <p>
          Catalog data (ball names, release years, rarity, production counts, images) is compiled for reference and
          may be incomplete or inaccurate. Nothing in the Service is an appraisal, valuation, or guarantee of
          authenticity.
        </p>
      </Section>

      <Section title="7. Availability & Changes">
        <p>
          We may modify, suspend, or discontinue any part of the Service at any time. We will try to give reasonable
          notice of significant changes. We recommend keeping your own copy of important data using the export
          feature.
        </p>
      </Section>

      <Section title="8. Disclaimers">
        <p>
          The Service is provided "as is" and "as available" without warranties of any kind, express or implied,
          including fitness for a particular purpose and non-infringement. We do not guarantee that the Service will
          be uninterrupted, error-free, or that data will never be lost.
        </p>
      </Section>

      <Section title="9. Limitation of Liability">
        <p>
          To the maximum extent permitted by law, Golf Ball Vault and its operators will not be liable for any
          indirect, incidental, special, consequential, or punitive damages, or any loss of data, arising from your
          use of the Service. Our total liability for any claim will not exceed the amount you paid us to use the
          Service in the twelve months before the claim (the Service is currently free).
        </p>
      </Section>

      <Section title="10. Apple App Store Terms">
        <p>If you downloaded the Service from the Apple App Store, you also acknowledge that:</p>
        <List
          items={[
            "These Terms are between you and Golf Ball Vault, not Apple Inc. Apple is not responsible for the app or its content.",
            "Apple has no obligation to provide maintenance or support for the app.",
            "Apple is not responsible for addressing any claims relating to the app, including product liability, legal or regulatory compliance, or intellectual property infringement claims.",
            "Apple and its subsidiaries are third-party beneficiaries of these Terms and may enforce them against you.",
            "Your use of the app must also comply with the Apple Media Services Terms and Conditions."
          ]}
        />
      </Section>

      <Section title="11. Privacy">
        <p>
          Our Privacy Policy explains how we collect and use your information and is part of these Terms.
        </p>
      </Section>

      <Section title="12. Changes to These Terms">
        <p>
          We may update these Terms from time to time. We will update the effective date above, and continued use of
          the Service after changes take effect means you accept the updated Terms.
        </p>
      </Section>

      <Section title="13. Contact">
        <p>Questions about these Terms? Email <Mail />.</p>
      </Section>
    </>
  );
}

export default function LegalPage({ type, variant = "modal", onClose, onSwitch }: LegalPageProps) {
  const isPrivacy = type === "privacy";
  const title = isPrivacy ? "Privacy Policy" : "Terms of Service";

  useEffect(() => {
    if (variant === "page") {
      document.title = `${title} — Golf Ball Vault`;
    }
  }, [variant, title]);

  useEffect(() => {
    if (variant !== "modal" || !onClose) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [variant, onClose]);

  const handleSwitch = (e: React.MouseEvent, next: LegalDocType) => {
    if (onSwitch) {
      e.preventDefault();
      onSwitch(next);
    }
  };

  const body = (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 shrink-0 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
          {isPrivacy ? <ShieldCheck size={20} /> : <FileText size={20} />}
        </div>
        <div>
          <h1 className="text-lg font-black text-white uppercase tracking-wider">{title}</h1>
          <p className="text-xs text-neutral-500 font-mono mt-0.5">Effective {LEGAL_EFFECTIVE_DATE}</p>
        </div>
      </div>

      {isPrivacy ? <PrivacyContent /> : <TermsContent />}

      <div className="pt-4 border-t border-neutral-850 flex flex-wrap items-center gap-4 text-xs font-mono">
        <a
          href={isPrivacy ? "/terms" : "/privacy"}
          onClick={(e) => handleSwitch(e, isPrivacy ? "terms" : "privacy")}
          className="text-accent hover:underline"
        >
          View {isPrivacy ? "Terms of Service" : "Privacy Policy"} →
        </a>
        {variant === "page" && (
          <a href="/" className="text-neutral-400 hover:text-white">
            ← Back to Golf Ball Vault
          </a>
        )}
      </div>
    </div>
  );

  if (variant === "page") {
    return (
      <div className="min-h-screen bg-neutral-950 text-white">
        <div className="max-w-3xl mx-auto px-5 py-10 pt-[max(2.5rem,env(safe-area-inset-top))]">
          <a href="/" className="inline-block mb-8 text-sm font-black uppercase tracking-widest text-white">
            ⛳ Golf Ball Vault
          </a>
          {body}
          <p className="mt-10 text-[10px] text-neutral-600 font-mono">© 2026 Golf Ball Vault.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-neutral-900 border border-neutral-800 sm:rounded-2xl rounded-t-2xl w-full max-w-2xl max-h-[92vh] sm:max-h-[85vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end p-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:pt-3 border-b border-neutral-850">
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1.5 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto px-5 sm:px-6 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">{body}</div>
      </div>
    </div>
  );
}
