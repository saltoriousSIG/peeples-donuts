"use client";

import { createContext, useEffect, useState, useContext, useCallback } from "react";
import sdk from "@farcaster/miniapp-sdk";
import { MiniAppSDK } from "@farcaster/miniapp-sdk/dist/types";
import { useAccount, useConnect } from "wagmi";

interface FrameContextValue {
    errors: Record<string, Error> | null;
    context: Awaited<MiniAppSDK['context']> | null;
    fUser: Awaited<MiniAppSDK['context']>['user'] | null;
    address: string | undefined;
    isConnected: boolean | undefined;
    handleAddFrame: () => Promise<void>;
    handleSetIsFrameAdding: (state: boolean) => void;
    handleSignin: () => Promise<any>;
    isFrameAdded: boolean;
    isFrameAdding: boolean;
    isAuthenticated: boolean;
    connect: Function;
    sdk: typeof sdk;
}

const FrameSDKContext = createContext<FrameContextValue | undefined>(undefined);

export function useFrameContext() {
    const context = useContext(FrameSDKContext);
    if (context === undefined) {
        throw new Error("useFrameContext must be used within a FrameSDKProvider");
    }
    return context;
}

export function FrameSDKProvider({ children }: { children: React.ReactNode }) {
    const [errors, setErrors] = useState<Record<string, Error> | null>(null);
    const [context, setContext] = useState<Awaited<MiniAppSDK['context']> | null>(null);
    const [fUser, setFUser] = useState<Awaited<MiniAppSDK['context']>['user'] | null>(null);
    const [isFrameAdded, setIsframeAdded] = useState<boolean>(false);
    const [isFrameAdding, setIsFrameAdding] = useState<boolean>(false);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    const { isConnected, address } = useAccount();
    const { connect, connectors } = useConnect();

    const handleSetIsFrameAdding = (state: boolean) => setIsFrameAdding(state);

    const handleAddFrame = useCallback(async () => {
        try {
            await sdk.actions.addMiniApp();
            setIsframeAdded(true);
        } catch (e: any) {
            setErrors({
                ...errors,
                addFrame: new Error("Error adding frame! " + e.message)
            });
        } finally {
            setIsFrameAdding(false);
        }
    }, [errors]);

    useEffect(() => {
        const timer = setTimeout(() => {
            sdk.actions.ready();
        }, 1200);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (connectors && connectors.length > 0) {
            connect({
                connector: connectors[0]
            });
        }
    }, [connect, connectors]);

    // Load context
    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const context = await sdk.context;
                if (!cancelled) {
                    setContext(context);
                    setFUser({
                        ...context.user,
                    });
                    setIsframeAdded(context.client.added);
                }
            } catch (e: any) {
                if (!cancelled) {
                    setErrors({
                        ...errors,
                        load: new Error("You must load this page from within Warpcast!")
                    });
                }
            }
        };

        load();

        return () => {
            cancelled = true;
        };
    }, []);

    const handleSignin = useCallback(async () => {
        if (!fUser || !address) return;
        try {
            const response = await sdk.actions.signIn({
                nonce: `${address}`,
            });
            sessionStorage.setItem(`signature:${fUser.fid}`, response.signature);
            sessionStorage.setItem(`message:${fUser.fid}`, response.message);
            setIsAuthenticated(true);
            window.dispatchEvent(new Event("fc-signin-success"));
            return response.signature;
        } catch (e: any) {
            return null;
        }
    }, [address, fUser]);

    useEffect(() => {
        if (!address || !fUser) return;
        const storage_signature = sessionStorage.getItem(`signature:${fUser.fid}`);
        const storage_message = sessionStorage.getItem(`message:${fUser.fid}`);

        if (!storage_signature || !storage_message) {
            const result = handleSignin();
            if (!result) {
                setIsAuthenticated(false);
            }
        } else {
            setIsAuthenticated(true);
        }
    }, [handleSignin, address, fUser]);

    return (
        <FrameSDKContext.Provider value={{
            errors,
            fUser,
            context,
            address,
            handleAddFrame,
            handleSetIsFrameAdding,
            handleSignin,
            isFrameAdded,
            isFrameAdding,
            isConnected,
            isAuthenticated,
            connect,
            sdk
        }}>
            {children}
        </FrameSDKContext.Provider>
    );
}
