import { Link } from 'react-router-dom';
import { UserMenu } from './UserMenu';

interface HeaderProps {
  username: string;
  email: string;
}

export function Header({ username, email }: HeaderProps) {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link to="/home" className="flex items-center gap-3">
            <img src="/assets/memolearning-logo.png" alt="MemoLearning" className="h-8 w-8" />
            <h1 className="text-3xl font-bold text-gray-900">MemoLearning</h1>
          </Link>
          <UserMenu username={username} email={email} />
        </div>
      </div>
    </header>
  );
}
