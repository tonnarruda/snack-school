import { Chat } from "@/components/Chat";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-4 pb-10 sm:px-6">
      <Chat />
    </main>
  );
}
