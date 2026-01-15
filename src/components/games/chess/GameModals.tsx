"use client";

import Button from "@/components/ui/Button";

interface GameModalsProps {
    // Abort confirmation
    showAbortConfirm: boolean;
    onCancelAbort: () => void;
    onConfirmAbort: () => void;

    // Draw offer (opponent received)
    drawOffer: { from: string; username: string } | null;
    currentSessionId: string;
    onAcceptDraw: () => void;
    onRejectDraw: () => void;

    // Rematch offer (opponent received)
    rematchOffer: { from: string; username: string } | null;
    onAcceptRematch: () => void;
    onRejectRematch: () => void;

    // Notifications
    drawRejectedNotif: boolean;
    rematchRejectedNotif: boolean;
    abortedBy: string | null;
}

export default function GameModals({
    showAbortConfirm,
    onCancelAbort,
    onConfirmAbort,
    drawOffer,
    currentSessionId,
    onAcceptDraw,
    onRejectDraw,
    rematchOffer,
    onAcceptRematch,
    onRejectRematch,
    drawRejectedNotif,
    rematchRejectedNotif,
    abortedBy,
}: GameModalsProps) {
    return (
        <>
            {/* Abort Confirmation Modal */}
            {showAbortConfirm && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-[#262522] p-6 rounded-lg max-w-sm">
                        <h3 className="text-lg font-semibold mb-4">Abort Game?</h3>
                        <p className="text-gray-400 mb-4">Are you sure you want to abort this game?</p>
                        <div className="flex gap-3">
                            <Button onClick={onCancelAbort} className="flex-1 bg-[#3d3935] rounded">Cancel</Button>
                            <Button onClick={onConfirmAbort} className="flex-1 bg-red-600 rounded">Abort</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Draw Offer Modal - Only show to opponent */}
            {drawOffer && drawOffer.from !== currentSessionId && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-[#262522] p-6 rounded-lg max-w-sm">
                        <h3 className="text-lg font-semibold mb-4">Draw Offer</h3>
                        <p className="text-gray-400 mb-4">{drawOffer.username} offers a draw</p>
                        <div className="flex gap-3">
                            <Button onClick={onRejectDraw} className="flex-1 bg-[#3d3935] rounded">Decline</Button>
                            <Button onClick={onAcceptDraw} className="flex-1 bg-[#81b64c] rounded">Accept</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Draw Rejected Notification */}
            {drawRejectedNotif && (
                <div className="fixed top-4 right-4 bg-[#3d3935] text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-top-2">
                    Draw offer was declined
                </div>
            )}

            {/* Aborted Notification */}
            {abortedBy && (
                <div className="fixed top-4 right-4 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg z-50">
                    Game aborted by {abortedBy}
                </div>
            )}

            {/* Rematch Offer Modal - Only show to opponent */}
            {rematchOffer && rematchOffer.from !== currentSessionId && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-[#262522] p-6 rounded-lg max-w-sm">
                        <h3 className="text-lg font-semibold mb-4">Rematch Offer</h3>
                        <p className="text-gray-400 mb-4">{rematchOffer.username} wants a rematch!</p>
                        <div className="flex gap-3">
                            <Button onClick={onRejectRematch} className="flex-1 bg-[#3d3935] rounded">Decline</Button>
                            <Button onClick={onAcceptRematch} className="flex-1 bg-[#81b64c] rounded">Accept</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rematch Rejected Notification */}
            {rematchRejectedNotif && (
                <div className="fixed top-4 right-4 bg-[#3d3935] text-white px-4 py-3 rounded-lg shadow-lg z-50">
                    Rematch offer was declined
                </div>
            )}
        </>
    );
}
