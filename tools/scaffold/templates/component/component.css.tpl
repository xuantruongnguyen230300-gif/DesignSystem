/* Only --nxt-{{name}}-* component tokens and global semantic tokens (focus, motion) — no literals.
   Variants/sizes/states are data-attributes set by the host bindings. */
@layer nxt.components {
  .nxt-{{name}} {
    display: inline-flex;
    align-items: center;
    gap: var(--nxt-{{name}}-gap);
    min-block-size: var(--nxt-{{name}}-height);
    padding-inline: var(--nxt-{{name}}-padding-inline);
    border-radius: var(--nxt-{{name}}-radius);
    color: var(--nxt-{{name}}-text);
    background: var(--nxt-{{name}}-bg);
    font: var(--nxt-{{name}}-font);
    transition: background-color var(--nxt-motion-duration-fast) var(--nxt-motion-ease-standard);
  }

  .nxt-{{name}}:hover {
    background: var(--nxt-{{name}}-bg-hover);
  }

  .nxt-{{name}}:focus-visible {
    outline: var(--nxt-focus-ring-width) solid var(--nxt-focus-ring-color);
    outline-offset: var(--nxt-focus-ring-offset);
  }

  .nxt-{{name}}[aria-disabled='true'] {
    color: var(--nxt-{{name}}-text-disabled);
    background: var(--nxt-{{name}}-bg-disabled);
    cursor: not-allowed;
  }

  .nxt-{{name}}[data-size='sm'] {
    min-block-size: var(--nxt-{{name}}-height-sm);
  }

  .nxt-{{name}}[data-size='lg'] {
    min-block-size: var(--nxt-{{name}}-height-lg);
  }
}
