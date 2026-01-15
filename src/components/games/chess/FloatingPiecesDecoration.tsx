"use client";

export default function FloatingPiecesDecoration() {
    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            <div
                className="absolute text-6xl opacity-5"
                style={{
                    left: '5%', top: '15%',
                    animation: 'float-slow 8s ease-in-out infinite',
                }}
            >♟</div>
            <div
                className="absolute text-7xl opacity-5"
                style={{
                    right: '8%', top: '25%',
                    animation: 'float-medium 6s ease-in-out infinite 1s',
                }}
            >♞</div>
            <div
                className="absolute text-5xl opacity-5"
                style={{
                    left: '10%', bottom: '20%',
                    animation: 'float-slow 10s ease-in-out infinite 2s',
                }}
            >♝</div>
            <div
                className="absolute text-8xl opacity-5"
                style={{
                    right: '5%', bottom: '15%',
                    animation: 'float-medium 7s ease-in-out infinite 0.5s',
                }}
            >♜</div>
            <div
                className="absolute text-6xl opacity-5"
                style={{
                    left: '50%', top: '8%',
                    transform: 'translateX(-50%)',
                    animation: 'float-slow 9s ease-in-out infinite 3s',
                }}
            >♛</div>
        </div>
    );
}
