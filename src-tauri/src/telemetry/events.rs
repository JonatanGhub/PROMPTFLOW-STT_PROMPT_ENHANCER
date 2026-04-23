/// Opt-in anonymous telemetry (PostHog self-hostable)
/// No-op when telemetry is disabled (default)
pub fn track(event: &str, enabled: bool) {
    if !enabled {
        return;
    }
    // PostHog integration scheduled for v0.5 sprint — see docs/specs/07_ROADMAP.md
    let _ = event;
}
