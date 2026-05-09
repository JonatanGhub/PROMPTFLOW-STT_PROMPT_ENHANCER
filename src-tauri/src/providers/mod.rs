use crate::error::AppError;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};

pub mod groq;
pub mod openai;

/// The structured response returned by every [`AIProvider`] implementation.
#[derive(Debug, Serialize, Deserialize)]
pub struct ProviderResponse {
    pub text: String,
    pub tokens_used: u32,
    pub cost_usd: f64,
}

/// Common interface implemented by all AI text-completion providers.
#[async_trait]
pub trait AIProvider: Send + Sync {
    async fn complete(&self, system: &str, user: &str) -> Result<ProviderResponse, AppError>;
    fn provider_id(&self) -> &'static str;
    fn requires_api_key(&self) -> bool;
}

/// Creates a boxed [`AIProvider`] for the given provider id and API key.
///
/// # Errors
/// Returns [`AppError::Provider`] if `provider_id` is not recognized.
pub fn make_provider(provider_id: &str, api_key: String) -> Result<Box<dyn AIProvider>, AppError> {
    match provider_id {
        "openai" => Ok(Box::new(openai::OpenAIProvider::new(api_key))),
        "groq" => Ok(Box::new(groq::GroqProvider::new(api_key))),
        other => Err(AppError::Provider(format!("Unknown provider: {other}"))),
    }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_make_provider_openai_succeeds() {
        let provider = make_provider("openai", "key".to_string()).unwrap();
        assert_eq!(provider.provider_id(), "openai");
    }

    #[test]
    fn test_make_provider_groq_succeeds() {
        let provider = make_provider("groq", "key".to_string()).unwrap();
        assert_eq!(provider.provider_id(), "groq");
    }

    #[test]
    fn test_make_provider_unknown_returns_error() {
        let result = make_provider("unknown-llm", "key".to_string());
        assert!(result.is_err());
        match result {
            Err(AppError::Provider(msg)) => assert!(msg.contains("unknown-llm")),
            Err(other) => panic!("Expected AppError::Provider, got {other:?}"),
            Ok(_) => panic!("Expected error, got Ok"),
        }
    }
}
