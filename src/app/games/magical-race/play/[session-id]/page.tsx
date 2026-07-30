import { MagicalRaceGame } from "@/components/magical-race/magical-race-game"
type Props = { params: Promise<{ "session-id": string }> }
export default async function MagicalRaceSessionPage({ params }: Props) {
	return <MagicalRaceGame sessionId={(await params)["session-id"]} />
}
