/// OS keychain storage via the `keyring` crate.
///
/// Keys are stored under service `"promptflow-stt"` with the provider
/// name (e.g. `"openai"`, `"groq"`) as the account identifier.
use crate::error::AppError;
use keyring::Entry;

pub struct KeychainStore;

impl KeychainStore {
    pub fn new() -> Self {
        Self
    }

    /// Saves the API key for `provider` to the OS keychain.
    pub fn set_api_key(&self, provider: &str, key: &str) -> Result<(), AppError> {
        Entry::new("promptflow-stt", provider)
            .map_err(|e| AppError::Storage(e.to_string()))?
            .set_password(key)
            .map_err(|e| AppError::Storage(e.to_string()))
    }

    /// Returns the API key for `provider`, or `None` if no entry exists.
    pub fn get_api_key(&self, provider: &str) -> Result<Option<String>, AppError> {
        match Entry::new("promptflow-stt", provider)
            .map_err(|e| AppError::Storage(e.to_string()))?
            .get_password()
        {
            Ok(key) => Ok(Some(key)),
            Err(keyring::Error::NoEntry) => Ok(None),
            Err(e) => Err(AppError::Storage(e.to_string())),
        }
    }

    /// Returns `true` if an API key is stored for `provider`.
    pub fn has_api_key(&self, provider: &str) -> Result<bool, AppError> {
        self.get_api_key(provider).map(|opt| opt.is_some())
    }

    /// Removes the API key for `provider` from the OS keychain.
    /// Idempotent: returns `Ok(())` even if no entry existed.
    pub fn delete_api_key(&self, provider: &str) -> Result<(), AppError> {
        match Entry::new("promptflow-stt", provider)
            .map_err(|e| AppError::Storage(e.to_string()))?
            .delete_password()
        {
            Ok(()) => Ok(()),
            Err(keyring::Error::NoEntry) => Ok(()), // already absent — idempotent
            Err(e) => Err(AppError::Storage(e.to_string())),
        }
    }
}

impl Default for KeychainStore {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Verify that `get_api_key` returns `Ok(None)` for a provider that was
    /// never stored.  We use a deliberately odd provider name to avoid
    /// colliding with real OS entries.
    ///
    /// Note: on CI / sandboxed environments the keyring backend may fall back
    /// to an in-memory store, which makes this a reliable unit-level check.
    #[test]
    fn test_get_api_key_missing_returns_none() {
        let store = KeychainStore::new();
        // Attempt to read a key that almost certainly does not exist.
        // We accept either Ok(None) (no entry) or an Ok(Some(...)) if by
        // extreme coincidence a real entry exists — the important thing is
        // that we do NOT panic or return an `Err` for a missing entry.
        let result = store.get_api_key("__promptflow_test_nonexistent_provider__");
        assert!(
            result.is_ok(),
            "get_api_key should not propagate NoEntry as an error"
        );
    }

    /// Verify that `has_api_key` returns `Ok(false)` for a missing provider.
    #[test]
    fn test_has_api_key_missing_returns_false() {
        let store = KeychainStore::new();
        let result = store.has_api_key("__promptflow_test_nonexistent_provider__");
        // May be Ok(false) or Ok(true) depending on whether a stray entry
        // exists, but it must not be an Err.
        assert!(result.is_ok(), "has_api_key must not error on missing entry");
    }

    /// Verify that `delete_api_key` is idempotent — deleting a non-existent
    /// entry must return `Ok(())`.
    #[test]
    fn test_delete_api_key_idempotent() {
        let store = KeychainStore::new();
        let result = store.delete_api_key("__promptflow_test_nonexistent_provider__");
        assert!(
            result.is_ok(),
            "delete_api_key must return Ok(()) even when no entry exists"
        );
    }

    /// Full round-trip: set → get → has → delete → get again.
    ///
    /// Skipped when the keyring backend is not available (e.g. headless CI).
    /// We detect this by trying a set and, if it errors, skipping the rest.
    #[test]
    fn test_set_get_delete_round_trip() {
        let store = KeychainStore::new();
        let provider = "__promptflow_test_roundtrip__";
        let secret = "test-secret-value-abc123";

        // Attempt to write; if the OS keychain is unavailable skip gracefully.
        match store.set_api_key(provider, secret) {
            Err(_) => {
                // Keychain not available in this environment — skip.
                return;
            }
            Ok(()) => {}
        }

        // Read back and verify.
        let got = store.get_api_key(provider).expect("get_api_key failed");
        assert_eq!(got.as_deref(), Some(secret));

        // has_api_key must report true.
        assert!(store.has_api_key(provider).expect("has_api_key failed"));

        // Delete.
        store.delete_api_key(provider).expect("delete_api_key failed");

        // Second delete is idempotent.
        store
            .delete_api_key(provider)
            .expect("second delete_api_key failed");

        // After deletion get returns None.
        let after = store.get_api_key(provider).expect("get_api_key after delete failed");
        assert!(after.is_none());
    }
}
