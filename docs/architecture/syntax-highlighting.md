# Architecture: Syntax Highlighting

This document provides a deep technical dive into how the VRE JupyterLab Extension implements semantic syntax highlighting for the VRE Domain Specific Language (DSL).

## The CodeMirror 6 Paradigm

JupyterLab 4 migrated its underlying text editor infrastructure from CodeMirror 5 to CodeMirror 6. Unlike its predecessor which relied on simple regex-based mode states, CodeMirror 6 relies on a robust `Lezer` parsing system (or a stream parser abstraction) combined with a highly modular extension system.

The VRE extension builds upon the `@codemirror/language` `StreamLanguage` abstraction. This allows us to define a stateful lexer that processes the document character by character, tokenizing them dynamically based on context.

## The `vre-language.ts` Subsystem

The core of the highlighting logic is contained within `src/language/vre-language.ts`.

### 1. The State Object

The parser maintains a state object as it iterates through lines of code.

```typescript
export interface VreState {
  tokenize: (stream: StringStream, state: VreState) => string | null;
  // Tracks nested multiline constructs, such as multi-line comments
  commentLevel?: number; 
}
```

This state is passed between tokens, allowing the parser to "remember" if it is currently inside a block comment or a string literal, even across line breaks.

### 2. Tokenization Logic (`tokenBase`)

The `tokenBase` function is the primary lexer loop. It receives a `StringStream` (the remaining text on the current line) and the current state.

It performs the following sequence of evaluations in order of precedence:

1.  **Whitespace & EOL:** If the stream hits the end of a line, or finds whitespace (`stream.eatSpace()`), it returns `null` (no styling required).
2.  **Comments:** 
    *   Single-line comments are detected using `stream.match('//')`. If found, `stream.skipToEnd()` is called, and it returns the tag `'comment'`.
    *   Multi-line comments (`/* ... */`) push the lexer into a specialized `tokenComment` function via the state object.
3.  **Strings:** It looks for quote characters (`"` or `'`). If matched, it delegates the stream to `tokenString`, which consumes characters until the closing quote is found, returning `'string'`.
4.  **Numbers and Units:** Using regex (`/^[0-9.]+/`), it identifies numeric literals. Following a number, it peeks ahead to see if a recognized VRE measurement unit (e.g., `kg`, `m/s`, `mol`) follows it. If so, it returns `'number'` for the digit and `'unit'` for the suffix.
5.  **Keywords & Identifiers:** If a string of alphabetical characters is found, the lexer checks it against a predefined `Set` of VRE keywords (defined in `src/config/defaults.ts`).
    *   If it matches a registered keyword (e.g., `model`, `parameter`), it returns `'keyword'`.
    *   Otherwise, it classifies it as a standard variable or function and returns `'variableName'`.
6.  **Operators and Punctuation:** Standard mathematical operators (`+`, `-`, `=`, `*`) return the `'operator'` tag, while brackets and parentheses return punctuation markers.

### 3. Syntax Styling via Highlight Style

Once the parser assigns tags to substrings (e.g., assigning `'keyword'` to the string `"model"`), CodeMirror translates those tags into CSS classes.

The extension registers a custom extension that bridges these string tags to `@lezer/highlight` tags:

```typescript
languageData: {
  comment: { line: '//', block: ['/*', '*/'] },
},
```

JupyterLab natively provides a syntax theme (e.g., light mode colors or dark mode colors) that maps standard Lezer tags (`tags.keyword`, `tags.string`, `tags.number`) to actual RGB color hexes. Because the VRE language explicitly emits these standard tags, it perfectly inherits the user's chosen JupyterLab theme automatically.
