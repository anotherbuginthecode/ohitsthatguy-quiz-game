export default function GiveAFeedbackBanner() {
  return (
    <div
      className="bg-indigo-200 border-t border-b border-indigo-500 text-indigo-700 px-4 py-3"
      role="alert"
    >
      <p className="font-bold">Enjoying the game?</p>
      <p className="text-sm">
        Help me make <span className="italic">Oh It’s That Guy!</span> even
        better <br />
        Share your thoughts in this quick form — it only takes 1 minute and your
        feedback shapes the next features!
      </p>
      <a
        href="https://tally.so/r/3NkWbl"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block bg-indigo-500 text-white px-3 py-1 rounded hover:bg-blue-700"
      >
        Take the Survey
      </a>
    </div>
  );
}
