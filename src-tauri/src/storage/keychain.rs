/// OS keychain storage via keyring crate
/// Key format: promptflow-stt/<provider>
pub struct KeychainStore;

impl KeychainStore {
    pub fn new() -> Self { Self }
}

impl Default for KeychainStore {
    fn default() -> Self { Self::new() }
}
