"use client";

import { useState } from "react";
import SelectAMLCheckModal from "../_components/aml-check-components/custom-modal";

export default function AMLCheck() {

    const [showDialog, setShowDialog] = useState(true);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            {
                showDialog && <SelectAMLCheckModal onClose={() => setShowDialog(false)} />
            }
        </div>
    )
}