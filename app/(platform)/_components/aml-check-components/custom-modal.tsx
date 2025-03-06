"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SelectAMLCheckModal({ onClose }: { onClose: () => void }) {
    const [selected, setSelected] = useState<"person" | "business" | null>(null);
    const router = useRouter();

    const handleSelection = (option: "person" | "business") => {
        setSelected(option);
        setTimeout(() => {
            router.push(`/aml-check/${option}`);
        }, 300);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-lg font-semibold text-center">Select who you want to conduct the AML Check for:</h2>

                <div className="mt-4 space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                            type="radio"
                            name="aml-check"
                            value="person"
                            checked={selected === "person"}
                            onChange={() => handleSelection("person")}
                            className="w-5 h-5 text-blue-600"
                        />
                        <span className="text-gray-700">Check by person</span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                            type="radio"
                            name="aml-check"
                            value="business"
                            checked={selected === "business"}
                            onChange={() => handleSelection("business")}
                            className="w-5 h-5 text-blue-600"
                        />
                        <span className="text-gray-700">Check by business</span>
                    </label>
                </div>
            </div>
        </div>
    );
}
