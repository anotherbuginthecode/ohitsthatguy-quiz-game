import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

const LANGUAGES = [
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "en", label: "English", flag: "🇬🇧" },
];

export default function GamePlay() {
  const [language, setLanguage] = useState<string | null>(null);
  const [rounds, setRounds] = useState(5);
  const [step, setStep] = useState(1);

  function handleStart() {
    // TODO: Start the game logic, e.g., navigate to the next step or game screen
    setStep(2);
  }

  return (
    <div className="container flex min-h-screen flex-col items-center justify-center p-10 gap-10">
      {step === 1 && (
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-2xl">Start a New Game</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div>
              <div className="mb-2 font-medium">Select language</div>
              <div className="flex gap-4">
                {LANGUAGES.map((lang) => (
                  <Button
                    key={lang.code}
                    variant={language === lang.code ? "default" : "outline"}
                    onClick={() => setLanguage(lang.code)}
                    className="flex-1 py-4 text-lg"
                    aria-pressed={language === lang.code}
                  >
                    <span className="mr-2 text-2xl">{lang.flag}</span>
                    {lang.label}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-2 font-medium">Number of rounds</div>
              <Input
                type="number"
                min={1}
                max={20}
                value={rounds}
                onChange={(e) => setRounds(Number(e.target.value))}
                className="w-24"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={handleStart}
              disabled={!language || rounds < 1}
            >
              Start
            </Button>
          </CardFooter>
        </Card>
      )}
      {step === 2 && <div>lets play!</div>}
    </div>
  );
}
