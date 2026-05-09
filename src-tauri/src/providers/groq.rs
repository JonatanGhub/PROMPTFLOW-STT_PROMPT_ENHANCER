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

/// Groq chat-completions provider using the `llama-3.1-8b-instant` model via
/// Groq's OpenAI-compatible API endpoint.
pub struct GroqProvider {
    api_key: String,
    client: reqwest::Client,
}

impl GroqProvider {
    /// Creates a new [`GroqProvider`] with the given API key.
    pub fn new(api_key: String) -> Self {
        Self {
            api_key,
            client: reqwest::Client::new(),
        }
    }
}

#[async_trait]
impl AIProvider for GroqProvider {
    /// Sends a chat-completion request to `api.groq.com` and returns the
    /// model's reply together with token usage. Cost is always `0.0` because
    /// this model is on the free tier.
    async fn complete(&self, system: &str, user: &str) -> Result<ProviderResponse, AppError> {
        let body = ChatRequest {
            model: "llama-3.1-8b-instant".to_string(),
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
            .post("https://api.groq.com/openai/v1/chat/completions")
            .bearer_auth(&self.api_key)
            .json(&body)
            .send()
            .await
            .map_err(|e| AppError::Provider(format!("Groq request failed: {e}")))?;

        let status = response.status();
        if !status.is_success() {
            let error_body = response
                .text()
                .await
                .unwrap_or_else(|_| "<unreadable body>".to_string());
            return Err(AppError::Provider(format!(
                "Groq API error {}: {}",
                status, error_body
            )));
        }

        let parsed: ChatResponse = response
            .json()
            .await
            .map_err(|e| AppError::Provider(format!("Groq response parse error: {e}")))?;

        let text = parsed
            .choices
            .into_iter()
            .next()
            .map(|c| c.message.content)
            .ok_or_else(|| AppError::Provider("Groq returned no choices".to_string()))?;

        let tokens_used = parsed.usage.total_tokens;

        Ok(ProviderResponse {
            text,
            tokens_used,
            cost_usd: 0.0, // free tier
        })
    }

    fn provider_id(&self) -> &'static str {
        "groq"
    }

    fn requires_api_key(&self) -> bool {
        true
    }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    fn make_provider() -> GroqProvider {
        GroqProvider::new("test-key".to_string())
    }

    #[test]
    fn test_groq_provider_id_is_correct() {
        assert_eq!(make_provider().provider_id(), "groq");
    }

    #[test]
    fn test_groq_requires_api_key() {
        assert!(make_provider().requires_api_key());
    }
}
