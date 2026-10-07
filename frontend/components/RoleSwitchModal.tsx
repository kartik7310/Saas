"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import { User } from "lucide-react";

interface RoleSwitchModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description: string;
    targetRoles?: string[]; // Change to array
}

export default function RoleSwitchModal({
    isOpen,
    onClose,
    title,
    description,
    targetRoles
}: RoleSwitchModalProps) {
    const { switchRole } = useAuth();

    const handleSwitch = async (role: string) => {
        await switchRole(role, false);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] rounded-2xl p-6 border-none shadow-2xl">
                <DialogHeader className="flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-purple-600" />
                    </div>
                    <div className="space-y-2">
                        <DialogTitle className="text-xl font-bold text-gray-900">{title}</DialogTitle>
                        <DialogDescription className="text-sm text-gray-500 leading-relaxed">
                            {description}
                        </DialogDescription>
                    </div>
                </DialogHeader>
                <div className="flex flex-col gap-4 mt-8 w-full">
                    <div className="flex flex-col gap-3 w-full">
                        {targetRoles?.map((role) => (
                            <Button
                                key={role}
                                onClick={() => handleSwitch(role)}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-12 font-bold shadow-lg shadow-purple-100 transition-all text-sm active:scale-[0.98]"
                            >
                                Switch to {role.charAt(0) + role.slice(1).toLowerCase()} Account
                            </Button>
                        ))}
                    </div>
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="w-full rounded-xl h-11 font-semibold text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all text-sm mt-2"
                    >
                        Maybe Later
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
