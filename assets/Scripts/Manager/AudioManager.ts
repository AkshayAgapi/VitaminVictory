import { _decorator, Component, AudioSource, AudioClip } from 'cc';
import { GenericSingleton } from "../Common/GenericSingleton";

const { ccclass, property } = _decorator;

export enum SoundClipType {
    GAMEPLAY_BGM,
    VICTORY_SFX,
    FAILURE_SFX,
}

@ccclass('AudioManager')
export default class AudioManager extends GenericSingleton<AudioManager> {

    private _forceBGMDisable: boolean = false;

    @property(AudioSource)
    sfxAudioSource: AudioSource | null = null;

    @property(AudioSource)
    bgmAudioSource: AudioSource | null = null;

    @property({ type: AudioClip })
    bgmAudio: AudioClip | null = null;

    @property({ type: AudioClip })
    victorySfx: AudioClip | null = null;

    @property({ type: AudioClip })
    failureSfx: AudioClip | null = null;

    private _isMuted: boolean = false;
    private _bgmEnabled: boolean = true;
    private _sfxEnabled: boolean = true;

    public toggleAudio(): boolean {
        this._isMuted = !this._isMuted;
        this.toggleSfx();
        this.toggleBgm();
        return this._isMuted;
    }

    protected onLoad(): void {
        this.playBGM(SoundClipType.GAMEPLAY_BGM);
        super.onLoad();
    }

    public playSfx(soundClipType: SoundClipType) {
        if (!this._sfxEnabled || !this.sfxAudioSource)
            return;
        const sound = this.GetSoundClip(soundClipType);
        if (sound) {
            this.sfxAudioSource.clip = sound;
            this.sfxAudioSource.play(); // playOneShot(sound);
        } else {
            console.log('Sound clip not found: ' + SoundClipType[soundClipType]);
        }
    }

    public playBGM(soundClipType: SoundClipType) {
        if (this._forceBGMDisable || !this.bgmAudioSource)
            return;
        const sound = this.GetSoundClip(soundClipType);
        if (sound) {
            this.bgmAudioSource.clip = sound;
            if (this._bgmEnabled) {
                this.bgmAudioSource.play();
            }
        } else {
            console.log('Sound clip not found: ' + SoundClipType[soundClipType]);
        }
    }

    public stopBGM() {
        if (this.bgmAudioSource) {
            this.bgmAudioSource.stop();
        }
    }

    private GetSoundClip(clipType: SoundClipType): AudioClip | null {
        switch (clipType) {
            case SoundClipType.GAMEPLAY_BGM:
                return this.bgmAudio;
            case SoundClipType.VICTORY_SFX:
                return this.victorySfx;
            case SoundClipType.FAILURE_SFX:
                return this.failureSfx;
            default:
                return null;
        }
    }

    public toggleBgm() {
        if (this._forceBGMDisable || !this.bgmAudioSource)
            return;
        this._bgmEnabled = !this._bgmEnabled;
        if (this._bgmEnabled) {
            this.bgmAudioSource.play();
        } else {
            this.bgmAudioSource.pause();
        }
    }

    public toggleSfx() {
        this._sfxEnabled = !this._sfxEnabled;
    }

    public disableGameBGM() {
        this._forceBGMDisable = true;
        if (this.bgmAudioSource) {
            this.bgmAudioSource.stop();
            this.bgmAudioSource.enabled = false;
        }
    }

    public pauseAllSounds() {
        if (this.sfxAudioSource) {
            this.sfxAudioSource.pause();
        }
        if (this.bgmAudioSource) {
            this.bgmAudioSource.pause();
        }
    }

    public resumeAllSounds() {
        if (this._sfxEnabled && this.sfxAudioSource) {
            this.sfxAudioSource.play()
        }
        if (this._bgmEnabled && this.bgmAudioSource) {
            this.bgmAudioSource.play();
        }
    }
}
