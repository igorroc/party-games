import Image from "next/image"

type HiddenFaceAvatarProps = {
	seed: string
	style: "adventurer" | "adventurer-neutral"
	alt: string
	className?: string
	priority?: boolean
}

const DICEBEAR_BASE_URL = "https://api.dicebear.com/10.x"

export function HiddenFaceAvatar({
	seed,
	style,
	alt,
	className,
	priority = false,
}: HiddenFaceAvatarProps) {
	const src = `${DICEBEAR_BASE_URL}/${style}/svg?seed=${encodeURIComponent(seed)}`
	return (
		<Image
			src={src}
			alt={alt}
			width={160}
			height={160}
			priority={priority}
			unoptimized
			className={className}
		/>
	)
}
