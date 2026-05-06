use crate::error::AppError;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ProviderResponse {
    pub text: String,
    pub tokens_used: u32,
    pub cost_usd: f64,
}

#[async_trait]
pub trait AIProvider: Send + Sync {
    async fn complete(&self, system: &str, user: &str) -> Result<ProviderResponse, AppError>;
    fn provider_id(&self) -> &'static str;
    fn requires_api_key(&self) -> bool;
}
