import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { IoDocumentTextOutline } from "react-icons/io5";
import { useAnalytics } from "@keiko-app/react-google-analytics";
import { sendAnalyticsEvent } from "~/lib/ga-tracker";

export default function HowToPlayDialog() {
  const { tracker } = useAnalytics();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          onClick={() => {
            sendAnalyticsEvent(tracker, "how_to_play", {
              action: "how_to_play",
              category: "engagement",
              label: "user opened how to play dialog",
              sessionid: localStorage.getItem("anonymousId") || "unknown",
              deviceid: localStorage.getItem("anonymous_device") || "unknown",
            });
          }}
          className="text-white hover:bg-yellow-300 hover:text-gray-950 w-fit cursor-pointer"
        >
          How to Play <span className="ml-1">📝</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg sm:max-w-2xl bg-gray-950 text-white border border-white/10 rounded-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl sm:text-3xl font-bold mb-2 tracking-tight">
            🎬 How to Play – Oh it’s that guy!
          </DialogTitle>
        </DialogHeader>

        <div className="h-full overflow-hidden">
          <div className="space-y-6 text-sm sm:text-base leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold mb-1">🍿 The Concept</h2>
              <p>
                You know that feeling when you see an actor and think,
                <em className="text-yellow-300">
                  {" "}
                  “Wait... where have I seen this guy before?”
                </em>
              </p>
              <p className="mt-2">
                <strong>Oh it’s that guy!</strong> is a fast-paced movie quiz
                where speed and memory are everything. Spot the actor, recall
                the movie, and climb the ranks of true cinephiles.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-semibold mb-2">Game Modes</h2>

              <div className="mb-4">
                <h3 className="text-lg font-semibold">
                  🎬 Standard Edition (Quick Mode)
                </h3>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>5 actors, 30 seconds total</li>
                  <li>1 correct movie out of 3 options</li>
                  <li>Score = accuracy + speed</li>
                  <li>Wrong answers cost you time (-3s)</li>
                </ul>
                <p className="mt-2 italic text-neutral-400">
                  Simple, addictive, and perfect for quick play sessions.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold">
                  🎥 Director’s Cut (Full Challenge)
                </h3>
                {/* <p className="mt-1">
                  Unlocked after <strong>3 games</strong> or scoring{" "}
                  <strong>800+ points</strong>. Ten rounds. Three challenge
                  types. Zero time to breathe.
                </p> */}
                <table className="w-full text-sm mt-3 border-collapse border border-neutral-700">
                  <thead>
                    <tr className="bg-neutral-800">
                      <th className="border border-neutral-700 px-2 py-1 text-left">
                        Type
                      </th>
                      <th className="border border-neutral-700 px-2 py-1 text-left">
                        Rounds
                      </th>
                      <th className="border border-neutral-700 px-2 py-1 text-left">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-neutral-700 px-2 py-1">
                        🎭 Actor → Movie
                      </td>
                      <td className="border border-neutral-700 px-2 py-1">4</td>
                      <td className="border border-neutral-700 px-2 py-1">
                        Pick the right movie for the given actor.
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-neutral-700 px-2 py-1">
                        🎬 Movie → Actor
                      </td>
                      <td className="border border-neutral-700 px-2 py-1">4</td>
                      <td className="border border-neutral-700 px-2 py-1">
                        Choose the actor who starred in the movie.
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-neutral-700 px-2 py-1">
                        ❓ True / False
                      </td>
                      <td className="border border-neutral-700 px-2 py-1">2</td>
                      <td className="border border-neutral-700 px-2 py-1">
                        Did this actor really appear in this film?
                      </td>
                    </tr>
                  </tbody>
                </table>
                <p className="mt-2 italic text-neutral-400">
                  If <strong>Standard Edition</strong> is the trailer,{" "}
                  <strong>Director’s Cut</strong> is the full feature film.
                </p>
              </div>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-semibold mb-2">🧮 Scoring System</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>100 points per correct answer</li>
                <li>Speed bonus for quick replies</li>
                <li>Combo multiplier for consecutive correct answers</li>
                <li>Mistakes reduce your remaining time</li>
              </ul>
              <p className="mt-2 italic text-neutral-400">
                ⚡ Be fast. Be right. Become legendary.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-semibold mb-2">Upcoming Releases</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  👤 Login: track your scores and progress.{" "}
                  <Badge>Coming Soon</Badge>
                </li>
                <li>
                  🏅 Leaderboards: see who’s the ultimate movie brain.{" "}
                  <Badge>Coming Soon</Badge>
                </li>
                <li>
                  📲 Social: challenge your friends. <Badge>Coming Soon</Badge>
                </li>
                <li>
                  🔁 Express Mode: ultra-fast typing challenge for elite
                  players. <Badge>Coming Soon</Badge>
                </li>
              </ul>
              <p className="mt-2 italic text-neutral-400">
                Earn your Director’s Chair — and show who’s the real movie buff.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-semibold mb-2">💬 Tips</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>Don’t overthink — go with your gut.</li>
                <li>Speed matters, but so does accuracy.</li>
                <li>Every second counts.</li>
              </ul>
              <p className="mt-2 italic text-neutral-400">
                🎥 And remember: if you recognize the actor, you’re already
                winning.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-semibold mb-2">💬 Feedback</h2>
              <p>
                We’re still in beta — your thoughts help shape the game. At the
                end of each session, you can share your feedback to help us make
                Oh it’s that guy! even better.
              </p>
              <p className="mt-2 italic text-neutral-400">
                🙏 Thanks for playing and supporting indie game development!
              </p>
            </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
