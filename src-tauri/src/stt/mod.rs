pub mod engines;

use crate::error::AppError;
use async_trait::async_trait;

#[async_trait]
pub trait STTEngine: Send + Sync {
    /// Transcribe audio samples (f32, 16kHz) to text
    async fn transcribe(&self, audio: Vec<f32>, sample_rate: u32) -> Result<String, AppError>;
    fn engine_id(&self) -> &'static str;
    fn requires_api_key(&self) -> bool;
}
