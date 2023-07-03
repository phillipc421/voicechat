import { randomUUID } from "crypto";

const rooms: Room[] = []
console.log("this page ran")

export class Room {
    id: string;
    createdAt: string
    peers: string[]

    constructor() {
        this.id = randomUUID();
        this.createdAt = new Date().toISOString()
        this.peers = []
    }

    getInfo() {
        return {id: this.id, createdAt: this.createdAt, peers: this.peers};
    }

    addPeer(id: string) {
        this.peers.push(id);
    }

    removePeer(id: string) {
        this.peers = this.peers.filter(peer => peer !== id);
    }


    // static methods
    static create() {
        const newRoom = new Room();
        rooms.push(newRoom);
        return newRoom;
    }

    static find(id: string) {
        return rooms.find(room => room.id === id);
    }

    static findAll() {
        return rooms;
    }

}