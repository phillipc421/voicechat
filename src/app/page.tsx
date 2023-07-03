"use client"
// import Peer, {DataConnection} from "peerjs"
// import { Component, SetStateAction, useEffect, useState } from "react"

import dynamic from "next/dynamic"



const HomePageComp = dynamic(() => import("./Home"), {ssr: false})

export default function Home() {
  return <HomePageComp></HomePageComp>
}