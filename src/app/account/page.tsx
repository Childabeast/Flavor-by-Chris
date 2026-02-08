
"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Navbar } from "@/components/Navbar";

export default function AccountPage() {
    const { user, isLoaded } = useUser();
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (isLoaded && user) {
            fetchUser();
        }
    }, [isLoaded, user]);

    const fetchUser = async () => {
        try {
            const res = await fetch("/api/user");
            if (res.ok) {
                const data = await res.json();
                setUsername(data.username || "");
            }
        } catch (error) {
            console.error("Failed to fetch user", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const res = await fetch("/api/user", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: "Username updated successfully!" });
            } else {
                setMessage({ type: 'error', text: data.error || "Failed to update username" });
            }
        } catch (error) {
            setMessage({ type: 'error', text: "An error occurred" });
        } finally {
            setSaving(false);
        }
    };

    if (!isLoaded) return null;

    return (
        <div className="min-h-screen bg-[#FDFBF7]">
            <Navbar />
            <div className="pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
                <div className="bg-white rounded-3xl shadow-xl p-8 border border-deep-blue/5">
                    <h1 className="font-display text-3xl font-bold text-deep-blue mb-8">Account Settings</h1>

                    <form onSubmit={handleSave} className="space-y-6" autoComplete="off">
                        <div>
                            <label htmlFor="username_custom" className="block text-sm font-medium text-gray-700 mb-1">
                                Username
                            </label>
                            <p className="text-sm text-gray-500 mb-3">
                                This is the name that will be displayed on your reviews.
                            </p>
                            <Input
                                id="username_custom"
                                name="username_custom_field"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your username"
                                required
                                minLength={3}
                                maxLength={20}
                                autoComplete="off"
                                data-lpignore="true"
                            />
                        </div>

                        {message && (
                            <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {message.text}
                            </div>
                        )}

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full sm:w-auto"
                            disabled={saving || loading}
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
