import io
import os
import tempfile
import subprocess

import numpy as np
import soundfile as sf      
from scipy import signal

# Optional: faster-whisper for voice transcription
try:
    from faster_whisper import WhisperModel
    WHISPER_AVAILABLE = True
except ImportError:
    WHISPER_AVAILABLE = False
    WhisperModel = None


class VoiceAgent:
    def __init__(self, model_name: str = "base", device: str | None = None, debug: bool = False):
        """
        model_name: tiny/base/small/medium/large
        device: "cuda" or "cpu" or None (auto)
        debug: prints audio shape/sr info
        """
        self.debug = debug
        
        if not WHISPER_AVAILABLE:
            print("[VoiceAgent] WARNING: faster-whisper not installed. Voice features disabled.")
            self.model = None
            return
            
        print(f"[VoiceAgent] Initializing with model: {model_name}")
        
        # faster-whisper uses compute_type instead of device
        compute_type = "float32" if device == "cpu" else "auto"
        device = device or "auto"
        
        self.model = WhisperModel(model_name, device=device, compute_type=compute_type)
        print(f"[VoiceAgent] Model loaded successfully")

    def _convert_webm_to_wav(self, input_bytes: bytes) -> bytes:
        """
        Convert WebM/any format audio to WAV using FFmpeg.
        Returns WAV bytes or raises exception on failure.
        """
        # Create temp files for input and output
        with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as input_file:
            input_file.write(input_bytes)
            input_path = input_file.name
        
        output_path = input_path.replace(".webm", ".wav")
        
        try:
            print(f"[VoiceAgent] Converting audio with FFmpeg: {input_path} -> {output_path}")
            
            # Use FFmpeg to convert to WAV (16kHz, mono, 16-bit PCM)
            result = subprocess.run([
                "ffmpeg", "-y",  # Overwrite output
                "-i", input_path,  # Input file
                "-ar", "16000",  # Sample rate 16kHz
                "-ac", "1",  # Mono
                "-acodec", "pcm_s16le",  # 16-bit PCM
                output_path
            ], capture_output=True, text=True)
            
            if result.returncode != 0:
                print(f"[VoiceAgent] FFmpeg stderr: {result.stderr}")
                raise Exception(f"FFmpeg conversion failed: {result.stderr}")
            
            # Read the converted WAV file
            with open(output_path, "rb") as wav_file:
                wav_bytes = wav_file.read()
            
            print(f"[VoiceAgent] Conversion successful: {len(input_bytes)} bytes -> {len(wav_bytes)} bytes WAV")
            return wav_bytes
            
        finally:
            # Cleanup temp files
            try:
                os.unlink(input_path)
            except Exception:
                pass
            try:
                os.unlink(output_path)
            except Exception:
                pass

    def _decode_audio_bytes(self, audio_bytes: bytes, target_sr: int = 16000) -> np.ndarray:
        """
        Returns a 1-D float32 numpy array at target_sr (mono).
        First converts WebM to WAV if needed, then reads with soundfile.
        """
        print(f"[VoiceAgent] _decode_audio_bytes called with {len(audio_bytes)} bytes")
        
        # Try to read directly first (in case it's already WAV)
        buf = io.BytesIO(audio_bytes)
        try:
            data, sr = sf.read(buf, dtype="float32")
            print(f"[VoiceAgent] Direct read succeeded: sr={sr}, shape={data.shape}")
        except Exception as e:
            print(f"[VoiceAgent] Direct read failed: {e}")
            print(f"[VoiceAgent] Converting WebM to WAV...")
            
            # Convert to WAV using FFmpeg
            wav_bytes = self._convert_webm_to_wav(audio_bytes)
            wav_buf = io.BytesIO(wav_bytes)
            data, sr = sf.read(wav_buf, dtype="float32")
            print(f"[VoiceAgent] Read converted WAV: sr={sr}, shape={data.shape}")
        
        # Convert to mono if stereo
        if data.ndim > 1:
            data = np.mean(data, axis=1)
            print(f"[VoiceAgent] Converted stereo to mono")
        
        # Resample if needed
        if sr != target_sr:
            print(f"[VoiceAgent] Resampling from {sr} to {target_sr}")
            num_samples = int(len(data) * target_sr / sr)
            data = signal.resample(data, num_samples)
        
        data = data.astype(np.float32).flatten()
        print(f"[VoiceAgent] Final audio: shape={data.shape}, min={data.min():.5f}, max={data.max():.5f}")
        
        return data

    def transcribe_bytes(self, audio_bytes: bytes, language: str = "en") -> str:
        """
        Main entry: feed raw audio bytes (WebM or WAV) and get transcription.
        Returns transcription text or empty string if transcription fails.
        """
        print(f"[VoiceAgent] transcribe_bytes called with {len(audio_bytes)} bytes")
        
        if len(audio_bytes) == 0:
            print("[VoiceAgent] ERROR: Received 0 bytes of audio!")
            return ""
            
        try:
            audio = self._decode_audio_bytes(audio_bytes, target_sr=16000)
            print(f"[VoiceAgent] Audio decoded, size={audio.size}")
           
            if audio.size == 0:
                print("[VoiceAgent] ERROR: Decoded audio has size 0")
                return ""
                
            if np.allclose(audio, 0.0):
                print("[VoiceAgent] ERROR: Audio is all zeros (silent)")
                return ""

            print("[VoiceAgent] Calling faster-whisper model.transcribe()...")
            segments, info = self.model.transcribe(audio, language=language)
            
            # Collect all segment texts
            text = " ".join([segment.text for segment in segments]).strip()
            print(f"[VoiceAgent] Transcription result: '{text}'")
            return text
            
        except Exception as e:
            print(f"[VoiceAgent] Transcription failed: {e}")
            return ""
