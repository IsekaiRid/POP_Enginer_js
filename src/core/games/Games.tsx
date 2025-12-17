import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VisualJson } from "./VisualJson";

declare global {
  interface Window {
    gameAPI: {
      onGameData(cb: (data: any) => void): void;
    };
  }
}

type Vars = Record<string, string>;

function resolveAssetPath(projectRoot: string, value: string): string {
  if (value.startsWith("/")) return `file://${projectRoot}${value}`;
  if (value.startsWith("./")) return `file://${projectRoot}/${value.slice(2)}`;
  if (value.startsWith("../")) {
    const clean = value.replace(/^(\.\.\/)+/, "");
    return `file://${projectRoot}/${clean}`;
  }
  return `file://${projectRoot}/${value}`;
}

const SPRITE_MOTION = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const },
};

const Games: React.FC = () => {
  const [vars, setVars] = React.useState<Vars>({});
  const [background, setBackground] = React.useState<string | null>(null);
  const [engine, setEngine] = React.useState<VisualJson | null>(null);
  const [command, setCommand] = React.useState<any>(null);
  const [isAudioPlaying, setIsAudioPlaying] = React.useState(false);
  const [displayedText, setDisplayedText] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);

  const musicRef = React.useRef<HTMLAudioElement | null>(null);
  const isMenu = command?.type === "menu";

  const handleAudio = async (cmd: any, projectRoot: string, currentVars: Vars) => {
    const src = currentVars[cmd.asset] || resolveAssetPath(projectRoot, cmd.asset);

    if (cmd.type === "play" && cmd.audioType === "music") {
      if (musicRef.current && musicRef.current.src === src) return;

      if (musicRef.current) {
        musicRef.current.pause();
        musicRef.current = null;
      }

      const audio = new Audio(src);
      audio.loop = true;
      musicRef.current = audio;

      audio.onplaying = () => setIsAudioPlaying(true);
      audio.onpause = () => setIsAudioPlaying(false);

      try {
        await audio.play();
      } catch (err: any) {
        if (err.name !== "AbortError") console.warn("Audio Blocked:", err.message);
      }
    }

    if (cmd.type === "stop") {
      if (musicRef.current) {
        musicRef.current.pause();
        musicRef.current = null;
        setIsAudioPlaying(false);
      }
    }
  };

  React.useEffect(() => {
    if (!window.gameAPI) return;

    window.gameAPI.onGameData(({ bundle, projectRoot }) => {
      const runtimeVars: Vars = {};
      [...bundle.config.flat(), ...bundle.main.flat()].forEach((n: any) => {
        if (n.type === "let") runtimeVars[n.id] = resolveAssetPath(projectRoot, n.value);
      });

      setVars(runtimeVars);

      // Pass SEMUA commands dari bundle.main ke engine
      // Biar semua label ter-scan (start, suasana_kelas, istirahat, dll)
      const allCommands = bundle.main.flat();
      const engineInstance = new VisualJson(allCommands);

      engineInstance.onAction = (cmd) => {
        if (cmd.type === "play" || cmd.type === "stop") {
          handleAudio(cmd, projectRoot, runtimeVars);
        }
        if (cmd.type === "show" && cmd.position === null) {
          const bgPath = runtimeVars[cmd.asset] || resolveAssetPath(projectRoot, cmd.asset);
          setBackground(bgPath);
        }
      };

      engineInstance.init();
      setEngine(engineInstance);
      setCommand(engineInstance.current);
    });

    return () => {
      if (musicRef.current) musicRef.current.pause();
    };
  }, []);

  React.useEffect(() => {
    if (command?.type !== "dialogue") return;
    setDisplayedText("");
    setIsTyping(true);
    let i = 0;
    const text = command.text || "";
    const timer = setInterval(() => {
      setDisplayedText((prev) => {
        if (i < text.length) {
          i++;
          return text.slice(0, i);
        } else {
          setIsTyping(false);
          clearInterval(timer);
          return text;
        }
      });
    }, 40);
    return () => { clearInterval(timer); setIsTyping(false); };
  }, [command]);

  const handleNext = () => {
    if (!engine || !command || isMenu) return;
    if (isTyping && command.type === "dialogue") {
      setDisplayedText(command.text);
      setIsTyping(false);
      return;
    }
    engine.next();
    setCommand(engine.current);
  };

  if (!vars.text_box) return <div className="h-full w-full flex items-center justify-center bg-black text-white font-pixel">LOADING ASSETS...</div>;

  const sprites = engine?.getSprites();

  return (
    <div className="relative h-full w-full overflow-hidden bg-black" onClick={handleNext}>
      {background && (
        <img
          src={background}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500 z-0"
          alt="background"
        />
      )}

      <div className="absolute inset-0 z-10 pointer-events-none">
        <AnimatePresence>
          {Object.entries(sprites || {}).map(([pos, asset]) => (
            asset && vars[asset] && (
              <motion.img
                key={`${pos}-${asset}`}
                src={vars[asset]}
                className={`absolute bottom-0 h-[90%] object-contain ${pos === 'left' ? 'left-[5%]' :
                  pos === 'right' ? 'right-[5%]' :
                    'left-1/2 -translate-x-1/2 h-[95%]'
                  }`}
                {...SPRITE_MOTION}
              />
            )
          ))}
        </AnimatePresence>
      </div>

      {command?.type === "dialogue" && (
        <div className="absolute bottom-0 left-0 w-full z-50 pointer-events-none">
          <div className="relative w-full overflow-hidden">
            <img
              src={vars.text_box}
              className="w-full h-[180px] md:h-[180px] object-fill block"
              alt="textbox"
            />
            <div className="absolute inset-0 px-16 py-8 font-pixel flex flex-col justify-start pointer-events-auto">
              <p className="text-yellow-400 font-bold text-xl mb-1 drop-shadow-md tracking-wider">
                {command.speaker}
              </p>
              <p className="text-white text-2xl leading-relaxed drop-shadow-sm max-w-[90%]">
                {displayedText}
              </p>
            </div>
          </div>
        </div>
      )}

      {isMenu && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-40">
          <div className="flex flex-col gap-4 w-full max-w-xl px-10">
            {command.choices.map((c: any, i: number) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  engine?.inject(c.body);
                  setCommand(engine?.current);
                }}
                className="border-4 border-white bg-black/90 text-white p-5 hover:bg-white hover:text-black font-pixel text-2xl transition-all shadow-2xl"
              >
                {c.text}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Games;