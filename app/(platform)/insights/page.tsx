// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Progress } from "@/components/ui/progress"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import { Button } from "@/components/ui/button"
// import { MoreVertical, Download, Trash2,  } from "lucide-react"
import ComingSoonPage from "../_components/coming-soon"

export default function SecurityDashboard() {
  return (
    <>
      <ComingSoonPage />
    </>
    // <div className="p-6 space-y-6 pt-2">
    //   {/* Stats Cards Grid */}
    //   <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    //     {/* GAN Detector Cards */}
    //     <Card className="bg-zinc-900 text-white">
    //       <CardHeader className="flex flex-row items-center justify-between">
    //         <CardTitle>GAN Generated Image Detector</CardTitle>
    //         <Button variant="ghost" size="icon">
    //           <MoreVertical className="h-4 w-4" />
    //         </Button>
    //       </CardHeader>
    //       <CardContent className="space-y-4">
    //         <div className="relative aspect-square flex items-center justify-center">
    //           <div className="absolute inset-0">
    //             <svg className="w-full h-full">
    //               <circle
    //                 className="text-emerald-500"
    //                 strokeWidth="10"
    //                 stroke="currentColor"
    //                 fill="transparent"
    //                 r="150"
    //                 cx="50%"
    //                 cy="50%"
    //                 style={{
    //                   transform: "rotate(-90deg)",
    //                   transformOrigin: "50% 50%",
    //                   strokeDasharray: "940",
    //                   strokeDashoffset: "94",
    //                 }}
    //               />
    //             </svg>
    //           </div>
    //           <div className="text-center">
    //             <div className="text-5xl font-bold">9.3</div>
    //             <div className="text-sm text-zinc-400">Total Score</div>
    //           </div>
    //         </div>
    //         <div className="space-y-2">
    //           <div className="flex justify-between text-sm">
    //             <span>Successful</span>
    //             <span>145 people</span>
    //           </div>
    //           <div className="flex justify-between text-sm">
    //             <span>Flagged</span>
    //             <span>1,465</span>
    //           </div>
    //         </div>
    //       </CardContent>
    //     </Card>

    //     {/* Face Blending Card */}
    //     <Card className="bg-zinc-900 text-white">
    //       <CardHeader className="flex flex-row items-center justify-between">
    //         <CardTitle>Face Blending Fake Detector</CardTitle>
    //         <Button variant="ghost" size="icon">
    //           <MoreVertical className="h-4 w-4" />
    //         </Button>
    //       </CardHeader>
    //       <CardContent className="space-y-4">
    //         <div className="relative aspect-square flex items-center justify-center">
    //           <div className="absolute inset-0">
    //             <svg className="w-full h-full">
    //               <circle
    //                 className="text-red-500"
    //                 strokeWidth="10"
    //                 stroke="currentColor"
    //                 fill="transparent"
    //                 r="150"
    //                 cx="50%"
    //                 cy="50%"
    //                 style={{
    //                   transform: "rotate(-90deg)",
    //                   transformOrigin: "50% 50%",
    //                   strokeDasharray: "940",
    //                   strokeDashoffset: "800",
    //                 }}
    //               />
    //             </svg>
    //           </div>
    //           <div className="text-center">
    //             <div className="text-5xl font-bold">3.3</div>
    //             <div className="text-sm text-zinc-400">Total Score</div>
    //           </div>
    //         </div>
    //         <div className="space-y-2">
    //           <div className="flex justify-between text-sm">
    //             <span>Successful</span>
    //             <span>145 people</span>
    //           </div>
    //           <div className="flex justify-between text-sm">
    //             <span>Flagged</span>
    //             <span>1,465</span>
    //           </div>
    //         </div>
    //       </CardContent>
    //     </Card>

    //     {/* Diffusion Card */}
    //     <Card className="bg-zinc-900 text-white">
    //       <CardHeader className="flex flex-row items-center justify-between">
    //         <CardTitle>Diffusion generated image detection</CardTitle>
    //         <Button variant="ghost" size="icon">
    //           <MoreVertical className="h-4 w-4" />
    //         </Button>
    //       </CardHeader>
    //       <CardContent className="space-y-4">
    //         <div className="relative aspect-square flex items-center justify-center">
    //           <div className="absolute inset-0">
    //             <svg className="w-full h-full">
    //               <circle
    //                 className="text-yellow-500"
    //                 strokeWidth="10"
    //                 stroke="currentColor"
    //                 fill="transparent"
    //                 r="150"
    //                 cx="50%"
    //                 cy="50%"
    //                 style={{
    //                   transform: "rotate(-90deg)",
    //                   transformOrigin: "50% 50%",
    //                   strokeDasharray: "940",
    //                   strokeDashoffset: "47",
    //                 }}
    //               />
    //             </svg>
    //           </div>
    //           <div className="text-center">
    //             <div className="text-5xl font-bold">95%</div>
    //             <div className="text-sm text-zinc-400">Based on likes</div>
    //           </div>
    //         </div>
    //       </CardContent>
    //     </Card>
    //   </div>

    //   {/* Previous Analysis - Full Width */}
    //   <Card className="bg-zinc-900 text-white w-full">
    //     <CardHeader className="flex flex-row items-center justify-between">
    //       <div>
    //         <CardTitle>Previous Analysis</CardTitle>
    //         <p className="text-sm text-zinc-400">30 done this month</p>
    //       </div>
    //       <div className="space-x-2">
    //         <Button variant="secondary" size="sm">
    //           <Download className="h-4 w-4 mr-2" />
    //           Export all data
    //         </Button>
    //         <Button variant="secondary" size="sm">
    //           <Trash2 className="h-4 w-4 mr-2" />
    //           Clear all data
    //         </Button>
    //       </div>
    //     </CardHeader>
    //     <CardContent>
    //       <ScrollArea className="h-[400px] pr-4">
    //         <div className="space-y-4">
    //           {[
    //             { name: "Ralph Edward", time: "13 min ago", status: "Approved", score: 60 },
    //             { name: "Frank Anthony", time: "13 min ago", status: "Denied", score: 10 },
    //             { name: "Jacob Goh", time: "13 min ago", status: "Approved", score: 100 },
    //             { name: "Emanuel Mark", time: "13 min ago", status: "Approved", score: 100 },
    //             { name: "Ben Carson", time: "13 min ago", status: "Denied", score: 25 },
    //             { name: "Isaac Newton", time: "13 min ago", status: "Denied", score: 40 },
    //           ].map((item, i) => (
    //             <div key={i} className="flex items-center justify-between">
    //               <div className="flex items-center space-x-4">
    //                 <div className="w-8 h-8 rounded-full bg-zinc-800" />
    //                 <div>
    //                   <div className="font-medium">{item.name}</div>
    //                   <div className="text-sm text-zinc-400">{item.time}</div>
    //                 </div>
    //               </div>
    //               <div className="flex items-center space-x-4">
    //                 <span className={item.status === "Approved" ? "text-emerald-500" : "text-red-500"}>
    //                   {item.status}
    //                 </span>
    //                 <Progress value={item.score} className="w-[100px]" />
    //               </div>
    //             </div>
    //           ))}
    //         </div>
    //       </ScrollArea>
    //     </CardContent>
    //   </Card>
    // </div>
  )
}

