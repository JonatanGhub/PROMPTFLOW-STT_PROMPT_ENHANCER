/// Opt-in anonymous telemetry (PostHog self-hostable)
/// No-op when telemetry is disabled (default)
pub fn track(event: &str, enabled: bool) {
    if !enabled {
        return;
    }
    // TODO: implement PostHog integration in v0.5 sprint
    let _ = event;
}
