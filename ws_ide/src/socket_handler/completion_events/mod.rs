use rig::completion::Prompt;
use rig::prelude::*;
use rig_gemini_grpc::Client;
use socketioxide::extract::SocketRef;

use crate::{
    events,
    types::{CompletionPayload, CompletionResult},
};

pub async fn handle_code_completion(s: SocketRef, payload: CompletionPayload) {
    let client = match Client::from_env() {
        Ok(c) => c,
        Err(e) => {
            eprintln!("gemini client init error: {e}");
            s.emit(events::outgoing::COMPLETION_ERROR, "Gemini client init failed").ok();
            return;
        }
    };

    let agent = client
        .agent("gemini-2.5-flash")
        .preamble(
            "You are an expert inline code completion engine, similar to GitHub Copilot. \
             The prompt contains real source code with a single <FILL> marker at the cursor position. \
             Output ONLY the exact text to replace <FILL>. \
             Match the surrounding indentation and coding style exactly. \
             Do not repeat any code before or after <FILL>. \
             Never include explanations, markdown fences, or any text outside the completion itself.",
        )
        .build();

    let prompt_text = build_prompt(&payload);

    match agent.prompt(prompt_text).await {
        Ok(text) => {
            let cleaned = clean_completion(&text);
            s.emit(
                events::outgoing::COMPLETION_RESULT,
                &CompletionResult {
                    request_id: payload.request_id,
                    text: cleaned,
                },
            )
            .ok();
        }
        Err(e) => {
            eprintln!("gemini completion error: {e}");
            s.emit(events::outgoing::COMPLETION_ERROR, &e.to_string()).ok();
        }
    }
}

fn build_prompt(p: &CompletionPayload) -> String {
    let prefix = tail(&p.prefix, 3000);
    let suffix = head(&p.suffix, 800);
    format!(
        "Language: {lang}\nFile: {file}\n\n{prefix}<FILL>{suffix}",
        lang = p.language,
        file = p.filename,
    )
}

fn clean_completion(raw: &str) -> String {
    let s = raw.trim_start_matches('\n');
    let s = if let Some(inner) = s.strip_prefix("```") {
        // Strip optional language tag (handles c++, c#, objective-c, etc.)
        let body = inner.trim_start_matches(|c: char| c.is_alphanumeric() || matches!(c, '+' | '#' | '-' | '_'));
        body.strip_prefix('\n')
            .unwrap_or(body)
            .trim_end_matches("```")
            .trim_end()
    } else {
        s.trim_end()
    };
    // Guard against the model echoing the FIM marker back
    s.replace("<FILL>", "")
}

fn tail(s: &str, max_chars: usize) -> &str {
    if s.len() <= max_chars {
        return s;
    }
    let start = s.len() - max_chars;
    s.char_indices()
        .map(|(i, _)| i)
        .find(|&i| i >= start)
        .map(|i| &s[i..])
        .unwrap_or(s)
}

fn head(s: &str, max_chars: usize) -> &str {
    if s.len() <= max_chars {
        return s;
    }
    s.char_indices()
        .map(|(i, _)| i)
        .filter(|&i| i <= max_chars)
        .last()
        .map(|i| &s[..i])
        .unwrap_or(s)
}
