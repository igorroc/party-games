import Image from "next/image"

type FlagImageProps = { src: string; alt: string; className?: string; priority?: boolean }

export function FlagImage({ src, alt, className = "", priority }: FlagImageProps) {
	return (
		<div
			className={`border-border relative aspect-[3/2] overflow-hidden rounded-2xl border-2 bg-white shadow-[5px_5px_0_rgb(var(--color-primary)/0.14)] ${className}`}
		>
			<Image
				src={src}
				alt={alt}
				fill
				unoptimized
				priority={priority}
				sizes="(min-width: 640px) 576px, 100vw"
				className="object-contain"
			/>
		</div>
	)
}
