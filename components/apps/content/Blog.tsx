"use client";
/* Blog — replaces "My Notes". App: notes (args {slug?}). List of posts + reader in one window. */
import { useEffect, useRef, useState } from "react";
import type { AppProps } from "@/lib/os-types";
import { findPost, formatDate, getPosts, readingMinutes, type BlogPost } from "@/lib/blog";
import { useLang } from "@/lib/i18n";
import { BlockView } from "./RichBlocks";
import { iconSvg, SvgSpan } from "./shared";

function PostCard({ post, onOpen }: { post: BlogPost; onOpen: () => void }) {
  const { lang, t } = useLang();
  return (
    <li>
      <button type="button" className="blog-card" onClick={onOpen}>
        {/* eslint-disable-next-line @next/next/no-img-element -- static local SVG */}
        <img className="blog-card__cover" src={post.cover} alt="" loading="lazy" draggable={false} />
        <span className="blog-card__body">
          <span className="blog-card__meta">
            {formatDate(post.date, lang)} · {readingMinutes(post)} {t("dk okuma", "min read")}
          </span>
          <span className="blog-card__title">{post.title}</span>
          <span className="blog-card__summary">{post.summary}</span>
          <span className="blog-card__tags">
            {post.tags.map((t) => (
              <span key={t} className="blog-tag">#{t}</span>
            ))}
          </span>
        </span>
      </button>
    </li>
  );
}

export default function Blog({ args, setTitle }: AppProps) {
  const { lang, t } = useLang();
  const POSTS = getPosts(lang);
  const initial = findPost(lang, (args as { slug?: string } | undefined)?.slug)?.slug ?? null;
  const [slug, setSlug] = useState<string | null>(initial);
  const [argSlug, setArgSlug] = useState(initial);
  const scrollRef = useRef<HTMLDivElement>(null);
  const setTitleRef = useRef(setTitle);
  useEffect(() => { setTitleRef.current = setTitle; });

  // Reopening the window with a new {slug} arg navigates to it.
  if (initial !== argSlug) {
    setArgSlug(initial);
    if (initial) setSlug(initial);
  }

  const post = findPost(lang, slug ?? undefined);
  const index = post ? POSTS.indexOf(post) : -1;

  useEffect(() => {
    setTitleRef.current(post ? `${post.title} — Blog` : "Blog");
  }, [post]);
  // scroll to the top when navigating (not when only the language changes)
  const postSlug = post?.slug;
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [postSlug]);

  const go = (s: string | null) => setSlug(s);

  return (
    <div className="blog-app" onKeyDown={(e) => {
      if (!post) return;
      if (e.key === "Escape" || (e.key === "Backspace" && !(e.target instanceof HTMLInputElement))) { e.preventDefault(); go(null); }
    }}>
      <div className="blog-app__toolbar">
        <button type="button" onClick={() => go(null)} disabled={!post} title={t("Tüm yazılar (Esc)", "All posts (Esc)")}>
          {t("← Tüm yazılar", "← All posts")}
        </button>
        <button type="button" onClick={() => go(POSTS[index - 1]?.slug ?? null)} disabled={!post || index <= 0} title={t("Daha yeni yazı", "Newer post")}>
          {t("‹ Yeni", "‹ Newer")}
        </button>
        <button type="button" onClick={() => go(POSTS[index + 1]?.slug ?? null)} disabled={!post || index >= POSTS.length - 1} title={t("Daha eski yazı", "Older post")}>
          {t("Eski ›", "Older ›")}
        </button>
        <span className="blog-app__brand">Serdar&apos;s Blog</span>
      </div>
      <div className="file-browser__address">
        <span>{t("Adres", "Address")}</span>
        <div>
          <SvgSpan className="file-browser__address-icon" svg={iconSvg("notes")} />
          <span>{t("Masaüstü", "Desktop") + " / Blog" + (post ? " / " + post.slug + ".html" : "")}</span>
        </div>
      </div>

      <div className="blog-app__content" ref={scrollRef} tabIndex={-1}>
        {post ? (
          <article className="blog-post">
            {/* eslint-disable-next-line @next/next/no-img-element -- static local SVG */}
            <img className="blog-post__cover" src={post.cover} alt={post.coverAlt} draggable={false} />
            <header className="blog-post__header">
              <p className="blog-post__meta">
                {formatDate(post.date, lang)} · {readingMinutes(post)} {t("dk okuma", "min read")}
              </p>
              <h2>{post.title}</h2>
              <p className="blog-post__summary">{post.summary}</p>
              <div className="blog-card__tags">
                {post.tags.map((t) => (
                  <span key={t} className="blog-tag">#{t}</span>
                ))}
              </div>
            </header>
            <div className="blog-post__body">
              {post.blocks.map((b, i) => (
                <BlockView key={i} block={b} />
              ))}
            </div>
            <footer className="blog-post__footer">
              {POSTS[index + 1] && (
                <button type="button" onClick={() => go(POSTS[index + 1].slug)}>
                  <span>{t("Önceki yazı", "Previous post")}</span>
                  {POSTS[index + 1].title}
                </button>
              )}
              {POSTS[index - 1] && (
                <button type="button" className="blog-post__next" onClick={() => go(POSTS[index - 1].slug)}>
                  <span>{t("Sonraki yazı", "Next post")}</span>
                  {POSTS[index - 1].title}
                </button>
              )}
            </footer>
          </article>
        ) : (
          <div className="blog-list">
            <header className="blog-list__hero">
              <p className="blog-list__eyebrow">SERDAROS 96 · BLOG</p>
              <h2>{t("Notlar, denemeler, öğrendiklerim.", "Notes, experiments, things I've learned.")}</h2>
              <p>{t("Veri, yapay zeka, genetik ve demir üzerine yazılar.", "Writing on data, AI, genetics and lifting iron.")}</p>
            </header>
            <ul className="blog-list__items">
              {POSTS.map((p) => (
                <PostCard key={p.slug} post={p} onOpen={() => go(p.slug)} />
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="file-browser__status">
        <span>
          {post
            ? `${index + 1} / ${POSTS.length} ${t("yazı", "posts")}`
            : `${POSTS.length} ${t("yazı", POSTS.length === 1 ? "post" : "posts")}`}
        </span>
        <span>SerdarOS 96</span>
      </div>
    </div>
  );
}
