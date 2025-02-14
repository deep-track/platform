"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, Trash2, Eye, EyeOff, Key, Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatDistanceToNow } from "date-fns"
import toast, { Toaster } from "react-hot-toast"
import { createApiKey, revokeApiKey, getApiKeys } from "@/lib/actions"
import type { ApiKey } from "./page"

export default function ApiKeysUI({ initialApiKeys }: { initialApiKeys: ApiKey[] }) {
    const [apiKeys, setApiKeys] = useState<ApiKey[]>(initialApiKeys)
    const [newKey, setNewKey] = useState<string>("")
    const [showKey, setShowKey] = useState(false)
    const [keyName, setKeyName] = useState("")
    const [loading, setLoading] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
    const [keyToRevoke, setKeyToRevoke] = useState<string | null>(null)


    const handleCreateKey = async () => {
        if (!keyName.trim()) {
            toast.error("Please enter a key name")
            return
        }

        setLoading(true)
        const result = await createApiKey(keyName)
        if (result.success) {
            setNewKey(result.apiKey)
            const updatedKeys = await getApiKeys()
            setApiKeys(updatedKeys)
            toast.success("API key created successfully")
        } else {
            toast.error(result.error || "Failed to create API key")
        }
        setLoading(false)
    }

    const confirmRevoke = async () => {
        if (keyToRevoke) {
            const result = await revokeApiKey(keyToRevoke)
            if (result.success) {
                const updatedKeys = await getApiKeys()
                setApiKeys(updatedKeys)
                toast.success("API key revoked successfully")
            } else {
                toast.error(result.error || "Failed to revoke API key")
            }
            setConfirmDialogOpen(false)
            setKeyToRevoke(null)
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success("Copied to clipboard")
    }

    const resetDialog = () => {
        setNewKey("")
        setShowKey(false)
        setKeyName("")
        setIsDialogOpen(false)
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Toaster />
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <h1 className="text-2xl font-bold">API Keys</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="w-full sm:w-auto">
                            <Plus className="mr-2 h-4 w-4" />
                            Create New Key
                        </Button>
                    </DialogTrigger>

                    <DialogContent onInteractOutside={resetDialog}>
                        <DialogHeader>
                            <DialogTitle>Create New API Key</DialogTitle>
                            <DialogDescription>
                                API keys authenticate your requests to our API services.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Key Name</label>
                                <Input
                                    placeholder="e.g. 'Production Server'"
                                    value={keyName}
                                    onChange={(e) => setKeyName(e.target.value)}
                                    disabled={loading}
                                />
                                <p className="text-sm text-muted-foreground">Optional name for your reference</p>
                            </div>

                            {newKey && (
                                <Card>
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center space-x-2">
                                            <Key className="h-5 w-5 text-primary" />
                                            <CardTitle>Your New API Key</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg border">
                                            <code className="text-sm font-mono break-all">
                                                {showKey ? newKey : `${newKey.slice(0, 8)}*****${newKey.slice(-4)}`}
                                            </code>
                                            <div className="flex gap-2 ml-4">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setShowKey(!showKey)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    {showKey ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => copyToClipboard(newKey)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-destructive mt-3">
                                            ⚠️ This key will only be shown once. Store it securely!
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        <DialogFooter>
                            <div className="flex gap-2 w-full">
                                <Button
                                    onClick={handleCreateKey}
                                    disabled={loading || !!newKey}
                                    className="flex-1"
                                >
                                    {loading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        "Create Key"
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={resetDialog}
                                    className="flex-1"
                                >
                                    {newKey ? "Close" : "Cancel"}
                                </Button>
                            </div>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm API Key Revocation</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to revoke this API key? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="destructive" onClick={confirmRevoke}>
                            Revoke Key
                        </Button>
                        <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="rounded-lg border">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-[25%]">Name</TableHead>
                            <TableHead className="w-[20%]">Key</TableHead>
                            <TableHead className="w-[25%]">Created</TableHead>
                            <TableHead className="w-[25%]">Last Used</TableHead>
                            <TableHead className="w-[5%] text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {apiKeys.map((key) => (
                            <TableRow key={key.id} className="hover:bg-muted/10">
                                <TableCell className="font-medium">
                                    {key.name || <span className="text-muted-foreground">Unnamed</span>}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className="font-mono py-1">
                                        {key.prefix}•••••
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {formatDistanceToNow(new Date(key.createdAt), { addSuffix: true })}
                                </TableCell>
                                <TableCell>
                                    {key.lastUsed ? (
                                        formatDistanceToNow(new Date(key.lastUsed), { addSuffix: true })
                                    ) : (
                                        <span className="text-muted-foreground">Never</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            setKeyToRevoke(key.id)
                                            setConfirmDialogOpen(true)
                                        }}
                                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {apiKeys.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    No API keys found. Create one to get started.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}