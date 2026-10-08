<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep PRIVATE OS as a single browser-based desktop simulation with transient UI state; no backend is needed because all requested interactions are local.
- Keep desktop utilities in a dedicated browser-safe component module, mounted in the shared window frame, so app controls and window behavior stay consistent.
- Use native CSS cursor assets for the OS shell rather than a JavaScript pointer overlay, preserving performance and text-selection behavior; cross-origin embedded apps retain their own cursors.
