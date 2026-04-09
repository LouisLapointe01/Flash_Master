import type { SVGProps } from "react";

interface HudIconProps extends SVGProps<SVGSVGElement> {
    size?: number;
}

function BaseIcon({ size = 18, children, ...props }: HudIconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="square"
            strokeLinejoin="miter"
            aria-hidden="true"
            {...props}
        >
            {children}
        </svg>
    );
}

export function HudHomeIcon(props: HudIconProps) {
    return (
        <BaseIcon {...props}>
            <path d="M3 11L12 3L21 11" />
            <path d="M6 10V20H18V10" />
            <path d="M10 20V14H14V20" />
        </BaseIcon>
    );
}

export function HudDeckIcon(props: HudIconProps) {
    return (
        <BaseIcon {...props}>
            <rect x="4" y="6" width="14" height="12" />
            <path d="M7 9H15" />
            <path d="M7 12H14" />
            <path d="M7 15H12" />
            <path d="M18 8L20 9V19L6 21L4 20" />
        </BaseIcon>
    );
}

export function HudQuizIcon(props: HudIconProps) {
    return (
        <BaseIcon {...props}>
            <path d="M12 4C8 4 5 6.7 5 10C5 12.8 7 15.1 10 15.8V18L13 16V15.8C16 15.1 19 12.8 19 10C19 6.7 16 4 12 4Z" />
            <path d="M10.6 9.2C10.7 8.2 11.3 7.6 12.2 7.6C13.1 7.6 13.8 8.2 13.8 9C13.8 10.5 11.9 10.8 11.9 12.1" />
            <path d="M12 14.3H12.1" />
        </BaseIcon>
    );
}

export function HudTrainingIcon(props: HudIconProps) {
    return (
        <BaseIcon {...props}>
            <circle cx="12" cy="12" r="8" />
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2V5" />
            <path d="M12 19V22" />
            <path d="M2 12H5" />
            <path d="M19 12H22" />
        </BaseIcon>
    );
}

export function HudRankedIcon(props: HudIconProps) {
    return (
        <BaseIcon {...props}>
            <path d="M6 18L4 16L9 11L11 13L6 18Z" />
            <path d="M18 6L20 8L15 13L13 11L18 6Z" />
            <path d="M9 13L11 11" />
            <path d="M13 13L11 15" />
        </BaseIcon>
    );
}

export function HudShieldIcon(props: HudIconProps) {
    return (
        <BaseIcon {...props}>
            <path d="M12 3L19 6V12C19 16 16.3 19.2 12 21C7.7 19.2 5 16 5 12V6L12 3Z" />
            <path d="M9 12L11 14L15 10" />
        </BaseIcon>
    );
}

export function HudSocialIcon(props: HudIconProps) {
    return (
        <BaseIcon {...props}>
            <circle cx="8" cy="9" r="2" />
            <circle cx="16" cy="9" r="2" />
            <path d="M4 18C4 15.8 5.9 14 8 14C10.1 14 12 15.8 12 18" />
            <path d="M12 18C12 15.8 13.9 14 16 14C18.1 14 20 15.8 20 18" />
        </BaseIcon>
    );
}

export function HudStatsIcon(props: HudIconProps) {
    return (
        <BaseIcon {...props}>
            <path d="M4 20V4" />
            <path d="M4 20H20" />
            <rect x="7" y="12" width="2.8" height="6" />
            <rect x="11.6" y="9" width="2.8" height="9" />
            <rect x="16.2" y="6" width="2.8" height="12" />
        </BaseIcon>
    );
}

export function HudExploreIcon(props: HudIconProps) {
    return (
        <BaseIcon {...props}>
            <circle cx="12" cy="12" r="9" />
            <path d="M15.8 8.2L13.2 13.2L8.2 15.8L10.8 10.8L15.8 8.2Z" />
        </BaseIcon>
    );
}

export function HudSuggestIcon(props: HudIconProps) {
    return (
        <BaseIcon {...props}>
            <path d="M5 6H19V16H10L6 20V16H5V6Z" />
            <path d="M8 10H16" />
            <path d="M8 13H13" />
        </BaseIcon>
    );
}

export function HudBellIcon(props: HudIconProps) {
    return (
        <BaseIcon {...props}>
            <path d="M6 16V11C6 7.8 8.2 5 12 5C15.8 5 18 7.8 18 11V16L20 18H4L6 16Z" />
            <path d="M10 20C10.5 21 11.2 21.5 12 21.5C12.8 21.5 13.5 21 14 20" />
        </BaseIcon>
    );
}

export function HudCogIcon(props: HudIconProps) {
    return (
        <BaseIcon {...props}>
            <circle cx="12" cy="12" r="3.2" />
            <path d="M12 4V2" />
            <path d="M12 22V20" />
            <path d="M4 12H2" />
            <path d="M22 12H20" />
            <path d="M17.7 6.3L19.1 4.9" />
            <path d="M4.9 19.1L6.3 17.7" />
            <path d="M17.7 17.7L19.1 19.1" />
            <path d="M4.9 4.9L6.3 6.3" />
        </BaseIcon>
    );
}

export function HudExitIcon(props: HudIconProps) {
    return (
        <BaseIcon {...props}>
            <path d="M10 4H4V20H10" />
            <path d="M14 8L20 12L14 16" />
            <path d="M20 12H9" />
        </BaseIcon>
    );
}

export function HudCloseIcon(props: HudIconProps) {
    return (
        <BaseIcon {...props}>
            <path d="M5 5L19 19" />
            <path d="M19 5L5 19" />
        </BaseIcon>
    );
}
