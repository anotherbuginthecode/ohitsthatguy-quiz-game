import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";

interface HowToPlayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HowToPlayDialogStandardMode({
  open,
  onOpenChange,
}: HowToPlayDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-950 text-white border border-white/10 rounded-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">How to Play</DialogTitle>
          <DialogDescription className="text-sm text-white/70">
            Quick guide to the rules for the <b>Standard</b> and <b>Express</b>{" "}
            modes.
          </DialogDescription>
        </DialogHeader>

        {/* Standard Mode */}
        <section className="mt-4 space-y-2">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            🎬 Standard Edition
          </h3>
          <ul className="space-y-1 max-sm:text-sm text-md">
            <li>⏱ 60 seconds total for all 5 rounds.</li>
            <li>🎭 Each round: 3 titles, only 1 correct.</li>
            <li>❌ Wrong = -5s </li>
          </ul>

          <div className="mt-5">
            <h4 className="font-semibold">Scoring</h4>
            <ul className="text-white/80 mt-1 space-y-1 max-sm:text-sm text-md">
              <li>✅ Base: +100 per correct answer</li>
              <li>
                ⚡ Speed Bonus: up to +100 (based on remaining global time)
              </li>
              <li>
                🔥 Streak Multiplier:
                <ul className="list-disc list-inside pl-3">
                  <li>3 in a row → ×1.25</li>
                  <li>4 in a row → ×1.5</li>
                  <li>5 in a row → ×2</li>
                </ul>
              </li>
            </ul>
          </div>
        </section>

        {/* Express Mode */}
        <section className="mt-6 space-y-2">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            ⚡ Express Mode (Unlockable) <Badge>WIP</Badge>
          </h3>
          <ul className="space-y-1 max-sm:text-sm text-md">
            <li>🔓 Unlock: get a perfect 5/5 in Standard Edition.</li>
            <li>⏱ Only 30 seconds total.</li>
            <li>⌨️ Type as many valid titles as you can for one actor.</li>
            <li>
              🍿 Scoring: +200 per correct title, with speed & streak bonuses.
            </li>
            <li>❌ Mistakes = no points and cost time (-2s).</li>
          </ul>
        </section>

        {/* Tips */}
        <section className="mt-6 space-y-2">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            💡 Tips
          </h3>
          <ul className="list-disc list-inside max-sm:text-sm text-md space-y-1">
            <li>Trust your instinct — speed matters.</li>
            <li>Keep streaks alive for big multipliers.</li>
          </ul>
        </section>

        <DialogFooter className="mt-6 flex justify-center gap-3">
          <Button
            variant="secondary"
            className="bg-yellow-400 text-black hover:bg-yellow-300"
            onClick={() => onOpenChange(false)}
          >
            Ready? Let’s Play!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function HowToPlayDialogClassicMode({
  open,
  onOpenChange,
}: HowToPlayDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-950 text-white border border-white/10 rounded-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">How to Play</DialogTitle>
          <DialogDescription className="text-sm text-white/70">
            Quick guide to the rules for the <b>Standard</b> and <b>Express</b>{" "}
            modes.
          </DialogDescription>
        </DialogHeader>

        {/* Standard Mode */}
        <section className="mt-4 space-y-2">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            🎬 Standard Edition
          </h3>
          <ul className="space-y-1 max-sm:text-sm text-md">
            <li>⏱ 60 seconds total for all 5 rounds.</li>
            <li>🎭 Each round: 3 titles, only 1 correct.</li>
            <li>❌ Wrong = -5s </li>
          </ul>

          <div className="mt-5">
            <h4 className="font-semibold">Scoring</h4>
            <ul className="text-white/80 mt-1 space-y-1 max-sm:text-sm text-md">
              <li>✅ Base: +100 per correct answer</li>
              <li>
                ⚡ Speed Bonus: up to +100 (based on remaining global time)
              </li>
              <li>
                🔥 Streak Multiplier:
                <ul className="list-disc list-inside pl-3">
                  <li>3 in a row → ×1.25</li>
                  <li>4 in a row → ×1.5</li>
                  <li>5 in a row → ×2</li>
                </ul>
              </li>
            </ul>
          </div>
        </section>

        {/* Express Mode */}
        <section className="mt-6 space-y-2">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            ⚡ Express Mode (Unlockable) <Badge>WIP</Badge>
          </h3>
          <ul className="space-y-1 max-sm:text-sm text-md">
            <li>🔓 Unlock: get a perfect 5/5 in Standard Edition.</li>
            <li>⏱ Only 30 seconds total.</li>
            <li>⌨️ Type as many valid titles as you can for one actor.</li>
            <li>
              🍿 Scoring: +200 per correct title, with speed & streak bonuses.
            </li>
            <li>❌ Mistakes = no points and cost time (-2s).</li>
          </ul>
        </section>

        {/* Tips */}
        <section className="mt-6 space-y-2">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            💡 Tips
          </h3>
          <ul className="list-disc list-inside max-sm:text-sm text-md space-y-1">
            <li>Trust your instinct — speed matters.</li>
            <li>Keep streaks alive for big multipliers.</li>
          </ul>
        </section>

        <DialogFooter className="mt-6 flex justify-center gap-3">
          <Button
            variant="secondary"
            className="bg-yellow-400 text-black hover:bg-yellow-300"
            onClick={() => onOpenChange(false)}
          >
            Ready? Let’s Play!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
