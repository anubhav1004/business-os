import ChatInterface from '@/components/chat/ChatInterface';

export default function HomePage() {
  // In production, this would come from authentication
  const user = {
    email: 'ceo@scanandlearn.com',
    name: 'Anubhav',
    team: 'executive' as const,
  };

  return (
    <main className="h-full w-full">
      <ChatInterface user={user} />
    </main>
  );
}
