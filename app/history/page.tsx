import { Metadata } from 'next';
import IdeaHistory from '@/components/history/IdeaHistory';

export const metadata: Metadata = {
  title: 'Idea History - Idea Printer',
  description: 'View your generated app ideas history, search, filter, and export your favorite ideas.',
};

export default function HistoryPage() {
  return <IdeaHistory />;
}
