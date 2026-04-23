/// Microphone capture via cpal — outputs Vec<f32> at 16kHz
pub struct AudioCapture;

impl AudioCapture {
    pub fn new() -> Self {
        Self
    }
}

impl Default for AudioCapture {
    fn default() -> Self {
        Self::new()
    }
}
