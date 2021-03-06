import React, { useState, useEffect } from "react";
import Link from "next/link";
import useNetwork from "../hooks/network";
import { IGame, IGameMode } from "../lib/game";
import LobbyGameRow from "../components/LobbyGameRow";
import Button from "../components/Button";
import DiscordButton from "../components/DiscordButton";
import Rules from "../components/Rules";
import classnames from "classnames";
import { sortBy } from "lodash";
import { gameOverSelector } from "../lib/selectors";
import { useRouter } from "next/router";

const Home = () => {
  const router = useRouter();
  const network = useNetwork();
  const [games, setGames] = useState<IGame[]>([]);
  const [seeMore, setSeeMore] = useState<boolean>(false);
  const [rulesMode, setRulesMode] = useState<IGameMode>("classic");

  useEffect(() => {
    network.getPublicGames((games) => {
      setGames(
        games.filter((g) => {
          const players = Object.values(g.players || {});

          if (players.length === 0) {
            return false;
          } else {
            return true;
          }
        })
      );
    });
  }, []);

  const sortedGamesList = sortBy(games, [
    (g) => (g?.turns || []).length, // sort unstarted games first
    (g) => -g.createdAt, // then more recent games first
  ]).filter(
    (g) =>
      (g?.options?.private === "public" || router.query.admin === "true") &&
      !gameOverSelector({ playerId: "", game: g }).over
  ); // only public games that aren't over (unless ?admin=true)

  return (
    <div className="w-screen h-min-screen p-6 flex flex-col items-center bg-gray-100">
      <h1 className="h1 font-mono mt-6">codenames.cards</h1>
      <p className="font-mono mb-4">The popular card game, online. 🕵️‍♂️</p>
      <div className="flex">
        <Link href="/new-game">
          <a>
            <Button>Create game</Button>
          </a>
        </Link>
      </div>

      <h2 className="h2 mt-6 mb-4">Join a room</h2>
      <div className="grid grid-flow-row grid-cols-1 gap-2 pb-6">
        {sortedGamesList.length === 0 && (
          <p className="text-gray-700">
            There are currently no public games. Create one and invite friends!
          </p>
        )}
        {sortedGamesList.map((g) => (
          <LobbyGameRow key={g.id} game={g} />
        ))}
      </div>
      <DiscordButton />
      <div className="max-w-2xl leading-relaxed border rounded bg-white shadow p-6 text-gray-900 mt-6 ">
        <h2 className="h2 mb-4 text-center">How to play</h2>
        <p>
          Codenames is a game of guessing where teams compete to find words
          related to a hint-word given by another player.
        </p>
        <img
          className="p-6"
          src="/illustration.svg"
          alt="Codenames illustration"
        />
        {!seeMore && (
          <p
            onClick={() => setSeeMore(true)}
            className="cursor-pointer underline text-blue-800 hover:text-blue-700"
          >
            See more...
          </p>
        )}
        {seeMore && (
          <div
            className={classnames({
              "sr-only": !seeMore,
              "not-sr-only": seeMore,
            })}
          >
            <div className="flex">
              {(["classic", "duet"] as IGameMode[]).map((mode) => (
                <button
                  className={classnames(
                    "rounded font-bold mr-2 hover:font-gray-700 p-2",
                    { "bg-gray-300": rulesMode === mode }
                  )}
                  onClick={() => setRulesMode(mode)}
                >
                  {mode} rules
                </button>
              ))}
            </div>
            <Rules mode={rulesMode} />
          </div>
        )}
      </div>
      <div className="mt-6 text-gray-700">
        <p className="mb-2">
          If you like this game, please support the authors and buy a physical
          version!
        </p>
        <p className="mb-2">
          Made with ♥ during the lockdown. It's{" "}
          <a
            className="hover:text-gray-600 underline"
            href="https://github.com/benjamintd/codenames.cards"
          >
            open-source
          </a>
          .
        </p>
        <p className="mb-2">
          Check our{" "}
          <Link href="/privacy-policy">
            <a className="hover:text-gray-600 underline">privacy policy</a>
          </Link>
          .
        </p>
      </div>
    </div>
  );
};

export default Home;
