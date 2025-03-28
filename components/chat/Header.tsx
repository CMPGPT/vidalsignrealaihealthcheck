import { cn } from "@/lib/utils";

interface HeaderProps {
    className?: string;
}

const Header = ({ className }: HeaderProps) => {
    return (
        <header className={cn("w-full py-5 px-6 flex justify-center", className)}>
            <div className="animate-fade-in-scale">
                <h1 className="text-3xl font-semibold tracking-tight">
                    <span className="text-2xl font-bold text-primary">Vidal Chat</span>
                </h1>
            </div>
        </header>
    );
};

export default Header;
