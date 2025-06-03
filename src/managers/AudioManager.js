export class AudioManager {
  constructor(eventManager) {
    this.eventManager = eventManager;
    this.sounds = new Map();
    this.backgroundMusic = null;
    this.settings = {
      soundEnabled: true,
      musicVolume: 0.7,
      effectsVolume: 0.9,
    };

    this.init();
  }

  init() {
    this.loadSettings();
    this.preloadSounds();
    this.setupEventListeners();
  }

  loadSettings() {
    const savedSettings =
      JSON.parse(localStorage.getItem("audioSettings")) || {};
    this.settings = {
      ...this.settings,
      ...savedSettings,
    };
  }

  saveSettings() {
    console.log('в saveSettings аудио');
    console.log('аудио this.settings:', this.settings);
    
    
    localStorage.setItem("audioSettings", JSON.stringify(this.settings));
  }

  preloadSounds() {
    // Основные звуковые эффекты
    this.addSound("click", "./src/assets/sounds/click.mp3");
    this.addSound("cardFlip", "./src/assets/sounds/card-flip.mp3");
    // this.addSound("cardMove", "./src/assets/sounds/card-move.mp3");
    this.addSound("win", "./src/assets/sounds/win.mp3");
    this.addSound("info", "./src/assets/sounds/info.mp3");
    // this.addSound("error", "./src/assets/sounds/error.mp3");

    // Фоновая музыка
    this.backgroundMusic = this.createAudio(
      "./src/assets/sounds/background.mp3",
      true
    );
    this.backgroundMusic.volume = this.settings.musicVolume;
  }

  addSound(name, path, loop = false) {
    this.sounds.set(name, this.createAudio(path, loop));
  }

  createAudio(path, loop = false) {
    const audio = new Audio(path);
    audio.loop = loop;
    audio.preload = "auto";
    return audio;
  }

  setupEventListeners() {
    this.eventManager.on("audio:toggle", (enabled) =>
      this.toggleAllSounds(enabled)
    );
    this.eventManager.on("music:volume", (volume) =>
      this.setMusicVolume(volume)
    );
    this.eventManager.on("effects:volume", (volume) =>
      this.setEffectsVolume(volume)
    );

    this.eventManager.on("settings:sound:toggle", (enabled) => this.toggleAllSounds(enabled));
    this.eventManager.on("game:started", () => this.playMusic());
    this.eventManager.on("game:pause", () => this.pauseMusic());
    this.eventManager.on("game:resume", () => this.resumeMusic());
  }

  play(name) {
    if (!this.settings.soundEnabled || !this.sounds.has(name)) return;

    try {
      const sound = this.sounds.get(name);
      sound.currentTime = 0;
      sound.volume = this.settings.effectsVolume;
      sound
        .play()
        .catch((e) => console.error(`Error playing sound ${name}:`, e));
    } catch (e) {
      console.error(`Error with sound ${name}:`, e);
    }
  }

  playMusic() {
    if (!this.settings.soundEnabled || !this.backgroundMusic) return;

    try {
      this.backgroundMusic.currentTime = 0;
      this.backgroundMusic
        .play()
        .catch((e) => console.error("Error playing music:", e));
    } catch (e) {
      console.error("Music error:", e);
    }
  }

  stopMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic.currentTime = 0;
    }
  }

  pauseMusic() {
    if (this.backgroundMusic && !this.backgroundMusic.paused) {
      this.backgroundMusic.pause();
    }
  }

  resumeMusic() {
    if (this.backgroundMusic && this.settings.soundEnabled) {
      this.backgroundMusic
        .play()
        .catch((e) => console.error("Error resuming music:", e));
    }
  }

  toggleAllSounds(enabled) {    
    this.settings.soundEnabled = enabled;
    if (enabled) {
      this.resumeMusic();
    } else {
      this.pauseMusic();
    }
    this.saveSettings();
  }

  setMusicVolume(volume) {
    volume = Math.max(0, Math.min(1, volume));
    this.settings.musicVolume = volume;
    if (this.backgroundMusic) {
      this.backgroundMusic.volume = volume;
    }
    this.saveSettings();
  }

  setEffectsVolume(volume) {
    volume = Math.max(0, Math.min(1, volume));
    this.settings.effectsVolume = volume;
    this.saveSettings();
  }

  getState() {
    return { ...this.settings };
  }
}
