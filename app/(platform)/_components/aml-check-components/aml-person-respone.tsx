"use client"

import { ArrowRight, AlertTriangle, User, Check, User2 } from "lucide-react"
import Link from "next/link"
import type {
    VerificationResponse,
    PersonData,
    PoliticalExposureItem,
    MatchedEntity,
    SanctionItem,
    PepDatabaseItem,
    RelativeEntity,
    FamilyRelative,
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
const extractPoliticalExposure = (entity: MatchedEntity): PoliticalExposureItem[] => {
    if (!entity?.properties?.position) return []

    return entity.properties.position.map((pos: string): PoliticalExposureItem => {
        const dateMatch = pos.match(/\s*\((\d{4})-(\d{4}|)\)/)
        if (dateMatch) {
            const [, startYear, endYear] = dateMatch
            const position = pos.replace(dateMatch[0], "").trim()
            return {
                position,
                startDate: startYear,
                endDate: endYear || "Present",
                location: entity.properties.country?.[0] === "ru" ? "Russia" : "International",
            }
        }
        return {
            position: pos,
            startDate: "Unknown",
            endDate: "Unknown",
            location: entity.properties.country?.[0] === "ru" ? "Russia" : "International",
        }
    })
}

// Helper function to extract international exposure (e.g., education abroad)
const extractInternationalExposure = (entity: MatchedEntity): PoliticalExposureItem[] => {
    if (!entity?.properties?.education) return []

    return entity.properties.education.map((edu: string): PoliticalExposureItem => ({
        position: `Student at ${edu}`,
        startDate: "Unknown",
        endDate: "Unknown",
        location: edu.includes("Russia") ? "Russia" : "International",
    }))
}

// Helper function to create sanction items from datasets
const extractSanctions = (entity: MatchedEntity): SanctionItem[] => {
    if (!entity?.datasets) return []

    const datasetToAuthority: Record<string, { authority1: string; authority2: string }> = {
        "us_ofac_sdn": { authority1: "United States Treasury", authority2: "OFAC SDN List" },
        "eu_fsf": { authority1: "European Union", authority2: "Financial Sanctions Files" },
        "gb_hmt_sanctions": { authority1: "United Kingdom", authority2: "HMT Sanctions List" },
        // Add more mappings as needed
    }

    return entity.datasets.map((dataset: string): SanctionItem => {
        const authority = datasetToAuthority[dataset] || { authority1: "Unknown", authority2: dataset }
        return {
            authority1: authority.authority1,
            authority2: authority.authority2,
            from: entity.first_seen || "Unknown",
            reason: entity.properties.notes?.[0] || `Listed in ${dataset}`,
        }
    })
}

// Helper function to create PEP database entries
const extractPepEntries = (entity: MatchedEntity): PepDatabaseItem[] => {
    if (!entity) return []

    const entries: PepDatabaseItem[] = [
        {
            name: entity.caption,
            topics: entity.properties.topics || [],
            score: 1.00, // Placeholder since API doesn't provide score
            sources: entity.datasets?.join(", ") || "",
        },
    ]

    if (entity.properties.familyRelative) {
        entries.push(
            ...entity.properties.familyRelative.map((family: FamilyRelative): PepDatabaseItem => {
                const relative = family.properties.relative?.[0]
                return {
                    relationType: family.properties.relationship?.[0]?.toUpperCase(),
                    person: relative?.caption,
                    topics: relative?.properties?.topics || [],
                    score: 0.50, // Placeholder
                    sources: relative?.datasets?.join(", ") || "",
                }
            })
        )
    }

    return entries
}

// Helper function to format topic codes to readable labels
const formatTopics = (topicCodes?: string[]): string => {
    if (!topicCodes) return ""
    return topicCodes.map((code) => topics[code] || code).join(", ")
}

interface VerificationUIProps {
    verificationData: VerificationResponse
    personData: PersonData
}

export default function VerificationUI({ verificationData, personData }: VerificationUIProps) {
    const normalizedRiskLevel = (verificationData.riskLevel || "LOW").toUpperCase() as "LOW" | "MEDIUM" | "HIGH"
    const isLowRisk = normalizedRiskLevel === "LOW"
    const entityData: MatchedEntity = verificationData.matchedEntity || {} as MatchedEntity

    // Extract data from API response
    const politicalExposure: PoliticalExposureItem[] = extractPoliticalExposure(entityData)
    const internationalExposure: PoliticalExposureItem[] = extractInternationalExposure(entityData)
    const sanctionsData: SanctionItem[] = extractSanctions(entityData)
    const pepEntries: PepDatabaseItem[] = extractPepEntries(entityData)

    // Risk meter configuration
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

    const gaugePathD: string = gaugePosition[normalizedRiskLevel] || gaugePosition.LOW
    const gaugeCircle: { cx: string; cy: string } = gaugeCirclePosition[normalizedRiskLevel] || gaugeCirclePosition.LOW

    return (
        <div className="min-h-screen bg-[#3d3d3d] text-white font-sans">
            <div className="container mx-auto pt-6 px-4 relative">
                {/* Header */}
                <div className="flex justify-center mb-4">
                    <div className="bg-[#54f4fc] text-black font-semibold py-2 px-8 rounded-full">AML CHECKS</div>
                </div>
                <div className="flex justify-between items-center mb-8">
                    <div className="relative">
                        <div className="bg-[#e0e0e0] p-4 rounded-md">
                            <User className="text-[#3d3d3d]" size={24} />
                        </div>
                        <div className="absolute -top-1 -right-1">
                            <div className="bg-[#ec1c24] rounded-full w-5 h-5 flex items-center justify-center text-white text-xs">
                                <User2 />
                            </div>
                        </div>
                    </div>
                    <Link href="/verifications" className="flex items-center text-[#54f4fc] text-sm">
                        <span>Go to All Verifications</span>
                        <ArrowRight className="ml-1" size={16} />
                    </Link>
                </div>

                {/* Risk Meter */}
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
                                stroke={riskColors[normalizedRiskLevel]}
                                strokeWidth="8"
                                strokeLinecap="round"
                            />
                            <circle
                                cx={gaugeCircle.cx}
                                cy={gaugeCircle.cy}
                                r="6"
                                fill={riskColors[normalizedRiskLevel]}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center mt-4">
                            <span className="text-2xl font-bold" style={{ color: riskColors[normalizedRiskLevel] }}>
                                {normalizedRiskLevel === "MEDIUM" ? "MED" : normalizedRiskLevel}
                            </span>
                        </div>
                    </div>
                    <div className="text-sm text-center">
                        <p className="text-[#a2a2a2]">Risk assessment score</p>
                        <p className="text-[#a2a2a2] text-xs">Last Check on {new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Personal Information */}
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
                        <p className="font-medium">{entityData?.caption || personData.name.toUpperCase()}</p>
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
                            {entityData?.properties?.topics ? formatTopics(entityData.properties.topics).toUpperCase() : personData.role}
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
                                    <AlertTriangle className="text-[#137a08] mr-2" />
                                    <span>Not found in any Global sanctions lists</span>
                                </div>
                                <div className="bg-[#137a08] text-white px-3 py-1 text-xs font-semibold rounded">PASSED</div>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <div className="flex items-center">
                                    <AlertTriangle className="text-[#137a08] mr-2" />
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
                                <span>{verificationData.reasons[0]}. Further verification may be required.</span>
                            </div>
                        </div>

                        {/* Political Exposure */}
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
                                                <tr key={index} className={index < politicalExposure.length - 1 ? "border-b border-[#333333]" : ""}>
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

                        {/* International Exposure */}
                        {internationalExposure.length > 0 && (
                            <div className="mb-6">
                                <div className="bg-[#d9d9d9] py-2 px-4 text-black font-medium">RISK FACTOR: INTERNATIONAL EXPOSURE</div>
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
                                            {internationalExposure.map((item, index) => (
                                                <tr key={index} className={index < internationalExposure.length - 1 ? "border-b border-[#333333]" : ""}>
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

                        {/* Comprehensive Screening */}
                        <div className="bg-white py-4 px-6">
                            <h2 className="text-[#075c61] font-medium text-lg">Comprehensive screening</h2>
                        </div>

                        {/* Sanctions */}
                        {sanctionsData.length > 0 && (
                            <div className="mb-6">
                                <div className="bg-[#d9d9d9] py-2 px-4 text-black font-medium">
                                    Found in <span className="text-[#ec1c24] font-bold">{sanctionsData.length}</span> Global sanctions lists
                                </div>
                                <div className="bg-black">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-[#25333a]">
                                                <th className="py-2 px-4 text-left text-[#54f4fc]">Authority</th>
                                                <th className="py-2 px-4 text-left text-[#54f4fc]">Authority</th>
                                                <th className="py-2 px-4 text-left text-[#54f4fc]">From</th>
                                                <th className="py-2 px-4 text-left text-[#54f4fc]">Reason</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sanctionsData.map((item, index) => (
                                                <tr key={index} className={index < sanctionsData.length - 1 ? "border-b border-[#333333]" : ""}>
                                                    <td className="py-2 px-4 text-[#54f4fc]">{item.authority1}</td>
                                                    <td className="py-2 px-4">{item.authority2}</td>
                                                    <td className="py-2 px-4">{item.from}</td>
                                                    <td className="py-2 px-4">{item.reason}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* PEP Database */}
                        {pepEntries.length > 0 && (
                            <div className="mb-6">
                                <div className="bg-[#d9d9d9] py-2 px-4 text-black font-medium">
                                    <span className="text-[#ec1c24] font-bold">{pepEntries.length}</span> has been located in our Global Collection of the PEP Database.
                                </div>
                                <div className="bg-black">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-[#25333a]">
                                                <th className="py-2 px-4 text-left text-[#54f4fc]">Name</th>
                                                <th className="py-2 px-4 text-left text-[#54f4fc]">Topics</th>
                                                <th className="py-2 px-4 text-left text-[#54f4fc]">Score</th>
                                                <th className="py-2 px-4 text-left text-[#54f4fc]">Database sources</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pepEntries.map((item, index) => (
                                                <tr key={index} className={index < pepEntries.length - 1 ? "border-b border-[#333333]" : ""}>
                                                    <td className="py-2 px-4 text-[#54f4fc]">
                                                        {item.relationType ? (
                                                            <>
                                                                <div>Relationship type</div>
                                                                <div>{item.relationType}</div>
                                                            </>
                                                        ) : (
                                                            item.name
                                                        )}
                                                    </td>
                                                    <td className="py-2 px-4">
                                                        {item.relationType ? (
                                                            <>
                                                                <div>PERSON</div>
                                                                <div>{item.person}</div>
                                                            </>
                                                        ) : (
                                                            formatTopics(item.topics)
                                                        )}
                                                    </td>
                                                    <td className="py-2 px-4">
                                                        {item.relationType ? (
                                                            <>
                                                                <div>Topics</div>
                                                                <div>{formatTopics(item.topics)}</div>
                                                            </>
                                                        ) : (
                                                            item.score.toFixed(2)
                                                        )}
                                                    </td>
                                                    <td className="py-2 px-4">
                                                        {item.relationType ? (
                                                            <>
                                                                <div>Score</div>
                                                                <div>{item.score.toFixed(2)}</div>
                                                            </>
                                                        ) : (
                                                            item.sources
                                                        )}
                                                    </td>
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