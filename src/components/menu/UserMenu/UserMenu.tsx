import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useImpersonation } from "@/hooks/useImpersonation"
import { cn, initials } from "@/utils"
import { AvatarImage } from "@radix-ui/react-avatar"
import { Bell, LogOut, Settings2, UserRound, UserRoundMinus, UserRoundPlus } from "lucide-react"
import { PreferencesMenu } from "../PreferencesMenu"
import { useCurrentSession } from "@/hooks/useCurrentSession"
import { AccessLevel, AppUser } from "@/types"
import { signOut } from "next-auth/react"

export function UserMenu() {

    const { current } = useCurrentSession();
    const { actor, subject, isImpersonating, startImpersonation, stopImpersonation } = useImpersonation();

    const isDemo = current.dataScope === "LOCAL";
    const canImpersonate = current.dataScope === "REMOTE" && actor?.canUseImpersonation;
    const hasSubject = isImpersonating && !!subject;

    const demoImpersonating = (permission: AccessLevel) => {

        let test = {
            ...actor,
            permission: permission
        } as AppUser;

        switch (permission) {
            case "ADMIN": test.name = "Demo Admin"; break;
            case "MANAGER": test.name = "Demo Manager"; break;
            case "USER": test.name = "Demo User"; break;
            case "GUEST": test.name = "Demo Guest"; break;
        }

        onStartImpersonating(test);
    }

    const onStartImpersonating = (user: AppUser) => {
        startImpersonation(user);
    }

    const onStopImpersonating = () => {
        stopImpersonation();
    }

    const renderUserAvatar = (
        user: AppUser | null,
        options?: { size?: number; muted?: boolean; }
    ) => {
        if (!user) return null;

        const { size = 10, muted } = options ?? {};

        return (
            <Avatar className={cn(`h-${size} w-${size}`)}>
                <AvatarImage src={user.image} alt={user.name} />
                <AvatarFallback
                    className={cn(
                        muted ? "bg-muted-foreground" : "bg-foreground",
                        "text-background"
                    )}
                >
                    {initials(user.name)}
                </AvatarFallback>
            </Avatar>
        );
    };

    const renderImpersonationAvatar = (actor: AppUser, subject: AppUser) => {
        if (!actor || !subject) return null;

        return (
            <div className="relative w-14 h-10">
                {/* actor */}
                <div className="absolute left-0 top-0">
                    {renderUserAvatar(actor, { muted: true, })}
                </div>

                {/* subject */}
                <div className="absolute left-4 top-0 z-10">
                    {renderUserAvatar(subject)}
                </div>
            </div>
        );
    };

    const DemoImpersonation = ({ permission }: { permission: AccessLevel }) => {
        return (
            <DropdownMenuSub>
                <DropdownMenuSubTrigger>Impersonation</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                        {
                            permission !== "ADMIN" && (<DropdownMenuItem onClick={() => demoImpersonating("ADMIN")}>As admin</DropdownMenuItem>)
                        }
                        {
                            permission !== "MANAGER" && (<DropdownMenuItem onClick={() => demoImpersonating("MANAGER")}>As manager</DropdownMenuItem>)
                        }
                        {
                            permission !== "USER" && (<DropdownMenuItem onClick={() => demoImpersonating("USER")}>As user</DropdownMenuItem>)
                        }
                        {
                            permission !== "GUEST" && (<DropdownMenuItem onClick={() => demoImpersonating("GUEST")}>As guest</DropdownMenuItem>)
                        }
                    </DropdownMenuSubContent>
                </DropdownMenuPortal>
            </DropdownMenuSub>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-20">
                    {hasSubject
                        ? renderImpersonationAvatar(actor, subject)
                        : renderUserAvatar(actor)}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-2 mt-2 mr-1" align="start">
                <DropdownMenuGroup><DropdownMenuLabel className="flex gap-2">
                    {renderUserAvatar(actor, {
                        muted: hasSubject,
                    })}
                    <div className="flex flex-col">
                        <span>{actor?.name}</span>
                        <span className="text-muted-foreground font-normal">
                            {actor?.email}
                        </span>
                    </div>
                </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem>
                            <UserRound />
                            {current.dataScope}
                        </DropdownMenuItem>
                        <PreferencesMenu>
                            <DropdownMenuItem>
                                <Settings2 />
                                <span>{"Preferences"}</span>
                            </DropdownMenuItem>
                        </PreferencesMenu>
                        <DropdownMenuItem><Bell />
                            Notifications
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()}>
                        <LogOut />
                        Log out
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />

                {hasSubject && subject && (
                    <DropdownMenuGroup>
                        <DropdownMenuLabel className="flex gap-2">
                            {renderUserAvatar(subject)}
                            <div className="flex flex-col">
                                <span>{subject.name}</span>
                                <span className="text-muted-foreground font-normal">
                                    {subject.email}
                                </span>
                            </div>
                        </DropdownMenuLabel>

                        <DropdownMenuSeparator />

                        {isDemo && <DemoImpersonation permission={subject.permission} />}

                        <DropdownMenuItem onClick={onStopImpersonating}>
                            <UserRoundMinus />
                            Stop impersonation
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                )}

                {!hasSubject && isDemo && actor && (
                    <DemoImpersonation permission={actor.permission} />
                )}

                {!hasSubject && canImpersonate && (
                    <DropdownMenuGroup>
                        <DropdownMenuItem>
                            <UserRoundPlus />
                            Start impersonation
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                )}

            </DropdownMenuContent>
        </DropdownMenu>
    )
}