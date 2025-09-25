// components/CookieBanner.tsx
import { useState, useEffect } from "react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookie_consent", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-700 text-white p-3 text-center text-sm z-50">
      <span>
        We use cookies and local storage only for analytics to improve your
        gameplay experience.{" "}
        <a
          href="/privacy-policy"
          className="text-gray-950 font-bold px-1 rounded"
        >
          Learn more
        </a>
      </span>
      <button
        onClick={acceptCookies}
        className="ml-3 bg-yellow-400 border-none px-3 py-1 rounded font-bold cursor-pointer"
      >
        Accept
      </button>
    </div>
  );
}
