use crate::error::AppError;
use crate::providers::{AIProvider, ProviderResponse};
use async_trait::async_trait;
use serde::{Deserialize, Serialize};

// ── Request types ─────────────────────────────────────────────────────────────

#[derive(Serialize)]
struct ChatRequest {
    model: String,
    messages: Vec<ChatMessage>,
}

#[derive(Serialize, Deserialize)]
struct ChatMessage {
    role: String,
    content: String,
}

// ── Response types ────────────────────────────────────────────────────────────

#[derive(Deserialize)]
struct ChatResponse {
    choices: Vec<Choice>,
    usage: Usage,
}

#[derive(Deserialize)]
struct Choice {
    message: ChatMessage,
}

#[derive(Deserialize)]
struct Usage {
    total_tokens: u32,
}

// ── Provider ──────────────────────────────────────────────────────────────────

/// OpenAI chat-completions provider using the `gpt-4o-mini` model.
pub struct OpenAIProvider {
    api_key: String,
    client: reqwest::Client,
}

impl OpenAIProvider {
    /// Creates a new [`OpenAIProvider`] with the given API key.
    pub fn new(api_key: String) -> Self {
        Self {
            api_key,
            client: reqwest::Client::new(),
        }
    }
}

#[async_trait]
impl AIProvider for OpenAIProvider {
    /// Sends a chat-completion request to `api.openai.com` and returns the
    /// model's reply together with token usage and estimated cost.
    async fn complete(&self, system: &str, user: &str) -> Result<ProviderResponse, AppError> {
        let body = ChatRequest {
            model: "gpt-4o-mini".to_string(),
            messages: vec![
                ChatMessage {
                    role: "system".to_string(),
                    content: system.to_string(),
                },
                ChatMessage {
                    role: "user".to_string(),
                    content: user.to_string(),
                },
            ],
        };

        let response = self
            .client
            .post("https://api.openai.com/v1/chat/completions")
            .bearer_auth(&self.api_key)
            .json(&body)
            .send()
            .await
            .map_err(|e| AppError::Provider(format!("OpenAI request failed: {e}")))?;

        let status = response.status();
        if !status.is_success() {
            let error_body = response
                .text()
                .await
                .unwrap_or_else(|_| "<unreadable body>".to_string());
            return Err(AppError::Provider(format!(
                "OpenAI API error {}: {}",
                status, error_body
            )));
        }

        let parsed: ChatResponse = response
            .json()
            .await
            .map_err(|e| AppError::Provider(format!("OpenAI response parse error: {e}")))?;

        let text = parsed
            .choices
            .into_iter()
            .next()
            .map(|c| c.message.content)
            .ok_or_else(|| AppError::Provider("OpenAI returned no choices".to_string()))?;

        let tokens_used = parsed.usage.total_tokens;
        // gpt-4o-mini: ~$0.15 per 1 M tokens (blended input + output)
        let cost_usd = tokens_used as f64 * 0.000_000_15;

        Ok(ProviderResponse {
            text,
            tokens_used,
            cost_usd,
        })
    }

    fn provider_id(&self) -> &'static str {
        "openai"
    }

    fn requires_api_key(&self) -> bool {
        true
    }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    fn make_provider() -> OpenAIProvider {
        OpenAIProvider::new("test-key".to_string())
    }

    #[test]
    fn test_openai_provider_id_is_correct() {
        assert_eq!(make_provider().provider_id(), "openai");
    }

    #[test]
    fn test_openai_requires_api_key() {
        assert!(make_provider().requires_api_key());
    }
}
