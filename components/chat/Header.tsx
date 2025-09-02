import { cn } from "@/lib/utils";

interface BrandSettings {
  brandName: string;
  logoUrl?: string;
  customColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

interface HeaderProps {
    className?: string;
    brandSettings?: BrandSettings | null;
    partnerId?: string | null;
}

const Header = ({ className, brandSettings, partnerId }: HeaderProps) => {
    // Use partner's primary color only if it's not a starter user
    const shouldUsePartnerColor = partnerId && partnerId !== 'starter-user';
    const textColor = shouldUsePartnerColor && brandSettings?.customColors?.primary 
        ? brandSettings.customColors.primary 
        : 'var(--primary)';

    return (
        <header className={cn("w-full py-5 px-6 flex justify-center bg-white border-b border-gray-200", className)}>
            <div className="animate-fade-in-scale flex items-center gap-3">
                {brandSettings?.logoUrl && (
                    <img 
                        src={brandSettings.logoUrl} 
                        alt={brandSettings.brandName}
                        className="h-8 w-8 rounded object-cover"
                    />
                )}
                <h1 className="text-3xl font-semibold tracking-tight text-[#2563eb]">
                    <span 
                        className="text-2xl font-bold"
                        style={{ 
                            color: textColor
                        }}
                    >
                        {partnerId === 'starter-user' ? 'Vidal Sign Secure Chat' : (brandSettings?.brandName || 'Vidal Chat')}
                    </span>
                </h1>
            </div>
        </header>
    );
};

export default Header;
