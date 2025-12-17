export type Command = any;
export type SpritePosition = "left" | "center" | "right";

const VISUAL_TYPES = ["dialogue", "menu"];

export class VisualJson {
  private commands: Command[];
  private index = 0;
  private labelMap: Record<string, Command[]> = {};
  public onAction?: (cmd: Command) => void;

  private sprites: Record<SpritePosition, string | null> = {
    left: null,
    center: null,
    right: null,
  };

  constructor(commands: Command[]) {
    this.commands = commands;
    this.scanAllLabels(commands);
    console.log("📋 Label Map:", Object.keys(this.labelMap));
  }

  // Scan DEEP RECURSIVE - cari label di mana aja, sekeras apapun nested-nya
  private scanAllLabels(commands: Command[]) {
    if (!Array.isArray(commands)) return;
    
    for (const cmd of commands) {
      if (!cmd) continue;

      // Jika ini label, simpan ke map
      if (cmd.type === "label" && cmd.name && Array.isArray(cmd.body)) {
        this.labelMap[cmd.name] = cmd.body;
        console.log(`✅ Found label: ${cmd.name}`);
        // Rekursif ke dalam body
        this.scanAllLabels(cmd.body);
      }
      
      // Jika ini menu, scan semua choice bodies
      if (cmd.type === "menu" && Array.isArray(cmd.choices)) {
        for (const choice of cmd.choices) {
          if (Array.isArray(choice.body)) {
            // PENTING: Scan choice body secara rekursif
            this.scanAllLabels(choice.body);
          }
        }
      }

      // TAMBAHAN: Scan property 'body' apapun yang array
      if (cmd.body && Array.isArray(cmd.body)) {
        this.scanAllLabels(cmd.body);
      }
    }
  }

  init() {
    // Cari dan mulai dari label "start"
    const startLabel = this.labelMap["start"];
    if (startLabel) {
      console.log("🎬 Mulai dari label: start");
      this.commands = startLabel;
      this.index = 0;
    }
    this.runUntilVisual();
  }

  get current(): Command | null {
    return this.commands[this.index] ?? null;
  }

  getSprites() {
    return this.sprites;
  }

  next() {
    if (this.index < this.commands.length) {
      this.index++;
      this.runUntilVisual();
    }
  }

  inject(body: Command[]) {
    // Ganti commands dengan body dari choice yang dipilih
    this.commands = body;
    this.index = 0;
    // Scan labels baru jika ada
    this.scanAllLabels(body);
    // LANGSUNG jalankan sampai ketemu visual
    this.runUntilVisual();
  }

  private runUntilVisual() {
    while (this.index < this.commands.length) {
      const cmd = this.commands[this.index];
      if (!cmd) break;

      // Logic Jump
      if (cmd.type === "jump") {
        const target = this.labelMap[cmd.label];
        if (target) {
          console.log(`🔀 Jump ke label: ${cmd.label}`);
          this.commands = target;
          this.index = 0;
          continue;
        } else {
          console.error(`❌ Label "${cmd.label}" tidak ditemukan!`);
          console.log("Available labels:", Object.keys(this.labelMap));
          this.index++;
          continue;
        }
      }

      // Logic Action (Audio/Background)
      if (cmd.type === "play" || cmd.type === "stop" || (cmd.type === "show" && cmd.position === null)) {
        this.onAction?.(cmd);
        this.index++;
        continue;
      }

      // Logic Sprites
      if (cmd.type === "show" && cmd.position) {
        this.sprites[cmd.position as SpritePosition] = cmd.asset;
        this.index++;
        continue;
      }

      // Stop on Visual
      if (VISUAL_TYPES.includes(cmd.type)) {
        break;
      }

      this.index++;
    }
  }
}