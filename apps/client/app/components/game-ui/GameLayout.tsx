import { Card, CardContent } from "~/components/ui/card";

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen text-white flex flex-col container mx-auto gap-5 items-center">
      <div className="flex flex-col gap-5 w-full max-w-xl">
        <Card className="bg-gray-800/70 border border-gray-700 shadow-lg w-full mx-auto">
          <CardContent className="p-4">{children}</CardContent>
        </Card>
      </div>
    </div>
  );
}
