import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

import { QuickConnectModal } from "@/components/onboarding/quick-connect-modal";
import { DEFAULT_UPSTREAM } from "@/lib/pro-spec/constants";
import { usePromptSourceScheduler } from "@/hooks/use-prompt-source-scheduler";
import { useConfigStore } from "@/stores/use-config-store";

export function ClientRootInit({ children }: { children: ReactNode }) {
    const handledConfigParams = useRef(false);
    const [quickConnectOpen, setQuickConnectOpen] = useState(false);
    const [presetApiKey, setPresetApiKey] = useState("");
    const [presetBaseUrl, setPresetBaseUrl] = useState<string>(DEFAULT_UPSTREAM.baseUrl);
    const hydrated = useConfigStore((state) => state.hydrated);
    const config = useConfigStore((state) => state.config);

    usePromptSourceScheduler();

    useEffect(() => {
        if (!hydrated) return;
        if (handledConfigParams.current) return;
        const searchParams = new URLSearchParams(window.location.search);
        const baseUrl = searchParams.get("baseUrl") || searchParams.get("baseurl");
        const apiKey = searchParams.get("apiKey") || searchParams.get("apikey");
        if (baseUrl || apiKey) {
            handledConfigParams.current = true;
            searchParams.delete("baseUrl");
            searchParams.delete("baseurl");
            searchParams.delete("apiKey");
            searchParams.delete("apikey");
            window.history.replaceState(null, "", `${window.location.pathname}${searchParams.size ? `?${searchParams}` : ""}${window.location.hash}`);
            setPresetBaseUrl(baseUrl || DEFAULT_UPSTREAM.baseUrl);
            setPresetApiKey(apiKey || "");
            setQuickConnectOpen(true);
            return;
        }
        const ready = config.channels.some((channel) => channel.baseUrl.trim() && channel.apiKey.trim() && channel.models.length);
        if (!ready) {
            handledConfigParams.current = true;
            setPresetBaseUrl(DEFAULT_UPSTREAM.baseUrl);
            setPresetApiKey("");
            setQuickConnectOpen(true);
        }
    }, [config.channels, hydrated]);

    return (
        <>
            {children}
            <QuickConnectModal open={quickConnectOpen} initialApiKey={presetApiKey} initialBaseUrl={presetBaseUrl} onClose={() => setQuickConnectOpen(false)} />
        </>
    );
}
