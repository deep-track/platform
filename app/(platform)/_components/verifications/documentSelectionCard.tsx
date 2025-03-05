'use client'

export const DocumentSelectionCard = ({
    icon: Icon,
    title,
    isSelected,
    onClick
}: {
    icon: React.ComponentType<{ className?: string }>
    title: string
    isSelected: boolean
    onClick: () => void
}) => (
    <div
        className={`flex flex-row gap-3 relative p-6 border-2 rounded-lg transition-all duration-300 hover:border-[#00494c] hover:shadow-md cursor-pointer ${isSelected ? "border-4 border-[#00494c] shadow-md" : ""
            }`}
        onClick={onClick}
    >
        <Icon className="w-6 h-6 text-[#00494c] mb-2" />
        <h3 className={`${isSelected ? "font-bold" : "font-normal"}`}>{title}</h3>
    </div>
)