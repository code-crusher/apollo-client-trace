---
"@apollo/client": patch
---

Fix an intermittent case where `refetchQueries` on a mutation never delivered its result to a `useSuspenseQuery` consumer. When a refetch overlapped an older query request that had not delivered a link result yet, it could deduplicate onto that stale request and resolve without fetching the post-mutation state. A refetch now restarts the shared pending request so every consumer receives the fresh result, and a synchronous result is no longer dropped after it resolves a pending query reference.
