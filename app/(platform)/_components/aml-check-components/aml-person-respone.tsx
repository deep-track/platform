"use client"

import { ArrowRight, AlertTriangle, User, Check } from "lucide-react"
import Link from "next/link"
import type {
    VerificationResponse,
    PersonData,
    PoliticalExposureItem,
} from "@/lib/types"

// Map of topic codes to readable labels
export const topics: Record<string, string> = {
    crime: "Crime",
    "crime.fraud": "Fraud",
    "crime.cyber": "Cybercrime",
    "crime.fin": "Financial crime",
    "crime.env": "Environmental violations",
    "crime.theft": "Theft",
    "crime.war": "War crimes",
    "crime.boss": "Criminal leadership",
    "crime.terror": "Terrorism",
    "crime.traffick": "Trafficking",
    "crime.traffick.drug": "Drug trafficking",
    "crime.traffick.human": "Human trafficking",
    wanted: "Wanted",
    "corp.offshore": "Offshore",
    "corp.shell": "Shell company",
    "corp.public": "Public listed company",
    "corp.disqual": "Disqualified",
    gov: "Government",
    "gov.national": "National government",
    "gov.state": "State government",
    "gov.muni": "Municipal government",
    "gov.soe": "State-owned enterprise",
    "gov.igo": "Intergovernmental organization",
    "gov.head": "Head of government or state",
    "gov.admin": "Civil service",
    "gov.executive": "Executive branch of government",
    "gov.legislative": "Legislative branch of government",
    "gov.judicial": "Judicial branch of government",
    "gov.security": "Security services",
    "gov.financial": "Central banking and financial integrity",
    fin: "Financial services",
    "fin.bank": "Bank",
    "fin.fund": "Fund",
    "fin.adivsor": "Financial advisor",
    "reg.action": "Regulator action",
    "reg.warn": "Regulator warning",
    "role.pep": "Politician",
    "role.pol": "Non-PEP",
    "role.rca": "Close Associate",
    "role.judge": "Judge",
    "role.civil": "Civil servant",
    "role.diplo": "Diplomat",
    "role.lawyer": "Lawyer",
    "role.acct": "Accountant",
    "role.spy": "Spy",
    "role.oligarch": "Oligarch",
    "role.journo": "Journalist",
    "role.act": "Activist",
    "role.lobby": "Lobbyist",
    "pol.party": "Political party",
    "pol.union": "Union",
    rel: "Religion",
    mil: "Military",
    "asset.frozen": "Frozen asset",
    sanction: "Sanctioned entity",
    "sanction.linked": "Sanction-linked entity",
    "sanction.counter": "Counter-sanctioned entity",
    "export.control": "Export controlled",
    "export.risk": "Trade risk",
    debarment: "Debarred entity",
    poi: "Person of interest",
}

// Helper function to extract political exposure data from entity
const extractPoliticalExposure = (entity?: VerificationResponse['matchedEntity']): PoliticalExposureItem[] => {
    if (!entity?.properties?.position) {
        return []
    }

    return entity.properties.position
        .filter((pos): pos is string => typeof pos === 'string' && pos.includes("("))
        .map((pos) => {
            const positionMatch = pos.match(/(.*?)\s*\((\d{4})(?:-(\d{4}|\s*))?\)/)
            if (positionMatch) {
                const [_, position, startYear, endYear] = positionMatch
                return {
                    position: position.trim(),
                    startDate: startYear,
                    endDate: endYear?.trim() || "Present",
                    location: entity.properties.country?.[0]?.toUpperCase() || "N/A",
                }
            }
            return {
                position: pos,
                startDate: entity.properties.positionOccupancies?.[0]?.properties?.startDate?.[0] || "N/A",
                endDate: "Present",
                location: entity.properties.country?.[0]?.toUpperCase() || "N/A",
            }
        })
}

// Helper function to format topic codes to readable labels
const formatTopics = (topicCodes?: string[]): string => {
    if (!topicCodes || topicCodes.length === 0) return "N/A"
    return topicCodes.map((code) => topics[code] || code).join(", ")
}

