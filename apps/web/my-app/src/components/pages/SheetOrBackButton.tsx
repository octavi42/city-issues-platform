import React from "react";
import { useRouter } from "next/navigation";
import { Sheet } from "@silk-hq/components";

const SheetOrBackButton = ({ isIntercepted, className = "", style, icon }: { isIntercepted: boolean, className?: string, style?: React.CSSProperties, icon?: React.ReactNode }) => {
    const router = useRouter();
    const handleBack = () => {
        if (typeof window !== "undefined" && window.history.length > 1) {
            router.back();
        } else {
            router.push("/"); // fallback to home or another default route
        }
        router.refresh()
    };
    const button = (
        <button
            className={className}
            aria-label={isIntercepted ? "Close Sheet" : "Go Back"}
            type="button"
            style={style}
            onClick={isIntercepted ? undefined : handleBack}
        >
            {icon ?? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            )}
        </button>
    );
    return isIntercepted ? (
        <Sheet.Trigger action="dismiss" asChild>
            {button}
        </Sheet.Trigger>
    ) : button;
};

export default SheetOrBackButton; 