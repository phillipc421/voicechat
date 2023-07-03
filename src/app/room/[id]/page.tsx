export default function RoomPage({params}: {params: {id: string}}) {
    return <div>{`Room ${params.id}`}</div>
}