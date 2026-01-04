'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

type Props = {
    disabled: boolean;
    onAction: (action: 'check' | 'call' | 'bet' | 'raise' | 'fold', amount?: number) => void;
};

export default function PokerControls({ disabled, onAction }: Props) {
    const [amount, setAmount] = useState<number>(0);

    return (
        <Card className="p-5 bg-[#1a1a1a] border border-[#2a2a2a]">
            <div className="flex flex-col gap-4">
                <div className="flex gap-2 flex-wrap">
                    <Button
                        disabled={disabled}
                        variant="secondary"
                        onClick={() => onAction('check')}
                    >
                        Check
                    </Button>

                    <Button
                        disabled={disabled}
                        variant="secondary"
                        onClick={() => onAction('call')}
                    >
                        Call
                    </Button>

                    <Button
                        disabled={disabled}
                        variant="ghost"
                        onClick={() => onAction('fold')}
                    >
                        Fold
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        min={1}
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="flex-1 px-3 py-2 rounded-lg bg-[#111] border border-[#333] text-white outline-none"
                        placeholder="Amount"
                        disabled={disabled}
                    />

                    <Button
                        disabled={disabled || amount <= 0}
                        onClick={() => {
                            onAction('bet', amount);
                            setAmount(0);
                        }}
                    >
                        Bet
                    </Button>

                    <Button
                        disabled={disabled || amount <= 0}
                        variant="secondary"
                        onClick={() => {
                            onAction('raise', amount);
                            setAmount(0);
                        }}
                    >
                        Raise
                    </Button>
                </div>
            </div>
        </Card>
    );
}
