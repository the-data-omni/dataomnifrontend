import twemoji from "twemoji";

// import MarkdownIt from "markdown-it";
// import Token from "markdown-it/lib/token";
// import markdownitEmoji from "markdown-it-emoji";
import * as emoji from 'markdown-it-emoji';
// import * as MarkdownIt from 'markdown-it';

import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
});

// const md = new MarkdownIt();
// Token type is available on the instance or via the MarkdownIt namespace:
const tokens: ReturnType<typeof md.parse> = md.parse('### Heading', {});
// Now tokens is of type Token[]

// const tokens: MarkdownIt.Token[] = [];

md.use(MarkdownIt);

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
md.renderer.rules.emoji = (token: Token, idx: Number) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return twemoji.parse(token[idx].content, {
    base: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/"
  });
};

export const markdown = (text: string) => {
  return md.renderInline(text);
};
