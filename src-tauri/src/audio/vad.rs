/// Voice Activity Detection — stops recording after silence
pub struct VoiceActivityDetector {
    pub silence_threshold: f32,
    pub silence_duration_ms: u32,
}

impl VoiceActivityDetector {
    pub fn new() -> Self {
        Self {
            silence_threshold: 0.01,
            silence_duration_ms: 1500,
        }
    }

    /// Returns true if the audio chunk is below the silence threshold
    pub fn is_silence(&self, chunk: &[f32]) -> bool {
        if chunk.is_empty() {
            return true;
        }
        let energy = chunk.iter().map(|s| s.abs()).sum::<f32>() / chunk.len() as f32;
        energy < self.silence_threshold
    }
}

impl Default for VoiceActivityDetector {
    fn default() -> Self {
        Self::new()
    }
}