// Helper function to convert decimal score to percentage
const toPercentage = (score?: number): string => {
    if (score === undefined || score === null) return "N/A"
    return `${Math.round(score * 100)}%`
}

interface VerificationUIProps {
    verificationData: VerificationResponse
    personData: PersonData
}

export default function VerificationUI({ verificationData, personData }: VerificationUIProps) {
    const normalizedRiskLevel = verificationData.riskLevel.toUpperCase() as "LOW" | "MEDIUM" | "HIGH"
    const isLowRisk = normalizedRiskLevel === "LOW"
    const entityData = verificationData.matchedEntity
    const politicalExposure = extractPoliticalExposure(entityData)

    const gaugePosition: Record<"LOW" | "MEDIUM" | "HIGH", string> = {
        LOW: "M 10 50 A 40 40 0 0 1 30 15",
        MEDIUM: "M 10 50 A 40 40 0 0 1 50 10",
        HIGH: "M 10 50 A 40 40 0 0 1 90 50",
    }

    const gaugeCirclePosition: Record<"LOW" | "MEDIUM" | "HIGH", { cx: string; cy: string }> = {
        LOW: { cx: "30", cy: "15" },
        MEDIUM: { cx: "50", cy: "10" },
        HIGH: { cx: "90", cy: "50" },
    }

    const riskColors: Record<"LOW" | "MEDIUM" | "HIGH", string> = {
        LOW: "#0db94c",
        MEDIUM: "#f59e0b",
        HIGH: "#ec1c24",
    }

    const gaugePathD = gaugePosition[normalizedRiskLevel]
    const gaugeCircle = gaugeCirclePosition[normalizedRiskLevel]
    const riskColor = riskColors[normalizedRiskLevel]

    return (
        <div className="min-h-screen bg-[#3d3d3d] text-white font-sans">
            <div className="container mx-auto pt-6 px-4 relative">
                <div className="flex justify-center mb-4">
                    <div className="bg-[#54f4fc] text-black font-semibold py-2 px-8 rounded-full">AML CHECKS</div>
                </div>

                <div className="flex justify-between items-center mb-8">
                    <div className="relative">
                        <div className="bg-[#e0e0e0] p-4 rounded-md">
                            <User className="text-[#3d3d3d]" size={24} />
                        </div>
                    </div>

                    <Link href="/verifications" className="flex items-center text-[#54f4fc] text-sm">
                        <span>Go to All Verifications</span>
                        <ArrowRight className="ml-1" size={16} />
                    </Link>
                </div>

                <div className="flex flex-col items-center mb-8">
                    <div className="relative w-40 h-20 mb-2">
                        <svg viewBox="0 0 100 50" className="w-full h-full">
                            <path
                                d="M 10 50 A 40 40 0 0 1 90 50"
                                fill="none"
                                stroke="#333333"
                                strokeWidth="8"
                                strokeLinecap="round"
                            />
                            <path
                                d={gaugePathD}
                                fill="none"
                                stroke={riskColor}
                                strokeWidth="8"
                                strokeLinecap="round"
                            />
                            <circle cx={gaugeCircle.cx} cy={gaugeCircle.cy} r="6" fill={riskColor} />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center mt-4">
                            <span className="text-2xl font-bold" style={{ color: riskColor }}>
                                {normalizedRiskLevel === "MEDIUM" ? "MED" : normalizedRiskLevel}
                            </span>
                        </div>
                    </div>
                    <div className="text-sm text-center">
                        <p className="text-[#a2a2a2]">Risk assessment score: {toPercentage(verificationData.score)}</p>
                        <p className="text-[#a2a2a2] text-xs">
                            Last Check on {new Date().toLocaleDateString("en-US", { day: "2-digit", month: "short" })}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="space-y-1">
                        <p className="text-xs text-[#a2a2a2]">COUNTRY</p>
                        <p className="font-medium">{entityData?.properties?.country?.[0]?.toUpperCase() || personData.country.toUpperCase()}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-[#a2a2a2]">ID NUMBER</p>
                        <p className="font-medium">{entityData?.id || personData.idNumber}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-[#a2a2a2]">NAME</p>
                        <p className="font-medium">{entityData?.caption?.toUpperCase() || personData.name.toUpperCase()}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-[#a2a2a2]">DATE OF BIRTH</p>
                        <p className="font-medium">{entityData?.properties?.birthDate?.[0] || personData.dateOfBirth}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-[#a2a2a2]">GENDER</p>
                        <p className="font-medium">{entityData?.properties?.gender?.[0]?.toUpperCase() || personData.gender}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-[#a2a2a2]">STATE OF EXISTENCE</p>
                        <p className="font-medium">{personData.stateOfExistence}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-[#a2a2a2]">ROLE</p>
                        <p className="font-medium">
                            {entityData?.properties?.topics
                                ? formatTopics(entityData.properties.topics).toUpperCase()
                                : personData.role}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-[#a2a2a2]">RELIGIOUS AFFILIATION</p>
                        <p className="font-medium">{entityData?.properties?.religion?.[0]?.toUpperCase() || personData.religiousAffiliation}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-[#a2a2a2]">ETHNICITY</p>
                        <p className="font-medium">{entityData?.properties?.ethnicity?.[0]?.toUpperCase() || personData.ethnicity}</p>
                    </div>
                </div>

                {isLowRisk ? (
                    <>
                        <div className="bg-white py-4 px-6 rounded-t-md">
                            <h2 className="text-[#075c61] font-medium text-lg">Comprehensive screening</h2>
                        </div>
                        <div className="bg-[#f7f7f7] p-6 text-black">
                            <div className="flex items-center justify-between mb-4 py-2">
                                <div className="flex items-center">
                                    <Check className="text-[#137a08] mr-2" />
                                    <span>Not found in any Global sanctions lists</span>
                                </div>
                                <div className="bg-[#137a08] text-white px-3 py-1 text-xs font-semibold rounded">PASSED</div>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <div className="flex items-center">
                                    <Check className="text-[#137a08] mr-2" />
                                    <span>Not found in any PEP Database</span>
                                </div>
                                <div className="bg-[#137a08] text-white px-3 py-1 text-xs font-semibold rounded">PASSED</div>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="bg-white py-4 px-6 rounded-t-md">
                            <h2 className="text-[#075c61] font-medium text-lg">Risk Analysis</h2>
                        </div>
                        <div className="bg-[#f7f7f7] p-4 mb-6 flex justify-end">
                            <div className="flex items-center bg-black text-white text-xs p-2 rounded">
                                <AlertTriangle size={16} className="mr-2 text-[#ec1c24]" />
                                <span>{verificationData.reasons[0] || "N/A"}. Further verification may be required.</span>
                            </div>
                        </div>

                        {politicalExposure.length > 0 && (
                            <div className="mb-6">
                                <div className="bg-[#d9d9d9] py-2 px-4 text-black font-medium">RISK FACTOR: POLITICAL EXPOSURE</div>
                                <div className="bg-black">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-[#25333a]">
                                                <th className="py-2 px-4 text-left text-[#54f4fc]">Position</th>
                                                <th className="py-2 px-4 text-left text-[#54f4fc]">Start date</th>
                                                <th className="py-2 px-4 text-left text-[#54f4fc]">End date</th>
                                                <th className="py-2 px-4 text-left text-[#54f4fc]">Location</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {politicalExposure.map((item, index) => (
                                                <tr
                                                    key={index}
                                                    className={index < politicalExposure.length - 1 ? "border-b border-[#333333]" : ""}
                                                >
                                                    <td className="py-2 px-4 text-[#54f4fc]">{item.position}</td>
                                                    <td className="py-2 px-4">{item.startDate}</td>
                                                    <td className="py-2 px-4">{item.endDate}</td>
                                                    <td className="py-2 px-4">{item.location}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}