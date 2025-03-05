'use client'

import { STEPS } from "@/lib/constants"

export const ProgressStepper = ({ currentStep }: { currentStep: number }) => (
    <div className="w-full mb-8">
        <div className="h-2 bg-gray-200 rounded-full relative">
            <div
                className="h-full bg-[#14B4BC] transform-gpu rounded-full transition-transform duration-500 ease-out"
                style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
            />
        </div>
        <div className="mt-4 flex justify-between text-sm text-gray-500">
            <span>Step {currentStep + 1} of {STEPS.length}</span>
            <span>{STEPS[currentStep].title}</span>
        </div>
    </div>
)