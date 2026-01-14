import { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useAuth } from '@/contexts/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReward, setShowReward] = useState(false);

  const { login, register } = useAuth();

  const handleClose = () => {
    setShowReward(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login({ email, password });
        onClose();
      } else {
        await register({ username, email, password });
        setShowReward(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed');
      setLoading(false);
    }
    // Do not set loading false on success for registration until modal update, 
    // actually we can set it false.
    if (isLogin) setLoading(false);
    else setLoading(false);
  };

  if (showReward) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Welcome Gift!">
        <div className="flex flex-col items-center justify-center py-6 text-center animate-fade-in-up">
          <div className="text-6xl mb-4 animate-[bounce_2s_infinite]">🎁</div>
          <h3 className="text-2xl font-bold text-yellow-500 mb-2">+50 Points</h3>
          <p className="text-muted-foreground mb-6">
            Welcome to PlayArena! You've been awarded 50 points to start your journey.
          </p>
          <Button onClick={handleClose} className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold">
            Claim & Start Playing
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isLogin ? 'Welcome Back!' : 'Join PlayArena'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a username"
            required
          />
        )}
        <Input
          label={isLogin ? "Email or Username" : "Email"}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex flex-col gap-3 mt-6">
          <Button type="submit" loading={loading} className="w-full">
            {isLogin ? 'Login' : 'Sign Up'}
          </Button>

          <p className="text-center text-sm text-[var(--text-muted)]">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-[var(--primary)] font-medium hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </div>
      </form>
    </Modal>
  );
}
