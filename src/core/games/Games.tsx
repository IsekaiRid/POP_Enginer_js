import React from "react";
export { };

declare global {
  interface Window {
    gameAPI: {
      onGameData(cb: (data: any) => void): void;
    };
  }
}

type Vars = Record<string, string>;

function resolveAssetPath(projectRoot: string, value: string): string {
  if (value.startsWith("/")) {
    return `file://${projectRoot}${value}`;
  }

  if (value.startsWith("./")) {
    return `file://${projectRoot}/${value.slice(2)}`;
  }

  if (value.startsWith("../")) {
    const cleanPath = value.replace(/^(\.\.\/)+/, "");
    return `file://${projectRoot}/${cleanPath}`;
  }

  return `file://${projectRoot}/${value}`;
}

const Games: React.FC = () => {
  const [vars, setVars] = React.useState<Vars>({});
  const [background, setBackground] = React.useState<string | null>(null);

  const [commands, setCommands] = React.useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  // ✅ TYPEWRITER STATE
  const [displayedText, setDisplayedText] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);

  React.useEffect(() => {
    if (!window.gameAPI) {
      console.warn("gameAPI not ready");
      return;
    }

    window.gameAPI.onGameData(({ bundle, projectRoot }) => {
      const runtimeVars: Vars = {};

      bundle.config.flat().forEach((node: any) => {
        if (node.type !== "let") return;
        runtimeVars[node.id] = resolveAssetPath(projectRoot, node.value);
      });

      bundle.main.flat().forEach((node: any) => {
        if (node.type !== "let") return;
        runtimeVars[node.id] = resolveAssetPath(projectRoot, node.value);
      });

      setVars(runtimeVars);

      const mainBlocks = bundle.main.flat();

      const startLabel = mainBlocks.find(
        (node: any) => node.type === "label" && node.name === "start"
      );

      if (startLabel && Array.isArray(startLabel.body)) {
        setCommands(startLabel.body);

        const bgCommand = startLabel.body.find(
          (cmd: any) => cmd.type === "show" && cmd.position === null
        );

        if (bgCommand && runtimeVars[bgCommand.asset]) {
          setBackground(runtimeVars[bgCommand.asset]);
        } else {
          setBackground(null);
        }
      }
    });
  }, []);

  React.useEffect(() => {
    const currentCommand = commands[currentIndex];

    if (currentCommand && currentCommand.type !== "dialogue" && currentCommand.type !== "menu") {
      if (currentIndex < commands.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    }
  }, [currentIndex, commands]);

  // ✅ TYPEWRITER EFFECT
  React.useEffect(() => {
    const currentCommand = commands[currentIndex];

    if (currentCommand?.type === "dialogue") {
      const fullText = currentCommand.text;
      setDisplayedText("");
      setIsTyping(true);

      let charIndex = 0;
      const typingSpeed = 50; // ms per huruf (sesuaikan kecepatannya)

      const interval = setInterval(() => {
        if (charIndex < fullText.length) {
          setDisplayedText(fullText.substring(0, charIndex + 1));
          charIndex++;
        } else {
          setIsTyping(false);
          clearInterval(interval);
        }
      }, typingSpeed);

      return () => clearInterval(interval);
    }
  }, [currentIndex, commands]);

  const handleNext = () => {
    const currentCommand = commands[currentIndex];

    // ✅ KALAU MASIH TYPING, SKIP LANGSUNG TAMPIL FULL
    if (isTyping && currentCommand?.type === "dialogue") {
      setDisplayedText(currentCommand.text);
      setIsTyping(false);
    }
    // ✅ KALAU UDAH SELESAI TYPING, LANJUT KE NEXT
    else if (currentIndex < commands.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const currentCommand = commands[currentIndex];

  if (!vars.text_box) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        Loading game assets...
      </div>
    );
  }

  let speakerName = "";

  if (currentCommand?.type === "dialogue") {
    speakerName = currentCommand.speaker;
  }

  console.log("Current Command:", currentCommand);
  console.log("Index:", currentIndex, "/", commands.length);

  return (
    <div
      className="relative w-full h-full overflow-hidden cursor-pointer"
      onClick={handleNext}
    >
      {/* BACKGROUND */}
      {background && (
        <img
          src={background}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* UI - HANYA TAMPIL KALAU ADA DIALOGUE */}
      {currentCommand?.type === "dialogue" && (
        <div className="absolute bottom-0 left-0 w-full pointer-events-none">
          <img
            src={vars.text_box}
            alt="Text Box"
            className="w-full"
          />

          <div className="absolute inset-0 px-8 py-6 flex flex-col justify-center font-pixel">
            <p className="text-yellow-300 text-sm font-bold mb-2 absolute h-[100px]">
              {speakerName}
            </p>
            <p className="text-white text-lg drop-shadow-md">
              {displayedText}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Games;