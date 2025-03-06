"use client";

import { useState } from "react";
import SelectAMLCheckModal from "../_components/aml-check-components/custom-modal";
import AMLCheckForm from "../_components/aml-check-components/aml-check-form";

export default function AMLCheck() {

    const [showDialog, setShowDialog] = useState(true);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <AMLCheckForm />
        </div>
    )
}