import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle, FileText, ShieldCheck } from 'lucide-react';

const MultiStepVerificationLoader = ({ currentStep = 0, isComplete = false }) => {
    const [activeStep, setActiveStep] = useState(currentStep);

    const steps = [
        { id: 0, title: 'Document Upload', icon: FileText, description: 'Processing your documents' },
        { id: 1, title: 'Identity Verification', icon: ShieldCheck, description: 'Verifying your identity' },
        { id: 2, title: 'Completion', icon: CheckCircle, description: 'Verification complete' }
    ];

    useEffect(() => {
        if (!isComplete && activeStep < steps.length - 1) {
            const timer = setTimeout(() => {
                setActiveStep((prev) => prev + 1);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [activeStep, isComplete, steps.length]);

    return (
        <div className="bg-gray-900 text-white p-8 rounded-lg shadow-xl max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-center mb-6">Document Verification</h2>

            <div className="space-y-8">
                {steps.map((step, index) => {
                    const StepIcon = step.icon;
                    const isActive = activeStep === index;
                    const isCompleted = activeStep > index || isComplete;

                    return (
                        <div key={step.id} className="flex items-center">
                            <div className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 ${isActive ? 'border-blue-400 bg-blue-900' :
                                    isCompleted ? 'border-green-400 bg-green-900' :
                                        'border-gray-600 bg-gray-800'
                                } mr-4`}>
                                {isActive && <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />}
                                {isCompleted && <CheckCircle className="w-6 h-6 text-green-400" />}
                                {!isActive && !isCompleted && <StepIcon className="w-6 h-6 text-gray-400" />}
                            </div>

                            <div className="flex-1">
                                <h3 className={`font-semibold ${isActive ? 'text-blue-400' :
                                        isCompleted ? 'text-green-400' :
                                            'text-gray-400'
                                    }`}>
                                    {step.title}
                                </h3>

                                {isActive && (
                                    <p className="text-gray-300 text-sm mt-1">{step.description}</p>
                                )}
                            </div>

                            {index < steps.length - 1 && (
                                <div className={`h-12 w-0.5 absolute ml-5 mt-16 ${isCompleted ? 'bg-green-400' : 'bg-gray-600'
                                    }`} />
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 text-center">
                {isComplete ? (
                    <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg font-medium transition-colors">
                        Continue
                    </button>
                ) : (
                    <p className="text-gray-400 text-sm">Please wait while we process your verification</p>
                )}
            </div>
        </div>
    );
};

export default MultiStepVerificationLoader;