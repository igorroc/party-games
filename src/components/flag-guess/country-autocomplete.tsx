"use client"

import { useEffect, useId, useRef, useState } from "react"
import type { FlagGuessCountryOption } from "@/modules/flag-guess/types"

type CountryAutocompleteProps = {
	options: FlagGuessCountryOption[]
	value: string
	onChange: (code: string) => void
	disabledCodes?: ReadonlySet<string>
	disabled?: boolean
}

function normalize(value: string) {
	return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim()
}

function filterOptions(options: FlagGuessCountryOption[], query: string) {
	const needle = normalize(query)
	if (!needle) return options
	const starts: FlagGuessCountryOption[] = []
	const contains: FlagGuessCountryOption[] = []
	for (const option of options) {
		const name = normalize(option.name)
		if (name.startsWith(needle)) starts.push(option)
		else if (name.includes(needle)) contains.push(option)
	}
	return [...starts, ...contains]
}

export function CountryAutocomplete({
	options,
	value,
	onChange,
	disabledCodes,
	disabled,
}: CountryAutocompleteProps) {
	const id = useId()
	const listRef = useRef<HTMLUListElement>(null)
	const [query, setQuery] = useState(() => options.find((item) => item.code === value)?.name ?? "")
	const [open, setOpen] = useState(false)
	const [activeIndex, setActiveIndex] = useState(0)
	const filtered = filterOptions(options, query)
	const listId = `${id}-listbox`

	useEffect(() => {
		if (open) listRef.current?.children[activeIndex]?.scrollIntoView({ block: "nearest" })
	}, [open, activeIndex])

	function select(option: FlagGuessCountryOption) {
		if (disabledCodes?.has(option.code)) return
		setQuery(option.name)
		onChange(option.code)
		setOpen(false)
	}

	function moveActive(step: 1 | -1) {
		if (!open) {
			setOpen(true)
			return
		}
		setActiveIndex((current) => (current + step + filtered.length) % Math.max(filtered.length, 1))
	}

	function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
		if (event.key === "ArrowDown") {
			event.preventDefault()
			moveActive(1)
		} else if (event.key === "ArrowUp") {
			event.preventDefault()
			moveActive(-1)
		} else if (event.key === "Enter" && open && filtered[activeIndex]) {
			event.preventDefault()
			select(filtered[activeIndex])
		} else if (event.key === "Escape" && open) {
			event.preventDefault()
			setOpen(false)
		}
	}

	return (
		<div className="relative">
			<input
				role="combobox"
				aria-label="País"
				autoFocus
				aria-expanded={open}
				aria-controls={listId}
				aria-autocomplete="list"
				aria-activedescendant={
					open && filtered[activeIndex] ? `${id}-${filtered[activeIndex].code}` : undefined
				}
				value={query}
				disabled={disabled}
				onChange={(event) => {
					setQuery(event.target.value)
					setActiveIndex(0)
					setOpen(true)
					if (value) onChange("")
				}}
				onFocus={(event) => {
					event.target.select()
					setOpen(true)
				}}
				onBlur={() => setOpen(false)}
				onKeyDown={handleKeyDown}
				autoComplete="off"
				autoCapitalize="none"
				spellCheck={false}
				placeholder="Digite para buscar o país"
				className="setup-control text-lg"
			/>
			{open && (
				<ul
					ref={listRef}
					id={listId}
					role="listbox"
					onMouseDown={(event) => event.preventDefault()}
					className="border-border bg-surface absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border-2 shadow-[4px_4px_0_rgb(var(--color-primary)/0.14)]"
				>
					{filtered.length === 0 ? (
						<li role="presentation" className="text-muted p-3 text-sm font-bold">
							Nenhum país encontrado.
						</li>
					) : (
						filtered.map((option, index) => {
							const isDisabled = disabledCodes?.has(option.code) ?? false
							return (
								<li
									key={option.code}
									id={`${id}-${option.code}`}
									role="option"
									aria-selected={option.code === value}
									aria-disabled={isDisabled}
									onClick={() => select(option)}
									onMouseEnter={() => setActiveIndex(index)}
									className={`cursor-pointer px-4 py-2 font-bold ${
										index === activeIndex ? "bg-primary/10" : ""
									} ${isDisabled ? "text-muted cursor-not-allowed line-through" : ""}`}
								>
									{option.name}
								</li>
							)
						})
					)}
				</ul>
			)}
		</div>
	)
}
