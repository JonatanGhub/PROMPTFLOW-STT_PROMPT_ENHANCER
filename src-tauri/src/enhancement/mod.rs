#[derive(Debug, Clone)]
pub enum EnhancementMode {
    FixGrammar,
    Formalize,
    Shorten,
    Expand,
    Translate,
    Brainstorm,
    ActionItems,
    Summarize,
    CodeReview,
    Simplify,
    Reframe,
    Custom(String),
}

/// Returns (system_prompt, user_message) tuple
pub fn build_prompt(mode: &EnhancementMode, text: &str) -> (String, String) {
    let system = match mode {
        EnhancementMode::FixGrammar =>
            "You are a grammar correction assistant. Fix grammar and spelling errors. Return only the corrected text, no explanations.",
        EnhancementMode::Formalize =>
            "You are a writing assistant. Rewrite the text in a formal, professional tone. Return only the rewritten text.",
        EnhancementMode::Shorten =>
            "You are a writing assistant. Shorten the text while preserving the key meaning. Return only the shortened text.",
        EnhancementMode::Expand =>
            "You are a writing assistant. Expand the text with more detail and context. Return only the expanded text.",
        EnhancementMode::Translate =>
            "Translate the text to English. If already in English, translate to Spanish. Return only the translation.",
        EnhancementMode::Brainstorm =>
            "You are a creative assistant. Generate 5 related ideas or angles based on the input. Return as a numbered list.",
        EnhancementMode::ActionItems =>
            "Extract all action items from the text. Return as a markdown checklist using '- [ ] item' format.",
        EnhancementMode::Summarize =>
            "Summarize the text in 2-3 sentences. Return only the summary.",
        EnhancementMode::CodeReview =>
            "Review the code for bugs, style issues, and improvements. Return a bulleted list of findings.",
        EnhancementMode::Simplify =>
            "Simplify the text so a non-expert can understand it. Return only the simplified text.",
        EnhancementMode::Reframe =>
            "Reframe the text from a positive and constructive angle. Return only the reframed text.",
        EnhancementMode::Custom(prompt) => {
            return (prompt.clone(), text.to_string());
        }
    };
    (system.to_string(), text.to_string())
}
