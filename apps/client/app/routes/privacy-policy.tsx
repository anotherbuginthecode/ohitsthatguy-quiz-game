import Header from "~/components/Header";

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <div className="p-6 max-w-3xl mx-auto overflow-y-scroll h-[80vh] mt-20">
        <h1 className="text-3xl font-bold mb-4">Privacy and Cookie Policy</h1>

        <ul className="list-disc list-inside mb-4">
          <li>
            <span className="font-bold">Effective Date</span>: 2025-25-09
          </li>
          <li>
            <span className="font-bold">Last Updated</span>: 2025-25-09
          </li>
        </ul>
        <hr className="my-4" />

        <p className="mb-4">
          This Privacy Policy explains how we collect, use, and protect your
          personal information when you use our application.
        </p>
        <h2 className="text-2xl font-semibold mb-2">1. Introduction</h2>
        <p className="mb-4">
          Welcome to <span className="font-bold">Oh, It’s That Guy!</span> (the
          “Game” or “WebApp”). We respect your privacy and are committed to
          protecting the information we collect about you. This Privacy & Cookie
          Policy explains how we collect, use, and safeguard data when you use
          our game.
          <br />
          <br />
          By accessing or using the Game, you agree to this Policy.
        </p>
        <h2 className="text-2xl font-semibold mb-2">2. Data We Collect</h2>
        <p>
          We do <span className="font-bold">not</span> collect personally
          identifiable information (such as name, email, or login). The only
          data we collect is:
        </p>
        <ul className="list-disc list-inside mb-4">
          <li>
            <span className="font-bold">Usage Data</span>: interactions with the
            game (e.g., game start, game finish, quit, answers submitted).
          </li>
          <li>
            <span className="font-bold">Technical Data</span>: browser type,
            approximate location (country/city), device type.
          </li>
          <li>
            <span className="font-bold">Retention Data</span>: anonymous signals
            to understand if users return after 1, 3, 7, or 14 days.
          </li>
        </ul>
        <p>
          All tracking is performed anonymously through cookies or local storage
          IDs and cannot identify you personally.
        </p>
        <h2 className="text-2xl font-semibold mb-2 mt-4">
          3. Purpose of Data Collection
        </h2>
        <p className="mb-4">
          We use the collected data only for the following purposes:
        </p>
        <ul className="list-disc list-inside mb-4">
          <li>To analyze game performance and player behavior.</li>
          <li>To measure retention and engagement of the game.</li>
          <li>To improve the user experience and design new features.</li>
        </ul>
        <p>
          We do not use the data for targeted advertising or share it with third
          parties for marketing purposes.
        </p>
        <h2 className="text-2xl font-semibold mb-2 mt-4">
          4. Cookies and Local Storage
        </h2>
        <p className="mb-4">The Game uses cookies and/or local storage to:</p>
        <ul className="list-disc list-inside mb-4">
          <li>
            Remember an anonymous identifier for analytics (anonymous ID).
          </li>
          <li>Track whether you are a returning user.</li>
        </ul>
        <p>
          You can disable cookies through your browser settings, but some
          analytics features may not function properly.
        </p>
        <h2 className="text-2xl font-semibold mb-2 mt-4">
          5. Data Sharing and Third Parties
        </h2>
        <p className="mb-4">
          We do not sell or share your data with advertisers. We may use
          third-party analytics providers (such as Google Analytics) to help us
          understand aggregated usage patterns. These providers process data in
          compliance with their own privacy policies.
        </p>
        <h2 className="text-2xl font-semibold mb-2 mt-4">6. Data Retention</h2>
        <p className="mb-4">
          We retain anonymous analytics data for as long as necessary to analyze
          usage trends and improve the Game. No personal data is stored.
        </p>
        <h2 className="text-2xl font-semibold mb-2 mt-4">
          7. User Rights (GDPR/CCPA)
        </h2>
        <p className="mb-4">
          Depending on your location, you may have the following rights:
        </p>
        <ul className="list-disc list-inside mb-4">
          <li>
            <span className="font-bold">Right of access</span>: to know what
            data is collected.
          </li>
          <li>
            <span className="font-bold">Right to erasure</span>: to request
            deletion of your data.
          </li>
          <li>
            <span className="font-bold">Right to object</span>: to refuse data
            collection (by disabling cookies).
          </li>
        </ul>
        <p>
          To exercise your rights, contact us at:{" "}
          <a
            href="alessandromangone.dev@gmail.com"
            className="text-yellow-500 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            alessandromangone.dev@gmail.com
          </a>
          .
        </p>

        <h2 className="text-2xl font-semibold mb-2 mt-4">8. Security</h2>
        <p className="mb-4">
          We use appropriate technical and organizational measures to protect
          anonymous data. However, since no personal data is collected, the risk
          of exposure is minimal.
        </p>
        <h2 className="text-2xl font-semibold mb-2 mt-4">
          9. Changes to this Policy
        </h2>
        <p className="mb-4">
          We may update this Privacy & Cookie Policy from time to time. Any
          updates will be published on this page with a revised “Last Updated”
          date.
        </p>

        <h2 className="text-2xl font-semibold mb-2">10. Contact Us</h2>
        <p>
          If you have any questions or concerns about this Privacy Policy,
          please contact us at
          <a
            href="alessandromangone.dev@gmail.com"
            className="text-yellow-500 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            alessandromangone.dev@gmail.com
          </a>
          .
        </p>
      </div>
    </>
  );
}
