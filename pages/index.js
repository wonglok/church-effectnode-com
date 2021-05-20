import Head from "next/head";
import { Game } from "../pages-code/Game/Game";
// import styles from "../styles/Home.module.css";

export default function Home() {
  return (
    <div className={"w-full h-full"}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Game></Game>
    </div>
  );
}
