import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle } from 'lucide-react';
import { MdOutlineCheck } from "react-icons/md";

const MultiStepVerificationLoader = ({ isComplete = false }) => {
    const subSteps = [
        { name: 'Analyzing image quality and metadata', detail: 'All documents are in good condition' },
        { name: 'Verifying Attachments', detail: 'All documents look authentic' },
        { name: 'Returning Personal info', detail: 'Lifted necessary info successfully' },
        { name: 'Cross-reference Image to ID', detail: 'Information looks authentic' },
    ];

    const [activeSubStep, setActiveSubStep] = useState(0);

    useEffect(() => {
        if (!isComplete) {
            const timer = setTimeout(() => {
                if (activeSubStep < subSteps.length - 1) {
                    setActiveSubStep((prev) => prev + 1);
                }
            }, 2000); // Move to the next sub-step every 2 seconds

            return () => clearTimeout(timer);
        }
    }, [activeSubStep, isComplete]);

    return (
        <div className="text-white p-6 max-w-6xl mx-auto">
            <div className="mt-4 space-y-2">
                {subSteps.map((subStep, index) => (
                    <div key={index} className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                            {index < activeSubStep ? (
                                <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : index === activeSubStep ? (
                                <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                            ) : (
                                <div className="w-4 h-4 border border-gray-500 rounded-full" />
                            )}
                            <p
                                className={`text-sm ${index === activeSubStep ? 'text-blue-400 font-medium' : 'text-gray-500'
                                    }`}
                            >
                                {subStep.name}
                            </p>
                        </div>
                        {index < activeSubStep && (
                            <p className="text-sm text-blue-400 flex items-center">
                                {subStep.detail} <MdOutlineCheck className="w-4 h-4 text-customTeal/90 ml-1" />
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MultiStepVerificationLoader;