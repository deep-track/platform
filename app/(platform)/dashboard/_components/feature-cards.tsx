"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Shield, Fingerprint, QrCode, Film, Receipt, FileText } from "lucide-react"
import Image from "next/image"

export default function FeatureCards() {
  const features = [
    {
      title: "IPRS / GOVERNMENT CHECKS",
      description: "Integrated Population Registration System verification for enhanced identity validation.",
      icon: <Shield className="h-5 w-5" />,
      image: "https://images.unsplash.com/photo-1576016770956-debb63d92058?q=80&w=500&auto=format&fit=crop",
      alt: "Digital identity verification system",
    },
    {
      title: "LIVENESS DETECTION",
      description: "Advanced biometric verification to ensure the person is physically present during verification.",
      icon: <Fingerprint className="h-5 w-5" />,
      image: "https://images.unsplash.com/photo-1589254065878-42c9da997008?q=80&w=500&auto=format&fit=crop",
      alt: "Facial recognition and liveness detection",
    },
    {
      title: "SEND VERIFICATION LINK / QR CODE",
      description: "Securely send verification links or QR codes directly to users for streamlined verification.",
      icon: <QrCode className="h-5 w-5" />,
      image: "https://images.unsplash.com/photo-1595079676339-1534801ad6cf?q=80&w=500&auto=format&fit=crop",
      alt: "QR code scanning on mobile device",
    },
    {
      title: "MEDIA DEEPFAKE DETECTION",
      description: "Cutting-edge AI technology to identify manipulated media and prevent fraud.",
      icon: <Film className="h-5 w-5" />,
      image: "https://images.unsplash.com/photo-1633419461186-7d40a38105ec?q=80&w=500&auto=format&fit=crop",
      alt: "AI analyzing digital content for manipulation",
    },
    {
        title: "TAX INFORMATION VERIFICATION",
        description:
          "Automated verification of tax compliance status, income declarations, and financial history for comprehensive due diligence.",
        icon: <FileText className="h-5 w-5" />,
        image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=500&auto=format&fit=crop",
        alt: "Tax documents and financial compliance verification",
      },
    {
      title: "REQUEST A NEW FEATURE",
      description: "Don't see what you need? Request a custom verification feature for your specific requirements.",
      icon: <PlusCircle className="h-5 w-5" />,
      image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=500&auto=format&fit=crop",
      alt: "Innovation and feature development concept",
    },
  ]

  return (
    <div className="w-full py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card
            key={index}
            className="overflow-hidden border border-gray-200 hover:shadow-md transition-shadow duration-300"
          >
            <div className="relative h-48 w-full">
              <Image src={feature.image || "/placeholder.svg"} alt={feature.alt} fill className="object-cover" />
              <div className="absolute top-3 right-3">
                <Badge variant="secondary" className="bg-black text-white font-medium px-3 py-1">
                  Coming to DeepTrack
                </Badge>
              </div>
            </div>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                {feature.icon}
                <CardTitle className="text-lg font-bold">{feature.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm text-gray-600">{feature.description}</CardDescription>
            </CardContent>
            <CardFooter>
              <Button disabled className="w-full" variant={index === features.length - 1 ? "outline" : "default"}>
                {index === features.length - 1 ? (
                  <span className="flex items-center gap-2">
                    <PlusCircle className="h-4 w-4" /> Request Feature
                  </span>
                ) : (
                  "Coming Soon"
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

