"use client"
import Peer, {DataConnection, MediaConnection} from "peerjs"
import { SetStateAction, useEffect, useState, useRef, RefObject, LegacyRef } from "react"


interface AudioStreams {
  stream: MediaStream,
  peer: Peer,
  self: boolean 
}


export default function HomePageComp() {

  const [connected, setConnected] = useState(false);
  const [peerId, setPeerId] = useState<string | null>(null)

  const [peer, setPeer] = useState<Peer | null>(null)
  const [dCon, setDcon] = useState<DataConnection | null>(null);

  const [audioStreams, setAudioStreams] = useState<AudioStreams[]>([])

  const [chat, setChat] = useState<string[]>([]);


  useEffect(() => {
    if (dCon) {
      // watch errors
      dCon.on("error", err => console.log(err));
      // handle data
      dCon.on("data", data => {
        console.log(dCon.connectionId)
        const from = dCon.peer
        setChat(prev => [...prev, `${from}: ${data as string}`])
      })
    }
  }, [dCon])

  useEffect(() => {
    if (peer) {
      peer.on("connection", dc => {
        setDcon(dc);
      })
      peer.on("call", async (call) => {
        const stream = await navigator.mediaDevices.getUserMedia({audio: true});
        call.answer(stream)
        setAudioStreams(prev => [...prev, {stream, peer, self: false}])
      })
    }
  }, [peer])

  return <div>
    Hello
    {!peer && <CreatePeer setter={setPeer}></CreatePeer>}
    {peer && !dCon && <JoinDCon peer={peer} conSetter={setDcon} streamSetter={setAudioStreams}></JoinDCon>}
    {dCon && <p>Connected to {dCon.peer}</p>}
    {peer && <p>Your PeerID: {peer.id}</p>}
    {dCon && peer && <Messages messages={chat} dc={dCon} chatSetter={setChat} peer={peer}></Messages>}
    {audioStreams.map(as => <Audio key={as.peer.id} stream={as.stream} peer={as.peer}></Audio>)}



  </div>
}

const validate = (val: string, min: number, max: number) => {
  if (val.includes(" ")) return true
  return val.length < min || val.length > max;
}

function CreatePeer({setter}: {setter: React.Dispatch<SetStateAction<Peer | null>>}) {
  const [idValue, setIdValue] = useState("")

  const clickHandler = () => {
    
    const peerInst = new Peer(idValue)
    peerInst.on("open", id => {
      setter(peerInst);
    })
  }




  return <div>
    <input type="text" value={idValue} onChange={(e) => setIdValue(e.target.value)}></input>
    <button onClick={clickHandler} disabled={validate(idValue, 3, 16)}>Create Peer</button>
  </div>
}

function JoinDCon({peer, conSetter, streamSetter}: {peer: Peer, conSetter: React.Dispatch<SetStateAction<DataConnection | null>>, streamSetter: React.Dispatch<SetStateAction<AudioStreams[]>>}) {
  const [joinId, setJoinId] = useState("")


  const clickHandler = async () => {
    const dCon = peer.connect(joinId);
    const stream = await navigator.mediaDevices.getUserMedia({audio: true});
    const mediaCon = peer.call(joinId, stream, {metadata: {display: peer.id}});
    dCon.on("open", () => conSetter(dCon));
    mediaCon.on("stream", (stream) => {
      streamSetter(prev => [...prev, {stream, peer, self: true}]);
    })

  }

  return <div>
  <input type="text" max={16} min={3} value={joinId} onChange={(e) => setJoinId(e.target.value)}></input>
  <button onClick={clickHandler} disabled={validate(joinId, 3, 16)}>Join</button>
</div>
}

function Messages({messages, dc, chatSetter, peer}: {messages: string[], dc: DataConnection, chatSetter: React.Dispatch<SetStateAction<string[]>>, peer: Peer}) {
  const [message, setMessage] = useState("");

  const clickHandler = () => {
    dc.send(message);
    chatSetter(prev => [...prev, `${peer.id}: ${message}`])
    setMessage("")
  }

  return <div>
    <h2>Chat</h2>
    <div style={{border: "1px solid black"}}>

    {messages.map((msg, i) => <p key={msg[0] + i}>{msg}</p>)}
    </div>
    <div>
      <input type="text" value={message} onChange={(e) => setMessage(e.target.value)}></input>
      <button onClick={clickHandler}>Send</button>
    </div>
  </div>
}

function Audio({stream, peer, self}: {stream: MediaStream, peer: Peer, self?: boolean}) {

  return <div>
    <p>{peer.id}</p>
    <audio autoPlay={true} muted={self} ref={ audio => audio!.srcObject = stream}></audio>
  </div>
}

